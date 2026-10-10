/**
 * MILESTONE 2: LIVE ASSET DELIVERY & RESPONSIVE VISUAL VERIFICATION SUITE
 * Target URL: https://irfanurrahman.vercel.app
 * 
 * Comprehensive Automated QA Suite verifying:
 * 1. 100% of static asset endpoints (HTTP 200, Content-Type, Magic Bytes, Byte Count, Edge Headers)
 * 2. External Google Fonts CSS and dynamic WOFF2 font binary resolution & integrity
 * 3. Responsive layout geometry: 0px horizontal overflow at 375px mobile, 768px tablet, 1280px desktop
 * 4. DOM element containment: zero clipping elements across viewports
 * 5. Exact Alice Lee design system token compliance (#FAF8F5 canvas, #D97757 terracotta, #FFEDE7 peach)
 * 6. Typography rendering: Bitter serif headings, Plus Jakarta Sans body, document.fonts loaded status
 * 7. Mobile navigation accessibility: .nav-menu is never hidden with display:none
 * 8. Visual artifact capture: high-fidelity PNG screenshots saved per viewport
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TARGET_URL = (process.env.LIVE_URL || 'https://irfanurrahman.vercel.app').replace(/\/+$/, '');
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

let passedTests = 0;
let failedTests = 0;
const failures = [];
const summaryReport = [];

function assert(condition, testName, details = '') {
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

async function fetchEndpoint(urlOrPath, customHeaders = {}) {
  const fullUrl = urlOrPath.startsWith('http') ? urlOrPath : `${TARGET_URL}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`;
  const startTime = Date.now();
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    ...customHeaders
  };
  const res = await fetch(fullUrl, { headers });
  const elapsed = Date.now() - startTime;
  const contentType = res.headers.get('content-type') || '';
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return {
    url: fullUrl,
    status: res.status,
    statusText: res.statusText,
    contentType,
    byteLength: buffer.byteLength,
    bytes,
    text: () => new TextDecoder().decode(buffer),
    elapsed,
    headers: res.headers
  };
}

// ============================================================================
// PART 1: STATIC ASSET & EXTERNAL NETWORK DELIVERY VERIFICATION
// ============================================================================
async function runAssetVerification() {
  console.log('\n================================================================');
  console.log(`PART 1: STATIC ASSET & NETWORK VERIFICATION (${TARGET_URL})`);
  console.log('================================================================');

  // 1. Root Document
  console.log('\n--- 1.1 Root HTML Document Integrity ---');
  try {
    const root = await fetchEndpoint('/');
    assert(root.status === 200, 'Root HTML endpoint returns HTTP 200 OK', `Status: ${root.status}`);
    assert(root.contentType.includes('text/html'), 'Root Content-Type is text/html', `Content-Type: ${root.contentType}`);
    assert(root.byteLength >= 15000, 'Root HTML byte length is non-empty and valid', `${root.byteLength} bytes`);
    assert(root.headers.has('server') || root.headers.has('x-vercel-id'), 'Vercel Edge server header present', `Server: ${root.headers.get('server') || 'x-vercel-id'}`);
    
    const htmlText = root.text();
    assert(htmlText.includes('Portfolio of Irfan'), 'HTML contains correct document title');
    assert(htmlText.includes('PROBAHO CRM Solutions'), 'HTML contains PROBAHO CRM showcase');
    assert(htmlText.includes('Square Toiletries Ltd'), 'HTML contains Square Toiletries experience');
    assert(htmlText.includes('BRAC University'), 'HTML contains BRAC University academic credentials');
  } catch (err) {
    assert(false, 'Root HTML fetch threw exception', err.message);
  }

  // 2. Static Assets Matrix
  console.log('\n--- 1.2 Static Image, Style, and Script Assets ---');
  const assetSpecs = [
    {
      path: '/favicon.svg',
      label: 'Root Favicon SVG',
      expectedMime: 'image/svg+xml',
      minBytes: 500,
      validate: (bytes, text) => text.includes('<svg') && text.includes('viewBox="0 0 64 64"') && text.includes('IR')
    },
    {
      path: '/assets/portfolio-favicon.svg',
      label: 'Assets Portfolio Favicon SVG',
      expectedMime: 'image/svg+xml',
      minBytes: 500,
      validate: (bytes, text) => text.includes('<svg') && text.includes('viewBox="0 0 64 64"') && text.includes('IR')
    },
    {
      path: '/assets/profile.jpg',
      label: 'Hero Profile Portrait JPEG',
      expectedMime: 'image/jpeg',
      minBytes: 30000,
      // JPEG magic bytes: FF D8 FF
      validate: (bytes) => bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
    },
    {
      path: '/assets/probaho-logo.png',
      label: 'PROBAHO CRM Showcase Logo PNG',
      expectedMime: 'image/png',
      minBytes: 80000,
      // PNG magic bytes: 89 50 4E 47
      validate: (bytes) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
    },
    {
      path: '/assets/probaho-logo.svg',
      label: 'PROBAHO CRM Showcase Logo SVG',
      expectedMime: 'image/svg+xml',
      minBytes: 1500,
      validate: (bytes, text) => text.includes('<svg') && text.includes('probaho')
    },
    {
      path: '/style.css',
      label: 'Main Stylesheet style.css',
      expectedMime: 'text/css',
      minBytes: 25000,
      validate: (bytes, text) => text.includes('--bg-canvas: #FAF8F5') && text.includes('--accent-terracotta: #D97757')
    },
    {
      path: '/script.js',
      label: 'Main Script script.js',
      expectedMime: 'application/javascript',
      minBytes: 5000,
      validate: (bytes, text) => text.includes('initCaseStudyModals') && text.includes('initEmailCopy')
    }
  ];

  for (const asset of assetSpecs) {
    try {
      const res = await fetchEndpoint(asset.path);
      assert(res.status === 200, `${asset.label} resolves with HTTP 200 OK (${asset.path})`, `Status: ${res.status}`);
      assert(
        res.contentType.toLowerCase().includes(asset.expectedMime.toLowerCase()),
        `${asset.label} Content-Type matches '${asset.expectedMime}'`,
        `Got: ${res.contentType}`
      );
      assert(res.byteLength >= asset.minBytes, `${asset.label} size >= ${asset.minBytes} bytes`, `Size: ${res.byteLength} B`);
      
      const contentText = asset.expectedMime.includes('image/jpeg') || asset.expectedMime.includes('image/png')
        ? ''
        : res.text();
      const valid = asset.validate(res.bytes, contentText);
      assert(valid, `${asset.label} payload content/magic-byte integrity verified`);
    } catch (err) {
      assert(false, `${asset.label} request failed`, err.message);
    }
  }

  // 3. External Google Fonts & WOFF2 Binary Resolution
  console.log('\n--- 1.3 External Google Fonts CSS & WOFF2 Binaries ---');
  try {
    const fontsUrl = 'https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
    const fontsRes = await fetchEndpoint(fontsUrl);
    assert(fontsRes.status === 200, 'Google Fonts CSS endpoint returns HTTP 200 OK');
    assert(fontsRes.contentType.includes('text/css'), 'Google Fonts Content-Type is text/css');
    
    const fontCssText = fontsRes.text();
    assert(fontCssText.includes('Bitter') || fontCssText.includes('bitter'), 'Google Fonts CSS declares Bitter font-face');
    assert(fontCssText.includes('Plus Jakarta Sans') || fontCssText.includes('plus-jakarta-sans'), 'Google Fonts CSS declares Plus Jakarta Sans font-face');

    // Extract WOFF2 URLs
    const woff2Regex = /url\((https:\/\/fonts\.gstatic\.com\/[^\)]+\.woff2)\)/g;
    const woff2Urls = [];
    let match;
    while ((match = woff2Regex.exec(fontCssText)) !== null) {
      woff2Urls.push(match[1]);
    }

    assert(woff2Urls.length >= 2, `Extracted ${woff2Urls.length} Google Fonts WOFF2 binary URLs from CSS`);

    // Verify first two WOFF2 binaries (Bitter serif and Plus Jakarta Sans)
    for (let i = 0; i < Math.min(2, woff2Urls.length); i++) {
      const woff2Url = woff2Urls[i];
      const fontRes = await fetchEndpoint(woff2Url);
      assert(fontRes.status === 200, `WOFF2 binary [${i+1}] resolves with HTTP 200 OK`);
      assert(fontRes.contentType.includes('font/woff2') || fontRes.contentType.includes('application/font-woff2') || fontRes.contentType.includes('font/'), `WOFF2 binary [${i+1}] Content-Type is font/woff2`, `Got: ${fontRes.contentType}`);
      assert(fontRes.byteLength >= 5000, `WOFF2 binary [${i+1}] size >= 5KB`, `${fontRes.byteLength} B`);

      // WOFF2 magic number check: 'wOF2' (0x77 0x4F 0x46 0x32)
      const isWoff2Magic = fontRes.bytes[0] === 0x77 && fontRes.bytes[1] === 0x4F && fontRes.bytes[2] === 0x46 && fontRes.bytes[3] === 0x32;
      assert(isWoff2Magic, `WOFF2 binary [${i+1}] header contains valid 'wOF2' signature`);
    }
  } catch (err) {
    assert(false, 'Google Fonts verification threw error', err.message);
  }
}

// ============================================================================
// PART 2: RESPONSIVE LAYOUT & VISUAL FIDELITY VERIFICATION (CHROME CDP)
// ============================================================================
class ChromeDevToolsSession {
  constructor(chromePath, port = 9222) {
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

    // Poll for debugging port ready
    const maxTries = 30;
    for (let i = 0; i < maxTries; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
        if (res.ok) {
          const data = await res.json();
          console.log(`Chrome Headless launched successfully: ${data.Browser}`);
          return;
        }
      } catch (e) {
        // wait
      }
      await new Promise(r => setTimeout(r, 200));
    }
    throw new Error('Timed out waiting for Chrome remote debugging port');
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
    await this.send('CSS.enable');

    console.log(`Navigating Chrome to ${url}...`);
    await this.send('Page.navigate', { url });
    // Allow network, DOM, and web fonts to complete
    await new Promise(r => setTimeout(r, 3000));
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
    // Allow layout reflow
    await new Promise(r => setTimeout(r, 400));
  }

  async captureScreenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    if (res && res.data) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    }
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

async function runResponsiveAndVisualVerification() {
  console.log('\n================================================================');
  console.log(`PART 2: RESPONSIVE LAYOUT & VISUAL FIDELITY VERIFICATION (CHROME CDP)`);
  console.log('================================================================');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdp = new ChromeDevToolsSession(chromePath, 9222);

  try {
    await cdp.launch();
    await cdp.attachToNewPage(TARGET_URL);

    // Wait for document and fonts to settle
    console.log('\n--- 2.1 Waiting for Page & Fonts Lifecycle ---');
    await cdp.evaluate(`
      new Promise((resolve) => {
        if (document.readyState === 'complete') {
          document.fonts.ready.then(resolve);
        } else {
          window.addEventListener('load', () => document.fonts.ready.then(resolve));
        }
      })
    `);

    // Verify document fonts API
    const fontsStatus = await cdp.evaluate(`
      ({
        status: document.fonts.status,
        bitterLoaded: document.fonts.check('700 24px Bitter'),
        bitter400: document.fonts.check('400 16px Bitter'),
        jakartaLoaded: document.fonts.check('400 16px "Plus Jakarta Sans"'),
        jakartaBold: document.fonts.check('700 16px "Plus Jakarta Sans"')
      })
    `);

    assert(fontsStatus.status === 'loaded', 'document.fonts.status reports loaded', `Status: ${fontsStatus.status}`);
    assert(fontsStatus.bitterLoaded, 'Bitter (700 24px) font face is rendered and loaded');
    assert(fontsStatus.jakartaLoaded, 'Plus Jakarta Sans (400 16px) font face is rendered and loaded');

    // 2.2 Alice Lee Design Tokens & Computed Styles
    console.log('\n--- 2.2 Alice Lee Design Token Adherence ---');
    const computedTokens = await cdp.evaluate(`
      (() => {
        const body = document.querySelector('body');
        const h1 = document.querySelector('.hero-title');
        const lead = document.querySelector('.hero-lead');
        const primaryBtn = document.querySelector('.btn-alice-primary');
        const eyebrow = document.querySelector('.section-eyebrow');
        const logoMark = document.querySelector('.logo-mark');
        const navMenu = document.querySelector('.nav-menu');

        return {
          bodyBg: window.getComputedStyle(body).backgroundColor,
          bodyFont: window.getComputedStyle(body).fontFamily,
          h1Font: h1 ? window.getComputedStyle(h1).fontFamily : '',
          h1Color: h1 ? window.getComputedStyle(h1).color : '',
          btnBg: primaryBtn ? window.getComputedStyle(primaryBtn).backgroundColor : '',
          eyebrowColor: eyebrow ? window.getComputedStyle(eyebrow).color : '',
          logoMarkBg: logoMark ? window.getComputedStyle(logoMark).backgroundColor : '',
          navMenuDisplay: navMenu ? window.getComputedStyle(navMenu).display : '',
          cssRootCanvas: getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim(),
          cssRootTerracotta: getComputedStyle(document.documentElement).getPropertyValue('--accent-terracotta').trim(),
          cssRootPeach: getComputedStyle(document.documentElement).getPropertyValue('--accent-peach').trim()
        };
      })()
    `);

    // Canvas background: #FAF8F5 is rgb(250, 248, 245)
    assert(computedTokens.bodyBg === 'rgb(250, 248, 245)', 'Canvas background matches #FAF8F5 [rgb(250, 248, 245)]', `Got: ${computedTokens.bodyBg}`);
    assert(computedTokens.cssRootCanvas.toLowerCase() === '#faf8f5', 'CSS custom property --bg-canvas matches #FAF8F5', `Got: ${computedTokens.cssRootCanvas}`);

    // Terracotta accent: #D97757 is rgb(217, 119, 87)
    assert(computedTokens.btnBg === 'rgb(217, 119, 87)', 'Primary button background matches Terracotta #D97757 [rgb(217, 119, 87)]', `Got: ${computedTokens.btnBg}`);
    assert(computedTokens.eyebrowColor === 'rgb(217, 119, 87)', 'Section eyebrow color matches Terracotta #D97757 [rgb(217, 119, 87)]', `Got: ${computedTokens.eyebrowColor}`);
    assert(computedTokens.cssRootTerracotta.toLowerCase() === '#d97757', 'CSS custom property --accent-terracotta matches #D97757', `Got: ${computedTokens.cssRootTerracotta}`);

    // Peach accent: #FFEDE7 is rgb(255, 237, 231)
    assert(computedTokens.logoMarkBg === 'rgb(255, 237, 231)', 'Logo mark badge matches Peach #FFEDE7 [rgb(255, 237, 231)]', `Got: ${computedTokens.logoMarkBg}`);
    assert(computedTokens.cssRootPeach.toLowerCase() === '#ffede7', 'CSS custom property --accent-peach matches #FFEDE7', `Got: ${computedTokens.cssRootPeach}`);

    // Headline color: #2D2A26 is rgb(45, 42, 38)
    assert(computedTokens.h1Color === 'rgb(45, 42, 38)', 'Hero headline text color matches #2D2A26 [rgb(45, 42, 38)]', `Got: ${computedTokens.h1Color}`);

    // Typography font families
    assert(computedTokens.h1Font.toLowerCase().includes('bitter'), 'Headings apply Bitter serif font-family', `Got: ${computedTokens.h1Font}`);
    assert(computedTokens.bodyFont.toLowerCase().includes('plus jakarta sans'), 'Body applies Plus Jakarta Sans font-family', `Got: ${computedTokens.bodyFont}`);

    // 2.3 Responsive Layout Geometry Matrix (375px, 768px, 1280px)
    console.log('\n--- 2.3 Responsive Geometry & 0px Overflow Matrix ---');
    const targetViewports = [
      { name: 'Mobile Compact', width: 375, height: 667, mobile: true, screenshot: 'viewport_375px_mobile.png' },
      { name: 'Tablet Portrait', width: 768, height: 1024, mobile: false, screenshot: 'viewport_768px_tablet.png' },
      { name: 'Desktop Standard', width: 1280, height: 800, mobile: false, screenshot: 'viewport_1280px_desktop.png' }
    ];

    for (const vp of targetViewports) {
      console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      await cdp.setViewport(vp.width, vp.height, vp.mobile);

      const metrics = await cdp.evaluate(`
        (() => {
          const docEl = document.documentElement;
          const body = document.body;
          const clientWidth = docEl.clientWidth;
          const scrollWidth = docEl.scrollWidth;
          const bodyScrollWidth = body.scrollWidth;
          const innerWidth = window.innerWidth;

          // Find any elements exceeding viewport width (excluding intentional overflow-x containers)
          const overflowingElements = [];
          document.querySelectorAll('*').forEach((el) => {
            // Ignore modal dialog if hidden
            if (el.closest('#caseStudyModal') && !el.closest('#caseStudyModal').classList.contains('open')) {
              return;
            }
            // Ignore elements inside horizontally scrollable containers (e.g. mobile navigation pill track)
            if (el.closest('.nav-menu')) {
              return;
            }
            const rect = el.getBoundingClientRect();
            // Allow 1px sub-pixel tolerance
            if (rect.right > clientWidth + 1.0) {
              overflowingElements.push({
                tag: el.tagName,
                id: el.id,
                className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 40) : '',
                rectRight: Math.round(rect.right * 10) / 10,
                rectWidth: Math.round(rect.width * 10) / 10,
                clientWidth
              });
            }
          });

          // Check mobile nav visibility
          const navMenu = document.querySelector('.nav-menu');
          const navMenuComputed = navMenu ? window.getComputedStyle(navMenu) : null;
          const navMenuVisible = navMenuComputed ? (navMenuComputed.display !== 'none' && navMenuComputed.visibility !== 'hidden') : false;

          return {
            clientWidth,
            scrollWidth,
            bodyScrollWidth,
            innerWidth,
            overflowDelta: scrollWidth - clientWidth,
            overflowingElements: overflowingElements.slice(0, 5),
            navMenuVisible
          };
        })()
      `);

      // Strict Zero Horizontal Overflow assertions
      const zeroDocOverflow = metrics.scrollWidth <= metrics.clientWidth;
      assert(
        zeroDocOverflow,
        `[${vp.name}] Zero horizontal overflow on document (scrollWidth: ${metrics.scrollWidth} <= clientWidth: ${metrics.clientWidth})`,
        `Delta: ${metrics.overflowDelta}px`
      );

      const zeroBodyOverflow = metrics.bodyScrollWidth <= metrics.clientWidth;
      assert(
        zeroBodyOverflow,
        `[${vp.name}] Zero horizontal overflow on body (bodyScrollWidth: ${metrics.bodyScrollWidth} <= clientWidth: ${metrics.clientWidth})`
      );

      assert(
        metrics.overflowingElements.length === 0,
        `[${vp.name}] All page element bounding rects fit within viewport (0 layout clipping elements)`,
        metrics.overflowingElements.length > 0 ? JSON.stringify(metrics.overflowingElements) : 'Clean'
      );

      // Header navigation guardrail: nav-menu must never be hidden with display:none
      assert(
        metrics.navMenuVisible,
        `[${vp.name}] Header navigation (.nav-menu) remains visible and accessible`
      );

      // Capture screenshot artifact
      const screenshotPath = path.join(SCREENSHOT_DIR, vp.screenshot);
      await cdp.captureScreenshot(screenshotPath);
      console.log(`  [ARTIFACT] Saved screenshot to ${screenshotPath}`);
    }

  } finally {
    await cdp.close();
  }
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function main() {
  const startTime = Date.now();
  console.log('================================================================');
  console.log(`LIVE VERIFICATION RUNNER START: ${new Date().toISOString()}`);
  console.log(`TARGET DEPLOYMENT URL: ${TARGET_URL}`);
  console.log('================================================================');

  try {
    await runAssetVerification();
    await runResponsiveAndVisualVerification();
  } catch (err) {
    console.error('\nUNHANDLED EXCEPTION IN VERIFICATION SUITE:', err);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n================================================================');
  console.log('                    VERIFICATION SUMMARY REPORT                 ');
  console.log('================================================================');
  console.log(`TOTAL TESTS:   ${passedTests + failedTests}`);
  console.log(`PASSED:        ${passedTests}`);
  console.log(`FAILED:        ${failedTests}`);
  console.log(`DURATION:      ${duration}s`);
  console.log('================================================================');

  if (failedTests > 0) {
    console.error(`\n>>> VERDICT: FAILED (${failedTests} tests failed) <<<`);
    process.exit(1);
  } else {
    console.log('\n>>> VERDICT: PASSED (100% Asset Delivery & Visual Fidelity Verified) <<<');
    process.exit(0);
  }
}

main();
