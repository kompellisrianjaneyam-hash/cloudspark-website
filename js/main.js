// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Page transition
window.addEventListener("load", () => {
  const t = document.getElementById("pageTransition");
  requestAnimationFrame(()=> t.classList.add("page-transition--done"));
});

// Navbar shrink
const header = document.getElementById("header");
function onScroll() {
  if (window.scrollY > 10) header.classList.add("shrink");
  else header.classList.remove("shrink");
}
onScroll();
window.addEventListener("scroll", onScroll, { passive:true });

// ===== THREE.JS BACKGROUND (lightweight, no huge gaps) =====
const canvas = document.getElementById("bg3d");
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0.8, 6);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:"high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Lights
const amb = new THREE.AmbientLight(0xffffff, 0.7);
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(2, 3, 4);
scene.add(amb, dir);

// Wireframe globe
const globe = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.2, 2),
  new THREE.MeshBasicMaterial({ wireframe:true, color:0x8b5cf6, transparent:true, opacity:0.5 })
);
scene.add(globe);

// Particles
const COUNT = 1200;
const pos = new Float32Array(COUNT * 3);
for (let i=0;i<COUNT;i++){
  const r = 7 * Math.cbrt(Math.random());
  const theta = Math.random()*Math.PI*2;
  const phi = Math.acos(2*Math.random()-1);
  pos[i*3+0] = r*Math.sin(phi)*Math.cos(theta);
  pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
  pos[i*3+2] = r*Math.cos(phi);
}
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size:0.02, color:0x6ce1ff, transparent:true, opacity:0.85 }));
scene.add(pts);

// Resize
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Parallax
const mouse = { x:0, y:0 };
window.addEventListener("pointermove", (e)=>{
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Animate
function tick(){
  globe.rotation.y += 0.0025;
  globe.rotation.x += 0.001;
  pts.rotation.y -= 0.0008;

  // gentle parallax
  camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.02;
  camera.position.y += (-mouse.y * 0.4 + 0.8 - camera.position.y) * 0.02;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// ===== Content animations (GSAP-free, light) =====
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("reveal--visible");
      io.unobserve(entry.target);
    }
  });
},{ rootMargin:"0px 0px -10% 0px", threshold:0.1 });
revealInit();
function revealInit(){ reveals.forEach(el=> io.observe(el)); }

