import * as THREE from "three";
import { latLonToVector3 } from "../three/geo";
import { GLOBE_R, DUBAI_LAT, DUBAI_LON, ABU_DHABI_LAT, ABU_DHABI_LON, localToDubaiWorld } from "../three/dubaiFrame";

export type Marker = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** stop index at which this marker becomes visible */
  revealAt: number;
};

export const DUBAI_MARKER: Marker = { id: "dubai", name: "Dubai, UAE", lat: DUBAI_LAT, lon: DUBAI_LON, revealAt: 0 };

export const WORLD_MARKERS: Marker[] = [
  { id: "usa", name: "United States", lat: 39, lon: -98, revealAt: 1 },
  { id: "canada", name: "Canada", lat: 56, lon: -106, revealAt: 1 },
  { id: "uk", name: "United Kingdom", lat: 54, lon: -3, revealAt: 2 },
  { id: "ireland", name: "Ireland", lat: 53, lon: -8, revealAt: 2 },
  { id: "france", name: "France", lat: 47, lon: 2, revealAt: 2 },
  { id: "germany", name: "Germany", lat: 51, lon: 10, revealAt: 2 },
  { id: "italy", name: "Italy", lat: 42, lon: 13, revealAt: 2 },
  { id: "spain", name: "Spain", lat: 40, lon: -4, revealAt: 2 },
  { id: "netherlands", name: "Netherlands", lat: 52, lon: 5, revealAt: 2 },
  { id: "switzerland", name: "Switzerland", lat: 47, lon: 8, revealAt: 2 },
  { id: "india", name: "India", lat: 21, lon: 78, revealAt: 3 },
  { id: "indonesia", name: "Indonesia", lat: -2, lon: 118, revealAt: 3 },
  { id: "singapore", name: "Singapore", lat: 1.3, lon: 103.8, revealAt: 3 },
  { id: "malaysia", name: "Malaysia", lat: 3.1, lon: 101.7, revealAt: 3 },
  { id: "australia", name: "Australia", lat: -25, lon: 134, revealAt: 3 },
];

export const FLIGHT_ROUTES: [string, string][] = WORLD_MARKERS.map((m) => [m.id, "dubai"]);

export function markerPosition(m: Marker, radius = GLOBE_R + 0.02): THREE.Vector3 {
  return latLonToVector3(m.lat, m.lon, radius);
}

export type Stop = {
  id: string;
  phase: "world" | "dubai";
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: { label: string; href: string };
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
};

function worldStop(lat: number, lon: number, distance: number): { position: THREE.Vector3; lookAt: THREE.Vector3 } {
  return {
    position: latLonToVector3(lat, lon, GLOBE_R + distance),
    lookAt: latLonToVector3(lat, lon, GLOBE_R),
  };
}

function dubaiStop(pos: [number, number, number], look: [number, number, number]) {
  return { position: localToDubaiWorld(pos), lookAt: localToDubaiWorld(look) };
}

export const STOPS: Stop[] = [
  {
    id: "space",
    phase: "world",
    title: "YOUR NEXT ADVENTURE STARTS HERE",
    ...worldStop(8, -35, 6.6),
  },
  {
    id: "north-america",
    phase: "world",
    eyebrow: "USA · Canada",
    title: "FROM ACROSS THE WORLD",
    ...worldStop(42, -95, 5.4),
  },
  {
    id: "europe",
    phase: "world",
    eyebrow: "UK · France · Germany · Italy · Spain · Netherlands",
    title: "TO THE HEART OF THE UAE",
    ...worldStop(50, 10, 4.0),
  },
  {
    id: "india-sea",
    phase: "world",
    eyebrow: "India · Indonesia · Singapore · Malaysia",
    title: "ONE CONVERGING JOURNEY",
    ...worldStop(14, 88, 2.9),
  },
  {
    id: "middle-east",
    phase: "world",
    title: "ONE DESTINATION",
    ...worldStop(24, 46, 1.9),
  },
  {
    id: "dubai-transform",
    phase: "world",
    eyebrow: "United Arab Emirates",
    title: "DUBAI",
    ...worldStop(DUBAI_LAT, DUBAI_LON, 0.75),
  },
  {
    id: "burj-khalifa",
    phase: "dubai",
    title: "DISCOVER DUBAI",
    body: "The world's tallest building, rising from the heart of Downtown Dubai.",
    cta: { label: "Explore City Tours", href: "/dubai-city-tours" },
    ...dubaiStop([0, 1.8, 4.2], [0, 1.1, 0]),
  },
  {
    id: "desert",
    phase: "dubai",
    title: "ADVENTURE BEGINS",
    body: "Golden dunes, a 4x4 safari, camels at sunset, and a desert camp under the stars.",
    cta: { label: "Explore Desert Safaris", href: "/dubai-desert-safari" },
    ...dubaiStop([-5, 1.3, 5.0], [-5, -0.2, 1]),
  },
  {
    id: "marina",
    phase: "dubai",
    title: "EXPERIENCE THE SEA",
    body: "Yachts, speedboats, and the Dubai skyline catching the last light over the Gulf.",
    cta: { label: "Explore Water Experiences", href: "/water-experiences" },
    ...dubaiStop([5, 1.1, 4.8], [5, -0.4, 1]),
  },
  {
    id: "old-dubai",
    phase: "dubai",
    title: "DISCOVER THE SOUL OF DUBAI",
    body: "Al Fahidi's windtowers, the abra crossing Dubai Creek, and the gold and spice souks.",
    cta: { label: "Explore City Tours", href: "/dubai-city-tours" },
    ...dubaiStop([-3, 1.1, 9.2], [-3, 0.1, 6]),
  },
  {
    id: "abu-dhabi",
    phase: "dubai",
    title: "GO BEYOND DUBAI",
    body: "The Grand Mosque's domes and a modern capital skyline, an hour down the coast.",
    cta: { label: "Explore Abu Dhabi", href: "/abu-dhabi-tours" },
    ...dubaiStop([-9, 1.3, 12.4], [-9, 0.1, 9]),
  },
];

export const DUBAI_LOCAL_ANCHORS = {
  burj: [0, 0, 0] as [number, number, number],
  desert: [-5, -0.3, 1] as [number, number, number],
  marina: [5, -0.4, 1] as [number, number, number],
  oldDubai: [-3, -0.2, 6] as [number, number, number],
  abuDhabi: [-9, -0.1, 9] as [number, number, number],
};

export { ABU_DHABI_LAT, ABU_DHABI_LON };
