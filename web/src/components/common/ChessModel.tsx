'use client';

import { forwardRef, useMemo } from 'react';

import { useFBX } from '@react-three/drei';
import { Group, Material, Mesh } from 'three';

import { createColoredModel } from '@/lib/utils/model';

export interface IChessModelProps {
  modelPath: string;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const ChessModel = forwardRef<Group, IChessModelProps>(
  ({ modelPath, color, position = [0, 0, 0], rotation = [0, 0, 0], scale = 0.005 }, ref) => {
    const model = useFBX(modelPath);
    const instance = useMemo(() => {
      const coloredModel = createColoredModel(model.clone(), color);

      model.traverse(child => {
        if (child instanceof Mesh && child.material instanceof Material) {
          child.material.dispose();
        }
      });

      return coloredModel;
    }, [model, color]);

    return (
      <group ref={ref} position={position} rotation={rotation}>
        <primitive object={instance} scale={scale} />
      </group>
    );
  }
);

ChessModel.displayName = 'ChessModel';
export default ChessModel;
