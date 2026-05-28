import { useCallback, useMemo } from 'react';

import { Board, Color, Piece } from '@xhess/shared/types';
import { getValidMovesForPiece } from '@xhess/shared/utils';

import { useAppSelector } from '@/redux/hooks';

const useValidMoves = (board: Board, activePiece: Piece | null, side: Color) => {
  const moves = useAppSelector(state => state.board.moves);

  const validMoves = useMemo(
    () => (activePiece ? getValidMovesForPiece(board, activePiece, side, moves) : []),
    [activePiece, board, side, moves]
  );

  return useCallback(
    (cellX: number, cellY: number) => {
      return validMoves.some(move => move.x === cellX && move.y === cellY);
    },
    [validMoves]
  );
};

export default useValidMoves;
