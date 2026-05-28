import { CARDINAL_DIRECTIONS, DIAGONAL_DIRECTIONS } from '../../constants/index.js';
import { Board, Color, Move, Piece, Position } from '../../types/chess.js';
import { isKingInCheck, isPositionUnderAttack } from './check.js';
import { getMovesAlongDirection, PieceMovementStrategy } from './common.js';

export const KingStrategy: PieceMovementStrategy = {
  getValidMoves(board: Board, piece: Piece, player: Color, moves: Move[]): Position[] {
    const validMoves = getMovesAlongDirection(
      board,
      piece.pos,
      player,
      [...CARDINAL_DIRECTIONS, ...DIAGONAL_DIRECTIONS],
      1
    );

    const { x, y } = piece.pos;
    const kingStartRow = player === 'white' ? 7 : 0;
    
    if (y === kingStartRow && x === 4) {
      const hasKingMoved = moves.some(m => m.from.x === 4 && m.from.y === kingStartRow);
      
      if (!hasKingMoved && !isKingInCheck(board, player)) {

        const kingRook = board[kingStartRow][7];
        if (kingRook && kingRook.type === 'rook' && kingRook.color === player) {
          const hasKingRookMoved = moves.some(m => m.from.x === 7 && m.from.y === kingStartRow);
          if (
            !hasKingRookMoved &&
            !board[kingStartRow][5] &&
            !board[kingStartRow][6] &&
            !isPositionUnderAttack(board, { x: 5, y: kingStartRow }, player) &&
            !isPositionUnderAttack(board, { x: 6, y: kingStartRow }, player)
          ) {
            validMoves.push({ x: 6, y: kingStartRow });
          }
        }


        const queenRook = board[kingStartRow][0];
        if (queenRook && queenRook.type === 'rook' && queenRook.color === player) {
          const hasQueenRookMoved = moves.some(m => m.from.x === 0 && m.from.y === kingStartRow);
          if (
            !hasQueenRookMoved &&
            !board[kingStartRow][1] &&
            !board[kingStartRow][2] &&
            !board[kingStartRow][3] &&
            !isPositionUnderAttack(board, { x: 2, y: kingStartRow }, player) &&
            !isPositionUnderAttack(board, { x: 3, y: kingStartRow }, player)
          ) {
            validMoves.push({ x: 2, y: kingStartRow });
          }
        }
      }
    }

    return validMoves;
  },
};
