from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8010"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.goto(BASE + "/photo-deck.html", wait_until="networkidle")
    page.wait_for_selector(".deck-slide")
    assert page.locator(".deck-slide").count() == 48
    assert page.locator(".slide-photos figure").count() >= 300
    assert page.locator(".section-tabs").count() == 1
    page.locator(".deck-index a").first.click()
    assert "#theme-" in page.url
    page.locator(".slide-overview img").first.click()
    assert page.locator(".lightbox-modal.is-open").count() == 1
    page.keyboard.press("Escape")
    assert page.locator(".lightbox-modal.is-open").count() == 0
    page.set_viewport_size({"width": 390, "height": 844})
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    browser.close()
print("photo deck tests passed")
