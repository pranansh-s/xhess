import { memo } from 'react';

import SocketService from '@/services/socket.service';
import tw from 'tailwind-styled-components';

import Button from '@/components/common/Button';
import ModalContainer from '@/components/modals/Modal';

import { closeModal } from '@/redux/features/modalSlice';
import { useAppDispatch } from '@/redux/hooks';

const Surrender = memo(() => {
  const dispatch = useAppDispatch();

  const handleYes = () => {
    SocketService.surrender();
    dispatch(closeModal());
  };

  const handleNo = () => {
    dispatch(closeModal());
  };

  return (
    <ModalContainer className="max-w-[275px]">
      <AreWeSure>are you sure, surrender?</AreWeSure>
      <ButtonsContainer>
        <Button themeColor="green" onClick={handleYes}>
          Yes
        </Button>
        <Button themeColor="red" onClick={handleNo}>
          No
        </Button>
      </ButtonsContainer>
    </ModalContainer>
  );
});

Surrender.displayName = 'Surrender';
export default Surrender;

const AreWeSure = tw.span`
  text-2xl
  text-secondary
`;

const ButtonsContainer = tw.div`
  flex
  flex-row
  gap-8
`;
