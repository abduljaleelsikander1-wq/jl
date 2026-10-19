import Link from "next/link";
import { CATEGORIES } from "@/lib/data/experiences";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-void px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-lg text-white">
            AURORA <span className="text-gold">DUBAI</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            From anywhere in the world, to your next experience in Dubai. A Dubai-based
            tourism company curating desert, sea, and city experiences across the UAE.
          </p>
          <a
            href="https://wa.me/971000000000"
            className="mt-4 inline-block text-sm text-cyan-glow hover:text-white"
          >
            WhatsApp us →
          </a>
        </div>
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-wide2 text-white/50">Experiences</h3>
          <ul className="space-y-2 text-sm text-white/75">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-wide2 text-white/50">More</h3>
          <ul className="space-y-2 text-sm text-white/75">
            {CATEGORIES.slice(6).map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-wide2 text-white/50">Company</h3>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <Link href="/about" className="hover:text-gold">
                About
              </Link>
            </li>
            <li>
              <Link href="/plan-your-trip" className="hover:text-gold">
                Plan Your Trip
              </Link>
            </li>
            <li>
              <Link href="/experiences" className="hover:text-gold">
                All Experiences
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-xs text-white/35">
        © {new Date().getFullYear()} Aurora Dubai Tourism. Prices shown are indicative sample
        rates and subject to change.
      </p>
    </footer>
  );
}
