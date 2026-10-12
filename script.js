/**
 * Irfanur Rahman Portfolio Runtime Engine
 * Plain, human British English, strictly factual presentation.
 * Interactive features: Case study modals, dynamic project synchronization, and email copy.
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
  // 2. Interactive Case Study & Research Modals
  // ==========================================================================
  (function initCaseStudyModals() {
    const modal = document.getElementById('caseStudyModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBodyContent = document.getElementById('modalBodyContent');
    const triggerButtons = document.querySelectorAll('[data-modal]');

    const caseStudyData = {
      'modal-probaho': {
        kicker: 'Case Study',
        title: 'PROBAHO CRM Solutions',
        subtitle: 'A free desktop business system for retail showrooms and distributors',
        sections: [
          { title: 'The problem', text: 'Retail showrooms and distributors in Bangladesh often experience unstable broadband connections. When cloud based billing systems lose connection, counters cannot print receipts or record sales, creating long queues and forcing staff onto paper records.' },
          { title: 'Who it is for', text: 'Single and multi branch retail showrooms, fashion outlets, and trade distributors that need dependable daily sales and stock tracking on counter computers.' },
          { title: 'What I decided and why', text: 'I chose an offline first desktop architecture using Electron and React, with SQLite WebAssembly via sql.js storing data directly in local files. This lets staff keep ringing up sales and looking up stock without internet. I also built courier integration profiles for Pathao, Steadfast, RedX, Paperfly, Sundarban and eCourier to match local delivery workflows.' },
          { title: 'Trade offs and limits', text: 'Because each terminal stores its database locally, live inventory updates across multiple cash registers or remote branches require an active connection or manual export until multi device sync is added.' },
          { title: 'What I would improve next', text: 'Direct Bluetooth and USB thermal receipt printing, automated cloud backup when internet reconnects, and central inventory pooling across multiple store locations.' }
        ],
        links: [
          { text: 'View repository on GitHub', url: 'https://github.com/GlichPoP/probaho-crm', primary: true },
          { text: 'Download installer', url: 'https://github.com/GlichPoP/probaho-crm/releases', primary: false }
        ]
      },

      'modal-fin423': {
        kicker: 'Executive Summary',
        title: 'Portfolio Optimization and Efficient Frontier Simulation',
        subtitle: 'FIN423: Investment Theory, 2025',
        sections: [
          { title: 'Research objective and asset universe', text: 'The group evaluated individual equity risk, historical return profiles, and mutual covariance relationships across four Dhaka Stock Exchange equities (Grameenphone, BRAC Bank, Square Pharmaceuticals, and Apex Tannery) over 250 trading days to construct the Markowitz efficient frontier.' },
          { title: 'My role and key contributions', text: 'Responsible for Grameenphone valuation, covariance matrix formulation, and 34 portfolio efficient frontier simulation.' },
          { title: 'Key analytical findings', text: 'Identified the Minimum Variance Portfolio at 9.92% risk with 29.65% expected return. Discovered the Optimum Portfolio delivering an expected return of 56.59% at 14.25% portfolio volatility across 34 simulated weight allocations (Group result).' },
          { title: 'Optimal asset allocation', text: 'The optimal risk adjusted allocation comprised 51% BRAC Bank, 28% Square Pharmaceuticals, and 21% Grameenphone, demonstrating that strategic diversification significantly enhances risk adjusted returns over individual stock holdings (Group result).' },
          { title: 'Methodology and models', text: 'Markowitz Modern Portfolio Theory, Gordon Growth Dividend Discount Model, historical five year P/E multiple regression, Capital Allocation Line (CAL) derivation, and covariance matrix formulation.' }
        ],
        links: [
          { text: 'Open full research report (38 pages • 2.41 MB)', url: 'pdfs/fin423-portfolio-optimization-efficient-frontier.pdf', primary: true }
        ]
      },

      'modal-fin433': {
        kicker: 'Executive Summary',
        title: 'Equity Research and Valuation Modeling of Square Pharmaceuticals Ltd',
        subtitle: 'FIN433: Financial Modeling, 2025',
        sections: [
          { title: 'Research objective and coverage', text: 'Conducted an institutional equity research valuation of Square Pharmaceuticals Ltd, evaluating historical operational performance, pipeline expansions, and future cash generation.' },
          { title: 'My role and key contributions', text: 'Corporate governance structure, shareholding breakdown, board risk assessment, and long term revenue growth drivers.' },
          { title: 'Valuation conclusion and recommendation', text: 'Issued a BUY recommendation with a target fair value of BDT 397.20 against a prevailing market price of BDT 221.00, representing an implied upside of 79.6% (Group result).' },
          { title: 'Key financial metrics and discount rates', text: 'Derived a Weighted Average Cost of Capital (WACC) of 10.49% with an estimated Cost of Equity of 12.51% and terminal growth rate of 5.82% (Group result). Projected five year pro forma revenues expanding at a compound annual growth rate of 11.66%.' },
          { title: 'Methodology and models', text: 'The group built a valuation combining free cash flow to firm, dividend discount models and peer multiples, with five year projections.' }
        ],
        links: [
          { text: 'Open full research report (48 pages • 9.22 MB)', url: 'pdfs/fin433-equity-research-square-pharmaceuticals.pdf', primary: true }
        ]
      },

      'modal-fin422': {
        kicker: 'Executive Summary',
        title: 'Equity Research Report and Valuation Analysis of Square Pharmaceuticals Ltd',
        subtitle: 'FIN422: Fundamentals of Investments, 2024',
        sections: [
          { title: 'Research objective and sector scope', text: 'The paper values Square Pharmaceuticals and benchmarks its operational performance, valuation multiples and stock return volatility against Beximco Pharma, Renata and Ibn Sina.' },
          { title: 'My role and key contributions', text: 'P/E relative valuation for the group\'s equity research and valuation paper.' },
          { title: 'Key analytical findings', text: 'Calculated intrinsic valuation for Square Pharmaceuticals of BDT 210.98 via Free Cash Flow to Firm and BDT 208.00 via Free Cash Flow to Equity (Group result).' },
          { title: 'Statistical return dispersion', text: 'Ten year monthly return analysis revealed a standard deviation of 4.91% alongside positive skewness (0.76) and kurtosis (3.49), confirming leptokurtic distribution characteristics across domestic pharmaceutical stocks (Group result).' },
          { title: 'Methodology and models', text: 'The group applied two stage dividend discount models and cash flow methods to compare intrinsic values against prevailing market prices.' }
        ],
        links: [
          { text: 'Open full research report (22 pages • 1.77 MB)', url: 'pdfs/fin422-equity-research-pharma-valuation.pdf', primary: true }
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

      const sectionsHtml = data.sections ? data.sections.map(sec => `
        <section class="modal-case-block">
          <h4 class="modal-section-title">${sec.title}</h4>
          <p>${sec.text}</p>
        </section>
      `).join('') : '';

      modalBodyContent.innerHTML = `
        <div class="modal-inner-header">
          <span class="modal-kicker">${data.kicker}</span>
          <h3 class="modal-headline">${data.title}</h3>
          <p class="modal-subheading">${data.subtitle}</p>
        </div>

        <div class="modal-case-sections">
          ${sectionsHtml}
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

  // Standard mailto link on #sendMessageBtn is handled natively by the browser.
});
