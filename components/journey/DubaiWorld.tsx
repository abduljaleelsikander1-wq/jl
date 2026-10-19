"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSandTexture, createStoneTexture } from "@/lib/three/textures";
import { getDubaiWorldFrame, DUBAI_LAT, DUBAI_LON } from "@/lib/three/dubaiFrame";
import { DUBAI_LOCAL_ANCHORS } from "@/lib/data/journey";

const WATER_VERTEX = /* glsl */ `
  uniform float time;
  varying vec3 vPos;
  void main() {
    vec3 pos = position;
    pos.y += sin(pos.x * 0.9 + time * 0.8) * 0.02 + cos(pos.z * 1.3 + time * 0.6) * 0.02;
    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const WATER_FRAGMENT = /* glsl */ `
  varying vec3 vPos;
  uniform vec3 deepColor;
  uniform vec3 shallowColor;
  void main() {
    float mixF = smoothstep(-0.02, 0.03, vPos.y);
    vec3 col = mix(deepColor, shallowColor, mixF);
    gl_FragColor = vec4(col, 0.92);
  }
`;

function Water({ size = [12, 12] as [number, number] }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      deepColor: { value: new THREE.Color("#0a2d44") },
      shallowColor: { value: new THREE.Color("#2f7f8c") },
    }),
    []
  );
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.time.value = clock.getElapsedTime();
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size[0], size[1], 40, 40]} />
      <shaderMaterial
        ref={matRef}
        args={[{ vertexShader: WATER_VERTEX, fragmentShader: WATER_FRAGMENT, uniforms, transparent: true }]}
      />
    </mesh>
  );
}

function BurjKhalifaCluster({ position }: { position: [number, number, number] }) {
  const stone = useMemo(() => createStoneTexture(256, 256, 24), []);
  const towerSegments = useMemo(
    () => [
      { y: 0, h: 1.4, r: 0.42 },
      { y: 1.3, h: 1.3, r: 0.33 },
      { y: 2.5, h: 1.2, r: 0.24 },
      { y: 3.6, h: 1.1, r: 0.16 },
      { y: 4.6, h: 0.9, r: 0.09 },
      { y: 5.4, h: 0.6, r: 0.045 },
    ],
    []
  );
  const buildings = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 1.6 + (i % 3) * 0.4;
        const h = 0.3 + ((i * 37) % 10) / 10;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, h, w: 0.18 + ((i * 13) % 5) / 30 };
      }),
    []
  );

  return (
    <group position={position} scale={0.42}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#141c28" roughness={0.9} />
      </mesh>
      {towerSegments.map((s, i) => (
        <mesh key={i} position={[0, s.y + s.h / 2, 0]} castShadow>
          <cylinderGeometry args={[s.r * 0.75, s.r, s.h, 8]} />
          <meshStandardMaterial color="#c9d6dd" metalness={0.65} roughness={0.25} envMapIntensity={1.2} />
        </mesh>
      ))}
      <pointLight position={[0, 5.6, 0]} color="#fff3d6" intensity={0.8} distance={2.5} />
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial map={stone} color="#9fb3c4" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function DesertCluster({ position }: { position: [number, number, number] }) {
  const sand = useMemo(() => createSandTexture(512, 512, 32), []);
  const duneGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, 60, 60);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h = Math.sin(x * 0.5) * 0.4 + Math.cos(y * 0.4 + x * 0.2) * 0.3 + Math.sin(x * 1.3 - y * 0.7) * 0.12;
      pos.setZ(i, h);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={position} scale={0.42}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={duneGeo} receiveShadow>
        <meshStandardMaterial map={sand} color="#d6a862" roughness={1} />
      </mesh>
      {/* 4x4 safari vehicle, stylised */}
      <group position={[0.6, 0.22, 0.4]} rotation={[0, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.2, 0.26]} />
          <meshStandardMaterial color="#9a3b2b" roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.3, 0.14, 0.24]} />
          <meshStandardMaterial color="#e7e2d8" roughness={0.5} />
        </mesh>
        {[[-0.18, -0.1, 0.13], [0.18, -0.1, 0.13], [-0.18, -0.1, -0.13], [0.18, -0.1, -0.13]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
      {/* Desert camp: tent + fire glow */}
      <group position={[-0.9, 0, -0.6]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <coneGeometry args={[0.4, 0.44, 10]} />
          <meshStandardMaterial color="#8a3b3b" roughness={0.8} />
        </mesh>
        <pointLight position={[0.5, 0.08, 0.3]} color="#ff8a3d" intensity={0.5} distance={1} />
      </group>
      {/* Camels, stylised low-poly silhouette */}
      {[[-0.2, 0, 1.1], [0.1, 0, 1.3], [-0.5, 0, 1.4]].map((p, i) => (
        <group key={i} position={p as [number, number, number]} rotation={[0, i * 0.4, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
            <meshStandardMaterial color="#b6895a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.36, 0.1]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#b6895a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MarinaCluster({ position }: { position: [number, number, number] }) {
  const skyline = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ x: -1.4 + i * 0.32, h: 0.6 + ((i * 53) % 10) / 10, w: 0.16 })),
    []
  );
  return (
    <group position={position} scale={0.42}>
      <Water size={[9, 9]} />
      <group position={[-1.6, 0, -1.6]}>
        {skyline.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color="#d7c08f" emissive="#3a2a12" emissiveIntensity={0.4} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* Yacht */}
      <group position={[0.4, 0.05, 0.6]} rotation={[0, 0.3, 0]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
          <meshStandardMaterial color="#f4f1e8" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.3, 0.12, 0.14]} />
          <meshStandardMaterial color="#1c2733" roughness={0.4} metalness={0.4} />
        </mesh>
      </group>
      {/* Speedboat with wake */}
      <group position={[-0.5, 0.04, 1.2]} rotation={[0, -0.6, 0]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
          <meshStandardMaterial color="#e8e2d2" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function OldDubaiCluster({ position }: { position: [number, number, number] }) {
  const stone = useMemo(() => createStoneTexture(256, 256, 30), []);
  const buildings = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = 1.1 + (i % 2) * 0.6;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 0.35 + ((i * 29) % 6) / 10 };
      }),
    []
  );
  return (
    <group position={position} scale={0.42}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial map={stone} color="#c9ad7f" roughness={0.95} />
      </mesh>
      <group position={[0, 0.015, 0]}>
        <Water size={[1.4, 5]} />
      </group>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow>
            <boxGeometry args={[0.4, b.h, 0.4]} />
            <meshStandardMaterial map={stone} color="#d9bb86" roughness={0.9} />
          </mesh>
          {/* windtower */}
          <mesh position={[0, b.h + 0.18, 0]} castShadow>
            <boxGeometry args={[0.12, 0.3, 0.12]} />
            <meshStandardMaterial color="#c9ad7f" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function AbuDhabiCluster({ position }: { position: [number, number, number] }) {
  const skyline = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({ x: -1 + i * 0.3, h: 0.5 + ((i * 41) % 10) / 10 })),
    []
  );
  return (
    <group position={position} scale={0.42}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color="#1a2230" roughness={0.9} />
      </mesh>
      {/* Grand-mosque-inspired domes */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.5, 20]} />
          <meshStandardMaterial color="#f3efe5" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow>
          <sphereGeometry args={[0.42, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f8f5ec" roughness={0.3} metalness={0.15} />
        </mesh>
        {[[-0.7, 0], [0.7, 0], [0, -0.7], [0, 0.7]].map((p, i) => (
          <group key={i} position={[p[0], 0, p[1]]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.06, 1, 10]} />
              <meshStandardMaterial color="#f3efe5" roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.05, 0]}>
              <coneGeometry args={[0.08, 0.2, 10]} />
              <meshStandardMaterial color="#d8b55a" metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
      <group position={[0, 0, -1.8]}>
        {skyline.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2, 0]} castShadow>
            <boxGeometry args={[0.2, b.h, 0.2]} />
            <meshStandardMaterial color="#8fa4c2" emissive="#101826" emissiveIntensity={0.3} metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function DubaiWorld({ opacity }: { opacity: number }) {
  const frame = useMemo(() => getDubaiWorldFrame(), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.visible = opacity > 0.01;
    }
  });

  return (
    <group
      ref={groupRef}
      position={frame.position}
      quaternion={frame.quaternion}
      visible={opacity > 0.01}
    >
      <hemisphereLight args={["#ffe3c2", "#2a1d12", 0.5 * opacity]} />
      <directionalLight position={[5, 6, 2]} intensity={1.6 * opacity} color="#ffd8a0" castShadow />
      <BurjKhalifaCluster position={DUBAI_LOCAL_ANCHORS.burj} />
      <DesertCluster position={DUBAI_LOCAL_ANCHORS.desert} />
      <MarinaCluster position={DUBAI_LOCAL_ANCHORS.marina} />
      <OldDubaiCluster position={DUBAI_LOCAL_ANCHORS.oldDubai} />
      <AbuDhabiCluster position={DUBAI_LOCAL_ANCHORS.abuDhabi} />
    </group>
  );
}
