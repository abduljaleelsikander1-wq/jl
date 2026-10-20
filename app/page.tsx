import type { Metadata } from "next";
import Link from "next/link";
import JourneyExperience from "@/components/journey/JourneyExperience";
import CatalogSection from "@/components/catalog/CatalogSection";
import JsonLd from "@/components/seo/JsonLd";
import { CATEGORIES } from "@/lib/data/experiences";
import { SITE_URL } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Dubai Tours, Desert Safaris & Experiences | Aurora Dubai",
  description:
    "Plan your Dubai vacation: desert safaris, Dubai city tours, Abu Dhabi day trips, yacht charters, water sports, and private airport transfers. Trusted Dubai-based tour operator.",
  alternates: { canonical: SITE_URL },
};

export default function HomePage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: CATEGORIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `${SITE_URL}/${c.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />

      {/* The cinematic 3D journey — purely presentational; all SEO-relevant content lives in
          plain, crawlable HTML below, per the SEO content requirement. */}
      <JourneyExperience />

      <CatalogSection />

      {/* Crawlable SEO content: deliberately plain HTML, independent of the 3D experience above. */}
      <section aria-labelledby="dubai-tourism-heading" className="bg-void px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 id="dubai-tourism-heading" className="font-display text-3xl text-white md:text-4xl">
            Dubai Tourism, Tours & Travel Guide
          </h2>
          <p className="mt-4 text-white/70">
            Aurora Dubai is a Dubai-based tourism company offering curated travel experiences
            across the United Arab Emirates for visitors arriving from the United States,
            Canada, the United Kingdom, Ireland, Germany, France, Italy, Spain, the
            Netherlands, Switzerland, Australia, India, Indonesia, Singapore, and Malaysia.
            Whatever city you&rsquo;re flying in from, your Dubai vacation can start the moment
            you land.
          </p>

          <h3 className="mt-10 font-display text-2xl text-white">Dubai Desert Safari</h3>
          <p className="mt-2 text-white/70">
            A <Link href="/dubai-desert-safari" className="text-cyan-glow hover:text-white">Dubai desert safari</Link>{" "}
            is the UAE&rsquo;s signature activity: dune bashing in a 4x4, camel riding, sandboarding,
            and a traditional BBQ dinner under the stars at a desert camp. Evening, overnight,
            and sunrise safari options are all available.
          </p>

          <h3 className="mt-8 font-display text-2xl text-white">Dubai City Tours</h3>
          <p className="mt-2 text-white/70">
            <Link href="/dubai-city-tours" className="text-cyan-glow hover:text-white">Dubai city tours</Link>{" "}
            cover the Burj Khalifa, Palm Jumeirah, Dubai Marina, and the heritage lanes of Old
            Dubai along Dubai Creek, including the gold and spice souks and a traditional abra
            crossing.
          </p>

          <h3 className="mt-8 font-display text-2xl text-white">Abu Dhabi Tours</h3>
          <p className="mt-2 text-white/70">
            <Link href="/abu-dhabi-tours" className="text-cyan-glow hover:text-white">Abu Dhabi tours</Link>{" "}
            from Dubai visit the Sheikh Zayed Grand Mosque, Qasr Al Watan, and the Louvre Abu
            Dhabi — an easy day trip down the coast from Dubai.
          </p>

          <h3 className="mt-8 font-display text-2xl text-white">Dubai Airport Transfers</h3>
          <p className="mt-2 text-white/70">
            Private <Link href="/airport-transfers" className="text-cyan-glow hover:text-white">Dubai airport transfers</Link>{" "}
            connect Dubai International (DXB) and Abu Dhabi International (AUH) with your hotel,
            with flight tracking so your driver is always there when you land.
          </p>

          <h3 className="mt-8 font-display text-2xl text-white">More Dubai Activities &amp; Experiences</h3>
          <p className="mt-2 text-white/70">
            Beyond the essentials, explore{" "}
            <Link href="/yacht-marine-experiences" className="text-cyan-glow hover:text-white">yacht and marine experiences</Link>,{" "}
            <Link href="/water-sports" className="text-cyan-glow hover:text-white">water sports</Link>,{" "}
            <Link href="/adventure-experiences" className="text-cyan-glow hover:text-white">adventure experiences</Link>,{" "}
            <Link href="/attractions-tickets" className="text-cyan-glow hover:text-white">attractions and tickets</Link>,{" "}
            <Link href="/cultural-experiences" className="text-cyan-glow hover:text-white">cultural experiences</Link>,{" "}
            <Link href="/private-tours" className="text-cyan-glow hover:text-white">private tours</Link>,{" "}
            <Link href="/family-experiences" className="text-cyan-glow hover:text-white">family experiences</Link>, and{" "}
            <Link href="/luxury-experiences" className="text-cyan-glow hover:text-white">luxury experiences</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
