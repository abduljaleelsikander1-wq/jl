import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs, { SITE_URL } from "@/components/seo/Breadcrumbs";
import { CATEGORIES } from "@/lib/data/experiences";

export const metadata: Metadata = {
  title: "Plan Your Dubai Trip",
  description: "Build your Dubai itinerary: desert safaris, city tours, Abu Dhabi day trips, airport transfers, and more, tailored to how long you're staying.",
  alternates: { canonical: `${SITE_URL}/plan-your-trip` },
};

const DAY_PLANS = [
  { days: "1–2 days", focus: "Burj Khalifa, Dubai Marina, and one evening desert safari." },
  { days: "3–4 days", focus: "Add Old Dubai & the Creek, a yacht sunset cruise, and a day trip to Abu Dhabi." },
  { days: "5+ days", focus: "Everything above, plus water sports, a private tour day, and time to simply enjoy the beach." },
];

export default function PlanYourTripPage() {
  return (
    <div className="bg-ink px-6 py-28 md:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Plan Your Trip", href: "/plan-your-trip" }]} />
        <h1 className="font-display text-3xl text-white md:text-5xl">Plan Your Dubai Trip</h1>
        <p className="mt-5 max-w-2xl text-white/75">
          Not sure where to start? Here&rsquo;s how most travellers split their time between
          Dubai and Abu Dhabi, by trip length.
        </p>

        <div className="mt-10 space-y-6">
          {DAY_PLANS.map((p) => (
            <div key={p.days} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="font-display text-xl text-gold">{p.days}</h2>
              <p className="mt-2 text-white/75">{p.focus}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-display text-2xl text-white">Browse by category</h2>
        <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-12">
          <a
            href="https://wa.me/971000000000"
            className="inline-flex rounded-full bg-[#25D366] px-7 py-3 text-sm uppercase tracking-wide2 text-ink"
          >
            Talk to a trip planner on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
