import Link from "next/link";
import { STOPS } from "@/lib/data/journey";

/**
 * Static, no-motion version of the world-to-Dubai journey for prefers-reduced-motion.
 * Same copy and structure as the animated experience, rendered as plain stacked sections.
 */
export default function ReducedMotionJourney() {
  return (
    <div className="bg-ink">
      {STOPS.map((stop) => (
        <section
          key={stop.id}
          className="flex min-h-[70vh] flex-col items-start justify-center border-b border-white/5 px-6 py-20 md:px-16"
        >
          {stop.eyebrow && (
            <p className="mb-3 text-xs md:text-sm uppercase tracking-wide2 text-cyan-glow/90">{stop.eyebrow}</p>
          )}
          <h2 className="font-display text-3xl md:text-6xl leading-tight text-white">{stop.title}</h2>
          {stop.body && <p className="mt-5 max-w-xl text-base md:text-lg text-white/75">{stop.body}</p>}
          {stop.cta && (
            <Link
              href={stop.cta.href}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/60 px-6 py-3 text-sm uppercase tracking-wide2 text-gold hover:bg-gold hover:text-ink"
            >
              {stop.cta.label}
            </Link>
          )}
        </section>
      ))}
    </div>
  );
}
