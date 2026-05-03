/* ═══════════════════════════════════════════════════════
   SAHARLA FOUNDATION  —  app.js  v3  (Ultra Animated)
   Events load from events.json (Hostinger-compatible)
═══════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════════
   PRELOADER
══════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pl = document.getElementById('preloader');
    if (pl) { pl.classList.add('done'); }
  }, 1800);
});

/* ══════════════════════════════════════════════════════
   HERO CANVAS — Connected Particle Network
══════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - .5) * .55;
      this.vy = -(Math.random() * .6 + .2);
      this.r  = Math.random() * 2 + .6;
      this.a  = Math.random() * .5 + .1;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.life++;
      // Repel from mouse
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        this.vx += (dx / dist) * .08;
        this.vy += (dy / dist) * .08;
      }
      this.vx *= .99; this.vy *= .99;
      if (this.life > this.maxLife || this.y < -20) this.reset();
    }
    draw() {
      const fade = this.life < 40 ? this.life/40 : this.life > this.maxLife-40 ? (this.maxLife-this.life)/40 : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,200,130,${this.a * fade})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 110; i++) particles.push(new Particle());

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,200,130,${.12*(1-d/110)})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════════════════════════════
   HERO PARALLAX on mouse move
══════════════════════════════════════════════════════ */
(function initParallax() {
  const hero    = document.querySelector('.hero');
  const content = document.querySelector('.hero-content');
  const orbs    = document.querySelectorAll('.hero-orb');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    if (content) content.style.transform = `translate(${dx*8}px, ${dy*5}px)`;
    orbs.forEach((o, i) => {
      const depth = (i + 1) * 12;
      o.style.transform = `translate(${dx*depth}px, ${dy*depth}px)`;
    });
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    if (content) content.style.transform = '';
    orbs.forEach(o => o.style.transform = '');
  });
})();

/* ══════════════════════════════════════════════════════
   TYPED TEXT EFFECT in hero tagline
══════════════════════════════════════════════════════ */
(function initTyped() {
  const el = document.getElementById('typedText');
  if (!el) return;
  const phrases = [
    'Helping Hands, Changing Lives',
    'Empowering Women & Girls',
    'Building Resilient Communities',
    'Advancing Education & Health',
    'Creating Sustainable Change',
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(type, 2200); return; }
      setTimeout(type, 60);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
      setTimeout(type, 30);
    }
  }
  setTimeout(type, 2200);
})();

/* ══════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const btt       = document.getElementById('btt');

  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    // Hide navbar on scroll down, show on scroll up
    if (y > lastY && y > 200) navbar.classList.add('nav-hidden');
    else navbar.classList.remove('nav-hidden');
    lastY = y;
    if (btt) btt.classList.toggle('show', y > 500);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );

  // Highlight active section
  const sections = document.querySelectorAll('section[id]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: .38 });
  sections.forEach(s => io.observe(s));
})();

/* ══════════════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════════════ */
const btt = document.getElementById('btt');
if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════════════════════
   SMOOTH SCROLL
══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) {
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════════════
   FOOTER YEAR
══════════════════════════════════════════════════════ */
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL — AOS-style with stagger
══════════════════════════════════════════════════════ */
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const d  = parseInt(el.dataset.aosDelay || 0);
        setTimeout(() => el.classList.add('aos-animate'), d);
        io.unobserve(el);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ══════════════════════════════════════════════════════
   COUNTER ANIMATION — eased counting
══════════════════════════════════════════════════════ */
(function initCounters() {
  let fired = false;
  const nums = document.querySelectorAll('.hstat-num[data-target]');
  if (!nums.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function run() {
    if (fired) return; fired = true;
    nums.forEach(el => {
      const target   = parseInt(el.dataset.target);
      const duration = 2000;
      const start    = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(easeOut(t) * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }
  const el = document.querySelector('.hero-stats');
  if (el) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: .4 });
    io.observe(el);
  }
})();

/* ══════════════════════════════════════════════════════
   TILT EFFECT — cards follow mouse
══════════════════════════════════════════════════════ */
(function initTilt() {
  const cards = document.querySelectorAll('.board-card, .val-card, .impact-card, .partner-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) / (r.width  / 2);
      const dy  = (e.clientY - cy) / (r.height / 2);
      card.style.transform = `perspective(700px) rotateY(${dx*8}deg) rotateX(${-dy*8}deg) translateY(-6px) scale(1.02)`;
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
})();

/* ══════════════════════════════════════════════════════
   RIPPLE EFFECT on buttons
══════════════════════════════════════════════════════ */
(function initRipple() {
  document.querySelectorAll('.btn, .abtn, .efbtn, .tnav').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r    = this.getBoundingClientRect();
      const x    = e.clientX - r.left;
      const y    = e.clientY - r.top;
      const rpl  = document.createElement('span');
      rpl.className = 'ripple';
      rpl.style.cssText = `left:${x}px;top:${y}px`;
      this.appendChild(rpl);
      setTimeout(() => rpl.remove(), 700);
    });
  });
})();

/* ══════════════════════════════════════════════════════
   CURSOR GLOW
══════════════════════════════════════════════════════ */
(function initCursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  function animate() {
    cx += (mx - cx) * .12;
    cy += (my - cy) * .12;
    glow.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(animate);
  }
  animate();
  // Expand on hoverable elements
  document.querySelectorAll('a,button,.board-card,.val-card,.team-card').forEach(el => {
    el.addEventListener('mouseenter', () => glow.classList.add('glow-expand'));
    el.addEventListener('mouseleave', () => glow.classList.remove('glow-expand'));
  });
})();

