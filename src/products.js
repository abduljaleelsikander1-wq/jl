// Procedural, unbranded cosmetic & personal-care product models.
// Scale: 1 unit ≈ 10 cm. Every builder returns a Group standing on y = 0,
// centred on the Y axis, with its front (label side) facing +Z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { labelTexture, paletteTexture, powderTexture } from './textures.js';

// ---------------------------------------------------------------- materials
const matCache = new Map();
// Keep light plastics just under pure white so key-lit highlights stay out of the bloom range.
const tame = (c, k = 0.86) => new THREE.Color(c).multiplyScalar(k);
function cached(key, make) {
  if (!matCache.has(key)) matCache.set(key, make());
  return matCache.get(key);
}

export const M = {
  gold: () => cached('gold', () => new THREE.MeshPhysicalMaterial({ color: '#d8b37a', metalness: 1, roughness: 0.2, clearcoat: 0.4 })),
  brushedGold: () => cached('bgold', () => new THREE.MeshPhysicalMaterial({ color: '#caa46c', metalness: 1, roughness: 0.38 })),
  roseGold: () => cached('rgold', () => new THREE.MeshPhysicalMaterial({ color: '#e0a894', metalness: 1, roughness: 0.22, clearcoat: 0.5 })),
  chrome: () => cached('chrome', () => new THREE.MeshPhysicalMaterial({ color: '#e9e9ec', metalness: 1, roughness: 0.1 })),
  mirror: () => cached('mirror', () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: 0.02 })),
  alu: () => cached('alu', () => new THREE.MeshPhysicalMaterial({ color: '#c9cbd0', metalness: 1, roughness: 0.32 })),
  blackGloss: () => cached('bgl', () => new THREE.MeshPhysicalMaterial({ color: '#0c0c0e', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 })),
  blackMatte: () => cached('bma', () => new THREE.MeshPhysicalMaterial({ color: '#121113', roughness: 0.62 })),
  rubber: () => cached('rub', () => new THREE.MeshPhysicalMaterial({ color: '#17151a', roughness: 0.75, sheen: 0.4, sheenColor: '#555' })),
  plastic: (color, rough = 0.32) => cached(`pl${color}${rough}`, () => new THREE.MeshPhysicalMaterial({ color: tame(color), roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.2 })),
  pearl: (color) => cached(`pe${color}`, () => new THREE.MeshPhysicalMaterial({ color: tame(color), roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, iridescence: 0.35, iridescenceIOR: 1.3, sheen: 0.3, sheenColor: '#ffffff' })),
  glass: (tint = '#ffffff', thickness = 0.3, rough = 0.03) => cached(`gl${tint}${thickness}${rough}`, () => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', metalness: 0, roughness: rough, transmission: 1, thickness, ior: 1.5,
    attenuationColor: tint, attenuationDistance: 0.9, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.2,
  })),
  tintedPlastic: (tint) => cached(`tp${tint}`, () => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.12, transmission: 0.95, thickness: 0.6, ior: 1.45, attenuationColor: tint, attenuationDistance: 0.35, clearcoat: 1,
  })),
  liquid: (color, rough = 0.15) => cached(`lq${color}${rough}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.2 })),
  cream: (color = '#fbf6ef') => cached(`cr${color}`, () => new THREE.MeshPhysicalMaterial({ color: tame(color, 0.84), roughness: 0.55, sheen: 1, sheenRoughness: 0.4, sheenColor: '#ffffff' })),
  lip: (color) => cached(`lip${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: '#ffd6d6' })),
  bristle: (color) => cached(`br${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.85, sheen: 1, sheenRoughness: 0.6, sheenColor: '#f5e6d8' })),
  wood: () => cached('wood', () => new THREE.MeshPhysicalMaterial({ color: '#5b3b27', roughness: 0.35, clearcoat: 0.8 })),
  satin: (color) => cached(`sat${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, sheen: 1, sheenRoughness: 0.3, sheenColor: '#ffffff' })),
  label: (opts) => cached(`lab${JSON.stringify(opts)}`, () => new THREE.MeshPhysicalMaterial({
    map: labelTexture(opts), transparent: !!opts.transparentBg, roughness: 0.35, clearcoat: 0.5, depthWrite: !opts.transparentBg,
  })),
  map: (key, tex, extra = {}) => cached(key, () => new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.4, ...extra })),
};

