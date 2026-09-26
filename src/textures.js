// Procedural canvas textures: product labels, wholesale carton print,
// illuminated logo panel, quantity tags and glow sprites.
// Everything is generic / unbranded except the NMT Trading LLC company mark.
import * as THREE from 'three';

export const SERIF = '"Cormorant Garamond", "Liberation Serif", Georgia, serif';
export const SANS = 'Montserrat, "Liberation Sans", Helvetica, Arial, sans-serif';

let maxAniso = 8;
export function setMaxAnisotropy(v) { maxAniso = v; }

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(c, { srgb = true, repeat = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

function spacedText(ctx, text, x, y, spacing) {
  // Canvas letterSpacing is not universal yet; draw glyph by glyph.
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += widths[i] + spacing; });
  ctx.textAlign = align;
  return total;
}

// Minimal generic product label that wraps around a bottle/tube.
// `title` is a product category word (e.g. "SERUM") — never a brand.
export function labelTexture({ bg = '#f4efe9', fg = '#2a2522', accent = '#b8925a', title = '', sub = '', transparentBg = false, w = 1024, h = 512 }) {
  const [c, ctx] = canvas(w, h);
  if (!transparentBg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
  // Label occupies the front quarter of the wrap (u 0.375..0.625).
  const cx = w * 0.5;
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${h * 0.17}px ${SANS}`;
  spacedText(ctx, title, cx, h * 0.44, h * 0.03);
  ctx.strokeStyle = accent;
  ctx.lineWidth = h * 0.008;
  ctx.beginPath(); ctx.moveTo(cx - w * 0.06, h * 0.6); ctx.lineTo(cx + w * 0.06, h * 0.6); ctx.stroke();
  if (sub) {
    ctx.globalAlpha = 0.75;
    ctx.font = `400 ${h * 0.075}px ${SANS}`;
    spacedText(ctx, sub, cx, h * 0.72, h * 0.012);
    ctx.globalAlpha = 1;
  }
  return toTexture(c);
}

// Kraft corrugated carton with NMT Trading LLC print, handling marks and tape.
export function cartonTexture({ variant = 0, w = 1024, h = 1024 } = {}) {
  const [c, ctx] = canvas(w, h);
  const kraft = ['#b88a5a', '#c29668', '#ad8052'][variant % 3];
  ctx.fillStyle = kraft; ctx.fillRect(0, 0, w, h);
  // corrugation fibres + noise
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const px = (i / 4) % w;
    const n = (Math.random() - 0.5) * 18 + Math.sin(px * 0.35) * 3;
    img.data[i] += n; img.data[i + 1] += n * 0.9; img.data[i + 2] += n * 0.7;
  }
  ctx.putImageData(img, 0, 0);
  // subtle edge darkening
  const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,30,10,0.28)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // tape strip across the top
  ctx.fillStyle = 'rgba(214,190,150,0.55)';
  ctx.fillRect(w * 0.4, 0, w * 0.2, h * 0.16);
  // print (dark brown flexo ink)
  ctx.fillStyle = '#3a2618';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${w * 0.15}px ${SERIF}`;
  spacedText(ctx, 'NMT', w / 2, h * 0.4, w * 0.03);
  ctx.font = `500 ${w * 0.042}px ${SANS}`;
  spacedText(ctx, 'TRADING LLC', w / 2, h * 0.52, w * 0.02);
  ctx.fillRect(w * 0.3, h * 0.575, w * 0.4, h * 0.004);
  ctx.font = `500 ${w * 0.03}px ${SANS}`;
  const lines = ['COSMETICS · WHOLESALE', 'BEAUTY & PERSONAL CARE', 'SKINCARE · HAIRCARE · FRAGRANCE'];
  spacedText(ctx, lines[variant % 3], w / 2, h * 0.63, w * 0.008);
  // quantity block
  ctx.strokeStyle = '#3a2618'; ctx.lineWidth = w * 0.005;
  ctx.strokeRect(w * 0.08, h * 0.76, w * 0.3, h * 0.14);
  ctx.font = `500 ${w * 0.028}px ${SANS}`;
  ctx.fillText('QTY', w * 0.23, h * 0.795);
  ctx.font = `600 ${w * 0.05}px ${SANS}`;
  ctx.fillText(['48 PCS', '24 PCS', '96 PCS'][variant % 3], w * 0.23, h * 0.855);
  // handling marks: this-way-up arrows + fragile glass
  ctx.lineWidth = w * 0.007;
  for (let k = 0; k < 2; k++) {
    const ax = w * (0.66 + k * 0.08), ay = h * 0.9;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - h * 0.1);
    ctx.moveTo(ax - w * 0.022, ay - h * 0.075); ctx.lineTo(ax, ay - h * 0.1); ctx.lineTo(ax + w * 0.022, ay - h * 0.075);
    ctx.stroke();
  }
  ctx.fillRect(w * 0.62, h * 0.91, w * 0.2, h * 0.006);
  // barcode
  let bx = w * 0.45;
  for (let i = 0; i < 38; i++) {
    const bw = (1 + ((i * 7919) % 3)) * w * 0.0022;
    if (i % 2 === 0) ctx.fillRect(bx, h * 0.78, bw, h * 0.1);
    bx += bw + w * 0.0015;
  }
  return toTexture(c);
}

