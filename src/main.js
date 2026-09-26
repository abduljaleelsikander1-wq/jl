// NMT Trading LLC — 3D cosmetics wholesale commercial (left-side composition).
// Real-time Three.js scene. Deterministic: everything is a function of time t,
// so the same frame can be re-rendered at any resolution for stills/video.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import * as P from './products.js';
import * as T from './textures.js';

const params = new URLSearchParams(location.search);
const CAPTURE = params.has('capture');
const QUALITY = params.get('q') || 'high';
const HI = QUALITY !== 'low';
const LOOP = 24; // seconds — seamless loop length
const SHOT = params.get('shot') || 'wide'; // 'wide' (default composition) | 'hero' (product close-up)

// Where the look-at target sits horizontally (fraction of frame width).
// 0.3 keeps the showcase on the left and leaves the right ~45% as copy space.
const FOCUS_X = 0.34;

await document.fonts.load('600 40px "Cormorant Garamond"').catch(() => {});
await document.fonts.load('600 40px Montserrat').catch(() => {});
await document.fonts.load('500 40px Montserrat').catch(() => {});

// ------------------------------------------------------------------ renderer
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: CAPTURE, powerPreference: 'high-performance' });
renderer.setPixelRatio(CAPTURE ? 1 : Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
T.setMaxAnisotropy(renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
const BG = new THREE.Color('#0e0b0a');
scene.background = BG;
scene.fog = new THREE.FogExp2('#120e0c', 0.018);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.5, 160);

// ------------------------------------------------------------------ lights
scene.add(new THREE.HemisphereLight('#fff1e0', '#2a1c16', 0.35));

const key = new THREE.SpotLight('#fff0dc', 800, 0, 0.5, 0.8, 2);
key.position.set(-7, 22, 14);
key.target.position.set(-1.5, 1.5, 0);
key.castShadow = true;
key.shadow.mapSize.set(HI ? 4096 : 1024, HI ? 4096 : 1024);
key.shadow.bias = -0.00015;
key.shadow.normalBias = 0.02;
key.shadow.radius = 6;
key.shadow.camera.near = 8; key.shadow.camera.far = 60;
scene.add(key, key.target);

const rim = new THREE.SpotLight('#ffc2b8', 900, 0, 0.5, 0.9, 2);
rim.position.set(9, 12, -8);
rim.target.position.set(0, 2, 0);
scene.add(rim, rim.target);

const fill = new THREE.PointLight('#ffd9b0', 60, 0, 2);
fill.position.set(6, 5, 12);
scene.add(fill);

const warm = new THREE.PointLight('#ffb98a', 220, 0, 2);
warm.position.set(-10, 9, -9);
scene.add(warm);

// ------------------------------------------------------------------ floor
const FLOOR = new THREE.Group();
scene.add(FLOOR);
if (HI) {
  const refl = new Reflector(new THREE.PlaneGeometry(120, 120), {
    textureWidth: 1024, textureHeight: 1024, color: '#8a8580', clipBias: 0.003,
  });
  refl.rotation.x = -Math.PI / 2;
  refl.position.y = -0.01;
  FLOOR.add(refl);
}
const floorRough = T.floorRoughnessTexture();
floorRough.repeat.set(10, 10);
const floorMat = new THREE.MeshPhysicalMaterial({
  color: '#1b1614', roughness: 0.42, roughnessMap: floorRough, metalness: 0.0,
  clearcoat: 0.6, clearcoatRoughness: 0.2,
  transparent: HI, opacity: HI ? 0.82 : 1,
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
FLOOR.add(floor);

// Back wall + side wall with subtle panel seams
const wallMat = new THREE.MeshStandardMaterial({ color: '#221b18', roughness: 0.9 });
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), wallMat);
backWall.position.set(-10, 20, -19);
backWall.receiveShadow = true;
scene.add(backWall);

// ------------------------------------------------------------------ helpers
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const tmpE = new THREE.Euler();

function mat(x, y, z, ry = 0, s = 1) {
  tmpE.set(0, ry, 0);
  tmpQ.setFromEuler(tmpE);
  return new THREE.Matrix4().compose(tmpV.set(x, y, z), tmpQ, tmpS.set(s, s, s));
}

// Builds one product and turns each of its meshes into an InstancedMesh —
// used for bulk quantities (trays, shelves) at a fraction of the draw calls.
function instanced(factory, matrices, { shadow = true } = {}) {
  const proto = factory();
  proto.updateMatrixWorld(true);
  const out = new THREE.Group();
  proto.traverse((o) => {
    if (!o.isMesh) return;
    const im = new THREE.InstancedMesh(o.geometry, o.material, matrices.length);
    matrices.forEach((m, i) => im.setMatrixAt(i, tmpM.multiplyMatrices(m, o.matrixWorld)));
    im.castShadow = shadow && o.castShadow;
    im.receiveShadow = true;
    im.computeBoundingSphere();
    out.add(im);
  });
  return out;
}

function shadowAll(obj, cast = true) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = true; } });
  return obj;
}

