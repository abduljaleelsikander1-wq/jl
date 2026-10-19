import Link from "next/link";
import JsonLd from "./JsonLd";

export type Crumb = { name: string; href: string };

const SITE_URL = "https://www.aurora-dubai-example.com";

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-white/50">
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === items.length - 1 ? (
              <span className="text-white/80">{item.name}</span>
            ) : (
              <Link href={item.href} className="hover:text-gold">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { SITE_URL };
