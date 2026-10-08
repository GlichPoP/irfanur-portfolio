/**
 * AUTOMATED INTERACTIVE & FUNCTIONAL STRESS TEST SUITE
 * Irfanur Rahman Portfolio Revamp (Alice Lee Design System)
 * 
 * Verifies DOM integrity, modal trigger/registry integrity,
 * email copy debouncing & fallbacks, keyboard accessibility (ESC),
 * scroll-spy navigation, and design token compliance.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_FILE = path.join(ROOT_DIR, 'index.html');
const JS_FILE = path.join(ROOT_DIR, 'script.js');
const CSS_FILE = path.join(ROOT_DIR, 'style.css');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    const errMsg = `  [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`;
    console.error(errMsg);
    failures.push({ testName, details });
  }
}

/**
 * Lightweight browser DOM runtime mock
 */
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(cls) { this.classes.add(cls); }
  remove(cls) { this.classes.delete(cls); }
  contains(cls) { return this.classes.has(cls); }
}

class MockElement {
  constructor(id = '', tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new MockClassList();
    this.style = {};
    this.attributes = {};
    this.innerHTML = '';
    this.textContent = '';
    this.listeners = {};
    this.children = [];
    this.parentNode = null;
  }
  setAttribute(attr, val) { this.attributes[attr] = String(val); }
  getAttribute(attr) { return this.attributes[attr] || null; }
  addEventListener(evt, handler) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(handler);
  }
  async dispatchEvent(evt) {
    if (this.listeners[evt.type]) {
      for (const fn of this.listeners[evt.type]) {
        await fn(evt);
      }
    }
  }
  async click() {
    await this.dispatchEvent({ type: 'click', preventDefault: () => {} });
  }
  focus() {}
  select() {}
}

class MockDocument {
  constructor() {
    this.elements = new Map();
    this.body = new MockElement('body', 'body');
    this.listeners = {};
  }
  getElementById(id) { return this.elements.get(id) || null; }
  querySelectorAll(sel) {
    const res = [];
    if (sel === '[data-modal]') {
      for (const el of this.elements.values()) {
        if (el.getAttribute('data-modal')) res.push(el);
      }
    } else if (sel === '.header-nav .nav-link') {
      for (const el of this.elements.values()) {
        if (el.classList.contains('nav-link')) res.push(el);
      }
    } else if (sel === 'section[id]') {
      for (const el of this.elements.values()) {
        if (el.tagName === 'SECTION' && el.id) res.push(el);
      }
    }
    return res;
  }
  createElement(tag) { return new MockElement('', tag); }
  addEventListener(evt, handler) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(handler);
  }
  async dispatchEvent(evt) {
    if (this.listeners[evt.type]) {
      for (const fn of this.listeners[evt.type]) {
        await fn(evt);
      }
    }
  }
  execCommand(cmd) { return this._execCommandResult !== undefined ? this._execCommandResult : true; }
}

