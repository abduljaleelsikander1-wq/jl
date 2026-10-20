"use client";

import Link from "next/link";
import { STOPS } from "@/lib/data/journey";
import { stopVisibility } from "@/lib/three/cameraPath";

export default function SectionCopy({ stopSpace }: { stopSpace: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
      <div className="mx-auto w-full max-w-5xl px-6 md:px-12">
        {STOPS.map((stop, i) => {
          const vis = stopVisibility(stopSpace, i);
          if (vis < 0.03) return null;
          return (
            <div
              key={stop.id}
              className="absolute inset-x-0 px-6 md:px-12 transition-none"
              style={{
                opacity: vis,
                transform: `translateY(${(1 - vis) * 18}px)`,
              }}
            >
              {stop.eyebrow && (
                <p className="mb-3 text-xs md:text-sm uppercase tracking-wide2 text-cyan-glow/90 font-body">
                  {stop.eyebrow}
                </p>
              )}
              <h2 className="font-display text-4xl md:text-7xl leading-[1.05] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                {stop.title}
              </h2>
              {stop.body && (
                <p className="mt-5 max-w-xl text-base md:text-lg text-white/80 font-body">{stop.body}</p>
              )}
              {stop.cta && (
                <div className="pointer-events-auto mt-8">
                  <Link
                    href={stop.cta.href}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-black/30 px-6 py-3 text-sm uppercase tracking-wide2 text-gold backdrop-blur transition hover:bg-gold hover:text-ink"
                  >
                    {stop.cta.label}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