// ------------------------------------------------------------------ cartons & pallets
const CW = 3.0, CH = 2.3, CD = 2.3;
const cartonSideMats = [0, 1, 2].map((v) => new THREE.MeshStandardMaterial({ map: T.cartonTexture({ variant: v }), roughness: 0.88 }));
const cartonTopMat = new THREE.MeshStandardMaterial({ map: T.cartonTopTexture(), roughness: 0.85 });
const cartonGeo = new RoundedBoxGeometry(CW, CH, CD, 2, 0.04);
function cartonMats(v) {
  const s = cartonSideMats[v % 3];
  return [s, s, cartonTopMat, cartonTopMat, s, s];
}

function cartonStack(list, v = 0) {
  // list: array of [x, y, z, ry]
  const g = new THREE.Group();
  const byVar = [[], [], []];
  list.forEach((p, i) => byVar[(v + i) % 3].push(p));
  byVar.forEach((arr, k) => {
    if (!arr.length) return;
    const im = new THREE.InstancedMesh(cartonGeo, cartonMats(k), arr.length);
    arr.forEach(([x, y, z, ry = 0], i) => im.setMatrixAt(i, mat(x, y + CH / 2, z, ry)));
    im.castShadow = im.receiveShadow = true;
    im.computeBoundingSphere();
    g.add(im);
  });
  return g;
}

const woodMat = new THREE.MeshStandardMaterial({ color: '#a8875e', roughness: 0.82 });
function pallet() {
  const g = new THREE.Group();
  const W = 6.4, D = 4.8;
  const board = new THREE.BoxGeometry(W, 0.12, 0.62);
  for (let i = 0; i < 6; i++) g.add(new THREE.Mesh(board, woodMat).translateZ(-D / 2 + 0.31 + i * ((D - 0.62) / 5)).translateY(0.62));
  const block = new THREE.BoxGeometry(0.6, 0.44, 0.6);
  for (const x of [-W / 2 + 0.3, 0, W / 2 - 0.3]) for (const z of [-D / 2 + 0.3, 0, D / 2 - 0.3]) g.add(new THREE.Mesh(block, woodMat).translateX(x).translateZ(z).translateY(0.34));
  const skid = new THREE.BoxGeometry(W, 0.12, 0.62);
  for (const z of [-D / 2 + 0.31, 0, D / 2 - 0.31]) g.add(new THREE.Mesh(skid, woodMat).translateZ(z).translateY(0.06));
  return shadowAll(g);
}

function palletLoad({ x, z, ry = 0, rows = 2, cols = 2, layers = 3, wrap = false, v = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  g.add(pallet());
  const list = [];
  for (let l = 0; l < layers; l++) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (l === layers - 1 && r === rows - 1 && c === cols - 1 && layers > 2) continue; // stepped top
    list.push([(c - (cols - 1) / 2) * (CW + 0.04), 0.68 + l * (CH + 0.02), (r - (rows - 1) / 2) * (CD + 0.04), 0]);
  }
  g.add(cartonStack(list, v));
  if (wrap) {
    const film = new THREE.Mesh(
      new RoundedBoxGeometry(cols * (CW + 0.04) + 0.1, layers * CH + 0.1, rows * (CD + 0.04) + 0.1, 3, 0.12),
      new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.18, transmission: 1, thickness: 0.05, ior: 1.3, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    film.position.y = 0.68 + (layers * CH) / 2;
    g.add(film);
  }
  scene.add(g);
  return g;
}

// Open wholesale carton with dividers, filled with a grid of one product.
function openCarton({ x, z, ry = 0, factory, cols = 5, rows = 4, s = 1, lift = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  const side = cartonSideMats[0], top = cartonTopMat;
  const t = 0.05, W = CW * 1.15, D = CD * 1.15, H = CH * 0.95;
  const wall = (w, h, d, px, py, pz, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); g.add(o); return o; };
  wall(W, t, D, 0, t / 2, 0, top);
  wall(W, H, t, 0, H / 2, D / 2, side);
  wall(W, H, t, 0, H / 2, -D / 2, side);
  wall(t, H, D, W / 2, H / 2, 0, top);
  wall(t, H, D, -W / 2, H / 2, 0, top);
  // open flaps
  const flap = (w, d, px, pz, axis, ang) => {
    const pivot = new THREE.Group();
    pivot.position.set(px, H, pz);
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), top);
    if (axis === 'x') { f.position.z = Math.sign(pz) * d / 2; pivot.rotation.x = Math.sign(pz) * ang; } else { f.position.x = Math.sign(px) * w / 2; pivot.rotation.z = -Math.sign(px) * ang; }
    pivot.add(f); g.add(pivot);
  };
  flap(W, D / 2, 0, D / 2, 'x', 2.2);
  flap(W, D / 2, 0, -D / 2, 'x', 2.0);
  flap(W / 2, D, W / 2, 0, 'z', 2.3);
  flap(W / 2, D, -W / 2, 0, 'z', 2.1);
  // divider grid
  const divMat = new THREE.MeshStandardMaterial({ color: '#c9a77c', roughness: 0.9 });
  const dh = H * 0.55;
  for (let c = 1; c < cols; c++) wall(0.025, dh, D - t * 2, -W / 2 + (W / cols) * c, dh / 2, 0, divMat);
  for (let r = 1; r < rows; r++) wall(W - t * 2, dh, 0.025, 0, dh / 2, -D / 2 + (D / rows) * r, divMat);
  shadowAll(g);
  // bulk product grid
  const ms = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    ms.push(mat(-W / 2 + (W / cols) * (c + 0.5), t + lift, -D / 2 + (D / rows) * (r + 0.5), 0.15 * Math.sin(r * 3 + c), s));
  }
  g.add(instanced(factory, ms));
  scene.add(g);
  return g;
}