// ---------------------------------------------------------------- geometry
const geoCache = new Map();
function geo(key, make) {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key);
}

// Revolve a profile of [radius, y] pairs (bottom to top).
function lathe(key, pts, seg = 64) {
  return geo(key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg));
}

// Smooth profile helper: builds a rounded bottle silhouette.
function bottleProfile({ r, h, shoulder = 0.18, neckR, neckH, base = 0.04, closed = true }) {
  const pts = [];
  if (closed) pts.push([0, 0]);
  pts.push([r - base, 0], [r, base]);
  pts.push([r, h - shoulder]);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, a = t * Math.PI / 2;
    pts.push([neckR + (r - neckR) * Math.cos(a), h - shoulder + shoulder * Math.sin(a)]);
  }
  pts.push([neckR, h + neckH]);
  if (closed) pts.push([0, h + neckH]);
  return pts;
}

function cyl(key, rt, rb, h, seg = 48, open = false) {
  return geo(key, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open));
}

function mesh(g, m, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, shadow = true } = {}) {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  o.scale.set(sx, sy, sz);
  o.castShadow = shadow;
  o.receiveShadow = shadow;
  return o;
}

// Curved label band wrapped on the front of a cylinder of radius r.
function labelBand(r, h, y, opts, arc = 1.5) {
  const g = geo(`band${r}${h}${arc}`, () => new THREE.CylinderGeometry(r, r, h, 32, 1, true, -arc / 2, arc));
  return mesh(g, M.label(opts), { y, shadow: false });
}

function group(name, ...children) {
  const g = new THREE.Group();
  g.name = name;
  children.flat().forEach((c) => c && g.add(c));
  return g;
}

// ---------------------------------------------------------------- lip
export function lipstick({ color = '#9e1b32', caseMat = M.gold(), capped = false } = {}) {
  const base = lathe('lsBase', [[0, 0], [0.17, 0], [0.18, 0.02], [0.18, 0.5], [0.172, 0.52], [0.172, 0.56], [0, 0.56]]);
  const ring = cyl('lsRing', 0.15, 0.15, 0.14);
  const bullet = geo('lsBullet', () => {
    const g = new THREE.CylinderGeometry(0.128, 0.13, 0.42, 48, 10);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const top = 0.21 - 0.55 * (x + 0.13);          // slanted tip
      const t = (y + 0.21) / 0.42;
      p.setY(i, -0.21 + t * (top + 0.21));
    }
    g.computeVertexNormals();
    return g;
  });
  const kids = [
    mesh(base, caseMat),
    mesh(ring, M.blackGloss(), { y: 0.6 }),
    mesh(bullet, M.lip(color), { y: 0.88 }),
  ];
  if (capped) kids.push(mesh(lathe('lsCap', [[0, 0], [0.185, 0], [0.19, 0.02], [0.19, 0.6], [0.17, 0.63], [0, 0.63]]), caseMat, { y: 0.56 }));
  return group('lipstick', kids);
}

export function lipGloss({ color = '#d4577a', cap = M.gold() } = {}) {
  const tube = lathe('lgTube', [[0, 0], [0.095, 0], [0.105, 0.03], [0.105, 0.72], [0.08, 0.76], [0, 0.76]]);
  const liq = lathe('lgLiq', [[0, 0.03], [0.085, 0.03], [0.085, 0.7], [0, 0.7]], 32);
  const capG = lathe('lgCap', [[0, 0], [0.11, 0], [0.11, 0.46], [0.1, 0.48], [0, 0.48]]);
  return group('lipgloss',
    mesh(liq, M.liquid(color, 0.1)),
    mesh(tube, M.glass('#ffffff', 0.1)),
    mesh(capG, cap, { y: 0.76 }),
  );
}

// ---------------------------------------------------------------- face
export function foundation({ shade = '#d9a882', cap = M.gold() } = {}) {
  const body = geo('fdBody', () => new RoundedBoxGeometry(0.62, 0.82, 0.36, 5, 0.09));
  const liq = geo('fdLiq', () => new RoundedBoxGeometry(0.5, 0.62, 0.24, 4, 0.06));
  return group('foundation',
    mesh(liq, M.liquid(shade, 0.35), { y: 0.37 }),
    mesh(body, M.glass('#fff4ea', 0.6), { y: 0.41 }),
    mesh(cyl('fdNeck', 0.1, 0.1, 0.12), cap, { y: 0.88 }),
    mesh(cyl('fdCap', 0.16, 0.16, 0.42), M.blackGloss(), { y: 1.15 }),
    mesh(cyl('fdCapRing', 0.162, 0.162, 0.04), cap, { y: 0.96 }),
  );
}