export function cartonTopTexture({ w = 512, h = 512 } = {}) {
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = '#b98b5c'; ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    img.data[i] += n; img.data[i + 1] += n * 0.9; img.data[i + 2] += n * 0.7;
  }
  ctx.putImageData(img, 0, 0);
  ctx.fillStyle = 'rgba(40,20,5,0.35)'; ctx.fillRect(0, h * 0.495, w, h * 0.01); // flap seam
  ctx.fillStyle = 'rgba(222,200,160,0.6)'; ctx.fillRect(0, h * 0.42, w, h * 0.16); // tape
  return toTexture(c);
}

// Illuminated back-wall logo panel. Returns { map, emissive }.
export function logoPanelTextures({ w = 2048, h = 640 } = {}) {
  const [c, ctx] = canvas(w, h);
  const [e, ex] = canvas(w, h);
  // brushed dark metal base
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1b1715'); g.addColorStop(0.5, '#262120'); g.addColorStop(1, '#141110');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`;
    ctx.fillRect(0, y, w, 1);
  }
  ex.fillStyle = '#000'; ex.fillRect(0, 0, w, h);
  const draw = (k, col) => {
    k.fillStyle = col; k.strokeStyle = col;
    k.textAlign = 'center'; k.textBaseline = 'middle';
    // monogram ring
    k.lineWidth = h * 0.012;
    k.beginPath(); k.arc(w * 0.19, h * 0.5, h * 0.3, 0, Math.PI * 2); k.stroke();
    k.font = `600 ${h * 0.26}px ${SERIF}`;
    spacedText(k, 'NMT', w * 0.19, h * 0.52, h * 0.01);
    k.textAlign = 'left';
    k.font = `600 ${h * 0.2}px ${SERIF}`;
    const x0 = w * 0.33;
    // left-aligned spaced text
    let cx = x0;
    for (const ch of 'NMT TRADING LLC') { k.fillText(ch, cx, h * 0.43); cx += k.measureText(ch).width + h * 0.018; }
    k.font = `500 ${h * 0.058}px ${SANS}`;
    cx = x0 + h * 0.01;
    for (const ch of 'COSMETICS  ·  BEAUTY  ·  WHOLESALE DISTRIBUTION') { k.fillText(ch, cx, h * 0.7); cx += k.measureText(ch).width + h * 0.016; }
    k.fillRect(x0, h * 0.585, w * 0.6, h * 0.006);
  };
  draw(ctx, '#d9b77e');
  draw(ex, '#ffd9a0');
  return { map: toTexture(c), emissive: toTexture(e) };
}

