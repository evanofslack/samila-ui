// Screenshots of the editor for the README, in light and dark.
//
//     just serve                      # in another terminal
//     just screenshots                # or: node scripts/screenshots.mjs [url]
//
// Opens a gallery image in the editor, so no render is needed and every run matches.
// Writes PNGs to docs/; the just recipe turns them into webp.
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const URL = process.argv[2] ?? "http://localhost:8080";
const OUT = new globalThis.URL("../../docs/", import.meta.url);
// the gallery image shown in the editor
const ENTRY = "/images/gallery/g3-sm.webp";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: theme,
    });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.locator(`#gallery button:has(img[src="${ENTRY}"])`).click();
    // the full size image, laid out and decoded
    await page.waitForFunction(() =>
        [...document.querySelectorAll("#editor img")].some(
            (img) => img.src.includes("/images/gallery/g3.webp") && img.complete,
        ),
    );
    await page.mouse.move(0, 0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(500);
    const path = new globalThis.URL(`screenshot-${theme}.png`, OUT).pathname;
    await page.screenshot({ path });
    console.log(`wrote ${path}`);
    await page.close();
}
await browser.close();
