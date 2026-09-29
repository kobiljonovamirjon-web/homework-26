// Процедурные 3D-модели: боковой силуэт выдавливается в объём (ExtrudeGeometry), + салон-стекло, колёса, фары.
// [длина, ширина, клиренс, пояс, крыша, нос, багажник, салон-зад, салон-перед, крыша-зад, крыша-перед, радиус колеса, запаска]
const SPEC={
"Mercedes-AMG G 63":[4.9,1.98,.27,1.3,1.95,1.15,1.35,.1,.68,.1,.66,.4,1],
"Mercedes-Benz S 500":[5.29,1.95,.14,.95,1.5,.8,.95,.22,.68,.3,.58,.36],
"Mercedes-AMG C 63 S":[4.75,1.85,.12,.9,1.43,.75,.9,.2,.64,.3,.55,.35],
"Porsche Cayenne Turbo":[4.93,1.98,.21,1.08,1.68,.95,1.1,.12,.66,.25,.6,.38],
"Porsche Panamera 4S":[5.05,1.94,.12,.9,1.42,.74,.94,.22,.64,.34,.55,.35],
"Porsche Taycan Turbo S":[4.96,1.97,.12,.88,1.38,.7,.9,.2,.62,.32,.52,.35],
"Mercedes-Benz C 63 AMG (W204)":[4.73,1.86],
"Mercedes-AMG SL 63":[4.70,1.92],
"Porsche 911 Turbo S (992)":[4.54,1.90],
"BMW M8 Competition Coupe":[4.87,1.9,.11,.88,1.38,.72,.9,.25,.62,.36,.54,.35],
"BMW M5 (F90)":[4.97,1.9,.14,.95,1.47,.8,.96,.2,.68,.3,.58,.36],
"BMW X6 M Competition":[4.94,2,.2,1.1,1.7,.97,1.1,.15,.66,.32,.58,.38],
"Porsche 911 Turbo (930)":[4.29,1.77,.11,.82,1.3,.62,.92,.3,.6,.42,.56,.34]
};
const V=(a,b)=>new THREE.Vector2(a,b);
function ext(pts,depth,bev,mat){
  const d=depth-2*bev, g=new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(p=>V(p[0],p[1]))),
    {depth:d,bevelEnabled:true,bevelThickness:bev,bevelSize:bev*.6,bevelSegments:5,curveSegments:1});
  g.translate(0,0,-d/2); return new THREE.Mesh(g,mat);
}
function chaikin(p,n,k=.22){for(;n>0;n--){const o=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];
  o.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k],[a[0]+(b[0]-a[0])*(1-k),a[1]+(b[1]-a[1])*(1-k)])}p=o}return p}
function box(w,h,d,m,x,y,z){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);return b}
function cyl(r,h,m,x,y,z){const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40),m);c.rotation.x=Math.PI/2;c.position.set(x,y,z);return c}

