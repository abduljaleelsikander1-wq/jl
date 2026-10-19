"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import Globe from "./Globe";
import Markers from "./Markers";
import FlightRoutes from "./FlightRoutes";
import DubaiWorld from "./DubaiWorld";
import { getCameraPose, getWorldDubaiCrossfade, SEGMENT_COUNT } from "@/lib/three/cameraPath";
import { getDubaiWorldFrame } from "@/lib/three/dubaiFrame";
import type { Marker } from "@/lib/data/journey";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const DUBAI_UP = getDubaiWorldFrame().dir.clone();

function CameraDriver({
  targetPos,
  targetLook,
  mouse,
  parallaxStrength,
  dubaiBlend,
}: {
  targetPos: THREE.Vector3;
  targetLook: THREE.Vector3;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  parallaxStrength: number;
  dubaiBlend: number;
}) {
  const { camera, scene } = useThree();
  const fog = useRef(new THREE.FogExp2("#120a06", 0.0));
  const smoothedPos = useRef(camera.position.clone());
  const smoothedLook = useRef(new THREE.Vector3(0, 0, 0));
  const smoothedUp = useRef(WORLD_UP.clone());

  useFrame((_, delta) => {
    const parX = mouse.current.x * parallaxStrength;
    const parY = mouse.current.y * parallaxStrength * 0.6;
    const withParallax = targetPos.clone().add(new THREE.Vector3(parX, parY, 0));

    const lerpSpeed = 1 - Math.pow(0.0008, Math.min(delta, 0.1));
    smoothedPos.current.lerp(withParallax, lerpSpeed);
    smoothedLook.current.lerp(targetLook, lerpSpeed);

    const targetUp = new THREE.Vector3().lerpVectors(WORLD_UP, DUBAI_UP, dubaiBlend).normalize();
    smoothedUp.current.lerp(targetUp, lerpSpeed).normalize();

    camera.position.copy(smoothedPos.current);
    camera.up.copy(smoothedUp.current);
    camera.lookAt(smoothedLook.current);

    const isDubaiPhase = dubaiBlend > 0.5;
    fog.current.color.set(isDubaiPhase ? "#e8c08a" : "#05070c");
    fog.current.density = isDubaiPhase ? 0.032 : 0.0;
    scene.fog = isDubaiPhase ? fog.current : null;
  });

  return null;
}

function SceneContents({
  progress,
  mouse,
  onSelectMarker,
}: {
  progress: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  onSelectMarker?: (m: Marker) => void;
}) {
  const { position, lookAt, stopSpace } = getCameraPose(progress);
  const { globeOpacity, dubaiOpacity } = getWorldDubaiCrossfade(stopSpace);
  const parallaxStrength = THREE.MathUtils.lerp(0.18, 0.05, Math.min(1, stopSpace / 3));

  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 4, 6]} intensity={0.9} color="#bfe9ff" />
      <Stars radius={60} depth={40} count={2600} factor={2.2} fade speed={0.3} />
      <Globe opacity={globeOpacity} />
      <Markers stopSpace={stopSpace} globeOpacity={globeOpacity} onSelect={onSelectMarker} />
      <FlightRoutes stopSpace={stopSpace} globeOpacity={globeOpacity} />
      <DubaiWorld opacity={dubaiOpacity} />
      <CameraDriver
        targetPos={position}
        targetLook={lookAt}
        mouse={mouse}
        parallaxStrength={parallaxStrength}
        dubaiBlend={dubaiOpacity}
      />
    </>
  );
}

export default function Scene({
  progress,
  lowTier,
  onSelectMarker,
}: {
  progress: number;
  lowTier: boolean;
  onSelectMarker?: (m: Marker) => void;
}) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: PointerEvent) {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const dpr = useMemo<[number, number]>(() => (lowTier ? [0.75, 1] : [1, 1.8]), [lowTier]);

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: !lowTier, powerPreference: "high-performance" }}
      camera={{ fov: 42, near: 0.05, far: 100, position: [0, 0, 8] }}
    >
      <SceneContents progress={progress} mouse={mouse} onSelectMarker={onSelectMarker} />
    </Canvas>
  );
}

export { SEGMENT_COUNT };
