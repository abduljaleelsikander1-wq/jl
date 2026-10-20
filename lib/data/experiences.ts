export type Category = {
  slug: string;
  name: string;
  tagline: string;
  icon: "dune" | "skyline" | "mosque" | "car" | "yacht" | "wave" | "compass" | "ticket" | "lantern" | "private" | "family" | "diamond";
};

export type Experience = {
  slug: string;
  title: string;
  categorySlug: string;
  location: string;
  duration: string;
  priceFromAed: number;
  description: string;
};

export const CATEGORIES: Category[] = [
  { slug: "dubai-desert-safari", name: "Dubai Desert Safari", tagline: "Dunes, sunsets, and Bedouin hospitality", icon: "dune" },
  { slug: "dubai-city-tours", name: "Dubai City Tours", tagline: "From Old Dubai to the Burj Khalifa", icon: "skyline" },
  { slug: "abu-dhabi-tours", name: "Abu Dhabi Tours", tagline: "The capital's grand mosque and museums", icon: "mosque" },
  { slug: "airport-transfers", name: "Airport Transfers", tagline: "Private, punctual, door to door", icon: "car" },
  { slug: "yacht-marine-experiences", name: "Yacht & Marine Experiences", tagline: "Sunset cruises on the Arabian Gulf", icon: "yacht" },
  { slug: "water-sports", name: "Water Sports", tagline: "Jet skis, flyboarding, and parasailing", icon: "wave" },
  { slug: "adventure-experiences", name: "Adventure Experiences", tagline: "Skydiving, dune buggies, and more", icon: "compass" },
  { slug: "attractions-tickets", name: "Attractions & Tickets", tagline: "Skip the line at Dubai's icons", icon: "ticket" },
  { slug: "cultural-experiences", name: "Cultural Experiences", tagline: "Heritage, souks, and old Dubai", icon: "lantern" },
  { slug: "private-tours", name: "Private Tours", tagline: "Your own guide, vehicle, and pace", icon: "private" },
  { slug: "family-experiences", name: "Family Experiences", tagline: "Theme parks and all-ages fun", icon: "family" },
  { slug: "luxury-experiences", name: "Luxury Experiences", tagline: "Helicopter tours, fine dining, and more", icon: "diamond" },
];

/**
 * Placeholder catalog data — illustrative titles, durations and indicative AED price points
 * so the marketplace renders fully. Replace with the operator's real inventory, live pricing
 * and photography before launch; no ratings are included since none are genuine yet.
 */
