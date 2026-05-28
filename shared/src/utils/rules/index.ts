import { PieceType } from '../../types/chess.js';
import { PieceMovementStrategy } from './common.js';
import { PawnStrategy } from './pawn.js';
import { RookStrategy } from './rook.js';
import { KnightStrategy } from './knight.js';
import { BishopStrategy } from './bishop.js';
import { QueenStrategy } from './queen.js';
import { KingStrategy } from './king.js';

export const movementStrategies: Record<PieceType, PieceMovementStrategy> = {
  pawn: PawnStrategy,
  rook: RookStrategy,
  knight: KnightStrategy,
  bishop: BishopStrategy,
  queen: QueenStrategy,
  king: KingStrategy,
};
