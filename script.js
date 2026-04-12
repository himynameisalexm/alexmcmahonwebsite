/* ============================================================
   ALEX MCMAHON — AI Design Leader
   Interactive Layer
   ============================================================ */

'use strict';


// ============================================================
// HERO TITLE — character-by-character split with spring entrance
// + per-letter bounce on hover
// ============================================================

(function splitHeroTitle() {
  const lines = document.querySelectorAll('.title-line[data-word]');
  if (!lines.length) return;

  let globalIndex = 0;

  lines.forEach((line) => {
    const word = line.dataset.word;
    line.textContent = '';

    word.split('').forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.setProperty('--i', globalIndex);
      globalIndex++;

      // Per-letter hover bounce
      span.addEventListener('mouseenter', () => {
        if (span.classList.contains('bouncing')) return;
        span.classList.add('bouncing');
        span.addEventListener('animationend', () => {
          span.classList.remove('bouncing');
        }, { once: true });
      });

      line.appendChild(span);
    });
  });
})();

// ============================================================
// NEURAL NETWORK PARTICLE CANVAS
// Floating nodes connected by weighted edges — AI brain visual
// ============================================================

(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Aurora colour set — matches CSS tokens
  const AURORA = ['#4d79ff', '#a855f7', '#f43f8e', '#2dd4bf'];

  let W, H, particles;
  const COUNT = 80;
  const MAX_DIST = 140;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    return Array.from({ length: COUNT }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H,
      vx:   (Math.random() - 0.5) * 0.35,
      vy:   (Math.random() - 0.5) * 0.35,
      r:    Math.random() * 1.5 + 0.5,
      col:  AURORA[Math.floor(Math.random() * AURORA.length)],
      opacity: Math.random() * 0.4 + 0.15,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update & wrap particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Draw edges
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(77, 121, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      // Parse hex to rgba for opacity control
      ctx.fillStyle = p.col;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  }

  resize();
  particles = createParticles();
  draw();

  // Repaint on resize
  window.addEventListener('resize', () => {
    resize();
    particles = createParticles();
  }, { passive: true });

  // Mouse proximity: nearby particles accelerate toward cursor
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      particles.forEach(p => {
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180 * 0.015;
          p.vx += dx * force;
          p.vy += dy * force;
          // Dampen to prevent runaway speed
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1.8) { p.vx *= 0.7; p.vy *= 0.7; }
        }
      });
    }, { passive: true });
  }
})();


// ============================================================
// CUSTOM CURSOR — dot snaps, ring lerps
// ============================================================

const cursor   = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

let mX = 0, mY = 0, fX = 0, fY = 0;

document.addEventListener('mousemove', (e) => {
  mX = e.clientX; mY = e.clientY;
  cursor.style.transform = `translate(${mX - 5}px, ${mY - 5}px)`;
});

(function lerpFollower() {
  fX += (mX - fX) * 0.11;
  fY += (mY - fY) * 0.11;
  follower.style.transform = `translate(${fX - 17}px, ${fY - 17}px)`;
  requestAnimationFrame(lerpFollower);
})();

// Expand on links/buttons
document.querySelectorAll('a, button, .tool-chip').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
    follower.classList.add('hovered');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
    follower.classList.remove('hovered');
  });
});

document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0'; follower.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1'; follower.style.opacity = '1';
});


// ============================================================
// STREAMING TEXT EFFECT
// Like an LLM generating its response — the defining AI UX signature
// ============================================================

function streamText(el, text, speed = 32, startDelay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      el.textContent = '';
      const cursorEl = document.createElement('span');
      cursorEl.className = 'stream-cursor';
      el.appendChild(cursorEl);

      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          el.insertBefore(document.createTextNode(text[i]), cursorEl);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            cursorEl.remove();
            resolve();
          }, 1800);
        }
      }, speed);
    }, startDelay);
  });
}

// Trigger streaming when hero is first seen
const streamTarget1 = document.querySelector('.stream-target');
const streamTarget2 = document.querySelector('.stream-target-2');

let streamed = false;

const streamObserver = new IntersectionObserver((entries) => {
  entries.forEach(async entry => {
    if (entry.isIntersecting && !streamed) {
      streamed = true;
      streamObserver.disconnect();
      // Wait for the reveal animation to settle
      await new Promise(r => setTimeout(r, 1400));
      await streamText(streamTarget1, streamTarget1.dataset.text, 36);
      await streamText(streamTarget2, streamTarget2.dataset.text, 38, 100);
    }
  });
}, { threshold: 0.3 });

if (streamTarget1) streamObserver.observe(streamTarget1);


// ============================================================
// SCROLL REVEAL — IntersectionObserver
// ============================================================

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('revealed');
  }),
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));


// ============================================================
// NAVIGATION — hide on scroll down, show on scroll up
// ============================================================

const nav = document.querySelector('.nav');
let lastY = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('hidden', y > lastY && y > 100);
  nav.classList.toggle('visible', y <= lastY);
  lastY = y;
}, { passive: true });


// ============================================================
// PROJECT CARD 3D TILT
// ============================================================

