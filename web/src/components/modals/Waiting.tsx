'use client';

import tw from 'tailwind-styled-components';

import ModalContainer from './Modal';

const Waiting = () => {
  return (
    <StyledModalContainer>
      <WaitingText>waiting for room owner to start game</WaitingText>
      <LoaderContainer>
        <LoadDot className="bg-red-700 [animation-delay:-0.3s]" />
        <LoadDot className="bg-blue-700 [animation-delay:-0.15s]" />
        <LoadDot className="bg-green-700" />
      </LoaderContainer>
    </StyledModalContainer>
  );
};

export default Waiting;

const StyledModalContainer = tw(ModalContainer)`
  max-w-[368px]
  flex-row
  items-center
  gap-4
  border-none
  bg-zinc-900
  py-12
`;

const WaitingText = tw.span`
  text-xl
  text-secondary
  opacity-75
`;

const LoaderContainer = tw.div`
  mt-1
  flex
  gap-1
`;

const LoadDot = tw.div`
  h-1
  w-1
  animate-bounce
  rounded-full
`;
