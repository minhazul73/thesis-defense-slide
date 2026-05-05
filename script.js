/* ============================================
   THESIS PRE-DEFENSE — SLIDE CONTROLLER
   Keyboard nav · Progress · Smooth transitions
   ============================================ */

(function() {
  'use strict';

  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  const progressFill = document.getElementById('progressFill');
  const currentSlideEl = document.getElementById('currentSlide');
  const totalSlidesEl = document.getElementById('totalSlides');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentIndex = 0;

  // Initialize
  totalSlidesEl.textContent = totalSlides;
  updateUI();

  /* --------- Core navigation --------- */
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    slides[currentIndex].classList.remove('active');
    currentIndex = index;
    slides[currentIndex].classList.add('active');

    // Force scroll-to-top inside the slide for long content
    slides[currentIndex].scrollTop = 0;

    updateUI();
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  /* --------- UI sync --------- */
  function updateUI() {
    currentSlideEl.textContent = currentIndex + 1;
    const progress = ((currentIndex + 1) / totalSlides) * 100;
    progressFill.style.width = progress + '%';

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;

    // Re-trigger bar chart animations on results slide
    if (slides[currentIndex].dataset.slide === '14') {
      const bars = slides[currentIndex].querySelectorAll('.bar');
      bars.forEach((bar, i) => {
        bar.style.animation = 'none';
        // force reflow
        void bar.offsetWidth;
        bar.style.animation = `barFill 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s backwards`;
      });
    }
  }

  /* --------- Keyboard --------- */
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }

    // Number keys for direct navigation (1-9)
    if (/^[1-9]$/.test(e.key)) {
      const target = parseInt(e.key, 10) - 1;
      if (target < totalSlides) goToSlide(target);
    }
  });

  /* --------- Click navigation --------- */
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  /* --------- Touch / Swipe support --------- */
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < swipeThreshold) return;
    if (diff > 0) nextSlide();
    else prevSlide();
  }

  /* --------- Fullscreen toggle --------- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /* --------- Mouse-wheel slide change (debounced) --------- */
  let wheelTimeout = null;
  document.addEventListener('wheel', (e) => {
    if (wheelTimeout) return;
    if (Math.abs(e.deltaY) < 50) return;

    wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);

    if (e.deltaY > 0) nextSlide();
    else prevSlide();
  }, { passive: true });

  /* --------- Auto-hide nav hint after 5 seconds --------- */
  setTimeout(() => {
    const hint = document.querySelector('.nav-hint');
    if (hint) {
      hint.style.transition = 'opacity 1s ease';
      hint.style.opacity = '0.3';
    }
  }, 5000);

  /* --------- URL hash sync (optional, for deep linking) --------- */
  function updateHash() {
    history.replaceState(null, '', `#slide-${currentIndex + 1}`);
  }

  function loadFromHash() {
    const match = window.location.hash.match(/slide-(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10) - 1;
      if (target >= 0 && target < totalSlides) {
        goToSlide(target);
      }
    }
  }

  window.addEventListener('hashchange', loadFromHash);
  loadFromHash();

  // Update hash on slide change
  const originalGoToSlide = goToSlide;
  let hashTimeout;

  document.addEventListener('keydown', () => {
    if (hashTimeout) clearTimeout(hashTimeout);
    hashTimeout = setTimeout(updateHash, 200);
  });

  console.log('%cThesis Pre-Defense Presentation Loaded', 'color: #7d1d2c; font-size: 14px; font-weight: bold;');
  console.log('%cKeyboard: ← → navigate · Space = next · 1-9 jump · F = fullscreen · ESC = exit', 'color: #5a6c84; font-size: 11px;');
})();
