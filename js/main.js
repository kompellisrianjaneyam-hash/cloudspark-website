// Footer year
document.getElementById('year')?.appendChild(document.createTextNode(new Date().getFullYear().toString()));

// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
toggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Tilt cards
document.querySelectorAll('.tilt').forEach((card) => {
  let rAF;
  const onMove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (y - 0.5) * -10;
    const ry = (x - 0.5) * 12;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
  };
  const reset = () => { card.style.transform = ''; };
  card.addEventListener('mousemove', (e) => { cancelAnimationFrame(rAF); rAF = requestAnimationFrame(() => onMove(e)); });
  card.addEventListener('mouseleave', reset);
});

// Contact mailto helper (kept from earlier)
window.openMail = function(form){
  const name = encodeURIComponent(form.name?.value.trim() || "");
  const email = encodeURIComponent(form.email?.value.trim() || "");
  const msg = encodeURIComponent(form.message?.value.trim() || "");
  const subject = `CloudSpark inquiry from ${name}`;
  const body = `From: ${name} (${email})%0A%0A${msg}`;
  window.location.href = `mailto:kompellisrianjaneyam@gmail.com?subject=${subject}&body=${body}`;
  return false;
};

// ======== HIGHER 3D: Morphing orb + aurora shader + particle field ========
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
(function initThree(){
  const canvas = document.getElementById('bg3d');
  if (!canvas || reduced || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 34);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Lights
  scene.add(new THREE.AmbientLight(0x99aaff, 0.35));
  const key = new THREE.PointLight(0x69e1ff, 1.0); key.position.set(22, 16, 18); scene.add(key);
  const rim = new THREE.PointLight(0x8f73ff, 0.8); rim.position.set(-18, -10, -12); scene.add(rim);

  // Particle field
  const COUNT = 1600;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  for (let i=0; i<COUNT*3; i+=3){
    positions[i]   = (Math.random()-0.5) * 160;
    positions[i+1] = (Math.random()-0.5) * 90;
    positions[i+2] = (Math.random()-0.5) * 140;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 0.06, color: 0x9fbaff, transparent:true, opacity: 0.9 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Morphing orb (icosahedron with vertex displacement)
  const orbGeo = new THREE.IcosahedronGeometry(7, 6);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x6fe3ff, metalness: 0.75, roughness: 0.25,
    emissive: 0x0a0f2a, emissiveIntensity: 0.35
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  scene.add(orb);

  // store base positions
  const basePos = orb.geometry.attributes.position.array.slice();
  const pos = orb.geometry.attributes.position;

  // Aurora shader plane (behind orb)
  const auroraGeo = new THREE.PlaneGeometry(120, 80, 1, 1);
  const auroraMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x6fe3ff) },
      uColorB: { value: new THREE.Color(0x9f7bff) },
      uIntensity: { value: 0.45 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uIntensity;

      // simple fbm-ish noise
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(in vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = hash(i), b = hash(i+vec2(1.0,0.0)),
              c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){
        float v = 0.0;
        float a = 0.5;
        for(int i=0;i<5;i++){
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main(){
        vec2 uv = vUv;
        // move and swirl
        float t = uTime * 0.05;
        float n = fbm(uv * 5.0 + vec2(t, t*1.3));
        float m = fbm(uv * 7.0 - vec2(t*1.2, t));
        float band = smoothstep(0.35, 0.9, n + m*0.6);
        vec3 col = mix(uColorA, uColorB, band);
        float alpha = band * uIntensity;
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const aurora = new THREE.Mesh(auroraGeo, auroraMat);
  aurora.position.set(0, 0, -30);
  scene.add(aurora);

  // Animation state
  let t = 0;
  const mouse = { x:0, y:0 };

  function animate(){
    t += 0.016;

    // particles rotation
    points.rotation.y += 0.0008;

    // aurora
    auroraMat.uniforms.uTime.value = t;

    // orb morph
    const arr = pos.array;
    for (let i=0; i<arr.length; i+=3){
      const ox = basePos[i], oy = basePos[i+1], oz = basePos[i+2];
      const r = Math.sqrt(ox*ox + oy*oy + oz*oz);
      const wave = Math.sin(r*0.45 + t*1.3) * 0.35 + Math.sin((ox+oy+oz)*0.08 + t*0.9)*0.22;
      const scale = 1.0 + wave*0.06;
      arr[i]   = ox * scale;
      arr[i+1] = oy * scale;
      arr[i+2] = oz * scale;
    }
    pos.needsUpdate = true;
    orb.rotation.y += 0.004;
    orb.rotation.x = Math.sin(t*0.6)*0.2;

    // parallax camera
    camera.position.x += ((mouse.x*6) - camera.position.x) * 0.03;
    camera.position.y += ((-mouse.y*4) - camera.position.y) * 0.03;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Mouse
  window.addEventListener('mousemove', (e)=>{
    mouse.x = (e.clientX / window.innerWidth) - 0.5;
    mouse.y = (e.clientY / window.innerHeight) - 0.5;
  });
})();

