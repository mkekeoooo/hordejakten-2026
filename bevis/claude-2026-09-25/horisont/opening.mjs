// Openness around the camera from DOM1-DTM1 (canopy height model), per sector and distance band.
// open = CHM < 3 m. Sectors are TRUE azimuth from the camera (5 m NE of the box).
import { toUTM } from './utm.mjs'; import { raster } from './fetch.mjs';
const d2r=Math.PI/180, R=6371000;
const cands=[['1 Myklebysaeterveien vest',61.3995,11.0316],['2 Madsskardveien traktorvei',61.4443,11.1234],
 ['3a S-Messelt S1',61.4571,10.8362],['3b S-Messelt S2',61.4545,10.8406],['4 Madsskardveien ost',61.4518,11.1428],
 ['5a Jernvinneveien',61.43511,11.14349],['A1 Birkebeinerveien',61.4487,10.9775],['A2 Galaveien C07',61.4625,10.9751]];
function gdir(lat,lon,az){ const d=100,[x0,y0]=toUTM(lat,lon); const [x1,y1]=toUTM(lat+d*Math.cos(az*d2r)/R/d2r, lon+d*Math.sin(az*d2r)/(R*Math.cos(lat*d2r))/d2r); return [(x1-x0)/d,(y1-y0)/d]; }
const SECT=[['E 80-115',80,115],['SE 115-150',115,150],['N 330-30',330,390],['view SW 188-250',188,250]];
const BANDS=[[10,50],[50,150],[150,300]];
console.log('share of CHM<3 m (open) and median CHM, per sector x band (10-50 m | 50-150 m | 150-300 m)');
for (const [name,la,lo] of cands){
  const [bx,by]=toUTM(la,lo); const X0=Math.floor(bx)-400, Y0=Math.floor(by)-400;
  const dom=await raster('DOM',X0,Y0,X0+800,Y0+800,1), dtm=await raster('DTM',X0,Y0,X0+800,Y0+800,1);
  const [cxv,cyv]=gdir(la,lo,39); const cx=bx+5*cxv, cy=by+5*cyv;
  const row=[];
  for (const [sn,a0,a1] of SECT){ const cells=[];
    for (const [r0,r1] of BANDS){ const v=[]; for(let az=a0; az<=a1; az+=1){ const [vx,vy]=gdir(la,lo,az%360); for(let r=r0; r<r1; r+=1){ const x=cx+vx*r,y=cy+vy*r; const h=dom.at(x,y)-dtm.at(x,y); if(isFinite(h)) v.push(Math.max(0,h)); } }
      v.sort((a,b)=>a-b); cells.push(`${Math.round(100*v.filter(h=>h<3).length/v.length)}%/${v[Math.floor(v.length/2)].toFixed(0)}m`); }
    row.push(`${sn}: ${cells.join(' ')}`); }
  console.log(name.padEnd(27), row.join('  |  '));
}
