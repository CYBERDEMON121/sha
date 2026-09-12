/* ============================================
   THEOS IMPEX — Shared JavaScript
   ============================================ */

// Mark JS as enabled immediately (before DOMContentLoaded) so animations
// only hide content when JS is actually running.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // INTRO SCREEN (splash)
  // ============================================
  const introScreen = document.querySelector('.intro-screen');
  const introSkipBtn = document.querySelector('.intro-skip');
  function dismissIntro() {
    if (!introScreen) return;
    introScreen.classList.add('intro-fade-out');
    setTimeout(() => {
      introScreen.style.display = 'none';
      document.body.style.overflow = 'auto';
      initHeroAnimations();
    }, 500);
  }
  if (introScreen) {
    document.body.style.overflow = 'hidden';
    if (introSkipBtn) introSkipBtn.addEventListener('click', dismissIntro);
    // Auto-dismiss after progress bar (~3.5s)
    setTimeout(dismissIntro, 3800);
  }

  // ============================================
  // LOADER
  // ============================================
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        initHeroAnimations();
      }, 800);
    });
    // Fallback: hide loader after 3s
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
      initHeroAnimations();
    }, 3000);
  }

  // ============================================
  // NAVBAR
  // ============================================
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (navbar) {
      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    lastScroll = currentScroll;
  });

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Active link highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ============================================
  // SCROLL PROGRESS BAR
  // ============================================
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      scrollProgress.style.width = progress + '%';
    });
  }

  // ============================================
  // BACK TO TOP
  // ============================================
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ============================================
  const animElements = document.querySelectorAll('.anim');
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animElements.forEach(el => animObserver.observe(el));

  // ============================================
  // COUNTER ANIMATION
  // ============================================
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  // ============================================
  // PARTICLE SYSTEM
  // ============================================
  const particleContainers = document.querySelectorAll('.hero-particles');
  particleContainers.forEach(container => {
    createParticles(container, 30);
  });

  function createParticles(container, count) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: rgba(239, 200, 106, ${Math.random() * 0.35 + 0.06});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --tx: ${(Math.random() - 0.5) * 200}px;
        --ty: ${(Math.random() - 0.5) * 200}px;
        animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
        animation-delay: ${Math.random() * 10}s;
      `;
      container.appendChild(particle);
    }
  }

  // ============================================
  // PARALLAX
  // ============================================
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
        const yPos = -(window.pageYOffset * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // ============================================
  // SMOOTH REVEAL ON SCROLL (stagger children)
  // ============================================
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('visible');
          }, i * 100);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  staggerContainers.forEach(el => staggerObserver.observe(el));

  // ============================================
  // TILT EFFECT (3D cards)
  // ============================================
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  // ============================================
  // PAGE TRANSITIONS — Sailing ship splash
  // ============================================
  function buildShipTransition() {
    // Avoid duplicates
    let overlay = document.querySelector('.page-transition');
    if (overlay) {
      // Move existing/pre-rendered overlay to body if needed
      const ids = ['transitionRoutes', 'transitionShipSvg'];
      if (!ids.every(id => document.getElementById(id))) {
        overlay.innerHTML = shipOverlayHTML();
      }
      return overlay;
    }

    overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = shipOverlayHTML();
    document.body.appendChild(overlay);
    return overlay;
  }

  function shipOverlayHTML() {
    return `
      <div class="transition-ocean">
        <svg class="transition-routes" id="transitionRoutes" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice"></svg>
        <div class="transition-ship-wrap">
          <svg class="transition-ship" id="transitionShipSvg" viewBox="0 0 200 200" fill="none">
            <g transform="translate(100 96)">
              <ellipse cx="0" cy="34" rx="58" ry="12" fill="rgba(0,0,0,0.25)"/>
              <path d="M-46,20 L42,20 L64,6 L-46,6 Z" fill="#f5f7fa" stroke="#0e2a49" stroke-width="2"/>
              <path d="M-46,20 L42,20 L42,30 L-46,30 Z" fill="#e0bb63"/>
              <rect x="-22" y="-36" width="52" height="26" rx="3" fill="#123a63" stroke="#184c80" stroke-width="1.5"/>
              <rect x="-22" y="-36" width="52" height="26" rx="3" fill="url(#shipGrad)" opacity="0.5"/>
              <rect x="2" y="-58" width="8" height="22" fill="#0a1d33"/>
              <circle cx="6" cy="-64" r="7" fill="#e0bb63"/>
              <path d="M-16,-46 L86,-46 L42,-28 Z" fill="#fff" opacity="0.18"/>
            </g>
            <defs>
              <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#184c80"/>
                <stop offset="1" stop-color="#0a1d33"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="transition-label">Setting Sail</div>
      </div>
    `;
  }

  function drawTransitionRoutes() {
    const wrap = document.getElementById('transitionRoutes');
    if (!wrap) return;
    const W = 1200, H = 700;
    const cx = [W * 0.18, W * 0.82, W * 0.5, W * 0.3];
    const cy = [H * 0.2, H * 0.24, H * 0.32, H * 0.14];
    const origin = { x: W * 0.5, y: H * 0.55 };
    let svg = '';
    cx.forEach((px, i) => {
      const mx = (origin.x + px) / 2;
      const my = (origin.y + cy[i]) / 2 - 60;
      svg += `<path d="M${origin.x},${origin.y} Q${mx},${my} ${px},${cy[i]}" />`;
    });
    wrap.innerHTML = svg;
  }

  function goToPage(href) {
    const overlay = document.querySelector('.page-transition');
    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!overlay || isReduced) {
      window.location.href = href;
      return;
    }

    // Enter: ocean rises + ship sails up
    overlay.classList.add('is-active');
    document.body.classList.add('page-transitioning');
    drawTransitionRoutes();

    // Remember to play the reveal on the next page
    try { sessionStorage.setItem('theos-transition', '1'); } catch (e) {}

    setTimeout(() => {
      window.location.href = href;
    }, 850);
  }

  // If we just navigated here via the ship splash, play the reveal
  // (ocean slides down/away to unveil the freshly loaded page).
  function playEnterTransition() {
    const overlay = document.querySelector('.page-transition');
    if (!overlay) return;
    let shouldReveal = false;
    try {
      shouldReveal = sessionStorage.getItem('theos-transition') === '1';
      sessionStorage.removeItem('theos-transition');
    } catch (e) {}

    if (!shouldReveal) return;

    drawTransitionRoutes();

    // Start fully covered (ocean across, ship risen) — snapped instantly
    // so the page never flashes before the reveal begins.
    document.body.classList.add('page-transitioning');
    overlay.classList.add('no-anim', 'is-active');
    // Force the covered state to paint before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.remove('no-anim');
        overlay.classList.add('is-revealing');
        document.body.classList.remove('page-transitioning');
      });
    });

    // Cleanup after reveal completes
    setTimeout(() => {
      overlay.classList.remove('is-active', 'is-revealing');
    }, 1500);
  }

  buildShipTransition();

  playEnterTransition();

  // Hijack internal navigation links for the ship splash
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only same-page internal html links (skip anchors, external, mailto, tel)
    if (!href || !href.endsWith('.html') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    if (link.getAttribute('target') === '_blank') return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goToPage(href);
    });
  });

  // ============================================
  // HERO ANIMATIONS (triggered after loader)
  // ============================================
  function initHeroAnimations() {
    const heroElements = document.querySelectorAll('.hero-content .anim');
    heroElements.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, 200 + i * 150);
    });
  }

  // If no loader, trigger immediately
  if (!loader) {
    initHeroAnimations();
  }

  // ============================================
  // MAGNETIC BUTTONS
  // ============================================
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ============================================
  // TYPEWRITER EFFECT
  // ============================================
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const text = el.getAttribute('data-typewriter');
    const speed = parseInt(el.getAttribute('data-type-speed')) || 50;
    el.textContent = '';
    let i = 0;

    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    const typeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          type();
          typeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    typeObserver.observe(el);
  });

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================
  // HERO VIDEO PARALLAX
  // ============================================
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        heroVideo.style.transform = `scale(1.1) translateY(${scrolled * 0.15}px)`;
      }
    });
  }

  // ============================================
  // BUBBLES — Generate random bubbles in sections
  // ============================================
  document.querySelectorAll('.bubble-container').forEach(container => {
    for (let i = 0; i < 8; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      const size = Math.random() * 20 + 5;
      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.bottom = '-20px';
      bubble.style.animationDuration = (Math.random() * 10 + 8) + 's';
      bubble.style.animationDelay = (Math.random() * 8) + 's';
      container.appendChild(bubble);
    }
  });

  // ============================================
  // VIDEO FALLBACK — Show image if video fails
  // ============================================
  const heroVideoEl = document.querySelector('.hero-video');
  const heroFallback = document.querySelector('.hero-fallback');
  if (heroVideoEl && heroFallback) {
    heroVideoEl.addEventListener('error', () => {
      heroVideoEl.style.display = 'none';
      heroFallback.style.display = 'block';
    });
    // Also handle case where video source doesn't exist
    heroVideoEl.addEventListener('loadeddata', () => {
      heroFallback.style.display = 'none';
    });
  }

});