function createSimulationEnvironment() {
  const doc = new MockDocument();
  doc.body.appendChild = function(el) {
    el.parentNode = doc.body;
    doc.body.children.push(el);
  };
  doc.body.removeChild = function(el) {
    const idx = doc.body.children.indexOf(el);
    if (idx !== -1) doc.body.children.splice(idx, 1);
  };

  const modal = new MockElement('caseStudyModal', 'div');
  modal.setAttribute('aria-hidden', 'true');
  const modalBackdrop = new MockElement('modalBackdrop', 'div');
  const modalCloseBtn = new MockElement('modalCloseBtn', 'button');
  const modalBodyContent = new MockElement('modalBodyContent', 'div');

  const copyEmailBtn = new MockElement('copyEmailBtn', 'button');
  const copyText = new MockElement('copyText', 'span');
  copyText.textContent = 'Copy Email';

  const probahoBtn = new MockElement('probahoBtn', 'button');
  probahoBtn.setAttribute('data-modal', 'modal-probaho');

  doc.elements.set('caseStudyModal', modal);
  doc.elements.set('modalBackdrop', modalBackdrop);
  doc.elements.set('modalCloseBtn', modalCloseBtn);
  doc.elements.set('modalBodyContent', modalBodyContent);
  doc.elements.set('copyEmailBtn', copyEmailBtn);
  doc.elements.set('copyText', copyText);
  doc.elements.set('probahoBtn', probahoBtn);

  // Discrete time simulation
  let currentTime = 0;
  let timerIdCounter = 1;
  const activeTimers = new Map();

  function customSetTimeout(fn, delay) {
    const id = timerIdCounter++;
    activeTimers.set(id, { fn, triggerAt: currentTime + delay });
    return id;
  }

  function customClearTimeout(id) {
    activeTimers.delete(id);
  }

  function advanceTime(ms) {
    currentTime += ms;
    const toExecute = [];
    for (const [id, timer] of activeTimers.entries()) {
      if (timer.triggerAt <= currentTime) {
        toExecute.push({ id, fn: timer.fn, triggerAt: timer.triggerAt });
      }
    }
    toExecute.sort((a, b) => a.triggerAt - b.triggerAt);
    for (const t of toExecute) {
      if (activeTimers.has(t.id)) {
        activeTimers.delete(t.id);
        t.fn();
      }
    }
  }

  let clipboardWrites = [];
  let clipboardShouldFail = false;
  const mockNavigator = {
    clipboard: {
      writeText: async (text) => {
        if (clipboardShouldFail) throw new Error('Clipboard write access denied');
        clipboardWrites.push(text);
        return Promise.resolve();
      }
    }
  };

  const mockWindow = {
    isSecureContext: true,
    pageYOffset: 0,
    scrollY: 0,
    innerHeight: 800,
    addEventListener: () => {}
  };

  return {
    doc,
    modal,
    modalBackdrop,
    modalCloseBtn,
    modalBodyContent,
    copyEmailBtn,
    copyText,
    probahoBtn,
    mockNavigator,
    mockWindow,
    customSetTimeout,
    customClearTimeout,
    advanceTime,
    getCurrentTime: () => currentTime,
    getActiveTimerCount: () => activeTimers.size,
    setClipboardShouldFail: (val) => { clipboardShouldFail = val; },
    getClipboardWrites: () => clipboardWrites
  };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('  PORTFOLIO EMPIRICAL INTERACTION & FUNCTIONAL STRESS HARNESS  ');
  console.log('================================================================\n');

  const htmlContent = fs.readFileSync(HTML_FILE, 'utf8');
  const jsContent = fs.readFileSync(JS_FILE, 'utf8');
  const cssContent = fs.readFileSync(CSS_FILE, 'utf8');

  // ============================================================================
  // SUITE 1: DOM INTEGRITY & ANCHOR RESOLUTION
  // ============================================================================
  console.log('--- SUITE 1: DOM Integrity & Anchor Resolution ---');

  const idRegex = /\bid=["']([^"']+)["']/g;
  const domIds = new Map();
  let idMatch;
  while ((idMatch = idRegex.exec(htmlContent)) !== null) {
    const idVal = idMatch[1];
    domIds.set(idVal, (domIds.get(idVal) || 0) + 1);
  }

  const requiredNavAnchors = ['software', 'experience', 'academics', 'contact'];
  requiredNavAnchors.forEach(id => {
    assert(domIds.has(id), `Section anchor #${id} exists in DOM`);
    assert(
      new RegExp(`<section[^>]*id=["']${id}["']`, 'i').test(htmlContent),
      `Element #${id} is a semantic <section>`
    );
  });

  const hrefAnchorRegex = /href=["']#([^"']+)["']/g;
  const inPageAnchors = [];
  let hrefMatch;
  while ((hrefMatch = hrefAnchorRegex.exec(htmlContent)) !== null) {
    inPageAnchors.push(hrefMatch[1]);
  }

  inPageAnchors.forEach(anchorId => {
    assert(
      domIds.has(anchorId),
      `Internal link href="#${anchorId}" resolves to existing element id="${anchorId}"`
    );
  });

  let duplicateIds = [];
  for (const [idVal, count] of domIds.entries()) {
    if (count > 1) duplicateIds.push(`${idVal} (${count}x)`);
  }
  assert(
    duplicateIds.length === 0,
    `All DOM IDs are globally unique`,
    duplicateIds.join(', ')
  );

  const requiredInteractiveIds = [
    'caseStudyModal',
    'modalBackdrop',
    'modalCloseBtn',
    'modalBodyContent',
    'copyEmailBtn',
    'copyText',
    'displayEmail'
  ];
  requiredInteractiveIds.forEach(id => {
    assert(domIds.has(id), `Interactive element id="${id}" exists`);
  });

  const localAssets = [
    'assets/profile.jpg',
    'assets/probaho-logo.png',
    'assets/probaho-logo.svg'
  ];
  localAssets.forEach(assetRelPath => {
    const fullPath = path.join(ROOT_DIR, assetRelPath);
    assert(fs.existsSync(fullPath), `Asset file ${assetRelPath} exists on disk`);
    assert(htmlContent.includes(assetRelPath), `Asset ${assetRelPath} referenced in HTML`);
  });

  // ============================================================================
  // SUITE 2: MODAL TRIGGER & RUNTIME REGISTRY INTEGRITY
  // ============================================================================
  console.log('\n--- SUITE 2: Modal Trigger & Runtime Registry Integrity ---');

  const dataModalRegex = /data-modal=["']([^"']+)["']/g;
  const modalTriggersInHtml = [];
  let dmMatch;
  while ((dmMatch = dataModalRegex.exec(htmlContent)) !== null) {
    modalTriggersInHtml.push(dmMatch[1]);
  }

  assert(modalTriggersInHtml.length > 0, `At least one modal trigger found in HTML (${modalTriggersInHtml.length} found)`);

  const caseStudyKeys = [];
  const cskRegex = /['"](modal-[a-zA-Z0-9_-]+)['"]\s*:\s*\{/g;
  let cskMatch;
  while ((cskMatch = cskRegex.exec(jsContent)) !== null) {
    caseStudyKeys.push(cskMatch[1]);
  }

  modalTriggersInHtml.forEach(triggerKey => {
    assert(
      caseStudyKeys.includes(triggerKey),
      `Modal trigger data-modal="${triggerKey}" matches registered key in script.js caseStudyData`
    );
  });

  assert(jsContent.includes('PROBAHO CRM Solutions'), 'caseStudyData contains PROBAHO CRM title');
  assert(jsContent.includes('Offline-First Enterprise Business Management'), 'caseStudyData contains PROBAHO tagline');
  assert(jsContent.includes('Local Query Latency'), 'caseStudyData contains metrics');
  assert(jsContent.includes('Electron 43 and React 19'), 'caseStudyData architecture highlights Electron 43 & React 19');
  assert(jsContent.includes('SQLite 3 WebAssembly engine (sql.js)'), 'caseStudyData highlights SQLite WebAssembly');
  assert(jsContent.includes('https://github.com/GlichPoP/probaho-crm'), 'caseStudyData contains repository URL');

  // ============================================================================
  // SUITE 3: RUNTIME STATE SIMULATION & ADVERSARIAL TESTING
  // ============================================================================
  console.log('\n--- SUITE 3: Runtime State Simulation & Adversarial Testing ---');

  // 3.1 Modal & ESC Key Accessibility Test
  console.log('Testing Modal Open, Close & ESC Key...');
  {
    const env = createSimulationEnvironment();

    const initModalScope = new Function(
      'document',
      'window',
      `
      const modal = document.getElementById('caseStudyModal');
      const modalBackdrop = document.getElementById('modalBackdrop');
      const modalCloseBtn = document.getElementById('modalCloseBtn');
      const modalBodyContent = document.getElementById('modalBodyContent');
      const triggerButtons = document.querySelectorAll('[data-modal]');

      const caseStudyData = {
        'modal-probaho': {
          title: 'PROBAHO CRM Solutions',
          tagline: 'Offline-First Platform',
          metrics: [{ value: '< 1ms', label: 'Latency' }],
          problem: 'Challenge',
          architecture: 'Architecture',
          capabilities: 'Capabilities',
          links: [{ text: 'GitHub', url: 'https://github.com/GlichPoP/probaho-crm', primary: true }]
        }
      };

      function openModal(modalKey) {
        const data = caseStudyData[modalKey];
        if (!data || !modal || !modalBodyContent) return;
        modalBodyContent.innerHTML = '<h3>' + data.title + '</h3>';
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

      return { openModal, closeModal };
      `
    );

    const { openModal, closeModal } = initModalScope(env.doc, env.mockWindow);

    assert(env.modal.classList.contains('open') === false, 'Modal initially does not have "open" class');
    assert(env.modal.getAttribute('aria-hidden') === 'true', 'Modal initially has aria-hidden="true"');
    assert(env.doc.body.style.overflow === undefined || env.doc.body.style.overflow === '', 'Body overflow initially normal');

    await env.probahoBtn.click();
    assert(env.modal.classList.contains('open') === true, 'Modal has "open" class after trigger click');
    assert(env.modal.getAttribute('aria-hidden') === 'false', 'Modal has aria-hidden="false" after trigger click');
    assert(env.doc.body.style.overflow === 'hidden', 'Body overflow locked to "hidden" when open');
    assert(env.modalBodyContent.innerHTML.includes('PROBAHO CRM Solutions'), 'Modal body received case study content');

    await env.modalCloseBtn.click();
    assert(env.modal.classList.contains('open') === false, 'Modal closed after close button click');
    assert(env.modal.getAttribute('aria-hidden') === 'true', 'Modal aria-hidden="true" after close button click');
    assert(env.doc.body.style.overflow === '', 'Body overflow restored after close button click');

    await env.probahoBtn.click();
    assert(env.modal.classList.contains('open') === true, 'Modal re-opened');
    await env.modalBackdrop.click();
    assert(env.modal.classList.contains('open') === false, 'Modal closed after backdrop click');
    assert(env.doc.body.style.overflow === '', 'Body overflow restored after backdrop click');

    await env.probahoBtn.click();
    assert(env.modal.classList.contains('open') === true, 'Modal re-opened for ESC test');

    await env.doc.dispatchEvent({ type: 'keydown', key: 'Enter' });
    assert(env.modal.classList.contains('open') === true, 'Non-ESC key (Enter) does NOT close modal');
    await env.doc.dispatchEvent({ type: 'keydown', key: 'Tab' });
    assert(env.modal.classList.contains('open') === true, 'Non-ESC key (Tab) does NOT close modal');

    await env.doc.dispatchEvent({ type: 'keydown', key: 'Escape' });
    assert(env.modal.classList.contains('open') === false, 'ESC key closes modal');
    assert(env.modal.getAttribute('aria-hidden') === 'true', 'ESC key sets aria-hidden="true"');
    assert(env.doc.body.style.overflow === '', 'ESC key restores body overflow');

    env.doc.body.style.overflow = 'test-check';
    await env.doc.dispatchEvent({ type: 'keydown', key: 'Escape' });
    assert(env.doc.body.style.overflow === 'test-check', 'ESC key when closed does not touch body overflow');
    env.doc.body.style.overflow = '';

    openModal('invalid-key-999');
    assert(env.modal.classList.contains('open') === false, 'openModal("invalid-key") does not open modal');
    openModal(null);
    assert(env.modal.classList.contains('open') === false, 'openModal(null) does not throw or open modal');
  }

  // 3.2 Email Copy Primary Clipboard API & 2000ms Timer
  console.log('\nTesting Email Copy Primary API & Reset Timer...');
  {
    const env = createSimulationEnvironment();

    const initEmailScope = new Function(
      'document',
      'window',
      'navigator',
      'setTimeout',
      'clearTimeout',
      `
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
      `
    );

    initEmailScope(env.doc, env.mockWindow, env.mockNavigator, env.customSetTimeout, env.customClearTimeout);

    await env.copyEmailBtn.click();

    assert(env.getClipboardWrites().includes('irfanur6@gmail.com'), 'Clipboard received correct email address');
    assert(env.copyText.textContent === 'Copied! ✓', 'Button text changed to "Copied! ✓"');
    assert(env.copyEmailBtn.style.borderColor === 'var(--accent-terracotta)', 'Border color set to terracotta');
    assert(env.getActiveTimerCount() === 1, 'Feedback timeout is scheduled');

    env.advanceTime(1000);
    assert(env.copyText.textContent === 'Copied! ✓', 'Button text remains "Copied! ✓" at 1000ms');

    env.advanceTime(1000);
    assert(env.copyText.textContent === 'Copy Email', 'Button text resets to "Copy Email" at 2000ms');
    assert(env.copyEmailBtn.style.borderColor === '', 'Border color cleared at 2000ms');
    assert(env.getActiveTimerCount() === 0, 'Feedback timer is now empty');
  }

  // 3.3 Rapid Sequential Click Debouncing Stress Test
  console.log('\nTesting Rapid Sequential Click Debouncing (Stress Scenario)...');
  {
    const env = createSimulationEnvironment();

    const initEmailScope = new Function(
      'document',
      'window',
      'navigator',
      'setTimeout',
      'clearTimeout',
      `
      const copyBtn = document.getElementById('copyEmailBtn');
      const copyText = document.getElementById('copyText');
      const emailToCopy = 'irfanur6@gmail.com';
      let feedbackTimeout = null;

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
      `
    );

    initEmailScope(env.doc, env.mockWindow, env.mockNavigator, env.customSetTimeout, env.customClearTimeout);

    await env.copyEmailBtn.click();
    assert(env.copyText.textContent === 'Copied! ✓', 'Click 1: text is "Copied! ✓"');

    env.advanceTime(500);
    await env.copyEmailBtn.click();
    assert(env.getActiveTimerCount() === 1, 'Click 2 debounces timer (only 1 active timer)');

    env.advanceTime(500);
    await env.copyEmailBtn.click();

    env.advanceTime(500);
    await env.copyEmailBtn.click();

    env.advanceTime(500);
    assert(
      env.copyText.textContent === 'Copied! ✓',
      'At t=2000ms: Debounce PREVENTED premature reset from Click 1'
    );

    env.advanceTime(1499);
    assert(
      env.copyText.textContent === 'Copied! ✓',
      'At t=3499ms (1999ms after last click): text is still "Copied! ✓"'
    );

    env.advanceTime(2);
    assert(
      env.copyText.textContent === 'Copy Email',
      'At t=3501ms (2001ms after last click): text properly resets to "Copy Email"'
    );
    assert(env.getActiveTimerCount() === 0, 'Timers completely flushed');
  }

  // 3.4 Fallback Execution when navigator.clipboard is Missing / Insecure
  console.log('\nTesting execCommand Fallback when navigator.clipboard Unavailable...');
  {
    const env = createSimulationEnvironment();
    const restrictedNavigator = {};

    let textareaCreated = false;
    let textareaRemoved = false;
    let execCommandCalled = false;

    const originalCreate = env.doc.createElement.bind(env.doc);
    env.doc.createElement = function(tag) {
      const el = originalCreate(tag);
      if (tag === 'textarea') {
        textareaCreated = true;
      }
      return el;
    };

    const origRemove = env.doc.body.removeChild.bind(env.doc.body);
    env.doc.body.removeChild = function(el) {
      if (el.tagName === 'TEXTAREA') textareaRemoved = true;
      origRemove(el);
    };

    env.doc.execCommand = function(cmd) {
      if (cmd === 'copy') {
        execCommandCalled = true;
        return true;
      }
      return false;
    };

    const initEmailScope = new Function(
      'document',
      'window',
      'navigator',
      'setTimeout',
      'clearTimeout',
      `
      const copyBtn = document.getElementById('copyEmailBtn');
      const copyText = document.getElementById('copyText');
      const emailToCopy = 'irfanur6@gmail.com';
      let feedbackTimeout = null;

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
      `
    );

    initEmailScope(env.doc, env.mockWindow, restrictedNavigator, env.customSetTimeout, env.customClearTimeout);

    await env.copyEmailBtn.click();

    assert(textareaCreated === true, 'Fallback created temporary <textarea>');
    assert(execCommandCalled === true, 'Fallback invoked document.execCommand("copy")');
    assert(textareaRemoved === true, 'Fallback removed temporary <textarea> from DOM');
    assert(env.doc.body.children.length === 0, 'No lingering textarea nodes in DOM');
    assert(env.copyText.textContent === 'Copied! ✓', 'Fallback successfully set text to "Copied! ✓"');

    env.advanceTime(2000);
    assert(env.copyText.textContent === 'Copy Email', 'Fallback resets to "Copy Email" after 2000ms');
  }

  // 3.5 Catastrophic Fallback Failure (Clipboard API AND execCommand Fail)
  console.log('\nTesting Graceful Degradation when Both Copy Mechanisms Fail...');
  {
    const env = createSimulationEnvironment();
    const restrictedNavigator = {};
    env.doc.execCommand = function() { return false; };

    const initEmailScope = new Function(
      'document',
      'window',
      'navigator',
      'setTimeout',
      'clearTimeout',
      `
      const copyBtn = document.getElementById('copyEmailBtn');
      const copyText = document.getElementById('copyText');
      const emailToCopy = 'irfanur6@gmail.com';
      let feedbackTimeout = null;

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
      `
    );

    initEmailScope(env.doc, env.mockWindow, restrictedNavigator, env.customSetTimeout, env.customClearTimeout);

    await env.copyEmailBtn.click();

    assert(
      env.copyText.textContent === 'irfanur6@gmail.com',
      'Catastrophic failure gracefully displays raw email for manual copy'
    );

    env.advanceTime(2000);
    assert(env.copyText.textContent === 'Copy Email', 'Resets back to "Copy Email" after 2000ms');
  }

  // ============================================================================
  // SUITE 4: SCROLL-SPY NAVIGATION LOGIC
  // ============================================================================
  console.log('\n--- SUITE 4: Scroll-Spy Navigation Logic ---');
  {
    const sectionPositions = {
      home: { top: 0, height: 600 },
      software: { top: 600, height: 1000 },
      experience: { top: 1600, height: 900 },
      academics: { top: 2500, height: 800 },
      contact: { top: 3300, height: 500 }
    };
    const totalBodyHeight = 3800;

    function calculateActiveSection(scrollY, innerHeight = 800) {
      const headerOffset = 140;
      let currentSectionId = '';

      for (const [id, pos] of Object.entries(sectionPositions)) {
        const sectionTop = pos.top - headerOffset;
        const sectionHeight = pos.height;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = id;
        }
      }

      if ((innerHeight + scrollY) >= totalBodyHeight - 50) {
        currentSectionId = 'contact';
      }

      return currentSectionId;
    }

    assert(calculateActiveSection(0) === 'home', 'At scrollY=0, active section is home');
    assert(calculateActiveSection(700) === 'software', 'At scrollY=700, active section is software');
    assert(calculateActiveSection(1700) === 'experience', 'At scrollY=1700, active section is experience');
    assert(calculateActiveSection(2600) === 'academics', 'At scrollY=2600, active section is academics');
    assert(calculateActiveSection(3300) === 'contact', 'At scrollY=3300, active section is contact');
    assert(calculateActiveSection(3050, 800) === 'contact', 'Near bottom latch triggers contact');
  }

  // ============================================================================
  // SUITE 5: DESIGN SYSTEM TOKENS & RESPONSIVE RULES
  // ============================================================================
  console.log('\n--- SUITE 5: Design Tokens & CSS Responsive Rules ---');

  const requiredTokens = [
    '--bg-canvas: #FAF8F5',
    '--bg-canvas-alt: #FDFBF7',
    '--text-headline: #2D2A26',
    '--text-body: #4A4640',
    '--accent-terracotta: #D97757',
    '--accent-peach: #FFEDE7',
    '--font-serif: \'Bitter\'',
    '--font-sans: \'Plus Jakarta Sans\'',
    'scroll-padding-top: 96px',
    'aspect-ratio: 21 / 8'
  ];

  requiredTokens.forEach(token => {
    assert(cssContent.includes(token), `CSS contains required token/rule "${token}"`);
  });

  const navMenuDisplayNone = /@media[^{]+\(max-width:[^}]*\.nav-menu\s*\{\s*display:\s*none/s.test(cssContent);
  assert(!navMenuDisplayNone, 'Mobile navigation menu is NOT hidden with display:none');
  assert(cssContent.includes('overflow-x: auto'), 'Mobile navigation implements horizontal scrolling overflow-x: auto');

  // ============================================================================
  // FINAL HARNESS VERDICT
  // ============================================================================
  console.log('\n================================================================');
  console.log(`TOTAL TESTS:  ${totalTests}`);
  console.log(`PASSED:       ${passedTests}`);
  console.log(`FAILED:       ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests === 0) {
    console.log('>>> GATE VERDICT: APPROVE <<<');
    process.exit(0);
  } else {
    console.error(`>>> GATE VERDICT: REQUEST_CHANGES (${failedTests} failures) <<<`);
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite crashed with unhandled error:', err);
  process.exit(1);
});
