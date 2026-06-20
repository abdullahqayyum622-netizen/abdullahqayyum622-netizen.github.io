(function () {
  const root = document.documentElement;
  const body = document.body;
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');
  const scrollProgress = document.getElementById('scrollProgress');
  const cursorOrb = document.getElementById('cursorOrb');
  const toast = document.getElementById('toast');

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  menuToggle?.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    scrollProgress.style.width = percent + '%';
  }, { passive: true });

  window.addEventListener('pointermove', (event) => {
    if (!cursorOrb) return;
    cursorOrb.style.left = event.clientX + 'px';
    cursorOrb.style.top = event.clientY + 'px';
  }, { passive: true });

  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas?.getContext('2d');
  let particles = [];
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 18)) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + .5,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      a: Math.random() * .55 + .15
    }));
  }
  function drawGrid() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const theme = root.getAttribute('data-theme');
    const line = theme === 'dark' ? 'rgba(237,245,255,.045)' : 'rgba(7,17,31,.055)';
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    const gap = 56;
    const offset = (window.scrollY * .18) % gap;
    for (let x = -gap; x < window.innerWidth + gap; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + offset, window.innerHeight); ctx.stroke();
    }
    for (let y = -gap; y < window.innerHeight + gap; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y + offset); ctx.lineTo(window.innerWidth, y); ctx.stroke();
    }
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = window.innerWidth;
      if (p.x > window.innerWidth) p.x = 0;
      if (p.y < 0) p.y = window.innerHeight;
      if (p.y > window.innerHeight) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'dark' ? `rgba(139,233,253,${p.a})` : `rgba(0,102,255,${p.a * .45})`;
      ctx.fill();
    });
    requestAnimationFrame(drawGrid);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(drawGrid);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 36));
      const tick = () => {
        current = Math.min(target, current + step);
        el.textContent = current + '+';
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      countObserver.unobserve(el);
    });
  }, { threshold: .7 });
  document.querySelectorAll('.count').forEach((el) => countObserver.observe(el));

  const words = ['AI automation workflows', 'n8n workflow systems', 'full-stack websites', 'business websites', 'lead generation systems'];
  const typed = document.getElementById('typedText');
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;
  function typeLoop() {
    if (!typed) return;
    const word = words[wordIndex];
    typed.textContent = word.slice(0, charIndex) + (charIndex % 2 ? '|' : '');
    if (!deleting && charIndex < word.length) charIndex++;
    else if (!deleting && charIndex === word.length) deleting = true;
    else if (deleting && charIndex > 0) charIndex--;
    else { deleting = false; wordIndex = (wordIndex + 1) % words.length; }
    const delay = deleting ? 42 : charIndex === word.length ? 1200 : 80;
    setTimeout(typeLoop, delay);
  }
  typeLoop();

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - .5) * -8;
      const rotateY = ((x / rect.width) - .5) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * .12}px, ${y * .18}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });

  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navItems = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  function updateActiveNav() {
    const pos = window.scrollY + 180;
    let current = '';
    sections.forEach((section) => {
      if (pos >= section.offsetTop) current = section.id;
    });
    navItems.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.case-card').forEach((card) => {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
      });
    });
  });

  const projects = {
    royalOrchard: {
      type: 'Restaurant Website',
      title: 'Royal Orchard Restaurant Chakwal',
      description: 'A real business website project for Royal Orchard Restaurant Chakwal focused on professional presentation, menu visibility and easy customer contact.',
      problem: 'The restaurant needed a clean online presence where customers could quickly understand the brand, view key details and contact the business.',
      solution: 'Built a responsive website structure with restaurant-focused visuals, menu-friendly sections, location/contact flow and mobile-first layout.',
      deliverables: 'Homepage structure, restaurant sections, contact flow, responsive layout, business presentation.',
      tools: 'HTML, CSS, JavaScript, responsive UI, content structure.'
    },
    academy: {
      type: 'Academy Website',
      title: 'Knowledge Academy Chakwal',
      description: 'A professional education website concept designed to present courses, build trust with parents and make inquiries easier.',
      problem: 'The academy needed a clean digital presence that explains classes, extra test preparation and credibility clearly.',
      solution: 'Designed a responsive structure with hero message, course sections, parent-focused copy, 3D visual style and contact flow.',
      deliverables: 'Homepage, course cards, responsive layout, animation direction, contact sections.',
      tools: 'HTML, CSS, JavaScript, Vite direction, UI copy.'
    },
    packaging: {
      type: 'Business Website',
      title: 'Nobel Packaging',
      description: 'A business website structure for packaging products, service pages and inquiry-focused presentation.',
      problem: 'The business needed to present many product categories without confusing visitors.',
      solution: 'Created a clear content system for products, services, company trust and lead generation.',
      deliverables: 'Product categories, service layout, company profile, CTA strategy.',
      tools: 'WordPress, Elementor direction, SEO structure, content planning.'
    },
    workflow: {
      type: 'AI Workflow',
      title: 'Content & Research System',
      description: 'A practical workflow for daily content planning, research, captions, thumbnails and SEO ideas using AI tools.',
      problem: 'Content teams often lose time researching, rewriting and formatting routine work.',
      solution: 'Built a repeatable AI-assisted process for research, story angle, captions, titles, tags and design prompts.',
      deliverables: 'Prompt systems, content SOP, research workflow, publishing checklist.',
      tools: 'ChatGPT, Gemini, Canva, automation thinking.'
    },
    personalBrand: {
      type: 'Personal Branding',
      title: 'LinkedIn Portfolio Direction',
      description: 'A clean profile and content direction to make personal branding look credible and professional.',
      problem: 'A profile can look incomplete if the headline, banner, services and proof are not connected.',
      solution: 'Created a complete presentation direction with profile copy, banner concept, portfolio CTA and content angle.',
      deliverables: 'Profile positioning, banner concept, service description, post direction.',
      tools: 'Canva, content strategy, copywriting, brand presentation.'
    }
  };
  const modal = document.getElementById('projectModal');
  const modalFields = {
    type: document.getElementById('modalType'),
    title: document.getElementById('modalTitle'),
    description: document.getElementById('modalDescription'),
    problem: document.getElementById('modalProblem'),
    solution: document.getElementById('modalSolution'),
    deliverables: document.getElementById('modalDeliverables'),
    tools: document.getElementById('modalTools')
  };
  function openModal(projectKey) {
    const p = projects[projectKey];
    if (!p || !modal) return;
    modalFields.type.textContent = p.type;
    modalFields.title.textContent = p.title;
    modalFields.description.textContent = p.description;
    modalFields.problem.textContent = p.problem;
    modalFields.solution.textContent = p.solution;
    modalFields.deliverables.textContent = p.deliverables;
    modalFields.tools.textContent = p.tools;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
  }
  function closeModal() {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
  }
  document.querySelectorAll('.case-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.case-link') || event.target.closest('.case-card')) openModal(card.dataset.project);
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModal));

  const commandPalette = document.getElementById('commandPalette');
  const commandOpen = document.getElementById('commandOpen');
  function openCommand() {
    commandPalette?.classList.add('open');
    commandPalette?.setAttribute('aria-hidden', 'false');
    body.classList.add('command-open');
  }
  function closeCommand() {
    commandPalette?.classList.remove('open');
    commandPalette?.setAttribute('aria-hidden', 'true');
    body.classList.remove('command-open');
  }
  commandOpen?.addEventListener('click', openCommand);
  document.querySelectorAll('[data-close-command]').forEach((el) => el.addEventListener('click', closeCommand));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); openCommand();
    }
    if (event.key === 'Escape') { closeCommand(); closeModal(); }
  });

  document.getElementById('backTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.getElementById('emailLink')?.addEventListener('click', async (event) => {
    const email = 'kaforgeagency@gmail.com';
    if (navigator.clipboard && event.altKey) {
      event.preventDefault();
      await navigator.clipboard.writeText(email);
      toast.textContent = 'Email copied';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1800);
    }
  });
})();
