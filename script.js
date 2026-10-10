/**
 * Irfanur Rahman Portfolio Runtime Engine
 * Plain, human British English, strictly factual presentation.
 * Interactive features: Case study modal, dynamic project synchronization, and email copy.
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
      const headerOffset = 120;

      let currentSectionId = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - headerOffset;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 60) {
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
    onScroll();
  })();

  // ==========================================================================
  // 2. Interactive Case Study Modal Dialog (5 Required Headings)
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
        subtitle: 'A free desktop business system for retail showrooms and distributors',
        theProblem: 'Retail showrooms and distributors in Bangladesh often experience unstable broadband connections. When cloud based billing systems lose connection, counters cannot print receipts or record sales, creating long queues and forcing staff onto paper records.',
        whoItIsFor: 'Single and multi branch retail showrooms, fashion outlets, and trade distributors that need dependable daily sales and stock tracking on counter computers.',
        whatIDecidedAndWhy: 'I chose an offline first desktop architecture using Electron and React, with SQLite WebAssembly via sql.js storing data directly in local files. This lets staff keep ringing up sales and looking up stock without internet. I also built courier integration profiles for Pathao, Steadfast, RedX, Paperfly, Sundarban and eCourier to match local delivery workflows.',
        tradeOffsAndLimits: 'Because each terminal stores its database locally, live inventory updates across multiple cash registers or remote branches require an active connection or manual export until multi device sync is added.',
        whatIWouldImproveNext: 'Direct Bluetooth and USB thermal receipt printing, automated cloud backup when internet reconnects, and central inventory pooling across multiple store locations.',
        links: [
          { text: 'View repository on GitHub', url: 'https://github.com/GlichPoP/probaho-crm', primary: true },
          { text: 'Download installer', url: 'https://github.com/GlichPoP/probaho-crm/releases', primary: false }
        ]
      }
    };

    function openModal(modalKey) {
      const data = caseStudyData[modalKey];
      if (!data || !modal || !modalBodyContent) return;

      const linksHtml = data.links ? data.links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${link.primary ? 'btn-alice-primary' : 'btn-alice-secondary'}">
          ${link.text} ↗
        </a>
      `).join('') : '';

      modalBodyContent.innerHTML = `
        <div class="modal-inner-header">
          <span class="modal-kicker">Case Study</span>
          <h3 class="modal-headline">${data.title}</h3>
          <p class="modal-subheading">${data.subtitle}</p>
        </div>

        <div class="modal-case-sections">
          <section class="modal-case-block">
            <h4 class="modal-section-title">The problem</h4>
            <p>${data.theProblem}</p>
          </section>

          <section class="modal-case-block">
            <h4 class="modal-section-title">Who it is for</h4>
            <p>${data.whoItIsFor}</p>
          </section>

          <section class="modal-case-block">
            <h4 class="modal-section-title">What I decided and why</h4>
            <p>${data.whatIDecidedAndWhy}</p>
          </section>

          <section class="modal-case-block">
            <h4 class="modal-section-title">Trade offs and limits</h4>
            <p>${data.tradeOffsAndLimits}</p>
          </section>

          <section class="modal-case-block">
            <h4 class="modal-section-title">What I would improve next</h4>
            <p>${data.whatIWouldImproveNext}</p>
          </section>
        </div>

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
  // 3. Dynamic Projects Data Sync (projects.json)
  // ==========================================================================
  (function initProjectsDataSync() {
    fetch('projects.json')
      .then(response => {
        if (!response.ok) return null;
        return response.json();
      })
      .then(projects => {
        if (!projects || !Array.isArray(projects)) return;

        const caseProjects = projects.filter(p => p.type === 'case');
        const countSpan = document.getElementById('caseGlanceCount');
        if (countSpan && caseProjects.length > 0) {
          countSpan.textContent = `${caseProjects.length} case projects`;
        }

        // Check if there are media files for probaho
        const mediaGallery = document.getElementById('probahoMediaGallery');
        if (mediaGallery) {
          // Keep hidden as per rule 23 until user places assets
          mediaGallery.style.display = 'none';
        }
      })
      .catch(() => {
        // Fallback silently if projects.json cannot be fetched
      });
  })();

  // ==========================================================================
  // 4. Dependable 1-Click Email Copy with Debounced Feedback
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

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(emailToCopy);
          copySuccess = true;
        } catch (err) {
          copySuccess = false;
        }
      }

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
  // 5. Smart Send Message Handler (Direct Gmail Webmail & Mobile Mailto)
  // ==========================================================================
  (function initSendMessage() {
    const sendBtn = document.getElementById('sendMessageBtn');
    if (!sendBtn) return;

    sendBtn.addEventListener('click', (e) => {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        e.preventDefault();
        window.location.href = 'mailto:irfanur6@gmail.com?subject=Inquiry%20from%20Portfolio';
      }
    });
  })();

});
