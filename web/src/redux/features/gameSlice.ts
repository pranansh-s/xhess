import UserService from '@/services/user.service';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Profile } from '@xhess/shared/schemas';
import { Color, Game, GameState, GameType, PlayerState } from '@xhess/shared/types';

const initialState = {
  isTurn: true,
  isPlaying: false,
  state: 'isWaiting' as GameState,
  endReason: undefined as 'checkmate' | 'resignation' | 'timeout' | 'stalemate' | 'drawAgreement' | undefined,
  drawOfferBy: undefined as string | undefined,
  playerSide: 'white' as Color,
  gameType: '30m' as GameType,
  players: {
    whiteSidePlayer: null as PlayerState | null,
    blackSidePlayer: null as PlayerState | null,
  },
  opponentProfile: null as Profile | null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initGameState: (_, action: PayloadAction<Game>) => {
      const { playerTurn, state, whiteSidePlayer, blackSidePlayer, gameType, endReason, drawOfferBy } = action.payload;
      const userId = UserService.getUserId();
      if (!userId) return;

      let playerSide: Color;
      if (whiteSidePlayer?.userId === userId) {
        playerSide = 'white';
      } else if (blackSidePlayer?.userId === userId) {
        playerSide = 'black';
      } else return;

      return {
        isTurn: playerSide == playerTurn,
        playerSide,
        gameType,
        isPlaying: state == 'isPlaying',
        state,
        endReason,
        drawOfferBy,
        players: {
          whiteSidePlayer,
          blackSidePlayer,
        },
        opponentProfile: null,
      };
    },

    updateGameState: (state, action: PayloadAction<Game>) => {
      const { state: newState, whiteSidePlayer, blackSidePlayer, endReason, drawOfferBy } = action.payload;
      state.state = newState;
      state.endReason = endReason;
      state.drawOfferBy = drawOfferBy;
      state.isPlaying = newState === 'isPlaying';
      if (whiteSidePlayer) {
        state.players.whiteSidePlayer = whiteSidePlayer;
      }
      if (blackSidePlayer) {
        state.players.blackSidePlayer = blackSidePlayer;
      }
    },

    whitePlayerUpdate: (state, action: PayloadAction<PlayerState>) => {
      state.players.whiteSidePlayer = action.payload;
    },

    blackPlayerUpdate: (state, action: PayloadAction<PlayerState>) => {
      state.players.blackSidePlayer = action.payload;
    },

    setOpponentProfile: (state, action: PayloadAction<Profile | null>) => {
      state.opponentProfile = action.payload;
    },

    endTurn: state => {
      state.isTurn = !state.isTurn;
    },
  },
});

export const {
  initGameState,
  updateGameState,
  whitePlayerUpdate,
  setOpponentProfile,
  blackPlayerUpdate,
  endTurn,
} = gameSlice.actions;

export default gameSlice.reducer;