export function concealer({ shade = '#e3b594' } = {}) {
  const g = lipGloss({ color: shade, cap: M.roseGold() });
  g.name = 'concealer';
  return g;
}

// Squeeze tube (BB cream, face wash, sunscreen) standing on its cap.
export function squeezeTube({ body = '#f4efe9', cap = '#f4efe9', title = 'BB CREAM', sub = 'SPF 30 · 50 ml', accent = '#b8925a', r = 0.24, h = 1.25, capMat } = {}) {
  const tubeG = geo(`tube${r}${h}`, () => {
    const g = new THREE.CylinderGeometry(r, r, h, 48, 24, false);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = Math.min(1, Math.max(0, (p.getY(i) + h / 2) / h)); // 0 bottom (cap) .. 1 top (crimp)
      const f = Math.pow(t, 1.6);
      p.setX(i, p.getX(i) * (1 + 0.28 * f));
      p.setZ(i, p.getZ(i) * (1 - 0.93 * f));
    }
    g.computeVertexNormals();
    return g;
  });
  const lab = M.label({ bg: body, fg: '#2d2724', accent, title, sub });
  const capH = 0.28;
  const tube = mesh(tubeG, M.plastic(body, 0.4), { y: capH + h / 2 });
  const face = mesh(geo(`tubeFace${r}${h}`, () => {
    // label decal: a copy of the lower half of the tube front, slightly inflated
    const g = new THREE.CylinderGeometry(r * 1.004, r * 1.004, h * 0.55, 32, 12, true, -0.9, 1.8);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i) + h * 0.275 + h * 0.1) / h;
      const f = Math.pow(Math.max(0, t), 1.6);
      p.setX(i, p.getX(i) * (1 + 0.28 * f));
      p.setZ(i, p.getZ(i) * (1 - 0.93 * f) + 0.002);
    }
    g.computeVertexNormals();
    return g;
  }), lab, { y: capH + h * 0.375, shadow: false });
  const crimp = mesh(geo(`crimp${r}`, () => new THREE.BoxGeometry(r * 2.6, 0.08, r * 0.14)), M.plastic(body, 0.5), { y: capH + h + 0.02 });
  return group('tube',
    mesh(cyl(`tcap${r}`, r * 0.92, r * 0.98, capH), capMat || M.plastic(cap, 0.25), { y: capH / 2 }),
    tube, face, crimp,
  );
}

export function compact({ shell = M.roseGold(), powder = '#e6b69a', open = 1.9 } = {}) {
  const base = cyl('cpBase', 0.46, 0.46, 0.12, 64);
  const pan = cyl('cpPan', 0.39, 0.39, 0.03, 64);
  const lidG = cyl('cpLid', 0.46, 0.46, 0.07, 64);
  const mirrorG = cyl('cpMirror', 0.4, 0.4, 0.005, 64);
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.12, -0.46);
  const lid = mesh(lidG, shell, { z: 0.46, y: 0.035 });
  const mir = mesh(mirrorG, M.mirror(), { z: 0.46, y: -0.002 });
  hinge.add(lid, mir);
  hinge.rotation.x = -open;
  const topMat = M.map(`powder${powder}`, powderTexture(powder), { roughness: 0.9, sheen: 0.6, sheenColor: '#fff' });
  return group('compact',
    mesh(base, shell, { y: 0.06 }),
    mesh(pan, [M.cream(powder), topMat, M.cream(powder)], { y: 0.13 }),
    hinge,
  );
}

export function blush({ color = '#e58f8f' } = {}) {
  const base = geo('blBase', () => new RoundedBoxGeometry(0.8, 0.12, 0.8, 4, 0.05));
  const pan = geo('blPan', () => new RoundedBoxGeometry(0.64, 0.04, 0.64, 3, 0.03));
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.12, -0.4);
  hinge.add(mesh(base, M.blackGloss(), { z: 0.4, y: 0.03, sy: 0.5 }));
  hinge.add(mesh(geo('blMir', () => new THREE.BoxGeometry(0.62, 0.004, 0.62)), M.mirror(), { z: 0.4, y: 0.0 }));
  hinge.rotation.x = -1.95;
  const top = M.map(`blushTop${color}`, powderTexture(color), { roughness: 0.9, sheen: 0.8, sheenColor: '#fff' });
  return group('blush',
    mesh(base, M.blackGloss(), { y: 0.06 }),
    mesh(pan, [top, top, top, top, top, top], { y: 0.13 }),
    hinge,
  );
}

