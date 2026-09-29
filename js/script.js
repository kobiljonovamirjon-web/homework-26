const data = {
  Mercedes: [
    {title:"Mercedes-AMG G 63", spec:"4.0 V8 Biturbo · 585 л.с.", price:185000, desc:"Легендарный внедорожник с 4.0-литровым V8 Biturbo мощностью 585 л.с. Разгон до 100 км/ч за 4,5 с, адаптивная подвеска и салон ручной сборки AMG.", count:3, colors:["#0b0b0d","#c7c9cc","#a9252e","#2e65c8"]},
    {title:"Mercedes-AMG SL 63", spec:"4.0 V8 Biturbo · 585 л.с.", price:178000, desc:"Родстер SL нового поколения с мягкой тканевой крышей, полным приводом 4MATIC+ и 4,0-литровым V8 Biturbo мощностью 585 л.с. Разгон до 100 км/ч за 3,6 с.", count:2, colors:["#c7c9cc","#0b0b0d","#a9252e"]},
    {title:"Mercedes-Benz C 63 AMG (W204)", spec:"6.2 V8 · 457 л.с. · 2008", price:64000, desc:"Культовый седан C 63 AMG поколения W204 с атмосферным 6,2-литровым V8 мощностью 457 л.с. и разгоном до 100 км/ч за 4,5 с.", count:1, colors:["#c7c9cc","#0b0b0d","#2e3a4e"]}
  ],
  BMW: [
    {title:"BMW M8 Competition Coupe", spec:"4.4 V8 twin-turbo · 625 л.с.", price:165000, desc:"Флагманское купе M-серии с 4,4-литровым битурбо V8 мощностью 625 л.с., полным приводом M xDrive и разгоном до 100 км/ч за 3,2 с.", count:2, colors:["#0b0b0d","#c7c9cc","#2e5bff"]},
    {title:"BMW M5 (F90)", spec:"4.4 V8 twin-turbo · 600 л.с.", price:112000, desc:"Заряженный представительский седан: 4,4-литровый битурбо V8, полный привод M xDrive и режим заднего привода.", count:3, colors:["#0b0b0d","#2e3a4e","#c7c9cc"]},
    {title:"BMW X6 M Competition", spec:"4.4 V8 twin-turbo · 625 л.с.", price:145000, desc:"Купе-кроссовер с 625 л.с. и спортивным характером.", count:2, colors:["#1c2a45","#0b0b0d","#5b5d5f"]}
  ],
  Porsche: [
    {title:"Porsche 911 Turbo S (992)", spec:"3.7 flat-6 biturbo · 650 л.с.", price:230000, desc:"Современный 911 Turbo S: оппозитная «шестёрка» 3,7 л битурбо мощностью 650 л.с., полный привод и разгон до 100 км/ч за 2,7 с.", count:2, colors:["#c7c9cc","#0b0b0d","#d6b22a","#a9252e"]},
    {title:"Porsche 911 Turbo (930)", spec:"3.0 flat-6 turbo · 260 л.с. · 1975", price:189000, desc:"Легендарный «Турбо» 1975 года: первый серийный 911 с турбонаддувом, оппозитная шестёрка 3,0 л и широкие «плечи» крыльев.", count:1, colors:["#e29928","#c7352e","#0b0b0d","#f4f5f6"]}
  ]
};

const cars=document.getElementById("cars"),brandTitle=document.getElementById("brandTitle"),modelCount=document.getElementById("modelCount"),
  modal=document.getElementById("modal"),angleText=document.getElementById("angleText"),stage=document.getElementById("stage"),glc=document.getElementById("glc");
let currentBrand="BMW",angle=0,cur=0,elev=0,dist=1,dragging=false,lastX=0,lastY=0,auto=false,car=null,running=false;
const BASE=-.55; // ракурс «3/4 спереди»
const money=n=>"$"+n.toLocaleString("en-US");

