import { Board, Color, Move, Piece, Position } from '../../types/chess.js';
import { PieceMovementStrategy } from './common.js';

export const PawnStrategy: PieceMovementStrategy = {
  getValidMoves(board: Board, piece: Piece, player: Color, moves: Move[]): Position[] {
    const validMoves: Position[] = [];
    const { x, y } = piece.pos;
    const newY = player === 'white' ? y - 1 : y + 1;

    if (newY >= 0 && newY < 8) {
      if (!board[newY][x]) {
        validMoves.push({ x, y: newY });
        if (y === 6 && player === 'white' && !board[newY - 1][x]) {
          validMoves.push({ x, y: newY - 1 });
        }
        if (y === 1 && player === 'black' && !board[newY + 1][x]) {
          validMoves.push({ x, y: newY + 1 });
        }
      }

      [-1, 1].forEach(dir => {
        if (x + dir >= 0 && x + dir < 8) {
          const pieceToCapture = board[newY][x + dir];
          if (pieceToCapture && pieceToCapture.color !== player) {
            validMoves.push({ x: x + dir, y: newY });
          }
        }
      });

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

    return validMoves;
  },
};
