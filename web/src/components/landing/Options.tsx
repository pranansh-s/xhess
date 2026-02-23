'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useDispatch } from 'react-redux';
import tw from 'tailwind-styled-components';

import { getErrorMessage } from '@/lib/utils/error';
import { createRoom } from '@/lib/utils/room';

import Button from '@/components/common/Button';

import { auth } from '@/lib/firebase';
import { openModal } from '@/redux/features/modalSlice';

const Options = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const handleCreateRoom = useCallback(async () => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    //create a possible loading hook that turns on promsise resolve
    setLoading(true);
    try {
      const key = await createRoom();
      router.push(`/room/${key}`);
    } catch (err) {
      console.error('Failed to create room: ', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleRoomJoinModal = () => {
    dispatch(openModal('joinRoom'));
  };

  return (
    <OptionsContainer>
      <Heading>Xhess</Heading>
      <Button onClick={handleCreateRoom} isLoading={loading} disabled={loading} themeColor="blue">
        create room
      </Button>
      <Button onClick={handleRoomJoinModal}>join room</Button>
    </OptionsContainer>
  );
};

export default Options;

const OptionsContainer = tw.div`
  absolute
  left-1/2
  top-1/2
  flex
  -translate-x-1/2
  translate-y-1/4
  flex-col
  gap-6
`;

const Heading = tw.h1`
  select-none
  px-3
  py-2
  text-center
  font-sans
  text-9xl
  font-black
  text-white
  duration-200
  ease-in-out
  [text-shadow:-2px_-2px_1px_#000,2px_-2px_1px_#000,-2px_2px_1px_#000,2px_2px_1px_#000]
  first-letter:text-black
  hover:text-black
  hover:[text-shadow:-1px_-1px_1px_#fff,1px_-1px_1px_#fff,-1px_1px_1px_#fff,1px_1px_1px_#fff]
  hover:first-letter:text-white
`;
