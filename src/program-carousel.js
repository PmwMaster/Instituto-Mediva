import gsap from 'gsap';
import { createIcons, icons } from 'lucide';

export function initProgramCarousel() {
  const carousel = document.querySelector('.program-carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.program-viewport');
  const track = carousel.querySelector('.program-track');
  const cards = [...track.querySelectorAll('.program-card')];
  const current = carousel.querySelector('[data-program-current]');
  const total = carousel.querySelector('[data-program-total]');
  const status = carousel.querySelector('[data-program-status]');
  const prevBtn = carousel.querySelector('.program-prev');
  const nextBtn = carousel.querySelector('.program-next');
  const dotsContainer = carousel.querySelector('.program-dots');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const anglePerCard = 360 / cards.length;
  const orbit = { angle: 0 };
  let radius = 0;
  let position = 0;
  let isDragging = false;
  let hasDragged = false;

  function updateDepth() {
    cards.forEach((card, index) => {
      const angle = ((index * anglePerCard - orbit.angle + 180) % 360 + 360) % 360 - 180;
      const radians = (angle * Math.PI) / 180;
      const distance = Math.min(Math.abs(angle) / anglePerCard, 1);
      const visibility = 1 - Math.min(Math.max(Math.abs(angle) / anglePerCard - 1, 0), 1);

      gsap.set(card, {
        x: Math.sin(radians) * radius,
        z: (Math.cos(radians) - 1) * radius,
        rotationY: 0,
        autoAlpha: (1 - 0.35 * distance) * visibility,
        scale: 1 - 0.06 * distance,
        zIndex: Math.round(100 - Math.abs(angle))
      });
    });
  }

  function layoutCards() {
    const isMobile = window.innerWidth < 768;
    radius = cards[0].offsetWidth * (isMobile ? 0.85 : 1.25);
    gsap.set(cards, { xPercent: -50 });
    moveTo(position, false);
  }

  if (total) {
    total.textContent = String(cards.length).padStart(2, '0');
  }

  // Setup click selection for cards
  cards.forEach((card, index) => {
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${index + 1} de ${cards.length}`);

    // If select button doesn't exist, create it
    let select = card.querySelector('.program-select');
    if (!select) {
      select = document.createElement('button');
      select.type = 'button';
      select.className = 'program-select';
      select.setAttribute('aria-label', `Ver programa ${card.querySelector('h3')?.textContent || index + 1}`);
      card.prepend(select);
    }

    card.addEventListener('click', (event) => {
      // Don't intercept clicks on buttons or links
      if (event.target.closest('a') || event.target.closest('button.btn-primary') || hasDragged) {
        return;
      }
      const activeIndex = ((position % cards.length) + cards.length) % cards.length;
      let offset = (index - activeIndex + cards.length) % cards.length;
      if (offset > cards.length / 2) offset -= cards.length;
      if (offset !== 0) moveTo(position + offset);
    });
  });

  // Dots indicators
  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold';
      dot.setAttribute('aria-label', `Ir para programa ${i + 1}`);
      dot.addEventListener('click', () => {
        const activeIndex = ((position % cards.length) + cards.length) % cards.length;
        let offset = (i - activeIndex + cards.length) % cards.length;
        if (offset > cards.length / 2) offset -= cards.length;
        moveTo(position + offset);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots(activeIndex) {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, i) => {
      if (i === activeIndex) {
        dot.className = 'h-2.5 w-7 bg-brand-gold rounded-full transition-all duration-300 shadow-sm';
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.className = 'h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-all duration-300';
        dot.setAttribute('aria-selected', 'false');
      }
    });
  }

  renderDots();

  function moveTo(index, animate = true) {
    position = index;
    const activeIndex = ((position % cards.length) + cards.length) % cards.length;

    gsap.to(orbit, {
      angle: position * anglePerCard,
      duration: animate && !reducedMotion.matches ? 0.65 : 0,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: updateDepth
    });

    cards.forEach((card, cardIndex) => {
      const active = cardIndex === activeIndex;
      const offset = (cardIndex - activeIndex + cards.length) % cards.length;
      const visible = active || offset === 1 || offset === cards.length - 1;
      card.classList.toggle('is-active', active);
      card.inert = !visible;
      card.setAttribute('aria-hidden', String(!visible));
      
      const selectBtn = card.querySelector('.program-select');
      if (selectBtn) {
        selectBtn.setAttribute('aria-pressed', String(active));
      }
    });

    if (current) {
      current.textContent = String(activeIndex + 1).padStart(2, '0');
    }
    if (status) {
      const activeTitle = cards[activeIndex]?.querySelector('h3')?.textContent || '';
      status.textContent = `Programa ${activeIndex + 1} de ${cards.length}: ${activeTitle}`;
    }

    updateDots(activeIndex);
  }

  // Prev / Next Button Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => moveTo(position - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => moveTo(position + 1));
  }

  // Keyboard Navigation
  carousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    moveTo(position + direction);
    const activeCard = cards[((position % cards.length) + cards.length) % cards.length];
    activeCard?.querySelector('.program-select')?.focus({ preventScroll: true });
  });

  // Touch & Drag Handling (Mobile Swipe + Desktop Drag)
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let startAngle = 0;
  let velocity = 0;
  let lastTime = 0;
  let isHorizontal = null;

  const dragTarget = viewport || carousel;

  function onTouchStart(e) {
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX;
    startY = point.clientY;
    lastX = startX;
    lastTime = Date.now();
    startAngle = orbit.angle;
    isDragging = true;
    hasDragged = false;
    isHorizontal = null;
    velocity = 0;

    gsap.killTweensOf(orbit);
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    const point = e.touches ? e.touches[0] : e;
    const currentX = point.clientX;
    const currentY = point.clientY;
    const diffX = startX - currentX;
    const diffY = startY - currentY;

    if (isHorizontal === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontal = Math.abs(diffX) >= Math.abs(diffY);
        if (!isHorizontal) {
          isDragging = false;
          return;
        }
      } else {
        return;
      }
    }

    if (!isHorizontal) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    hasDragged = true;
    viewport.classList.add('is-dragging');

    const now = Date.now();
    const dt = Math.max(1, now - lastTime);
    velocity = (currentX - lastX) / dt;
    lastX = currentX;
    lastTime = now;

    const cardWidth = cards[0].offsetWidth || 280;
    const angleDelta = (diffX / cardWidth) * anglePerCard * 0.95;
    orbit.angle = startAngle + angleDelta;
    updateDepth();
  }

  function onTouchEnd() {
    if (!isDragging && !hasDragged) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');

    if (hasDragged) {
      // Add momentum / flick
      const flick = velocity * -160;
      const projectedAngle = orbit.angle + flick;
      const nearestPosition = Math.round(projectedAngle / anglePerCard);
      moveTo(nearestPosition, true);

      // Briefly keep hasDragged true so click event on link is swallowed
      setTimeout(() => {
        hasDragged = false;
      }, 150);
    }
  }

  // Touch Events for Mobile
  dragTarget.addEventListener('touchstart', onTouchStart, { passive: true });
  dragTarget.addEventListener('touchmove', onTouchMove, { passive: false });
  dragTarget.addEventListener('touchend', onTouchEnd, { passive: true });
  dragTarget.addEventListener('touchcancel', onTouchEnd, { passive: true });

  // Mouse Drag for Desktop
  dragTarget.addEventListener('mousedown', (e) => {
    // Only left click
    if (e.button !== 0) return;
    if (e.target.closest('a') || e.target.closest('button.btn-primary')) return;
    onTouchStart(e);

    function onMouseMove(moveEvent) {
      onTouchMove(moveEvent);
    }

    function onMouseUp(upEvent) {
      onTouchEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  // Re-render icons for dynamically added elements if needed
  createIcons({ icons });

  // Recenter on resize
  new ResizeObserver(layoutCards).observe(carousel);
  reducedMotion.addEventListener('change', () => moveTo(position, false));
  layoutCards();
}
