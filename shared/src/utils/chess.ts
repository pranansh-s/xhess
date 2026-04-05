import { CARDINAL_DIRECTIONS, DIAGONAL_DIRECTIONS, KNIGHT_DIRECTIONS } from '../constants/index.js';
import { Board, Color, Move, Piece, Position } from '../types/chess.js';
import { boardAfterMove } from './board.js';

export const getValidMovesForPiece = (board: Board, piece: Piece, player: Color): Position[] => {
  const validMoves: Position[] = [];
  const { x, y } = piece.pos;

  const getMovesAlongDirection = (directions: { dx: number; dy: number }[], depth: number) => {
    for (const { dx, dy } of directions) {
      for (let i = 1; i <= depth; i++) {
        const newX = x + dx * i;
        const newY = y + dy * i;

        if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

        if (!board[newY][newX]) {
          validMoves.push({ x: newX, y: newY });
        } else {
          if (board[newY][newX].color !== player) {
            validMoves.push({ x: newX, y: newY });
          }
          break;
        }
      }
    }
  };

  switch (piece.type) {
    case 'pawn':
      const newY = player === 'white' ? y - 1 : y + 1;

      if (newY >= 0 && newY < 8) {
        if (!board[newY][x]) {
          validMoves.push({ x, y: newY });
        }
        if (y == 6 && player === 'white' && !board[newY - 1][x]) {
          validMoves.push({ x, y: newY - 1 });
        }
        if (y == 1 && player === 'black' && !board[newY + 1][x]) {
          validMoves.push({ x, y: newY + 1 });
        }

        [-1, 1].forEach(dir => {
          if (x + dir >= 0 && x + dir < 8) {
            const pieceToCapture = board[newY][x + dir];
            if (pieceToCapture && pieceToCapture.color !== player) {
              validMoves.push({ x: x + dir, y: newY });
            }
          }
        });
      }
      break;
    case 'rook':
      getMovesAlongDirection(CARDINAL_DIRECTIONS, 7);
      break;
    case 'knight':
      getMovesAlongDirection(KNIGHT_DIRECTIONS, 1);
      break;
    case 'bishop':
      getMovesAlongDirection(DIAGONAL_DIRECTIONS, 7);
      break;
    case 'queen':
      getMovesAlongDirection([...CARDINAL_DIRECTIONS, ...DIAGONAL_DIRECTIONS], 7);
      break;
    case 'king':
      getMovesAlongDirection([...CARDINAL_DIRECTIONS, ...DIAGONAL_DIRECTIONS], 1);
      break;
  }

  return validMoves.filter(to => !willMoveCheck(board, { from: piece.pos, to }, player));
};

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
  for (const { dx, dy } of DIAGONAL_DIRECTIONS) {
    for (let i = 1; i <= 7; i++) {
      const newX = kingPos.x + dx * i;
      const newY = kingPos.y + dy * i;

      if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

      if (newBoard[newY][newX]) {
        if (newBoard[newY][newX].color !== kingColor) {
          const pieceType = newBoard[newY][newX].type;
          if (pieceType === 'bishop' || pieceType === 'queen' || (pieceType === 'pawn' && i == 1)) return true;
        }
        break;
      }
    }
  }

  for (const { dx, dy } of CARDINAL_DIRECTIONS) {
    for (let i = 1; i <= 7; i++) {
      const newX = kingPos.x + dx * i;
      const newY = kingPos.y + dy * i;

      if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

      if (newBoard[newY][newX]) {
        if (newBoard[newY][newX].color !== kingColor) {
          const pieceType = newBoard[newY][newX].type;
          if (pieceType === 'rook' || pieceType === 'queen') return true;
        }
        break;
      }
    }
  }

  for (const { dx, dy } of KNIGHT_DIRECTIONS) {
    const newX = kingPos.x + dx;
    const newY = kingPos.y + dy;

    if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) continue;

    if (newBoard[newY][newX] && newBoard[newY][newX].color !== kingColor) {
      if (newBoard[newY][newX].type === 'knight') return true;
    }
  }
  return false;
};