// ------------------------------------------------------------------ warehouse racking
const rackMetal = new THREE.MeshPhysicalMaterial({ color: '#2b2826', metalness: 0.85, roughness: 0.38 });
const rackBeam = new THREE.MeshPhysicalMaterial({ color: '#8c6f4a', metalness: 0.9, roughness: 0.3 });
const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd7a6').multiplyScalar(3.2), toneMapped: true });
const deckMat = new THREE.MeshStandardMaterial({ color: '#3a322d', roughness: 0.6, metalness: 0.3 });

function rack({ x0, z, bays = 3, bayW = 7.2, levels = [0.35, 3.6, 6.85, 10.1], depth = 2.8 }) {
  const g = new THREE.Group();
  const H = levels[levels.length - 1] + 1.2;
  const up = new THREE.BoxGeometry(0.16, H, 0.16);
  for (let b = 0; b <= bays; b++) for (const dz of [-depth / 2, depth / 2]) {
    const m = new THREE.Mesh(up, rackMetal); m.position.set(x0 + b * bayW, H / 2, z + dz); g.add(m);
  }
  for (let b = 0; b < bays; b++) {
    const cx = x0 + b * bayW + bayW / 2;
    levels.forEach((ly) => {
      for (const dz of [-depth / 2, depth / 2]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(bayW, 0.22, 0.12), rackBeam);
        beam.position.set(cx, ly, z + dz); g.add(beam);
      }
      const deck = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.1, 0.05, depth), deckMat);
      deck.position.set(cx, ly + 0.12, z); g.add(deck);
      if (ly > 1) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.3, 0.035, 0.05), ledMat);
        led.position.set(cx, ly - 0.14, z + depth / 2 + 0.08); g.add(led);
      }
    });
  }
  shadowAll(g);
  scene.add(g);
  return { g, bayW, levels, depth };
}

const RX0 = -21;
const R = rack({ x0: RX0, z: -15.5, bays: 4 });
// fill rack: cartons on some bays, bulk product rows on others
{
  const cartonSpots = [];
  const productRows = [
    // [bay, level, factory, count, scale]
    [1, 1, P.CATALOGUE.shampoo, 9, 1.0],
    [1, 2, P.CATALOGUE.bodyLotion, 9, 1.0],
    [2, 1, P.CATALOGUE.perfume, 12, 1.1],
    [2, 2, P.CATALOGUE.toner, 13, 1.1],
    [3, 1, P.CATALOGUE.showerGel, 9, 1.0],
    [3, 2, P.CATALOGUE.styling, 12, 1.05],
    [2, 0, P.CATALOGUE.moisturizer, 7, 1.4],
  ];
  const used = new Set(productRows.map(([b, l]) => `${b}-${l}`));
  for (let b = 0; b < 4; b++) R.levels.forEach((ly, li) => {
    if (used.has(`${b}-${li}`)) return;
    if (li === 3) return; // top level stays lighter — logo panel sits above
    const cx = RX0 + b * R.bayW + R.bayW / 2;
    const n = 2;
    for (let k = 0; k < n; k++) {
      cartonSpots.push([cx + (k - 0.5) * (CW + 0.2), ly + 0.15, -15.5, 0]);
      if (li === 0 || (b + li) % 2 === 0) cartonSpots.push([cx + (k - 0.5) * (CW + 0.2), ly + 0.15 + CH, -15.5, 0]);
    }
  });
  scene.add(cartonStack(cartonSpots, 1));
  productRows.forEach(([b, li, f, n, s]) => {
    const cx = RX0 + b * R.bayW + R.bayW / 2;
    const ly = R.levels[li] + 0.15;
    const ms = [];
    const span = R.bayW - 0.8;
    for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) {
      ms.push(mat(cx - span / 2 + (span / (n - 1)) * i, ly, -15.5 + (row - 0.5) * 1.1, 0, s));
    }
    scene.add(instanced(f, ms));
  });
}

