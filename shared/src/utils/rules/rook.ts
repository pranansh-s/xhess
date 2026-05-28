import { CARDINAL_DIRECTIONS } from '../../constants/index.js';
import { Board, Color, Move, Piece, Position } from '../../types/chess.js';
import { getMovesAlongDirection, PieceMovementStrategy } from './common.js';

export const RookStrategy: PieceMovementStrategy = {
  getValidMoves(board: Board, piece: Piece, player: Color, moves: Move[]): Position[] {
    return getMovesAlongDirection(board, piece.pos, player, CARDINAL_DIRECTIONS, 7);
  },
};