export function mascara({ body = M.blackGloss(), band = M.gold() } = {}) {
  return group('mascara',
    mesh(cyl('mcBody', 0.1, 0.105, 0.55), body, { y: 0.275 }),
    mesh(cyl('mcBand', 0.107, 0.107, 0.05), band, { y: 0.575 }),
    mesh(cyl('mcCap', 0.1, 0.1, 0.62), body, { y: 0.91 }),
    mesh(geo('mcTop', () => new THREE.SphereGeometry(0.1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2)), body, { y: 1.22 }),
  );
}

export function eyeliner() {
  return group('eyeliner',
    mesh(cyl('elBody', 0.055, 0.055, 0.95, 32), M.blackMatte(), { y: 0.475 }),
    mesh(cyl('elBand', 0.057, 0.057, 0.04, 32), M.gold(), { y: 0.7 }),
    mesh(cyl('elTip', 0.0, 0.055, 0.14, 32), M.gold(), { y: 1.02 }),
  );
}

export function eyeshadowPalette({ colors, open = 1.85, shell = M.blackGloss() } = {}) {
  colors = colors || ['#f1d7c3', '#d9a98a', '#b77a5c', '#7c4a39', '#e8c2a8', '#c48a74', '#8e5b4f', '#3b2522', '#f3e1c9', '#caa072', '#9c6b4a', '#5a3b2f'];
  const base = geo('epBase', () => new RoundedBoxGeometry(1.3, 0.1, 0.95, 4, 0.04));
  const top = M.map(`pal${colors.join()}`, paletteTexture(colors), { roughness: 0.7, sheen: 0.8, sheenColor: '#ffe' });
  const pans = mesh(geo('epPans', () => new THREE.PlaneGeometry(1.2, 0.86)), top, { y: 0.101, rx: -Math.PI / 2 });
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.1, -0.475);
  hinge.add(mesh(base, shell, { z: 0.475, y: 0.02, sy: 0.4 }));
  hinge.add(mesh(geo('epMir', () => new THREE.BoxGeometry(1.15, 0.004, 0.8)), M.mirror(), { z: 0.475, y: -0.001 }));
  hinge.rotation.x = -open;
  return group('palette', mesh(base, shell, { y: 0.05 }), pans, hinge);
}

export function brush({ handle = M.blackGloss(), ferrule = M.roseGold(), bristle = '#3b2a22', tip = '#efe3d6', kind = 'powder' } = {}) {
  const handleG = lathe('brHandle', [[0, 0], [0.05, 0], [0.07, 0.3], [0.075, 0.9], [0.07, 1.2], [0, 1.2]], 32);
  const ferG = lathe('brFer', [[0, 0], [0.07, 0], [0.085, 0.32], [0, 0.32]], 32);
  const bristleG = kind === 'powder'
    ? lathe('brBrPow', [[0, 0], [0.085, 0], [0.18, 0.2], [0.2, 0.38], [0.15, 0.52], [0.07, 0.58], [0, 0.6]], 32)
    : lathe('brBrFlat', [[0, 0], [0.085, 0], [0.1, 0.18], [0.07, 0.32], [0, 0.35]], 32);
  const br = mesh(bristleG, M.bristle(bristle), { y: 1.52 });
  const brTip = mesh(bristleG, M.bristle(tip), { y: 1.52 + (kind === 'powder' ? 0.3 : 0.18), sx: 0.99, sy: kind === 'powder' ? 0.5 : 0.5, sz: 0.99 });
  // squash tip so only the end shows the lighter colour
  brTip.scale.set(0.8, 0.5, 0.8);
  return group('brush', mesh(handleG, handle), mesh(ferG, ferrule, { y: 1.2 }), br, brTip);
}

