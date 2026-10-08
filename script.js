/**
 * IRFANUR RAHMAN — PORTFOLIO RUNTIME ENGINE
 * Inspired by Dennis Snellenberg, Yasio, Renaud Rohlinger, Adham Dannaway & Alice Lee
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Dennis Snellenberg Style Preloader
  // ==========================================
  (function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const words = preloader.querySelectorAll('.preloader-word');
    let currentIndex = 0;

    const wordInterval = setInterval(() => {
      words[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % words.length;
      words[currentIndex].classList.add('active');
    }, 180);

    // End preloader after sequence
    setTimeout(() => {
      clearInterval(wordInterval);
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 750);
    }, 1200);
  })();

  // ==========================================
  // 2. Live Dhaka, Bangladesh Real-Time Clock
  // ==========================================
  (function initLiveClock() {
    const clockElem = document.getElementById('liveDhakaTime');
    if (!clockElem) return;

    function updateClock() {
      try {
        const now = new Date();
        const options = {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
        clockElem.textContent = `${timeString} GMT+6`;
      } catch (e) {
        // Fallback calculation for GMT+6
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const dhakaDate = new Date(utc + (3600000 * 6));
        clockElem.textContent = dhakaDate.toLocaleTimeString() + ' GMT+6';
      }
    }

    updateClock();
    setInterval(updateClock, 1000);
  })();

  // ==========================================
  // 3. Renaud Rohlinger Ambient Particle Constellation Canvas
  // ==========================================
  (function initAmbientCanvas() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.8 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 1.5;
            this.y -= (dy / distance) * force * 1.5;
          }
        }
      }

      draw() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        ctx.fillStyle = isDark ? 'rgba(165, 180, 252, 0.45)' : 'rgba(99, 102, 241, 0.35)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let particles = [];
    const count = Math.min(Math.floor((width * height) / 18000), 65);

    function initParticles() {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();

    function animate() {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const lineColor = isDark ? 'rgba(99, 102, 241,' : 'rgba(79, 70, 229,';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.strokeStyle = `${lineColor} ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }
    animate();
  })();

  // ==========================================
  // 4. Mouse Spotlight Coordinates (Renaud Rohlinger Style)
  // ==========================================
  (function initCardSpotlights() {
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    spotlightCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  })();

  // ==========================================
  // 5. Yasio 3D Card Tilt Physics
  // ==========================================
  (function initCardTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    // Disable on touch devices for performance
    if (window.matchMedia('(hover: none)').matches) return;

    tiltCards.forEach((card) => {
      const glare = card.querySelector('.card-glare');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;

        if (glare) {
          glare.style.opacity = '1';
          glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12), transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (glare) {
          glare.style.opacity = '0';
        }
      });
    });
  })();

  // ==========================================
  // 6. Dennis Snellenberg Magnetic Cursor Physics
  // ==========================================
  (function initMagneticTargets() {
    if (window.matchMedia('(hover: none)').matches) return;

    const targets = document.querySelectorAll('.magnetic-target');
    targets.forEach((target) => {
      target.addEventListener('mousemove', (e) => {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        // Stronger magnetic pull for circular giant button, subtle for small buttons
        const factor = target.classList.contains('giant-magnetic-btn') ? 0.35 : 0.22;
        target.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });

      target.addEventListener('mouseleave', () => {
        target.style.transform = 'translate(0px, 0px)';
      });
    });
  })();

  // ==========================================
  // 7. Adham Dannaway Dual Persona Switcher
  // ==========================================
  (function initPersonaSwitcher() {
    const personaButtons = document.querySelectorAll('.persona-btn');
    const heroDynamicText = document.getElementById('heroDynamicText');

    const personaDescriptions = {
      all: `Hi, I'm <strong>Irfanur Rahman</strong>. BBA graduate in <strong>Finance & Supply Chain Management</strong> from <strong>BRAC University</strong> with corporate accounting experience at <strong>Square Toiletries Ltd</strong>. I bridge operational finance with modern software engineering—directing AI systems to architect practical tools that eliminate business bottlenecks, including <strong>PROBAHO CRM Solutions</strong>.`,
      finance: `Focusing on corporate discipline: BBA graduate in <strong>Finance & Supply Chain Management</strong> from <strong>BRAC University</strong>. Experienced in managing <strong>Oracle ERP</strong> general ledger entries, performing <strong>bank & trial balance reconciliations</strong> at <strong>Square Toiletries Ltd</strong>, and modeling cross-border working capital cycles.`,
      tech: `Focusing on modern engineering: Creator of <strong>PROBAHO CRM Solutions</strong>—an offline-first enterprise desktop application built with <strong>Electron 43</strong>, <strong>React 19</strong>, and embedded <strong>SQLite3 WebAssembly</strong>. Delivering sub-millisecond query performance, 64-district Bangladesh logistics automation, and GitHub CDN auto-updating.`
    };

    personaButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        personaButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const selected = btn.getAttribute('data-persona-select');
        document.body.setAttribute('data-persona', selected);

        if (heroDynamicText && personaDescriptions[selected]) {
          heroDynamicText.style.opacity = '0';
          setTimeout(() => {
            heroDynamicText.innerHTML = personaDescriptions[selected];
            heroDynamicText.style.opacity = '1';
          }, 150);
        }
      });
    });
  })();

  // ==========================================
  // 8. Work Category Filtering (Alice Lee & Snellenberg)
  // ==========================================
  (function initProjectFilters() {
    const filterPills = document.querySelectorAll('.filter-pill');
    const projects = document.querySelectorAll('[data-project-category]');

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const filterValue = pill.getAttribute('data-filter');

        projects.forEach((proj) => {
          const categories = proj.getAttribute('data-project-category').split(' ');
          if (filterValue === 'all' || categories.includes(filterValue)) {
            proj.style.display = '';
            proj.style.opacity = '1';
          } else {
            proj.style.display = 'none';
          }
        });
      });
    });
  })();

  // ==========================================
  // 9. Systems Lab: Tab Switching & Simulator Logic
  // ==========================================
  (function initSystemsLab() {
    const tabButtons = document.querySelectorAll('.lab-tab-btn');
    const tabContents = {
      code: document.getElementById('tabContentCode'),
      simulator: document.getElementById('tabContentSimulator'),
      specs: document.getElementById('tabContentSpecs')
    };

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-lab-tab');
        Object.keys(tabContents).forEach((key) => {
          if (tabContents[key]) {
            tabContents[key].classList.toggle('active', key === targetTab);
          }
        });
      });
    });

    // Copy TypeScript code button
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', async () => {
        const codeElem = document.querySelector('.terminal-body code');
        if (codeElem) {
          try {
            await navigator.clipboard.writeText(codeElem.innerText);
            const orig = copyCodeBtn.innerText;
            copyCodeBtn.innerText = 'Copied to Clipboard!';
            setTimeout(() => (copyCodeBtn.innerText = orig), 2000);
          } catch (e) {
            copyCodeBtn.innerText = 'Copied!';
            setTimeout(() => (copyCodeBtn.innerText = 'Copy TypeScript Spec'), 2000);
          }
        }
      });
    }

    // Working Capital & COD Simulator Calculation
    const volumeSlider = document.getElementById('orderVolumeSlider');
    const valueSlider = document.getElementById('orderValueSlider');
    const cycleSlider = document.getElementById('courierCycleSlider');

    const volumeVal = document.getElementById('orderVolumeVal');
    const valueVal = document.getElementById('orderValueVal');
    const cycleVal = document.getElementById('courierCycleVal');

    const lockedCapitalVal = document.getElementById('lockedCapitalVal');
    const freedCapitalVal = document.getElementById('freedCapitalVal');

    function calculateWorkingCapital() {
      if (!volumeSlider || !valueSlider || !cycleSlider) return;

      const monthlyVolume = parseInt(volumeSlider.value, 10);
      const avgValue = parseInt(valueSlider.value, 10);
      const days = parseInt(cycleSlider.value, 10);

      volumeVal.textContent = `${monthlyVolume.toLocaleString()} orders`;
      valueVal.textContent = `৳ ${avgValue.toLocaleString()}`;
      cycleVal.textContent = `${days} Days`;

      // Daily Gross Merchandise Value (GMV)
      const dailyGMV = (monthlyVolume * avgValue) / 30;

      // Trapped Capital in Courier Custody = Daily GMV * Settlement Cycle Days
      const lockedCapital = Math.round(dailyGMV * days);

      // Accelerated Liquidity = Difference between manual courier delay and PROBAHO optimized cycle (target 2-3 days)
      const optimizedDays = Math.min(days, 3);
      const freedCapital = Math.round(dailyGMV * (days - optimizedDays));

      lockedCapitalVal.textContent = `৳ ${lockedCapital.toLocaleString()}`;
      freedCapitalVal.textContent = `৳ ${freedCapital.toLocaleString()}`;
    }

    if (volumeSlider && valueSlider && cycleSlider) {
      volumeSlider.addEventListener('input', calculateWorkingCapital);
      valueSlider.addEventListener('input', calculateWorkingCapital);
      cycleSlider.addEventListener('input', calculateWorkingCapital);
      calculateWorkingCapital();
    }
  })();

  // ==========================================
  // 10. Dark / Light Theme Toggle
  // ==========================================
  (function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggle');
    const root = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);

    function updateThemeMeta(theme) {
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute('content', theme === 'dark' ? '#06080d' : '#F7F7F9');
    }
    updateThemeMeta(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeMeta(next);
      });
    }
  })();

  // ==========================================
  // 11. Copy Email to Clipboard
  // ==========================================
  (function initEmailCopy() {
    const copyBtn = document.getElementById('copyEmailBtn');
    const copyText = document.getElementById('copyText');
    const email = 'irfanur6@gmail.com';

    if (copyBtn && copyText) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(email);
          const orig = copyText.textContent;
          copyText.textContent = 'Copied!';
          copyBtn.style.borderColor = 'var(--accent-finance)';
          setTimeout(() => {
            copyText.textContent = orig;
            copyBtn.style.borderColor = '';
          }, 2000);
        } catch (err) {
          const textarea = document.createElement('textarea');
          textarea.value = email;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyText.textContent = 'Copied!';
          setTimeout(() => (copyText.textContent = 'Copy Address'), 2000);
        }
      });
    }
  })();

  // ==========================================
  // 12. Active Scroll Spy
  // ==========================================
  (function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links .nav-item');

    function updateSpy() {
      const scrollPos = window.scrollY + 140;

      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', updateSpy, { passive: true });
    updateSpy();
  })();

});
