
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, ContactShadows, useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { AppState, GestureType } from '../types';
import { HOLOGRAPHIC_COLORS } from '../constants';

interface SceneProps {
  appState: AppState;
  handPosRef: React.MutableRefObject<{ x: number; y: number }>;
}

const InteractiveObject: React.FC<SceneProps> = ({ appState, handPosRef }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (appState.assetType === 'image' && appState.assetUrl) {
      new THREE.TextureLoader().load(appState.assetUrl, (t) => {
        setTexture(t);
      });
    }
  }, [appState.assetType, appState.assetUrl]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const { x, y } = handPosRef.current;
    
    // Snappier mapping to screen coordinates
    const targetX = (x - 0.5) * 14; 
    const targetY = -(y - 0.5) * 12;

    switch (appState.gesture) {
      case GestureType.PUNCH:
        // High speed lerp for direct feel
        meshRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), 0.3);
        break;
      case GestureType.OPEN:
        // Manual rotation feels more direct with higher sensitivity
        meshRef.current.rotation.y += (x - 0.5) * 0.25;
        meshRef.current.rotation.x += (y - 0.5) * 0.25;
        break;
      case GestureType.PINCH:
        // Precise zoom snappiness
        const scaleVal = 1 + (0.5 - y) * 3;
        const clampedScale = Math.max(0.4, Math.min(5, scaleVal));
        meshRef.current.scale.lerp(new THREE.Vector3(clampedScale, clampedScale, clampedScale), 0.25);
        break;
      case GestureType.TWO_FINGERS:
        meshRef.current.rotation.y += 5 * delta;
        break;
      case GestureType.THREE_FINGERS:
        meshRef.current.rotation.x += 5 * delta;
        break;
      default:
        // Smooth return to idle
        meshRef.current.rotation.y += 0.5 * delta;
        meshRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
    }
  });

  const renderAsset = () => {
    if (appState.assetType === 'model' && appState.assetUrl) {
      return <Model assetUrl={appState.assetUrl} appState={appState} />;
    }

    if (texture) {
      const materialProps = appState.isHolographic ? {
        transparent: true,
        opacity: appState.opacity,
        color: HOLOGRAPHIC_COLORS[appState.holographicColor],
        wireframe: true,
        emissive: HOLOGRAPHIC_COLORS[appState.holographicColor],
        emissiveIntensity: 2.0
      } : {
        transparent: true,
        opacity: appState.opacity,
        map: texture
      };

      return (
        <mesh>
          <boxGeometry args={[4, 4, appState.addDepth ? 0.8 : 0.01]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    }

    return (
      <mesh>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshStandardMaterial 
          color={appState.isHolographic ? HOLOGRAPHIC_COLORS[appState.holographicColor] : "#0ef"} 
          wireframe={appState.isHolographic}
          transparent={appState.isHolographic}
          opacity={appState.opacity}
          emissive={appState.isHolographic ? HOLOGRAPHIC_COLORS[appState.holographicColor] : "black"}
          emissiveIntensity={1.0}
        />
      </mesh>
    );
  };

  return (
    <group ref={meshRef}>
      <Float speed={3} rotationIntensity={0.4} floatIntensity={0.4}>
        {renderAsset()}
      </Float>
    </group>
  );
};

const Model = ({ assetUrl, appState }: { assetUrl: string; appState: AppState }) => {
  const { scene } = useGLTF(assetUrl);
  
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (appState.isHolographic) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: HOLOGRAPHIC_COLORS[appState.holographicColor],
            wireframe: true,
            transparent: true,
            opacity: appState.opacity,
            emissive: HOLOGRAPHIC_COLORS[appState.holographicColor],
            emissiveIntensity: 1.5
          });
        }
      }
    });
  }, [scene, appState.isHolographic, appState.holographicColor, appState.opacity]);

  return <primitive object={scene} scale={2} />;
};

const Scene: React.FC<SceneProps> = ({ appState, handPosRef }) => {
  return (
    <Canvas 
      gl={{ antialias: false, powerPreference: 'high-performance' }} // Optimize GL
      camera={{ position: [0, 0, 10], fov: 45 }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#0ef" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
      <InteractiveObject appState={appState} handPosRef={handPosRef} />
      <ContactShadows position={[0, -4.5, 0]} opacity={0.3} scale={20} blur={2} far={4.5} />
      <OrbitControls enableZoom={false} enableRotate={false} />
    </Canvas>
  );
};

export default Scene;
