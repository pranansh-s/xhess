'use client';

import tw from 'tailwind-styled-components';

import { goToMove } from '@/redux/features/boardSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

const MoveHistory = () => {
  const moveList = useAppSelector(state => state.board.moveNotation);
  const dispatch = useAppDispatch();

  const handleGoToMove = (index: number) => {
    dispatch(goToMove(index + 1));
  };

  return (
    <MoveHistoryContainer className="striped">
      {moveList.map((move, idx) => (
        <MoveItem onClick={() => handleGoToMove(idx)} key={idx}>
          <span>{idx + 1}.</span>
          <span>{move}</span>
        </MoveItem>
      ))}
    </MoveHistoryContainer>
  );
};

export default MoveHistory;

const MoveHistoryContainer = tw.ol`
  flex
  flex-1
  flex-wrap
  content-start
  gap-2
  overflow-y-auto
`;

const MoveItem = tw.li`
  h-max
  cursor-pointer
  space-x-1
  rounded-md
  p-2
  font-serif
  text-sm
`;
