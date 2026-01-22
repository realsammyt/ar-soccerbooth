import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Text3D, Center, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { usePoseStore } from '../store/poseStore';
import { PoseAvatar } from './avatar';

// Scale factors for pose to world coordinate conversion
const SCALE = {
  X: 4,
  Y: 4,
  Z: 2,
};

/**
 * Convert MediaPipe landmark to Three.js world position
 */
function landmarkToWorld(
  landmark: { x: number; y: number; z: number }
): THREE.Vector3 {
  const x = (landmark.x - 0.5) * SCALE.X;
  const y = -(landmark.y - 0.5) * SCALE.Y;
  const z = -landmark.z * SCALE.Z;
  return new THREE.Vector3(x, y, z);
}

/**
 * Soccer ball that follows a hand
 */
function SoccerBall() {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const poseData = usePoseStore((s) => s.poseData);

  useFrame(() => {
    if (!meshRef.current || !poseData?.poseLandmarks) return;

    // Track right wrist (landmark 16)
    const rightWrist = poseData.poseLandmarks[16];
    if (rightWrist && (rightWrist.visibility ?? 0) > 0.5) {
      const worldPos = landmarkToWorld(rightWrist);
      worldPos.y += 0.3; // Offset above hand
      targetRef.current.lerp(worldPos, 0.15);
    }

    meshRef.current.position.copy(targetRef.current);
    meshRef.current.rotation.x += 0.02;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Confetti effect around the user
 */
function Confetti() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Vector3[]>([]);
  const velocitiesRef = useRef<THREE.Vector3[]>([]);

  // Initialize particles
  if (particlesRef.current.length === 0) {
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 4,
          (Math.random() - 0.5) * 2
        )
      );
      velocitiesRef.current.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          -Math.random() * 0.03 - 0.01,
          (Math.random() - 0.5) * 0.02
        )
      );
    }
  }

  useFrame(() => {
    if (!groupRef.current) return;

    // Update particles
    groupRef.current.children.forEach((child, i) => {
      const pos = particlesRef.current[i];
      const vel = velocitiesRef.current[i];

      pos.add(vel);

      // Reset if below screen
      if (pos.y < -3) {
        pos.y = 3;
        pos.x = (Math.random() - 0.5) * 4;
      }

      child.position.copy(pos);
      child.rotation.x += 0.05;
      child.rotation.y += 0.03;
    });
  });

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9d56e', '#ff8a5b'];

  return (
    <group ref={groupRef}>
      {particlesRef.current.map((_, i) => (
        <mesh key={i} position={particlesRef.current[i]}>
          <boxGeometry args={[0.05, 0.05, 0.01]} />
          <meshStandardMaterial
            color={colors[i % colors.length]}
            emissive={colors[i % colors.length]}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Floating text above user
 */
function FloatingText() {
  const groupRef = useRef<THREE.Group>(null);
  const poseData = usePoseStore((s) => s.poseData);

  useFrame((state) => {
    if (!groupRef.current || !poseData?.poseLandmarks) return;

    // Position above head (nose landmark 0)
    const nose = poseData.poseLandmarks[0];
    if (nose && (nose.visibility ?? 0) > 0.5) {
      const worldPos = landmarkToWorld(nose);
      worldPos.y += 1.2; // Above head
      groupRef.current.position.lerp(worldPos, 0.1);
    }

    // Subtle float animation
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <Center>
        <Text3D
          font="./fonts/helvetiker_bold.typeface.json"
          size={0.3}
          height={0.05}
          curveSegments={12}
        >
          GOAL!
          <meshStandardMaterial
            color="#ffc107"
            metalness={0.6}
            roughness={0.2}
            emissive="#ff9800"
            emissiveIntensity={0.3}
          />
        </Text3D>
      </Center>
    </group>
  );
}

/**
 * Stadium field lines decoration
 */
function FieldLines() {
  return (
    <group position={[0, -1.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Center circle */}
      <mesh>
        <ringGeometry args={[1.8, 1.9, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Center line */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.08, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Penalty box */}
      <mesh position={[0, -2.5, 0]}>
        <planeGeometry args={[4, 0.08]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-2, -3.5, 0]}>
        <planeGeometry args={[0.08, 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[2, -3.5, 0]}>
        <planeGeometry args={[0.08, 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Main stadium scene with soccer elements and pose-driven avatar
 */
export function StadiumScene() {
  const isTracking = usePoseStore((s) => s.isTracking);

  return (
    <>
      {/* Enhanced Lighting for better visual fidelity */}
      <ambientLight intensity={0.3} />

      {/* Main key light (stadium floodlight simulation) */}
      <directionalLight
        position={[5, 12, 8]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Fill lights for depth */}
      <directionalLight
        position={[-8, 8, -5]}
        intensity={0.4}
        color="#87CEEB"
      />

      {/* Colored accent lights (stadium atmosphere) */}
      <pointLight position={[-4, 6, 4]} intensity={0.8} color="#4fc3f7" distance={15} decay={2} />
      <pointLight position={[4, 6, -4]} intensity={0.8} color="#ff9800" distance={15} decay={2} />
      <pointLight position={[0, 3, 6]} intensity={0.5} color="#9c27b0" distance={12} decay={2} />

      {/* Rim light for avatar outline */}
      <spotLight
        position={[0, 8, -8]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.2}
        color="#ffffff"
        castShadow={false}
      />

      {/* Environment (stadium-like lighting) - using local HDR for offline kiosk */}
      <Environment files="./hdri/potsdamer_platz_1k.hdr" background={false} />

      {/* Ground plane with grass texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1b5e20"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Field lines */}
      <FieldLines />

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, -1.95, 0]}
        opacity={0.5}
        scale={12}
        blur={2.5}
        far={5}
        color="#000000"
      />

      {/* Sparkle particles for atmosphere */}
      <Sparkles
        count={100}
        scale={[8, 6, 8]}
        position={[0, 1, 0]}
        size={2}
        speed={0.3}
        opacity={0.4}
        color="#ffd700"
      />

      {/* POSE-DRIVEN 3D AVATAR */}
      {isTracking && (
        <PoseAvatar
          avatarType="skeleton"
          position={[0, 0, 0]}
          scale={1.0}
          visibilityThreshold={0.5}
        />
      )}

      {/* Interactive elements - only when tracking */}
      {isTracking && (
        <>
          <SoccerBall />
          <Confetti />
          <FloatingText />
        </>
      )}

      {/* Stadium goal posts (background decoration) */}
      <group position={[0, 0, -5]}>
        {/* Left post */}
        <mesh position={[-2, 1, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Right post */}
        <mesh position={[2, 1, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Crossbar */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 4, 16]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Net (simplified mesh) */}
        <mesh position={[0, 1, -0.5]}>
          <planeGeometry args={[4, 2.4]} />
          <meshStandardMaterial
            color="#cccccc"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>
      </group>

      {/* Stadium crowd blur (background depth) */}
      <mesh position={[0, 2, -10]} rotation={[0, 0, 0]}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial
          color="#1a1a2e"
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}
