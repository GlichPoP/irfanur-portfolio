/**
 * IRFANUR RAHMAN — PORTFOLIO RUNTIME ENGINE
 * Design Architecture: Dennis Snellenberg Minimalist Aesthetic & Dynamic Animations
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Dennis Snellenberg Signature Preloader
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
    }, 160);

    setTimeout(() => {
      clearInterval(wordInterval);
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }, 1100);
  })();

  // ==========================================
  // 2. Real-Time Dhaka, Bangladesh Clock (GMT+6)
  // ==========================================
  (function initLiveClocks() {
    const topClock = document.getElementById('liveDhakaTime');
    const footerClock = document.getElementById('footerClock');

    function updateTime() {
      try {
        const options = {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const timeString = new Intl.DateTimeFormat('en-US', options).format(new Date());
        if (topClock) topClock.textContent = `${timeString} GMT+6`;
        if (footerClock) footerClock.textContent = `${timeString} GMT+6`;
      } catch (e) {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const dhakaDate = new Date(utc + (3600000 * 6));
        const str = dhakaDate.toLocaleTimeString() + ' GMT+6';
        if (topClock) topClock.textContent = str;
        if (footerClock) footerClock.textContent = str;
      }
    }

    updateTime();
    setInterval(updateTime, 1000);
  })();

  // ==========================================
  // 3. Snellenberg Hover Preview Reveal Modal
  // ==========================================
  (function initProjectHoverModal() {
    const hoverModal = document.getElementById('projectHoverModal');
    const modalBadge = document.getElementById('hoverModalBadge');
    const modalTitle = document.getElementById('hoverModalTitle');
    const modalDesc = document.getElementById('hoverModalDesc');
    const modalStack = document.getElementById('hoverModalStack');
    const workItems = document.querySelectorAll('.work-item');

    if (!hoverModal || window.matchMedia('(hover: none)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;

    // Smooth lerp animation loop for hover modal
    function renderHoverModal() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      hoverModal.style.left = `${currentX}px`;
      hoverModal.style.top = `${currentY}px`;

      if (isMoving) {
        requestAnimationFrame(renderHoverModal);
      }
    }

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isMoving) {
        isMoving = true;
        renderHoverModal();
      }
    });

    workItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const title = item.getAttribute('data-title') || '';
        const badge = item.getAttribute('data-badge') || '';
        const desc = item.getAttribute('data-desc') || '';
        const stack = item.getAttribute('data-stack') || '';

        if (modalTitle) modalTitle.textContent = title;
        if (modalBadge) modalBadge.textContent = badge;
        if (modalDesc) modalDesc.textContent = desc;
        if (modalStack) modalStack.textContent = stack;

        hoverModal.classList.add('active');
      });

      item.addEventListener('mouseleave', () => {
        hoverModal.classList.remove('active');
      });

      // Click to toggle inline case study details
      item.addEventListener('click', (e) => {
        // Prevent toggle if clicking direct action links
        if (e.target.closest('a')) return;
        item.classList.toggle('expanded');
      });
    });
  })();

  // ==========================================
  // 4. Dennis Snellenberg Magnetic Cursor Physics
  // ==========================================
  (function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    const magneticElements = document.querySelectorAll('.magnetic-btn');

    magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Giant button gets more elastic pull, small buttons get subtle pull
        const strength = el.classList.contains('giant-magnetic-btn') ? 0.38 : 0.22;

        el.style.transform = `translate(${deltaX * strength}px, ${deltaY * strength}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0px, 0px)';
      });
    });
  })();

  // ==========================================
  // 5. Minimalist Dark / Light Theme Toggle
  // ==========================================
  (function initTheme() {
    const themeBtn = document.getElementById('themeToggle');
    const root = document.documentElement;

    const savedTheme = localStorage.getItem('snellenberg_theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);

    function updateThemeMeta(theme) {
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute('content', theme === 'dark' ? '#141517' : '#F2F2F4');
    }
    updateThemeMeta(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const activeTheme = root.getAttribute('data-theme');
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', nextTheme);
        localStorage.setItem('snellenberg_theme', nextTheme);
        updateThemeMeta(nextTheme);
      });
    }
  })();

  // ==========================================
  // 6. 1-Click Email Clipboard Copy
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
            copyText.textContent = 'Copy';
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
            copyText.textContent = 'Copy';
          }, 2000);
        }
      });
    }
  })();

});