/* ---------- сцена ---------- */
function envTex(renderer){
  const c=document.createElement("canvas");c.width=1024;c.height=512;const g=c.getContext("2d"),gr=g.createLinearGradient(0,0,0,512);
  gr.addColorStop(0,"#dfe6ff");gr.addColorStop(.45,"#6a6f92");gr.addColorStop(.55,"#2a2a3a");gr.addColorStop(1,"#0c0c14");g.fillStyle=gr;g.fillRect(0,0,1024,512);
  g.fillStyle="#fff";[[60,40,160,70],[400,20,200,60],[720,45,170,70],[900,90,90,50]].forEach(r=>g.fillRect(...r));
  g.fillStyle="rgba(150,110,255,.9)";g.fillRect(250,150,60,160);g.fillRect(820,160,50,140);
  const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;
  const e=new THREE.PMREMGenerator(renderer).fromEquirectangular(t).texture;t.dispose();return e;
}
function makeStage(canvas,opts){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:!!opts.snap});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.1,100);
  scene.environment=envTex(renderer);
  scene.add(new THREE.HemisphereLight(0xffffff,0x221a44,.5));
  const k=new THREE.DirectionalLight(0xffffff,2.2);k.position.set(-4,7,5);scene.add(k);
  const rim=new THREE.DirectionalLight(0x9a7cff,1.6);rim.position.set(5,3,-6);scene.add(rim);
  if(opts.floor){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,.12,80),new THREE.MeshStandardMaterial({color:0x14141d,metalness:.7,roughness:.35}));m.position.y=-.07;scene.add(m);
    [4.4,3.2].forEach((r,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,i?.012:.035,12,120),new THREE.MeshBasicMaterial({color:i?0x5a45c8:0x8f6bff}));t.rotation.x=Math.PI/2;t.position.y=i?-.005:0;scene.add(t)});
  }
  return {renderer,scene,camera};
}
const live=makeStage(glc,{floor:true});
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  live.renderer.setSize(w,h,false);live.camera.aspect=w/h;live.camera.updateProjectionMatrix();
}
function frame(){
  if(!running)return;requestAnimationFrame(frame);
  if(auto)angle+=.9;
  cur+=(angle-cur)*.18;
  if(car)car.rotation.y=BASE+cur*Math.PI/180;
  const d=(11.8/Math.max(.85,Math.min(live.camera.aspect,1.5)))*dist*1.05,e=1.6+elev*2.2;
  live.camera.position.set(0,e*d/9,d);live.camera.lookAt(0,.65,0);
  live.renderer.render(live.scene,live.camera);
}

/* ---------- загрузка реальных GLB (встроены в glb-data.js) ---------- */
const gltf=new THREE.GLTFLoader(),glbCache={};
const b64buf=t=>{const b=atob(t),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
function blobShadow(L,W){const c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d"),gr=g.createRadialGradient(64,64,4,64,64,64);
  gr.addColorStop(0,"rgba(0,0,0,.85)");gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(0,0,128,128);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(L*1.3,W*1.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.y=.01;return m}
function loadGLB(title){
  return glbCache[title]||(glbCache[title]=new Promise((ok,no)=>gltf.parse(b64buf(GLB[title]),"",g=>{
    g.scene.updateMatrixWorld(true);{const bb=new THREE.Box3().setFromObject(g.scene,true),mx=Math.max(...bb.getSize(new THREE.Vector3()).toArray()),dead=[];   // убираем плоские «полы»/подложки из моделей
      g.scene.traverse(o=>{if(o.isMesh){const z=new THREE.Box3().setFromObject(o,true).getSize(new THREE.Vector3());if(Math.min(z.x,z.y,z.z)<mx*.001)dead.push(o)}});dead.forEach(o=>o.parent.remove(o))}
    const [L,W]=SPEC[title],inner=new THREE.Group();inner.add(g.scene);inner.rotation.y=Math.PI/2;   // длина вдоль X, перед в +X
    const car=new THREE.Group();car.add(inner);car.updateMatrixWorld(true);
    let b=new THREE.Box3().setFromObject(car,true),s=b.getSize(new THREE.Vector3());inner.scale.setScalar(L/s.x);car.updateMatrixWorld(true);
    b=new THREE.Box3().setFromObject(car,true);const ct=b.getCenter(new THREE.Vector3());inner.position.set(-ct.x,-b.min.y,-ct.z);
    // кузовная краска: материалы с лаком, занимающие основную площадь
    const area=new Map();
    g.scene.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const z=o.geometry.boundingBox.getSize(new THREE.Vector3());
      const a=(z.x*z.y+z.y*z.z+z.x*z.z)*Math.pow(o.matrixWorld.getMaxScaleOnAxis()||1,2);
      (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if((m.clearcoat>0&&m.transmission!==1)||/paint/i.test(m.name))area.set(m,(area.get(m)||0)+a)})});
    const mx=Math.max(0,...area.values());car.userData.paint=[...area].filter(([m,a])=>a>mx*.4).map(([m])=>m);
    car.userData.base=car.userData.paint.map(m=>m.color.clone());car.userData.glb=true;
    car.add(blobShadow(L,W));ok(car)},no)));
}
/* Цвет кузова: у моделей краска лежит в палитре-текстуре, поэтому цвет не «умножаем», а заменяем
   в шейдере только пиксели кузова (по цвету текселя). Стёкла, пластик, вставки не трогаем. */
