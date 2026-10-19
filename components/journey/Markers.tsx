"use client";

import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { WORLD_MARKERS, DUBAI_MARKER, markerPosition, type Marker } from "@/lib/data/journey";

type MarkersProps = {
  stopSpace: number;
  globeOpacity: number;
  onSelect?: (marker: Marker) => void;
};

function visibilityFor(marker: Marker, stopSpace: number) {
  if (stopSpace < marker.revealAt - 0.15) return 0;
  const fadeIn = Math.min(1, (stopSpace - (marker.revealAt - 0.15)) / 0.5);
  return Math.max(0, Math.min(1, fadeIn));
}

export default function Markers({ stopSpace, globeOpacity, onSelect }: MarkersProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allMarkers = useMemo(() => [DUBAI_MARKER, ...WORLD_MARKERS], []);

  if (globeOpacity < 0.02) return null;

  return (
    <group>
      {allMarkers.map((marker) => {
        const vis = visibilityFor(marker, stopSpace) * globeOpacity;
        if (vis < 0.02) return null;
        const pos = markerPosition(marker);
        const isDubai = marker.id === "dubai";
        const isHovered = hoveredId === marker.id;
        const color = isDubai ? "#e8c37a" : "#7fe6ec";
        return (
          <group key={marker.id} position={pos}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(marker.id);
              }}
              onPointerOut={() => setHoveredId((id) => (id === marker.id ? null : id))}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(marker);
              }}
              scale={isHovered ? 1.8 : 1}
            >
              <sphereGeometry args={[isDubai ? 0.028 : 0.016, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={vis} toneMapped={false} />
            </mesh>
            <pointLight color={color} intensity={isDubai ? 0.25 : 0.08} distance={0.25} />
            {(isHovered || isDubai) && vis > 0.4 && (
              <Html occlude={false} zIndexRange={[10, 0]}>
                <div
                  className="pointer-events-none select-none whitespace-nowrap rounded-full border border-cyan-glow/30 bg-ink/80 px-3 py-1 text-[10px] uppercase tracking-wide2 text-white/90 backdrop-blur"
                  style={{ opacity: vis, transform: "translate(-50%, -140%)" }}
                >
                  {marker.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