// Illuminated corporate logo panel above the racking
{
  const { map, emissive } = T.logoPanelTextures();
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(15, 4.7, 0.25),
    [rackMetal, rackMetal, rackMetal, rackMetal,
      new THREE.MeshPhysicalMaterial({ map, emissiveMap: emissive, emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 2.4, metalness: 0.6, roughness: 0.35, clearcoat: 1 }),
      rackMetal],
  );
  panel.position.set(-6.6, 15.4, -16.4);
  scene.add(panel);
  // halo backlight
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(17.5, 7), new THREE.MeshBasicMaterial({ map: T.glowTexture('rgba(255,200,140,0.55)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.position.set(-6.6, 15.4, -16.6);
  scene.add(halo);
}

// ------------------------------------------------------------------ pallets & open cartons
palletLoad({ x: -11.2, z: -5.2, ry: 0.12, rows: 2, cols: 2, layers: 3, v: 0 });
palletLoad({ x: -17.2, z: -9.6, ry: -0.08, rows: 2, cols: 2, layers: 3, wrap: true, v: 1 });
palletLoad({ x: -4.6, z: -9.8, ry: 0.05, rows: 2, cols: 2, layers: 2, v: 2 });
// loose shipment cartons ready for dispatch
scene.add(cartonStack([[-6.6, 0, -2.6, 0.3], [-6.4, CH, -2.5, 0.18], [-15.2, 0, -2.2, -0.2]], 2));

openCarton({ x: -5.6, z: 5.2, ry: 0.35, factory: () => P.lipstick({ color: '#9e1b32', capped: false }), cols: 6, rows: 5, s: 1.0, lift: 0.9 });
openCarton({ x: -9.4, z: 4.9, ry: 0.2, factory: () => P.dropperBottle(), cols: 5, rows: 4, s: 1.05, lift: 0.95 });
openCarton({ x: -12.8, z: 1.6, ry: 0.1, factory: () => P.perfume({ style: 0, liquid: '#f0b9a8' }), cols: 4, rows: 3, s: 0.95, lift: 0.9 });

// ------------------------------------------------------------------ hero podium
const HERO = new THREE.Group();
scene.add(HERO);
const marble = new THREE.MeshPhysicalMaterial({ color: '#efe6dd', roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.3 });
const podium = new THREE.Group();
const pod1 = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.35, 0.55, 128), marble); pod1.position.y = 0.275;
const trim1 = new THREE.Mesh(new THREE.TorusGeometry(3.32, 0.035, 12, 160), P.M.gold()); trim1.rotation.x = Math.PI / 2; trim1.position.y = 0.55;
const pod2 = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.3, 0.4, 128), marble); pod2.position.y = 0.75;
const trim2 = new THREE.Mesh(new THREE.TorusGeometry(2.27, 0.03, 12, 160), P.M.gold()); trim2.rotation.x = Math.PI / 2; trim2.position.y = 0.95;
podium.add(pod1, trim1, pod2, trim2);
shadowAll(podium);
HERO.add(podium);

const heroTop = 0.95;
const heroStanding = [
  [P.perfume({ style: 0, liquid: '#f1c27d' }), -0.35, 0.1, 2.1, 0.35],
  [P.dropperBottle(), 1.05, 0.55, 2.1, -0.3],
  [P.creamJar({ lid: P.M.gold() }), 0.25, 1.35, 1.7, 0],
  [P.foundation({ shade: '#d9a882' }), -1.45, 0.55, 1.8, 0.4],
  [P.lipstick({ color: '#9e1b32' }), 1.6, -0.55, 2.0, 0],
  [P.tonerBottle({ liquid: '#f3cfd0' }), 0.35, -1.25, 1.75, 0.1],
  [P.compact({ powder: '#e6b69a', open: 1.75 }), -1.1, 1.45, 1.6, 0.6],
  [P.lipGloss({ color: '#d4577a' }), 1.72, 0.9, 1.7, 0],
  [P.perfume({ style: 1, liquid: '#f7d8e2' }), -1.25, -1.05, 1.6, 0.2],
];
heroStanding.forEach(([o, x, z, s, ry]) => {
  o.position.set(x, heroTop, z); o.scale.setScalar(s * 1.08); o.rotation.y = ry; shadowAll(o); HERO.add(o);
});

// floating orbit of the full category range
const orbitDefs = [
  ['lipstickCapped', 1.6], ['palette', 1.3], ['mascara', 1.6], ['serum', 1.6], ['sunscreen', 1.4], ['perfume', 1.6],
  ['shampoo', 1.05], ['blush', 1.5], ['faceWash', 1.3], ['hairSerum', 1.5], ['brush', 1.4], ['bodyWash', 1.0],
  ['moisturizer', 1.3], ['eyeliner', 1.7], ['deoSpray', 1.15], ['bb', 1.4], ['conditioner', 1.05], ['gloss', 1.7],
  ['hairMask', 1.2], ['styling', 1.1], ['concealer', 1.7], ['deoStick', 1.2], ['toner', 1.3], ['giftSet', 0.85],
];
const orbit = orbitDefs.map(([k, s], i) => {
  const o = P.CATALOGUE[k]();
  // centre the product on its own height so it spins about its middle
  const box = new THREE.Box3().setFromObject(o);
  const holder = new THREE.Group();
  o.position.y = -(box.min.y + box.max.y) / 2;
  holder.add(o);
  holder.scale.setScalar(s * 1.3);
  shadowAll(holder);
  HERO.add(holder);
  return { holder, i, phase: (i / orbitDefs.length) * Math.PI * 2, tier: i % 2 };
});

function orbitPose(it, t, out = new THREE.Vector3()) {
  const w = (Math.PI * 2) / LOOP;                    // one revolution per loop
  const a = it.phase + t * w * (it.tier ? 1 : 1);
  const r = it.tier ? 6.1 : 4.9;
  const y = (it.tier ? 7.2 : 4.5) + 0.55 * Math.sin(a * 2 + it.i) + 0.18 * Math.sin(t * (Math.PI * 2 / LOOP) * 4 + it.i * 1.7);
  return out.set(-0.8 + Math.cos(a) * r, y, Math.sin(a) * r * 0.82);
}

