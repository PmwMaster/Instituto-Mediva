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

// Smooth scroll for all internal anchor links using Lenis
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    if (href === '#inicio') {
      e.preventDefault();
      e.stopPropagation();
      lenis.scrollTo(0, { duration: 1.2 });
      return;
    }

    const targetEl = document.querySelector(href);
    if (targetEl) {
      e.preventDefault();
      e.stopPropagation();
      lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
    }
  });
});

// Smart Header scroll effect
const header = document.getElementById('main-header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  if (!header) return;
  const currentScrollY = window.scrollY;
  
  // At the top of the page
  if (currentScrollY <= 50) {
    header.classList.remove('-translate-y-full', 'bg-white/95', 'backdrop-blur-md', 'shadow-soft', 'py-2');
    header.classList.add('bg-transparent', 'py-4');
  } 
  // Scrolling down
  else if (currentScrollY > lastScrollY) {
    header.classList.add('-translate-y-full');
    header.classList.remove('py-4');
  } 
  // Scrolling up
  else {
    header.classList.remove('-translate-y-full', 'bg-transparent', 'py-4');
    header.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-soft', 'py-2');
  }
  
  lastScrollY = currentScrollY;
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
    const scrollPerCard = window.innerWidth < 768 ? 350 : 500; 
    const setOpacity = cards3D.map((card) => gs.quickSetter(card, 'opacity'));
    let activeIndex = -1;

    function layoutCards() {
      const cardWidth = cards3D[0].offsetWidth;
      const isMobile = window.innerWidth < 768;
      const multiplier = isMobile ? 1.3 : 1.8;
      const radius = Math.round((cardWidth / (2 * Math.tan(Math.PI / numCards))) * multiplier);
      const origin = `50% 50% ${-radius}px`;

      gs.set(carousel3D, { transformOrigin: origin });
      cards3D.forEach((card, i) => {
        gs.set(card, { xPercent: -50, rotationY: i * anglePerCard, transformOrigin: origin });
      });
    }

    function updateCards(progress) {
      const rotation = progress * 360;
      let nextActive = Math.round(rotation / anglePerCard);
      if (nextActive >= numCards) nextActive = 0; // Wrap around for infinite loop feel

      cards3D.forEach((card, i) => {
        let delta = (((i * anglePerCard - rotation) % 360) + 360) % 360;
        if (delta > 180) delta -= 360;
        
        const dist = Math.min(Math.abs(delta) / anglePerCard, 1);
        setOpacity[i](1 - 0.6 * dist);
        const scale = 1.05 - 0.2 * dist;
        gs.set(card, { scale: scale });
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
    ScrollTrigger.addEventListener('refreshInit', layoutCards);

    const st = ScrollTrigger.create({
      animation: gs.to(carousel3D, {
        rotationY: -360,
        ease: 'none',
        onUpdate: function () { updateCards(this.progress()); }
      }),
      trigger: programasSection,
      start: 'top top',
      end: () => `+=${scrollPerCard * numCards}`,
      pin: true,
      anticipatePin: 1,
      scrub: 0.6,
      snap: {
        snapTo: 1 / numCards,
        duration: { min: 0.2, max: 0.6 },
        ease: "power1.inOut"
      },
      invalidateOnRefresh: true,
      refreshPriority: 1
    });

    cards3D.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        // Don't hijack clicks on buttons or links (e.g. "Solicitar Proposta")
        if (e.target.closest('a') || e.target.closest('button')) {
          return;
        }
        if (st && st.start !== undefined) {
          const targetScroll = st.start + (i * scrollPerCard);
          lenis.scrollTo(targetScroll, { duration: 1.2 });
        }
      });
      card.style.cursor = 'pointer';
    });

    updateCards(0);
  }
});
