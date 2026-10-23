import gsap from 'gsap';
import { createIcons, icons } from 'lucide';

export function initCapacitacoesHub() {
  const hub = document.getElementById('capacitacoes-hub');
  if (!hub) return;

  // DOM Elements
  const tabs = hub.querySelectorAll('[data-filter-tab]');
  const searchInput = hub.querySelector('#capacitacoes-search');
  const searchClear = hub.querySelector('#capacitacoes-search-clear');
  const cardsContainer = hub.querySelector('#capacitacoes-cards');
  const cards = [...hub.querySelectorAll('.capacitacao-card')];
  const countBadge = hub.querySelector('#capacitacoes-count');
  const emptyState = hub.querySelector('#capacitacoes-empty');
  const emptyResetBtn = hub.querySelector('#capacitacoes-empty-reset');

  // Carousel controls
  const carouselControls = hub.querySelector('#carousel-controls');
  const prevBtn = hub.querySelector('#carousel-prev');
  const nextBtn = hub.querySelector('#carousel-next');
  const dotsContainer = hub.querySelector('#carousel-dots');
  const counterCurrent = hub.querySelector('#carousel-current');
  const counterTotal = hub.querySelector('#carousel-total');

  // View mode switcher
  const modeCarouselBtn = hub.querySelector('#view-mode-carousel');
  const modeGridBtn = hub.querySelector('#view-mode-grid');

  let activeCategory = 'saude'; // default to saude
  let searchQuery = '';
  let viewMode = window.innerWidth < 1024 ? 'carousel' : 'grid'; // mobile defaults to carousel for clean UX
  let activeCardIndex = 0;

  // Check URL hash on initial load
  const initialHash = window.location.hash.toLowerCase();
  if (initialHash === '#educacao') {
    activeCategory = 'educacao';
  } else if (initialHash === '#todas' || initialHash === '#capacitacoes') {
    activeCategory = 'todas';
  } else if (initialHash === '#saude') {
    activeCategory = 'saude';
  }

  // Update View Mode UI
  function setViewMode(mode) {
    viewMode = mode;
    if (viewMode === 'carousel') {
      cardsContainer.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-8');
      cardsContainer.classList.add('flex', 'overflow-x-auto', 'snap-x', 'snap-mandatory', 'gap-6', 'pb-6', 'pt-2', 'px-2', 'no-scrollbar', 'scroll-smooth');
      cards.forEach(card => {
        card.classList.add('flex-shrink-0', 'w-[88vw]', 'sm:w-[380px]', 'md:w-[400px]', 'snap-center');
      });
      if (carouselControls) carouselControls.classList.remove('hidden');
      if (modeCarouselBtn) {
        modeCarouselBtn.classList.add('bg-brand-navy', 'text-white');
        modeCarouselBtn.classList.remove('bg-white', 'text-slate-600');
      }
      if (modeGridBtn) {
        modeGridBtn.classList.remove('bg-brand-navy', 'text-white');
        modeGridBtn.classList.add('bg-white', 'text-slate-600');
      }
      updateCarouselUI();
    } else {
      cardsContainer.classList.remove('flex', 'overflow-x-auto', 'snap-x', 'snap-mandatory', 'gap-6', 'pb-6', 'pt-2', 'px-2', 'no-scrollbar', 'scroll-smooth');
      cardsContainer.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-8');
      cards.forEach(card => {
        card.classList.remove('flex-shrink-0', 'w-[88vw]', 'sm:w-[380px]', 'md:w-[400px]', 'snap-center');
      });
      if (carouselControls) carouselControls.classList.add('hidden');
      if (modeGridBtn) {
        modeGridBtn.classList.add('bg-brand-navy', 'text-white');
        modeGridBtn.classList.remove('bg-white', 'text-slate-600');
      }
      if (modeCarouselBtn) {
        modeCarouselBtn.classList.remove('bg-brand-navy', 'text-white');
        modeCarouselBtn.classList.add('bg-white', 'text-slate-600');
      }
    }
  }

  // Filter cards based on Category and Search Query
  function filterCards(animate = true) {
    const term = searchQuery.trim().toLowerCase();
    let visibleCount = 0;
    const visibleCards = [];

    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const text = card.textContent.toLowerCase();

      const matchesCategory = activeCategory === 'todas' || category === activeCategory;
      const matchesSearch = !term || title.includes(term) || text.includes(term);

      const isVisible = matchesCategory && matchesSearch;

      if (isVisible) {
        visibleCount++;
        visibleCards.push(card);
        card.classList.remove('hidden');
        if (animate) {
          gsap.fromTo(card, 
            { opacity: 0, y: 15 }, 
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' }
          );
        } else {
          card.style.opacity = '1';
          card.style.transform = 'none';
        }
      } else {
        card.classList.add('hidden');
      }
    });

    // Update count badge
    if (countBadge) {
      countBadge.textContent = `${visibleCount} ${visibleCount === 1 ? 'capacitação' : 'capacitações'}`;
    }

    // Toggle Empty state
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        if (carouselControls) carouselControls.classList.add('hidden');
      } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        if (viewMode === 'carousel' && carouselControls) {
          carouselControls.classList.remove('hidden');
        }
      }
    }

    // Reset carousel scroll to start
    if (cardsContainer) {
      cardsContainer.scrollTo({ left: 0, behavior: 'smooth' });
    }
    activeCardIndex = 0;
    renderDots(visibleCards.length);
    updateCarouselCounter(1, visibleCards.length);
  }

  // Tab switcher
  function setActiveTab(category) {
    activeCategory = category;
    tabs.forEach(tab => {
      const tabCategory = tab.getAttribute('data-filter-tab');
      const isActive = tabCategory === activeCategory;
      if (isActive) {
        tab.classList.add('bg-brand-navy', 'text-white', 'shadow-md');
        tab.classList.remove('bg-white', 'text-slate-700', 'hover:bg-slate-100');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('bg-brand-navy', 'text-white', 'shadow-md');
        tab.classList.add('bg-white', 'text-slate-700', 'hover:bg-slate-100');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    filterCards(true);
  }

  // Dots rendering for Carousel
  function renderDots(totalVisible) {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    if (totalVisible <= 1) return;

    for (let i = 0; i < totalVisible; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `h-2 rounded-full transition-all duration-300 cursor-pointer ${
        i === activeCardIndex ? 'w-6 bg-brand-gold' : 'w-2 bg-slate-300 hover:bg-slate-400'
      }`;
      dot.setAttribute('aria-label', `Ir para item ${i + 1}`);
      dot.addEventListener('click', () => {
        scrollToCard(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots(index) {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.className = 'h-2 w-6 bg-brand-gold rounded-full transition-all duration-300 shadow-sm';
      } else {
        dot.className = 'h-2 w-2 bg-slate-300 hover:bg-slate-400 rounded-full transition-all duration-300';
      }
    });
  }

  function updateCarouselCounter(current, total) {
    if (counterCurrent) counterCurrent.textContent = String(current).padStart(2, '0');
    if (counterTotal) counterTotal.textContent = String(total).padStart(2, '0');
  }

  function getVisibleCards() {
    return cards.filter(c => !c.classList.contains('hidden'));
  }

  function scrollToCard(index) {
    const visibleCards = getVisibleCards();
    if (index < 0 || index >= visibleCards.length) return;
    activeCardIndex = index;
    const targetCard = visibleCards[index];
    if (targetCard && cardsContainer) {
      const containerLeft = cardsContainer.getBoundingClientRect().left;
      const cardLeft = targetCard.getBoundingClientRect().left;
      const offset = cardLeft - containerLeft + cardsContainer.scrollLeft - 16;
      cardsContainer.scrollTo({ left: offset, behavior: 'smooth' });
    }
    updateDots(activeCardIndex);
    updateCarouselCounter(activeCardIndex + 1, visibleCards.length);
  }

  function updateCarouselUI() {
    const visibleCards = getVisibleCards();
    renderDots(visibleCards.length);
    updateCarouselCounter(activeCardIndex + 1, visibleCards.length);
  }

  // Scroll listener on cards container in carousel mode to update active index
  let isScrollingTimeout;
  if (cardsContainer) {
    cardsContainer.addEventListener('scroll', () => {
      if (viewMode !== 'carousel') return;
      clearTimeout(isScrollingTimeout);
      isScrollingTimeout = setTimeout(() => {
        const visibleCards = getVisibleCards();
        if (visibleCards.length === 0) return;
        const containerRect = cardsContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestIndex = 0;
        let smallestDistance = Infinity;

        visibleCards.forEach((card, idx) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(containerCenter - cardCenter);
          if (distance < smallestDistance) {
            smallestDistance = distance;
            closestIndex = idx;
          }
        });

        if (closestIndex !== activeCardIndex) {
          activeCardIndex = closestIndex;
          updateDots(activeCardIndex);
          updateCarouselCounter(activeCardIndex + 1, visibleCards.length);
        }
      }, 60);
    }, { passive: true });
  }

  // Prev / Next button clicks
  prevBtn?.addEventListener('click', () => {
    const visibleCards = getVisibleCards();
    if (activeCardIndex > 0) {
      scrollToCard(activeCardIndex - 1);
    } else {
      scrollToCard(visibleCards.length - 1);
    }
  });

  nextBtn?.addEventListener('click', () => {
    const visibleCards = getVisibleCards();
    if (activeCardIndex < visibleCards.length - 1) {
      scrollToCard(activeCardIndex + 1);
    } else {
      scrollToCard(0);
    }
  });

  // Tab click listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-filter-tab');
      setActiveTab(category);
    });
  });

  // Search input listeners
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (searchClear) {
      searchClear.classList.toggle('hidden', searchQuery.length === 0);
    }
    filterCards(true);
  });

  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    searchClear.classList.add('hidden');
    filterCards(true);
    searchInput?.focus();
  });

  emptyResetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    if (searchClear) searchClear.classList.add('hidden');
    setActiveTab('todas');
  });

  // Mode switcher listeners
  modeCarouselBtn?.addEventListener('click', () => setViewMode('carousel'));
  modeGridBtn?.addEventListener('click', () => setViewMode('grid'));

  // Expandable Quick Topics Accordion on each card
  cards.forEach(card => {
    const toggleBtn = card.querySelector('.btn-toggle-topics');
    const topicsContent = card.querySelector('.card-topics-content');
    const toggleIcon = card.querySelector('.topics-toggle-icon');

    if (toggleBtn && topicsContent) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', String(!isExpanded));

        if (!isExpanded) {
          topicsContent.classList.remove('hidden');
          gsap.fromTo(topicsContent, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' });
          if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
          toggleBtn.querySelector('.topics-label').textContent = 'Ocultar tópicos';
        } else {
          gsap.to(topicsContent, { 
            height: 0, 
            opacity: 0, 
            duration: 0.25, 
            ease: 'power2.in',
            onComplete: () => {
              topicsContent.classList.add('hidden');
            }
          });
          if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
          toggleBtn.querySelector('.topics-label').textContent = 'Ver tópicos principais';
        }
      });
    }
  });

  // Hash Navigation listener: #saude and #educacao from anywhere
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#saude') {
      setActiveTab('saude');
    } else if (hash === '#educacao') {
      setActiveTab('educacao');
    } else if (hash === '#capacitacoes') {
      setActiveTab('todas');
    }
  });

  // Intercept any in-page link targeting #saude or #educacao
  document.querySelectorAll('a[href="#saude"], a[href="/#saude"]').forEach(link => {
    link.addEventListener('click', () => {
      setActiveTab('saude');
    });
  });

  document.querySelectorAll('a[href="#educacao"], a[href="/#educacao"]').forEach(link => {
    link.addEventListener('click', () => {
      setActiveTab('educacao');
    });
  });

  document.querySelectorAll('a[href="#capacitacoes"], a[href="/#capacitacoes"]').forEach(link => {
    link.addEventListener('click', () => {
      setActiveTab('todas');
    });
  });

  // Initialize
  setViewMode(viewMode);
  setActiveTab(activeCategory);
  createIcons({ icons });
}
