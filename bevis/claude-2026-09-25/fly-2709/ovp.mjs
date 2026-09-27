import fs from 'fs';
const [name, la0, lo0, la1, lo1] = process.argv.slice(2);
const bb = `(${la0},${lo0},${la1},${lo1})`;
const Q = { roads: `[out:json][timeout:120];way["highway"~"^(track|service|unclassified|tertiary|secondary|primary|residential)$"]${bb};out geom;`, water: `[out:json][timeout:120];(way["waterway"]${bb};way["natural"="water"]${bb};relation["natural"="water"]${bb};way["natural"="wetland"]${bb};);out geom;` };
for (const [k, q] of Object.entries(Q)) for (let a = 0; a < 4; a++) { const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'User-Agent': 'hordejakten-audit/1.0', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q) }); const t = await r.text(); if (r.ok && t.startsWith('{')) { fs.writeFileSync(`${k}_${name}.json`, t); console.log(k, JSON.parse(t).elements.length); break; } console.log(k, r.status, 'retry'); await new Promise(s => setTimeout(s, 8000)); }
