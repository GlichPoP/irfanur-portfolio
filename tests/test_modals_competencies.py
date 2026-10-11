import http.server
import socketserver
import threading
import time
import os
from playwright.sync_api import sync_playwright

PORT = 8997
DIRECTORY = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass

socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
time.sleep(1)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(f"http://localhost:{PORT}/index.html", wait_until="networkidle")

    for modal_id in ["modal-fin423", "modal-fin433", "modal-fin422", "modal-probaho"]:
        btn = page.query_selector(f"[data-modal='{modal_id}']")
        assert btn, f"Button for {modal_id} not found!"
        btn.click()
        page.wait_for_timeout(400)
        
        headline = page.query_selector(".modal-headline").text_content()
        kicker = page.query_selector(".modal-kicker").text_content()
        sections = page.query_selector_all(".modal-section-title")
        sec_titles = [s.text_content().strip() for s in sections]
        print(f"Tested {modal_id}:")
        print(f"  Kicker: {kicker}")
        print(f"  Headline: {headline}")
        print(f"  Sections ({len(sec_titles)}): {sec_titles}")
        assert len(sec_titles) >= 4, f"Expected at least 4 sections in {modal_id}"
        
        # Close modal
        page.click("#modalCloseBtn")
        page.wait_for_timeout(300)
        is_open = page.evaluate("() => document.getElementById('caseStudyModal').classList.contains('open')")
        assert not is_open, f"Modal {modal_id} did not close!"
        print(f"  Closed successfully: {not is_open}\n")

    # Verify competencies section existence and counts
    comp_cards = page.query_selector_all(".competency-card")
    print(f"Core Competencies cards count: {len(comp_cards)}")
    assert len(comp_cards) == 4, "Expected 4 competency cards!"

    # Verify cert chips count
    chips = page.query_selector_all(".cert-chip")
    chip_texts = [c.text_content().strip() for c in chips]
    print(f"Cert chips ({len(chips)}): {chip_texts}")
    assert len(chips) == 5, "Expected 5 cert chips!"

    browser.close()
    print("\nALL 4 MODALS, 4-PILLAR COMPETENCIES, AND CERTIFICATION CHIPS VERIFIED SUCCESSFULLY!")