// ------------------------------------------------------------------ 1 PC / 2 PCS groups
const acrylic = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 1, thickness: 0.8, ior: 1.49, clearcoat: 1 });
function plinth(x, _y, z, h, items, tagA, tagB) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const b = new THREE.Mesh(new RoundedBoxGeometry(1.9, h, 1.9, 4, 0.08), acrylic);
  b.position.y = h / 2;
  const base = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.08, 2.0, 2, 0.03), P.M.gold());
  base.position.y = h + 0.04;
  g.add(b, base);
  items.forEach(([o, ox, oz, s, ry]) => { o.position.set(ox, h + 0.08, oz); o.scale.setScalar(s); o.rotation.y = ry; g.add(o); });
  shadowAll(g);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.56), new THREE.MeshBasicMaterial({ map: T.tagTexture(tagA, tagB), transparent: true, depthWrite: false }));
  plaque.position.set(0, h * 0.5, 0.97);
  g.add(plaque);
  g.rotation.y = -0.25;
  scene.add(g);
  return g;
}
plinth(0.4, 0, 6.3, 0.75, [[P.perfume({ style: 2, liquid: '#e8d6a0' }), 0, 0, 1.3, 0.3]], '1 PC', 'SINGLE UNIT');
plinth(3.3, 0, 5.2, 0.75, [[P.lipstick({ color: '#b3314f', capped: true, caseMat: P.M.gold() }), -0.35, 0, 1.5, 0], [P.lipstick({ color: '#b3314f', capped: true, caseMat: P.M.gold() }), 0.35, 0.1, 1.5, 0.4]], '2 PCS', 'TWIN PACK');

// ------------------------------------------------------------------ holographic arcs
const holo = new THREE.Group();
HERO.add(holo);
const arcMat = (c, o) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2.2), transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
const arcs = [
  [4.1, 4.4, 0.25, 0.1, '#ffd29a', 0.6],
  [5.2, 3.6, -0.18, 1.7, '#ffb4b0', 0.4],
  [3.5, 5.0, 0.12, 3.2, '#fff0d6', 0.35],
  [6.4, 2.6, -0.08, 0.6, '#ffcf8f', 0.25],
];
const arcMeshes = arcs.map(([r, len, tilt, rot, c, o], i) => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012 + i * 0.002, 6, 320, len), arcMat(c, o));
  const piv = new THREE.Group();
  piv.rotation.set(Math.PI / 2 + tilt, 0, 0);
  piv.position.y = 2.2 + i * 0.9;
  m.rotation.z = rot;
  piv.add(m);
  holo.add(piv);
  return m;
});
// glowing ring on the podium lip
const podGlow = new THREE.Mesh(new THREE.TorusGeometry(3.42, 0.02, 8, 256), arcMat('#ffd6a0', 0.9));
podGlow.rotation.x = Math.PI / 2; podGlow.position.y = 0.04;
HERO.add(podGlow);

