import { Board, Color, Move, Piece, Position } from '../types/chess.js';
import { willMoveCheck } from './rules/check.js';
import { movementStrategies } from './rules/index.js';

export { getKingPosition, isKingInCheck, isPositionUnderAttack, willMoveCheck } from './rules/check.js';

export const getValidMovesForPiece = (board: Board, piece: Piece, player: Color, moves: Move[] = []): Position[] => {
  const strategy = movementStrategies[piece.type];
  if (!strategy) return [];

  const validMoves = strategy.getValidMoves(board, piece, player, moves);

  return validMoves.filter(to => !willMoveCheck(board, { from: piece.pos, to }, player));
};
