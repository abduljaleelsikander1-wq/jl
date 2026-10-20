import type { Metadata } from "next";
import Link from "next/link";
import ExperienceCard from "@/components/catalog/ExperienceCard";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { CATEGORIES, EXPERIENCES, categoryBySlug } from "@/lib/data/experiences";
import { SITE_URL } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "All Dubai Experiences & Tours",
  description:
    "Browse every Dubai and Abu Dhabi tour, desert safari, yacht charter, and activity offered by Aurora Dubai.",
  alternates: { canonical: `${SITE_URL}/experiences` },
};

export default function AllExperiencesPage() {
  return (
    <div className="bg-ink px-6 py-28 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Experiences", href: "/experiences" }]} />
        <h1 className="font-display text-3xl text-white md:text-5xl">All Dubai Experiences</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Every desert safari, city tour, Abu Dhabi day trip, and activity we offer, in one
          place.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-wide2 text-white/75 hover:border-gold hover:text-gold"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map((exp) => (
            <ExperienceCard key={exp.slug} experience={exp} category={categoryBySlug(exp.categorySlug)} />
          ))}
        </div>
      </div>
    </div>
  );
}
