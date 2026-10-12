from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    
    page.goto('https://irfanurrahman.vercel.app', wait_until='networkidle')
    title = page.title()
    print(f'Page title: {title}')
    
    # 1. Verify hero degree note is removed
    degree_note_count = len(page.locator('.hero-degree-note').all())
    print(f'Hero degree note count: {degree_note_count} (expected 0)')
    assert degree_note_count == 0, 'Hero degree note should be removed'
    
    # 2. Verify hero glance row
    stats_text = page.locator('#heroGlanceRow').text_content()
    print(f'Hero stats row: {stats_text.strip()}')
    assert '2 roles' in stats_text, 'Stats row should show 2 roles'
    
    # 3. Verify core competencies removed
    comp_count = len(page.locator('#competencies').all())
    print(f'Competencies section count: {comp_count} (expected 0)')
    assert comp_count == 0, 'Competencies section should be removed'

    # 4. Verify compact education block
    edu_card = page.locator('.academic-compact-card')
    print(f'Compact education card present: {edu_card.is_visible()}')
    assert edu_card.is_visible(), 'Compact education card should be visible'

    # 5. Verify mailto button
    mail_href = page.locator('#sendMessageBtn').get_attribute('href')
    print(f'Send Message href: {mail_href}')
    assert mail_href == 'mailto:irfanur6@gmail.com?subject=Inquiry%20from%20Portfolio', 'Mailto link should match exactly'

    # 6. Test modal open/close
    page.click("[data-modal='modal-probaho']")
    page.wait_for_timeout(400)
    is_open = page.evaluate("() => document.getElementById('caseStudyModal').classList.contains('open')")
    print(f'Modal probaho opened on live site: {is_open}')
    page.click('#modalCloseBtn')
    page.wait_for_timeout(300)

    # 7. Test Copy Email button
    page.click('#copyEmailBtn')
    page.wait_for_timeout(300)
    copy_text = page.locator('#copyText').text_content()
    print(f'Copy button feedback on live site: {copy_text.encode("ascii", "replace").decode()}')

    # 8. Take a full-page screenshot
    page.screenshot(path='tests/live_production_verified.png', full_page=True)
    print('Saved full page screenshot to tests/live_production_verified.png')
    
    browser.close()

print('LIVE PRODUCTION SITE VERIFICATION SCRIPT READY!')
