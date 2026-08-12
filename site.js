const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');

if (toggle && menu) {
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    menu.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 840 && menu.classList.contains('open')) closeMenu();
  });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const projectFilesInput = document.querySelector('#project_files');

if (projectFilesInput) {
  const allowedFileExtensions = new Set(['stl', '3mf', 'step', 'stp', 'obj']);

  projectFilesInput.addEventListener('change', () => {
    const invalidFiles = [...projectFilesInput.files].filter((file) => {
      const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
      return !allowedFileExtensions.has(extension);
    });

    projectFilesInput.setCustomValidity(
      invalidFiles.length
        ? 'Only STL, 3MF, STEP, STP, and OBJ files are accepted.'
        : ''
    );

    if (invalidFiles.length) projectFilesInput.reportValidity();
  });
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const viewport = carousel.querySelector('.carousel-viewport');
  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const count = carousel.querySelector('.carousel-count');
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  let activeIndex = 0;
  let pointerStart = null;
  let autoPlayTimer = null;
  let pointerIsOver = false;
  let focusIsWithin = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function stopAutoPlay() {
    window.clearTimeout(autoPlayTimer);
    autoPlayTimer = null;
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (reduceMotion || slides.length < 2 || pointerIsOver || focusIsWithin || document.hidden) return;
    autoPlayTimer = window.setTimeout(() => {
      showSlide(activeIndex + 1);
      startAutoPlay();
    }, 10000);
  }

  function showManualSlide(index) {
    showSlide(index);
    startAutoPlay();
  }

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => showManualSlide(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.querySelectorAll('video').forEach((video) => {
        video.tabIndex = isActive ? 0 : -1;
        if (!isActive) video.pause();
      });
    });

    dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === activeIndex)));
  }

  previous.addEventListener('click', () => showManualSlide(activeIndex - 1));
  next.addEventListener('click', () => showManualSlide(activeIndex + 1));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showManualSlide(activeIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showManualSlide(activeIndex + 1); }
  });

  carousel.addEventListener('pointerenter', () => {
    pointerIsOver = true;
    stopAutoPlay();
  });
  carousel.addEventListener('pointerleave', () => {
    pointerIsOver = false;
    startAutoPlay();
  });
  carousel.addEventListener('focusin', () => {
    focusIsWithin = true;
    stopAutoPlay();
  });
  carousel.addEventListener('focusout', (event) => {
    if (carousel.contains(event.relatedTarget)) return;
    focusIsWithin = false;
    startAutoPlay();
  });

  viewport.addEventListener('pointerdown', (event) => {
    if (event.target.closest('video')) return;
    pointerStart = event.clientX;
  });
  viewport.addEventListener('pointerup', (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    if (Math.abs(distance) > 45) showManualSlide(activeIndex + (distance < 0 ? 1 : -1));
    pointerStart = null;
  });
  viewport.addEventListener('pointercancel', () => { pointerStart = null; });

  slides.forEach((slide) => {
    slide.querySelectorAll('video').forEach((video) => {
      video.addEventListener('play', stopAutoPlay);
      video.addEventListener('pause', startAutoPlay);
      video.addEventListener('ended', startAutoPlay);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoPlay();
    else startAutoPlay();
  });

  showSlide(0);
  startAutoPlay();
});

document.querySelectorAll('[data-review-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.review-track');
  const viewport = carousel.querySelector('.review-viewport');
  const slides = [...carousel.querySelectorAll('.review-slide')];
  const dotsContainer = carousel.querySelector('.review-dots');
  const previous = carousel.querySelector('[data-review-prev]');
  const next = carousel.querySelector('[data-review-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let autoPlayTimer = null;
  let pointerStart = null;
  let pointerIsOver = false;
  let focusIsWithin = false;

  function showReview(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== activeIndex)));
    dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === activeIndex)));
  }

  function stopAutoPlay() {
    window.clearTimeout(autoPlayTimer);
    autoPlayTimer = null;
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (reduceMotion || slides.length < 2 || pointerIsOver || focusIsWithin || document.hidden) return;
    autoPlayTimer = window.setTimeout(() => {
      showReview(activeIndex + 1);
      startAutoPlay();
    }, 10000);
  }

  function showManualReview(index) {
    showReview(index);
    startAutoPlay();
  }

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to review ${index + 1}`);
    dot.addEventListener('click', () => showManualReview(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  previous.addEventListener('click', () => showManualReview(activeIndex - 1));
  next.addEventListener('click', () => showManualReview(activeIndex + 1));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showManualReview(activeIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showManualReview(activeIndex + 1); }
  });
  carousel.addEventListener('pointerenter', () => { pointerIsOver = true; stopAutoPlay(); });
  carousel.addEventListener('pointerleave', () => { pointerIsOver = false; startAutoPlay(); });
  carousel.addEventListener('focusin', () => { focusIsWithin = true; stopAutoPlay(); });
  carousel.addEventListener('focusout', (event) => {
    if (carousel.contains(event.relatedTarget)) return;
    focusIsWithin = false;
    startAutoPlay();
  });
  viewport.addEventListener('pointerdown', (event) => { pointerStart = event.clientX; });
  viewport.addEventListener('pointerup', (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    if (Math.abs(distance) > 45) showManualReview(activeIndex + (distance < 0 ? 1 : -1));
    pointerStart = null;
  });
  viewport.addEventListener('pointercancel', () => { pointerStart = null; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoPlay();
    else startAutoPlay();
  });

  showReview(0);
  startAutoPlay();
});

const interactiveTitle = document.querySelector('.interactive-title');
const dimensionalText = document.querySelector('.title-3d');

if (interactiveTitle && dimensionalText && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let animationFrame;

  interactiveTitle.addEventListener('pointermove', (event) => {
    const bounds = interactiveTitle.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));

    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => {
      dimensionalText.style.setProperty('--tilt-x', `${-y * 10}deg`);
      dimensionalText.style.setProperty('--tilt-y', `${x * 13}deg`);
      dimensionalText.style.setProperty('--move-x', `${x * 7}px`);
      dimensionalText.style.setProperty('--move-y', `${y * 4}px`);
      dimensionalText.style.setProperty('--shadow-x', `${-x * 7 + 4}px`);
      dimensionalText.style.setProperty('--shadow-y', `${-y * 6 + 4}px`);
    });
  });

  interactiveTitle.addEventListener('pointerleave', () => {
    dimensionalText.style.setProperty('--tilt-x', '0deg');
    dimensionalText.style.setProperty('--tilt-y', '0deg');
    dimensionalText.style.setProperty('--move-x', '0px');
    dimensionalText.style.setProperty('--move-y', '0px');
    dimensionalText.style.setProperty('--shadow-x', '4px');
    dimensionalText.style.setProperty('--shadow-y', '4px');
  });
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');

  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;

      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;

      const destination = new URL(link.href, window.location.href);
      const isInternal = destination.protocol === window.location.protocol && destination.host === window.location.host;
      if (!isInternal || destination.href === window.location.href) return;

      event.preventDefault();
      document.body.classList.add('page-leaving');
      window.setTimeout(() => { window.location.href = destination.href; }, 390);
    });
  });

  const revealItems = document.querySelectorAll(
    '.section-head, .card-grid, .project-grid, .process, .stats, .split, .timeline, .service-row, .contact-layout, .cta-box, .narrow > .quote, .footer-callout'
  );

  revealItems.forEach((item, index) => {
    item.classList.add('reveal-item');
    item.style.setProperty('--reveal-delay', `${(index % 3) * 55}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}
