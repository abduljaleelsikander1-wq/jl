"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import SectionCopy from "./SectionCopy";
import MarkerInfoPanel from "./MarkerInfoPanel";
import ReducedMotionJourney from "./ReducedMotionJourney";
import { SEGMENT_COUNT } from "@/lib/three/cameraPath";
import { STOPS, type Marker } from "@/lib/data/journey";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function useLowTierDevice() {
  const [lowTier, setLowTier] = useState(false);
  useEffect(() => {
    const cores = (navigator as any).hardwareConcurrency || 4;
    const mem = (navigator as any).deviceMemory || 4;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    setLowTier(coarsePointer && (cores <= 4 || mem <= 4));
  }, []);
  return lowTier;
}

export default function JourneyExperience() {
  const reducedMotion = useReducedMotion();
  const lowTier = useLowTierDevice();
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Marker | null>(null);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (reducedMotion || !ready) return;
    let raf = 0;
    const tick = () => {
      const el = trackRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
        setProgress((prev) => (Math.abs(prev - p) > 0.0006 ? p : prev));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, ready]);

  if (reducedMotion) {
    return <ReducedMotionJourney />;
  }

  const stopSpace = progress * SEGMENT_COUNT;
  const trackHeightVh = (SEGMENT_COUNT + 0.6) * 100;
  const firstStop = STOPS[0];

  return (
    <div ref={trackRef} className="relative" style={{ height: `${trackHeightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {ready ? (
          <Scene progress={progress} lowTier={lowTier} onSelectMarker={setSelected} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070c] via-[#070b12] to-[#0a1220]" />
        )}
        <SectionCopy stopSpace={stopSpace} />
        <MarkerInfoPanel marker={selected} onClose={() => setSelected(null)} />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
            <div className="mx-auto w-full max-w-5xl px-6 md:px-12">
              <h2 className="font-display text-4xl md:text-7xl text-white">{firstStop.title}</h2>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center gap-1.5">
          {STOPS.map((s, i) => (
            <span
              key={s.id}
              className="h-1 w-6 rounded-full bg-white/20 transition-colors"
              style={{ backgroundColor: Math.abs(stopSpace - i) < 0.5 ? "#c9a24b" : undefined }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
