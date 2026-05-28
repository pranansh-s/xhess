import { Board, Color, Move, Piece, Position, PieceType } from '../../types/chess.js';

export interface PieceMovementStrategy {
  getValidMoves(board: Board, piece: Piece, player: Color, moves: Move[]): Position[];
}

export const getMovesAlongDirection = (
  board: Board,
  pos: Position,
  player: Color,
  directions: { dx: number; dy: number }[],
  depth: number
): Position[] => {
  const validMoves: Position[] = [];
  const { x, y } = pos;

  for (const { dx, dy } of directions) {
    for (let i = 1; i <= depth; i++) {
      const newX = x + dx * i;
      const newY = y + dy * i;

      if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;

      if (!board[newY][newX]) {
        validMoves.push({ x: newX, y: newY });
      } else {
        if (board[newY][newX]!.color !== player) {
          validMoves.push({ x: newX, y: newY });
        }
        break;
      }
    }
  }

  return validMoves;
};