// Small glass tag used for 1 PC / 2 PCS quantity groups and flow nodes.
export function tagTexture(line1, line2 = '', { w = 512, h = 192, color = '#f3dcb0' } = {}) {
  const [c, ctx] = canvas(w, h);
  ctx.clearRect(0, 0, w, h);
  const r = h * 0.18;
  ctx.fillStyle = 'rgba(16,12,10,0.82)';
  ctx.strokeStyle = 'rgba(243,220,176,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(6, 6, w - 12, h - 12, r);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${h * (line2 ? 0.3 : 0.38)}px ${SANS}`;
  spacedText(ctx, line1, w / 2, h * (line2 ? 0.4 : 0.52), h * 0.04);
  if (line2) {
    ctx.globalAlpha = 0.7;
    ctx.font = `500 ${h * 0.14}px ${SANS}`;
    spacedText(ctx, line2, w / 2, h * 0.72, h * 0.02);
    ctx.globalAlpha = 1;
  }
  return toTexture(c);
}

export function glowTexture(inner = 'rgba(255,236,200,1)', { size = 128 } = {}) {
  const [c, ctx] = canvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, 'rgba(255,210,150,0.45)');
  g.addColorStop(1, 'rgba(255,200,140,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return toTexture(c);
}

// Eyeshadow palette pans (top face texture).
export function paletteTexture(colors, { cols = 4, rows = 3, w = 1024, h = 768 } = {}) {
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = '#141212'; ctx.fillRect(0, 0, w, h);
  const pad = w * 0.05, gw = (w - pad * 2) / cols, gh = (h - pad * 2) / rows;
  colors.forEach((col, i) => {
    const x = pad + (i % cols) * gw + gw / 2, y = pad + Math.floor(i / cols) * gh + gh / 2;
    const rr = Math.min(gw, gh) * 0.42;
    const g = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.3, rr * 0.1, x, y, rr);
    g.addColorStop(0, lighten(col, 0.25)); g.addColorStop(1, col);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x - rr, y - rr, rr * 2, rr * 2, rr * 0.25); ctx.fill();
    // shimmer speckle
    for (let s = 0; s < 40; s++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
      ctx.fillRect(x + (Math.random() - 0.5) * rr * 1.8, y + (Math.random() - 0.5) * rr * 1.8, 2, 2);
    }
  });
  return toTexture(c);
}

// Pressed powder / blush surface with embossed pattern.
export function powderTexture(base, { size = 512 } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  for (let r = size * 0.08; r < size * 0.5; r += size * 0.06) {
    ctx.beginPath(); ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(c);
}

// Soft studio backdrop gradient (used on the far cyclorama plane).
export function backdropTexture({ w = 2048, h = 1024 } = {}) {
  const [c, ctx] = canvas(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0b0a0a'); g.addColorStop(0.55, '#1c1715'); g.addColorStop(1, '#2a211d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = ctx.createRadialGradient(w * 0.32, h * 0.55, 0, w * 0.32, h * 0.55, w * 0.5);
  r.addColorStop(0, 'rgba(120,80,60,0.35)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
  return toTexture(c);
}

// Polished concrete / resin floor roughness variation.
export function floorRoughnessTexture({ size = 1024 } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = '#5a5a5a'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2500; i++) {
    const v = 70 + Math.random() * 60;
    ctx.fillStyle = `rgba(${v},${v},${v},0.08)`;
    const r = Math.random() * size * 0.05;
    ctx.beginPath(); ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2); ctx.fill();
  }
  // expansion joints
  ctx.fillStyle = '#9a9a9a';
  for (let k = 0; k <= 4; k++) { ctx.fillRect(k * size / 4 - 2, 0, 4, size); ctx.fillRect(0, k * size / 4 - 2, size, 4); }
  return toTexture(c, { srgb: false, repeat: true });
}

export function lighten(hex, amt) {
  const col = new THREE.Color(hex);
  col.lerp(new THREE.Color('#ffffff'), amt);
  return '#' + col.getHexString();
}
