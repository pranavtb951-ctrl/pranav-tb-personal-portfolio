/* ═══════════════════════════════════════════════════
   PRANAV — Portfolio JavaScript v2
   Editorial dark portfolio interactions + Canvas Scroll Sequence
   ═══════════════════════════════════════════════════ */

;(function () {
  'use strict';

  /* ── Project Showcase Data ────────────────────────── */
  const projects = [
    {
      title: 'Neon Dreamscape',
      category: 'AI Visual Art',
      tag: '04 // AI VISUAL ART',
      desc: 'AI-generated surreal landscape series exploring the boundary between reality and synthetic imagination. Iterative prompt engineering fused with post-production compositing to create otherworldly visual environments and light-reactive textures.',
      role: 'Creative Director & AI Artist',
      tools: 'Midjourney, Stable Diffusion, ComfyUI, Photoshop',
      year: '2026',
      link: '#',
    },
    {
      title: 'Liquid Chrome',
      category: '3D Animation',
      tag: '04 // 3D ANIMATION',
      desc: 'Seamlessly looping 3D animation of fluid chrome-like metallic forms. Procedural shaders and physics-driven simulations achieving hyper-realistic reflections, iridescent refractions, and organic motion choreography.',
      role: '3D Animator & Shader Artist',
      tools: 'Blender, Houdini, After Effects, Octane',
      year: '2026',
      link: '#',
    },
    {
      title: 'Rhythm & Flow',
      category: 'Video Editing',
      tag: '04 // VIDEO EDITING',
      desc: 'Dynamic music video edit with beat-synced cuts, stylized color grading, and kinetic typography. The edit rhythm mirrors the track\'s kinetic energy, blending narrative depth and abstract visual motifs.',
      role: 'Director, Editor & Colorist',
      tools: 'Premiere Pro, DaVinci Resolve, After Effects',
      year: '2026',
      link: '#',
    },
    {
      title: 'Brand Forge',
      category: 'Creative Design',
      tag: '04 // CREATIVE DESIGN',
      desc: 'Complete brand identity system — logo mark, typographic hierarchy, dark-mode design system, and multi-format application across digital and print for a future-forward creative technology collective.',
      role: 'Brand Designer & Art Director',
      tools: 'Figma, Illustrator, Photoshop, InDesign',
      year: '2025',
      link: '#',
    },
    {
      title: 'Synthetic Portraits',
      category: 'AI Visual Art',
      tag: '04 // AI VISUAL ART',
      desc: 'AI-enhanced editorial portrait series merging machine-generated procedural textures with studio fashion photography. Explores themes of digital identity and synthetic aesthetics.',
      role: 'AI Visual Artist',
      tools: 'Stable Diffusion, ComfyUI, Photoshop',
      year: '2026',
      link: '#',
    },
    {
      title: 'Abstract Spaces',
      category: '3D Animation',
      tag: '04 // 3D ANIMATION',
      desc: 'Immersive 3D walkthrough of an abstract architectural installation featuring impossible geometry and atmospheric volumetric fog. Designed as a meditative spatial audiovisual piece.',
      role: '3D Environment Artist',
      tools: 'Cinema 4D, Octane Render, After Effects',
      year: '2025',
      link: '#',
    },
  ];

  /* ── Loader ───────────────────────────────────────── */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('done'), 500);
      setTimeout(() => loader.remove(), 1100);
    });
  }

  /* ── Smooth Cursor Glow ───────────────────────────── */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorGlow.classList.add('visible');
    });

    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('visible');
    });

    (function animateGlow() {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      cursorGlow.style.left = gx + 'px';
      cursorGlow.style.top = gy + 'px';
      requestAnimationFrame(animateGlow);
    })();
  }

  /* ── Header & Navigation ──────────────────────────── */
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    }
  }, { passive: true });

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Smooth Anchor Scroll with Fixed Nav Offset ───── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navOffset = 70;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  /* ═══════════════════════════════════════════════════
     FIXED SEQUENTIAL FRAME CANVAS CONTROLLER
     Scrub 287 frames (1000 - 1286) smoothly on scroll
     ═══════════════════════════════════════════════════ */
  const canvas = document.getElementById('heroCanvas');
  const fixedPortraitStage = document.getElementById('fixedPortraitStage');
  const fixedPortraitHud = document.getElementById('fixedPortraitHud');
  const hudFrame = document.getElementById('hudFrame');
  const hudProgress = document.getElementById('hudProgress');
  const heroProgressBar = document.getElementById('heroProgressBar');
  const heroTrack = document.getElementById('hero');
  const phase1 = document.getElementById('heroPhase1');
  const phase2 = document.getElementById('heroPhase2');
  const phase3 = document.getElementById('heroPhase3');

  if (canvas && heroTrack) {
    const ctx = canvas.getContext('2d');
    const FRAME_COUNT = 287;
    const images = new Array(FRAME_COUNT);
    let currentRenderedIndex = -1;
    let targetIndex = 0;
    let smoothIndex = 0;
    let isTicking = false;

    // Frame asset URL helper for 287 isolated frames (000 to 286) with cache bust
    const getFrameUrl = (idx) => `/publicimages/Man_posing_in_suit_ad591e1f${String(idx).padStart(3, '0')}.png?v=57`;

    // Smart draw preserving aspect ratio (Zero Bounding Box, Full Bleed)
    function drawFrame(img) {
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const imgRatio = iw / ih;
      const canvasRatio = cw / ch;

      let dw, dh, dx, dy;
      if (imgRatio > canvasRatio) {
        dh = ch;
        dw = ch * imgRatio;
        dx = (cw - dw) / 2;
        dy = 0;
      } else {
        dw = cw;
        dh = cw / imgRatio;
        dx = 0;
        dy = (ch - dh) / 2;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Render frame by index with outward fallback for nearest loaded frame
    function renderFrame(index) {
      index = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(index)));
      if (index === currentRenderedIndex && images[index]) return;

      if (images[index] && images[index].complete && images[index].naturalWidth > 0) {
        drawFrame(images[index]);
        currentRenderedIndex = index;
      } else {
        for (let offset = 1; offset < FRAME_COUNT; offset++) {
          const prev = index - offset;
          if (prev >= 0 && images[prev] && images[prev].complete && images[prev].naturalWidth > 0) {
            drawFrame(images[prev]);
            currentRenderedIndex = prev;
            break;
          }
          const next = index + offset;
          if (next < FRAME_COUNT && images[next] && images[next].complete && images[next].naturalWidth > 0) {
            drawFrame(images[next]);
            currentRenderedIndex = next;
            break;
          }
        }
      }

      // Update HUD frame pill
      if (hudFrame) {
        hudFrame.textContent = `FRAME ${String(index + 1).padStart(3, '0')} // ${FRAME_COUNT}`;
      }
    }

    // High-DPI canvas resizing
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        if (currentRenderedIndex >= 0 && images[currentRenderedIndex]) {
          drawFrame(images[currentRenderedIndex]);
        }
      }
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Load initial frame 0 immediately and start preloading buffer
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    images[0] = firstImg;
    if (firstImg.complete && firstImg.naturalWidth > 0) {
      renderFrame(0);
    } else {
      firstImg.onload = () => renderFrame(0);
    }
    preloadFrames();

    // Prioritized progressive preloading
    function preloadFrames() {
      const priorityQueue = [];
      for (let i = 0; i < FRAME_COUNT; i += 4) {
        if (!images[i]) priorityQueue.push(i);
      }
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (!images[i] && !priorityQueue.includes(i)) priorityQueue.push(i);
      }

      let activeDownloads = 0;
      const MAX_CONCURRENT = 8;

      function loadNext() {
        while (activeDownloads < MAX_CONCURRENT && priorityQueue.length > 0) {
          const idx = priorityQueue.shift();
          activeDownloads++;
          const img = new Image();
          img.src = getFrameUrl(idx);
          images[idx] = img;
          img.onload = img.onerror = () => {
            activeDownloads--;
            if (Math.abs(smoothIndex - idx) <= 1) {
              renderFrame(smoothIndex);
            }
            loadNext();
          };
        }
      }
      loadNext();
    }

    // Scroll update loop
    function onScrollUpdate() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentY = window.scrollY || window.pageYOffset;
      const totalProgress = docHeight > 0 ? Math.max(0, Math.min(1, currentY / docHeight)) : 0;

      // 1. Progress Bar & Scroll Percentage HUD
      if (heroProgressBar) {
        heroProgressBar.style.width = `${(totalProgress * 100).toFixed(1)}%`;
      }
      if (hudProgress) {
        hudProgress.textContent = `${Math.round(totalProgress * 100)}% SCROLL`;
      }

      // 2. Sequential frame scrub based on hero track
      const rect = heroTrack.getBoundingClientRect();
      const heroDist = heroTrack.offsetHeight - window.innerHeight;
      let heroProgress = 0;
      if (heroDist > 0) {
        heroProgress = Math.max(0, Math.min(1, -rect.top / heroDist));
      }

      targetIndex = heroProgress * (FRAME_COUNT - 1);

      // 3. Hero content phases transition
      if (phase1 && phase2 && phase3) {
        if (heroProgress < 0.33) {
          phase1.classList.add('hero-phase--active');
          phase2.classList.remove('hero-phase--active');
          phase3.classList.remove('hero-phase--active');
        } else if (heroProgress < 0.67) {
          phase1.classList.remove('hero-phase--active');
          phase2.classList.add('hero-phase--active');
          phase3.classList.remove('hero-phase--active');
        } else {
          phase1.classList.remove('hero-phase--active');
          phase2.classList.remove('hero-phase--active');
          phase3.classList.add('hero-phase--active');
        }
      }

      // 4. Smoothly hide fixed canvas when entering Projects & Contact for clean card viewing
      const projectsSec = document.getElementById('projects');
      if (projectsSec && fixedPortraitStage) {
        const pRect = projectsSec.getBoundingClientRect();
        if (pRect.top <= window.innerHeight * 0.45) {
          fixedPortraitStage.classList.add('fixed-portrait-stage--hidden');
          if (fixedPortraitHud) fixedPortraitHud.style.opacity = '0';
        } else {
          fixedPortraitStage.classList.remove('fixed-portrait-stage--hidden');
          if (fixedPortraitHud) fixedPortraitHud.style.opacity = '1';
        }
      }

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(animateCanvas);
      }
    }

    function animateCanvas() {
      const diff = targetIndex - smoothIndex;
      if (Math.abs(diff) > 0.02) {
        smoothIndex += diff * 0.28;
        renderFrame(smoothIndex);
        requestAnimationFrame(animateCanvas);
      } else {
        smoothIndex = targetIndex;
        renderFrame(smoothIndex);
        isTicking = false;
      }
    }

    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    window.addEventListener('resize', onScrollUpdate, { passive: true });
    onScrollUpdate();
  }

  /* ── Scroll-Triggered Reveal Animations ───────────── */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseFloat(entry.target.dataset.delay) || 0;
            entry.target.style.transitionDelay = delay + 's';
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  /* ── Interactive Project Detail Modal ─────────────── */
  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag = document.getElementById('modalTag');
  const modalDesc = document.getElementById('modalDesc');
  const modalRole = document.getElementById('modalRole');
  const modalTools = document.getElementById('modalTools');
  const modalYear = document.getElementById('modalYear');
  const modalActionLink = document.getElementById('modalActionLink');
  const modalMediaLabel = document.getElementById('modalMediaLabel');

  function openProjectModal(index) {
    const p = projects[index];
    if (!p || !modal) return;

    if (modalTitle) modalTitle.textContent = p.title;
    if (modalTag) modalTag.textContent = p.tag;
    if (modalDesc) modalDesc.textContent = p.desc;
    if (modalRole) modalRole.textContent = p.role;
    if (modalTools) modalTools.textContent = p.tools;
    if (modalYear) modalYear.textContent = p.year;
    if (modalActionLink) modalActionLink.href = p.link || '#';
    if (modalMediaLabel) modalMediaLabel.textContent = `${p.title} Preview`;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-card__link-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.project, 10);
      openProjectModal(idx);
    });
  });

  document.querySelectorAll('.project-card').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const btn = card.querySelector('.project-card__link-btn');
      if (btn && btn.dataset.project !== undefined) {
        openProjectModal(parseInt(btn.dataset.project, 10));
      }
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeProjectModal();
    }
  });

  /* ── Copy Email to Clipboard with Interactive Feedback */
  const copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    const originalHTML = copyBtn.innerHTML;
    copyBtn.addEventListener('click', () => {
      const email = 'hello@pranav.design';
      navigator.clipboard.writeText(email).then(
        () => {
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Copied!
          `;
          copyBtn.style.borderColor = 'var(--accent)';
          copyBtn.style.color = 'var(--white)';
          copyBtn.style.background = 'rgba(225, 29, 72, 0.2)';

          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
            copyBtn.style.background = '';
          }, 2400);
        },
        () => {
          window.location.href = `mailto:${email}`;
        }
      );
    });
  }

  /* ── Background Subtle Parallax on Achievements ───── */
  const achievementsBg = document.querySelector('.achievements__bg');
  if (achievementsBg) {
    window.addEventListener('scroll', () => {
      const rect = achievementsBg.parentElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight - rect.top) * 0.06;
        achievementsBg.style.transform = `translateY(calc(-50% + ${offset}px))`;
      }
    }, { passive: true });
  }

})();
