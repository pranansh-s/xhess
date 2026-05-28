import { DIAGONAL_DIRECTIONS } from '../../constants/index.js';
import { Board, Color, Move, Piece, Position } from '../../types/chess.js';
import { getMovesAlongDirection, PieceMovementStrategy } from './common.js';

export const BishopStrategy: PieceMovementStrategy = {
  getValidMoves(board: Board, piece: Piece, player: Color, moves: Move[]): Position[] {
    return getMovesAlongDirection(board, piece.pos, player, DIAGONAL_DIRECTIONS, 7);
  },
};
