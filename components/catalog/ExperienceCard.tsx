import Link from "next/link";
import CategoryIcon from "./CategoryIcon";
import type { Experience, Category } from "@/lib/data/experiences";

export default function ExperienceCard({ experience, category }: { experience: Experience; category?: Category }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-gold/40 hover:bg-white/[0.05]">
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-dusk via-ink to-[#2a1d12]">
        <CategoryIcon icon={category?.icon ?? "compass"} className="h-14 w-14 text-gold/70" />
        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[10px] uppercase tracking-wide2 text-white/80 backdrop-blur">
          {category?.name ?? "Experience"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg text-white">{experience.title}</h3>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <dt className="sr-only">Location</dt>
            <dd>{experience.location}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Duration</dt>
            <dd>{experience.duration}</dd>
          </div>
        </dl>
        <p className="text-sm text-white/70">{experience.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="text-sm text-white/90">
            From <span className="font-display text-lg text-gold">AED {experience.priceFromAed}</span>
            <span className="text-white/50"> /person</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/experiences/${experience.slug}`}
            className="flex-1 rounded-full border border-white/20 px-4 py-2 text-center text-xs uppercase tracking-wide2 text-white/85 transition hover:border-gold hover:text-gold"
          >
            View Experience
          </Link>
          <Link
            href={`/experiences/${experience.slug}#book`}
            className="flex-1 rounded-full bg-gold px-4 py-2 text-center text-xs uppercase tracking-wide2 text-ink transition hover:bg-sand"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
