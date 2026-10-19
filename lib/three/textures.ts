import * as THREE from "three";
import { CONTINENTS, type Polygon } from "./continents";

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Cheap 2D value noise, tiled-ish via sine lattice. Good enough for sand/terrain variation. */
export function valueNoise2D(x: number, y: number): number {
  return (
    Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 -
    Math.floor(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453)
  );
}

function drawPolygon(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, poly: Polygon, w: number, h: number) {
  ctx.beginPath();
  poly.forEach(([lon, lat], i) => {
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Builds the globe's land/ocean "dot matrix" texture: a deep navy ocean with a fine stippled
 * grid of glowing points over land, like a premium data-viz globe rather than a satellite photo.
 * Returns { map, emissive } canvas textures sized the same, meant to be used on a
 * MeshStandardMaterial as `map` (base) and `emissiveMap` (the glow dots).
 */
export function createEarthTextures(width = 2048, height = 1024) {
  const maskCanvas = makeCanvas(width, height);
  const maskCtx = maskCanvas.getContext("2d")!;
  maskCtx.fillStyle = "#000000";
  maskCtx.fillRect(0, 0, width, height);
  maskCtx.fillStyle = "#ffffff";
  CONTINENTS.forEach((poly) => drawPolygon(maskCtx, poly, width, height));
  const maskData = maskCtx.getImageData(0, 0, width, height).data;
  const isLand = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    return maskData[idx] > 128;
  };

  // Base colour map: deep ocean gradient + soft land tint.
  const mapCanvas = makeCanvas(width, height);
  const mapCtx = mapCanvas.getContext("2d")!;
  const oceanGrad = mapCtx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#04101d");
  oceanGrad.addColorStop(0.5, "#071a2e");
  oceanGrad.addColorStop(1, "#04101d");
  mapCtx.fillStyle = oceanGrad;
  mapCtx.fillRect(0, 0, width, height);
  mapCtx.fillStyle = "#0e2435";
  CONTINENTS.forEach((poly) => drawPolygon(mapCtx, poly, width, height));

  // Emissive map: stippled glowing dots over land, density/brightness jittered for texture.
  const emCanvas = makeCanvas(width, height);
  const emCtx = emCanvas.getContext("2d")!;
  emCtx.fillStyle = "#000000";
  emCtx.fillRect(0, 0, width, height);
  const rand = seededRandom(7);
  const cell = Math.max(3, Math.round(width / 340));
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      if (!isLand(Math.min(width - 1, x), Math.min(height - 1, y))) continue;
      if (rand() > 0.55) continue;
      const jitterX = x + (rand() - 0.5) * cell;
      const jitterY = y + (rand() - 0.5) * cell;
      const r = cell * (0.22 + rand() * 0.3);
      const brightness = 0.4 + rand() * 0.6;
      emCtx.beginPath();
      emCtx.fillStyle = `rgba(120, 227, 235, ${brightness.toFixed(2)})`;
      emCtx.arc(jitterX, jitterY, r, 0, Math.PI * 2);
      emCtx.fill();
    }
  }

  const map = new THREE.CanvasTexture(mapCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const emissiveMap = new THREE.CanvasTexture(emCanvas);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  return { map, emissiveMap };
}

/** Soft radial-gradient sprite used for glow points / particles. */
export function createGlowSprite(color = "255,255,255", size = 128): THREE.CanvasTexture {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${color},1)`);
  grad.addColorStop(0.4, `rgba(${color},0.6)`);
  grad.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/** Procedural sand texture: warm layered noise bands for dune colour + roughness variation. */
export function createSandTexture(width = 1024, height = 1024, baseHue = 34): THREE.CanvasTexture {
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const rand = seededRandom(42);
  ctx.fillStyle = `hsl(${baseHue}, 45%, 58%)`;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 2600; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = 2 + rand() * 10;
    const light = 45 + rand() * 25;
    ctx.fillStyle = `hsla(${baseHue + (rand() - 0.5) * 10}, 50%, ${light}%, 0.12)`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.4, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Procedural stone/sandstone texture for Old Dubai buildings. */
export function createStoneTexture(width = 512, height = 512, baseHue = 32): THREE.CanvasTexture {
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const rand = seededRandom(13);
  ctx.fillStyle = `hsl(${baseHue}, 30%, 62%)`;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 900; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const w = 6 + rand() * 20;
    const h = 4 + rand() * 10;
    ctx.fillStyle = `hsla(${baseHue}, 25%, ${40 + rand() * 30}%, 0.15)`;
    ctx.fillRect(x, y, w, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
