// Trinn A (grovsøk, 5 m): Engerdal–sørlige Femund. Kameraposisjoner på 50 m-rutenett, 150–900 m fra kjørbar OSM-vei.
// Rapportens skogkrav K0–K4 (s. 12) på trehøyde = DOM − DTM, kamera mot 219,4° (sektorene er sanne asimut).
// Ved 5 m er K0/K1 grove; trinn B kontrollerer kandidatene med 1 m.
import fs from 'fs';
const d2r = Math.PI / 180, R = 6371000;
// --- UTM33 (Krüger) ---
const a = 6378137, f = 1 / 298.257222101, k0 = 0.9996, lon0 = 15 * d2r, n = f / (2 - f), A = a / (1 + n) * (1 + n * n / 4 + n ** 4 / 64);
const al = [n / 2 - 2 * n * n / 3 + 5 * n ** 3 / 16, 13 * n * n / 48 - 3 * n ** 3 / 5, 61 * n ** 3 / 240], be = [n / 2 - 2 * n * n / 3 + 37 * n ** 3 / 96, n * n / 48 + n ** 3 / 15, 17 * n ** 3 / 480], de = [2 * n - 2 * n * n / 3 - 2 * n ** 3, 7 * n * n / 3 - 8 * n ** 3 / 5, 56 * n ** 3 / 15];
export function toUTM(lat, lon) { const p = lat * d2r, l = lon * d2r - lon0, e = 2 * Math.sqrt(n) / (1 + n);
  const t = Math.sinh(Math.atanh(Math.sin(p)) - e * Math.atanh(e * Math.sin(p))), xi = Math.atan(t / Math.cos(l)), eta = Math.atanh(Math.sin(l) / Math.sqrt(1 + t * t));
  let x = eta, y = xi; for (let j = 1; j <= 3; j++) { x += al[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta); y += al[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta); } return [500000 + k0 * A * x, k0 * A * y]; }
export function fromUTM(E, N) { const xi = N / (k0 * A), eta = (E - 500000) / (k0 * A); let x = xi, y = eta;
  for (let j = 1; j <= 3; j++) { x -= be[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta); y -= be[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta); }
  const chi = Math.asin(Math.sin(x) / Math.cosh(y)); let p = chi; for (let j = 1; j <= 3; j++) p += de[j - 1] * Math.sin(2 * j * chi); return [p / d2r, (lon0 + Math.atan(Math.sinh(y) / Math.cos(x))) / d2r]; }
// grid-retning for sann asimut (meridiankonvergens), konstant nok over området
const OMR = (process.env.OMR || "engerdal,61.72,62.05,11.75,12.15").split(","); const [ONAME, LA0, LA1, LO0, LO1] = [OMR[0], ...OMR.slice(1).map(Number)];
const [cla, clo] = [(LA0 + LA1) / 2, (LO0 + LO1) / 2];
function gdir(az) { const d = 100, [x0, y0] = toUTM(cla, clo); const [x1, y1] = toUTM(cla + d * Math.cos(az * d2r) / R / d2r, clo + d * Math.sin(az * d2r) / (R * Math.cos(cla * d2r)) / d2r); return [(x1 - x0) / d, (y1 - y0) / d]; }
// --- rastere (5 m, fliser à ≤ 4000 px) ---
export async function tile(kind, x0, y0, x1, y1, res) { const W = Math.round((x1 - x0) / res), H = Math.round((y1 - y0) / res), c = `nn_${kind}_${x0}_${y0}_${x1}_${y1}_${res}.f32`;
  let b; if (fs.existsSync(c)) b = fs.readFileSync(c); else { const u = `https://hoydedata.no/arcgis/rest/services/NHM_${kind}_25833/ImageServer/exportImage?bbox=${x0},${y0},${x1},${y1}&bboxSR=25833&imageSR=25833&size=${W},${H}&format=bsq&pixelType=F32&interpolation=RSP_NearestNeighbor&f=image`;
    b = Buffer.from(await (await fetch(u)).arrayBuffer()); if (b.length < W * H * 4) throw new Error(kind + ' størrelse ' + b.length); fs.writeFileSync(c, b); }
  return { x0, y0, x1, y1, W, H, res, d: new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + W * H * 4)) }; }