const BODY_TEXELS={
  "BMW X6 M Competition":["7a8598"],
  "BMW M8 Competition Coupe":["fffdff"],
  "BMW M5 (F90)":["585858"],
  "Mercedes-AMG G 63":["4d5258"],
  "Porsche 911 Turbo S (992)":["818a87"]
};
function patchBody(car,keys){
  const U={uPaint:{value:new THREE.Color(0x888888)},uOn:{value:0}},kv=keys.map(h=>new THREE.Color("#"+h)),N=kv.length,seen=new Set();
  car.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{
    if(seen.has(m)||!m.map||!m.isMeshStandardMaterial)return;seen.add(m);
    m.onBeforeCompile=sh=>{
      sh.uniforms.uPaint=U.uPaint;sh.uniforms.uOn=U.uOn;sh.uniforms.uKeys={value:kv};
      sh.fragmentShader=sh.fragmentShader
        .replace("#include <common>","#include <common>\nuniform vec3 uPaint;uniform float uOn;uniform vec3 uKeys["+N+"];")
        .replace("#include <map_fragment>","#include <map_fragment>\n#ifdef USE_MAP\nif(uOn>.5){for(int i=0;i<"+N+";i++){if(all(lessThan(abs(diffuseColor.rgb-uKeys[i]),vec3(.02)))){diffuseColor.rgb=uPaint;}}}\n#endif");
    };
    m.customProgramCacheKey=()=>"apexbody"+N+keys.join("");m.needsUpdate=true;
  })});
  car.userData.U=U;car.userData.paint=[];   // старую «тонировку» для этих машин отключаем
}
async function getCar(c){
  if(window.GLB&&GLB[c.title]){const car=await loadGLB(c.title);
    if(BODY_TEXELS[c.title]&&!car.userData.U)patchBody(car,BODY_TEXELS[c.title]);
    setPaint(car,c.colors[0]);return car}
  const car=buildCar(c.title,c.colors[0]);car.userData.paint=[car.userData.paint];return car;
}
function setPaint(car,hex){
  if(car.userData.U){car.userData.U.uPaint.value.set(hex);car.userData.U.uOn.value=1;return}
  car.userData.paint.forEach(m=>m.color.set(hex));
}

/* ---------- миниатюры на карточках (тоже 3D-рендер) ---------- */
let snapS=null,thumbQ=Promise.resolve();const thumbs={};
function thumb(c){
  if(thumbs[c.title])return Promise.resolve(thumbs[c.title]);
  return thumbQ=thumbQ.then(async()=>{
    if(thumbs[c.title])return thumbs[c.title];
    if(!snapS){const cv=document.createElement("canvas");cv.width=560;cv.height=384;snapS=makeStage(cv,{snap:true});snapS.renderer.setPixelRatio(1);snapS.renderer.setSize(560,384,false);snapS.camera.aspect=560/384;snapS.camera.updateProjectionMatrix()}
    const m=await getCar(c);m.rotation.y=BASE;snapS.scene.add(m);
    snapS.camera.position.set(0,2.1,9.4);snapS.camera.lookAt(0,.7,0);snapS.renderer.render(snapS.scene,snapS.camera);
    const url=snapS.renderer.domElement.toDataURL("image/png");snapS.scene.remove(m);
    if(!m.userData.glb)m.traverse(o=>{if(o.geometry)o.geometry.dispose()});return thumbs[c.title]=url;
  });
}

