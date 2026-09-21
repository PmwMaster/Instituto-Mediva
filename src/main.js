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

  // Clean Lateral Carousel (Programas)
  const carousel = document.getElementById('programs-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = document.querySelectorAll('#carousel-dots button');

  if (carousel) {
    const getCardWidth = () => {
      const firstCard = carousel.querySelector('.carousel-card');
      return firstCard ? firstCard.offsetWidth + 24 : 380;
    };

    const updateDots = () => {
      const cardWidth = getCardWidth();
      const activeIdx = Math.min(
        dots.length - 1,
        Math.max(0, Math.round(carousel.scrollLeft / cardWidth))
      );
      dots.forEach((dot, idx) => {
        if (idx === activeIdx) {
          dot.classList.remove('bg-slate-300');
          dot.classList.add('bg-brand-gold', 'w-8');
        } else {
          dot.classList.remove('bg-brand-gold', 'w-8');
          dot.classList.add('bg-slate-300', 'w-2.5');
        }
      });
    };

    prevBtn?.addEventListener('click', () => {
      carousel.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    });

    nextBtn?.addEventListener('click', () => {
      carousel.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index') || '0', 10);
        carousel.scrollTo({ left: index * getCardWidth(), behavior: 'smooth' });
      });
    });

    carousel.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateDots);
    });

    // Mouse Drag to Scroll
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
    });

    carousel.addEventListener('mouseleave', () => {
      isDown = false;
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    });

    updateDots();
  }
});
