import { CARDINAL_DIRECTIONS, DIAGONAL_DIRECTIONS, KNIGHT_DIRECTIONS } from '../constants/index.js';
import { Board, Color, Move, Piece, Position } from '../types/chess.js';
import { boardAfterMove } from './board.js';

export const getValidMovesForPiece = (board: Board, piece: Piece, player: Color, moves: Move[] = []): Position[] => {
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

        // En-passant
        if (moves.length > 0) {
          const lastMove = moves[moves.length - 1];
          const lastMovePiece = board[lastMove.to.y][lastMove.to.x];
          const isOpponentPawnDoubleStep =
            lastMovePiece &&
            lastMovePiece.type === 'pawn' &&
            lastMovePiece.color !== player &&
            Math.abs(lastMove.to.y - lastMove.from.y) === 2;

          if (isOpponentPawnDoubleStep && lastMove.to.y === y) {
            [-1, 1].forEach(dir => {
              if (lastMove.to.x === x + dir) {
                validMoves.push({ x: x + dir, y: newY });
              }
            });
          }
        }
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

      // Castling
      const kingStartRow = player === 'white' ? 7 : 0;
      if (y === kingStartRow && x === 4) {
        const hasKingMoved = moves.some(m => m.from.x === 4 && m.from.y === kingStartRow);
        if (!hasKingMoved && !isKingInCheck(board, player)) {
          // King-side (O-O)
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

          // Queen-side (O-O-O)
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

export const isPositionUnderAttack = (board: Board, pos: Position, kingColor: Color): boolean => {
  for (const { dx, dy } of DIAGONAL_DIRECTIONS) {
    for (let i = 1; i <= 7; i++) {
      const newX = pos.x + dx * i;
      const newY = pos.y + dy * i;

      if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

      if (board[newY][newX]) {
        if (board[newY][newX].color !== kingColor) {
          const pieceType = board[newY][newX].type;
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
        if (board[newY][newX].color !== kingColor) {
          const pieceType = board[newY][newX].type;
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

    if (board[newY][newX] && board[newY][newX].color !== kingColor) {
      if (board[newY][newX].type === 'knight') return true;
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