document.querySelectorAll('.project-card').forEach(card => {
  let raf;
  card.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r   = card.getBoundingClientRect();
      const x   = ((e.clientX - r.left) / r.width  - 0.5) * 12;
      const y   = ((e.clientY - r.top)  / r.height - 0.5) * 12;
      card.classList.add('tilt-active');
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-10px) scale(1.01)`;
    });
  });

  card.addEventListener('mouseleave', () => {
    if (raf) cancelAnimationFrame(raf);
    card.classList.remove('tilt-active');
    card.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    card.style.transform = '';
    setTimeout(() => { card.style.transition = ''; }, 800);
  });
});


// ============================================================
// AI CARD: staggered border animation offset (visual variety)
// Already handled in CSS via animation-delay, but ensure
// the @property is supported; graceful degrade otherwise
// ============================================================

if (!CSS.supports('(--border-angle: 0turn)')) {
  document.querySelectorAll('.ai-card').forEach(card => {
    card.style.border = '1px solid rgba(77, 121, 255, 0.25)';
  });
}


// ============================================================
// MARQUEE — pause on hover
// ============================================================

const marquee = document.querySelector('.marquee-inner');
if (marquee) {
  marquee.addEventListener('mouseenter', () => { marquee.style.animationPlayState = 'paused'; });
  marquee.addEventListener('mouseleave', () => { marquee.style.animationPlayState = 'running'; });
}


// ============================================================
// AURORA PARALLAX — layers drift at different rates on scroll
// ============================================================

const auroraLayers = [
  { el: document.querySelector('.aurora-1'), rate: 0.08 },
  { el: document.querySelector('.aurora-2'), rate: -0.05 },
  { el: document.querySelector('.aurora-3'), rate: 0.12 },
  { el: document.querySelector('.aurora-4'), rate: -0.07 },
];

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  auroraLayers.forEach(({ el, rate }) => {
    if (el) el.style.transform = `translateY(${y * rate}px)`;
  });
}, { passive: true });


// ============================================================
// TOOL CHIPS — staggered entrance animation
// ============================================================

const toolChips = document.querySelectorAll('.tool-chip');
const toolObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      toolChips.forEach((chip, i) => {
        setTimeout(() => {
          chip.style.opacity = '1';
          chip.style.transform = 'none';
        }, i * 55);
      });
      toolObserver.disconnect();
    }
  });
}, { threshold: 0.2 });

// Set initial hidden state
toolChips.forEach(chip => {
  chip.style.opacity = '0';
  chip.style.transform = 'translateY(12px)';
  chip.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)';
});

const toolsSection = document.querySelector('.tools-section');
if (toolsSection) toolObserver.observe(toolsSection);


// ============================================================
// SMOOTH SCROLL
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});


// ============================================================
// FOOTER — auto year
// ============================================================

const yearEl = document.querySelector('.footer-inner span:first-child');
if (yearEl) yearEl.textContent = `© ${new Date().getFullYear()} Alex McMahon`;


// ============================================================
// NUMBER COUNTER ANIMATION
// Count from 0 to target when visible
// ============================================================

function initNumberCounters() {
  const counters = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';

        const text = entry.target.textContent.trim();
        const match = text.match(/(\d+)/);
        if (!match) return;

        const target = parseInt(match[1], 10);
        const duration = 1000;
        let start = 0;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            entry.target.textContent = text;
            clearInterval(timer);
          } else {
            entry.target.textContent = Math.floor(start) + text.replace(/\d+/g, '');
          }
        }, 16);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
}

initNumberCounters();


// ============================================================
// PROJECT CARD 3D TILT
// ============================================================

document.querySelectorAll('.project-card').forEach(card => {
  let raf;
  card.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r   = card.getBoundingClientRect();
      const x   = ((e.clientX - r.left) / r.width  - 0.5) * 12;
      const y   = ((e.clientY - r.top)  / r.height - 0.5) * 12;
      card.classList.add('tilt-active');
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-10px) scale(1.02)`;
    });
  });

  card.addEventListener('mouseleave', () => {
    if (raf) cancelAnimationFrame(raf);
    card.classList.remove('tilt-active');
    card.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    card.style.transform = '';
    setTimeout(() => { card.style.transition = ''; }, 800);
  });
});


// ============================================================
// STAGGERED PROJECT GRID ANIMATION
// ============================================================

const projectObserver = new IntersectionObserver(
  (entries) => entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.project-card').forEach((card, i) => {
        card.style.animation = `fadeUp 0.8s var(--ease-out) ${i * 0.1}s both`;
      });
      projectObserver.disconnect();
    }
  }),
  { threshold: 0.2 }
);

const projectsGrid = document.querySelector('.projects-grid');
if (projectsGrid) projectObserver.observe(projectsGrid);


// ============================================================
// VISITOR PERSONALISATION — time-based greeting + IP geolocation
// ============================================================

(async function personalizeForVisitor() {
  const greetingEl  = document.getElementById('visitorGreeting');
  const availEl     = document.getElementById('speakAvailability');

  // --- 1. Time-of-day greeting ---
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning'
                     : hour < 17 ? 'Good afternoon'
                     :              'Good evening';

  // Show greeting after hero animations settle (~2.4 s)
  const showGreeting = (text) => {
    if (!greetingEl) return;
    greetingEl.textContent = text;
    setTimeout(() => greetingEl.classList.add('visible'), 2400);
  };

  const showAvail = (text) => {
    if (!availEl) return;
    availEl.textContent = text;
    setTimeout(() => availEl.classList.add('visible'), 2800);
  };

  // --- 2. IP geolocation (ipapi.co — free, no key, CORS-friendly) ---
  try {
    const res  = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('geo failed');
    const geo  = await res.json();

    const city    = geo.city        || '';
    const country = geo.country_name || '';
    const code    = geo.country_code || '';
    const isAU    = code === 'AU';

    // Greeting: "Good afternoon, London"
    showGreeting(city ? `${timeGreeting}, ${city}.` : `${timeGreeting}.`);

    // Availability line in Speaking section
    if (isAU) {
      showAvail('📍 Based in Brisbane, available across Australia and internationally.');
    } else if (country) {
      showAvail(`✈️  Based in Brisbane, available to travel to ${country} and beyond.`);
    }

  } catch (_) {
    // Geolocation failed — fall back to time-only greeting, no availability line
    showGreeting(`${timeGreeting}.`);
  }
})();
