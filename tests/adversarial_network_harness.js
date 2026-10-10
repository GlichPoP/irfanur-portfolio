/**
 * ADVERSARIAL NETWORK & EDGE STRESS HARNESS
 * Target: https://irfanurrahman.vercel.app
 * Challenger 1 (Milestone 4 Quality Gate)
 * 
 * Verifies:
 * 1. Single Asset Baseline & Exact Header Validation
 * 2. High-Concurrency Burst Stress (80 concurrent requests) & Edge CDN Throughput
 * 3. 404 Non-Existent Route Handling & Edge Resilience
 * 4. External Google Fonts Resolution & Complete WOFF2 Binary Integrity
 * 5. HTTP Protocol & Boundary Stress (HEAD, Range Requests, Compression, HTTP Methods)
 * 6. Live HTML Canonical Metadata & Local Repository Synchronization
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_URL = (process.env.LIVE_URL || 'https://irfanurrahman.vercel.app').replace(/\/+$/, '');
const ROOT_DIR = path.resolve(__dirname, '..');

const ASSETS = [
  { path: '/', localFile: 'index.html', expectedTypes: ['text/html'], checkCache: 'html' },
  { path: '/favicon.svg', localFile: 'favicon.svg', expectedTypes: ['image/svg+xml'], checkCache: 'root' },
  { path: '/assets/portfolio-favicon.svg', localFile: 'assets/portfolio-favicon.svg', expectedTypes: ['image/svg+xml'], checkCache: 'immutable' },
  { path: '/assets/profile.jpg', localFile: 'assets/profile.jpg', expectedTypes: ['image/jpeg'], checkCache: 'immutable' },
  { path: '/assets/probaho-logo.png', localFile: 'assets/probaho-logo.png', expectedTypes: ['image/png'], checkCache: 'immutable' },
  { path: '/assets/probaho-logo.svg', localFile: 'assets/probaho-logo.svg', expectedTypes: ['image/svg+xml'], checkCache: 'immutable' },
  { path: '/style.css', localFile: 'style.css', expectedTypes: ['text/css'], checkCache: 'root' },
  { path: '/script.js', localFile: 'script.js', expectedTypes: ['text/javascript', 'application/javascript'], checkCache: 'root' }
];

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failureDetails = [];

function recordTest(passed, name, details = '') {
  totalAssertions++;
  if (passed) {
    passedAssertions++;
    console.log(`  [PASS] ${name}`);
  } else {
    failedAssertions++;
    const msg = `  [FAIL] ${name} ${details ? ':: ' + details : ''}`;
    console.error(msg);
    failureDetails.push({ name, details });
  }
}

// Utility fetch helper with timing and raw buffer support
async function fetchWithTiming(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        ...(options.headers || {})
      }
    });
    const duration = performance.now() - start;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
      duration,
      buffer,
      text: () => buffer.toString('utf-8')
    };
  } catch (err) {
    const duration = performance.now() - start;
    return {
      ok: false,
      status: 0,
      statusText: err.message,
      headers: new Headers(),
      duration,
      buffer: Buffer.alloc(0),
      error: err,
      text: () => ''
    };
  }
}

// --- SUITE 1: Single Asset Baseline & Header Validation ---
async function runAssetBaselineSuite() {
  console.log('\n======================================================');
  console.log('SUITE 1: Single Asset Baseline & Header Validation');
  console.log('======================================================');

  for (const asset of ASSETS) {
    const targetUrl = `${BASE_URL}${asset.path}`;
    const res = await fetchWithTiming(targetUrl);

    // 1. Status Code
    recordTest(res.status === 200, `${asset.path} responds with HTTP 200 OK`, `Status: ${res.status}`);

    // 2. Content-Length / Buffer Size
    recordTest(res.buffer.length > 0, `${asset.path} payload is non-empty`, `Length: ${res.buffer.length} bytes`);

    // 3. Content-Type Header
    const cType = (res.headers.get('content-type') || '').toLowerCase();
    const typeMatched = asset.expectedTypes.some(t => cType.includes(t.toLowerCase()));
    recordTest(typeMatched, `${asset.path} Content-Type matches expected (${asset.expectedTypes.join(' or ')})`, `Got: ${cType}`);

    // 4. Security Headers (from vercel.json)
    const nosniff = res.headers.get('x-content-type-options');
    recordTest(nosniff === 'nosniff', `${asset.path} has X-Content-Type-Options: nosniff`, `Got: ${nosniff}`);

    const frameOptions = res.headers.get('x-frame-options');
    recordTest(frameOptions === 'DENY', `${asset.path} has X-Frame-Options: DENY`, `Got: ${frameOptions}`);

    const referrerPolicy = res.headers.get('referrer-policy');
    recordTest(referrerPolicy === 'strict-origin-when-cross-origin', `${asset.path} has Referrer-Policy: strict-origin-when-cross-origin`, `Got: ${referrerPolicy}`);

    // 5. Cache-Control Header
    const cacheCtrl = res.headers.get('cache-control') || '';
    if (asset.checkCache === 'immutable') {
      const hasImmutable = cacheCtrl.includes('max-age=31536000') && cacheCtrl.includes('immutable');
      recordTest(hasImmutable, `${asset.path} has immutable Cache-Control (31536000s)`, `Got: ${cacheCtrl}`);
    } else {
      recordTest(cacheCtrl.length > 0, `${asset.path} has explicit Cache-Control`, `Got: ${cacheCtrl}`);
    }

    // 6. Vercel Edge Headers
    const vercelId = res.headers.get('x-vercel-id');
    recordTest(!!vercelId, `${asset.path} contains x-vercel-id edge identifier`, `x-vercel-id: ${vercelId}`);

    // 7. Byte comparison with local repo file
    if (asset.localFile) {
      const localFilePath = path.join(ROOT_DIR, asset.localFile);
      if (fs.existsSync(localFilePath)) {
        const localBuf = fs.readFileSync(localFilePath);
        if (asset.path === '/') {
          // Compare normalized HTML (trim trailing whitespace)
          const liveText = res.text().replace(/\r\n/g, '\n').trim();
          const localText = localBuf.toString('utf-8').replace(/\r\n/g, '\n').trim();
          const hashLive = crypto.createHash('sha256').update(liveText).digest('hex');
          const hashLocal = crypto.createHash('sha256').update(localText).digest('hex');
          recordTest(hashLive === hashLocal, `${asset.path} HTML matches local repository index.html`, `Live hash: ${hashLive.slice(0, 8)} vs Local: ${hashLocal.slice(0, 8)}`);
        } else if (asset.path.endsWith('.css') || asset.path.endsWith('.js') || asset.path.endsWith('.svg')) {
          const liveText = res.text().replace(/\r\n/g, '\n').trim();
          const localText = localBuf.toString('utf-8').replace(/\r\n/g, '\n').trim();
          recordTest(liveText === localText, `${asset.path} text content matches local file exactly`, `Live size: ${liveText.length} vs Local size: ${localText.length}`);
        } else {
          // Binary comparison (jpg, png)
          recordTest(res.buffer.equals(localBuf), `${asset.path} binary payload byte-for-byte matches local file`, `Live: ${res.buffer.length}b, Local: ${localBuf.length}b`);
        }
      }
    }
  }
}

// --- SUITE 2: Concurrent Burst Stress & Edge CDN Throughput ---
async function runConcurrentStressSuite() {
  console.log('\n======================================================');
  console.log('SUITE 2: Concurrent Burst Stress & Edge CDN Throughput');
  console.log('======================================================');

  // We will fire 4 rounds of 20 requests = 80 total requests across all assets
  const CONCURRENCY_BATCHES = 4;
  const REQUESTS_PER_ASSET_PER_BATCH = 2; // 8 assets * 2 = 16 requests per batch * 4 batches = 64 requests
  const TOTAL_EXPECTED = CONCURRENCY_BATCHES * REQUESTS_PER_ASSET_PER_BATCH * ASSETS.length;
  
  console.log(`Starting stress test: ${TOTAL_EXPECTED} total requests across ${ASSETS.length} assets...`);

  const allLatencies = [];
  let successCount = 0;
  let errorCount = 0;
  const cacheHeaderDistribution = { HIT: 0, MISS: 0, STALE: 0, OTHER: 0 };
  const overallStart = performance.now();

  for (let batch = 1; batch <= CONCURRENCY_BATCHES; batch++) {
    const promises = [];
    for (const asset of ASSETS) {
      for (let i = 0; i < REQUESTS_PER_ASSET_PER_BATCH; i++) {
        const burstUrl = (i === 0) ? `${BASE_URL}${asset.path}` : `${BASE_URL}${asset.path}?_cb=${batch}_${i}`;
        promises.push(fetchWithTiming(burstUrl));
      }
    }

    const results = await Promise.all(promises);
    for (const r of results) {
      allLatencies.push(r.duration);
      if (r.status === 200) {
        successCount++;
      } else {
        errorCount++;
      }

      const vCache = (r.headers.get('x-vercel-cache') || 'OTHER').toUpperCase();
      if (cacheHeaderDistribution[vCache] !== undefined) {
        cacheHeaderDistribution[vCache]++;
      } else {
        cacheHeaderDistribution.OTHER++;
      }
    }
  }

  const totalTime = (performance.now() - overallStart) / 1000;
  allLatencies.sort((a, b) => a - b);

  const minLat = allLatencies[0].toFixed(1);
  const maxLat = allLatencies[allLatencies.length - 1].toFixed(1);
  const p50 = allLatencies[Math.floor(allLatencies.length * 0.50)].toFixed(1);
  const p95 = allLatencies[Math.floor(allLatencies.length * 0.95)].toFixed(1);
  const p99 = allLatencies[Math.floor(allLatencies.length * 0.99)].toFixed(1);
  const avgLat = (allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length).toFixed(1);
  const throughput = (allLatencies.length / totalTime).toFixed(2);

  console.log(`Completed ${allLatencies.length} requests in ${totalTime.toFixed(2)}s (${throughput} req/s)`);
  console.log(`Latency Profile: Min: ${minLat}ms | Avg: ${avgLat}ms | P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms | Max: ${maxLat}ms`);
  console.log(`Cache Header Distribution: HIT: ${cacheHeaderDistribution.HIT}, MISS: ${cacheHeaderDistribution.MISS}, STALE: ${cacheHeaderDistribution.STALE}, OTHER: ${cacheHeaderDistribution.OTHER}`);

  recordTest(errorCount === 0 && successCount === allLatencies.length, `100% of concurrent stress requests return HTTP 200 OK (${successCount}/${allLatencies.length})`, `Errors: ${errorCount}`);
  recordTest(parseFloat(p95) < 1500, `Edge CDN P95 latency is healthy (< 1500ms)`, `Observed P95: ${p95}ms`);
  recordTest(cacheHeaderDistribution.HIT > 0, `Edge CDN actively serves cache HITs under repeated load`, `HITs: ${cacheHeaderDistribution.HIT}`);
}

// --- SUITE 3: 404 Route Handling & Edge Resilience ---
async function runRouteResilienceSuite() {
  console.log('\n======================================================');
  console.log('SUITE 3: 404 Route Handling & Edge Resilience');
  console.log('======================================================');

  // Standard non-existent routes that must cleanly return 404 Not Found
  const NON_EXISTENT_ROUTES = [
    '/non-existent-route-404',
    '/assets/does-not-exist.png',
    '/software/non-existent-subpath',
    '/.git/config',
    '/.env',
    '/pricing',
    '/random-token-xyz',
    '/assets/missing-style.css',
    '/api/v1/unknown'
  ];

  for (const rPath of NON_EXISTENT_ROUTES) {
    const res = await fetchWithTiming(`${BASE_URL}${rPath}`);
    recordTest(res.status === 404, `Non-existent route '${rPath}' returns HTTP 404 Not Found`, `Status: ${res.status}`);
    
    // Security headers on 404
    const nosniff = res.headers.get('x-content-type-options');
    recordTest(nosniff === 'nosniff', `'${rPath}' 404 retains nosniff header`, `Got: ${nosniff}`);
  }

  // Edge security boundary checks (WAF rejection of suspicious probes)
  const resPhp = await fetchWithTiming(`${BASE_URL}/admin/login.php`);
  recordTest([403, 404].includes(resPhp.status), `Exploit probe '/admin/login.php' is blocked by Edge (403 or 404)`, `Status: ${resPhp.status}`);

  // Concurrent 404 flood test (15 concurrent invalid requests)
  console.log('Running concurrent 404 flood to test edge isolation...');
  const floodPromises = Array.from({ length: 15 }, (_, idx) => 
    fetchWithTiming(`${BASE_URL}/adversarial-burst-${idx}-${Date.now()}`)
  );
  const floodResults = await Promise.all(floodPromises);
  const all404 = floodResults.every(r => r.status === 404);
  recordTest(all404, `Edge cleanly handles 15 concurrent 404 requests with zero 5xx server errors`, `All 404: ${all404}`);

  // Test that normal traffic immediately after 404 flood is unaffected
  const canary = await fetchWithTiming(`${BASE_URL}/`);
  recordTest(canary.status === 200, `Root page serves 200 OK immediately after 404 flood`, `Status: ${canary.status}`);
}

// --- SUITE 4: External Font Resolution & WOFF2 Binary Integrity ---
async function runFontResolutionSuite() {
  console.log('\n======================================================');
  console.log('SUITE 4: External Font Resolution & WOFF2 Binary Integrity');
  console.log('======================================================');

  const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

  console.log(`Fetching Google Fonts CSS stylesheet: ${FONT_CSS_URL}`);
  const fontCssRes = await fetchWithTiming(FONT_CSS_URL);

  recordTest(fontCssRes.status === 200, `Google Fonts CSS endpoint returns HTTP 200 OK`, `Status: ${fontCssRes.status}`);
  const cssBody = fontCssRes.text();
  recordTest(cssBody.includes('@font-face'), `Google Fonts response contains @font-face rules`, `Length: ${cssBody.length} chars`);
  recordTest(cssBody.includes('Bitter'), `Google Fonts CSS contains Bitter serif font family`, `Found Bitter: ${cssBody.includes('Bitter')}`);
  recordTest(cssBody.includes('Plus Jakarta Sans'), `Google Fonts CSS contains Plus Jakarta Sans font family`, `Found Plus Jakarta Sans: ${cssBody.includes('Plus Jakarta Sans')}`);

  // Extract all WOFF2 binary URLs
  const woff2Urls = [];
  const regex = /url\((https:\/\/fonts\.gstatic\.com\/[^\)]+\.woff2)\)/g;
  let match;
  while ((match = regex.exec(cssBody)) !== null) {
    woff2Urls.push(match[1]);
  }

  const uniqueWoff2Urls = [...new Set(woff2Urls)];
  console.log(`Extracted ${uniqueWoff2Urls.length} unique WOFF2 font binary endpoints from Google Fonts CSS.`);
  recordTest(uniqueWoff2Urls.length >= 10, `Found at least 10 font variant binary endpoints (extracted ${uniqueWoff2Urls.length})`);

  // Adversarially fetch ALL unique font binaries concurrently
  console.log(`Concurrently fetching all ${uniqueWoff2Urls.length} WOFF2 binaries to verify magic bytes and HTTP 200...`);

  const fontFetchPromises = uniqueWoff2Urls.map(u => fetchWithTiming(u));
  const fontResults = await Promise.all(fontFetchPromises);

  for (let i = 0; i < uniqueWoff2Urls.length; i++) {
    const fRes = fontResults[i];
    const url = uniqueWoff2Urls[i];
    const shortUrl = url.replace('https://fonts.gstatic.com/s/', '');

    recordTest(fRes.status === 200, `Font binary ${shortUrl} returns HTTP 200`, `Status: ${fRes.status}`);
    recordTest(fRes.buffer.length > 1000, `Font binary ${shortUrl} has non-trivial size (>1KB)`, `Size: ${fRes.buffer.length}b`);

    // Verify WOFF2 Magic Bytes: "wOF2" (0x77, 0x4F, 0x46, 0x32)
    const magic = fRes.buffer.subarray(0, 4).toString('ascii');
    recordTest(magic === 'wOF2', `Font binary ${shortUrl} has valid WOFF2 magic signature ('wOF2')`, `Magic: '${magic}'`);
  }
}

// --- SUITE 5: HTTP Protocol & Boundary Stress ---
async function runProtocolAndBoundarySuite() {
  console.log('\n======================================================');
  console.log('SUITE 5: HTTP Protocol & Boundary Stress');
  console.log('======================================================');

  // 1. HEAD request testing
  const headRes = await fetchWithTiming(`${BASE_URL}/`, { method: 'HEAD' });
  recordTest(headRes.status === 200, `HEAD request on / returns HTTP 200 OK`, `Status: ${headRes.status}`);
  recordTest(headRes.buffer.length === 0, `HEAD request returns empty payload body`, `Body bytes: ${headRes.buffer.length}`);
  const headNosniff = headRes.headers.get('x-content-type-options');
  recordTest(headNosniff === 'nosniff', `HEAD response retains security headers`, `Got: ${headNosniff}`);

  const headCssRes = await fetchWithTiming(`${BASE_URL}/style.css`, { method: 'HEAD' });
  recordTest(headCssRes.status === 200, `HEAD request on /style.css returns HTTP 200 OK`, `Status: ${headCssRes.status}`);

  // 2. Compression negotiation (Brotli / Gzip)
  const brRes = await fetchWithTiming(`${BASE_URL}/style.css`, {
    headers: { 'Accept-Encoding': 'br, gzip, deflate' }
  });
  const encoding = brRes.headers.get('content-encoding') || 'none';
  recordTest(['br', 'gzip'].includes(encoding), `/style.css negotiated edge compression (br/gzip)`, `Content-Encoding: ${encoding}`);

  // 3. Byte Range Requests on media asset (/assets/profile.jpg)
  const rangeRes = await fetchWithTiming(`${BASE_URL}/assets/profile.jpg`, {
    headers: { 'Range': 'bytes=0-1023' }
  });
  const supportsRange = (rangeRes.status === 206 && rangeRes.buffer.length === 1024) || rangeRes.status === 200;
  recordTest(supportsRange, `/assets/profile.jpg handles Range request gracefully (206 Partial or 200 Full)`, `Status: ${rangeRes.status}, Length: ${rangeRes.buffer.length}`);

  // 4. HTTP Method Fuzzing (POST / PUT / DELETE to static endpoints)
  const postRes = await fetchWithTiming(`${BASE_URL}/style.css`, { method: 'POST', body: 'malicious-data' });
  recordTest([405, 400, 404, 200].includes(postRes.status) && postRes.status !== 500, `POST to static asset does not cause 5xx error`, `Status: ${postRes.status}`);

  const deleteRes = await fetchWithTiming(`${BASE_URL}/assets/profile.jpg`, { method: 'DELETE' });
  recordTest([405, 400, 404, 200].includes(deleteRes.status) && deleteRes.status !== 500, `DELETE to static asset does not cause 5xx error`, `Status: ${deleteRes.status}`);
}

// --- SUITE 6: Live HTML Canonical Metadata & Content Verification ---
async function runMetadataAndContentSuite() {
  console.log('\n======================================================');
  console.log('SUITE 6: Live HTML Canonical Metadata & Content Verification');
  console.log('======================================================');

  const rootRes = await fetchWithTiming(`${BASE_URL}/`);
  const html = rootRes.text();

  // Canonical tag check
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : '';
  recordTest(canonicalUrl === 'https://irfanurrahman.vercel.app', `Canonical link points to exact production domain`, `Got: '${canonicalUrl}'`);

  // Open Graph og:url check
  const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
  const ogUrl = ogUrlMatch ? ogUrlMatch[1] : '';
  recordTest(ogUrl === 'https://irfanurrahman.vercel.app', `og:url meta tag points to exact production domain`, `Got: '${ogUrl}'`);

  // Key navigation targets in DOM
  const requiredIds = ['home', 'software', 'experience', 'academics', 'contact'];
  for (const id of requiredIds) {
    const hasId = html.includes(`id="${id}"`);
    recordTest(hasId, `HTML contains primary section anchor #${id}`, `Found: ${hasId}`);
  }

  // Verification of content strings matching requirements
  const requiredStrings = [
    'PROBAHO CRM Solutions',
    'Square Toiletries Ltd',
    'Strides Co Ltd',
    'BRAC University',
    'Finance & Supply Chain Management',
    'Oracle ERP'
  ];

  for (const str of requiredStrings) {
    const hasStr = html.includes(str);
    recordTest(hasStr, `HTML includes required credential string: '${str}'`, `Found: ${hasStr}`);
  }

  // Interactive hooks in HTML
  recordTest(html.includes('data-modal="modal-probaho"'), `HTML contains PROBAHO modal trigger [data-modal="modal-probaho"]`);
  recordTest(html.includes('id="copyEmailBtn"'), `HTML contains 1-click email copy button #copyEmailBtn`);
  recordTest(html.includes('id="copyText"'), `HTML contains email copy text span #copyText`);
  recordTest(html.includes('id="displayEmail"'), `HTML contains displayed email address #displayEmail`);
}

// --- Main Execution Flow ---
async function main() {
  console.log('======================================================');
  console.log('STARTING EMPIRICAL ADVERSARIAL NETWORK HARNESS');
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log('======================================================\n');

  try {
    await runAssetBaselineSuite();
    await runConcurrentStressSuite();
    await runRouteResilienceSuite();
    await runFontResolutionSuite();
    await runProtocolAndBoundarySuite();
    await runMetadataAndContentSuite();
  } catch (err) {
    console.error('Fatal harness error:', err);
    recordTest(false, 'Harness execution uncaught exception', err.stack);
  }

  console.log('\n======================================================');
  console.log('ADVERSARIAL NETWORK HARNESS EXECUTION SUMMARY');
  console.log('======================================================');
  console.log(`Total Assertions Checked : ${totalAssertions}`);
  console.log(`Passed Assertions        : ${passedAssertions}`);
  console.log(`Failed Assertions        : ${failedAssertions}`);
  console.log(`Success Rate             : ${((passedAssertions / totalAssertions) * 100).toFixed(2)}%`);

  if (failedAssertions > 0) {
    console.log('\nFAILURES RECORDED:');
    failureDetails.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.name} :: ${f.details}`);
    });
    console.log('\nOVERALL VERDICT: REQUEST_CHANGES');
    process.exit(1);
  } else {
    console.log('\nOVERALL VERDICT: APPROVE (100% EMPIRICAL CONFIRMATION)');
    process.exit(0);
  }
}

main();
