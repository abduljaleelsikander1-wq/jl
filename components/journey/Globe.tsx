"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createEarthTextures } from "@/lib/three/textures";
import { GLOBE_R } from "@/lib/three/dubaiFrame";

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  uniform vec3 color;
  uniform float intensity;
  void main() {
    float rim = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
    gl_FragColor = vec4(color, rim * intensity);
  }
`;

export default function Globe({ opacity }: { opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const atmosMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const { map, emissiveMap } = useMemo(() => createEarthTextures(2048, 1024), []);

  const atmosphereUniforms = useMemo(
    () => ({
      color: { value: new THREE.Color("#6fe3ea") },
      intensity: { value: 1.0 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.018;
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity;
      materialRef.current.emissiveIntensity = 1.1;
    }
    if (atmosMaterialRef.current) {
      atmosMaterialRef.current.uniforms.intensity.value = opacity * 1.0;
    }
    if (groupRef.current) {
      groupRef.current.visible = opacity > 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[GLOBE_R, 96, 96]} />
        <meshStandardMaterial
          ref={materialRef}
          map={map}
          emissiveMap={emissiveMap}
          emissive={new THREE.Color("#78e3eb")}
          emissiveIntensity={1.1}
          roughness={0.85}
          metalness={0.05}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[GLOBE_R, 64, 64]} />
        <shaderMaterial
          ref={atmosMaterialRef}
          args={[
            {
              vertexShader: ATMOSPHERE_VERTEX,
              fragmentShader: ATMOSPHERE_FRAGMENT,
              uniforms: atmosphereUniforms,
              transparent: true,
              side: THREE.BackSide,
              depthWrite: false,
            },
          ]}
        />
      </mesh>
    </group>
  );
}
