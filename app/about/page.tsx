import type { Metadata } from "next";
import Breadcrumbs, { SITE_URL } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us",
  description: "Aurora Dubai is a Dubai-based tourism company curating desert, sea, and city experiences across the UAE for international travellers.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="bg-ink px-6 py-28 md:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
        <h1 className="font-display text-3xl text-white md:text-5xl">About Aurora Dubai</h1>
        <p className="mt-6 text-white/75">
          Aurora Dubai is a Dubai-based tourism company built around one idea: wherever
          you&rsquo;re travelling from, your next adventure can start in the UAE. We design and
          operate desert safaris, city tours, Abu Dhabi day trips, yacht charters, and
          private transfers for travellers arriving from across North America, Europe, South
          Asia, Southeast Asia, and Australia.
        </p>
        <p className="mt-4 text-white/75">
          Our local guides, vetted drivers, and desert and marine partners let us offer the
          same experience whether you&rsquo;re booking a quick half-day city tour or a full
          multi-day itinerary across Dubai and Abu Dhabi.
        </p>
      </div>
    </div>
  );
}