// ---------------------------------------------------------------- skincare
export function creamJar({ lid = M.gold(), glassTint = '#ffffff', cream = '#fbf6ef', r = 0.52, h = 0.42 } = {}) {
  const jar = lathe(`jar${r}${h}`, [[0, 0], [r - 0.05, 0], [r, 0.05], [r, h - 0.04], [r - 0.06, h], [r - 0.08, h + 0.05], [0, h + 0.05]]);
  const inner = cyl(`jarIn${r}`, r - 0.12, r - 0.12, h - 0.14, 48);
  const lidG = lathe(`jarLid${r}`, [[0, 0], [r + 0.01, 0], [r + 0.02, 0.02], [r + 0.02, 0.2], [r - 0.02, 0.24], [0, 0.24]]);
  return group('jar',
    mesh(inner, M.cream(cream), { y: h / 2 + 0.03 }),
    mesh(jar, M.glass(glassTint, 0.9, 0.06)),
    mesh(lidG, lid, { y: h + 0.05 }),
  );
}

export function dropperBottle({ tint = '#b0621c', liquid = '#e2a54a', collar = M.gold(), r = 0.22, h = 0.62 } = {}) {
  const body = lathe(`dpB${r}`, bottleProfile({ r, h, shoulder: 0.14, neckR: 0.09, neckH: 0.06 }));
  const liq = lathe(`dpL${r}`, bottleProfile({ r: r - 0.025, h: h * 0.72, shoulder: 0.02, neckR: r - 0.03, neckH: 0 }), 32);
  const bulb = lathe('dpBulb', [[0, 0], [0.085, 0], [0.085, 0.14], [0.095, 0.22], [0.08, 0.32], [0.04, 0.36], [0, 0.365]], 32);
  return group('dropper',
    mesh(liq, M.liquid(liquid, 0.1), { y: 0.02 }),
    mesh(body, M.glass(tint, 0.35)),
    mesh(cyl('dpCol', 0.105, 0.105, 0.14), collar, { y: h + 0.1 }),
    mesh(bulb, M.rubber(), { y: h + 0.17 }),
    labelBand(r + 0.003, 0.26, h * 0.42, { transparentBg: true, fg: '#f6ead7', accent: '#e8c48c', title: 'SERUM', sub: 'VITAMIN C · 30 ml' }, 1.6),
  );
}

export function tonerBottle({ liquid = '#f4c9c9', cap = M.chrome(), r = 0.26, h = 1.15, title = 'TONER', sub = 'ROSE WATER · 200 ml' } = {}) {
  const body = lathe(`tnB${r}${h}`, bottleProfile({ r, h, shoulder: 0.16, neckR: 0.1, neckH: 0.06 }));
  const liq = lathe(`tnL${r}${h}`, bottleProfile({ r: r - 0.02, h: h * 0.82, shoulder: 0.02, neckR: r - 0.03, neckH: 0 }), 32);
  return group('toner',
    mesh(liq, M.liquid(liquid, 0.08), { y: 0.02 }),
    mesh(body, M.glass('#ffffff', 0.25)),
    mesh(cyl(`tnCap${r}`, 0.12, 0.12, 0.3), cap, { y: h + 0.21 }),
    labelBand(r + 0.003, 0.34, h * 0.45, { transparentBg: true, fg: '#3a2c2a', accent: '#b8925a', title, sub }, 1.4),
  );
}

