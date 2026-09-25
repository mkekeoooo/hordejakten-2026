// #2 – grense uavhengig av hvor den belyste flaten er: for HVERT punkt i kameraets synsfelt
// (asimut 188–250°, 5–150 m fra kameraet) finn laveste høyde over bakken z* der terrenget (DTM, ikke skog)
// slipper sola gjennom kl. 07.50 (asimut 97,9°, 5,65° refraktert). Er min z* over høyeste tre, kan ingen
// flate i bildet ha fått direkte sol da. Kamera = kasse + 5 m mot 39°. Kun Kartverket DTM (ImageServer).
import fs from 'fs';
const d2r = Math.PI / 180, R = 6371000, k = 0.13;
// --- WGS84 -> UTM33 (Krüger) ---
const a = 6378137, f = 1 / 298.257222101, k0 = 0.9996, lon0 = 15 * d2r, n = f / (2 - f), A = a / (1 + n) * (1 + n * n / 4 + n ** 4 / 64);
const al = [n / 2 - 2 * n * n / 3 + 5 * n ** 3 / 16, 13 * n * n / 48 - 3 * n ** 3 / 5, 61 * n ** 3 / 240];
function toUTM(lat, lon) { const p = lat * d2r, l = lon * d2r - lon0, e = 2 * Math.sqrt(n) / (1 + n);
  const t = Math.sinh(Math.atanh(Math.sin(p)) - e * Math.atanh(e * Math.sin(p))), xi = Math.atan(t / Math.cos(l)), eta = Math.atanh(Math.sin(l) / Math.sqrt(1 + t * t));
  let x = eta, y = xi; for (let j = 1; j <= 3; j++) { x += al[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta); y += al[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta); }
  return [500000 + k0 * A * x, k0 * A * y]; }
function gdir(lat, lon, az) { const d = 100, [x0, y0] = toUTM(lat, lon); const [x1, y1] = toUTM(lat + d * Math.cos(az * d2r) / R / d2r, lon + d * Math.sin(az * d2r) / (R * Math.cos(lat * d2r)) / d2r); return [(x1 - x0) / d, (y1 - y0) / d]; }
// --- rå F32-eksport; de siste W*H/8 bytene er en maske ---
async function raster(x0, y0, x1, y1, res) { const W = Math.round((x1 - x0) / res), H = Math.round((y1 - y0) / res), c = `dtm_${x0}_${y0}_${x1}_${y1}_${res}.f32`;
  let b; if (fs.existsSync(c)) b = fs.readFileSync(c); else { const u = `https://hoydedata.no/arcgis/rest/services/NHM_DTM_25833/ImageServer/exportImage?bbox=${x0},${y0},${x1},${y1}&bboxSR=25833&imageSR=25833&size=${W},${H}&format=bsq&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image`;
    b = Buffer.from(await (await fetch(u)).arrayBuffer()); if (b.length < W * H * 4) throw new Error('størrelse ' + b.length); fs.writeFileSync(c, b); }
  const d = new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + W * H * 4));
  return { at(x, y) { const cc = Math.floor((x - x0) / res), r = Math.floor((y1 - y) / res); return cc < 0 || r < 0 || cc >= W || r >= H ? NaN : d[r * W + cc]; } }; }
const steder = [['5c Jernvinneveien', 61.43531, 11.13483], ['5b Jernvinneveien', 61.43444, 11.13907], ['5a Jernvinneveien', 61.43511, 11.14349]];
const SAZ = 97.9, SEL = 5.65;
for (const [navn, la, lo] of steder) {
  const [bx, by] = toUTM(la, lo), [cxv, cyv] = gdir(la, lo, 39), cx = bx + 5 * cxv, cy = by + 5 * cyv;
  const X0 = Math.floor(cx) - 250, Y0 = Math.floor(cy) - 450, fin = await raster(X0, Y0, X0 + 1500, Y0 + 700, 1);
  const grov = await raster(Math.floor(cx) - 400, Math.floor(cy) - 6000, Math.floor(cx) + 20000, Math.floor(cy) + 2000, 20);
  const [vx, vy] = gdir(la, lo, SAZ), tanE = Math.tan(SEL * d2r);
  let minZ = Infinity, hvor = null, n = 0;
  for (let az = 238; az <= 250; az += 1) { const [ux, uy] = gdir(la, lo, az);
    for (let r = 5; r <= 150; r += 5) { const x = cx + ux * r, y = cy + uy * r, g = fin.at(x, y); if (!isFinite(g)) continue; n++;
      // nødvendig høyde: maks over strålen av (terreng − linje fra bakkepunktet med solhøyden)
      let need = 0; for (let d = 2; d < 20000; d += d < 1200 ? 1 : 20) { const t = (d < 1200 ? fin : grov).at(x + vx * d, y + vy * d); if (!isFinite(t)) continue;
        const v = t - d * d * (1 - k) / (2 * R) - (g + d * tanE); if (v > need) need = v; }
      if (need < minZ) { minZ = need; hvor = [az, r]; } } }
  console.log(`${navn.padEnd(32)} ${n} punkter i sektoren 238–250° (lysflekken) · laveste nødvendige høyde for sol kl. 07.50: ${minZ.toFixed(1)} m over bakken (ved ${hvor[0]}°, ${hvor[1]} m)`);
}
