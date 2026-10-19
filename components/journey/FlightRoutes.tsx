"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { WORLD_MARKERS, DUBAI_MARKER } from "@/lib/data/journey";
import { greatCircleArc } from "@/lib/three/geo";
import { GLOBE_R } from "@/lib/three/dubaiFrame";

function visibilityFor(revealAt: number, stopSpace: number) {
  if (stopSpace < revealAt - 0.1) return 0;
  return Math.max(0, Math.min(1, (stopSpace - (revealAt - 0.1)) / 0.6));
}

function RouteArc({ points, opacity, speedOffset }: { points: THREE.Vector3[]; opacity: number; speedOffset: number }) {
  const dotRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.2), [points]);

  useFrame(({ clock }) => {
    if (!dotRef.current) return;
    const t = (clock.getElapsedTime() * 0.12 + speedOffset) % 1;
    const p = curve.getPointAt(t);
    dotRef.current.position.copy(p);
    dotRef.current.visible = opacity > 0.03;
  });

  if (opacity < 0.02) return null;

  return (
    <group>
      <Line points={points} color="#e8c37a" lineWidth={1} transparent opacity={opacity * 0.55} toneMapped={false} />
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#fff3d6" transparent opacity={opacity} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function FlightRoutes({ stopSpace, globeOpacity }: { stopSpace: number; globeOpacity: number }) {
  const routes = useMemo(
    () =>
      WORLD_MARKERS.map((m, i) => ({
        marker: m,
        points: greatCircleArc(m.lat, m.lon, DUBAI_MARKER.lat, DUBAI_MARKER.lon, GLOBE_R, 48, 0.22),
        speedOffset: i / WORLD_MARKERS.length,
      })),
    []
  );

  if (globeOpacity < 0.02) return null;

  return (
    <group>
      {routes.map((r) => (
        <RouteArc
          key={r.marker.id}
          points={r.points}
          opacity={visibilityFor(r.marker.revealAt, stopSpace) * globeOpacity}
          speedOffset={r.speedOffset}
        />
      ))}
    </group>
  );
}
