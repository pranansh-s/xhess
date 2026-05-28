import UserService from '@/services/user.service';
import { io } from 'socket.io-client';

import { Profile } from '@xhess/shared/schemas';
import { ChatMessage, Game, GameConfig, Move, SocketEvent } from '@xhess/shared/types';

import { showErrorToast } from '@/components/common/ErrorToast';

import { auth } from '@/lib/firebase';
import { initMoves, movePiece } from '@/redux/features/boardSlice';
import { addMessage } from '@/redux/features/chatSlice';
import {
  blackPlayerUpdate,
  endTurn,
  initGameState,
  setOpponentProfile,
  updateGameState,
  whitePlayerUpdate,
} from '@/redux/features/gameSlice';
import { closeModal, openModal } from '@/redux/features/modalSlice';
import { AppDispatch, store } from '@/redux/store';

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);

const SocketService = {
  initSocket: (roomId: string, userId: string, dispatch: AppDispatch) => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.off(SocketEvent.ERROR);
    socket.off(SocketEvent.RECEIVE_CHAT_MESSAGE);
    socket.off(SocketEvent.GAME_JOINED);
    socket.off(SocketEvent.MOVE_UPDATE);
    socket.off(SocketEvent.DRAW_OFFER_REJECTED);

    socket.on(SocketEvent.ERROR, (message: string) => {
      showErrorToast('Failed to process task', message);
    });

    socket.on(SocketEvent.RECEIVE_CHAT_MESSAGE, (newChatMessage: ChatMessage) => {
      dispatch(addMessage(newChatMessage));
    });

    socket.on(SocketEvent.GAME_JOINED, (joinedGame: Game, opponentProfile: Profile | null) => {
      SocketService.initGame(dispatch, joinedGame, opponentProfile);
    });

    socket.on(SocketEvent.MOVE_UPDATE, (game: Game) => {
      dispatch(updateGameState(game));
      SocketService.updatePlayerState(dispatch, game);

      const localMoves = store.getState().board.moves;
      if (game.moves.length > localMoves.length) {
        const lastMove = game.moves.at(-1);
        if (lastMove) {
          dispatch(movePiece(lastMove));
          dispatch(endTurn());
        }
      }

      if (game.state !== 'isPlaying' && game.state !== 'isWaiting') {
        dispatch(openModal('gameOver'));
      } else {
        const localUserId = UserService.getUserId();
        if (game.drawOfferBy && game.drawOfferBy !== localUserId) {
          dispatch(openModal('drawOffer'));
        } else if (!game.drawOfferBy && store.getState().modals === 'drawOffer') {
          dispatch(closeModal());
        }
      }
    });

    socket.on(SocketEvent.DRAW_OFFER_REJECTED, () => {
      showErrorToast('Draw Offer Declined', 'Your opponent has declined the draw offer.');
    });

    auth.currentUser
      ?.getIdToken()
      .then(token => {
        socket.emit(SocketEvent.JOIN_ROOM, roomId, userId, token);
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

    if (game.state !== 'isPlaying' && game.state !== 'isWaiting') {
      dispatch(openModal('gameOver'));
    } else {
      const localUserId = UserService.getUserId();
      if (game.drawOfferBy && game.drawOfferBy !== localUserId) {
        dispatch(openModal('drawOffer'));
      } else {
        dispatch(closeModal());
      }
    }
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
    socket.emit(SocketEvent.SURRENDER);
  },

  offerDraw: () => {
    socket.emit(SocketEvent.OFFER_DRAW);
  },

  acceptDraw: () => {
    socket.emit(SocketEvent.ACCEPT_DRAW);
  },

  rejectDraw: () => {
    socket.emit(SocketEvent.REJECT_DRAW);
  },

  sendMessage: (message: string) => {
    socket.emit(SocketEvent.SEND_CHAT_MESSAGE, message);
  },

  newGame: (config: GameConfig) => {
    socket.emit(SocketEvent.NEW_GAME, config);
  },

  makeMove: (move: Move) => {
    socket.emit(SocketEvent.NEW_MOVE, move);
  },

  leaveRoom: () => {
    socket.disconnect();
  },
};

export default SocketService;