// ------------------------------------------------------------------ supply-chain flow
// Supplier → NMT Trading LLC → Wholesale buyer → Retail / customer
const FLOW = new THREE.Group();
scene.add(FLOW);
const holoMat = new THREE.MeshPhysicalMaterial({ color: '#ffe2b8', emissive: '#ffb45a', emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.3, transparent: true, opacity: 0.9 });
function iconSupplier() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.6), holoMat); b.position.y = 0.28; g.add(b);
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.6), holoMat); r.position.set(-0.4 + i * 0.4, 0.62, 0); r.rotation.z = 0.5; g.add(r); }
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 12), holoMat); c.position.set(0.45, 0.85, 0); g.add(c);
  return g;
}
function iconNMT() {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), new THREE.MeshBasicMaterial({ map: T.tagTexture('NMT', '', { w: 256, h: 256 }), transparent: true }));
  disc.position.y = 0.55;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.035, 12, 96), P.M.gold());
  rim.position.y = 0.55;
  g.add(rim);
  g.add(disc);
  return g;
}
function iconWholesale() {
  const g = new THREE.Group();
  const bx = new THREE.BoxGeometry(0.42, 0.34, 0.42);
  [[-0.23, 0.17, 0], [0.23, 0.17, 0], [0, 0.52, 0]].forEach(([x, y, z]) => { const m = new THREE.Mesh(bx, holoMat); m.position.set(x, y, z); g.add(m); });
  const p = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.6), holoMat); p.position.y = -0.04; g.add(p);
  return g;
}
function iconRetail() {
  const g = new THREE.Group();
  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.32), holoMat); bag.position.y = 0.4; g.add(bag);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 32, Math.PI), holoMat); h.position.y = 0.8; g.add(h);
  return g;
}
const nodes = [
  { p: new THREE.Vector3(-14.5, 9.4, -7.5), icon: iconSupplier(), a: 'SUPPLIER', b: 'GLOBAL SOURCING' },
  { p: new THREE.Vector3(-8.6, 10.4, -6.2), icon: iconNMT(), a: 'NMT TRADING LLC', b: 'IMPORT · STOCK · DISTRIBUTE' },
  { p: new THREE.Vector3(-3.0, 10.0, -5.2), icon: iconWholesale(), a: 'WHOLESALE BUYER', b: 'BULK ORDERS' },
  { p: new THREE.Vector3(2.4, 10.6, -4.2), icon: iconRetail(), a: 'RETAIL · CUSTOMER', b: 'SHELF READY' },
];
const ringMat = arcMat('#ffd29a', 0.85);
nodes.forEach((n, i) => {
  const g = new THREE.Group();
  g.position.copy(n.p);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(i === 1 ? 1.25 : 1.0, 0.025, 8, 128), ringMat);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(i === 1 ? 1.45 : 1.15, 0.008, 6, 128, 4.2), arcMat('#fff1dc', 0.5));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(i === 1 ? 1.2 : 0.96, 64), new THREE.MeshPhysicalMaterial({ color: '#2a2220', transmission: 0.6, roughness: 0.25, thickness: 0.2, transparent: true, opacity: 0.55, depthWrite: false }));
  g.add(disc, ring, ring2);
  n.icon.position.set(0, -0.45, 0.2);
  n.icon.scale.setScalar(i === 1 ? 1.2 : 1);
  g.add(n.icon);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tagTexture(n.a, n.b, { w: 768, h: 192 }), transparent: true, depthWrite: false, depthTest: false }));
  tag.renderOrder = 10;
  tag.scale.set(i === 1 ? 4.4 : 3.7, i === 1 ? 1.1 : 0.92, 1);
  tag.position.set(0, -1.95, 0);
  g.add(tag);
  n.group = g; n.ring2 = ring2;
  FLOW.add(g);
});
const glowTex = T.glowTexture();
const linkCurves = [];
for (let i = 0; i < nodes.length - 1; i++) {
  const a = nodes[i].p, b = nodes[i + 1].p;
  const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 2.2, 0.6));
  const curve = new THREE.QuadraticBezierCurve3(a.clone().add(new THREE.Vector3(1.2, 0.2, 0)), mid, b.clone().add(new THREE.Vector3(-1.2, 0.2, 0)));
  linkCurves.push(curve);
  FLOW.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.02, 6), arcMat('#ffcf95', 0.55)));
  FLOW.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.06, 6), arcMat('#ffb070', 0.08)));
}
const pulseMat = new THREE.SpriteMaterial({ map: glowTex, color: '#ffe0b0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const pulses = [];
linkCurves.forEach((c, li) => { for (let k = 0; k < 3; k++) { const s = new THREE.Sprite(pulseMat.clone()); s.scale.setScalar(0.55); FLOW.add(s); pulses.push({ s, c, off: k / 3 + li * 0.13 }); } });

// Global network hologram: dotted globe with route arcs behind the supplier node
const globe = new THREE.Group();
globe.position.set(-18.5, 11.5, -13.5);
scene.add(globe);
{
  const N = 900, pos = new Float32Array(N * 3), R0 = 4.2;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    pos.set([Math.cos(th) * r * R0, y * R0, Math.sin(th) * r * R0], i * 3);
  }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  globe.add(new THREE.Points(gg, new THREE.PointsMaterial({ color: '#ffcf9a', size: 0.07, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })));
  const rnd = (k) => { const th = k * 2.1 + 0.3, ph = Math.acos(1 - 2 * ((k * 0.618) % 1)); return new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)).multiplyScalar(R0); };
  for (let k = 0; k < 9; k++) {
    const a = rnd(k), b = rnd(k + 5.5);
    const mid = a.clone().add(b).multiplyScalar(0.5).setLength(R0 * 1.45);
    globe.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 48, 0.015, 5), arcMat('#ffc98a', 0.55)));
  }
}

// Floor delivery routes (dispatch lanes) with travelling light dashes
const routes = [
  new THREE.CatmullRomCurve3([new THREE.Vector3(-17.2, 0.03, -6.5), new THREE.Vector3(-13.5, 0.03, -1.6), new THREE.Vector3(-8, 0.03, 1.4), new THREE.Vector3(-3.4, 0.03, 2.4), new THREE.Vector3(-1.5, 0.03, 8), new THREE.Vector3(-2.5, 0.03, 16)]),
  new THREE.CatmullRomCurve3([new THREE.Vector3(-4.6, 0.03, -7.2), new THREE.Vector3(-3.8, 0.03, -3.8), new THREE.Vector3(-7.6, 0.03, 0.6), new THREE.Vector3(-14, 0.03, 6), new THREE.Vector3(-20, 0.03, 12)]),
];
const routeDash = [];
routes.forEach((c) => {
  const g = new THREE.TubeGeometry(c, 200, 0.03, 4);
  const m = new THREE.Mesh(g, arcMat('#ffc890', 0.45));
  m.scale.y = 0.3;
  scene.add(m);
  for (let k = 0; k < 6; k++) { const s = new THREE.Sprite(pulseMat); s.scale.setScalar(0.5); scene.add(s); routeDash.push({ s, c, off: k / 6 }); }
});

