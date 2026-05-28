import { Board, Color, Move, Piece, PieceType } from '../types/chess.js';

export const opponentSide = (playerSide: Color): Color => (playerSide == 'black' ? 'white' : 'black');

const createPiece = (type: PieceType, color: Color, x: number, y: number): Piece => ({
  src: `/pieces/${type}-${color}.png`,
  type,
  color,
  pos: { x, y },
});

export const createBoard = (): Board => {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  for (let i = 0; i < 8; i++) {
    board[0][i] = createPiece(backRow[i], 'black', i, 0);
    board[7][i] = createPiece(backRow[i], 'white', i, 7);
  }

  for (let i = 0; i < 8; i++) {
    board[1][i] = createPiece('pawn', 'black', i, 1);
    board[6][i] = createPiece('pawn', 'white', i, 6);
  }

  return board;
};

export const boardAfterMove = (board: Board, move: Move, piece: Piece) => {
  const { from, to } = move;
  const newBoard = board.map(row => [...row]);

  const isPawnPromotion = piece.type == 'pawn' && (move.to.y == 0 || move.to.y == 7);

  if (isPawnPromotion) {
    newBoard[to.y][to.x] = createPiece('queen', piece.color, to.x, to.y);
  } else {
    newBoard[to.y][to.x] = { ...piece, pos: to };
  }
  newBoard[from.y][from.x] = null;

  const isCastling = piece.type === 'king' && Math.abs(to.x - from.x) === 2;
  if (isCastling) {
    const isKingSide = to.x > from.x;
    const rookFromX = isKingSide ? 7 : 0;
    const rookToX = isKingSide ? 5 : 3;
    const rookY = piece.color === 'white' ? 7 : 0;
    const rook = newBoard[rookY][rookFromX];
    if (rook) {
      newBoard[rookY][rookToX] = { ...rook, pos: { x: rookToX, y: rookY } };
      newBoard[rookY][rookFromX] = null;
    }
  }

  const isEnPassant = piece.type === 'pawn' && Math.abs(to.x - from.x) === 1 && !board[to.y][to.x];
  if (isEnPassant) {
    newBoard[from.y][to.x] = null;
  }

  return newBoard;
};
