import { useMemo } from 'react';

import tw from 'tailwind-styled-components';

import Board from '@/components/room/Board';
import UserBar from '@/components/room/user-bar';

import { useAppSelector } from '@/redux/hooks';

const GameUI = () => {
  const { playerSide, players } = useAppSelector(state => state.gameState);
  const myPlayer = useMemo(
    () => (playerSide == 'white' ? players.whiteSidePlayer : players.blackSidePlayer),
    [playerSide, players]
  );
  const opponentPlayer = useMemo(
    () => (playerSide == 'white' ? players.blackSidePlayer : players.whiteSidePlayer),
    [playerSide, players]
  );

  const myProfile = useAppSelector(state => state.user);
  const opponentProfile = useAppSelector(state => state.gameState.opponentProfile);

  return (
    <GameContainer>
      <UserBar timer={opponentPlayer?.remainingTime} profile={opponentProfile} isUser={false} />
      <Board />
      <UserBar timer={myPlayer?.remainingTime} profile={myProfile} isUser={true} />
    </GameContainer>
  );
};

export default GameUI;

const GameContainer = tw.div`
  flex
  h-full
  flex-col
  justify-center
  space-y-3
`;
