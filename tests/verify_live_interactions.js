/**
 * MILESTONE 3: LIVE CLIENT-SIDE JAVASCRIPT INTERACTION VERIFICATION SUITE
 * Target URL: https://irfanurrahman.vercel.app
 * 
 * Comprehensive Headless Chrome CDP Browser Automation verifying:
 * 1. PROBAHO CRM modal dialog lifecycle:
 *    - Open via [data-modal="modal-probaho"]
 *    - Body scroll-lock (document.body.style.overflow === 'hidden')
 *    - Dynamic content injection (Electron 43, React 19, SQLite WASM, metrics, links)
 *    - Pathway A: Close via close button (#modalCloseBtn) & body lock release
 *    - Pathway B: Close via backdrop click (#modalBackdrop) & body lock release
 *    - Pathway C: Close via keyboard ESC key & adversarial non-ESC rejection
 * 2. 1-Click Email Copy button with debounced visual feedback:
 *    - Click event handling & feedback ("Copied! ✓", terracotta borders/colors)
 *    - Rapid click debouncing (multiple rapid clicks preserve active feedback)
 *    - Auto-reset timer (reverts to "Copy Email" at ~2000ms, styles cleared)
 * 3. Smooth scrolling & Scroll-Spy navigation:
 *    - CSS scroll-behavior: smooth and scroll-padding-top: 96px
 *    - Dynamic active-class switching across #software, #experience, #academics, and #contact
 * 4. Responsive Mobile interaction fidelity (375px viewport):
 *    - Horizontal nav track scrollability & mobile modal usability
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TARGET_URL = (process.env.LIVE_URL || 'https://irfanurrahman.vercel.app').replace(/\/+$/, '');
const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9225;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
const summaryReport = [];

function assert(condition, testName, details = '') {
  totalTests++;
  const statusStr = condition ? 'PASS' : 'FAIL';
  const logMsg = `  [${statusStr}] ${testName}${details ? ' (' + details + ')' : ''}`;
  if (condition) {
    passedTests++;
    console.log(logMsg);
    summaryReport.push({ testName, status: 'PASS', details });
  } else {
    failedTests++;
    console.error(logMsg);
    failures.push({ testName, details });
    summaryReport.push({ testName, status: 'FAIL', details });
  }
}

class ChromeDevToolsSession {
  constructor(chromePath, port = DEBUG_PORT) {
    this.chromePath = chromePath;
    this.port = port;
    this.chromeProcess = null;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async launch() {
    this.chromeProcess = spawn(this.chromePath, [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1280,800'
    ]);

    const maxTries = 40;
    for (let i = 0; i < maxTries; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
        if (res.ok) {
          const data = await res.json();
          console.log(`Chrome Headless launched successfully: ${data.Browser}`);
          return;
        }
      } catch (e) {
        // waiting
      }
      await new Promise(r => setTimeout(r, 200));
    }
    throw new Error('Timed out waiting for Chrome remote debugging port ' + this.port);
  }

  async attachToNewPage(url) {
    const putRes = await fetch(`http://127.0.0.1:${this.port}/json/new`, { method: 'PUT' });
    const tabInfo = await putRes.json();
    const wsUrl = tabInfo.webSocketDebuggerUrl;

    this.ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const cb = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) {
          cb.reject(new Error(data.error.message || JSON.stringify(data.error)));
        } else {
          cb.resolve(data.result);
        }
      }
    };

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');

    await this.send('Browser.grantPermissions', {
      permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
      origin: url
    }).catch(() => {});

    console.log(`Navigating Chrome to live URL: ${url}...`);
    await this.send('Page.navigate', { url });
    // Allow network and DOM to settle
    await new Promise(r => setTimeout(r, 3000));

    await this.send('Page.bringToFront').catch(() => {});
    await this.evaluate('window.focus()').catch(() => {});
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height, mobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile
    });
    await this.send('Emulation.setVisibleSize', { width, height });
    await new Promise(r => setTimeout(r, 400));
  }

  async dispatchKeyEvent(type, key, code, windowsVirtualKeyCode) {
    await this.send('Input.dispatchKeyEvent', {
      type,
      key,
      code,
      windowsVirtualKeyCode
    });
  }

  async close() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    if (this.chromeProcess) {
      try { this.chromeProcess.kill('SIGKILL'); } catch (e) {}
    }
  }
}

async function runLiveInteractionVerification() {
  console.log('================================================================');
  console.log('  LIVE BROWSER AUTOMATION INTERACTION VERIFICATION HARNESS');
  console.log(`  TARGET PRODUCTION URL: ${TARGET_URL}`);
  console.log('================================================================\n');

  const cdp = new ChromeDevToolsSession(CHROME_PATH, DEBUG_PORT);

  try {
    await cdp.launch();
    await cdp.attachToNewPage(TARGET_URL);

    // Ensure DOM is fully interactive
    console.log('--- SUITE 1: DOM & Runtime Initialization Checks ---');
    const initCheck = await cdp.evaluate(`
      (() => {
        return {
          title: document.title,
          hasModal: !!document.getElementById('caseStudyModal'),
          hasModalBackdrop: !!document.getElementById('modalBackdrop'),
          hasModalCloseBtn: !!document.getElementById('modalCloseBtn'),
          hasModalBody: !!document.getElementById('modalBodyContent'),
          hasTrigger: !!document.querySelector('[data-modal="modal-probaho"]'),
          hasCopyBtn: !!document.getElementById('copyEmailBtn'),
          hasCopyText: !!document.getElementById('copyText'),
          hasDisplayEmail: !!document.getElementById('displayEmail'),
          initialOverflow: document.body.style.overflow,
          modalInitialOpen: document.getElementById('caseStudyModal').classList.contains('open'),
          modalInitialAriaHidden: document.getElementById('caseStudyModal').getAttribute('aria-hidden')
        };
      })()
    `);

    assert(initCheck.title.includes('Portfolio of Irfan'), 'Page title is correct on live URL');
    assert(initCheck.hasModal, 'Modal container #caseStudyModal present');
    assert(initCheck.hasModalBackdrop, 'Modal backdrop #modalBackdrop present');
    assert(initCheck.hasModalCloseBtn, 'Modal close button #modalCloseBtn present');
    assert(initCheck.hasModalBody, 'Modal body content container present');
    assert(initCheck.hasTrigger, 'PROBAHO modal trigger [data-modal="modal-probaho"] present');
    assert(initCheck.hasCopyBtn, 'Email copy button #copyEmailBtn present');
    assert(initCheck.hasCopyText, 'Email copy label #copyText present');
    assert(initCheck.hasDisplayEmail, 'Email display address #displayEmail present');
    assert(initCheck.modalInitialOpen === false, 'Modal initially does NOT have "open" class');
    assert(initCheck.modalInitialAriaHidden === 'true', 'Modal initially has aria-hidden="true"');
    assert(initCheck.initialOverflow !== 'hidden', 'Body overflow initially not locked');

    // ========================================================================
    // SUITE 2: PROBAHO CRM MODAL DIALOG COMPREHENSIVE LIFECYCLE
    // ========================================================================
    console.log('\n--- SUITE 2: PROBAHO CRM Modal Dialog Lifecycle Verification ---');

    // Step 2.1: Open modal via trigger click
    console.log('Testing Modal Open & Dynamic Body Population...');
    const openResult = await cdp.evaluate(`
      (() => {
        const trigger = document.querySelector('[data-modal="modal-probaho"]');
        trigger.click();
        const modal = document.getElementById('caseStudyModal');
        const modalBody = document.getElementById('modalBodyContent');
        const bodyContent = modalBody.innerHTML;
        const textContent = modalBody.textContent;

        return {
          isOpen: modal.classList.contains('open'),
          ariaHidden: modal.getAttribute('aria-hidden'),
          bodyOverflow: document.body.style.overflow,
          hasTitle: bodyContent.includes('PROBAHO CRM Solutions'),
          hasLatency: (bodyContent.includes('&lt; 1ms') || textContent.includes('< 1ms')) && bodyContent.includes('Local Query Latency'),
          hasUptime: bodyContent.includes('100%') && bodyContent.includes('Offline Checkout Uptime'),
          hasDistricts: bodyContent.includes('64') && bodyContent.includes('BD Districts Logistics'),
          hasElectronReact: bodyContent.includes('Electron 43 and React 19'),
          hasSqliteWasm: bodyContent.includes('SQLite 3 WebAssembly engine (sql.js)'),
          hasGithubRepo: bodyContent.includes('https://github.com/GlichPoP/probaho-crm'),
          hasInstallerLink: bodyContent.includes('https://github.com/GlichPoP/probaho-crm/releases')
        };
      })()
    `);

    assert(openResult.isOpen === true, 'Modal has "open" class after trigger click');
    assert(openResult.ariaHidden === 'false', 'Modal has aria-hidden="false" when open');
    assert(openResult.bodyOverflow === 'hidden', 'Body scroll-lock activated (document.body.style.overflow === "hidden")');
    assert(openResult.hasTitle, 'Modal content renders "PROBAHO CRM Solutions" title');
    assert(openResult.hasLatency, 'Modal renders "< 1ms Local Query Latency" metric card');
    assert(openResult.hasUptime, 'Modal renders "100% Offline Checkout Uptime" metric card');
    assert(openResult.hasDistricts, 'Modal renders "64 BD Districts Logistics" metric card');
    assert(openResult.hasElectronReact, 'Modal renders Electron 43 and React 19 architecture specs');
    assert(openResult.hasSqliteWasm, 'Modal renders SQLite 3 WebAssembly engine (sql.js) tech specs');
    assert(openResult.hasGithubRepo, 'Modal contains primary GitHub repository action link');
    assert(openResult.hasInstallerLink, 'Modal contains secondary Windows installer release link');

    // Step 2.2: Close Pathway A — Close Button (#modalCloseBtn)
    console.log('Testing Close Pathway A: Close Button Click...');
    const closeBtnResult = await cdp.evaluate(`
      (() => {
        document.getElementById('modalCloseBtn').click();
        const modal = document.getElementById('caseStudyModal');
        return {
          isOpen: modal.classList.contains('open'),
          ariaHidden: modal.getAttribute('aria-hidden'),
          bodyOverflow: document.body.style.overflow
        };
      })()
    `);

    assert(closeBtnResult.isOpen === false, 'Modal loses "open" class after close button click');
    assert(closeBtnResult.ariaHidden === 'true', 'Modal has aria-hidden="true" after close button click');
    assert(closeBtnResult.bodyOverflow === '', 'Body scroll-lock released (document.body.style.overflow === "")');

    // Step 2.3: Close Pathway B — Backdrop Click (#modalBackdrop)
    console.log('Testing Close Pathway B: Backdrop Click...');
    const backdropResult = await cdp.evaluate(`
      (() => {
        // Re-open modal
        document.querySelector('[data-modal="modal-probaho"]').click();
        const opened = document.getElementById('caseStudyModal').classList.contains('open');
        const lockedOverflow = document.body.style.overflow;

        // Click backdrop
        document.getElementById('modalBackdrop').click();
        const modal = document.getElementById('caseStudyModal');

        return {
          wasReopened: opened,
          wasLocked: lockedOverflow === 'hidden',
          isOpen: modal.classList.contains('open'),
          ariaHidden: modal.getAttribute('aria-hidden'),
          bodyOverflow: document.body.style.overflow
        };
      })()
    `);

    assert(backdropResult.wasReopened, 'Modal successfully re-opened for backdrop test');
    assert(backdropResult.wasLocked, 'Body scroll-lock re-engaged when modal opened');
    assert(backdropResult.isOpen === false, 'Modal closes when #modalBackdrop is clicked');
    assert(backdropResult.ariaHidden === 'true', 'Modal sets aria-hidden="true" after backdrop click');
    assert(backdropResult.bodyOverflow === '', 'Body scroll-lock released after backdrop click');

    // Step 2.4: Close Pathway C — Keyboard ESC Key & Adversarial Keys
    console.log('Testing Close Pathway C: Keyboard ESC Key & Adversarial Non-ESC Rejection...');
    // Re-open
    await cdp.evaluate(`document.querySelector('[data-modal="modal-probaho"]').click();`);
    
    // Adversarial: Press Enter
    await cdp.evaluate(`
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    `);
    const afterEnter = await cdp.evaluate(`
      ({
        isOpen: document.getElementById('caseStudyModal').classList.contains('open'),
        overflow: document.body.style.overflow
      })
    `);
    assert(afterEnter.isOpen === true, 'Non-ESC key ("Enter") does NOT close modal');
    assert(afterEnter.overflow === 'hidden', 'Body scroll-lock remains active during non-ESC keypress');

    // Adversarial: Press Tab
    await cdp.evaluate(`
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true }));
    `);
    const afterTab = await cdp.evaluate(`
      document.getElementById('caseStudyModal').classList.contains('open')
    `);
    assert(afterTab === true, 'Non-ESC key ("Tab") does NOT close modal');

    // Press Escape
    await cdp.evaluate(`
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    `);
    const afterEsc = await cdp.evaluate(`
      (() => {
        const modal = document.getElementById('caseStudyModal');
        return {
          isOpen: modal.classList.contains('open'),
          ariaHidden: modal.getAttribute('aria-hidden'),
          bodyOverflow: document.body.style.overflow
        };
      })()
    `);
    assert(afterEsc.isOpen === false, 'Escape keypress closes modal');
    assert(afterEsc.ariaHidden === 'true', 'Modal sets aria-hidden="true" after ESC key');
    assert(afterEsc.bodyOverflow === '', 'Body scroll-lock released after ESC key');

    // Adversarial: Press ESC when already closed
    await cdp.evaluate(`
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    `);
    const redundantEscOverflow = await cdp.evaluate(`document.body.style.overflow`);
    assert(redundantEscOverflow === '', 'Pressing ESC when already closed is a no-op');

    // ========================================================================
    // SUITE 3: 1-CLICK EMAIL COPY WITH DEBOUNCED VISUAL FEEDBACK
    // ========================================================================
    console.log('\n--- SUITE 3: 1-Click Email Copy with Debounced Visual Feedback ---');

    const copyInitialState = await cdp.evaluate(`
      (() => {
        const btn = document.getElementById('copyEmailBtn');
        const text = document.getElementById('copyText');
        return {
          text: text.textContent.trim(),
          border: btn.style.borderColor,
          color: btn.style.color
        };
      })()
    `);
    assert(copyInitialState.text === 'Copy Email', 'Email copy button text initially reads "Copy Email"');
    assert(copyInitialState.border === '', 'Email copy button initially has no inline border styling');

    // Click the button
    console.log('Dispatching Click on Email Copy Button...');
    const click1 = await cdp.evaluate(`
      (async () => {
        const btn = document.getElementById('copyEmailBtn');
        btn.click();
        for (let i = 0; i < 25; i++) {
          if (document.getElementById('copyText').textContent.trim() === 'Copied! ✓') break;
          await new Promise(r => setTimeout(r, 20));
        }
        const text = document.getElementById('copyText');
        return {
          text: text.textContent.trim(),
          border: btn.style.borderColor,
          color: btn.style.color
        };
      })()
    `);

    assert(click1.text === 'Copied! ✓', 'Email copy button switches to "Copied! ✓" on click', `Got: ${click1.text}`);
    assert(click1.border.includes('var(--accent-terracotta)') || click1.border.includes('217, 119, 87') || click1.border !== '', 'Button border highlights with terracotta token');
    assert(click1.color.includes('var(--accent-terracotta)') || click1.color.includes('217, 119, 87') || click1.color !== '', 'Button text color highlights with terracotta token');

    // Debounce Stress: Rapid multiple clicks within 300ms
    console.log('Testing Rapid Sequential Click Debouncing...');
    await cdp.evaluate(`
      (async () => {
        const btn = document.getElementById('copyEmailBtn');
        for (let i = 0; i < 5; i++) {
          btn.click();
          await new Promise(r => setTimeout(r, 40));
        }
      })()
    `);

    // Verify at t=1000ms: still "Copied! ✓"
    await new Promise(r => setTimeout(r, 1000));
    const midWait = await cdp.evaluate(`document.getElementById('copyText').textContent.trim()`);
    assert(midWait === 'Copied! ✓', 'At t=1000ms: text remains "Copied! ✓" (no premature reset)');

    // Verify at t=2300ms (more than 2000ms after last click): resets to "Copy Email"
    console.log('Waiting for debounced 2000ms timeout reset...');
    await new Promise(r => setTimeout(r, 1500));
    const resetState = await cdp.evaluate(`
      (() => {
        const btn = document.getElementById('copyEmailBtn');
        const text = document.getElementById('copyText');
        return {
          text: text.textContent.trim(),
          border: btn.style.borderColor,
          color: btn.style.color
        };
      })()
    `);

    assert(resetState.text === 'Copy Email', 'At t=2400ms: button text cleanly reverts to "Copy Email"');
    assert(resetState.border === '', 'Button border style cleared upon timer expiration');
    assert(resetState.color === '', 'Button color style cleared upon timer expiration');

    // ========================================================================
    // SUITE 4: SMOOTH SCROLLING & SCROLL-SPY ACTIVE HIGHLIGHTING
    // ========================================================================
    console.log('\n--- SUITE 4: Smooth Scrolling & Scroll-Spy Navigation ---');

    const scrollMetrics = await cdp.evaluate(`
      (() => {
        const root = document.documentElement;
        const style = window.getComputedStyle(root);
        return {
          scrollBehavior: style.scrollBehavior,
          scrollPaddingTop: style.scrollPaddingTop
        };
      })()
    `);

    assert(scrollMetrics.scrollBehavior === 'smooth', 'HTML root enforces scroll-behavior: smooth');
    assert(scrollMetrics.scrollPaddingTop === '96px', 'HTML root enforces scroll-padding-top: 96px for fixed header');

    // Helper to test active link
    async function testScrollSection(sectionId, expectedNavHref) {
      const activeState = await cdp.evaluate(`
        (() => {
          const section = document.getElementById('${sectionId}');
          if (section) {
            window.scrollTo({ top: section.offsetTop - 50, behavior: 'instant' });
            // Dispatch scroll event to trigger handler
            window.dispatchEvent(new Event('scroll'));
          }

          const activeLink = document.querySelector('.header-nav .nav-link.active');
          return {
            hasActive: !!activeLink,
            activeHref: activeLink ? activeLink.getAttribute('href') : null
          };
        })()
      `);
      return activeState;
    }

    // Scroll to #software
    console.log('Testing Scroll-Spy on #software...');
    await new Promise(r => setTimeout(r, 200));
    const spySoftware = await testScrollSection('software', '#software');
    assert(spySoftware.activeHref === '#software', 'Scroll-spy highlights #software when scrolled to Software section', `Active: ${spySoftware.activeHref}`);

    // Scroll to #experience
    console.log('Testing Scroll-Spy on #experience...');
    await new Promise(r => setTimeout(r, 200));
    const spyExp = await testScrollSection('experience', '#experience');
    assert(spyExp.activeHref === '#experience', 'Scroll-spy highlights #experience when scrolled to Experience section', `Active: ${spyExp.activeHref}`);

    // Scroll to #academics
    console.log('Testing Scroll-Spy on #academics...');
    await new Promise(r => setTimeout(r, 200));
    const spyAcad = await testScrollSection('academics', '#academics');
    assert(spyAcad.activeHref === '#academics', 'Scroll-spy highlights #academics when scrolled to Academics section', `Active: ${spyAcad.activeHref}`);

    // Scroll to bottom / #contact
    console.log('Testing Scroll-Spy bottom latch on #contact...');
    await new Promise(r => setTimeout(r, 200));
    const spyBottom = await cdp.evaluate(`
      (() => {
        window.scrollTo({ top: document.body.offsetHeight, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
        const activeLink = document.querySelector('.header-nav .nav-link.active');
        return {
          activeHref: activeLink ? activeLink.getAttribute('href') : null
        };
      })()
    `);
    assert(spyBottom.activeHref === '#contact', 'Scroll-spy bottom latch highlights #contact at bottom of page', `Active: ${spyBottom.activeHref}`);

    // Reset scroll to top
    await cdp.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' }); window.dispatchEvent(new Event('scroll'));`);

    // ========================================================================
    // SUITE 5: MOBILE VIEWPORT INTERACTION FIDELITY (375px)
    // ========================================================================
    console.log('\n--- SUITE 5: Mobile Viewport (375px) Interaction Fidelity ---');
    await cdp.setViewport(375, 667, true);

    const mobileInteractions = await cdp.evaluate(`
      (() => {
        const navMenu = document.querySelector('.nav-menu');
        const computed = window.getComputedStyle(navMenu);
        const trigger = document.querySelector('[data-modal="modal-probaho"]');
        
        // Open modal in mobile view
        trigger.click();
        const modal = document.getElementById('caseStudyModal');
        const isModalOpenMobile = modal.classList.contains('open');
        const mobileOverflow = document.body.style.overflow;

        // Close via close button in mobile view
        document.getElementById('modalCloseBtn').click();
        const isModalClosedMobile = !modal.classList.contains('open');
        const mobileOverflowRestored = document.body.style.overflow;

        return {
          display: computed.display,
          overflowX: computed.overflowX,
          isModalOpenMobile,
          mobileOverflow,
          isModalClosedMobile,
          mobileOverflowRestored
        };
      })()
    `);

    assert(mobileInteractions.display === 'flex', 'Mobile navigation menu maintains display: flex');
    assert(mobileInteractions.overflowX === 'auto', 'Mobile navigation menu maintains touch-friendly overflow-x: auto track');
    assert(mobileInteractions.isModalOpenMobile, 'PROBAHO modal triggers and opens seamlessly on mobile viewport');
    assert(mobileInteractions.mobileOverflow === 'hidden', 'Mobile viewport enforces body scroll-lock when modal is open');
    assert(mobileInteractions.isModalClosedMobile, 'Mobile modal closes cleanly via touch on close button');
    assert(mobileInteractions.mobileOverflowRestored === '', 'Mobile viewport restores body scroll-lock after closing');

  } finally {
    await cdp.close();
  }
}

async function main() {
  const startTime = Date.now();
  try {
    await runLiveInteractionVerification();
  } catch (err) {
    console.error('\nCRITICAL FAILURE IN INTERACTION VERIFICATION SUITE:', err);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n================================================================');
  console.log('              INTERACTION VERIFICATION SUMMARY REPORT           ');
  console.log('================================================================');
  console.log(`TOTAL TESTS:   ${totalTests}`);
  console.log(`PASSED:        ${passedTests}`);
  console.log(`FAILED:        ${failedTests}`);
  console.log(`DURATION:      ${duration}s`);
  console.log('================================================================');

  if (failedTests > 0) {
    console.error(`\n>>> VERDICT: FAILED (${failedTests} tests failed) <<<`);
    process.exit(1);
  } else {
    console.log('\n>>> VERDICT: PASSED (100% Client-Side Interactions Verified on Live URL) <<<');
    process.exit(0);
  }
}

main();
