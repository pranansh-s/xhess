'use client';

import { useMemo } from 'react';
import Image from 'next/image';

import tw from 'tailwind-styled-components';

import { Piece } from '@xhess/shared/types';

import Cell from '@/components/room/Cell';

import usePlayerInput from '@/hooks/usePlayerInput';
import useValidMoves from '@/hooks/useValidMoves';
import { useAppSelector } from '@/redux/hooks';

interface IActivePiece {
  pos: {
    x: number;
    y: number;
  };
  piece: Piece;
}

const ActivePiece: React.FC<IActivePiece> = ({ pos, piece }) => {
  return (
    <ActivePieceContainer
      style={{
        top: pos.y - 50,
        left: pos.x - 50,
      }}
    >
      <Image width={100} height={100} src={piece.src} alt={`active-piece-${piece.type}-${piece.color}`} priority />
    </ActivePieceContainer>
  );
};

const Board = () => {
  const mousePos = usePlayerInput();
  const { selectedPiece, boardMap } = useAppSelector(state => state.board);
  const { playerSide } = useAppSelector(state => state.gameState);

  const board = useMemo(() => (playerSide == 'black' ? [...boardMap].reverse() : boardMap), [boardMap, playerSide]);
  const isValidMove = useValidMoves(boardMap, selectedPiece, playerSide);

  return (
    <BoardContainer>
      {board.map((row, rowNumber) => {
        const rowIdx = playerSide === 'black' ? board.length - 1 - rowNumber : rowNumber;
        return row.map((piece, colIdx) => (
          <Cell
            key={`cell-${rowIdx}+${colIdx}`}
            piece={piece}
            currentPos={{ x: colIdx, y: rowIdx }}
            isPossibleMove={isValidMove(colIdx, rowIdx)}
          />
        ));
      })}
      {selectedPiece && <ActivePiece pos={mousePos} piece={selectedPiece} />}
    </BoardContainer>
  );
};

export default Board;

const BoardContainer = tw.div`
  grid
  aspect-square
  h-full
  max-h-[90vw]
  grid-cols-8
  grid-rows-8
  bg-white
`;

const ActivePieceContainer = tw.div`
  pointer-events-none
  absolute
`;