// ---------------------------------------------------------------- fragrance
export function perfume({ style = 0, liquid = '#f1c27d', cap = M.gold() } = {}) {
  if (style === 0) {
    const body = geo('pfBody0', () => new RoundedBoxGeometry(0.85, 0.95, 0.48, 6, 0.12));
    const liq = geo('pfLiq0', () => new RoundedBoxGeometry(0.62, 0.62, 0.28, 4, 0.08));
    return group('perfume',
      mesh(liq, M.liquid(liquid, 0.05), { y: 0.42 }),
      mesh(body, M.glass('#fff8ee', 1.2, 0.01), { y: 0.475 }),
      mesh(cyl('pfNeck', 0.08, 0.08, 0.1), cap, { y: 1.0 }),
      mesh(geo('pfCap0', () => new RoundedBoxGeometry(0.42, 0.42, 0.42, 5, 0.06)), cap, { y: 1.26 }),
    );
  }
  if (style === 1) {
    const body = geo('pfBody1', () => new THREE.SphereGeometry(0.5, 64, 32));
    const liq = geo('pfLiq1', () => new THREE.SphereGeometry(0.36, 48, 24));
    return group('perfume',
      mesh(liq, M.liquid(liquid, 0.05), { y: 0.46, sy: 0.9 }),
      mesh(body, M.glass('#fff2f4', 1.4, 0.01), { y: 0.5, sy: 0.95 }),
      mesh(cyl('pfNeck1', 0.07, 0.07, 0.12), cap, { y: 1.02 }),
      mesh(geo('pfCap1', () => new THREE.CylinderGeometry(0.2, 0.2, 0.34, 8)), M.blackGloss(), { y: 1.25 }),
      mesh(cyl('pfCapRing', 0.205, 0.205, 0.04, 8), cap, { y: 1.1 }),
    );
  }
  // tall faceted
  const body = geo('pfBody2', () => new THREE.CylinderGeometry(0.34, 0.4, 1.15, 6));
  const liq = geo('pfLiq2', () => new THREE.CylinderGeometry(0.26, 0.31, 0.85, 6));
  return group('perfume',
    mesh(liq, M.liquid(liquid, 0.05), { y: 0.47 }),
    mesh(body, M.glass('#f5fbff', 1.0, 0.01), { y: 0.575 }),
    mesh(cyl('pfNeck2', 0.07, 0.07, 0.1), cap, { y: 1.2 }),
    mesh(geo('pfCap2', () => new THREE.CylinderGeometry(0.16, 0.22, 0.5, 6)), cap, { y: 1.5 }),
  );
}

// ---------------------------------------------------------------- hair & body
function ovalBottle(key, { r, h, depth = 0.62, shoulder = 0.3, neckR = 0.12, neckH = 0.08 }) {
  return geo(key, () => {
    const pts = bottleProfile({ r, h, shoulder, neckR, neckH, base: 0.06 }).map(([a, b]) => new THREE.Vector2(a, b));
    const g = new THREE.LatheGeometry(pts, 64);
    g.scale(1, 1, depth);
    return g;
  });
}

export function shampoo({ color = '#f3eee6', pearl = true, cap = '#2a2622', title = 'SHAMPOO', sub = 'NOURISH · 400 ml', accent = '#b8925a', r = 0.42, h = 1.85 } = {}) {
  const body = ovalBottle(`sh${r}${h}`, { r, h });
  const bodyMat = pearl ? M.pearl(color) : M.plastic(color, 0.25);
  const capG = lathe(`shCap${r}`, [[0, 0], [0.16, 0], [0.17, 0.2], [0.14, 0.26], [0, 0.26]]);
  const band = labelBand(r + 0.004, 0.62, h * 0.48, { transparentBg: true, fg: '#2e2622', accent, title, sub }, 1.5);
  band.scale.z = 0.62;
  return group('shampoo', mesh(body, bodyMat), band, mesh(capG, M.plastic(cap, 0.2), { y: h + 0.06 }));
}

export function pumpBottle({ color = '#f5f1ea', pearl = false, pump = M.gold(), title = 'BODY LOTION', sub = 'SHEA · 500 ml', accent = '#b8925a', r = 0.4, h = 1.7, glassTint } = {}) {
  const body = lathe(`pb${r}${h}`, bottleProfile({ r, h, shoulder: 0.22, neckR: 0.13, neckH: 0.08 }));
  const kids = [];
  if (glassTint) {
    const liq = lathe(`pbL${r}${h}`, bottleProfile({ r: r - 0.03, h: h * 0.8, shoulder: 0.03, neckR: r - 0.04, neckH: 0 }), 32);
    kids.push(mesh(liq, M.liquid(color, 0.2), { y: 0.03 }), mesh(body, M.glass(glassTint, 0.4)));
  } else {
    kids.push(mesh(body, pearl ? M.pearl(color) : M.plastic(color, 0.3)));
  }
  const top = h + 0.08;
  kids.push(
    mesh(cyl(`pbCollar${r}`, 0.15, 0.15, 0.14), pump, { y: top + 0.07 }),
    mesh(cyl('pbStem', 0.035, 0.035, 0.22, 16), pump, { y: top + 0.25 }),
    mesh(geo('pbHead', () => new RoundedBoxGeometry(0.16, 0.12, 0.5, 3, 0.04)), pump, { y: top + 0.4, z: 0.12 }),
    labelBand(r + 0.004, 0.52, h * 0.47, { transparentBg: true, fg: '#2e2622', accent, title, sub }, 1.4),
  );
  return group('pump', kids);
}

