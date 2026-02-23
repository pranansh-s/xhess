//TODO: - DI in services, decrease procedural code, validation separately, better abstraction?, better error handling?, event enums rather than strings
//init roomToGameId, currentRoomId, etc on server restart, login bug, O-O O-O-O, draw by mutual, 50 move, 3-peat, en-passant, proper modals on game end

import { Board, Color, Game, Move, Piece, Position } from '@xhess/shared/types';
import { boardAfterMove, createBoard, getKingPosition, getValidMovesForPiece, opponentSide } from '@xhess/shared/utils';

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
      } else {
        game.state = 'draw';
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
    const opponent = opponentSide(color);
    const pieces = this.board.flat().filter(p => p && p.color == opponent) as Piece[];
    for (const piece of pieces) {
      const validMoves = getValidMovesForPiece(this.board, piece, opponent);
      for (const moveTo of validMoves) {
        const newBoard = boardAfterMove(this.board, { from: piece.pos, to: moveTo }, piece);
        if (!getKingPosition(newBoard, opponent)) {
          return true;
        }
      }
    }
    return false;
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
