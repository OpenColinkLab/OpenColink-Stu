export const transformControls=[
  {id:'stretchX',name:'横向拉伸',min:50,max:200,default:100},
  {id:'stretchY',name:'纵向拉伸',min:50,max:200,default:100},
  {id:'skewX',name:'横向倾斜',min:-35,max:35,default:0},
  {id:'skewY',name:'纵向倾斜',min:-35,max:35,default:0},
];
export function stickerMatrix(v){
  const r=v.rotation*Math.PI/180,cos=Math.cos(r),sin=Math.sin(r),x=(v.stretchX??100)/100,y=(v.stretchY??100)/100;
  const kx=Math.tan((v.skewX??0)*Math.PI/180),ky=Math.tan((v.skewY??0)*Math.PI/180);
  return [x*(cos-sin*ky),x*(sin+cos*ky),y*(cos*kx-sin),y*(sin*kx+cos)];
}
export function stickerPoint(v,x,y){const[a,b,c,d]=stickerMatrix(v);return {x:v.x+a*x+c*y,y:v.y+b*x+d*y};}
export function containsSticker(v,x,y){
  const[a,b,c,d]=stickerMatrix(v),det=a*d-b*c,dx=x-v.x,dy=y-v.y;
  return Math.abs((d*dx-c*dy)/det)<=v.size/2&&Math.abs((-b*dx+a*dy)/det)<=v.size/2;
}
