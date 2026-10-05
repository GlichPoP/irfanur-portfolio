// ==========================================
// Theme Toggling (Dark / Light Mode)
// ==========================================
(function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Retrieve saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Default dark

  root.setAttribute('data-theme', currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = root.getAttribute('data-theme');
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    });
  }
})();

// ==========================================
// Copy Email to Clipboard
// ==========================================
(function initEmailCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyText = document.getElementById('copyText');
  const emailToCopy = 'irfanur6@gmail.com';

  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emailToCopy);
        const originalText = copyText.textContent;
        copyText.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
          copyText.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        fallbackCopy(emailToCopy, copyText);
      }
    });
  }
})();

// ==========================================
// Copy Phone to Clipboard
// ==========================================
(function initPhoneCopy() {
  const copyBtn = document.getElementById('copyPhoneBtn');
  const copyText = document.getElementById('copyPhoneText');
  const phoneToCopy = '+8801537295042';

  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(phoneToCopy);
        const originalText = copyText.textContent;
        copyText.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
          copyText.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        fallbackCopy(phoneToCopy, copyText);
      }
    });
  }
})();

function fallbackCopy(text, labelElement) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    const orig = labelElement.textContent;
    labelElement.textContent = 'Copied!';
    setTimeout(() => {
      labelElement.textContent = orig;
    }, 2000);
  } catch (e) {
    labelElement.textContent = text;
  }
  document.body.removeChild(textarea);
}

// ==========================================
// Active Navigation Highlight on Scroll
// ==========================================
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links .nav-item');

  function updateActiveNav() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navItems.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
})();
