import { PieceType } from '../../types/chess.js';
import { BishopStrategy } from './bishop.js';
import { PieceMovementStrategy } from './common.js';
import { KingStrategy } from './king.js';
import { KnightStrategy } from './knight.js';
import { PawnStrategy } from './pawn.js';
import { QueenStrategy } from './queen.js';
import { RookStrategy } from './rook.js';

export const movementStrategies: Record<PieceType, PieceMovementStrategy> = {
  pawn: PawnStrategy,
  rook: RookStrategy,
  knight: KnightStrategy,
  bishop: BishopStrategy,
  queen: QueenStrategy,
  king: KingStrategy,
};
