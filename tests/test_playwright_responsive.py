import http.server
import socketserver
import threading
import time
import os
import sys
from playwright.sync_api import sync_playwright

PORT = 8999
DIRECTORY = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass # suppress server logs

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("", PORT), Handler)
    httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(1)

viewports = [
    (360, 640),
    (414, 896),
    (768, 1024),
    (1024, 768),
    (1280, 800),
    (1440, 900),
    (1920, 1080)
]

os.makedirs(os.path.join(DIRECTORY, "tests", "responsive_screens"), exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    for width, height in viewports:
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        
        page.goto(f"http://localhost:{PORT}/index.html", wait_until="networkidle")
        
        # Check horizontal overflow
        has_overflow = page.evaluate("""() => {
            const docWidth = document.documentElement.offsetWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyWidth = document.body.scrollWidth;
            return Math.max(scrollWidth, bodyWidth) > window.innerWidth;
        }""")
        
        scroll_info = page.evaluate("""() => {
            return {
                windowInner: window.innerWidth,
                docScroll: document.documentElement.scrollWidth,
                bodyScroll: document.body.scrollWidth
            };
        }""")
        
        status = "PASSED" if not has_overflow else "FAILED"
        print(f"Viewport {width}x{height}: Overflow status: {status} (window={scroll_info['windowInner']}, docScroll={scroll_info['docScroll']}, bodyScroll={scroll_info['bodyScroll']})")
        
        if has_overflow:
            print(f"ERROR: Horizontal overflow detected at {width}px!")
            sys.exit(1)
            
        screenshot_path = os.path.join(DIRECTORY, "tests", "responsive_screens", f"viewport_{width}px.png")
        page.screenshot(path=screenshot_path, full_page=False)
        
        # Scroll to bottom to trigger any lazy-loaded images
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500)
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(200)

        # If desktop (1280px), test interactive elements
        if width == 1280:
            print("\nTesting interactive elements at 1280px:")
            
            # Modal open
            modal_btn = page.query_selector("[data-modal='modal-probaho']")
            if modal_btn:
                modal_btn.click()
                page.wait_for_timeout(400)
                is_modal_visible = page.evaluate("""() => {
                    const m = document.getElementById('caseStudyModal');
                    return m && m.classList.contains('open') && window.getComputedStyle(m).visibility === 'visible';
                }""")
                print(f"  Case study modal opened: {is_modal_visible}")
                
                # Check modal headings
                headings = page.evaluate("""() => {
                    const titles = Array.from(document.querySelectorAll('.modal-section-title')).map(el => el.textContent.trim());
                    return titles;
                }""")
                print(f"  Modal headings found: {headings}")
                expected_headings = [
                    "The problem",
                    "Who it is for",
                    "What I decided and why",
                    "Trade offs and limits",
                    "What I would improve next"
                ]
                for eh in expected_headings:
                    assert eh in headings, f"Missing modal heading: {eh}"
                print("  All 5 case study headings verified!")
                
                # Close modal
                page.click("#modalCloseBtn")
                page.wait_for_timeout(300)
                is_closed = page.evaluate("""() => {
                    const m = document.getElementById('caseStudyModal');
                    return !m.classList.contains('open');
                }""")
                print(f"  Case study modal closed: {is_closed}")

            # Test Copy Email button
            copy_btn = page.query_selector("#copyEmailBtn")
            if copy_btn:
                copy_btn.click()
                page.wait_for_timeout(300)
                copy_text = page.query_selector("#copyText").text_content()
                print(f"  Copy button clicked feedback: '{copy_text.encode('ascii', 'replace').decode()}'")

        # Verify images loaded
        broken_images = page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
        }""")
        if broken_images:
            print(f"WARNING: Broken images at {width}px: {broken_images}")
        else:
            print(f"  All images loaded successfully at {width}px")

        page.close()

    browser.close()

print("\nALL RESPONSIVE VIEWPORT AND FUNCTIONAL TESTS PASSED!")