// ------------------------------------------------------------------ particles (GPU-animated)
const particles = (() => {
  const N = HI ? 2200 : 900;
  const base = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    base.set([-30 + P.rand() * 42, P.rand() * 18, -18 + P.rand() * 30], i * 3);
    seed[i] = P.rand();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(base, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(-8, 9, -3), 40);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uMap: { value: glowTex }, uScale: { value: 400 } },
    vertexShader: /* glsl */`
      attribute float seed; uniform float uTime; uniform float uScale; varying float vA;
      const float TAU = 6.2831853;
      void main(){
        vec3 p = position;
        float ph = seed * TAU;
        float lt = uTime / ${LOOP.toFixed(1)};           // 0..1 over the loop
        p.y = mod(p.y + lt * 18.0 * floor(1.0 + seed * 2.0), 18.0); // whole wraps per loop keep it seamless
        p.x += sin(lt * TAU * 2.0 + ph) * 0.6;
        p.z += cos(lt * TAU * 3.0 + ph) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.55 + 0.45 * sin(lt * TAU * 6.0 + ph * 3.0);
        vA = tw * smoothstep(0.0, 1.5, p.y) * smoothstep(18.0, 14.0, p.y);
        gl_PointSize = (0.05 + seed * 0.11) * uScale / -mv.z;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; varying float vA;
      void main(){ vec4 c = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vec3(1.0, 0.86, 0.66) * c.rgb * 1.6, c.a * vA); }`,
  });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  return m;
})();

// Motion trails behind orbiting products (analytic → deterministic)
const TRAIL_N = 46;
const trailItems = orbit.filter((_, i) => i % 3 === 0);
const trailGeo = new THREE.BufferGeometry();
const trailPos = new Float32Array(trailItems.length * TRAIL_N * 3);
const trailA = new Float32Array(trailItems.length * TRAIL_N);
for (let k = 0; k < trailItems.length; k++) for (let j = 0; j < TRAIL_N; j++) trailA[k * TRAIL_N + j] = 1 - j / TRAIL_N;
trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
trailGeo.setAttribute('fade', new THREE.BufferAttribute(trailA, 1));
const trailMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uMap: { value: glowTex }, uScale: { value: 400 } },
  vertexShader: `attribute float fade; uniform float uScale; varying float vF; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; vF = fade; gl_PointSize = (0.08 + 0.3*fade*fade) * uScale / -mv.z; }`,
  fragmentShader: `uniform sampler2D uMap; varying float vF; void main(){ vec4 c = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vec3(1.0,0.84,0.64)*c.rgb*1.4, c.a*vF*vF*0.55); }`,
});
const trails = new THREE.Points(trailGeo, trailMat);
trails.frustumCulled = false;
HERO.add(trails);

