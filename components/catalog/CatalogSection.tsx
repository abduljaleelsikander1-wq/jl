import Link from "next/link";
import CategoryIcon from "./CategoryIcon";
import ExperienceCard from "./ExperienceCard";
import { CATEGORIES, EXPERIENCES, categoryBySlug } from "@/lib/data/experiences";

export default function CatalogSection() {
  const featured = EXPERIENCES.slice(0, 9);

  return (
    <section id="experiences" className="relative bg-ink px-6 py-24 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
            YOUR DUBAI
            <br />
            EXPERIENCE STARTS HERE.
          </h1>
          <p className="mt-5 text-lg text-white/70">
            Discover unforgettable experiences across Dubai and the UAE — from desert
            safaris and yacht cruises to Old Dubai heritage tours and Abu Dhabi day trips.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#catalog"
              className="rounded-full bg-gold px-7 py-3 text-sm uppercase tracking-wide2 text-ink transition hover:bg-sand"
            >
              Explore Experiences
            </a>
            <Link
              href="/plan-your-trip"
              className="rounded-full border border-white/25 px-7 py-3 text-sm uppercase tracking-wide2 text-white/90 transition hover:border-gold hover:text-gold"
            >
              Plan Your Trip
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center transition hover:border-gold/50 hover:bg-white/[0.05]"
            >
              <CategoryIcon icon={cat.icon} className="h-8 w-8 text-cyan-glow/80 transition group-hover:text-gold" />
              <span className="text-xs font-medium uppercase tracking-wide2 text-white/85">{cat.name}</span>
              <span className="text-[11px] text-white/50">{cat.tagline}</span>
            </Link>
          ))}
        </div>

        <div id="catalog" className="mt-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl text-white md:text-3xl">Popular right now</h2>
            <Link href="/experiences" className="text-xs uppercase tracking-wide2 text-cyan-glow hover:text-white">
              View all experiences →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((exp) => (
              <ExperienceCard key={exp.slug} experience={exp} category={categoryBySlug(exp.categorySlug)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
