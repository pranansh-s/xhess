'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';

import SocketService from '@/services/socket.service';
import tw from 'tailwind-styled-components';

import { opponentSide } from '@xhess/shared/utils';

import { closeModal } from '@/redux/features/modalSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import Button from '../common/Button';
import ModalContainer from './Modal';

const GameOver = memo(() => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { state: gameState, endReason, playerSide, gameType } = useAppSelector(state => state.gameState);

  const isDraw = gameState === 'draw';
  const isWinner =
    (gameState === 'whiteWin' && playerSide === 'white') || (gameState === 'blackWin' && playerSide === 'black');

  const getTitleText = () => {
    if (isDraw) return 'DRAW';
    return isWinner ? 'VICTORY' : 'DEFEAT';
  };

  const getReasonText = () => {
    switch (endReason) {
      case 'checkmate':
        return 'by Checkmate';
      case 'stalemate':
        return 'by Stalemate';
      case 'resignation':
        return 'by Resignation';
      case 'timeout':
        return 'on Time';
      case 'drawAgreement':
        return 'by Agreement';
    }
  };

  const handleRematch = () => {
    const newSide = opponentSide(playerSide);
    SocketService.newGame({ playerSide: newSide, gameType });
    dispatch(closeModal());
  };

  const handleGoHome = () => {
    dispatch(closeModal());
    router.push('/');
  };

  return (
    <StyledModalContainer>
      <ResultTitle $isWinner={isWinner} $isDraw={isDraw}>
        {getTitleText()}
      </ResultTitle>

      <ReasonSub>{getReasonText()}</ReasonSub>

      <ButtonWrapper>
        <Button themeColor="green" onClick={handleRematch}>
          Play Again (Switch Sides)
        </Button>
        <Button themeColor="blue" onClick={handleGoHome}>
          Go to Lobby
        </Button>
      </ButtonWrapper>
    </StyledModalContainer>
  );
});

GameOver.displayName = 'GameOver';
export default GameOver;

const StyledModalContainer = tw(ModalContainer)`
  flex
  max-w-[400px]
  flex-col
  items-center
  gap-6
  border-none
  bg-zinc-900
  p-8
  py-12
  text-center
`;

const ResultTitle = tw.h2<{ $isWinner: boolean; $isDraw: boolean }>`
  font-serif
  text-5xl
  font-bold
  tracking-wider
  ${p => {
    if (p.$isDraw) return 'text-amber-500';
    return p.$isWinner ? 'text-green-500 animate-pulse' : 'text-red-500';
  }} `;

const ReasonSub = tw.p`
  mb-4
  font-sans
  text-lg
  text-secondary
  opacity-80
`;

const ButtonWrapper = tw.div`
  flex
  w-full
  flex-col
  gap-4
`;
