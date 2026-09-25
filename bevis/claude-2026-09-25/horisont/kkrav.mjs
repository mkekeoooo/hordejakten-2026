// Reproduce the report's forest requirements K0-K4 (s. 12) at the published coordinates, 5x5 (10 m) neighbourhood.
// K0 212-226deg 3-7 m median<3 | K1 213-226 8-17 m median<3 | K2 190-207 3-20 m p90>=10 | K3 232-250 5-25 m p90>=10 | K4 213-226 25-70 m p90>=12
// Camera = box + 5 m toward 39deg. Also reports tree height p90 in the whole view (188-250deg, 5-70 m) as a "veldig hoye traer" check.
import { toUTM } from './utm.mjs'; import { raster } from './fetch.mjs';
const d2r=Math.PI/180, R=6371000;
const cands=[['1 Myklebysaeterveien vest',61.3995,11.0316],['2 Madsskardveien traktorvei',61.4443,11.1234],
 ['3a S-Messelt S1',61.4571,10.8362],['3b S-Messelt S2',61.4545,10.8406],['4 Madsskardveien ost',61.4518,11.1428],
 ['5a Jernvinneveien',61.43511,11.14349],['A1 Birkebeinerveien',61.4487,10.9775],['A2 Galaveien C07',61.4625,10.9751]];
const K=[['K0',212,226,3,7,'med',3,'<'],['K1',213,226,8,17,'med',3,'<'],['K2',190,207,3,20,'p90',10,'>='],['K3',232,250,5,25,'p90',10,'>='],['K4',213,226,25,70,'p90',12,'>=']];
function gdir(lat,lon,az){ const d=100,[x0,y0]=toUTM(lat,lon); const [x1,y1]=toUTM(lat+d*Math.cos(az*d2r)/R/d2r, lon+d*Math.sin(az*d2r)/(R*Math.cos(lat*d2r))/d2r); return [(x1-x0)/d,(y1-y0)/d]; }
const q=(v,p)=>{const b=[...v].sort((a,c)=>a-c); return b[Math.floor(p*(b.length-1))];};
console.log('name'.padEnd(27),'pass/25','centre K0 K1 K2 K3 K4 (value)'.padEnd(46),'view p90 / p99 tree height (centre)');
for (const [name,la,lo] of cands){
  const [bx,by]=toUTM(la,lo); const X0=Math.floor(bx)-150, Y0=Math.floor(by)-150;
  const dom=await raster('DOM',X0,Y0,X0+300,Y0+300,1), dtm=await raster('DTM',X0,Y0,X0+300,Y0+300,1);
  const [ex,ey]=gdir(la,lo,90),[nx,ny]=gdir(la,lo,0),[cxv,cyv]=gdir(la,lo,39); let pass=0, centre=null, view=null;
  for(let oe=-20;oe<=20;oe+=10) for(let on=-20;on<=20;on+=10){
    const cx=bx+ex*oe+nx*on+5*cxv, cy=by+ey*oe+ny*on+5*cyv; const res=[];
    for(const [k,a0,a1,r0,r1,st,th,op] of K){ const v=[]; for(let az=a0;az<=a1;az+=0.5){ const [vx,vy]=gdir(la,lo,az); for(let r=r0;r<=r1;r+=0.5){ const x=cx+vx*r,y=cy+vy*r; v.push(Math.max(0,dom.at(x,y)-dtm.at(x,y))); } }
      const val= st==='med'? q(v,.5) : q(v,.9); res.push([k,val, op==='<'? val<th : val>=th]); }
    if(res.every(r=>r[2])) pass++;
    if(oe===0&&on===0){ centre=res; const v=[]; for(let az=188;az<=250;az+=0.5){ const [vx,vy]=gdir(la,lo,az); for(let r=5;r<=70;r+=0.5){ const x=cx+vx*r,y=cy+vy*r; v.push(Math.max(0,dom.at(x,y)-dtm.at(x,y))); } } view=[q(v,.9),q(v,.99)]; }
  }
  console.log(name.padEnd(27), String(pass).padStart(7), centre.map(([k,v,ok])=>`${ok?'✓':'✗'}${v.toFixed(1)}`).join(' ').padEnd(46), `${view[0].toFixed(1)} / ${view[1].toFixed(1)} m`);
}
