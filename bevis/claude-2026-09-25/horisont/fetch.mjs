import fs from 'fs';
// Fetch a raw float32 raster (row 0 = north) from Kartverket's NHM ImageServer.
export async function raster(kind, x0, y0, x1, y1, res){
  const W=Math.round((x1-x0)/res), H=Math.round((y1-y0)/res);
  const cache=`cache_${kind}_${x0}_${y0}_${x1}_${y1}_${res}.f32`;
  let buf; if(fs.existsSync(cache)) buf=fs.readFileSync(cache); else {
    const u=`https://hoydedata.no/arcgis/rest/services/NHM_${kind}_25833/ImageServer/exportImage?bbox=${x0},${y0},${x1},${y1}&bboxSR=25833&imageSR=25833&size=${W},${H}&format=bsq&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image`;
    const r=await fetch(u); buf=Buffer.from(await r.arrayBuffer()); if(buf.length<W*H*4) throw new Error(kind+' bad size '+buf.length+' '+buf.slice(0,200).toString()); fs.writeFileSync(cache,buf); }
  const le=new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset+W*H*4));
  return { W,H,x0,y0,x1,y1,res, d:le, at(x,y){ const c=Math.floor((x-x0)/res), r=Math.floor((y1-y)/res); if(c<0||r<0||c>=W||r>=H) return NaN; return this.d[r*W+c]; } };
}
