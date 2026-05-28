import { Environment } from '@react-three/drei';

const Lighting = () => {
  return (
    <group>
      <directionalLight position={[6, 8, 5]} intensity={2.2} color="#f4e7d3" />
      <directionalLight position={[-6, 3, 2]} intensity={0.45} color="#abc3e7ff" />
      <ambientLight intensity={0.08} color="#8fa3c7" />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#ffffff" />
      <Environment preset="warehouse" />
    </group>
  );
};

export default Lighting;
