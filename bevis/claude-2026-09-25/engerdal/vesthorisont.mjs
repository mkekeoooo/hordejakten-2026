// Vestlig terrenghorisont: 21.09 var solskiva i bildet til kl. 17.27 CEST (default.no), 25.09 solstjerne til ca. 17.07.
// Da må terrenget (DTM, ikke skog) mot sola ligge under solhøyden fra kameraet (1,5 m) ved de tidspunktene.
// Kun Kartverkets punkt-API. Kandidater: streng-adkomstlista (strict.md) + gamle kandidater som kontroll.
import fs from 'fs';
import { solar } from '../repo/bevis/claude-2026-09-25/horisont/sun.mjs';
const d2r = Math.PI / 180, R = 6371000, k = 0.13;
const steg = []; for (let d = 25; d <= 3000; d += 25) steg.push(d); for (let d = 3100; d <= 20000; d += 100) steg.push(d);
const punkt = (lat, lon, az, d) => { const p1 = lat * d2r, l1 = lon * d2r, a = az * d2r, dr = d / R; const p2 = Math.asin(Math.sin(p1) * Math.cos(dr) + Math.cos(p1) * Math.sin(dr) * Math.cos(a));
  return [(l1 + Math.atan2(Math.sin(a) * Math.sin(dr) * Math.cos(p1), Math.cos(dr) - Math.sin(p1) * Math.sin(p2))) / d2r, p2 / d2r]; };
async function hoyder(ll) { const out = []; for (let i = 0; i < ll.length; i += 50) { const c = ll.slice(i, i + 50).map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)]);
  const r = await fetch(`https://ws.geonorge.no/hoydedata/v1/punkt?koordsys=4326&punkter=${encodeURIComponent(JSON.stringify(c))}&geojson=false`); out.push(...(await r.json()).punkter.map(p => p.z)); } return out; }
async function hz(lat, lon, az) { const z = await hoyder([[lon, lat], ...steg.map(d => punkt(lat, lon, az, d))]); let m = -90;
  steg.forEach((d, i) => { if (z[i + 1] == null) return; const v = Math.atan((z[i + 1] - d * d * (1 - k) / (2 * R) - z[0] - 1.5) / d) / d2r; if (v > m) m = v; }); return [m, z[0]]; }
const cand = fs.readFileSync('strict.md', 'utf8').trim().split('\n').map(l => { const c = l.split('|').map(s => s.trim()); const [la, lo] = c[2].split(',').map(Number); return [c[1] + ' ' + c[2], la, lo]; });
const old = [['gml 1 Myklebysæterveien', 61.3995, 11.0316], ['gml 2 Madsskardveien', 61.4443, 11.1234], ['gml S1 Messelt', 61.4571, 10.8362], ['gml 4 Madsskardveien øst', 61.4518, 11.1428]];
const hendelser = [['21.09 17.27', 21, 15 + 27 / 60], ['25.09 17.05', 25, 15 + 5 / 60]];
const out = ['sted,moh,' + hendelser.map(h => `${h[0]} sol°/hz°`).join(',') + ',status'];
for (const [n, la, lo] of [...cand, ...old]) { const cols = []; let ok = true, moh;
  for (const [, d, t] of hendelser) { const s = solar(la, lo, 2026, 9, d, t); const [h, z0] = await hz(la, lo, s.az); moh = z0; cols.push(`${s.elRefr.toFixed(1)}/${h.toFixed(1)}`); if (h >= s.elRefr) ok = false; }
  out.push(`${n},${moh?.toFixed(0)},${cols.join(',')},${ok ? 'OK' : 'BLOKKERT'}`); console.log(out[out.length - 1]); }
fs.writeFileSync('vesthorisont.csv', out.join('\n') + '\n');
