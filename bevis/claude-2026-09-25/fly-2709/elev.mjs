import fs from 'fs';
const P = JSON.parse(fs.readFileSync('hm_36.bin.json'));
const T0 = Date.parse(process.argv[2] || '2026-09-26T18:09:30Z') / 1000, T1 = Date.parse(process.argv[3] || '2026-09-26T18:11:30Z') / 1000;
const sites = { S03: [60.53938, 12.18334, 250], S03topp: [60.5544, 12.1468, 300], Finnskog324: [60.462, 12.229, 300], SolorNord: [60.675, 12.10, 300], L07: [60.82353, 11.5375, 300], A01: [61.23076, 11.72394, 500], AmotDno: [61.30, 11.40, 400], AmotFelt: [61.22, 11.43, 300], Ringebu: [61.55, 10.40, 900] };
const R = 6371000, rad = Math.PI / 180;
function look(s, p) { // ECEF look angles
  const ecef = (la, lo, h) => { la *= rad; lo *= rad; return [(R + h) * Math.cos(la) * Math.cos(lo), (R + h) * Math.cos(la) * Math.sin(lo), (R + h) * Math.sin(la)]; };
  const a = ecef(s[0], s[1], s[2]), b = ecef(p.lat, p.lon, p.alt * 0.3048), d = b.map((v, i) => v - a[i]);
  const la = s[0] * rad, lo = s[1] * rad;
  const e = -Math.sin(lo) * d[0] + Math.cos(lo) * d[1], n = -Math.sin(la) * Math.cos(lo) * d[0] - Math.sin(la) * Math.sin(lo) * d[1] + Math.cos(la) * d[2], u = Math.cos(la) * Math.cos(lo) * d[0] + Math.cos(la) * Math.sin(lo) * d[1] + Math.sin(la) * d[2];
  const rng = Math.hypot(e, n, u); return { el: Math.asin(u / rng) / rad, az: (Math.atan2(e, n) / rad + 360) % 360, km: rng / 1000 };
}
const by = {}; for (const p of P) if (p.t >= T0 && p.t <= T1 && p.alt > 0) (by[p.hex] ??= []).push(p);
for (const [sn, s] of Object.entries(sites)) {
  const best = [];
  for (const [h, v] of Object.entries(by)) { let m = null; for (const p of v) { const l = look(s, p); if (!m || l.el > m.el) m = { ...l, p }; } best.push(m); }
  best.sort((a, b) => b.el - a.el);
  console.log(sn.padEnd(12), best.slice(0, 3).map(m => `${(m.p.cs || m.p.hex).padEnd(8)} el ${m.el.toFixed(1).padStart(5)}° az ${m.az.toFixed(0).padStart(3)} ${m.km.toFixed(0).padStart(3)} km FL${Math.round(m.p.alt / 100)} ${new Date(m.p.t * 1000).toISOString().slice(11, 19)}`).join(' | '));
}
