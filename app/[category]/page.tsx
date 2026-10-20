import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExperienceCard from "@/components/catalog/ExperienceCard";
import CategoryIcon from "@/components/catalog/CategoryIcon";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { CATEGORIES, categoryBySlug, experiencesByCategory } from "@/lib/data/experiences";
import { SITE_URL } from "@/components/seo/Breadcrumbs";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = categoryBySlug(params.category);
  if (!category) return {};
  return {
    title: `${category.name} | Aurora Dubai`,
    description: `${category.tagline}. Browse and book ${category.name.toLowerCase()} in Dubai with Aurora Dubai, a trusted Dubai-based tour operator.`,
    alternates: { canonical: `${SITE_URL}/${category.slug}` },
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = categoryBySlug(params.category);
  if (!category) notFound();

  const experiences = experiencesByCategory(category.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    itemListElement: experiences.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristTrip",
        name: e.title,
        description: e.description,
        offers: { "@type": "Offer", priceCurrency: "AED", price: e.priceFromAed },
      },
    })),
  };

  return (
    <div className="bg-ink px-6 py-28 md:px-10 lg:px-16">
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: category.name, href: `/${category.slug}` }]} />

        <div className="flex items-center gap-4">
          <CategoryIcon icon={category.icon} className="h-10 w-10 text-gold" />
          <div>
            <h1 className="font-display text-3xl text-white md:text-5xl">{category.name}</h1>
            <p className="mt-1 text-white/60">{category.tagline}</p>
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-white/70">
          Browse our {category.name.toLowerCase()} in Dubai and across the UAE. Every
          experience below can be booked in advance, with English-speaking guides and hotel
          pickup available on most options.
        </p>

        {experiences.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.slug} experience={exp} category={category} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-white/60">
            New {category.name.toLowerCase()} are being added soon. In the meantime,
            WhatsApp us and we&rsquo;ll put together something tailored for you.
          </p>
        )}
      </div>
    </div>
  );
}
