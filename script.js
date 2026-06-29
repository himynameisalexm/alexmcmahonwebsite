/* ============================================================
   ALEX MCMAHON — Personal Site
   Interactive layer (terminal-flavoured)
   ============================================================ */

'use strict';


// ============================================================
// CUSTOM CURSOR — phosphor caret block
// ============================================================

const cursor = document.querySelector('.cursor');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

if (cursor && !isTouchDevice) {
  let mX = 0, mY = 0;

  document.addEventListener('mousemove', (e) => {
    mX = e.clientX; mY = e.clientY;
    cursor.style.transform = `translate(${mX - 4}px, ${mY - 8}px)`;
  });

  document.querySelectorAll('a, button, .tool-chip, .size-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}


// ============================================================
// STREAMING TEXT — type out shell output like an LLM stream
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
          }, 1500);
        }
      }, speed);
    }, startDelay);
  });
}

const streamTarget1 = document.querySelector('.stream-target');
const streamTarget2 = document.querySelector('.stream-target-2');

let streamed = false;
const streamObserver = new IntersectionObserver((entries) => {
  entries.forEach(async entry => {
    if (entry.isIntersecting && !streamed) {
      streamed = true;
      streamObserver.disconnect();
      // Brief settle before first character
      await new Promise(r => setTimeout(r, 700));
      if (streamTarget1) await streamText(streamTarget1, streamTarget1.dataset.text, 34);
      if (streamTarget2) await streamText(streamTarget2, streamTarget2.dataset.text, 36, 100);
    }
  });
}, { threshold: 0.3 });

if (streamTarget1) streamObserver.observe(streamTarget1);


// ============================================================
// SCROLL REVEAL
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

if (nav) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('hidden', y > lastY && y > 100);
    nav.classList.toggle('visible', y <= lastY);
    lastY = y;
  }, { passive: true });
}


// ============================================================
// PROJECT CARD 3D TILT
// ============================================================

document.querySelectorAll('.project-card').forEach(card => {
  let raf;
  card.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 8;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 8;
      card.classList.add('tilt-active');
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-6px)`;
    });
  });

  card.addEventListener('mouseleave', () => {
    if (raf) cancelAnimationFrame(raf);
    card.classList.remove('tilt-active');
    card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    card.style.transform = '';
    setTimeout(() => { card.style.transition = ''; }, 600);
  });
});


// ============================================================
// MARQUEE — pause on hover
// ============================================================

const marquee = document.querySelector('.marquee-inner');
if (marquee) {
  marquee.addEventListener('mouseenter', () => { marquee.style.animationPlayState = 'paused'; });
  marquee.addEventListener('mouseleave', () => { marquee.style.animationPlayState = 'running'; });
}


// ============================================================
// TOOL CHIPS — staggered entrance
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

toolChips.forEach(chip => {
  chip.style.opacity = '0';
  chip.style.transform = 'translateY(10px)';
  chip.style.transition = 'opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)';
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
if (yearEl) yearEl.textContent = `# ${new Date().getFullYear()} alex mcmahon`;


// ============================================================
// NUMBER COUNTER
// ============================================================

(function initNumberCounters() {
  const counters = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';

        const text = entry.target.textContent.trim();
        const match = text.match(/(\d+)/);
        if (!match) return;

        const target = parseInt(match[1], 10);
        const duration = 900;
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
})();


// ============================================================
// VISITOR PERSONALISATION — time-based greeting + geolocation
// Rendered as shell-style comments
// ============================================================

(async function personalizeForVisitor() {
  const greetingEl = document.getElementById('visitorGreeting');
  const availEl    = document.getElementById('speakAvailability');

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'good morning'
                     : hour < 17 ? 'good afternoon'
                     :              'good evening';

  const showGreeting = (text) => {
    if (!greetingEl) return;
    greetingEl.textContent = text;
    setTimeout(() => greetingEl.classList.add('visible'), 600);
  };

  const showAvail = (text) => {
    if (!availEl) return;
    availEl.textContent = text;
    setTimeout(() => availEl.classList.add('visible'), 800);
  };

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('geo failed');
    const geo = await res.json();

    const city    = geo.city         || '';
    const country = geo.country_name || '';
    const code    = geo.country_code || '';
    const isAU    = code === 'AU';

    showGreeting(city ? `${timeGreeting} from ${city.toLowerCase()}` : `${timeGreeting}`);

    if (isAU) {
      showAvail('> based in brisbane — available across australia and internationally');
    } else if (country) {
      showAvail(`> based in brisbane — available to travel to ${country.toLowerCase()} and beyond`);
    }
  } catch (_) {
    showGreeting(timeGreeting);
  }
})();
