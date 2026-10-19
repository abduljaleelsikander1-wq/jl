"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SEGMENT_COUNT } from "@/lib/three/cameraPath";

const LINKS = [
  { href: "/#experiences", label: "Experiences" },
  { href: "/dubai-desert-safari", label: "Desert Safari" },
  { href: "/dubai-city-tours", label: "City Tours" },
  { href: "/abu-dhabi-tours", label: "Abu Dhabi" },
  { href: "/airport-transfers", label: "Transfers" },
  { href: "/about", label: "About" },
];

export default function FloatingNav() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const threshold = window.innerHeight * (SEGMENT_COUNT - 0.6);
      setSolid(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "bg-ink/90 backdrop-blur-md shadow-lg shadow-black/30" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10"
      >
        <Link href="/" className="font-display text-lg tracking-wide2 text-white">
          AURORA <span className="text-gold">DUBAI</span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-xs uppercase tracking-wide2 text-white/85 transition hover:text-gold"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">
          <button aria-label="Search" className="text-white/80 transition hover:text-gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button className="text-xs uppercase tracking-wide2 text-white/80 hover:text-gold">EN</button>
          <button className="text-xs uppercase tracking-wide2 text-white/80 hover:text-gold">AED</button>
          <a
            href="https://wa.me/971000000000"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="text-white/80 transition hover:text-[#25D366]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.9-.7-.8-1.2-1.6-1.4-1.9-.2-.3 0-.5.1-.6.2-.2.4-.5.6-.7.1-.2.2-.4.1-.6-.1-.2-.7-1.7-.9-2.2-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.9 2.3 1 2.5c.1.1 1.6 2.6 4 3.6 2 .8 2.4.6 2.8.6.5 0 1.6-.6 1.8-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4z" />
              <path d="M12 2a10 10 0 0 0-8.6 15l-1 3.6 3.7-1A10 10 0 1 0 12 2z" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </a>
          <Link
            href="/#experiences"
            className="rounded-full bg-gold px-5 py-2 text-xs uppercase tracking-wide2 text-ink transition hover:bg-sand"
          >
            Book Now
          </Link>
        </div>

        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="text-white lg:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-ink/95 px-6 py-6 lg:hidden">
          <ul className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm uppercase tracking-wide2 text-white/90"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#experiences"
            onClick={() => setMenuOpen(false)}
            className="mt-6 inline-flex rounded-full bg-gold px-5 py-2 text-xs uppercase tracking-wide2 text-ink"
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  );
}
