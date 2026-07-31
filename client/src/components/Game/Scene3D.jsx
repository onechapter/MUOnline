import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

function PlayerModel({ position }) {
  const meshRef = useRef();
  const targetPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));

  useEffect(() => {
    targetPos.current.set(position[0], position[1], position[2]);
  }, [position]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos.current, 0.1);
      meshRef.current.position.y += Math.sin(clock.getElapsedTime() * 2) * 0.002;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>
    </group>
  );
}

function MonsterModel({ monster, onSelect }) {
  const color = monster.isBoss ? '#ff4444' : '#8b0000';
  const scale = monster.isBoss ? 2 : 1;
  const pos = useMemo(() => [monster.position.x / 8, 1, monster.position.z / 8], [monster.position.x, monster.position.z]);

  return (
    <group position={pos} scale={scale}>
      <mesh castShadow onClick={(e) => { e.stopPropagation(); onSelect(monster); }}>
        <boxGeometry args={[0.8, 1.4, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html
        position={[0, -1.2, 0]}
        center
        style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#fff',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <div>{monster.name} Lv.{monster.level}</div>
        <div style={{ color: '#f44', fontSize: '9px' }}>
          HP: {monster.currentHP}/{monster.hp}
        </div>
      </Html>
    </group>
  );
}

function NPCModel({ npc }) {
  const pos = useMemo(() => [npc.position.x / 8, 1, npc.position.z / 8], [npc.position.x, npc.position.z]);
  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshStandardMaterial color="#44ff44" />
      </mesh>
      <Html
        position={[0, -1.2, 0]}
        center
        style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#4f4',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {npc.name}
      </Html>
    </group>
  );
}

function GroundItem({ item }) {
  const pos = useMemo(() => [item.position.x / 8, 0.3, item.position.z / 8], [item.position.x, item.position.z]);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#664400" />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh receiveShadow>
      <planeGeometry args={[256, 256]} />
      <meshStandardMaterial color="#2d5a27" />
    </mesh>
  );
}

function Scene3D({ monsters, npcs, itemsOnGround, playerPosition, onSelectMonster }) {
  const controlsRef = useRef();
  const scaledPos = useMemo(
    () => [playerPosition.x / 8, 0, playerPosition.z / 8],
    [playerPosition.x, playerPosition.z]
  );

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.target.lerp(
        new THREE.Vector3(scaledPos[0], scaledPos[1], scaledPos[2]),
        0.05
      );
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={60} />
      <OrbitControls ref={controlsRef} enableZoom enableRotate />
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 40, 20]} intensity={1.2} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.3} />
      <Ground />
      <PlayerModel position={scaledPos} />
      {monsters && monsters.map((m) => (
        <MonsterModel key={m.instanceId} monster={m} onSelect={onSelectMonster} />
      ))}
      {npcs && npcs.map((n) => (
        <NPCModel key={n.npcId} npc={n} />
      ))}
      {itemsOnGround && itemsOnGround.map((item) => (
        <GroundItem key={item.instanceId} item={item} />
      ))}
    </>
  );
}

export default Scene3D;
