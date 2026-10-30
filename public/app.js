(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('.scroll-progress');
  const glow = document.querySelector('.cursor-glow');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.desktop-nav');

  // SCROLL-DRIVEN PRELOADER
  const preloaderTrack = document.getElementById('preloader-track');
  const preloader = document.getElementById('preloader');
  const preloaderTitle = document.getElementById('preloader-title');
  const preloaderCounter = document.getElementById('preloader-counter');
  const preloaderProgressBar = document.getElementById('preloader-progress-bar');
  const preloaderStatus = document.getElementById('preloader-status');
  const scrollBtn = document.getElementById('preloader-scroll-btn');

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#*/";
  let lastStage = -1;
  let animFrameId = null;

  const interpolateText = (startWord, targetWord, factor) => {
    const maxLen = Math.max(startWord.length, targetWord.length);
    const resolvedIndex = Math.floor(factor * targetWord.length);
    let out = "";
    for (let i = 0; i < maxLen; i++) {
      if (i < resolvedIndex) {
        out += targetWord[i] || "";
      } else if (i < targetWord.length) {
        if (Math.random() < 0.3) {
          out += chars[Math.floor(Math.random() * chars.length)];
        } else {
          out += (startWord[i] || chars[Math.floor(Math.random() * chars.length)]);
        }
      }
    }
    return out || targetWord;
  };

  const handlePreloaderScroll = () => {
    if (!preloaderTrack || !preloader || reduceMotion) return;

    const trackHeight = Math.max(preloaderTrack.offsetHeight - window.innerHeight, 300);
    const scrollY = window.scrollY;
    const rawProgress = scrollY / trackHeight;
    const p = Math.min(Math.max(rawProgress, 0), 1);

    // 1. Percentage counter & progress bar
    const percentInt = Math.min(Math.floor(p * 100), 100);
    if (preloaderCounter) {
      preloaderCounter.textContent = String(percentInt).padStart(2, '0') + '%';
    }
    if (preloaderProgressBar) {
      preloaderProgressBar.style.width = percentInt + '%';
    }

    // 2. Text morphing based on scroll progress
    if (preloaderTitle) {
      if (p < 0.33) {
        // Stage 1: DHARUN KUMAR
        const stageP = p / 0.33;
        if (stageP < 0.05) {
          preloaderTitle.textContent = "DHARUN KUMAR";
        } else {
          preloaderTitle.textContent = interpolateText("DHARUN KUMAR", "DHARUN KUMAR", stageP);
        }
        if (preloaderStatus) preloaderStatus.textContent = "INITIALIZING ENVIRONMENT // DHARUN KUMAR";
      } else if (p < 0.68) {
        // Stage 2: DHARUN2712
        const stageP = (p - 0.33) / 0.35;
        preloaderTitle.textContent = interpolateText("DHARUN KUMAR", "DHARUN2712", stageP);
        if (preloaderStatus) preloaderStatus.textContent = "SYNCING GITHUB // github.com/Dharun2712";
      } else {
        // Stage 3: PORTFOLIO
        const stageP = Math.min((p - 0.68) / 0.22, 1);
        preloaderTitle.textContent = interpolateText("DHARUN2712", "PORTFOLIO", stageP);
        if (preloaderStatus) preloaderStatus.textContent = "SYSTEM READY // WELCOME TO PORTFOLIO";
      }
    }

    // 3. Smooth curtain transition (from p = 0.82 to 1.0)
    if (p >= 0.82) {
      const exitT = (p - 0.82) / 0.18;
      // Exponential curve for fluid exit feel
      const translateY = -(exitT * 100);
      preloader.style.transform = `translateY(${translateY}%)`;
      preloader.style.opacity = String(Math.max(1 - exitT * 0.2, 0));
    } else {
      preloader.style.transform = 'translateY(0%)';
      preloader.style.opacity = '1';
    }

    // 4. Past track visibility
    if (p >= 1) {
      preloader.classList.add('past-track');
      document.querySelectorAll('#home .reveal').forEach((el) => {
        el.classList.add('is-visible');
      });
    } else {
      preloader.classList.remove('past-track');
    }
  };

  const onScroll = () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(handlePreloaderScroll);
  };

  if (preloaderTrack && preloader) {
    window.addEventListener('scroll', onScroll, { passive: true });
    // Initialize state
    handlePreloaderScroll();

    // Scroll button click handler
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        const trackHeight = Math.max(preloaderTrack.offsetHeight - window.innerHeight, 300);
        window.scrollTo({
          top: trackHeight + 20,
          behavior: 'smooth'
        });
      });
    }
  }

  // SCROLL PROGRESS BAR (Main page)
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) {
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  // CURSOR GLOW
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches && glow) {
    window.addEventListener('pointermove', (event) => {
      glow.style.left = event.clientX + 'px';
      glow.style.top = event.clientY + 'px';
    }, { passive: true });
  }

  // REVEAL ON SCROLL
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  // MOBILE NAV TOGGLE
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  // SMOOTH SCROLLING FOR INTERNAL ANCHORS & CONTACT FOCUS
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

        // If clicking contact CTA, focus the first name input field
        if (href === '#contact' || href === '#contact-form-card') {
          setTimeout(() => {
            const nameInput = document.getElementById('user_name');
            if (nameInput) {
              nameInput.focus();
            }
          }, 450);
        }
      }
    });
  });


  // SCROLL-DRIVEN CARDS & PADDING PARALLAX ENGINE
  const scrollCards = document.querySelectorAll('.project, .exp-card, .edu-card');
  let cardTicking = false;

  const updateScrollCards = () => {
    if (reduceMotion) return;
    const windowH = window.innerHeight;

    scrollCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      // Skip cards far out of view
      if (rect.bottom < -120 || rect.top > windowH + 120) return;

      const cardCenter = rect.top + rect.height / 2;
      const distFromCenter = cardCenter - (windowH / 2);
      const progress = Math.max(-1, Math.min(1, distFromCenter / (windowH * 0.75)));

      // Staggered vertical parallax translation based on scroll
      const stagger = (index % 2 === 0) ? 0.05 : 0.035;
      const translateY = -(progress * 26 * (stagger * 20));
      const scale = 1 - Math.abs(progress) * 0.02;

      // Dynamic padding breathing based on proximity to viewport center
      const padExtra = Math.max(0, (1 - Math.abs(progress)) * 14);

      card.style.setProperty('--card-scroll-y', translateY.toFixed(1) + 'px');
      card.style.setProperty('--card-scroll-scale', scale.toFixed(3));
      card.style.setProperty('--scroll-pad-extra', padExtra.toFixed(1) + 'px');

      // Visual mockup parallax shift inside project cards
      const visual = card.querySelector('.project-visual');
      if (visual) {
        const visualParallax = progress * 20;
        visual.style.transform = 'translateY(' + visualParallax.toFixed(1) + 'px)';
      }
    });
    cardTicking = false;
  };

  const onCardsScroll = () => {
    if (!cardTicking) {
      requestAnimationFrame(updateScrollCards);
      cardTicking = true;
    }
  };

  window.addEventListener('scroll', onCardsScroll, { passive: true });
  window.addEventListener('resize', onCardsScroll, { passive: true });
  // Initial run
  updateScrollCards();


  // ── EMAILJS CONTACT FORM INTEGRATION ──
  const EMAILJS_CONFIG = {
    serviceId: 'service_7nit7q9',
    templateId: 'template_uvunkd5',
    publicKey: '6juMxNVsUyN8Lth0-'
  };

  // Initialize EmailJS with public key
  if (typeof emailjs !== 'undefined') {
    emailjs.init({
      publicKey: EMAILJS_CONFIG.publicKey
    });
  }

  const contactForm = document.getElementById('portfolio-contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusAlert = document.getElementById('form-status-alert');

  if (contactForm && submitBtn && statusAlert) {
    const nameInput = document.getElementById('user_name');
    const emailInput = document.getElementById('user_email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const subjectError = document.getElementById('subject-error');
    const messageError = document.getElementById('message-error');

    const clearFieldErrors = () => {
      [nameInput, emailInput, subjectInput, messageInput].forEach(inp => {
        if (inp) inp.classList.remove('is-invalid');
      });
      [nameError, emailError, subjectError, messageError].forEach(sp => {
        if (sp) sp.textContent = '';
      });
    };

    // Live validation clean-up on typing
    [
      { input: nameInput, error: nameError },
      { input: emailInput, error: emailError },
      { input: subjectInput, error: subjectError },
      { input: messageInput, error: messageError }
    ].forEach(({ input, error }) => {
      if (!input) return;
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        if (error) error.textContent = '';
      });
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors();
      statusAlert.style.display = 'none';

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const subjectVal = subjectInput ? subjectInput.value.trim() : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';

      let hasError = false;

      // 1. Full Name Validation
      if (!nameVal) {
        if (nameInput) nameInput.classList.add('is-invalid');
        if (nameError) nameError.textContent = 'Please enter your full name.';
        hasError = true;
      } else if (nameVal.length < 2) {
        if (nameInput) nameInput.classList.add('is-invalid');
        if (nameError) nameError.textContent = 'Name must be at least 2 characters.';
        hasError = true;
      }

      // 2. Email Address Validation
      if (!emailVal) {
        if (emailInput) emailInput.classList.add('is-invalid');
        if (emailError) emailError.textContent = 'Please enter your email address.';
        hasError = true;
      } else if (!emailRegex.test(emailVal)) {
        if (emailInput) emailInput.classList.add('is-invalid');
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        hasError = true;
      }

      // 3. Subject Validation
      if (!subjectVal) {
        if (subjectInput) subjectInput.classList.add('is-invalid');
        if (subjectError) subjectError.textContent = 'Please enter a subject.';
        hasError = true;
      } else if (subjectVal.length < 3) {
        if (subjectInput) subjectInput.classList.add('is-invalid');
        if (subjectError) subjectError.textContent = 'Subject must be at least 3 characters.';
        hasError = true;
      }

      // 4. Message Validation
      if (!messageVal) {
        if (messageInput) messageInput.classList.add('is-invalid');
        if (messageError) messageError.textContent = 'Please enter your message.';
        hasError = true;
      } else if (messageVal.length < 10) {
        if (messageInput) messageInput.classList.add('is-invalid');
        if (messageError) messageError.textContent = 'Message must be at least 10 characters.';
        hasError = true;
      }

      if (hasError) {
        const firstInvalid = contactForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Check if EmailJS SDK is loaded
      if (typeof emailjs === 'undefined') {
        showAlert('error', 'EmailJS SDK could not be loaded. Please email directly at dharunkumarm2005@gmail.com.');
        return;
      }

      // Set Loading State (Disables submit & inputs to prevent duplicate submissions)
      setFormLoading(true);

      const templateParams = {
        user_name: nameVal,
        user_email: emailVal,
        subject: subjectVal,
        message: messageVal
      };

      try {
        const response = await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams,
          EMAILJS_CONFIG.publicKey
        );

        if (response.status === 200 || response.text === 'OK') {
          showAlert(
            'success',
            `Thank you, <strong>${escapeHtml(nameVal)}</strong>! Your message has been sent successfully. I will get back to you soon.`
          );
          contactForm.reset();
        } else {
          throw new Error(response.text || 'EmailJS returned a non-200 status.');
        }
      } catch (err) {
        console.error('EmailJS Submission Error:', err);
        const errMsg = (err && err.text) ? err.text : 'Failed to send message.';
        showAlert(
          'error',
          `Oops! ${escapeHtml(errMsg)} Please try again or reach me directly at <a href="mailto:dharunkumarm2005@gmail.com" style="color:inherit;text-decoration:underline;">dharunkumarm2005@gmail.com</a>.`
        );
      } finally {
        setFormLoading(false);
      }
    });

    function setFormLoading(isLoading) {
      submitBtn.disabled = isLoading;
      [nameInput, emailInput, subjectInput, messageInput].forEach(inp => {
        if (inp) inp.disabled = isLoading;
      });
      if (isLoading) {
        submitBtn.classList.add('is-loading');
        const textSpan = submitBtn.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = 'SENDING...';
      } else {
        submitBtn.classList.remove('is-loading');
        const textSpan = submitBtn.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = 'SEND MESSAGE';
      }
    }

    function showAlert(type, htmlContent) {
      statusAlert.style.display = 'flex';
      statusAlert.className = `form-status-alert alert-${type}`;
      const icon = type === 'success' ? '✓' : '✕';
      statusAlert.innerHTML = `<span><strong>${icon}</strong></span> <div>${htmlContent}</div>`;
      statusAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m]));
    }
  }

})();