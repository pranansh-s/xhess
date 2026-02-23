'use client';

import tw from 'tailwind-styled-components';

import { Room } from '@xhess/shared/types';

import useRoomInit from '@/hooks/useRoomInit';
import { useAppSelector } from '@/redux/hooks';

import GameBar from '../game-bar';
import GameSettings from '../modals/GameSettings';
import Surrender from '../modals/Surrender';
import Waiting from '../modals/Waiting';
import GameUI from './GameUI';

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
