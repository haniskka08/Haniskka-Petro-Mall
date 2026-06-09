from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on("console", lambda msg: print(f"Browser Console: {msg.type}: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Browser PageError: {exc.message}"))
    
    page.goto("http://localhost:5174/login")
    page.fill("#login-email", "testuser@example.com")
    page.fill("#login-password", "password123")
    page.click("#login-submit")
    
    time.sleep(3)
    
    # take a screenshot just in case
    page.screenshot(path="dashboard_screenshot.png")
    
    browser.close()
