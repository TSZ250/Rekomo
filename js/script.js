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

// Hero card flip (tap/click to see the back)
const heroCardFlip = document.getElementById('heroCardFlip');
if (heroCardFlip) {
  heroCardFlip.addEventListener('click', () => {
    const flipped = heroCardFlip.classList.toggle('flipped');
    heroCardFlip.setAttribute('aria-pressed', String(flipped));
    heroCardFlip.setAttribute(
      'aria-label',
      flipped ? 'Vänd tillbaka till framsidan' : 'Vänd på kortet och se baksidan'
    );
  });
}

// Product colour swatches bring the chosen card to the front of the stack
const cardStack = document.getElementById('cardStack');
const swatches = document.querySelectorAll('.swatch');

if (cardStack && swatches.length) {
  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      cardStack.dataset.active = swatch.dataset.color;
      swatches.forEach((other) => {
        const isActive = other === swatch;
        other.classList.toggle('is-active', isActive);
        other.setAttribute('aria-pressed', String(isActive));
      });
    });
  });
}

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

// The loop only runs while something is actually in motion. It used to call
// itself unconditionally, so every page had a JS callback plus a style write
// per element on every frame forever — burning frame budget even when the
// mouse had not moved in minutes. Now each interaction wakes it and it puts
// itself back to sleep once everything has settled.
const SETTLED = 0.01;
let loopAwake = false;

function wakeLoop() {
  if (loopAwake) return;
  loopAwake = true;
  requestAnimationFrame(animateInteractions);
}

function setupMagnetic(el) {
  const state = { el, tx: 0, ty: 0, cx: 0, cy: 0 };
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    state.tx = (e.clientX - rect.left - rect.width / 2) * 0.25;
    state.ty = (e.clientY - rect.top - rect.height / 2) * 0.35;
    wakeLoop();
  });
  el.addEventListener('mouseleave', () => {
    state.tx = 0;
    state.ty = 0;
    wakeLoop();
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
    wakeLoop();
  });
  el.addEventListener('mouseleave', () => {
    state.trx = 0;
    state.trry = 0;
    wakeLoop();
  });
  tiltStates.push(state);
}

function animateInteractions() {
  let moving = false;

  magneticStates.forEach((s) => {
    if (Math.abs(s.tx - s.cx) < SETTLED && Math.abs(s.ty - s.cy) < SETTLED) {
      if (s.cx === s.tx && s.cy === s.ty) return;
      s.cx = s.tx;
      s.cy = s.ty;
    } else {
      s.cx += (s.tx - s.cx) * LERP;
      s.cy += (s.ty - s.cy) * LERP;
      moving = true;
    }
    s.el.style.transform = `translate(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px)`;
  });

  tiltStates.forEach((s) => {
    if (Math.abs(s.trx - s.crx) < SETTLED && Math.abs(s.trry - s.cry) < SETTLED) {
      if (s.crx === s.trx && s.cry === s.trry) return;
      s.crx = s.trx;
      s.cry = s.trry;
    } else {
      s.crx += (s.trx - s.crx) * LERP;
      s.cry += (s.trry - s.cry) * LERP;
      moving = true;
    }
    s.el.style.transform = `perspective(900px) rotateX(${s.crx.toFixed(2)}deg) rotateY(${s.cry.toFixed(2)}deg)`;
  });

  if (moving) requestAnimationFrame(animateInteractions);
  else loopAwake = false;
}

if (hasFinePointer && !prefersReducedMotion) {
  document.documentElement.classList.add('fine-pointer');

  document.querySelectorAll('.btn').forEach(setupMagnetic);
  document.querySelectorAll('.device-frame').forEach((el) => setupTilt(el, 6));
  document.querySelectorAll('.card-stack').forEach((el) => setupTilt(el, 6));
  // No kick-off frame: everything rests at zero, so the first mouse move
  // starts the loop and it sleeps again as soon as things settle.
}
