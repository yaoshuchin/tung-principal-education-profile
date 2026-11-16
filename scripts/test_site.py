from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8010"


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        for path in ("/index.html", "/record.html", "/gallery.html", "/photo-deck.html", "/share.html"):
            page.goto(BASE + path, wait_until="networkidle")
            assert page.locator("img").count() > 0, path
            assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), path
        page.goto(BASE + "/index.html", wait_until="networkidle")
        assert page.locator(".nav a[href='photo-deck.html']").count() == 1
        assert page.locator(".section-tabs .tab-level-one").count() == 0
        assert page.locator(".section-tabs .tab-level-two").count() == 1
        page.locator("button[data-size='xlarge']").click()
        assert page.locator("body").get_attribute("data-size") == "xlarge"
        page.locator("button[data-theme='blue']").click()
        assert page.locator("body").get_attribute("data-theme") == "blue"
        page.goto(BASE + "/gallery.html", wait_until="networkidle")
        page.locator("button[data-filter='character-care']").click()
        assert page.url.endswith("gallery.html#character-care")
        assert page.locator("figure[data-category='character-care']:visible").count() > 0
        assert page.locator("figure[data-category='sport-international']:visible").count() == 0
        page.set_viewport_size({"width": 390, "height": 844})
        for path in ("/index.html", "/record.html", "/gallery.html", "/photo-deck.html", "/share.html"):
            page.goto(BASE + path, wait_until="networkidle")
            assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), path
        browser.close()
    print("NEW2 smoke tests passed")


if __name__ == "__main__":
    main()
