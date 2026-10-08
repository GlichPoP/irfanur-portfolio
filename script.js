/**
 * IRFANUR RAHMAN — PORTFOLIO RUNTIME ENGINE
 * Modeled 100% on Alice Lee (byalicelee.com)
 * Hero Showcase Carousel, Category Filters & Case Study Dialogs
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Alice Lee Hero Showcase Slider
  // ==========================================
  (function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');

    if (!slides.length) return;

    let currentSlide = 0;
    let slideTimer = null;

    function goToSlide(index) {
      slides.forEach((slide) => slide.classList.remove('active'));
      dots.forEach((dot) => dot.classList.remove('active'));

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) {
        dots[currentSlide].classList.add('active');
      }
    }

    function startAutoSlide() {
      stopAutoSlide();
      slideTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 6000);
    }

    function stopAutoSlide() {
      if (slideTimer) clearInterval(slideTimer);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        startAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        startAutoSlide();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIndex = parseInt(dot.getAttribute('data-slide-target'), 10);
        goToSlide(targetIndex);
        startAutoSlide();
      });
    });

    startAutoSlide();
  })();

  // ==========================================
  // 2. Work Category Filtering
  // ==========================================
  (function initWorkFilters() {
    const filterButtons = document.querySelectorAll('.filter-tab-btn');
    const cards = document.querySelectorAll('.portfolio-item-card');

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach((card) => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
            }, 50);
          } else {
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  })();

  // ==========================================
  // 3. Interactive Case Study Dialog Modals
  // ==========================================
  (function initCaseStudyModals() {
    const modal = document.getElementById('caseStudyModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBodyContent = document.getElementById('modalBodyContent');
    const thumbnailLinks = document.querySelectorAll('[data-modal]');

    const caseStudyData = {
      'modal-probaho': {
        title: 'PROBAHO CRM Solutions',
        tagline: 'Offline-First Enterprise Business Management & Retail Showroom Operations Platform',
        problem: 'Retail showrooms and regional distributors throughout Bangladesh face frequent broadband outages. Standard cloud-only CRMs halt cash drawers, freeze customer billing at the counter, and lack localized courier Cash-on-Delivery (COD) reconciliation engines.',
        architecture: 'Engineered an offline-first execution runtime leveraging SQLite WebAssembly (sql.js) embedded in Electron 43 and React 19. All transactions execute locally on-device in sub-milliseconds, guaranteeing 100% operational uptime without an internet connection.',
        capabilities: 'Pre-configured dispatch templates for Pathao, Steadfast, and RedX with automated COD fee & return deduction reconciliation. Features silent GitHub CDN auto-updates, thermal invoice printing, hardware barcode scanning, and role-based access audit logs.',
        links: [
          { text: 'View Source on GitHub', url: 'https://github.com/GlichPoP/probaho-crm', primary: true },
          { text: 'Download Windows Installer (.exe)', url: 'https://github.com/GlichPoP/probaho-crm/releases', primary: false }
        ]
      },
      'modal-inventory': {
        title: 'Cross-Border Inventory & Multi-Warehouse Sync',
        tagline: 'Multi-warehouse inventory synchronization bridge connecting Shopify USA with Bangladesh fulfillment hubs',
        problem: 'Unsynchronized inventory tracking and order status latency between North American storefronts (Shopify USA) and local Bangladesh warehousing cause stockout errors and supply chain drift.',
        architecture: 'Coordinated real-time SKU mapping schedules, international stock buffers, and organic SEO growth frameworks to support international expansion and multi-warehouse order fulfillment.',
        capabilities: 'Catalog harmonization, live inventory synchronization, cross-border fulfillment monitoring, and Canva-designed digital assets.',
        links: [
          { text: 'Explore Repository', url: 'https://github.com/GlichPoP', primary: true }
        ]
      },
      'modal-ledger': {
        title: 'General Ledger & Trial Balance Reconciliations',
        tagline: 'Financial modeling framework extracting raw corporate transactions to automate trial balance reconciliations',
        problem: 'Corporate accounting teams spend hundreds of hours manually verifying bank statement variances, multi-account ledger distributions, and trial balance integrity across complex corporate units.',
        architecture: 'Leveraged Oracle ERP to record journal entries and balance multi-account ledger distributions. Formulated advanced financial modeling formulas in Advanced Excel to automate variance resolution.',
        capabilities: 'Bank reconciliations, trial balance variance detection, general ledger journal entries, and automated stock exchange analytical models.',
        links: [
          { text: 'Explore GitHub Profile', url: 'https://github.com/GlichPoP', primary: true }
        ]
      },
      'modal-courier': {
        title: '64-District Logistics Engine',
        tagline: 'Courier dispatch templates & automated Cash-on-Delivery financial reconciliation',
        problem: 'Delayed courier settlements (Pathao, Steadfast, RedX) lock up enterprise working capital. Manual spreadsheet reconciliation causes cash leakage from return fees and unverified COD deductions.',
        architecture: 'Embedded localized courier dispatch mapping directly into the billing engine, automatically reconciling courier disbursement receipts against customer order IDs.',
        capabilities: 'Full 64-district coverage, tracking number generation, COD financial settlement verification, and automated return processing.',
        links: [
          { text: 'View PROBAHO CRM', url: 'https://github.com/GlichPoP/probaho-crm', primary: true }
        ]
      },
      'modal-autoupdate': {
        title: 'Background Auto-Updater via CDN',
        tagline: 'In-app real-time release streaming via GitHub CDN with 1-click silent relaunch',
        problem: 'Desktop applications traditionally suffer from outdated versions, requiring manual downloads that interrupt showroom staff workflows.',
        architecture: 'Integrated GitHub Releases CDN delivery with real-time download percentage streaming and background patch verification in Electron.',
        capabilities: 'Silent background sync, SHA256 cryptographic release verification, progress bars, and 1-click relaunch.',
        links: [
          { text: 'View GitHub Releases', url: 'https://github.com/GlichPoP/probaho-crm/releases', primary: true }
        ]
      },
      'modal-ecommerce': {
        title: 'Strides Co USA Storefront Operations',
        tagline: 'Direct-to-consumer international e-commerce storefront launch on Shopify',
        problem: 'Expanding a domestic fashion and lifestyle brand to North America requires localized storefront optimization, SEO keywords, and digital assets.',
        architecture: 'Configured and launched the Shopify USA storefront, managed international payment gateways, and executed organic SEO strategies.',
        capabilities: 'Shopify architecture, keyword optimization, customer conversion funnels, and marketing collateral.',
        links: [
          { text: 'Explore Work on GitHub', url: 'https://github.com/GlichPoP', primary: true }
        ]
      },
      'modal-bizbee': {
        title: 'BRAC University BIZ BEE Competitions',
        tagline: 'Corporate relations & operations for national business case competitions',
        problem: 'Organizing national competitions requires aligning multinational sponsors, case writers, and thousands of participants under tight deadlines.',
        architecture: 'Managed corporate relations with Marico, HSBC, Shanta Asset Management, and Perfetti Van Melle, directing event operations for BIZ BEE-BIZVERSE and BIZ BEE-BRAINIACS.',
        capabilities: 'Brand activations, corporate sponsorships, event logistics, and youth career fair leadership.',
        links: [
          { text: 'Connect on LinkedIn', url: 'https://www.linkedin.com/in/irfanur-rahman123/', primary: true }
        ]
      }
    };

    function openModal(modalKey) {
      const data = caseStudyData[modalKey];
      if (!data || !modal || !modalBodyContent) return;

      const linksHtml = data.links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${link.primary ? 'btn-alice-primary' : 'btn-alice-secondary'}">
          ${link.text} ↗
        </a>
      `).join('');

      modalBodyContent.innerHTML = `
        <h3>${data.title}</h3>
        <p class="modal-tagline">${data.tagline}</p>
        
        <h4 class="modal-section-title">The Operational Problem</h4>
        <p>${data.problem}</p>

        <h4 class="modal-section-title">System Architecture & Engineering</h4>
        <p>${data.architecture}</p>

        <h4 class="modal-section-title">Key Capabilities Delivered</h4>
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

    thumbnailLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = link.getAttribute('data-modal');
        if (modalId) openModal(modalId);
      });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  })();

  // ==========================================
  // 4. 1-Click Email Copy
  // ==========================================
  (function initEmailCopy() {
    const copyBtn = document.getElementById('copyEmailBtn');
    const copyText = document.getElementById('copyText');
    const emailToCopy = 'irfanur6@gmail.com';

    if (copyBtn && copyText) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(emailToCopy);
          copyText.textContent = 'Copied!';
          setTimeout(() => {
            copyText.textContent = 'Copy Email';
          }, 2000);
        } catch (err) {
          const textarea = document.createElement('textarea');
          textarea.value = emailToCopy;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyText.textContent = 'Copied!';
          setTimeout(() => {
            copyText.textContent = 'Copy Email';
          }, 2000);
        }
      });
    }
  })();

});
