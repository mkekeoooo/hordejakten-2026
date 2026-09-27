import fs from 'fs'; import zlib from 'zlib';
const f = process.argv[2];
const buf = zlib.gunzipSync(fs.readFileSync(f));
const a = new Int32Array(buf.buffer, buf.byteOffset, buf.length >> 2);
let t = 0; const cs = {}; const out = [];
for (let i = 0; i + 3 < a.length; i += 4) {
  if (a[i] == 0xe7f7c9d) { t = (a[i + 2] >>> 0) / 1000 + a[i + 1] * 4294967.296; continue; }
  const hex = (a[i] & 0xffffff).toString(16).padStart(6, '0');
  if (a[i + 1] > 1073741824) { const b = Buffer.alloc(8); b.writeInt32LE(a[i + 2], 0); b.writeInt32LE(a[i + 3], 4); cs[hex] = b.toString('latin1').replace(/[^A-Z0-9]/g, ''); continue; }
  const lat = a[i + 1] / 1e6, lon = a[i + 2] / 1e6;
  if (lat < 59.5 || lat > 62.5 || lon < 9.5 || lon > 13.5) continue;
  let alt = a[i + 3] & 65535; if (alt & 32768) alt |= -65536; alt = alt == -123 ? 0 : alt * 25;
  out.push({ t, hex, lat, lon, alt });
}
for (const o of out) o.cs = cs[o.hex] || '';
const by = {}; for (const o of out) (by[o.hex] ??= []).push(o);
for (const [h, v] of Object.entries(by)) { v.sort((x, y) => x.t - y.t); const s = v[0], e = v[v.length - 1];
  console.log(h, s.cs || v.find(x => x.cs)?.cs || '', v.length, new Date(s.t * 1000).toISOString().slice(11, 19), s.lat.toFixed(2), s.lon.toFixed(2), s.alt, '->', new Date(e.t * 1000).toISOString().slice(11, 19), e.lat.toFixed(2), e.lon.toFixed(2), e.alt); }
fs.writeFileSync(f + '.json', JSON.stringify(out));
