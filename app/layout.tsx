import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import FloatingNav from "@/components/nav/FloatingNav";
import Footer from "@/components/nav/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/components/seo/Breadcrumbs";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aurora Dubai | Dubai & Abu Dhabi Tours, Desert Safaris & Experiences",
    template: "%s | Aurora Dubai",
  },
  description:
    "Book premium Dubai desert safaris, city tours, Abu Dhabi day trips, yacht charters, and airport transfers. An international tourism company based in Dubai, UAE.",
  keywords: [
    "Dubai tourism",
    "Dubai tours",
    "Dubai desert safari",
    "Dubai city tours",
    "Abu Dhabi tours",
    "Dubai airport transfers",
    "Dubai attractions",
    "Dubai activities",
    "Dubai experiences",
    "Dubai travel",
    "Dubai vacation",
    "Dubai holiday",
  ],
  openGraph: {
    type: "website",
    siteName: "Aurora Dubai",
    title: "Aurora Dubai | Dubai & Abu Dhabi Tours and Experiences",
    description:
      "From anywhere in the world, to your next experience in Dubai. Desert safaris, city tours, Abu Dhabi trips, yacht charters, and more.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurora Dubai | Dubai & Abu Dhabi Tours and Experiences",
    description: "From anywhere in the world, to your next experience in Dubai.",
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Aurora Dubai",
    url: SITE_URL,
    areaServed: ["Dubai", "Abu Dhabi", "United Arab Emirates"],
    description:
      "A Dubai-based tourism company offering desert safaris, city tours, Abu Dhabi day trips, yacht charters, and airport transfers for international travellers.",
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        <JsonLd data={organizationJsonLd} />
        <FloatingNav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
