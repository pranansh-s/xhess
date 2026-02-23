'use client';

import { memo, useCallback, useRef, useState } from 'react';

import { gameTypeOptions } from '@/constants';
import SocketService from '@/services/socket.service';
import { Canvas, useFrame } from '@react-three/fiber';
import tw from 'tailwind-styled-components';
import { Group, MathUtils } from 'three';

import { Color, GameConfig, GameType } from '@xhess/shared/types';

import Button from '../common/Button';
import ChessModel, { IChessModelProps } from '../common/ChessModel';
import Lighting from '../common/Lighting';
import ModalContainer from './Modal';

interface IAnimatedChessModelProps extends Omit<IChessModelProps, 'modelPath'> {
  animate: boolean;
  targetRotation: number;
}

const AnimatedChessModel: React.FC<IAnimatedChessModelProps> = ({ animate, targetRotation, ...props }) => {
  const groupRef = useRef<Group>(null);
  const initialRotation = useRef(props.rotation?.[2] ?? 0);
  const progress = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;

    if (animate) {
      progress.current = Math.min(progress.current + 0.05, 1);
      const easedProgress =
        progress.current < 0.5
          ? 2 * progress.current * progress.current
          : 1 - Math.pow(-2 * progress.current + 2, 2) / 2;

      groupRef.current.rotation.z = MathUtils.lerp(initialRotation.current, targetRotation, easedProgress);
    } else if (!animate) {
      progress.current = Math.max(progress.current - 0.1, 0);

      groupRef.current.rotation.z = MathUtils.lerp(
        initialRotation.current,
        targetRotation || initialRotation.current,
        progress.current
      );
    }
  });

  return <ChessModel ref={groupRef} modelPath="../models/king.fbx" {...props} />;
};

const GameSettings = memo(() => {
  const [hoveredSide, setHoveredSide] = useState<string | null>(null);

  const [selectedSide, setSelectedSide] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<GameType>(gameTypeOptions[0].type);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSetConfig = useCallback(() => {
    setLoading(true);

    const playerSide =
      selectedSide !== 'random' ? (selectedSide as Color) : Math.round(Math.random()) === 0 ? 'white' : 'black';
    const config: GameConfig = {
      playerSide,
      gameType: selectedType,
    };

    SocketService.newGame(config);
    setLoading(false);
  }, [selectedSide, selectedType]);

  return (
    <ModalContainer className="max-w-[368px]">
      <ChooseSideContainer>
        <ChooseOption
          $isSelected={selectedSide == 'black'}
          onClick={() => setSelectedSide('black')}
          onMouseEnter={() => setHoveredSide('black')}
          onMouseLeave={() => setHoveredSide(null)}
          className="bg-white"
        >
          <Canvas>
            <Lighting />
            <AnimatedChessModel
              color="#505050"
              rotation={[0, 0, 0.8]}
              targetRotation={-0.8}
              animate={hoveredSide == 'black' || selectedSide == 'black'}
            />
          </Canvas>
        </ChooseOption>
        <ChooseOption
          $isSelected={selectedSide == 'white'}
          onClick={() => setSelectedSide('white')}
          onMouseEnter={() => setHoveredSide('white')}
          onMouseLeave={() => setHoveredSide(null)}
          className="bg-black"
        >
          <Canvas>
            <Lighting />
            <AnimatedChessModel
              color="#ffffff"
              rotation={[0, 0, -0.8]}
              targetRotation={0.8}
              animate={hoveredSide == 'white' || selectedSide == 'white'}
            />
          </Canvas>
        </ChooseOption>
        <ChooseOption
          $isSelected={selectedSide == 'random'}
          onClick={() => setSelectedSide('random')}
          onMouseEnter={() => setHoveredSide('random')}
          onMouseLeave={() => setHoveredSide(null)}
          className="bg-[linear-gradient(135deg,_black_0%,_black_50%,_white_50%,_white_100%)]"
        >
          <Canvas>
            <Lighting />
            <AnimatedChessModel
              color="#505050"
              position={[-0.25, -0.25, -0.25]}
              rotation={[0, 0, -0.8]}
              targetRotation={0.8}
              animate={hoveredSide == 'random' || selectedSide == 'random'}
            />
            <AnimatedChessModel
              color="#ffffff"
              position={[0.25, -0.25, 0]}
              rotation={[0, 0, 0.8]}
              targetRotation={-0.8}
              animate={hoveredSide == 'random' || selectedSide == 'random'}
            />
          </Canvas>
        </ChooseOption>
      </ChooseSideContainer>
      <ChooseGameType
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value as GameType)}
      >
        {gameTypeOptions.map(({ name, type }, idx: number) => (
          <option value={type} key={`game-type-${idx}`}>
            {name}
          </option>
        ))}
      </ChooseGameType>
      <Button onClick={handleSetConfig} isLoading={loading} disabled={selectedSide == undefined} themeColor="blue">
        start
      </Button>
    </ModalContainer>
  );
});

GameSettings.displayName = 'GameSettings';
export default GameSettings;

const ChooseSideContainer = tw.div`
  flex
  gap-6
`;

const ChooseOption = tw.div<{
  $isSelected: boolean;
}>`
  aspect-square
  w-[calc(33%-1rem)]
  cursor-pointer
  rounded-lg
  transition-all
  duration-100
  ${p => p.$isSelected && 'outline outline-4 outline-blue-500'}`;

const ChooseGameType = tw.select`
  mb-6
  rounded-lg
  border-r-8
  border-transparent
  bg-secondary
  bg-opacity-50
  p-3
  font-serif
  font-medium
  outline
  outline-tertiary
`;
