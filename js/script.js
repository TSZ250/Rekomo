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

// Scroll progress bar + header shadow-on-scroll (rAF-throttled)
const progressBar = document.getElementById('scrollProgress');
const header = document.querySelector('.site-header');
let scrollTicking = false;

function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
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
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

function initTilt(selector, maxDeg) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * maxDeg * 2;
      const ry = (px - 0.5) * maxDeg * 2;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

if (hasFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  initTilt('.device-frame', 7);
  initTilt('.card-stack', 7);
  initTilt('.usage-photo', 5);
}
