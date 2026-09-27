import fs from 'fs';
const L = f => JSON.parse(fs.readFileSync(f));
const P = [...L('hm_21_38.bin.json'), ...L('hm_21_39.bin.json'), ...L('hm_22_37.bin.json'), ...L('hm_26_36.bin.json')].filter(p => p.alt > 1000);
const rad = Math.PI / 180;
const look = (la, lo, p) => { const dn = (p.lat - la) * 111195, de = (p.lon - lo) * 111195 * Math.cos(la * rad), d = Math.hypot(dn, de); return { el: Math.atan2(p.alt * 0.3048 - 300 - d * d / 12742000, d) / rad, az: (Math.atan2(de, dn) / rad + 360) % 360, km: d / 1000 }; };
const sites = { S03: [60.53938, 12.18334], 'Rena-vest': [61.160, 11.308], 'Åmot dno': [61.30, 11.40], L07: [60.82353, 11.5375] };
const win = [['21.09 19:26–19:36Z', '2026-09-21T19:26:00Z', '2026-09-21T19:36:00Z'], ['22.09 18:29–18:38Z', '2026-09-22T18:29:00Z', '2026-09-22T18:38:00Z'], ['26.09 18:07–18:14Z', '2026-09-26T18:07:00Z', '2026-09-26T18:14:00Z']];
for (const [n, [la, lo]] of Object.entries(sites)) { console.log(`== ${n}`);
  for (const [w, a, b] of win) { const pts = P.filter(p => p.t >= Date.parse(a) / 1000 && p.t <= Date.parse(b) / 1000); const by = {}; for (const p of pts) (by[p.cs || p.hex] ??= []).push(p);
    const list = Object.entries(by).map(([c, v]) => { v.sort((x, y) => x.t - y.t); let m = null; for (const p of v) { const l = look(la, lo, p); if (!m || l.el > m.el) m = { ...l, p }; } const i = v.indexOf(m.p), q = v[Math.min(v.length - 1, i + 1)], o = v[Math.max(0, i - 1)]; const hd = (Math.atan2((q.lon - o.lon) * Math.cos(la * rad), q.lat - o.lat) / rad + 360) % 360; return { c, ...m, hd }; }).filter(x => x.el >= 10).sort((x, y) => x.p.t - y.p.t);
    console.log(`  ${w}: ` + (list.map(x => `${x.c} ${new Date(x.p.t * 1000).toISOString().slice(11, 19)} el ${x.el.toFixed(0)}° az ${x.az.toFixed(0)} kurs ${x.hd.toFixed(0)} FL${Math.round(x.p.alt / 100)}`).join(' | ') || 'ingen ≥10°')); } }
