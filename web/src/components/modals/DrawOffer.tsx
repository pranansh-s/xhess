'use client';

import { memo } from 'react';

import SocketService from '@/services/socket.service';
import tw from 'tailwind-styled-components';

import { closeModal } from '@/redux/features/modalSlice';
import { useAppDispatch } from '@/redux/hooks';

import Button from '../common/Button';
import ModalContainer from './Modal';

const DrawOffer = memo(() => {
  const dispatch = useAppDispatch();

  const handleAccept = () => {
    SocketService.acceptDraw();
    dispatch(closeModal());
  };

  const handleDecline = () => {
    SocketService.rejectDraw();
    dispatch(closeModal());
  };

  return (
    <StyledModalContainer>
      <TitleText>DRAW OFFER</TitleText>
      <OfferMessage>Your opponent has offered a draw. Do you accept?</OfferMessage>
      <ButtonsContainer>
        <Button themeColor="green" onClick={handleAccept}>
          Accept
        </Button>
        <Button themeColor="red" onClick={handleDecline}>
          Decline
        </Button>
      </ButtonsContainer>
    </StyledModalContainer>
  );
});

DrawOffer.displayName = 'DrawOffer';
export default DrawOffer;

const StyledModalContainer = tw(ModalContainer)`
  flex
  max-w-[368px]
  flex-col
  items-center
  gap-8
  border-none
  bg-zinc-900
  p-8
  py-12
  text-center
`;

const TitleText = tw.h2`
  font-serif
  text-4xl
  font-bold
  tracking-wider
  text-amber-500
`;

const OfferMessage = tw.span`
  mb-2
  font-sans
  text-lg
  text-secondary
  opacity-80
`;

const ButtonsContainer = tw.div`
  flex
  w-full
  flex-row
  justify-center
  gap-6
`;
