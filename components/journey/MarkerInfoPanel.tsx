"use client";

import Link from "next/link";
import type { Marker } from "@/lib/data/journey";

const BLURBS: Record<string, string> = {
  dubai: "Your destination. A modern city of record-breaking towers, golden desert, and the Arabian Gulf, all within a short drive of each other.",
  usa: "Direct and one-stop flights connect major US hubs to Dubai in roughly 13–16 hours.",
  canada: "Toronto and Vancouver both connect to Dubai with a single convenient stop.",
  uk: "One of Dubai's best-connected markets — multiple daily non-stop flights from London alone.",
  ireland: "Dublin links to Dubai with a short connection through London or the Gulf.",
  france: "Paris to Dubai is a direct, same-day flight of around 7 hours.",
  germany: "Frankfurt, Munich, and Berlin all fly non-stop to Dubai.",
  italy: "Rome and Milan connect directly to Dubai in roughly 6 hours.",
  spain: "Madrid and Barcelona reach Dubai with direct or one-stop options.",
  netherlands: "Amsterdam to Dubai is a direct flight of around 7 hours.",
  switzerland: "Zurich and Geneva both offer direct service to Dubai.",
  india: "Over a dozen Indian cities fly direct to Dubai — one of the shortest, most frequent routes on this journey.",
  indonesia: "Jakarta connects to Dubai with convenient one-stop itineraries.",
  singapore: "A direct flight from Singapore reaches Dubai in around 7 hours.",
  malaysia: "Kuala Lumpur links directly to Dubai in roughly 7 hours.",
  australia: "Sydney, Melbourne, and Perth all connect to Dubai, several of them non-stop.",
};

export default function MarkerInfoPanel({ marker, onClose }: { marker: Marker | null; onClose: () => void }) {
  if (!marker) return null;
  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 z-20 w-[min(340px,calc(100vw-3rem))] rounded-2xl border border-white/10 bg-ink/85 p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl text-white">{marker.name}</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-full p-1 text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 text-sm text-white/75 font-body">{BLURBS[marker.id] ?? "Part of the journey to Dubai."}</p>
      <Link
        href="/#experiences"
        className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-wide2 text-cyan-glow hover:text-white"
      >
        View experiences →
      </Link>
    </div>
  );
}
