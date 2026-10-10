/**
 * IRFANUR RAHMAN — PORTFOLIO RUNTIME ENGINE
 * Alice Lee (byalicelee.com) Design System
 * Interactive Features: Case Study Modal, Scroll-Spy, and Resilient Email Copy
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Scroll-Spy Navigation Highlighter
  // ==========================================================================
  (function initScrollSpy() {
    const navLinks = document.querySelectorAll('.header-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (!navLinks.length || !sections.length) return;

    function onScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const headerOffset = 140; // Accounts for sticky header height & buffer

      let currentSectionId = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - headerOffset;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      // If at bottom of page, highlight contact
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        currentSectionId = 'contact';
      }

      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on initial load
    onScroll();
  })();

  // ==========================================================================
  // 2. Interactive Case Study Modal Dialog
  // ==========================================================================
  (function initCaseStudyModals() {
    const modal = document.getElementById('caseStudyModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBodyContent = document.getElementById('modalBodyContent');
    const triggerButtons = document.querySelectorAll('[data-modal]');

    const caseStudyData = {
      'modal-probaho': {
        title: 'PROBAHO CRM Solutions',
        tagline: 'Offline-First Enterprise Business Management & Retail Showroom Operations Platform',
        metrics: [
          { value: '< 1ms', label: 'Local Query Latency' },
          { value: '100%', label: 'Offline Checkout Uptime' },
          { value: '64', label: 'BD Districts Logistics' }
        ],
        problem: 'Fast-paced retail showrooms, apparel chains, and wholesale distributors across Bangladesh face chronic broadband instability. Cloud-dependent CRMs freeze cash registers at counter checkout, causing severe transaction bottlenecks, lost sales, and manual bookkeeping chaos during internet outages.',
        architecture: 'Engineered a resilient desktop architecture powered by Electron 43 and React 19. Embedded an in-process SQLite 3 WebAssembly engine (sql.js) with local-file persistence, eliminating external database dependencies. Business operations execute locally in sub-milliseconds with absolute data sovereignty and local JSON/SQLite cryptographic export backups.',
        capabilities: 'Features native integration profiles for Pathao, Steadfast, RedX, Paperfly, Sundarban, and eCourier with automated COD remittance and return deduction reconciliation. Delivers background release streaming via GitHub Releases CDN with real-time download progress and 1-click silent relaunch, thermal receipt generation, hardware barcode scanning, and Role-Based Access Control (Admin vs. Staff) with immutable audit stamps.',
        links: [
          { text: 'View Repository on GitHub', url: 'https://github.com/GlichPoP/probaho-crm', primary: true },
          { text: 'Download Windows Installer (.exe)', url: 'https://github.com/GlichPoP/probaho-crm/releases', primary: false }
        ]
      }
    };

    function openModal(modalKey) {
      const data = caseStudyData[modalKey];
      if (!data || !modal || !modalBodyContent) return;

      const metricsHtml = data.metrics ? `
        <div class="modal-metrics-grid">
          ${data.metrics.map(m => `
            <div class="modal-metric-card">
              <span class="modal-metric-num">${m.value}</span>
              <span class="modal-metric-label">${m.label}</span>
            </div>
          `).join('')}
        </div>
      ` : '';

      const linksHtml = data.links ? data.links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${link.primary ? 'btn-alice-primary' : 'btn-alice-secondary'}">
          ${link.text} ↗
        </a>
      `).join('') : '';

      modalBodyContent.innerHTML = `
        <h3>${data.title}</h3>
        <p class="modal-tagline">${data.tagline}</p>
        
        ${metricsHtml}

        <h4 class="modal-section-title">The Operational Challenge</h4>
        <p>${data.problem}</p>

        <h4 class="modal-section-title">System Architecture & Technical Solution</h4>
        <p>${data.architecture}</p>

        <h4 class="modal-section-title">Core Capabilities & Integrations</h4>
        <p>${data.capabilities}</p>

        <div class="modal-actions-row">
          ${linksHtml}
        </div>
      `;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    triggerButtons.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalKey = trigger.getAttribute('data-modal');
        if (modalKey) openModal(modalKey);
      });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  })();

  // ==========================================================================
  // 3. Resilient 1-Click Email Copy with Debounced Feedback
  // ==========================================================================
  (function initEmailCopy() {
    const copyBtn = document.getElementById('copyEmailBtn');
    const copyText = document.getElementById('copyText');
    const emailToCopy = 'irfanur6@gmail.com';
    let feedbackTimeout = null;

    if (!copyBtn || !copyText) return;

    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      let copySuccess = false;

      // Primary: Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(emailToCopy);
          copySuccess = true;
        } catch (err) {
          copySuccess = false;
        }
      }

      // Fallback: document.execCommand('copy') for HTTP/restricted contexts
      if (!copySuccess) {
        try {
          const tempTextArea = document.createElement('textarea');
          tempTextArea.value = emailToCopy;
          tempTextArea.style.position = 'fixed';
          tempTextArea.style.left = '-999999px';
          tempTextArea.style.top = '-999999px';
          document.body.appendChild(tempTextArea);
          tempTextArea.focus();
          tempTextArea.select();
          copySuccess = document.execCommand('copy');
          document.body.removeChild(tempTextArea);
        } catch (err) {
          copySuccess = false;
        }
      }

      // Visual feedback with debounce protection
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }

      copyText.textContent = copySuccess ? 'Copied! ✓' : 'irfanur6@gmail.com';
      copyBtn.style.borderColor = 'var(--accent-terracotta)';
      copyBtn.style.color = 'var(--accent-terracotta)';

      feedbackTimeout = setTimeout(() => {
        copyText.textContent = 'Copy Email';
        copyBtn.style.borderColor = '';
        copyBtn.style.color = '';
        feedbackTimeout = null;
      }, 2000);
    });
  })();

  // ==========================================================================
  // 4. Smart Send Message Handler (Direct Gmail Webmail & Mobile Mailto)
  // ==========================================================================
  (function initSendMessage() {
    const sendBtn = document.getElementById('sendMessageBtn');
    if (!sendBtn) return;

    sendBtn.addEventListener('click', (e) => {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        // On mobile devices, native mailto: opens the native Gmail / Mail app directly
        e.preventDefault();
        window.location.href = 'mailto:irfanur6@gmail.com?subject=Inquiry%20from%20Portfolio';
      }
      // On desktop, the standard link targets Gmail webmail compose in a new tab
    });
  })();

});

