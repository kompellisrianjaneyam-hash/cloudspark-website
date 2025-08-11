document.addEventListener('DOMContentLoaded', function(){
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  if(toggle && nav){
    toggle.addEventListener('click', ()=> {
      const isShown = getComputedStyle(nav).display === 'flex';
      nav.style.display = isShown ? 'none' : 'flex';
      if(!isShown){ nav.style.flexDirection='column'; nav.style.gap='8px'; }
      else { nav.style.flexDirection='row'; }
    });
  }

  // reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); }});
  }, {threshold: 0.12});
  reveals.forEach(r => io.observe(r));

  // rotor text in hero
  const rotor = document.getElementById('rotor');
  const words = ['AI agents','cloud apps','mobile experiences','SaaS prototypes'];
  let i=0;
  if(rotor){
    setInterval(()=>{ i=(i+1)%words.length; rotor.textContent = words[i]; }, 2200);
  }
});

