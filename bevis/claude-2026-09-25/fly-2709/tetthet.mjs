import fs from 'fs';
const P = []; for (let i = 12; i <= 34; i++) { const f = `hm_23_${i}.bin.json`; if (fs.existsSync(f)) for (const p of JSON.parse(fs.readFileSync(f))) if (p.alt > 1000) P.push(p); }
const rad = Math.PI / 180;
const el = (la, lo, p) => { const dn = (p.lat - la) * 111195, de = (p.lon - lo) * 111195 * Math.cos(la * rad), d = Math.hypot(dn, de); return Math.atan2(p.alt * 0.3048 - 300 - d * d / 12742000, d) / rad; };
const sites = { S03: [60.53938, 12.18334], 'Finnskog #324': [60.462, 12.229], 'Rena-vest': [61.160, 11.308], 'Rena (mellom sporene)': [61.18, 11.40], 'Åmot dno': [61.30, 11.40], L07: [60.82353, 11.5375], Løten: [60.82, 11.35], A01: [61.23076, 11.72394], Ringebu: [61.50, 10.55] };
console.log('23.09 06:00–17:59Z: antall ulike fly som når ≥ 20° / 30° / 45° over stedet');
for (const [n, [la, lo]] of Object.entries(sites)) { const m = {}; for (const p of P) { const e = el(la, lo, p); const k = p.hex; if (!(k in m) || e > m[k]) m[k] = e; }
  const v = Object.values(m); console.log(n.padEnd(24), [20, 30, 45].map(t => String(v.filter(x => x >= t).length).padStart(4)).join(' ')); }
