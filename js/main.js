/* ---------- SMOOTH SCROLL ---------- */
const lenis = new Lenis({ smoothWheel:true, lerp:0.12 });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* ---------- PAGE TRANSITIONS ---------- */
const isInternal = (a)=> a.host===location.host && !a.href.includes('#');
const overlay = document.getElementById('transition');
function enterPage(){ gsap.set(overlay,{scaleY:1,transformOrigin:'bottom'}); gsap.to(overlay,{scaleY:0,duration:.6,ease:'power3.out'}); }
function leavePage(href){ gsap.to(overlay,{scaleY:1,transformOrigin:'top',duration:.5,ease:'power3.in',onComplete:()=>{ location.href = href; }}); }
window.addEventListener('DOMContentLoaded', enterPage);
document.querySelectorAll('a[data-link]').forEach(a=>{
  a.addEventListener('click',(e)=>{ if(isInternal(a)){ e.preventDefault(); leavePage(a.href); }});
});

/* ---------- TOP PROGRESS BAR ---------- */
const progress = document.getElementById('progress');
document.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const p = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  progress.style.width = (p*100) + '%';
});

/* ---------- NAV UNDERLINE FOLLOW ---------- */
function navUnderline(){
  const nav = document.querySelector('.underline-nav');
  if(!nav) return;
  const bar = nav.querySelector('.u-bar');
  function move(el){
    const r = el.getBoundingClientRect();
    bar.style.width = r.width+'px';
    bar.style.transform = `translateX(${el.offsetLeft}px)`;
  }
  const active = nav.querySelector('.active') || nav.querySelector('a');
  if(active) move(active);
  nav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('mouseenter',()=>move(a));
    a.addEventListener('mouseleave',()=>move(active));
  });
}
navUnderline();

/* ---------- TYPED TEXT ---------- */
if(window.Typed){
  new Typed('.typed', {
    strings: ['AI agents','cloud dashboards','mobile apps','automation'],
    typeSpeed: 60, backSpeed: 36, backDelay: 1600, loop: true
  });
}

/* ---------- GSAP BASIC ---------- */
gsap.registerPlugin(ScrollTrigger);

// header reveal
gsap.from('.site-header',{y:-40,opacity:0,duration:.6,ease:'power2.out'});

// reveal on scroll
document.querySelectorAll('[data-reveal]').forEach((el)=>{
  const d = parseFloat(el.getAttribute('data-delay')||0);
  gsap.to(el,{
    opacity:1, y:0, duration:.6, delay:d,
    scrollTrigger:{ trigger:el, start:'top 85%', toggleActions:'play none none none' }
  });
});

// clip reveal for cases
gsap.utils.toArray('.reveal-clip').forEach((el,i)=>{
  ScrollTrigger.create({
    trigger: el, start:'top 85%', once:true,
    onEnter: ()=> el.classList.add('revealed')
  });
});

// cards lift on scroll
gsap.utils.toArray('.card.lift').forEach((el,i)=>{
  gsap.fromTo(el,{y:24,opacity:0},{y:0,opacity:1,duration:.6,delay:i*0.06,
    scrollTrigger:{trigger:el,start:'top 88%'}});
});

// timeline stagger
gsap.utils.toArray('.t-item').forEach((el,i)=>{
  gsap.fromTo(el,{y:18,opacity:0},{y:0,opacity:1,duration:.5,delay:i*0.05,
    scrollTrigger:{trigger:el,start:'top 90%'}});
});

// number counters
function animateCount(el){
  const end = parseFloat(el.dataset.count||'0'); const obj={v:0};
  gsap.to(obj,{v:end,duration:1.2,ease:'power2.out',onUpdate:()=>{ el.textContent = Math.floor(obj.v); }});
}
document.querySelectorAll('.count').forEach((el)=>{
  ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>animateCount(el)});
});

/* ---------- PARALLAX (mouse) ---------- */
const parallaxEls = document.querySelectorAll('.parallax');
let mx=0,my=0; window.addEventListener('mousemove',(e)=>{ mx=e.clientX; my=e.clientY; });
function parallaxTick(){
  parallaxEls.forEach(el=>{
    const s = parseFloat(el.dataset.parallax||3);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const dx = (mx - cx)/window.innerWidth, dy = (my - cy)/window.innerHeight;
    el.style.transform = `translate3d(${dx*s*10}px, ${dy*s*10}px, 0)`;
  });
  requestAnimationFrame(parallaxTick);
}
requestAnimationFrame(parallaxTick);

/* ---------- MAGNETIC BUTTONS ---------- */
document.querySelectorAll('.magnetic').forEach(btn=>{
  btn.addEventListener('mousemove',(e)=>{
    const r = btn.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);
    btn.style.transform = `translate(${x*0.08}px, ${y*0.08}px)`;
  });
  btn.addEventListener('mouseleave',()=>{ btn.style.transform = 'translate(0,0)'; });
});

/* ---------- TILT EFFECT ---------- */
function tilt(el){
  el.addEventListener('mousemove',(e)=>{
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left)/r.width - 0.5;
    const py = (e.clientY - r.top)/r.height - 0.5;
    el.style.transform = `rotateX(${(-py*6)}deg) rotateY(${(px*6)}deg) translateZ(0)`;
  });
  el.addEventListener('mouseleave',()=>{ el.style.transform = 'rotateX(0) rotateY(0)';});
}
document.querySelectorAll('.tilt').forEach(tilt);

/* ---------- PARTICLES (tiny) ---------- */
const canvas = document.getElementById('particles');
if(canvas){
  const ctx = canvas.getContext('2d'); let w,h; let parts=[];
  function resize(){ w=canvas.width=canvas.offsetWidth; h=canvas.height=canvas.offsetHeight; }
  window.addEventListener('resize',resize); resize();
  for(let i=0;i<60;i++){ parts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:Math.random()*2+0.5}); }
  function step(){
    ctx.clearRect(0,0,w,h);
    for(const p of parts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(173,199,255,.35)'; ctx.fill();
    }
    requestAnimationFrame(step);
  }
  step();
}

/* ---------- MOBILE NAV ---------- */
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('mainNav');
if(toggle){
  toggle.addEventListener('click', () => {
    const open = getComputedStyle(nav).display !== 'none';
    nav.style.display = open ? 'none' : 'flex';
    if(!open){ nav.style.flexDirection='column'; nav.style.gap='8px'; }
  });
}

