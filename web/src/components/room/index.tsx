'use client';

import tw from 'tailwind-styled-components';

import { Room } from '@xhess/shared/types';

import GameBar from '@/components/game-bar';
import DrawOffer from '@/components/modals/DrawOffer';
import GameOver from '@/components/modals/GameOver';
import GameSettings from '@/components/modals/GameSettings';
import Surrender from '@/components/modals/Surrender';
import Waiting from '@/components/modals/Waiting';
import GameUI from '@/components/room/GameUI';

import useRoomInit from '@/hooks/useRoomInit';
import { useAppSelector } from '@/redux/hooks';

interface IRoomProps {
  roomId: string;
  room: Room;
}

const RoomClient: React.FC<IRoomProps> = ({ roomId, room }) => {
  const activeModal = useAppSelector(state => state.modals);
  useRoomInit(roomId, room);

  return (
    <RoomContainer>
      {activeModal === 'gameSettings' && <GameSettings />}
      {activeModal === 'waiting' && <Waiting />}
      {activeModal === 'surrender' && <Surrender />}
      {activeModal === 'gameOver' && <GameOver />}
      {activeModal === 'drawOffer' && <DrawOffer />}
      <GameUI />
      <GameBar />
    </RoomContainer>
  );
};

export default RoomClient;

const RoomContainer = tw.div`
  flex
  h-full
  items-center
  justify-center
  gap-10
  p-20
`;
