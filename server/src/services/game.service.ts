import { randomUUID } from 'node:crypto';

import { Game, GameConfig, Move, PlayerState } from '@xhess/shared/types';
import { opponentSide } from '@xhess/shared/utils';

import dbController from '../controllers/db.controller.js';

import { ServiceError } from '../utils/error.js';
import { GAME_TIME_MS, updateTimeLeft } from '../utils/game.js';

import ChessService from './chess.service.js';
import RoomService from './room.service.js';

const GAME_PREFIX = 'games';
const roomToGameId = new Map<string, string>();
const chessCache = new Map<string, ChessService>();

const GameService = {
  getGameId: async (roomId: string): Promise<string> => {
    let gameId = roomToGameId.get(roomId);
    if (!gameId) {
      const room = await RoomService.getRoom(roomId);
      if (room && room.gameId) {
        gameId = room.gameId;
        roomToGameId.set(roomId, gameId);
      }
    }
    if (!gameId) {
      throw new ServiceError('No game in room');
    }
    return gameId;
  },

  getGame: async (id: string): Promise<Game> => {
    const game = await dbController.loadData<Game>(GAME_PREFIX, id);
    if (!game) {
      throw new ServiceError('Game not found');
    }
    return game;
  },

  saveGame: (game: Game, id: string) => {
    return dbController.saveData<Game>(GAME_PREFIX, game, id);
  },

  addMove: async (roomId: string, move: Move): Promise<Game> => {
    const gameId = await GameService.getGameId(roomId);
    const game = await GameService.getGame(gameId);

    const lastMove = game.moves[game.moves.length - 1];
    const isDuplicate = lastMove &&
      lastMove.from.x === move.from.x &&
      lastMove.from.y === move.from.y &&
      lastMove.to.x === move.to.x &&
      lastMove.to.y === move.to.y;

    if (isDuplicate) {
      return game;
    }

    const isPlaying = game.state === 'isPlaying';
    if (!isPlaying) {
      throw new ServiceError('Game is not in playing state');
    }

    const now = Date.now();
    const timeElapsed = now - game.lastPlayedAt;
    const currentPlayerState = game.playerTurn === 'white' ? game.whiteSidePlayer : game.blackSidePlayer;
    if (currentPlayerState) {
      const remainingBeforeMove = currentPlayerState.remainingTime - timeElapsed;
      if (remainingBeforeMove <= 0) {
        currentPlayerState.remainingTime = 0;
        game.state = game.playerTurn === 'white' ? 'blackWin' : 'whiteWin';
        game.endReason = 'timeout';
        game.lastPlayedAt = now;
        await GameService.saveGame(game, gameId);
        return game;
      }
    }

    const chess = chessCache.get(gameId) || new ChessService(game);
    chessCache.set(gameId, chess);

    chess.makeMove(move);
    chess.validateEndGame(game);

    updateTimeLeft(game, true);

    game.moves.push(move);
    game.playerTurn = opponentSide(game.playerTurn);

    await GameService.saveGame(game, gameId);
    return game;
  },

  updateRemainingTime: async (roomId: string) => {
    const gameId = await GameService.getGameId(roomId);
    const game = await GameService.getGame(gameId);

    updateTimeLeft(game, false);
    await GameService.saveGame(game, gameId);
  },

  joinGame: async (roomId: string, userId: string): Promise<Game> => {
    const gameId = await GameService.getGameId(roomId);
    const game = await GameService.getGame(gameId);

    if (game.whiteSidePlayer?.userId === userId || game.blackSidePlayer?.userId === userId) {
      return game;
    }

    const newPlayer: PlayerState = {
      userId,
      remainingTime: GAME_TIME_MS[game.gameType].baseTime,
    };

    if (!game.whiteSidePlayer) {
      game.whiteSidePlayer = newPlayer;
    } else if (!game.blackSidePlayer) {
      game.blackSidePlayer = newPlayer;
    }

    if (game.whiteSidePlayer && game.blackSidePlayer) {
      game.state = 'isPlaying';
    }

    game.lastPlayedAt = Date.now();

    await GameService.saveGame(game, gameId);
    return game;
  },

  createGame: async (config: GameConfig, roomId: string, userId: string): Promise<Game> => {
    const { playerSide, gameType } = config;

    const playerState: PlayerState = {
      userId,
      remainingTime: GAME_TIME_MS[gameType].baseTime,
    };

    const opponentUserId = (await RoomService.getRoom(roomId)).participants.find(id => id !== userId);

    const opponentPlayerState: PlayerState | null = opponentUserId
      ? {
          userId: opponentUserId,
          remainingTime: GAME_TIME_MS[gameType].baseTime,
        }
      : null;

    const newGame: Game = {
      moves: [],
      playerTurn: 'white',
      state: opponentPlayerState ? 'isPlaying' : 'isWaiting',

      whiteSidePlayer: playerSide == 'white' ? playerState : opponentPlayerState,
      blackSidePlayer: playerSide == 'black' ? playerState : opponentPlayerState,
      gameType,
      createdAt: Date.now(),

      lastPlayedAt: Date.now(),
    };

    const uuid = randomUUID();
    roomToGameId.set(roomId, uuid);

    await GameService.saveGame(newGame, uuid);

    const room = await RoomService.getRoom(roomId);
    room.gameId = uuid;
    await RoomService.saveRoom(roomId, room);

    return newGame;
  },

  surrenderGame: async (roomId: string, userId: string): Promise<Game> => {
    const gameId = await GameService.getGameId(roomId);
    const game = await GameService.getGame(gameId);

    if (game.state !== 'isPlaying') {
      throw new ServiceError('Game is not active');
    }

    if (game.whiteSidePlayer?.userId === userId) {
      game.state = 'blackWin';
      game.endReason = 'resignation';
    } else if (game.blackSidePlayer?.userId === userId) {
      game.state = 'whiteWin';
      game.endReason = 'resignation';
    } else {
      throw new ServiceError('User is not a player in this game');
    }

    game.lastPlayedAt = Date.now();
    await GameService.saveGame(game, gameId);
    return game;
  },

  offerDrawGame: async (roomId: string, userId: string): Promise<Game> => {
    const gameId = await GameService.getGameId(roomId);
    const game = await GameService.getGame(gameId);

    if (game.state !== 'isPlaying') {
      throw new ServiceError('Game is not active');
    }

    if (game.whiteSidePlayer?.userId !== userId && game.blackSidePlayer?.userId !== userId) {
      throw new ServiceError('User is not a player in this game');
    }

    game.drawOfferBy = userId;
    await GameService.saveGame(game, gameId);
    return game;
  },

  acceptDrawGame: async (roomId: string, userId: string): Promise<Game> => {
    const gameId = await GameService.getGameId(roomId);
    const game = await GameService.getGame(gameId);

    if (game.state !== 'isPlaying') {
      throw new ServiceError('Game is not active');
    }

    if (!game.drawOfferBy) {
      throw new ServiceError('No active draw offer exists');
    }

    if (game.drawOfferBy === userId) {
      throw new ServiceError('Cannot accept your own draw offer');
    }

    if (game.whiteSidePlayer?.userId !== userId && game.blackSidePlayer?.userId !== userId) {
      throw new ServiceError('User is not a player in this game');
    }

    game.state = 'draw';
    game.endReason = 'drawAgreement';
    delete game.drawOfferBy;

    game.lastPlayedAt = Date.now();
    await GameService.saveGame(game, gameId);
    return game;
  },

  rejectDrawGame: async (roomId: string, userId: string): Promise<Game> => {
    const gameId = await GameService.getGameId(roomId);
    const game = await GameService.getGame(gameId);

    if (game.state !== 'isPlaying') {
      throw new ServiceError('Game is not active');
    }

    if (!game.drawOfferBy) {
      throw new ServiceError('No active draw offer exists');
    }

    if (game.whiteSidePlayer?.userId !== userId && game.blackSidePlayer?.userId !== userId) {
      throw new ServiceError('User is not a player in this game');
    }

    delete game.drawOfferBy;
    await GameService.saveGame(game, gameId);
    return game;
  },
};

export default GameService;
