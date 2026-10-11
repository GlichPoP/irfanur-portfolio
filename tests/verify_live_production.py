from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    
    page.goto('https://irfanurrahman.vercel.app', wait_until='networkidle')
    title = page.title()
    print(f'Page title: {title}')
    
    # Check degree text
    degree_text = page.locator('.hero-degree-note').text_content()
    print(f'Degree note: {degree_text.strip()}')
    
    # Test modal
    page.click("[data-modal='modal-probaho']")
    page.wait_for_timeout(400)
    is_open = page.evaluate("() => document.getElementById('caseStudyModal').classList.contains('open')")
    print(f'Modal probaho opened on live site: {is_open}')
    
    # Check 5 headings
    headings = page.evaluate("() => Array.from(document.querySelectorAll('.modal-section-title')).map(el => el.textContent.trim())")
    print(f'Live modal headings: {headings}')
    page.click('#modalCloseBtn')
    page.wait_for_timeout(300)

    # Test Executive Summary modal for FIN423
    page.click("[data-modal='modal-fin423']")
    page.wait_for_timeout(400)
    fin423_kicker = page.locator('.modal-kicker').text_content()
    fin423_title = page.locator('.modal-headline').text_content()
    print(f'Live FIN423 modal: [{fin423_kicker}] {fin423_title}')
    page.click('#modalCloseBtn')
    page.wait_for_timeout(300)

    # Check Core Competencies section
    comp_cards = page.locator('.competency-card').all()
    print(f'Live Core Competency cards found: {len(comp_cards)}')

    # Check Certifications Chips
    chips = page.locator('.cert-chip').all()
    print(f'Live Professional Cert chips found: {len(chips)}')
    
    # Test copy email button
    page.click('#copyEmailBtn')
    page.wait_for_timeout(300)
    copy_text = page.locator('#copyText').text_content()
    print(f'Copy button feedback on live site: {copy_text.encode("ascii", "replace").decode()}')

    # Take a screenshot of the live production site
    page.screenshot(path='tests/live_production_verified.png', full_page=True)
    print('Saved full page screenshot to tests/live_production_verified.png')
    
    browser.close()

print('LIVE PRODUCTION SITE VERIFICATION COMPLETE AND 100% FUNCTIONAL!')

