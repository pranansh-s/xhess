//TODO: - DI in services, decrease procedural code, validation separately, better abstraction?, better error handling?

import { Board, Color, Game, Move, Piece, Position } from '@xhess/shared/types';
import { boardAfterMove, createBoard, getValidMovesForPiece, isKingInCheck } from '@xhess/shared/utils';

import { ServiceError } from '../utils/error.js';

class ChessService {
  private board: Board;

  constructor(newGame: Game) {
    this.board = createBoard();
    this.initMoves(newGame.moves);
  }

  private initMoves = (moves: Move[]) => {
    this.board = moves.reduce((currentBoard, move) => {
      const piece = currentBoard[move.from.y][move.from.x];
      if (!piece) {
        throw new ServiceError('No piece in move');
      }

      return boardAfterMove(currentBoard, move, piece);
    }, this.board);
  };

  private isValidMove = (piece: Piece, to: Position): boolean => {
    return (
      getValidMovesForPiece(this.board, piece, piece.color).find(pos => pos.x == to.x && pos.y == to.y) !== undefined
    );
  };

  validateEndGame = (game: Game) => {
    if (this.isStalemate(game.playerTurn)) {
      if (this.isCheckMate(game.playerTurn)) {
        game.state = game.playerTurn == 'white' ? 'blackWin' : 'whiteWin';
        game.endReason = 'checkmate';
      } else {
        game.state = 'draw';
        game.endReason = 'stalemate';
      }
    }
  };

  private isStalemate = (color: Color): boolean => {
    const pieces = this.board.flat().filter(p => p && p.color == color) as Piece[];
    for (const piece of pieces) {
      const validMoves = getValidMovesForPiece(this.board, piece, color);
      if (validMoves.length > 0) {
        return false;
      }
    }
    return true;
  };

  private isCheckMate = (color: Color): boolean => {
    return isKingInCheck(this.board, color);
  };

  makeMove = (move: Move) => {
    const piece = this.board[move.from.y][move.from.x];
    if (!piece) {
      throw new ServiceError('Cannot move an empty piece');
    }

    if (!this.isValidMove(piece, move.to)) {
      throw new ServiceError('Move not possible');
    }

    this.board = boardAfterMove(this.board, move, piece);
  };
}

export default ChessService;
