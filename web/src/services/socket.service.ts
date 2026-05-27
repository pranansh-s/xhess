import { io } from 'socket.io-client';

import { Profile } from '@xhess/shared/schemas';
import { ChatMessage, Game, GameConfig, Move } from '@xhess/shared/types';

import { showErrorToast } from '@/components/common/ErrorToast';
import { auth } from '@/lib/firebase';

import { initMoves, movePiece } from '@/redux/features/boardSlice';
import { addMessage } from '@/redux/features/chatSlice';
import {
  blackPlayerUpdate,
  endTurn,
  initGameState,
  updateGameState,
  setOpponentProfile,
  whitePlayerUpdate,
} from '@/redux/features/gameSlice';
import { closeModal } from '@/redux/features/modalSlice';
import { AppDispatch } from '@/redux/store';

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);

const SocketService = {
  initSocket: (roomId: string, userId: string, dispatch: AppDispatch) => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.off('error');
    socket.off('receiveChatMessage');
    socket.off('gameJoined');
    socket.off('moveUpdate');

    socket.on('error', (message: string) => {
      showErrorToast('Failed to process task', message);
    });

    socket.on('receiveChatMessage', (newChatMessage: ChatMessage) => {
      dispatch(addMessage(newChatMessage));
    });

    socket.on('gameJoined', (joinedGame: Game, opponentProfile: Profile | null) => {
      SocketService.initGame(dispatch, joinedGame, opponentProfile);
    });

    socket.on('moveUpdate', (game: Game) => {
      const move = game.moves.at(-1);
      if (!move) {
        throw new Error('No move to update');
      }

      dispatch(updateGameState(game));
      SocketService.updatePlayerState(dispatch, game);
      dispatch(movePiece(move));
      dispatch(endTurn());
    });

    auth.currentUser?.getIdToken()
      .then((token) => {
        socket.emit('joinRoom', roomId, userId, token);
      })
      .catch(() => {
        showErrorToast('Failed to process task', 'Authentication failed');
      });
  },

  initGame: (dispatch: AppDispatch, game: Game, profile: Profile | null) => {
    SocketService.updatePlayerState(dispatch, game);
    dispatch(initMoves(game.moves));
    dispatch(initGameState(game));
    dispatch(setOpponentProfile(profile));
    dispatch(closeModal());
  },

  updatePlayerState: (dispatch: AppDispatch, game: Game) => {
    if (game.whiteSidePlayer) {
      dispatch(whitePlayerUpdate(game.whiteSidePlayer));
    }
    if (game.blackSidePlayer) {
      dispatch(blackPlayerUpdate(game.blackSidePlayer));
    }
  },

  surrender: () => {
    socket.emit('surrender');
  },

  sendMessage: (message: string) => {
    socket.emit('sendChatMessage', message);
  },

  newGame: (config: GameConfig) => {
    socket.emit('newGame', config);
  },

  makeMove: (move: Move) => {
    socket.emit('newMove', move);
  },

  leaveRoom: () => {
    socket.disconnect();
  },
};

export default SocketService;
