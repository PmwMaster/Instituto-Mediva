import './style.css';
import gsap from 'gsap';
import { gsap as gs } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { createIcons, icons } from 'lucide';

gs.registerPlugin(ScrollTrigger);

// Initialize Lucide Icons
createIcons({
  icons
});

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
  direction: 'vertical', 
  gestureDirection: 'vertical', 
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// GSAP ScrollTrigger integration with Lenis
lenis.on('scroll', ScrollTrigger.update)

gs.ticker.add((time)=>{
  lenis.raf(time * 1000)
})
gs.ticker.lagSmoothing(0)

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('hidden');
  mobileMenu?.classList.toggle('flex');
});

// Close mobile menu on click link
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.add('hidden');
    mobileMenu?.classList.remove('flex');
  });
});

// Header scroll effect
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header?.classList.add('shadow-md', 'py-2');
    header?.classList.remove('py-4');
  } else {
    header?.classList.remove('shadow-md', 'py-2');
    header?.classList.add('py-4');
  }
});

// Animations (Awwwards Style)
window.addEventListener('DOMContentLoaded', () => {

  // Hero Animation
  const heroTl = gs.timeline();
  heroTl.fromTo('.hero-tag', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 })
        .fromTo('.hero-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.6")
        .fromTo('.hero-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
        .fromTo('.hero-btn', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
        .fromTo('.hero-img', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, "-=0.8");

  // Reveal elements on scroll
  const revealElements = document.querySelectorAll('.reveal-up');
  revealElements.forEach((el) => {
    gs.fromTo(el, 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // Staggered lists/grids
  const grids = document.querySelectorAll('.stagger-grid');
  grids.forEach((grid) => {
    const items = grid.children;
    gs.fromTo(items, 
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 80%",
        }
      }
    );
  });

  // 3D Carousel (Programas)
  const programasSection = document.getElementById('programas');
  const carousel3D = document.querySelector('.carousel-3d');
  const cards3D = Array.from(document.querySelectorAll('.card-3d'));

  if (programasSection && carousel3D && cards3D.length > 0) {
    const numCards = cards3D.length;
    const anglePerCard = 360 / numCards;
    const lastAngle = anglePerCard * (numCards - 1); // o último card termina de frente (sem repetir o 1º)
    const scrollPerCard = 500; // px de scroll para passar de um card ao próximo
    const setOpacity = cards3D.map((card) => gs.quickSetter(card, 'opacity'));
    let activeIndex = -1;

    // O GSAP aplica translate ANTES de rotate, então "rotationY + translateZ" não forma um círculo
    // (todos os cards ficam empilhados no mesmo ponto). Para montar o anel, cada card gira em torno
    // de um ponto atrás dele (transform-origin com Z negativo), e o container gira em torno do mesmo ponto.
    function layoutCards() {
      const cardWidth = cards3D[0].offsetWidth;
      const radius = Math.round((cardWidth / (2 * Math.tan(Math.PI / numCards))) * 1.8);
      const origin = `50% 50% ${-radius}px`;

      gs.set(carousel3D, { transformOrigin: origin });
      cards3D.forEach((card, i) => {
        gs.set(card, { xPercent: -50, rotationY: i * anglePerCard, transformOrigin: origin });
      });
    }

    // Card ativo (classe .active) e opacidade proporcional à distância angular da frente
    function updateCards(progress) {
      const rotation = progress * lastAngle;
      const nextActive = Math.min(numCards - 1, Math.max(0, Math.round(rotation / anglePerCard)));

      cards3D.forEach((card, i) => {
        let delta = (((i * anglePerCard - rotation) % 360) + 360) % 360;
        if (delta > 180) delta -= 360;
        setOpacity[i](1 - 0.45 * Math.min(Math.abs(delta) / anglePerCard, 1));
      });

      if (nextActive === activeIndex) return;
      activeIndex = nextActive;
      cards3D.forEach((card, i) => {
        const isActive = i === activeIndex;
        card.classList.toggle('active', isActive);
        card.querySelectorAll('a').forEach((link) => { link.tabIndex = isActive ? 0 : -1; });
      });
    }

    layoutCards();
    // Recalcula o anel antes de cada refresh do ScrollTrigger (inclui resize e troca de breakpoint)
    ScrollTrigger.addEventListener('refreshInit', layoutCards);

    gs.to(carousel3D, {
      rotationY: -lastAngle,
      ease: 'none',
      onUpdate: function () { updateCards(this.progress()); },
      scrollTrigger: {
        trigger: programasSection,
        start: 'top top',
        end: () => `+=${scrollPerCard * (numCards - 1)}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.6,
        invalidateOnRefresh: true,
        refreshPriority: 1 // o pin precisa ser medido antes dos triggers das seções abaixo dele
      }
    });

    updateCards(0);
  }
});
