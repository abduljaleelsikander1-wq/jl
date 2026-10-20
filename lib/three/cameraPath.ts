import * as THREE from "three";
import { STOPS } from "../data/journey";

export const STOP_COUNT = STOPS.length;
export const SEGMENT_COUNT = STOP_COUNT - 1;

const positionCurve = new THREE.CatmullRomCurve3(
  STOPS.map((s) => s.position),
  false,
  "catmullrom",
  0.45
);
const lookCurve = new THREE.CatmullRomCurve3(
  STOPS.map((s) => s.lookAt),
  false,
  "catmullrom",
  0.45
);

export function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * `p` is overall journey progress in [0,1]. THREE's CatmullRomCurve3.getPoint distributes
 * its parameter uniformly across control points regardless of spacing, so `p` maps 1:1 onto
 * "stop space" (0 = first stop, STOP_COUNT-1 = last stop) — no separate remap needed.
 */
export function getCameraPose(p: number) {
  const t = clamp01(p);
  const position = positionCurve.getPoint(t);
  const lookAt = lookCurve.getPoint(t);
  const stopSpace = t * SEGMENT_COUNT;
  return { position, lookAt, stopSpace };
}

const DUBAI_TRANSFORM_INDEX = STOPS.findIndex((s) => s.id === "dubai-transform");
const BURJ_INDEX = STOPS.findIndex((s) => s.id === "burj-khalifa");

/** Crossfade window: the globe dissolves into the Dubai miniature world across one stop-beat. */
export function getWorldDubaiCrossfade(stopSpace: number) {
  const globeOpacity = 1 - smoothstep(DUBAI_TRANSFORM_INDEX, BURJ_INDEX, stopSpace);
  const dubaiOpacity = smoothstep(DUBAI_TRANSFORM_INDEX, BURJ_INDEX, stopSpace);
  return { globeOpacity, dubaiOpacity };
}

/** Visibility window (0..1) for copy/markers tied to a given stop index. */
export function stopVisibility(stopSpace: number, index: number, halfWidth = 0.42) {
  const d = Math.abs(stopSpace - index);
  return 1 - smoothstep(halfWidth * 0.5, halfWidth, d);
}