/* ══════════════════════════════════════════════════════
   PROGRAM TABS with animated indicator
══════════════════════════════════════════════════════ */
(function initTabs() {
  const btns   = document.querySelectorAll('.tnav');
  const panels = document.querySelectorAll('.tpanel');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const p = document.getElementById('tp-' + btn.dataset.tab);
      if (p) p.classList.add('active');
    });
  });
})();

/* ══════════════════════════════════════════════════════
   SECTION PROGRESS BAR
══════════════════════════════════════════════════════ */
(function initProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════
   EVENTS — load from events.json
══════════════════════════════════════════════════════ */
async function loadEvents() {
  try {
    const res = await fetch('events.json?v=' + Date.now());
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return FALLBACK_EVENTS;
  }
}

const FALLBACK_EVENTS = [
  { id:1, title:"GBV Awareness Training Workshop", description:"A 20-day workshop providing GBV awareness training to community leaders and health workers across Sool region.", date:"2024-03-15", location:"Lasanod, Sool", type:"event", category:"Women Empowerment" },
  { id:2, title:"Teacher Training Program – Sanaag Schools", description:"Targeted training for teachers in conflict-affected schools to enhance instruction quality and support displaced students.", date:"2024-04-08", location:"Erigavo, Sanaag", type:"program", category:"Education" },
  { id:3, title:"GBV Research Publication Released", description:"Saharla Foundation releases findings from its comprehensive GBV Prevalence, Vulnerability, and Psychological Trauma Assessment.", date:"2024-04-20", location:"Mogadishu, Somalia", type:"news", category:"Research" },
  { id:4, title:"Youth Vocational Training Graduation", description:"Graduation ceremony for 60 youth participants who completed vocational training in carpentry, tailoring, and mobile phone repair.", date:"2024-05-12", location:"Cayn Region", type:"event", category:"Youth Development" },
  { id:5, title:"Community Tree-Planting Drive", description:"Community-wide reforestation initiative with over 500 trees planted by youth volunteers and school children.", date:"2024-06-03", location:"Sool & Sanaag", type:"program", category:"Climate Resilience" },
  { id:6, title:"Women Empowerment Research Phase 2", description:"Saharla Foundation launches Phase 2 study: Empowering Women and Girls in Conflict-Affected Areas across SSC regions.", date:"2024-06-22", location:"SSC Regions", type:"news", category:"Research" }
];

function fmtDate(str) {
  const d = new Date(str + 'T00:00:00');
  return { day: d.getDate(), mo: d.toLocaleString('default',{month:'short'}).toUpperCase() };
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

let allEvents = [];

function renderEvents(filter = 'all') {
  const grid  = document.getElementById('eventsGrid');
  const empty = document.getElementById('eventsEmpty');
  if (!grid) return;
  const list   = filter === 'all' ? allEvents : allEvents.filter(e => e.type === filter);
  const sorted = [...list].sort((a,b) => new Date(b.date) - new Date(a.date));
  grid.innerHTML = '';
  if (!sorted.length) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  sorted.forEach((ev, i) => {
    const d    = fmtDate(ev.date);
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="ec-head">
        <div class="ec-date"><span class="date-day">${d.day}</span><span class="date-mo">${d.mo}</span></div>
        <span class="ec-badge">${esc(cap(ev.type))}</span>
      </div>
      <div class="ec-body">
        <h4>${esc(ev.title)}</h4>
        <p>${esc(ev.description)}</p>
        <div class="ec-meta">
          <span><i class="fas fa-map-marker-alt"></i>${esc(ev.location||'')}</span>
          <span><i class="fas fa-tag"></i>${esc(ev.category||'')}</span>
        </div>
      </div>`;
    card.style.cssText = 'opacity:0;transform:translateY(28px);transition:opacity .5s ease,transform .5s ease';
    grid.appendChild(card);
    setTimeout(() => { card.style.opacity='1'; card.style.transform='none'; }, 80 + i*80);
    // Tilt on event cards too
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  / (r.width/2);
      const dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
      card.style.transform = `perspective(600px) rotateY(${dx*6}deg) rotateX(${-dy*6}deg) translateY(-6px) scale(1.02)`;
    }, { passive:true });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

(function initEvents() {
  loadEvents().then(data => { allEvents = data; renderEvents('all'); });
  document.querySelectorAll('.efbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.efbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEvents(btn.dataset.filter);
    });
  });
})();

/* ══════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════ */
(function initContact() {
  const form = document.getElementById('contactForm');
  const ok   = document.getElementById('formOk');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      if (ok) { ok.style.display = 'flex'; setTimeout(() => ok.style.display = 'none', 5000); }
    }, 1400);
  });
})();

/* ══════════════════════════════════════════════════════
   FLOATING SECTION NUMBERS (decorative)
══════════════════════════════════════════════════════ */
(function initSectionNumbers() {
  document.querySelectorAll('.section').forEach((sec, i) => {
    const num = document.createElement('div');
    num.className = 'sec-number';
    num.textContent = String(i + 1).padStart(2, '0');
    sec.appendChild(num);
  });
})();
