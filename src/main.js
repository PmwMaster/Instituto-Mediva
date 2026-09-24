import './style.css';
import { initProgramCarousel } from './program-carousel.js';
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

function setMobileMenuOpen(isOpen, restoreFocus = false) {
  if (!mobileMenuBtn || !mobileMenu) return;

  mobileMenu.classList.toggle('hidden', !isOpen);
  mobileMenu.classList.toggle('flex', isOpen);
  mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
  mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

  if (restoreFocus) mobileMenuBtn.focus();
}

mobileMenuBtn?.addEventListener('click', () => {
  setMobileMenuOpen(mobileMenuBtn.getAttribute('aria-expanded') !== 'true');
});

// Close mobile menu on click link
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    setMobileMenuOpen(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenuBtn?.getAttribute('aria-expanded') === 'true') {
    setMobileMenuOpen(false, true);
  }
});

window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
  if (event.matches) setMobileMenuOpen(false);
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

const floatingWhatsApp = document.querySelector('a.fixed[href^="https://wa.me/"]');
const contactSection = document.getElementById('contato');
const footer = document.querySelector('footer');

if (floatingWhatsApp && contactSection && footer) {
  const visibleContactAreas = new Set();
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleContactAreas.add(entry.target);
      else visibleContactAreas.delete(entry.target);
    });
    floatingWhatsApp.style.display = visibleContactAreas.size ? 'none' : '';
  });
  contactObserver.observe(contactSection);
  contactObserver.observe(footer);
}

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

  initProgramCarousel();
});
