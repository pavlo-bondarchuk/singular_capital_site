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
