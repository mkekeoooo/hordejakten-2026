// Pure-terrain (DTM) horizon toward the morning sun, from the ground and from 20 m (crown height), at the
// camera and across the 5x5 neighbourhood. Reports max angle and the distance/elevation of the blocking ridge.
import { toUTM } from './utm.mjs'; import { raster } from './fetch.mjs'; import { solar } from './sun.mjs';
const d2r=Math.PI/180, R=6371000, kRef=0.13;
const cands=[['1 Myklebysaeterveien vest',61.3995,11.0316],['2 Madsskardveien traktorvei',61.4443,11.1234],
 ['3a S-Messelt S1',61.4571,10.8362],['3b S-Messelt S2',61.4545,10.8406],['4 Madsskardveien ost',61.4518,11.1428],
 ['5 Jernvinneveien',61.4351,11.1435],['A1 Birkebeinerveien',61.4487,10.9775],['A2 Galaveien C07',61.4625,10.9751]];
function gdir(lat,lon,az){ const d=100,[x0,y0]=toUTM(lat,lon); const [x1,y1]=toUTM(lat+d*Math.cos(az*d2r)/R/d2r, lon+d*Math.sin(az*d2r)/(R*Math.cos(lat*d2r))/d2r); return [(x1-x0)/d,(y1-y0)/d]; }
const s47=solar(61.43,11.08,2026,9,21,5+47/60), s50=solar(61.43,11.08,2026,9,21,5+50/60), s00=solar(61.43,11.08,2026,9,21,6);
console.log(`sun 07:47 az ${s47.az.toFixed(1)} el ${s47.elRefr.toFixed(2)} | 07:50 ${s50.elRefr.toFixed(2)} | 08:00 az ${s00.az.toFixed(1)} el ${s00.elRefr.toFixed(2)}`);
console.log('name'.padEnd(28),'hz@0m az97/99/101','hz@20m az97/99/101','blocking ridge (d, moh) @20m az99','nbhd hz@20m min/max');
for (const [name,la,lo] of cands){
  const [bx,by]=toUTM(la,lo); const X0=Math.floor(bx)-200, Y0=Math.floor(by)-450;
  const dtm1=await raster('DTM',X0,Y0,X0+1200,Y0+650,1), dtm=await raster('DTM',Math.floor(bx)-250,Math.floor(by)-7050,Math.floor(bx)+19950,Math.floor(by)+2950,20);
  const G=(x,y,d)=> d<=950? dtm1.at(x,y) : dtm.at(x,y);
  function hz(x,y,z,az){ const [vx,vy]=gdir(la,lo,az); let h=-90, arg=null; for(let d=5; d<20000; d+= d<950?1:20){ const g=G(x+vx*d,y+vy*d,d); if(!isFinite(g)) continue; const a=Math.atan((g-d*d*(1-kRef)/(2*R)-z)/d)/d2r; if(a>h){h=a; arg=[d,g];} } return [h,arg]; }
  const [cxv,cyv]=gdir(la,lo,39); const cx=bx+5*cxv, cy=by+5*cyv, g0=dtm1.at(cx,cy);
  const h0=[97,99,101].map(a=>hz(cx,cy,g0+1.5,a)[0].toFixed(1)).join('/'), h20=[97,99,101].map(a=>hz(cx,cy,g0+20,a)[0].toFixed(1)).join('/');
  const [hb,ab]=hz(cx,cy,g0+20,99);
  const [ex,ey]=gdir(la,lo,90), [nx,ny]=gdir(la,lo,0); const nb=[];
  for(let oe=-20; oe<=20; oe+=10) for(let on=-20; on<=20; on+=10){ const x=cx+ex*oe+nx*on, y=cy+ey*oe+ny*on; nb.push(hz(x,y,dtm1.at(x,y)+20,99)[0]); }
  console.log(name.padEnd(28), h0.padEnd(17), h20.padEnd(18), `${ab[0]} m, ${ab[1].toFixed(0)} moh (site ${g0.toFixed(0)})`.padEnd(33), `${Math.min(...nb).toFixed(1)}/${Math.max(...nb).toFixed(1)}`);
}
