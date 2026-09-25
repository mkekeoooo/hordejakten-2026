// Codex' projeksjonsmodell (#9): nivellert kamera med kurs C = 219,4°. En retning med høyde h og asimut A
// vises i bildet med vinkel fra loddrett tilt = atan2(cos h · sin(A − C), sin h). Negativ = mot bildets venstre.
// Observert (default.no): 10–20° fra loddrett, lent mot kamera-venstre.
import fs from 'fs'; import zlib from 'zlib';
const d2r = Math.PI / 180, R = 6371000, C = 219.4;
const load = f => { let b = fs.readFileSync(f); if (b[0] === 0x1f) b = zlib.gunzipSync(b); return JSON.parse(b); };
function pos(j, t) { const t0 = j.timestamp, tr = j.trace; for (let i = 1; i < tr.length; i++) { const a = tr[i - 1], b = tr[i], ta = t0 + a[0], tb = t0 + b[0];
  if (ta <= t && t <= tb && b[0] - a[0] < 60) { const f = (t - ta) / (tb - ta), g = x => x[10] ?? (typeof x[3] === 'number' ? x[3] : null);
    return { lat: a[1] + f * (b[1] - a[1]), lon: a[2] + f * (b[2] - a[2]), ft: g(a) + f * (g(b) - g(a)) }; } } return null; }
function look(la, lo, moh, p) { const x = (p.lon - lo) * d2r * Math.cos((la + p.lat) / 2 * d2r) * R, y = (p.lat - la) * d2r * R, D = Math.hypot(x, y);
  return { h: Math.atan2(p.ft * 0.3048 - moh - D * D / (2 * R), D) / d2r, A: (Math.atan2(x, y) / d2r + 360) % 360 }; }
const tilt = (h, A) => Math.atan2(Math.cos(h * d2r) * Math.sin((A - C) * d2r), Math.sin(h * d2r)) / d2r;
const fly = { NOZ9EG: load('trace_4791ac.json'), NOZ56U: load('trace_47a3b0.json') };
const s0 = Date.UTC(2026, 8, 21, 19, 29, 38) / 1000;
const steder = [['1 Myklebysæterveien', 61.3995, 11.0316, 594], ['2 Madsskardveien', 61.4443, 11.1234, 598], ['3 S-Messelt S1', 61.4571, 10.8362, 898],
  ['4 Madsskardveien øst', 61.4518, 11.1428, 646], ['A1 Birkebeinerveien', 61.4487, 10.9775, 605], ['Koppang', 61.57, 11.04, 400], ['Rena', 61.13, 11.37, 300],
  ['Løten', 60.82, 11.35, 250], ['Elverum S', 60.70, 11.60, 250], ['Sjusjøen', 61.23, 10.62, 850],
  ['Osen/Trysil-vest', 61.2386, 12.2692, 700], ['Trysil', 61.31, 12.26, 600], ['Engerdal', 61.76, 11.96, 650], ['Finnskogen', 60.6, 12.5, 400]];
const D = [15, 22, 30, 45];
console.log('tilt i bildet (° fra loddrett, − = venstre) · høyde h · asimut A, ved strømtid 21:29:38 − forsinkelse. ✓ = |tilt| 5–25° og mot venstre');
for (const [cs, j] of Object.entries(fly)) {
  console.log(`\n${cs}`); console.log('sted'.padEnd(22) + D.map(d => `${d} s`.padEnd(24)).join(''));
  for (const [n, la, lo, moh] of steder) console.log(n.padEnd(22) + D.map(d => { const p = pos(j, s0 - d); if (!p) return '-'.padEnd(24);
    const l = look(la, lo, moh, p), t = tilt(l.h, l.A), ok = t < -5 && t > -25;
    return `${ok ? '✓' : ' '}${t.toFixed(0).padStart(4)}° h${l.h.toFixed(0).padStart(3)} A${l.A.toFixed(0).padStart(4)}`.padEnd(24); }).join(''));
}