function buildCar(title,color){
  const [L,W,gc,belt,roof,nh,tr,cbR,cbF,roR,roF,r,spare]=SPEC[title], car=new THREE.Group(), x=f=>f*L-L/2;
  const P=new THREE.MeshPhysicalMaterial({color,metalness:.6,roughness:.27,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:3.2});
  const G=new THREE.MeshPhysicalMaterial({color:0x0b121c,metalness:.9,roughness:.04,envMapIntensity:2.5,side:THREE.DoubleSide});
  const K=new THREE.MeshStandardMaterial({color:0x060607,roughness:.55}), RM=new THREE.MeshStandardMaterial({color:0xc9ccd2,metalness:1,roughness:.22});
  const em=(c,i)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i});
  const add=o=>{car.add(o);return o};

  const it=spare?1:2;
  add(ext(chaikin([[x(0),gc],[x(1),gc],[x(1),nh],[x(cbF),belt],[x(cbR),belt],[x(0),tr]],it),W,.1,P));           // кузов
  const cab=chaikin([[x(cbR),belt-.03],[x(roR),roof+.06],[x(roF),roof+.06],[x(cbF),belt-.03]],it,.2);
  add(ext(cab,W*.86,.06,P));                                                                        // кабина
  const cx=(x(cbR)+x(cbF))/2, cy=(belt+roof)/2;
  add(ext(cab.map(p=>[cx+(p[0]-cx)*.86,cy+(p[1]-cy)*.76]),W*.88,.01,G));                            // боковые стёкла
  const pane=(a,b,w)=>{                                                                             // лобовое / заднее стекло
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),g=new THREE.PlaneGeometry(len,w);g.rotateX(-Math.PI/2);
    const m=new THREE.Mesh(g,G);m.rotation.z=Math.atan2(dy,dx);
    let n=[-dy/len,dx/len];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(n[0]*(mx-cx)+n[1]*(my-cy)<0)n=[-n[0],-n[1]];
    m.position.set(mx+n[0]*.075,my+n[1]*.075,0);add(m)};
  pane([x(cbF),belt],[x(roF),roof],W*.7); pane([x(cbR),belt],[x(roR),roof],W*.68);

  const HL=em(0xdff4ff,2.2), TL=em(0xff1a2a,1.6);
  add(box(.05,.2,W*.44,K,x(1)+.08,gc+(nh-gc)*.42,0));                                               // решётка
  add(box(.05,.05,.3,new THREE.MeshStandardMaterial({color:0xeeeeee}),x(1)+.09,gc+.2,0));            // номер
  add(box(.05,.05,.3,new THREE.MeshStandardMaterial({color:0xeeeeee}),x(0)-.09,gc+.28,0));
  [-1,1].forEach(s=>{
    add(box(.07,.09,.4,HL,x(1)+.07,nh-.11,s*W*.33));                                                // фары
    add(box(.07,.08,.42,TL,x(0)-.07,tr-.13,s*W*.34));                                               // стопы
    add(box(.15,.1,.2,P,x(cbF)-.02,belt+.1,s*(W/2+.09)));                                          // зеркала
    const tw=r>.36?.32:.29, zc=s*(W/2+.02-tw/2), zo=s*(W/2+.02);
    [.2,.8].forEach(f=>{
      const w=new THREE.Group();w.position.set(x(f),r,zc);
      w.add(cyl(r,tw,new THREE.MeshStandardMaterial({color:0x101011,roughness:.85}),0,0,0));
      w.add(cyl(r*.7,tw+.02,RM,0,0,0)); w.add(cyl(r*.52,tw+.03,K,0,0,0));
      for(let i=0;i<5;i++){const sp=box(r*1.3,r*.09,tw+.04,RM,0,0,0);sp.rotation.z=i*Math.PI/5;w.add(sp)}
      w.add(cyl(r*.14,tw+.05,RM,0,0,0)); add(w);
      const a=new THREE.Mesh(new THREE.CircleGeometry(r*1.14,40),K);a.position.set(x(f),r,s*(W/2+.005));if(s<0)a.rotation.y=Math.PI;add(a);
    });
  });
  if(spare){const w=new THREE.Mesh(new THREE.CylinderGeometry(r*.95,r*.95,.22,40),new THREE.MeshStandardMaterial({color:0x101011,roughness:.85}));
    w.rotation.z=Math.PI/2;w.position.set(x(0)-.16,belt+.02,0);add(w);
    const h=new THREE.Mesh(new THREE.CylinderGeometry(r*.5,r*.5,.23,30),RM);h.rotation.z=Math.PI/2;h.position.copy(w.position);add(h)}
  // мягкая тень под машиной
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,4,64,64,64);
  gr.addColorStop(0,'rgba(0,0,0,.85)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(L*1.3,W*1.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
  sh.rotation.x=-Math.PI/2;sh.position.y=.01;car.add(sh);
  car.userData.paint=P; return car;
}
