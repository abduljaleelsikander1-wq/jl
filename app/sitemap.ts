import type { MetadataRoute } from "next";
import { CATEGORIES, EXPERIENCES } from "@/lib/data/experiences";
import { SITE_URL } from "@/components/seo/Breadcrumbs";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/experiences", "/about", "/plan-your-trip"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: new Date(),
  }));

  const experienceRoutes = EXPERIENCES.map((e) => ({
    url: `${SITE_URL}/experiences/${e.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...categoryRoutes, ...experienceRoutes];
}