export function aerosol({ body = M.alu(), cap = '#1a1a1c', r = 0.26, h = 1.5, title = 'HAIR SPRAY', sub = 'STRONG HOLD · 300 ml', labelFg = '#1d1b1b' } = {}) {
  const can = lathe(`aer${r}${h}`, [[0, 0], [r - 0.03, 0], [r, 0.04], [r, h], [r - 0.05, h + 0.08], [0.12, h + 0.14], [0.12, h + 0.17], [0, h + 0.17]]);
  const capG = lathe(`aerCap${r}`, [[0, 0], [r - 0.005, 0], [r - 0.005, 0.28], [r - 0.07, 0.36], [0, 0.36]]);
  return group('aerosol',
    mesh(can, body),
    mesh(capG, M.plastic(cap, 0.25), { y: h + 0.02 }),
    labelBand(r + 0.003, h * 0.55, h * 0.45, { transparentBg: true, fg: labelFg, accent: '#b8925a', title, sub }, 1.5),
  );
}

export function tub({ lid = '#f3eee6', body = '#f3eee6', title = 'HAIR MASK', sub = 'REPAIR · 250 ml', r = 0.58, h = 0.5 } = {}) {
  const b = lathe(`tub${r}${h}`, [[0, 0], [r - 0.06, 0], [r - 0.02, 0.03], [r, h], [0, h]]);
  const l = lathe(`tubLid${r}`, [[0, 0], [r + 0.02, 0], [r + 0.03, 0.03], [r + 0.03, 0.16], [r, 0.2], [0, 0.2]]);
  return group('tub',
    mesh(b, M.plastic(body, 0.3)),
    mesh(l, M.plastic(lid, 0.22), { y: h - 0.02 }),
    labelBand(r - 0.006, h * 0.6, h * 0.45, { transparentBg: true, fg: '#2e2622', accent: '#b8925a', title, sub }, 1.2),
  );
}

export function showerGel({ tint = '#7fb8d9', cap = '#f1f1f1', title = 'SHOWER GEL', sub = 'OCEAN · 500 ml', r = 0.4, h = 1.75 } = {}) {
  const body = ovalBottle(`sg${r}${h}`, { r, h, depth: 0.55, shoulder: 0.26 });
  const capG = lathe('sgCap', [[0, 0], [0.16, 0], [0.16, 0.22], [0.12, 0.28], [0, 0.28]]);
  const band = labelBand(r + 0.005, 0.58, h * 0.48, { transparentBg: true, fg: '#ffffff', accent: '#ffffff', title, sub }, 1.3);
  band.scale.z = 0.55;
  return group('showergel', mesh(body, M.tintedPlastic(tint)), band, mesh(capG, M.plastic(cap, 0.2), { y: h + 0.06 }));
}

export function deodorantStick({ color = '#eef1f4', cap = '#27415e' } = {}) {
  const b = geo('deoB', () => { const g = new RoundedBoxGeometry(0.62, 1.0, 0.34, 5, 0.15); return g; });
  const c = geo('deoC', () => new RoundedBoxGeometry(0.64, 0.4, 0.36, 5, 0.15));
  return group('deodorant',
    mesh(b, M.plastic(color, 0.3), { y: 0.5 }),
    mesh(c, M.plastic(cap, 0.2), { y: 1.14 }),
  );
}

// ---------------------------------------------------------------- gift set
export function giftSet({ box = '#1b1718', satin = '#e9d3c9', ribbon = '#c9a26b' } = {}) {
  const w = 2.2, d = 1.5, h = 0.42;
  const outer = geo('gsOuter', () => new RoundedBoxGeometry(w, h, d, 3, 0.03));
  const g = group('giftset',
    mesh(outer, M.plastic(box, 0.5), { y: h / 2 }),
    mesh(geo('gsIn', () => new THREE.BoxGeometry(w - 0.12, 0.02, d - 0.12)), M.satin(satin), { y: h + 0.001 }),
  );
  // lid leaning behind
  const lid = mesh(geo('gsLid', () => new RoundedBoxGeometry(w + 0.04, 0.16, d + 0.04, 3, 0.03)), M.plastic(box, 0.5), { y: 0.82, z: -d / 2 - 0.12, rx: -1.25 });
  const rib = mesh(geo('gsRib', () => new THREE.BoxGeometry(0.16, 0.172, d + 0.06)), M.satin(ribbon), {});
  lid.add(rib);
  g.add(lid);
  // contents
  const items = [
    [perfume({ style: 0, liquid: '#f0b9a8' }), -0.62, 0.95],
    [lipstick({ color: '#a2213b' }), 0.12, 1],
    [creamJar({ r: 0.32, h: 0.28, lid: M.roseGold() }), 0.72, 1],
    [lipstick({ color: '#c9546c', caseMat: M.roseGold() }), 0.34, 1],
  ];
  items.forEach(([o, x, s]) => { o.position.set(x, h - 0.05, 0.05); o.scale.setScalar(s * 0.75); g.add(o); });
  return g;
}

