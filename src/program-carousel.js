import gsap from 'gsap';

export function initProgramCarousel() {
  const carousel = document.querySelector('.program-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.program-track');
  const cards = [...track.querySelectorAll('.program-card')];
  const current = carousel.querySelector('[data-program-current]');
  const status = carousel.querySelector('[data-program-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const anglePerCard = 360 / cards.length;
  const orbit = { angle: 0 };
  let radius = 0;
  // Keep an unbounded position so the last/first transition continues the turn.
  let position = 0;

  function updateDepth() {
    cards.forEach((card, index) => {
      const angle = ((index * anglePerCard - orbit.angle + 180) % 360 + 360) % 360 - 180;
      const radians = angle * Math.PI / 180;
      const distance = Math.min(Math.abs(angle) / anglePerCard, 1);
      const visibility = 1 - Math.min(Math.max(Math.abs(angle) / anglePerCard - 1, 0), 1);
      // Keep every card facing forward while it follows the circular path.
      gsap.set(card, {
        x: Math.sin(radians) * radius,
        z: (Math.cos(radians) - 1) * radius,
        rotationY: 0,
        autoAlpha: (1 - 0.08 * distance) * visibility,
        scale: 1 - 0.06 * distance,
      });
    });
  }

  function layoutCards() {
    radius = cards[0].offsetWidth * (window.innerWidth < 768 ? 0.8 : 1.25);
    gsap.set(cards, { xPercent: -50 });
    moveTo(position, false);
  }

  carousel.querySelector('[data-program-total]').textContent = String(cards.length).padStart(2, '0');
  cards.forEach((card, index) => {
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${index + 1} de ${cards.length}`);
    const select = document.createElement('button');
    select.type = 'button';
    select.className = 'program-select';
    select.setAttribute('aria-label', `Ver programa ${card.querySelector('h3').textContent}`);
    card.prepend(select);
    card.addEventListener('click', (event) => {
      // Proposal links keep their own navigation, even on the side cards.
      if (event.target.closest('a')) return;
      const activeIndex = ((position % cards.length) + cards.length) % cards.length;
      let offset = (index - activeIndex + cards.length) % cards.length;
      if (offset > cards.length / 2) offset -= cards.length;
      if (offset !== 0) moveTo(position + offset);
    });
  });

  function moveTo(index, animate = true) {
    position = index;
    const activeIndex = ((position % cards.length) + cards.length) % cards.length;

    gsap.to(orbit, {
      angle: position * anglePerCard,
      duration: animate && !reducedMotion.matches ? 0.65 : 0,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: updateDepth,
    });

    cards.forEach((card, cardIndex) => {
      const active = cardIndex === activeIndex;
      const offset = (cardIndex - activeIndex + cards.length) % cards.length;
      const visible = active || offset === 1 || offset === cards.length - 1;
      card.classList.toggle('is-active', active);
      card.inert = !visible;
      card.setAttribute('aria-hidden', String(!visible));
      card.querySelector('.program-select').setAttribute('aria-pressed', String(active));
    });
    current.textContent = String(activeIndex + 1).padStart(2, '0');
    status.textContent = `Programa ${activeIndex + 1} de ${cards.length}: ${cards[activeIndex].querySelector('h3').textContent}`;
  }

  carousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    moveTo(position + direction);
    cards[((position % cards.length) + cards.length) % cards.length]
      .querySelector('.program-select').focus({ preventScroll: true });
  });

  // Recenter the selected card after a viewport or orientation change.
  new ResizeObserver(layoutCards).observe(carousel);
  reducedMotion.addEventListener('change', () => moveTo(position, false));
  layoutCards();
}
