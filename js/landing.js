/* ============================================================
   PulseOS Landing Page JavaScript
   Particle system, scroll reveals, counters, smooth scrolling
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. PARTICLE SYSTEM — Canvas-based glowing dots
     Simulates stadium lights floating in the hero background
     ========================================================== */
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.animationId = null;

      /* Particle count: 65 for a balanced look */
      this.particleCount = 65;

      /* Maximum distance to draw connecting lines */
      this.connectionDistance = 140;

      /* Resize canvas to match container */
      this.resize();
      window.addEventListener('resize', () => this.resize());

      /* Track mouse for interactive parallax */
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });

      /* Create initial particles */
      this.createParticles();

      /* Start animation loop */
      this.animate();
    }

    /* Resize the canvas to fill its parent container */
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }

    /* Generate particles with random positions, velocities, and styles */
    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          /* Each particle gets a random accent color */
          color: this.getRandomColor(),
          /* Pulse phase for glowing animation */
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    }

    /* Returns one of the accent colors for particle variety */
    getRandomColor() {
      const colors = [
        '59, 130, 246',  /* Blue */
        '6, 182, 212',   /* Cyan */
        '139, 92, 246',  /* Purple */
        '16, 185, 129',  /* Green */
        '96, 165, 250',  /* Blue light */
        '34, 211, 238',  /* Cyan light */
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    /* Update particle positions and handle edge wrapping */
    updateParticles() {
      for (const p of this.particles) {
        /* Move particle */
        p.x += p.vx;
        p.y += p.vy;

        /* Pulse the opacity for a glowing effect */
        p.pulsePhase += p.pulseSpeed;
        p.currentOpacity = p.opacity + Math.sin(p.pulsePhase) * 0.15;

        /* Wrap around edges with padding */
        if (p.x < -20) p.x = this.canvas.width + 20;
        if (p.x > this.canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = this.canvas.height + 20;
        if (p.y > this.canvas.height + 20) p.y = -20;
      }
    }

    /* Draw connecting lines between nearby particles */
    drawConnections() {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.connectionDistance) {
            const opacity = (1 - dist / this.connectionDistance) * 0.12;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }

    /* Draw individual particles with glow */
    drawParticles() {
      for (const p of this.particles) {
        /* Outer glow */
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6);
        gradient.addColorStop(0, `rgba(${p.color}, ${p.currentOpacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        /* Core dot */
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.color}, ${p.currentOpacity})`;
        this.ctx.fill();
      }
    }

    /* Main animation loop */
    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.updateParticles();
      this.drawConnections();
      this.drawParticles();
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    /* Clean up the animation when not needed */
    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  /* ==========================================================
     2. SCROLL REVEAL — IntersectionObserver-based animations
     Adds 'visible' class when elements scroll into viewport
     ========================================================== */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            /* Once visible, stop observing — animation plays once */
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* ==========================================================
     3. COUNTER ANIMATION — Animate numbers from 0 to target
     Uses requestAnimationFrame for smooth 60fps animation
     ========================================================== */
  function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-counter]');

    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseFloat(el.getAttribute('data-counter'));
            const suffix = el.getAttribute('data-suffix') || '';
            const prefix = el.getAttribute('data-prefix') || '';
            const decimals = el.getAttribute('data-decimals')
              ? parseInt(el.getAttribute('data-decimals'))
              : 0;
            const duration = 2200; /* ms */

            animateCounter(el, target, prefix, suffix, decimals, duration);

            /* Only animate once */
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* Eased counter animation from 0 → target */
  function animateCounter(el, target, prefix, suffix, decimals, duration) {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      /* Ease-out cubic for a satisfying deceleration */
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = eased * target;
      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        /* Ensure exact final value */
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  /* ==========================================================
     4. SMOOTH SCROLL — For navigation anchor links
     ========================================================== */
  function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        const navHeight = document.querySelector('.landing-nav')?.offsetHeight || 80;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  /* ==========================================================
     5. NAVBAR SCROLL EFFECT — Background opacity on scroll
     ========================================================== */
  function initNavbarScroll() {
    const nav = document.querySelector('.landing-nav');
    if (!nav) return;

    let ticking = false;

    function updateNav() {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    });

    /* Initial check */
    updateNav();
  }

  /* ==========================================================
     6. PARALLAX EFFECT — Subtle movement on hero content
     ========================================================== */
  function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const rate = scrolled * 0.3;

          if (scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${rate}px)`;
            heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ==========================================================
     7. STAGGERED GRID ANIMATIONS — Add delays to grid children
     ========================================================== */
  function initStaggeredAnimations() {
    const grids = document.querySelectorAll('.stagger-children');

    grids.forEach((grid) => {
      const children = grid.children;
      for (let i = 0; i < children.length; i++) {
        children[i].style.transitionDelay = `${i * 0.08}s`;
      }
    });
  }

  /* ==========================================================
     8. MOBILE MENU TOGGLE
     ========================================================== */
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      toggle.classList.toggle('active');
    });
  }

  /* ==========================================================
     9. DIAGRAM NODE PULSE — Add subtle animation to diagram
     ========================================================== */
  function initDiagramAnimation() {
    const nodes = document.querySelectorAll('.diagram-node-circle');

    nodes.forEach((node, index) => {
      node.style.animation = `float-slow 4s ease-in-out ${index * 0.5}s infinite`;
    });
  }

  /* ==========================================================
     INITIALIZATION — Start everything when DOM is ready
     ========================================================== */
  function init() {
    /* Particle system on hero canvas */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
      new ParticleSystem(canvas);
    }

    /* All scroll-triggered features */
    initScrollReveal();
    initCounterAnimation();
    initSmoothScroll();
    initNavbarScroll();
    initParallax();
    initStaggeredAnimations();
    initMobileMenu();
    initDiagramAnimation();

    /* Log successful initialization */
    console.log(
      '%c⚡ PulseOS Landing Page Initialized',
      'color: #3b82f6; font-size: 14px; font-weight: bold;'
    );
  }

  /* Wait for DOM to be fully loaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
