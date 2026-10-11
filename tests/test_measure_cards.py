import http.server
import socketserver
import threading
import time
import os
from playwright.sync_api import sync_playwright

PORT = 8995
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
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(f"http://localhost:{PORT}/index.html", wait_until="networkidle")

    measurements = page.evaluate("""() => {
        const cards = Array.from(document.querySelectorAll('.case-card'));
        return cards.map((c, i) => {
            const title = c.querySelector('.case-card-title').getBoundingClientRect();
            const role = c.querySelector('.case-role-line').getBoundingClientRect();
            const summary = c.querySelector('.case-summary-block').getBoundingClientRect();
            const metrics = c.querySelector('.case-metrics-grid').getBoundingClientRect();
            const footer = c.querySelector('.case-card-footer').getBoundingClientRect();
            const card = c.getBoundingClientRect();
            return {
                index: i + 1,
                cardHeight: Math.round(card.height),
                cardTop: Math.round(card.top),
                titleHeight: Math.round(title.height),
                titleBottom: Math.round(title.bottom),
                roleHeight: Math.round(role.height),
                roleBottom: Math.round(role.bottom),
                summaryHeight: Math.round(summary.height),
                summaryBottom: Math.round(summary.bottom),
                metricsHeight: Math.round(metrics.height),
                metricsBottom: Math.round(metrics.bottom),
                footerHeight: Math.round(footer.height),
                footerTop: Math.round(footer.top)
            };
        });
    }""")

    for m in measurements:
        print(f"Card {m['index']}:")
        print(f"  Card Total Height: {m['cardHeight']}px (top: {m['cardTop']}px)")
        print(f"  Title Height: {m['titleHeight']}px (bottom: {m['titleBottom']}px)")
        print(f"  Role Height: {m['roleHeight']}px (bottom: {m['roleBottom']}px)")
        print(f"  Summary Height: {m['summaryHeight']}px (bottom: {m['summaryBottom']}px)")
        print(f"  Metrics Height: {m['metricsHeight']}px (bottom: {m['metricsBottom']}px)")
        print(f"  Footer Height: {m['footerHeight']}px (top: {m['footerTop']}px)")

    # Check alignment consistency
    title_heights = [m['titleHeight'] for m in measurements]
    role_heights = [m['roleHeight'] for m in measurements]
    summary_heights = [m['summaryHeight'] for m in measurements]
    metrics_heights = [m['metricsHeight'] for m in measurements]
    footer_tops = [m['footerTop'] for m in measurements]
    card_heights = [m['cardHeight'] for m in measurements]

    print("\nAlignment Assessment:")
    print(f"  Card Heights: {card_heights} -> Diff: {max(card_heights) - min(card_heights)}px")
    print(f"  Title Heights: {title_heights} -> Diff: {max(title_heights) - min(title_heights)}px")
    print(f"  Role Heights: {role_heights} -> Diff: {max(role_heights) - min(role_heights)}px")
    print(f"  Summary Heights: {summary_heights} -> Diff: {max(summary_heights) - min(summary_heights)}px")
    print(f"  Metrics Heights: {metrics_heights} -> Diff: {max(metrics_heights) - min(metrics_heights)}px")
    print(f"  Footer Tops: {footer_tops} -> Diff: {max(footer_tops) - min(footer_tops)}px")

    grid = page.query_selector('.case-projects-grid')
    if grid:
        grid.screenshot(path='tests/aligned_cards_preview.png')
        print('\nSaved high-resolution preview to tests/aligned_cards_preview.png')

    browser.close()
