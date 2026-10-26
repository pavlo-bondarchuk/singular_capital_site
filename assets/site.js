'use strict';

const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const mobileViewport = window.matchMedia('(max-width: 760px)');

if (menuButton && siteNav) {
  const setMenuState = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    const menuIcon = menuButton.querySelector('.icon use');
    if (menuIcon) {
      const sprite = menuIcon.getAttribute('href').split('#')[0];
      menuIcon.setAttribute('href', sprite + (open ? '#x' : '#menu'));
    }
    siteNav.dataset.collapsed = String(!open);
  };

  const syncMenu = () => {
    if (mobileViewport.matches) {
      setMenuState(false);
    } else {
      menuButton.setAttribute('aria-expanded', 'false');
      siteNav.removeAttribute('data-collapsed');
    }
  };

  menuButton.hidden = false;
  syncMenu();
  menuButton.addEventListener('click', () => {
    setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  siteNav.addEventListener('click', (event) => {
    if (mobileViewport.matches && event.target.closest('a')) setMenuState(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileViewport.matches && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenuState(false);
      menuButton.focus();
    }
  });
  mobileViewport.addEventListener('change', syncMenu);
}

const gallery = document.querySelector('[data-gallery]');
const galleryControls = document.querySelector('.gallery-controls');
const galleryCards = gallery ? [...gallery.querySelectorAll('.service-card')] : [];
const galleryButtons = galleryControls ? [...galleryControls.querySelectorAll('[data-gallery-direction]')] : [];
const currentCount = document.querySelector('[data-gallery-current]');

if (gallery && galleryControls && galleryCards.length && galleryButtons.length) {
  const updateGallery = () => {
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    galleryButtons.forEach((button) => {
      const direction = Number(button.dataset.galleryDirection);
      button.disabled = direction < 0 ? gallery.scrollLeft <= 2 : gallery.scrollLeft >= maxScroll - 2;
    });
    const viewportLeft = gallery.getBoundingClientRect().left;
    const firstVisible = galleryCards.findIndex((card) => card.getBoundingClientRect().right > viewportLeft + 2);
    if (currentCount) currentCount.textContent = String(Math.max(1, firstVisible + 1)).padStart(2, '0');
  };

  galleryControls.hidden = false;
  galleryButtons.forEach((button) => button.addEventListener('click', () => {
    const direction = Number(button.dataset.galleryDirection);
    const gap = Number.parseFloat(getComputedStyle(gallery.querySelector('.services-track')).gap) || 13;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gallery.scrollBy({ left: direction * (galleryCards[0].getBoundingClientRect().width + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  gallery.addEventListener('scroll', updateGallery, { passive: true });
  window.addEventListener('resize', updateGallery, { passive: true });
  updateGallery();
}


const serviceImage = document.querySelector('[data-service-image]');
const serviceSections = [...document.querySelectorAll('.service-detail[data-service-panel]')];
if (serviceImage && serviceSections.length) {
  const validHashSection = () => serviceSections.find((section) => `#${section.id}` === window.location.hash);
  let activeSection = null;
  let hashLockedSection = validHashSection();
  let scrollFrame = 0;
  let photoFrame = 0;

  const showServicePhoto = (section) => {
    if (!section || section === activeSection) return;
    activeSection = section;
    const figure = serviceImage.querySelector('.architectural-image');
    serviceImage.dataset.photoChanging = 'true';
    figure.style.setProperty('--service-panel', section.dataset.servicePanel);
    if (photoFrame) cancelAnimationFrame(photoFrame);
    photoFrame = requestAnimationFrame(() => {
      photoFrame = requestAnimationFrame(() => {
        delete serviceImage.dataset.photoChanging;
        photoFrame = 0;
      });
    });
  };

  const syncServicePhoto = () => {
    scrollFrame = 0;
    // Keep an explicit/deep link selected until the visitor starts scrolling manually.
    if (hashLockedSection) {
      showServicePhoto(hashLockedSection);
      return;
    }
    const activationLine = Math.min(320, Math.max(180, window.innerHeight * 0.32));
    let current = serviceSections[0];
    for (const section of serviceSections) {
      if (section.getBoundingClientRect().top <= activationLine) current = section;
      else break;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
      current = serviceSections[serviceSections.length - 1];
    }
    showServicePhoto(current);
  };

  const scheduleServiceSync = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncServicePhoto);
  };

  // Set a direct/deep link's image before the browser's restored anchor position is measured.
  showServicePhoto(hashLockedSection || serviceSections[0]);
  const releaseHashLock = () => {
    if (!hashLockedSection) return;
    hashLockedSection = null;
    scheduleServiceSync();
  };
  window.addEventListener('wheel', releaseHashLock, { passive: true });
  window.addEventListener('touchmove', releaseHashLock, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
      releaseHashLock();
    }
  });
  window.addEventListener('pointerdown', (event) => {
    // Allow a visitor to drag the browser's vertical scrollbar out of anchor lock.
    if (event.clientX >= document.documentElement.clientWidth) releaseHashLock();
  }, { passive: true });
  window.addEventListener('scroll', scheduleServiceSync, { passive: true });
  window.addEventListener('resize', scheduleServiceSync, { passive: true });
  window.addEventListener('pageshow', () => {
    // Back/forward cache restores the current position; remeasure that position.
    scheduleServiceSync();
  });
  window.addEventListener('hashchange', () => {
    hashLockedSection = validHashSection();
    if (hashLockedSection) showServicePhoto(hashLockedSection);
    requestAnimationFrame(scheduleServiceSync);
  });
  window.addEventListener('load', scheduleServiceSync, { once: true });
  scheduleServiceSync();
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let headingObserver;
const revealHeadings = () => {
  if (headingObserver) headingObserver.disconnect();
  const headings = [...document.querySelectorAll('.page-intro h1, main h2')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    headings.forEach((heading) => heading.classList.add('is-revealed'));
    return;
  }
  headingObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  headings.forEach((heading) => {
    heading.classList.remove('scroll-reveal', 'is-revealed');
    // Keep the initial viewport and hash targets visible while observing later headings.
    const rect = heading.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      heading.classList.add('is-revealed');
    } else {
      heading.classList.add('scroll-reveal');
      headingObserver.observe(heading);
    }
  });
};

revealHeadings();
reducedMotion.addEventListener('change', revealHeadings);
