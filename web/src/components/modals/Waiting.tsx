'use client';

import tw from 'tailwind-styled-components';

import ModalContainer from '@/components/modals/Modal';

const Waiting = () => {
  return (
    <ModalContainer>
      <WaitingText>waiting for room owner to start game</WaitingText>
      <LoaderContainer>
        <LoadDot className="bg-red-700 [animation-delay:-0.3s]" />
        <LoadDot className="bg-blue-700 [animation-delay:-0.15s]" />
        <LoadDot className="bg-green-700" />
      </LoaderContainer>
    </ModalContainer>
  );
};

export default Waiting;

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