// ------------------------------------------------------------------ post-processing
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: HI ? 4 : 0 }));
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 30, aperture: 0.0005, maxblur: 0.007 });
if (HI) composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.5, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());
// Final grade: clean negative space on the right, vignette, fine film grain.
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFocusX: { value: FOCUS_X }, uAspect: { value: 16 / 9 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uAspect; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      // right-side negative space: blend into a soft studio gradient
      vec3 bg = mix(vec3(0.052,0.043,0.040), vec3(0.085,0.068,0.060), smoothstep(0.0, 1.0, vUv.y));
      bg += vec3(0.035,0.024,0.018) * smoothstep(0.9, 0.0, distance(vUv*vec2(uAspect,1.0), vec2(0.78*uAspect, 0.55)));
      float fadeR = smoothstep(0.58, 0.82, vUv.x);
      c = mix(c, bg, fadeR * 0.94);
      // vignette (weighted to the left edge so the right stays even)
      vec2 d = (vUv - vec2(0.42, 0.5)) * vec2(1.1, 1.25);
      c *= mix(1.0, 0.72, smoothstep(0.35, 0.95, length(d)));
      // film grain
      float g = hash(vUv * 1000.0 + fract(uTime * 7.13)) - 0.5;
      c += g * 0.018;
      gl_FragColor = vec4(c, 1.0);
    }`,
});
composer.addPass(grade);

// ------------------------------------------------------------------ camera choreography
const target = new THREE.Vector3();
const camPos = new THREE.Vector3();
function smooth(x) { return x * x * (3 - 2 * x); }
function cameraAt(t) {
  const u = (t % LOOP) / LOOP, TAU = Math.PI * 2;
  // gentle orbit + dolly; all terms are loop-periodic so the video loops seamlessly
  const yaw = -0.24 + 0.14 * Math.sin(u * TAU) + 0.04 * Math.sin(u * TAU * 2);
  const dist = 34 - 4 * (0.5 - 0.5 * Math.cos(u * TAU));
  const h = 8.2 + 1.3 * Math.sin(u * TAU + 1.1);
  target.set(-3.6 + 0.8 * Math.sin(u * TAU + 0.4), 5.6 + 0.3 * Math.sin(u * TAU * 2), -3);
  camPos.set(target.x + Math.sin(yaw) * dist, h, target.z + Math.cos(yaw) * dist);
  if (SHOT === 'hero') {
    target.set(-0.4, 3.4, 0.6);
    camPos.set(target.x + Math.sin(yaw * 0.6) * 15, 5.2, target.z + Math.cos(yaw * 0.6) * 15);
  }
  camera.position.copy(camPos);
  camera.lookAt(target);
  // keep the hero podium in focus
  const focus = camera.position.distanceTo(new THREE.Vector3(0, 2.5, 0));
  bokeh.uniforms.focus.value = focus;
}

// ------------------------------------------------------------------ animation
const pv = new THREE.Vector3();
function animate(t) {
  const TAU = Math.PI * 2, w = TAU / LOOP;
  cameraAt(t);
  orbit.forEach((it) => {
    orbitPose(it, t, it.holder.position);
    it.holder.rotation.set(0.22 * Math.sin(t * w * 3 + it.i), t * w * 2 + it.i * 0.9, 0.16 * Math.cos(t * w * 2 + it.i));
  });
  // trails
  trailItems.forEach((it, k) => {
    for (let j = 0; j < TRAIL_N; j++) {
      orbitPose(it, t - j * 0.035, pv);
      trailPos.set([pv.x, pv.y, pv.z], (k * TRAIL_N + j) * 3);
    }
  });
  trailGeo.attributes.position.needsUpdate = true;
  arcMeshes.forEach((m, i) => { m.rotation.z = arcs[i][3] + t * w * (i % 2 ? -1 : 1) * (1 + (i % 3)); });
  nodes.forEach((n, i) => {
    n.ring2.rotation.z = t * w * (i % 2 ? -2 : 3);
    n.icon.rotation.y = Math.sin(t * w * 2 + i) * 0.6;
    n.group.position.y = n.p.y + 0.12 * Math.sin(t * w * 3 + i);
    n.group.lookAt(camera.position.x, n.group.position.y, camera.position.z);
  });
  pulses.forEach((p) => { const f = ((t / LOOP) * 6 + p.off) % 1; p.c.getPointAt(f, p.s.position); p.s.material.opacity = Math.sin(f * Math.PI); });
  routeDash.forEach((p) => { const f = ((t / LOOP) * 3 + p.off) % 1; p.c.getPointAt(f, p.s.position); p.s.position.y = 0.08; });
  globe.rotation.y = t * w;
  particles.uniforms.uTime.value = t;
  grade.uniforms.uTime.value = t;
}

// ------------------------------------------------------------------ sizing
let W = 0, H = 0;
function resize(w = innerWidth, h = innerHeight) {
  W = w; H = h;
  renderer.setSize(w, h, !CAPTURE);
  const fullW = 2 * (1 - FOCUS_X) * w;                 // see README: shifts optical centre left
  camera.aspect = fullW / h;
  camera.setViewOffset(fullW, h, (1 - 2 * FOCUS_X) * w, 0, w, h);
  camera.updateProjectionMatrix();
  const pr = renderer.getPixelRatio();
  composer.setPixelRatio(pr);
  composer.setSize(w, h);
  grade.uniforms.uAspect.value = w / h;
  const s = h * pr * 0.5 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  particles.uniforms.uScale.value = s * 0.02;
  trailMat.uniforms.uScale.value = s * 0.02;
}

function renderFrame(t) {
  animate(t);
  composer.render();
}

// ------------------------------------------------------------------ run modes
if (CAPTURE) {
  const w = +params.get('w') || 1920, h = +params.get('h') || 1080;
  resize(w, h);
  let warmedUp = false;
  window.__renderAt = (t) => { if (!warmedUp) { renderFrame(t); warmedUp = true; } renderFrame(t); return true; };
  window.__scene = scene;
  window.__ready = true;
} else {
  resize();
  addEventListener('resize', () => resize());
  const clock = new THREE.Clock();
  let t = 0, paused = false;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!paused) t += dt;
    renderFrame(t);
  });
  const $ = (id) => document.getElementById(id);
  $('btn-pause').onclick = (e) => { paused = !paused; e.target.textContent = paused ? 'Play' : 'Pause'; };
  $('btn-guide').onclick = () => document.body.classList.toggle('show-guide');
  $('btn-shot').onclick = async () => {
    const prev = [W, H];
    const pr = renderer.getPixelRatio();
    renderer.setPixelRatio(1);
    resize(3840, 2160);
    renderFrame(t);
    const url = canvas.toDataURL('image/png');
    renderer.setPixelRatio(pr);
    resize(...prev);
    const a = document.createElement('a'); a.href = url; a.download = `nmt-trading-3d-${Date.now()}.png`; a.click();
  };
  $('btn-rec').onclick = (e) => {
    if (!('MediaRecorder' in window)) return;
    const stream = canvas.captureStream(60);
    const mime = ['video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 40e6 });
    const chunks = [];
    rec.ondataavailable = (ev) => chunks.push(ev.data);
    rec.onstop = () => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })); a.download = 'nmt-trading-3d-loop.webm'; a.click();
      e.target.textContent = 'Record loop';
    };
    t = 0; paused = false;
    rec.start();
    e.target.textContent = `Recording ${LOOP}s…`;
    setTimeout(() => rec.stop(), LOOP * 1000);
  };
  addEventListener('keydown', (e) => {
    if (e.key === 'h') document.body.classList.toggle('hide-ui');
    if (e.key === 'g') document.body.classList.toggle('show-guide');
    if (e.key === ' ') $('btn-pause').click();
  });
  document.body.classList.add('ready');
}
