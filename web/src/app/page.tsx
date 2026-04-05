'use client';

import { Canvas } from '@react-three/fiber';

import ChessModel from '@/components/common/ChessModel';
import Lighting from '@/components/common/Lighting';
import Options from '@/components/landing/Options';
import JoinRoom from '@/components/modals/JoinRoom';

import { useAppSelector } from '@/redux/hooks';

export default function Home() {
  const activeModal = useAppSelector(state => state.modals);
  const user = useAppSelector(state => state.user);
  const isLoggedIn = user !== null;

  return (
    <>
      <Canvas>
        <ChessModel
          modelPath="models/king.fbx"
          color="#000000"
          position={[0.2, 0.7, 0]}
          rotation={[0, 0, 0.8]}
          scale={0.003}
        />
        <ChessModel
          modelPath="models/queen.fbx"
          color="#ffffff"
          position={[-0.2, 0.7, 0.25]}
          rotation={[0, 0, -0.8]}
          scale={0.003}
        />
        <Lighting />
      </Canvas>
      {isLoggedIn && activeModal === 'joinRoom' && <JoinRoom />}
      <Options />
    </>
  );
}
