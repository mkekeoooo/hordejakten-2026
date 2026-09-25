// NOAA solar position (Meeus / NOAA spreadsheet algorithm), independent implementation
const d2r=Math.PI/180, r2d=180/Math.PI;
function jd(y,m,d,hUTC){ if(m<=2){y--;m+=12;} const A=Math.floor(y/100), B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5+hUTC/24; }
function solar(lat,lon,y,m,d,hUTC){
  const JD=jd(y,m,d,hUTC), T=(JD-2451545)/36525;
  const L0=(280.46646+T*(36000.76983+T*0.0003032))%360;
  const M=357.52911+T*(35999.05029-0.0001537*T);
  const e=0.016708634-T*(0.000042037+0.0000001267*T);
  const C=Math.sin(M*d2r)*(1.914602-T*(0.004817+0.000014*T))+Math.sin(2*M*d2r)*(0.019993-0.000101*T)+Math.sin(3*M*d2r)*0.000289;
  const trueLong=L0+C, om=125.04-1934.136*T;
  const lam=trueLong-0.00569-0.00478*Math.sin(om*d2r);
  const eps0=23+(26+((21.448-T*(46.815+T*(0.00059-T*0.001813))))/60)/60;
  const eps=eps0+0.00256*Math.cos(om*d2r);
  const decl=Math.asin(Math.sin(eps*d2r)*Math.sin(lam*d2r))*r2d;
  const y2=Math.tan(eps/2*d2r)**2;
  const eqt=4*r2d*(y2*Math.sin(2*L0*d2r)-2*e*Math.sin(M*d2r)+4*e*y2*Math.sin(M*d2r)*Math.cos(2*L0*d2r)-0.5*y2*y2*Math.sin(4*L0*d2r)-1.25*e*e*Math.sin(2*M*d2r));
  const tst=(hUTC*60+eqt+4*lon)%1440;
  const ha=(tst/4<0)?tst/4+180:tst/4-180;
  const cosz=Math.sin(lat*d2r)*Math.sin(decl*d2r)+Math.cos(lat*d2r)*Math.cos(decl*d2r)*Math.cos(ha*d2r);
  const zen=Math.acos(cosz)*r2d;
  let az=Math.acos(((Math.sin(lat*d2r)*Math.cos(zen*d2r))-Math.sin(decl*d2r))/(Math.cos(lat*d2r)*Math.sin(zen*d2r)))*r2d;
  az = ha>0 ? (az+180)%360 : (540-az)%360;
  const el=90-zen;
  // approximate atmospheric refraction (NOAA)
  let refr=0; if(el>85) refr=0; else if(el>5){const t=Math.tan(el*d2r);refr=58.1/t-0.07/t**3+0.000086/t**5;} else if(el>-0.575){refr=1735+el*(-518.2+el*(103.4+el*(-12.79+el*0.711)));} else refr=-20.774/Math.tan(el*d2r);
  refr/=3600;
  return {az,el,elRefr:el+refr,decl,eqt};
}
export { solar };
