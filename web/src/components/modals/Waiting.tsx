'use client';

import tw from 'tailwind-styled-components';

import ModalContainer from '@/components/modals/Modal';

const Waiting = () => {
  return (
    <ModalContainer className='max-w-[400px]'>
      <WaitingText>waiting for room owner to start game</WaitingText>
    </ModalContainer>
  );
};

export default Waiting;

const WaitingText = tw.span`
  text-xl
  text-secondary
  opacity-75
`;