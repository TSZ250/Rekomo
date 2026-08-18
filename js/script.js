// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Reveal-on-scroll animations (single elements + grouped/staggered lists)
const revealEls = document.querySelectorAll('.reveal, .reveal-group');

if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// Header shadow-on-scroll (rAF-throttled)
const header = document.querySelector('.site-header');
let scrollTicking = false;

function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', scrollTop > 8);
    scrollTicking = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Active nav link tracks the section currently in view
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const trackedSections = document.querySelectorAll('main section[id]');

if ('IntersectionObserver' in window && navLinks.length && trackedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));

  // While still up in the hero (before the first tracked section), no nav link is "current"
  const firstSectionTop = trackedSections[0].offsetTop;
  window.addEventListener(
    'scroll',
    () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop < firstSectionTop - window.innerHeight * 0.45) {
        navLinks.forEach((link) => link.classList.remove('active'));
      }
    },
    { passive: true }
  );
}

// Subtle magnetic pull on buttons + interactive tilt on product photos
// (desktop/mouse only, respects reduced-motion)
//
// mousemove can fire 60-120+ times/second. Writing a new transform straight
// into a CSS-transitioned property on every single event constantly
// interrupts/restarts that transition, which reads as jittery/shaky rather
// than smooth. Instead we only record a *target* on mousemove, and a single
// requestAnimationFrame loop lerps every tracked element's current value
// toward its target each frame — this decouples input frequency from
// render frequency and gives naturally damped, jitter-free motion.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

const LERP = 0.15;
const magneticStates = [];
const tiltStates = [];

function setupMagnetic(el) {
  const state = { el, tx: 0, ty: 0, cx: 0, cy: 0 };
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    state.tx = (e.clientX - rect.left - rect.width / 2) * 0.25;
    state.ty = (e.clientY - rect.top - rect.height / 2) * 0.35;
  });
  el.addEventListener('mouseleave', () => {
    state.tx = 0;
    state.ty = 0;
  });
  magneticStates.push(state);
}

function setupTilt(el, maxDeg) {
  const state = { el, trx: 0, trry: 0, crx: 0, cry: 0 };
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    state.trx = (0.5 - py) * maxDeg * 2;
    state.trry = (px - 0.5) * maxDeg * 2;
  });
  el.addEventListener('mouseleave', () => {
    state.trx = 0;
    state.trry = 0;
  });
  tiltStates.push(state);
}

function animateInteractions() {
  magneticStates.forEach((s) => {
    s.cx += (s.tx - s.cx) * LERP;
    s.cy += (s.ty - s.cy) * LERP;
    s.el.style.transform = `translate(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px)`;
  });
  tiltStates.forEach((s) => {
    s.crx += (s.trx - s.crx) * LERP;
    s.cry += (s.trry - s.cry) * LERP;
    s.el.style.transform = `perspective(900px) rotateX(${s.crx.toFixed(2)}deg) rotateY(${s.cry.toFixed(2)}deg)`;
  });
  requestAnimationFrame(animateInteractions);
}

if (hasFinePointer && !prefersReducedMotion) {
  document.documentElement.classList.add('fine-pointer');

  document.querySelectorAll('.btn').forEach(setupMagnetic);
  document.querySelectorAll('.device-frame').forEach((el) => setupTilt(el, 6));
  document.querySelectorAll('.card-stack').forEach((el) => setupTilt(el, 6));
  document.querySelectorAll('.usage-photo').forEach((el) => setupTilt(el, 4));

  requestAnimationFrame(animateInteractions);
}