export const EXPERIENCES: Experience[] = [
  {
    slug: "evening-desert-safari-bbq",
    title: "Evening Desert Safari with BBQ Dinner",
    categorySlug: "dubai-desert-safari",
    location: "Dubai Desert Conservation Reserve",
    duration: "6 hours",
    priceFromAed: 165,
    description: "Dune bashing in a 4x4, camel riding, sandboarding, and a BBQ dinner with live entertainment under the stars.",
  },
  {
    slug: "sunrise-desert-safari",
    title: "Sunrise Desert Safari & Falconry",
    categorySlug: "dubai-desert-safari",
    location: "Dubai Desert",
    duration: "4 hours",
    priceFromAed: 220,
    description: "Beat the heat with an early start: dune driving, a falconry display, and breakfast as the sun rises over the dunes.",
  },
  {
    slug: "overnight-desert-camp",
    title: "Overnight Luxury Desert Camp",
    categorySlug: "dubai-desert-safari",
    location: "Dubai Desert",
    duration: "2 days / 1 night",
    priceFromAed: 890,
    description: "A private tented camp, dinner under the stars, and a guided sunrise hike before returning to the city.",
  },
  {
    slug: "half-day-city-tour",
    title: "Half-Day Dubai City Tour",
    categorySlug: "dubai-city-tours",
    location: "Downtown Dubai, Jumeirah, Palm Jumeirah",
    duration: "4 hours",
    priceFromAed: 145,
    description: "Burj Khalifa photo stop, Jumeirah Mosque, Palm Jumeirah, and the Dubai Marina skyline with a professional guide.",
  },
  {
    slug: "old-dubai-heritage-tour",
    title: "Old Dubai & Dubai Creek Heritage Tour",
    categorySlug: "dubai-city-tours",
    location: "Al Fahidi, Dubai Creek, Gold & Spice Souks",
    duration: "3 hours",
    priceFromAed: 120,
    description: "Wander Al Fahidi's windtower lanes, cross the creek by traditional abra, and browse the gold and spice souks.",
  },
  {
    slug: "burj-khalifa-at-the-top",
    title: "Burj Khalifa: At the Top (124th & 125th Floor)",
    categorySlug: "dubai-city-tours",
    location: "Downtown Dubai",
    duration: "1 – 1.5 hours",
    priceFromAed: 169,
    description: "Observation decks on the 124th and 125th floors of the world's tallest building, with uninterrupted city views.",
  },
  {
    slug: "abu-dhabi-full-day-tour",
    title: "Abu Dhabi Full-Day City Tour",
    categorySlug: "abu-dhabi-tours",
    location: "Abu Dhabi",
    duration: "9 hours",
    priceFromAed: 250,
    description: "Sheikh Zayed Grand Mosque, Qasr Al Watan, the Corniche, and the capital's modern skyline in a single day trip from Dubai.",
  },
  {
    slug: "louvre-abu-dhabi-tour",
    title: "Louvre Abu Dhabi Guided Tour",
    categorySlug: "abu-dhabi-tours",
    location: "Saadiyat Island, Abu Dhabi",
    duration: "5 hours",
    priceFromAed: 295,
    description: "Entry and guided walkthrough of the Louvre Abu Dhabi's galleries, with transport from Dubai included.",
  },
  {
    slug: "dxb-private-transfer",
    title: "Private Airport Transfer (DXB)",
    categorySlug: "airport-transfers",
    location: "Dubai International Airport",
    duration: "30 – 60 minutes",
    priceFromAed: 95,
    description: "A private vehicle and driver waiting at arrivals, with flight tracking so your ride is there whenever you land.",
  },
  {
    slug: "auh-private-transfer",
    title: "Private Airport Transfer (Abu Dhabi)",
    categorySlug: "airport-transfers",
    location: "Abu Dhabi International Airport",
    duration: "45 – 75 minutes",
    priceFromAed: 180,
    description: "Door-to-door private transfer between Abu Dhabi International Airport and your Dubai hotel or residence.",
  },
  {
    slug: "luxury-yacht-sunset-cruise",
    title: "Luxury Yacht Sunset Cruise",
    categorySlug: "yacht-marine-experiences",
    location: "Dubai Marina",
    duration: "2 hours",
    priceFromAed: 450,
    description: "A private yacht charter along Dubai Marina and Palm Jumeirah as the skyline turns gold at sunset.",
  },
  {
    slug: "dhow-cruise-dinner",
    title: "Traditional Dhow Cruise with Dinner",
    categorySlug: "yacht-marine-experiences",
    location: "Dubai Marina",
    duration: "2 hours",
    priceFromAed: 160,
    description: "An evening cruise aboard a traditional wooden dhow with a buffet dinner and live entertainment.",
  },
  {
    slug: "jet-ski-marina-tour",
    title: "Jet Ski Marina & Atlantis Tour",
    categorySlug: "water-sports",
    location: "Dubai Marina / Palm Jumeirah",
    duration: "30 – 60 minutes",
    priceFromAed: 250,
    description: "Ride a jet ski past the Marina skyline and around Palm Jumeirah with views of Atlantis The Palm.",
  },
  {
    slug: "flyboard-session",
    title: "Flyboard Experience",
    categorySlug: "water-sports",
    location: "Dubai Marina",
    duration: "30 minutes",
    priceFromAed: 350,
    description: "A guided introduction to flyboarding, hovering above the water on a jet-powered board.",
  },
  {
    slug: "skydive-palm-drop-zone",
    title: "Skydive Dubai — Palm Jumeirah Tandem Jump",
    categorySlug: "adventure-experiences",
    location: "Skydive Dubai, Palm Jumeirah",
    duration: "3 hours (incl. briefing)",
    priceFromAed: 2199,
    description: "A tandem skydive over Palm Jumeirah with views of the coastline from 13,000 feet.",
  },
  {
    slug: "dune-buggy-desert-adventure",
    title: "Dune Buggy Desert Adventure",
    categorySlug: "adventure-experiences",
    location: "Dubai Desert",
    duration: "2 hours",
    priceFromAed: 395,
    description: "Self-drive dune buggies across the red dunes, led by an experienced guide.",
  },
  {
    slug: "burj-khalifa-combo-aquarium",
    title: "Burj Khalifa + Dubai Aquarium Combo",
    categorySlug: "attractions-tickets",
    location: "Downtown Dubai",
    duration: "3 hours",
    priceFromAed: 299,
    description: "Combined entry to the Burj Khalifa observation deck and the Dubai Aquarium & Underwater Zoo.",
  },
  {
    slug: "museum-of-the-future-ticket",
    title: "Museum of the Future — Entry Ticket",
    categorySlug: "attractions-tickets",
    location: "Downtown Dubai",
    duration: "2 – 3 hours",
    priceFromAed: 149,
    description: "Skip-the-line entry to one of Dubai's most talked-about new landmarks.",
  },
  {
    slug: "al-fahidi-walking-tour",
    title: "Al Fahidi Historic District Walking Tour",
    categorySlug: "cultural-experiences",
    location: "Al Fahidi, Dubai",
    duration: "2 hours",
    priceFromAed: 95,
    description: "A guided walk through Dubai's oldest neighbourhood, its courtyard houses, galleries, and museums.",
  },
  {
    slug: "emirati-home-dinner",
    title: "Dinner in an Emirati Home",
    categorySlug: "cultural-experiences",
    location: "Dubai",
    duration: "2.5 hours",
    priceFromAed: 275,
    description: "A home-hosted dinner and conversation with a local Emirati family — traditional dishes and genuine hospitality.",
  },
  {
    slug: "private-guide-full-day",
    title: "Private Guide & Vehicle — Full Day",
    categorySlug: "private-tours",
    location: "Dubai & UAE",
    duration: "Full day, customisable",
    priceFromAed: 1450,
    description: "Your own English-speaking guide and private vehicle for a day built entirely around what you want to see.",
  },
  {
    slug: "private-desert-safari",
    title: "Private Desert Safari (Your Group Only)",
    categorySlug: "private-tours",
    location: "Dubai Desert",
    duration: "6 hours",
    priceFromAed: 1100,
    description: "The classic desert safari, but exclusively for your group — no sharing a vehicle or camp with strangers.",
  },
  {
    slug: "img-worlds-family-ticket",
    title: "IMG Worlds of Adventure — Family Ticket",
    categorySlug: "family-experiences",
    location: "City of Arabia, Dubai",
    duration: "Full day",
    priceFromAed: 350,
    description: "One of the world's largest indoor theme parks, with zones for every age in air-conditioned comfort.",
  },
  {
    slug: "dubai-aquarium-family-combo",
    title: "Dubai Aquarium & Zoo Family Combo",
    categorySlug: "family-experiences",
    location: "Dubai Mall",
    duration: "2 – 3 hours",
    priceFromAed: 190,
    description: "Underwater tunnel walkthrough and zoo encounters, an easy half-day for families staying near Downtown.",
  },
  {
    slug: "helicopter-tour-the-7",
    title: "Helicopter Tour — The 7 (22 minutes)",
    categorySlug: "luxury-experiences",
    location: "Dubai",
    duration: "22 minutes in the air",
    priceFromAed: 1100,
    description: "A helicopter flight over the Palm, the Marina, and the Burj Khalifa skyline.",
  },
  {
    slug: "fine-dining-burj-al-arab",
    title: "Fine Dining Experience at Burj Al Arab",
    categorySlug: "luxury-experiences",
    location: "Jumeirah Beach, Dubai",
    duration: "2.5 hours",
    priceFromAed: 695,
    description: "A multi-course dinner inside the iconic sail-shaped hotel, with views across the Arabian Gulf.",
  },
];

export function experiencesByCategory(categorySlug: string): Experience[] {
  return EXPERIENCES.filter((e) => e.categorySlug === categorySlug);
}

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
