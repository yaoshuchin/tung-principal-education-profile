from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8010"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.goto(BASE + "/gallery.html", wait_until="networkidle")
    images = page.locator(".gallery-card img")
    assert images.count() > 0
    broken = page.locator(".gallery-card img").evaluate_all("imgs => imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src)")
    assert not broken, broken
    object_fits = page.locator(".gallery-card img").evaluate_all("imgs => [...new Set(imgs.map(img => getComputedStyle(img).objectFit))]")
    assert object_fits == ["contain"], object_fits
    categories = ["sport-international", "character-care", "reading-vision", "innovation-community", "leadership", "profile-awards"]
    for category in categories:
        page.locator(f"button[data-filter='{category}']").click()
        assert page.locator(f"figure[data-category='{category}']:visible").count() > 0, category
        assert page.locator(".gallery-card img").evaluate_all("imgs => imgs.filter(img => !img.complete || img.naturalWidth === 0).length") == 0
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(BASE + "/index.html", wait_until="networkidle")
    portrait_fit = page.locator(".hero-portrait img").evaluate("img => getComputedStyle(img).objectFit")
    assert portrait_fit == "contain", portrait_fit
    browser.close()
print("photo integrity tests passed")
