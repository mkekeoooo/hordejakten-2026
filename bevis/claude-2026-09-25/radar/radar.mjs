// MET Norge radar (reflectivity-nordic, lwe_precipitation_rate mm/t, 1 km, OPeNDAP) 26.09 ved alle kandidater.
// Tavla ca. 07.45 CEST (05:45Z): «LITT SMÅREGN NÅ OG LITT REGN I NATT» (default.no). Test: nedbør 05:15–06:15Z og i natt 22–05Z.
import fs from 'fs';
const F = 'https://thredds.met.no/thredds/dodsC/remotesensing/reflectivity-nordic/2026/09/yrwms-nordic.mos.pcappi-0-dbz.noclass-clfilter-novpr-clcorr-block.nordiclcc-1000.2026092';
const get = async (day, q) => { const r = await fetch(`${F}${day}.nc.ascii?${q.split('[').join('%5B').split(']').join('%5D')}`); if (!r.ok) throw new Error(r.status + ' ' + q); return r.text(); };
const nums = t => t.split('\n').slice(1).join(' ').match(/-?\d+(\.\d+)?(e-?\d+)?/gi).map(Number);
// finn indekser: grovt gitter (steg 8), deretter finjustering
async function grid(day) { const S = 8; const la = await get(day, `lat[0:${S}:2133][0:${S}:1693]`), lo = await get(day, `lon[0:${S}:2133][0:${S}:1693]`);
  const parse = t => { const rows = []; for (const l of t.split('\n')) { const m = l.match(/^\[(\d+)\],\s*(.*)$/); if (m) rows[+m[1]] = m[2].split(',').map(Number); } return rows; };
  return { S, lat: parse(la.split('lat.lat')[1] || la), lon: parse(lo.split('lon.lon')[1] || lo) }; }
function locate(g, la0, lo0) { let best = null; g.lat.forEach((row, i) => row.forEach((v, j) => { const d = (v - la0) ** 2 + ((g.lon[i][j] - lo0) * Math.cos(la0 * Math.PI / 180)) ** 2; if (!best || d < best.d) best = { d, y: i * g.S, x: j * g.S }; })); return best; }
async function refine(day, b, la0, lo0) { const y0 = Math.max(0, b.y - 8), x0 = Math.max(0, b.x - 8); const la = await get(day, `lat[${y0}:1:${y0 + 16}][${x0}:1:${x0 + 16}]`), lo = await get(day, `lon[${y0}:1:${y0 + 16}][${x0}:1:${x0 + 16}]`);
  const p = t => { const rows = []; for (const l of t.split('\n')) { const m = l.match(/^\[(\d+)\],\s*(.*)$/); if (m) rows[+m[1]] = m[2].split(',').map(Number); } return rows; };
  const A = p(la.split('lat.lat')[1] || la), O = p(lo.split('lon.lon')[1] || lo); let best = null;
  A.forEach((row, i) => row.forEach((v, j) => { const d = (v - la0) ** 2 + ((O[i][j] - lo0) * Math.cos(la0 * Math.PI / 180)) ** 2; if (!best || d < best.d) best = { d, y: y0 + i, x: x0 + j }; })); return best; }
async function times(day) { const t = await get(day, 'time'); return nums(t.split('time[')[1] ? t.slice(t.indexOf('\n', t.indexOf('time['))) : t).filter(v => v > 1e9); }
const cands = [['L07', 60.82353, 11.53750], ['A01', 61.23076, 11.72394], ['S03', 60.53938, 12.18334],
  ['B L07-nabo', 60.82483, 11.53901], ['B Elv 60.79961', 60.79961, 11.54360], ['B Sol 60.63783', 60.63783, 12.28269], ['B Sol 60.54197', 60.54197, 12.32301], ['B Sol 60.77395', 60.77395, 12.08670],
  ['B Sol 60.69195', 60.69195, 12.12567], ['B Sol 60.55727', 60.55727, 11.77521], ['B Sol 60.96777', 60.96777, 12.18526], ['B Sol 60.47394', 60.47394, 12.22924], ['B Sol 60.45713', 60.45713, 12.15591],
  ['B Sol 60.46866', 60.46866, 12.28663], ['B Sol 60.70008', 60.70008, 11.78694],
  ['C kand1 Mykleby', 61.3995, 11.0316], ['C Messelt S1', 61.4571, 10.8362], ['C Madsskard', 61.4443, 11.1234], ['ref Evenstad', 61.42, 11.08], ['ref Koppang', 61.57, 11.04], ['ref Trysil', 61.31, 12.26], ['ref Kongsvinger', 60.19, 12.0]];
const out = []; const g6 = await grid('6'), g5 = await grid('5'), T6 = await times('6'), T5 = await times('5');
const fmt = s => new Date(s * 1000).toISOString().slice(11, 16);
console.log(`26.09: ${T6.length} tidssteg ${fmt(T6[0])}–${fmt(T6[T6.length - 1])}Z · 25.09: ${T5.length} tidssteg`);
const idx = (T, a, b) => T.map((t, i) => [t, i]).filter(([t]) => t >= a && t <= b).map(([, i]) => i);
const d6 = s => Date.parse(`2026-09-26T${s}:00Z`) / 1000, d5 = s => Date.parse(`2026-09-25T${s}:00Z`) / 1000;
const morning = idx(T6, d6('05:15'), d6('06:15')), night6 = idx(T6, d6('00:00'), d6('05:00')), night5 = idx(T5, d5('22:00'), d5('23:59'));
for (const [n, la, lo] of cands) {
  const b6 = await refine('6', locate(g6, la, lo), la, lo), b5 = await refine('5', locate(g5, la, lo), la, lo);
  const box = async (day, b, I) => { if (!I.length) return []; const t = await get(day, `lwe_precipitation_rate[${I[0]}:1:${I[I.length - 1]}][${b.y - 1}:1:${b.y + 1}][${b.x - 1}:1:${b.x + 1}]`);
    const body = t.split('lwe_precipitation_rate.lwe_precipitation_rate')[1] || t; const v = []; for (const l of body.split('\n')) { const m = l.match(/^\[(\d+)\]\[(\d+)\],\s*(.*)$/); if (m) v.push(...m[3].split(',').map(Number)); } return v.map(x => (x < 0 || x > 500 ? 0 : x)); };
  const vm = await box('6', b6, morning), vn6 = await box('6', b6, night6), vn5 = await box('5', b5, night5);
  const frac = v => v.length ? v.filter(x => x >= 0.1).length / v.length : NaN, mx = v => v.length ? Math.max(...v) : NaN;
  out.push({ n, morn: frac(vm), mornMax: mx(vm), night: frac([...vn5, ...vn6]), nightMax: mx([...vn5, ...vn6]) });
  console.log(`${n.padEnd(18)} morgen 05:15–06:15Z: nedbør i ${(100 * frac(vm)).toFixed(0).padStart(3)} % av (tid×3×3), maks ${mx(vm).toFixed(1)} mm/t · natt 22–05Z: ${(100 * frac([...vn5, ...vn6])).toFixed(0).padStart(3)} %, maks ${mx([...vn5, ...vn6]).toFixed(1)} mm/t`);
}
fs.writeFileSync('radar_2609.json', JSON.stringify(out, null, 1));