/* ---------- интерфейс ---------- */
function render(){
  const list=data[currentBrand];
  brandTitle.textContent=currentBrand;
  modelCount.textContent=`${list.length} ${list.length===1?"модель":list.length<5?"модели":"моделей"} в салоне`;
  cars.innerHTML=list.map((c,i)=>`
    <article class="card ">
      <div class="car-image"><img alt="${c.title}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-t="${i}">${c.count<=1?'<span class="stock-badge">● Остался 1</span>':""}${c.simple?'<span class="simple-badge">упрощённая 3D-модель</span>':""}</div>
      <h3>${c.title}</h3>
      <p class="spec">${c.spec}</p>
      <div class="bottom"><div class="price">${money(c.price)}</div><button class="small-btn" data-index="${i}">Заказать</button></div>
    </article>`).join("");
  list.forEach((c,i)=>thumb(c).then(u=>{const im=cars.querySelector(`img[data-t="${i}"]`);if(im&&currentBrand&&im.alt===c.title)im.src=u}));
  cars.querySelectorAll(".small-btn").forEach(b=>b.addEventListener("click",()=>openModal(list[+b.dataset.index])));
}
function colorName(hex){
  const {h,s,l}=new THREE.Color(hex).getHSL({});
  if(l<.1)return "Чёрный";if(s<.18)return l>.88?"Белый":l>.6?"Серебристый":"Графит";
  const H=h*360,dk=l<.3?"Тёмно-":"";
  return dk+(H<20||H>340?"красный":H<50?"оранжевый":H<75?"жёлтый":H<170?"зелёный":H<200?"бирюзовый":H<255?"синий":"фиолетовый");
}
let openTok=0;
async function openModal(c){const tok=++openTok;
  document.getElementById("modalTitle").textContent=c.title;
  document.getElementById("modalPrice").textContent=money(c.price);
  document.getElementById("modalDescription").textContent=c.desc;
  document.getElementById("modalStock").textContent=`В наличии: ${c.count} шт.`;
  document.getElementById("modalBrand").textContent=`${currentBrand.toUpperCase()} · 2026`;
  if(car){live.scene.remove(car);if(!car.userData.glb)car.traverse(o=>{if(o.geometry)o.geometry.dispose()});car=null}
  angle=cur=0;elev=0;dist=1;auto=false;document.getElementById("autoRotate").textContent="Авто 360°";
  modal.classList.remove("hidden");resize();if(!running){running=true;frame()}
  const nc=await getCar(c);if(tok!==openTok)return;car=nc;live.scene.add(car);
  const nm=document.getElementById("colorName"),sw=document.getElementById("swatches");nm.textContent=colorName(c.colors[0]);
  const canPaint=!!car.userData.U||car.userData.paint.length>0;
  if(!canPaint)nm.textContent="Заводской цвет";
  sw.innerHTML=canPaint?c.colors.map((x,i)=>`<button class="swatch ${i===0?"active":""}" style="background:${x}" title="${colorName(x)}"></button>`).join(""):"";
  sw.querySelectorAll(".swatch").forEach((b,i)=>b.onclick=()=>{
    sw.querySelectorAll(".swatch").forEach(x=>x.classList.remove("active"));b.classList.add("active");
    setPaint(car,c.colors[i]);nm.textContent=colorName(c.colors[i]);
  });
}
function close(){openTok++;modal.classList.add("hidden");running=false;auto=false}
const norm=a=>Math.round(((a%360)+360)%360);
setInterval(()=>{angleText.textContent=norm(angle)+"°"},60);
document.getElementById("rotateLeft").onclick=()=>{auto=false;angle-=15};
document.getElementById("rotateRight").onclick=()=>{auto=false;angle+=15};
document.getElementById("autoRotate").onclick=e=>{auto=!auto;e.target.textContent=auto?"Остановить":"Авто 360°"};
document.getElementById("closeModal").onclick=close;
document.getElementById("closeBackdrop").onclick=close;
document.getElementById("orderBtn").onclick=()=>{const t=document.getElementById("toast");t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)};
document.querySelectorAll(".brand-tab").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".brand-tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");currentBrand=btn.dataset.brand;render();
});
stage.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;stage.setPointerCapture(e.pointerId);auto=false;document.getElementById("autoRotate").textContent="Авто 360°"});
stage.addEventListener("pointermove",e=>{if(!dragging)return;angle+=(e.clientX-lastX)*.55;elev=Math.max(-.4,Math.min(1.6,elev+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY});
stage.addEventListener("pointerup",()=>dragging=false);stage.addEventListener("pointercancel",()=>dragging=false);
stage.addEventListener("wheel",e=>{e.preventDefault();dist=Math.max(.6,Math.min(1.4,dist+e.deltaY*.001))},{passive:false});
addEventListener("resize",resize);
addEventListener("keydown",e=>{if(e.key==="Escape")close();if(e.key==="ArrowLeft")angle-=10;if(e.key==="ArrowRight")angle+=10});
render();