// ---------------------------------------------------------------- catalogue
// Varied product factory used to fill shelves, trays and the hero ring.
export const CATALOGUE = {
  lipstick: () => lipstick({ color: pick(['#9e1b32', '#b3314f', '#c65b6a', '#7d1b2b', '#d27b73']), capped: false }),
  lipstickCapped: () => lipstick({ capped: true, caseMat: pick([M.gold(), M.roseGold(), M.blackGloss()]) }),
  gloss: () => lipGloss({ color: pick(['#d4577a', '#e98a8a', '#c24a5a', '#f0a6a0']) }),
  foundation: () => foundation({ shade: pick(['#e0b28f', '#d19f78', '#b98160', '#f0c9a8']) }),
  concealer: () => concealer(),
  bb: () => squeezeTube({ title: 'BB CREAM', sub: 'SPF 30 · 50 ml', body: '#efe3d8' }),
  compact: () => compact({ powder: pick(['#e6b69a', '#dcaa8a', '#f0cbb2']) }),
  blush: () => blush({ color: pick(['#e58f8f', '#e7a08a', '#d97b86']) }),
  mascara: () => mascara(),
  eyeliner: () => eyeliner(),
  palette: () => eyeshadowPalette({ open: 3.05, shell: M.roseGold() }),
  brush: () => brush({ kind: pick(['powder', 'flat']) }),
  faceWash: () => squeezeTube({ title: 'FACE WASH', sub: 'GENTLE FOAM · 150 ml', body: '#ffffff', cap: '#9cc9b4', accent: '#6fae93', r: 0.27, h: 1.45 }),
  sunscreen: () => squeezeTube({ title: 'SUNSCREEN', sub: 'SPF 50+ · 100 ml', body: '#fff7ec', cap: '#f0a45a', accent: '#e08a3c', r: 0.26, h: 1.35 }),
  moisturizer: () => creamJar({ lid: pick([M.gold(), M.roseGold(), M.chrome()]) }),
  serum: () => dropperBottle(),
  toner: () => tonerBottle(),
  perfume: () => perfume({ style: Math.floor(Math.random() * 3), liquid: pick(['#f1c27d', '#f0b9a8', '#e8d6a0', '#f7d8e2']) }),
  shampoo: () => shampoo({ color: '#f3eee6' }),
  conditioner: () => shampoo({ color: '#d9e3d4', pearl: false, cap: '#f5f2ec', title: 'CONDITIONER', sub: 'SMOOTH · 400 ml', accent: '#7c9a6f' }),
  hairMask: () => tub(),
  hairSerum: () => pumpBottle({ r: 0.2, h: 0.75, color: '#e7b35a', glassTint: '#fff2d8', pump: M.gold(), title: 'HAIR OIL', sub: 'ARGAN · 50 ml' }),
  styling: () => aerosol(),
  bodyLotion: () => pumpBottle(),
  bodyWash: () => showerGel({ tint: '#e9a7b8', title: 'BODY WASH', sub: 'ROSE · 500 ml' }),
  showerGel: () => showerGel(),
  deoSpray: () => aerosol({ body: M.plastic('#f2f2f4', 0.2), cap: '#9fb7cf', r: 0.2, h: 1.25, title: 'DEODORANT', sub: '48H FRESH · 150 ml' }),
  deoStick: () => deodorantStick(),
  giftSet: () => giftSet(),
};

let seed = 1337;
export function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
export function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
// Math.random is used in perfume style pick – route it through the seeded rng
// so renders are deterministic.
Math.random = rand;