if ((process.argv[1] || "").endsWith('trinnA2.mjs')) {
  const [e0, n0] = toUTM(LA0, LO0), [e1, n1] = toUTM(LA1, LO1), [e2] = toUTM(LA0, LO1), [e3] = toUTM(LA1, LO0);
  if (!fs.existsSync(`roads_${ONAME}.json`)) { const Q = `[out:json][timeout:120];way["highway"~"^(track|service|unclassified|tertiary|secondary|primary|residential)$"](${LA0},${LO0},${LA1},${LO1});out geom;`; const r = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { "User-Agent": "hordejakten-audit/1.0", "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(Q) }); fs.writeFileSync(`roads_${ONAME}.json`, await r.text()); }
  const X0 = Math.floor(Math.min(e0, e3) / 100) * 100, X1 = Math.ceil(Math.max(e1, e2) / 100) * 100, Y0 = Math.floor(n0 / 100) * 100, Y1 = Math.ceil(n1 / 100) * 100, RES = 5;
  const tiles = { DOM: [], DTM: [] }; const TS = 10000; // 10 km fliser = 2000 px
  for (const kind of ['DOM', 'DTM']) for (let x = X0; x < X1; x += TS) for (let y = Y0; y < Y1; y += TS) tiles[kind].push(await tile(kind, x, y, Math.min(x + TS, X1), Math.min(y + TS, Y1), RES));
  const at = (kind, x, y) => { for (const t of tiles[kind]) if (x >= t.x0 && x < t.x1 && y >= t.y0 && y < t.y1) return t.d[Math.floor((t.y1 - y) / RES) * t.W + Math.floor((x - t.x0) / RES)]; return NaN; };
  const chm = (x, y) => Math.max(0, at('DOM', x, y) - at('DTM', x, y));
  // veier -> segmenter i UTM, hashet i 500 m-celler
  const segs = []; for (const w of JSON.parse(fs.readFileSync(`roads_${ONAME}.json`, 'utf8')).elements) { const g = w.geometry.map(p => toUTM(p.lat, p.lon)); for (let i = 1; i < g.length; i++) segs.push([...g[i - 1], ...g[i]]); }
  const H5 = new Map(), key = (x, y) => `${Math.floor(x / 500)},${Math.floor(y / 500)}`;
  for (const s of segs) { const [ax, ay, bx, by] = s, L = Math.hypot(bx - ax, by - ay), m = Math.max(1, Math.ceil(L / 250)); const ks = new Set(); for (let i = 0; i <= m; i++) ks.add(key(ax + (bx - ax) * i / m, ay + (by - ay) * i / m)); for (const k of ks) { if (!H5.has(k)) H5.set(k, []); H5.get(k).push(s); } }
  const roadDist = (x, y) => { let best = Infinity; const cx = Math.floor(x / 500), cy = Math.floor(y / 500); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (const [ax, ay, bx, by] of H5.get(`${cx + i},${cy + j}`) || []) {
      const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1))); const d = Math.hypot(x - ax - t * vx, y - ay - t * vy); if (d < best) best = d; } return best; };
  // sektorprøver (relative offsets), prøvd hvert 1° og 2,5 m -> unike 5 m-celler per posisjon
  const K = [['K0', 212, 226, 3, 7, 'med', 3, '<'], ['K1', 213, 226, 8, 17, 'med', 3, '<'], ['K2', 190, 207, 3, 20, 'p90', 10, '>='], ['K3', 232, 250, 5, 25, 'p90', 10, '>='], ['K4', 213, 226, 25, 70, 'p90', 12, '>=']];
  const offs = K.map(([, a0, a1, r0, r1]) => { const o = []; for (let az = a0; az <= a1; az += 1) { const [vx, vy] = gdir(az); for (let r = r0; r <= r1; r += 2.5) o.push([vx * r, vy * r]); } return o; });
  const q = (v, p) => { v.sort((x, y) => x - y); return v[Math.floor(p * (v.length - 1))]; };
  const out = ['E,N,lat,lon,moh,veiavstand,K0,K1,K2,K3,K4']; let tested = 0, pass = 0;
  for (let x = X0 + 100; x < X1 - 100; x += 50) for (let y = Y0 + 100; y < Y1 - 100; y += 50) {
    const rd = roadDist(x, y); if (!(rd >= 150 && rd <= 900)) continue; tested++;
    const vals = []; let ok = true;
    for (let k = 0; k < K.length && ok; k++) { const [, , , , , st, th, op] = K[k]; const cells = new Map();
      for (const [dx, dy] of offs[k]) { const cx = Math.floor((x + dx) / RES), cy = Math.floor((y + dy) / RES); const kk = cx * 1e6 + cy; if (!cells.has(kk)) cells.set(kk, chm((cx + 0.5) * RES, (cy + 0.5) * RES)); }
      const v = [...cells.values()].filter(Number.isFinite); if (!v.length) { ok = false; break; } const val = st === 'med' ? q(v, .5) : q(v, .9); vals.push(val.toFixed(1)); ok = op === '<' ? val < th : val >= th; }
    if (ok) { pass++; const [la, lo] = fromUTM(x, y); out.push(`${x},${y},${la.toFixed(5)},${lo.toFixed(5)},${at('DTM', x, y).toFixed(0)},${rd.toFixed(0)},${vals.join(',')}`); } }
  fs.writeFileSync(`trinnA_${ONAME}.csv`, out.join('\n') + '\n'); console.log(`område ${(X1 - X0) / 1000}×${(Y1 - Y0) / 1000} km, testet ${tested} posisjoner (150–900 m fra vei), består K0–K4 grovt: ${pass}`);
}
