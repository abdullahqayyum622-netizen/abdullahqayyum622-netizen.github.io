const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const gifUrls = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif'
];

function fillMarquee(row, urls) {
  if (!row) return;
  const items = [...urls, ...urls, ...urls];
  items.forEach((url) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Animated web project preview';
    img.loading = 'lazy';
    row.appendChild(img);
  });
}

const rowOne = document.getElementById('marqueeRowOne');
const rowTwo = document.getElementById('marqueeRowTwo');
fillMarquee(rowOne, gifUrls.slice(0, 11));
fillMarquee(rowTwo, gifUrls.slice(11));

document.querySelectorAll('.fade-in').forEach((el) => {
  const x = el.dataset.x || 0;
  const y = el.dataset.y || 30;
  const delay = el.dataset.delay || 0;
  el.style.setProperty('--from-x', `${x}px`);
  el.style.setProperty('--from-y', `${y}px`);
  el.style.setProperty('--delay', `${delay}s`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '40px 0px -20px 0px' });

document.querySelectorAll('.fade-in').forEach((el) => revealObserver.observe(el));

const textBlock = document.querySelector('.animated-text');
if (textBlock) {
  const text = textBlock.dataset.text || '';
  textBlock.innerHTML = text.split('').map((char) => {
    const safe = char === ' ' ? '&nbsp;' : char.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<span class="char">${safe}</span>`;
  }).join('');
}

function updateScrollAnimations() {
  const scrollY = window.scrollY;
  const about = document.querySelector('.animated-text');
  if (about) {
    const rect = about.getBoundingClientRect();
    const start = window.innerHeight * 0.82;
    const end = window.innerHeight * 0.18;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    const chars = about.querySelectorAll('.char');
    chars.forEach((char, index) => {
      const local = Math.max(0, Math.min(1, (progress * chars.length - index) / 12));
      char.style.opacity = String(0.2 + local * 0.8);
    });
  }

  const marquee = document.querySelector('.marquee-section');
  if (marquee && rowOne && rowTwo) {
    const sectionTop = marquee.offsetTop;
    const offset = (scrollY - sectionTop + window.innerHeight) * 0.3;
    rowOne.style.transform = `translate3d(${offset - 200}px, 0, 0)`;
    rowTwo.style.transform = `translate3d(${-offset + 200}px, 0, 0)`;
  }

  document.querySelectorAll('.project-card').forEach((card, index, cards) => {
    const rect = card.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / window.innerHeight));
    const targetScale = 1 - (cards.length - 1 - index) * 0.03;
    const scale = 1 - progress * (1 - targetScale);
    card.style.transform = `scale(${scale})`;
  });

  requestAnimationFrame(updateScrollAnimations);
}

if (!prefersReducedMotion) {
  requestAnimationFrame(updateScrollAnimations);
} else {
  document.querySelectorAll('.char').forEach((char) => char.style.opacity = '1');
}

document.querySelectorAll('.magnet').forEach((element) => {
  let active = false;

  function move(event) {
    if (prefersReducedMotion) return;
    const rect = element.getBoundingClientRect();
    const padding = 150;
    const within =
      event.clientX >= rect.left - padding &&
      event.clientX <= rect.right + padding &&
      event.clientY >= rect.top - padding &&
      event.clientY <= rect.bottom + padding;

    if (!within) {
      if (active) {
        element.style.transition = 'transform 0.6s ease-in-out';
        if (element.classList.contains('portrait-shell')) {
          const translate = window.innerWidth >= 640 ? 'translateX(-50%)' : 'translate(-50%, -50%)';
          element.style.transform = translate;
        } else {
          element.style.transform = 'translate3d(0,0,0)';
        }
        active = false;
      }
      return;
    }

    active = true;
    element.style.transition = 'transform 0.3s ease-out';
    const x = (event.clientX - (rect.left + rect.width / 2)) / 3;
    const y = (event.clientY - (rect.top + rect.height / 2)) / 3;

    if (element.classList.contains('portrait-shell')) {
      const base = window.innerWidth >= 640 ? 'translateX(-50%)' : 'translate(-50%, -50%)';
      element.style.transform = `${base} translate3d(${x}px, ${y}px, 0)`;
    } else {
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }

  window.addEventListener('mousemove', move, { passive: true });
});
