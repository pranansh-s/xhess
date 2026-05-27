import { Socket } from 'socket.io';
import admin from 'firebase-admin';
import { ZodError } from 'zod';

import { GameConfig, Move } from '@xhess/shared/types';

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
        socket.emit('error', `${err.issues[0].path}: ${err.issues[0].message}`);
      } else if (err instanceof ServiceError) {
        console.error('[SOCKET_ERROR]', title, err.message);
        socket.emit('error', err.message);
      } else if (err instanceof DatabaseError) {
        console.error('[SOCKET_ERROR]', title, err.message);
        socket.emit('error', 'Internal Server Error');
      } else {
        console.error('[SOCKET_ERROR]', title, err);
        socket.emit('error', 'Internal Server Error');
      }
    }
  };
};

export const socketHandlers = (socket: Socket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  return {
    joinRoom: async (roomId: string, userId: string, token?: string) => {
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

      if (currentRoomId && currentRoomId !== roomId) {
        await RoomService.leaveRoom(currentRoomId, userId);
        socket.leave(currentRoomId);
      }

      socket.join(roomId);
      currentRoomId = roomId;
      currentUserId = userId;

      const game = await GameService.joinGame(roomId, userId).catch(err =>
        err instanceof ServiceError ? null : Promise.reject(err)
      );

      if (game) {
        const { myProfile, opponentProfile } = await ProfileService.getPlayerProfiles(currentRoomId, currentUserId);

        socket.emit('gameJoined', game, opponentProfile);
        socket.to(currentRoomId).emit('gameJoined', game, myProfile);
      }
    },

    sendChatMessage: async (content: string) => {
      if (!currentRoomId || !currentUserId) return;

      const message = await RoomService.sendMessage(currentRoomId, currentUserId, content);

      socket.emit('receiveChatMessage', message);
      socket.to(currentRoomId).emit('receiveChatMessage', message);
    },

    newGame: async (config: GameConfig) => {
      if (!currentRoomId || !currentUserId) return;

      const newGame = await GameService.createGame(config, currentRoomId, currentUserId);
      const { myProfile, opponentProfile } = await ProfileService.getPlayerProfiles(currentRoomId, currentUserId);

      socket.emit('gameJoined', newGame, opponentProfile);
      socket.to(currentRoomId).emit('gameJoined', newGame, myProfile);
    },

    newMove: async (move: Move) => {
      if (!currentRoomId || !currentUserId) return;

      const game = await GameService.addMove(currentRoomId, move);

      socket.emit('moveUpdate', game);
      socket.to(currentRoomId).emit('moveUpdate', game);
    },

    // surrender: async () => {
    //   if (!currentRoomId || !currentUserId) return;

    //   await GameService.
    // },

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
