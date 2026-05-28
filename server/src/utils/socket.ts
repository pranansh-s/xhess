import admin from 'firebase-admin';
import { Socket } from 'socket.io';
import { ZodError } from 'zod';

import { GameConfigSchema, MessageSchema, MoveSchema, RoomKeySchema } from '@xhess/shared/schemas';
import { GameConfig, Move, SocketEvent } from '@xhess/shared/types';

import GameService from '../services/game.service.js';
import ProfileService from '../services/profile.service.js';
import RoomService from '../services/room.service.js';

import { DatabaseError, ServiceError } from './error.js';

export const handleErrors = (handler: (...args: any[]) => Promise<void>, socket: Socket, title: string) => {
  return async (...args: any[]) => {
    try {
      await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        console.error('[SOCKET_ERROR]', title, err.issues.map(issue => issue.message).join(', '));
        socket.emit(SocketEvent.ERROR, `${err.issues[0].path}: ${err.issues[0].message}`);
      } else if (err instanceof ServiceError) {
        console.error('[SOCKET_ERROR]', title, err.message);
        socket.emit(SocketEvent.ERROR, err.message);
      } else if (err instanceof DatabaseError) {
        console.error('[SOCKET_ERROR_DATABASE]', title, err.message);
        socket.emit(SocketEvent.ERROR, 'Internal Server Error');
      } else {
        console.error('[SOCKET_ERROR_UNEXPECTED]', title, err instanceof Error ? err.stack : err);
        socket.emit(SocketEvent.ERROR, 'Internal Server Error');
      }
    }
  };
};

export const socketHandlers = (socket: Socket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  const assertActiveConnection = async () => {
    if (!currentRoomId || !currentUserId) {
      throw new ServiceError('Unauthorized: Active room session required');
    }
    const room = await RoomService.getRoom(currentRoomId);
    if (!room.participants.includes(currentUserId)) {
      throw new ServiceError('Unauthorized: User is not an active participant in this room');
    }
  };

  return {
    joinRoom: async (roomId: string, userId: string, token?: string) => {
      const parsedRoomId = RoomKeySchema.parse(roomId);
      
      if (!token) {
        throw new ServiceError('Unauthorized: Identity verification required');
      }

      try {
        const decoded = await admin.auth().verifyIdToken(token);
        if (decoded.uid !== userId) {
          throw new ServiceError('Unauthorized: Client-Server identity mismatch');
        }
      } catch (err) {
        throw new ServiceError('Unauthorized: Invalid or expired access credentials');
      }

      if (currentRoomId && currentRoomId !== parsedRoomId) {
        await RoomService.leaveRoom(currentRoomId, userId);
        socket.leave(currentRoomId);
      }

      await RoomService.joinRoom(parsedRoomId, userId).catch(() => null);

      socket.join(parsedRoomId);
      currentRoomId = parsedRoomId;
      currentUserId = userId;

      const game = await GameService.joinGame(roomId, userId).catch(err =>
        err instanceof ServiceError ? null : Promise.reject(err)
      );

      if (game) {
        const { myProfile, opponentProfile } = await ProfileService.getPlayerProfiles(currentRoomId, currentUserId);

        socket.emit(SocketEvent.GAME_JOINED, game, opponentProfile);
        socket.to(currentRoomId).emit(SocketEvent.GAME_JOINED, game, myProfile);
      }
    },

    sendChatMessage: async (content: string) => {
      const parsedContent = MessageSchema.parse(content);
      await assertActiveConnection();
      if (!currentRoomId || !currentUserId) return;

      const message = await RoomService.sendMessage(currentRoomId, currentUserId, parsedContent);

      socket.emit(SocketEvent.RECEIVE_CHAT_MESSAGE, message);
      socket.to(currentRoomId).emit(SocketEvent.RECEIVE_CHAT_MESSAGE, message);
    },

    newGame: async (config: GameConfig) => {
      const parsedConfig = GameConfigSchema.parse(config);
      await assertActiveConnection();
      if (!currentRoomId || !currentUserId) return;

      const newGame = await GameService.createGame(parsedConfig, currentRoomId, currentUserId);
      const { myProfile, opponentProfile } = await ProfileService.getPlayerProfiles(currentRoomId, currentUserId);

      socket.emit(SocketEvent.GAME_JOINED, newGame, opponentProfile);
      socket.to(currentRoomId).emit(SocketEvent.GAME_JOINED, newGame, myProfile);
    },

    newMove: async (move: Move) => {
      const parsedMove = MoveSchema.parse(move);
      await assertActiveConnection();
      if (!currentRoomId || !currentUserId) return;

      const game = await GameService.addMove(currentRoomId, parsedMove);

      socket.emit(SocketEvent.MOVE_UPDATE, game);
      socket.to(currentRoomId).emit(SocketEvent.MOVE_UPDATE, game);
    },

    surrender: async () => {
      await assertActiveConnection();
      if (!currentRoomId || !currentUserId) return;

      const game = await GameService.surrenderGame(currentRoomId, currentUserId);

      socket.emit(SocketEvent.MOVE_UPDATE, game);
      socket.to(currentRoomId).emit(SocketEvent.MOVE_UPDATE, game);
    },

    offerDraw: async () => {
      await assertActiveConnection();
      if (!currentRoomId || !currentUserId) return;

      const game = await GameService.offerDrawGame(currentRoomId, currentUserId);

      socket.emit(SocketEvent.MOVE_UPDATE, game);
      socket.to(currentRoomId).emit(SocketEvent.MOVE_UPDATE, game);
    },

    acceptDraw: async () => {
      await assertActiveConnection();
      if (!currentRoomId || !currentUserId) return;

      const game = await GameService.acceptDrawGame(currentRoomId, currentUserId);

      socket.emit(SocketEvent.MOVE_UPDATE, game);
      socket.to(currentRoomId).emit(SocketEvent.MOVE_UPDATE, game);
    },

    rejectDraw: async () => {
      await assertActiveConnection();
      if (!currentRoomId || !currentUserId) return;

      const game = await GameService.rejectDrawGame(currentRoomId, currentUserId);

      socket.emit(SocketEvent.MOVE_UPDATE, game);
      socket.to(currentRoomId).emit(SocketEvent.MOVE_UPDATE, game);
      socket.to(currentRoomId).emit(SocketEvent.DRAW_OFFER_REJECTED);
    },

    disconnect: async () => {
      if (!currentRoomId || !currentUserId) return;

      await RoomService.leaveRoom(currentRoomId, currentUserId);
      await GameService.updateRemainingTime(currentRoomId);

      socket.leave(currentRoomId);

      currentRoomId = null;
      currentUserId = null;
    },
  };
};
