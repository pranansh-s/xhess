'use client';

import { useState } from 'react';

import tw from 'tailwind-styled-components';

import Chat from './chat';
import GameOptions from './GameOptions';
import MoveHistory from './MoveHistory';

const GameBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <GameBarContainer $isOpen={isOpen}>
      <GameOptions />
      <Divider />
      <MoveHistory />
      <Chat />
      <ShowGameBar onClick={handleToggle}>{isOpen ? '\u2193' : '\u2191'}</ShowGameBar>
    </GameBarContainer>
  );
};

export default GameBar;

const GameBarContainer = tw.div<{ $isOpen: boolean }>`
  fixed
  top-full
  h-full
  max-w-[500px]
  p-6
  pt-24
  lg:static
  lg:top-0
  lg:w-[30vw]
  lg:pt-0
  ${p => (p.$isOpen ? 'top-0' : 'top-full')}
  flex
  flex-col
  gap-3
  rounded-xl
  bg-zinc-900
  transition-all
  duration-500
`;

const ShowGameBar = tw.button`
  absolute
  left-1/2
  block
  aspect-square
  w-40
  -translate-x-1/2
  -translate-y-[calc(50%+6rem)]
  rounded-full
  border-4
  bg-primary
  text-9xl
  text-white
  lg:hidden
`;

const Divider = tw.div`
  mt-3
  border-t
  border-white
`;
