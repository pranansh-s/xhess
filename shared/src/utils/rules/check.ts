import { CARDINAL_DIRECTIONS, DIAGONAL_DIRECTIONS, KNIGHT_DIRECTIONS } from '../../constants/index.js';
import { Board, Color, Move, Position } from '../../types/chess.js';
import { boardAfterMove } from '../board.js';

export const getKingPosition = (board: Board, kingColor: Color): Position | null => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.type === 'king' && piece.color === kingColor) {
        return { x, y } as Position;
      }
    }
  }
  return null;
};

export const isPositionUnderAttack = (board: Board, pos: Position, kingColor: Color): boolean => {
  for (const { dx, dy } of DIAGONAL_DIRECTIONS) {
    for (let i = 1; i <= 7; i++) {
      const newX = pos.x + dx * i;
      const newY = pos.y + dy * i;

      if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

      if (board[newY][newX]) {
        if (board[newY][newX]!.color !== kingColor) {
          const pieceType = board[newY][newX]!.type;
          if (
            pieceType === 'bishop' ||
            pieceType === 'queen' ||
            (pieceType === 'king' && i === 1) ||
            (pieceType === 'pawn' && i === 1 && dy === (kingColor === 'white' ? -1 : 1))
          )
            return true;
        }
        break;
      }
    }
  }

  for (const { dx, dy } of CARDINAL_DIRECTIONS) {
    for (let i = 1; i <= 7; i++) {
      const newX = pos.x + dx * i;
      const newY = pos.y + dy * i;

      if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

      if (board[newY][newX]) {
        if (board[newY][newX]!.color !== kingColor) {
          const pieceType = board[newY][newX]!.type;
          if (pieceType === 'rook' || pieceType === 'queen' || (pieceType === 'king' && i === 1)) return true;
        }
        break;
      }
    }
  }

  for (const { dx, dy } of KNIGHT_DIRECTIONS) {
    const newX = pos.x + dx;
    const newY = pos.y + dy;

    if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) continue;

    if (board[newY][newX] && board[newY][newX]!.color !== kingColor) {
      if (board[newY][newX]!.type === 'knight') return true;
    }
  }
  return false;
};

export const willMoveCheck = (board: Board, move: Move, kingColor: Color): boolean => {
  const movingPiece = board[move.from.y][move.from.x];
  if (!movingPiece) return false;

  let kingPos;
  if (movingPiece.type === 'king' && movingPiece.color === kingColor) {
    kingPos = move.to;
  } else {
    kingPos = getKingPosition(board, kingColor);
  }
  if (!kingPos) return false;

  const newBoard = boardAfterMove(board, move, movingPiece);
  return isPositionUnderAttack(newBoard, kingPos, kingColor);
};

export const isKingInCheck = (board: Board, kingColor: Color): boolean => {
  const kingPos = getKingPosition(board, kingColor);
  if (!kingPos) return false;
  return isPositionUnderAttack(board, kingPos, kingColor);
};
