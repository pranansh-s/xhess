'use client';

import { memo, useMemo, useRef } from 'react';

import { modelPaths } from '@/constants';
import { IFloatingModelProps, IFloatingModelState } from '@/types';
import { useFBX } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import tw from 'tailwind-styled-components';
import { Group } from 'three';

import { createColoredModel } from '@/lib/utils/model';

import Lighting from '../common/Lighting';

const usePreloadedModels = () => {
  const rook = useFBX(modelPaths[0]);
  const knight = useFBX(modelPaths[1]);
  const bishop = useFBX(modelPaths[2]);
  const pawn = useFBX(modelPaths[3]);

  return [rook, knight, bishop, pawn];
};

const FloatingModel = ({
  model,
  color,
  initialPosition,
  initialRotation,
  movementSpeed,
  rotationSpeed,
}: IFloatingModelProps) => {
  const ref = useRef<Group>(null);
  const instance = useMemo(() => createColoredModel(model, color ? '#ffffff' : '#000000'), [model, color]);
  const { viewport } = useThree();

  const currentSpeed = useRef([...movementSpeed]);

  useFrame(() => {
    if (!ref.current) {
      return;
    }

    const modelSpeed = currentSpeed.current;
    if (
      ref.current.position.x <= (-viewport.width * 3.25) / 2 ||
      ref.current.position.x >= (viewport.width * 3.25) / 2
    ) {
      modelSpeed[0] *= -1;
    }
    if (ref.current.position.y <= (-viewport.height * 3) / 2 || ref.current.position.y >= (viewport.height * 3) / 2) {
      modelSpeed[1] *= -1;
    }

    ref.current.position.x += modelSpeed[0];
    ref.current.position.y += modelSpeed[1];

    ref.current.rotation.x += rotationSpeed[0];
    ref.current.rotation.y += rotationSpeed[1];
    ref.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={ref} position={initialPosition} rotation={initialRotation}>
      <primitive object={instance} scale={0.0025} />
    </group>
  );
};

const BackgroundPieces = memo(() => {
  const { viewport } = useThree();
  const models = usePreloadedModels();

  const generateRandomConfig = (): IFloatingModelState => {
    const x = (Math.random() - 0.5) * viewport.width * 3.25,
      y = (Math.random() - 0.5) * viewport.height * 3,
      z = Math.random() * 10 - 20;

    const randomRotation = (): number => Math.random() * Math.PI * 2;
    const randomSpeed = (factor: number = 1): number => (Math.random() - 0.5) * (factor / 100);

    return {
      modelIndex: Math.floor(Math.random() * models.length),
      color: Math.round(Math.random()) == 0 ? false : true,
      initialPosition: [x, y, z],
      initialRotation: [randomRotation(), randomRotation(), randomRotation()],
      movementSpeed: [randomSpeed(3), randomSpeed(3)],
      rotationSpeed: [randomSpeed(), randomSpeed(), randomSpeed()],
    };
  };

  return (
    <group>
      {Array.from({ length: 20 }).map((_, i) => {
        const config = generateRandomConfig();
        const selectedModel = models[config.modelIndex];

        return <FloatingModel key={`floating-model-${i}`} model={selectedModel} {...config} />;
      })}
    </group>
  );
});

const BackgroundScene = () => {
  return (
    <SceneContainer>
      <Canvas>
        <BackgroundPieces />
        <Lighting />
      </Canvas>
    </SceneContainer>
  );
};

BackgroundPieces.displayName = 'BackgroundPieces';
export default BackgroundScene;

const SceneContainer = tw.div`
  absolute
  left-0
  top-0
  -z-10
  h-screen
  w-screen
  bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
  from-primary
  to-transparent
`;
