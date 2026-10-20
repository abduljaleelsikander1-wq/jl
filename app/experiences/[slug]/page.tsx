import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryIcon from "@/components/catalog/CategoryIcon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { EXPERIENCES, categoryBySlug } from "@/lib/data/experiences";
import { SITE_URL } from "@/components/seo/Breadcrumbs";

export function generateStaticParams() {
  return EXPERIENCES.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const exp = EXPERIENCES.find((e) => e.slug === params.slug);
  if (!exp) return {};
  return {
    title: exp.title,
    description: exp.description,
    alternates: { canonical: `${SITE_URL}/experiences/${exp.slug}` },
  };
}

export default function ExperiencePage({ params }: { params: { slug: string } }) {
  const exp = EXPERIENCES.find((e) => e.slug === params.slug);
  if (!exp) notFound();
  const category = categoryBySlug(exp.categorySlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: exp.title,
    description: exp.description,
    touristType: "Leisure",
    itinerary: { "@type": "ItemList", itemListElement: [{ "@type": "Place", name: exp.location }] },
    offers: {
      "@type": "Offer",
      priceCurrency: "AED",
      price: exp.priceFromAed,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="bg-ink px-6 py-28 md:px-10 lg:px-16">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            ...(category ? [{ name: category.name, href: `/${category.slug}` }] : []),
            { name: exp.title, href: `/experiences/${exp.slug}` },
          ]}
        />

        <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-dusk via-ink to-[#2a1d12]">
          <CategoryIcon icon={category?.icon ?? "compass"} className="h-20 w-20 text-gold/70" />
        </div>

        <h1 className="mt-8 font-display text-3xl text-white md:text-5xl">{exp.title}</h1>
        <dl className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
          <div>
            <dt className="text-white/45">Location</dt>
            <dd>{exp.location}</dd>
          </div>
          <div>
            <dt className="text-white/45">Duration</dt>
            <dd>{exp.duration}</dd>
          </div>
          <div>
            <dt className="text-white/45">From</dt>
            <dd className="font-display text-lg text-gold">AED {exp.priceFromAed} / person</dd>
          </div>
        </dl>

        <p className="mt-8 text-lg text-white/80">{exp.description}</p>

        <div id="book" className="mt-12 rounded-2xl border border-gold/30 bg-white/[0.03] p-6">
          <h2 className="font-display text-xl text-white">Ready to book?</h2>
          <p className="mt-2 text-sm text-white/65">
            Message us your preferred date and group size and we&rsquo;ll confirm availability.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/971000000000?text=${encodeURIComponent(`Hi, I'd like to book: ${exp.title}`)}`}
              className="rounded-full bg-[#25D366] px-6 py-3 text-sm uppercase tracking-wide2 text-ink"
            >
              Book via WhatsApp
            </a>
            <a
              href={`mailto:bookings@example.com?subject=${encodeURIComponent(`Booking enquiry: ${exp.title}`)}`}
              className="rounded-full border border-white/25 px-6 py-3 text-sm uppercase tracking-wide2 text-white/85 hover:border-gold hover:text-gold"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
