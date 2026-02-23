'use client';

import { memo } from 'react';
import Image from 'next/image';

import SocketService from '@/services/socket.service';
import tw from 'tailwind-styled-components';

import { Move, Piece, Position } from '@xhess/shared/types';

import { handleErrors } from '@/lib/utils/error';

import { deSelectPiece, selectPiece } from '@/redux/features/boardSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

interface ICellProps {
  piece: Piece | null;
  currentPos: Position;
  isPossibleMove: boolean;
}

const Cell: React.FC<ICellProps> = memo(({ piece, currentPos, isPossibleMove }) => {
  const { selectedPiece, currentMoveIndex, moves } = useAppSelector(state => state.board);
  const { isTurn, playerSide } = useAppSelector(state => state.gameState);
  const dispatch = useAppDispatch();

  const isSelected = selectedPiece && piece == selectedPiece;
  const isSelectable = isTurn && currentMoveIndex == moves.length && piece?.color == playerSide;

  const performMove = (move: Move) => {
    try {
      SocketService.makeMove(move);
    } catch (err) {
      handleErrors(err, 'Failed to move piece');
    }
  };

  const handleClick = () => {
    if (selectedPiece) {
      if (isPossibleMove) {
        const move: Move = { from: selectedPiece.pos, to: currentPos };
        performMove(move);
      } else {
        dispatch(deSelectPiece());
      }
      return;
    }

    if (isSelectable) {
      dispatch(selectPiece(currentPos));
    }
  };

  return (
    <CellContainer
      onClick={handleClick}
      $isClickable={isSelectable || isPossibleMove}
      $isSelected={isSelected}
      $isBlackCell={(currentPos.x + currentPos.y) % 2 !== 0}
      $isHighlighted={isPossibleMove}
      $isCapturable={piece !== null}
    >
      {piece && !isSelected && (
        <Image
          className="h-full w-full"
          width={80}
          height={80}
          src={piece.src}
          alt={`piece-${piece.type}-${piece.color}`}
          priority
        />
      )}
    </CellContainer>
  );
});

Cell.displayName = 'Cell';
export default Cell;

const CellContainer = tw.div<{
  $isClickable: boolean;
  $isSelected: boolean;
  $isBlackCell: boolean;
  $isHighlighted: boolean;
  $isCapturable: boolean;
}>`
  ${p => (p.$isBlackCell ? 'bg-primary' : 'bg-zinc-200')}
  ${p => p.$isClickable && 'cursor-pointer'}
  ${p => p.$isSelected && 'bg-blue-300'}
  ${p => p.$isHighlighted && (p.$isCapturable ? 'bg-red-400' : 'invert-[0.8] contrast-125 hue-rotate-90')} `;
