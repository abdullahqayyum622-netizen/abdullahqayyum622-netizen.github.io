const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow && !prefersReducedMotion) {
  window.addEventListener('mousemove', (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 0.035, 0.28)}s`;
  revealObserver.observe(element);
});

if (!prefersReducedMotion) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  document.querySelectorAll('.magnetic').forEach((item) => {
    item.addEventListener('mousemove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

const canvas = document.getElementById('particleCanvas');
if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let mouse = { x: 0, y: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(window.innerWidth * dpr);
    height = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    mouse = { x: width / 2, y: height / 2 };
    const count = Math.min(85, Math.floor((window.innerWidth * window.innerHeight) / 17000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25 * dpr,
      vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (Math.random() * 1.4 + 0.5) * dpr,
      a: Math.random() * 0.45 + 0.15
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 170) {
        p.x -= dx * 0.0014;
        p.y -= dy * 0.0014;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${p.a})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const link = Math.hypot(p.x - q.x, p.y - q.y);
        if (link < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(137,213,255, ${(1 - link / 120) * 0.12})`;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (event) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    mouse = { x: event.clientX * dpr, y: event.clientY * dpr };
  }, { passive: true });
  resize();
  draw();
}
