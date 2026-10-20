import type { Category } from "@/lib/data/experiences";

const PATHS: Record<Category["icon"], JSX.Element> = {
  dune: (
    <path d="M2 17c3-4 6-2 9-6s6-2 9-4M2 21c3-3 6-1 9-5s6-1 9-3" strokeLinecap="round" />
  ),
  skyline: (
    <path d="M3 21V9l4-2v14M11 21V5l3-3 3 3v16M20 21V11l1-1 1 1v10M3 21h19" strokeLinecap="round" strokeLinejoin="round" />
  ),
  mosque: (
    <path d="M12 3c2 1.5 2 3.5 0 5-2-1.5-2-3.5 0-5zM6 21v-7a6 6 0 0 1 12 0v7M3 21h18M9 21v-4a3 3 0 0 1 6 0v4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  car: (
    <path d="M3 16l1.5-5A2 2 0 0 1 6.4 9.5h11.2a2 2 0 0 1 1.9 1.5L21 16M4 16h16v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  yacht: (
    <path d="M4 16l1.5 3.5a2 2 0 0 0 1.9 1.3h9.2a2 2 0 0 0 1.9-1.3L20 16H4zM7 16V5l9 5.5L7 16z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  wave: (
    <path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" strokeLinecap="round" />
  ),
  compass: (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 9l-3.5 1.5L10 14l3.5-1.5L15 9z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  ticket: (
    <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8zM9 6v12" strokeLinecap="round" strokeLinejoin="round" />
  ),
  lantern: (
    <path d="M9 3h6l1 3H8l1-3zM8 6h8l-1 11a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3L8 6zM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  private: (
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.5-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  family: (
    <path d="M8 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21c0-3 2.5-5 6-5s6 2 6 5M12 21c0-3 2-5 5-5s5 2 5 5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  diamond: (
    <path d="M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M9 3l3 6-3 12M15 3l-3 6 3 12" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export default function CategoryIcon({ icon, className }: { icon: Category["icon"]; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      {PATHS[icon]}
    </svg>
  );
}
