#!/usr/bin/env node
/**
 * Captures SIGNAL at desktop (1440×900) and mobile (390×844) sizes.
 *
 *   node scripts/screenshot.mjs [baseUrl] [outDir] [path ...]
 *
 * Defaults: http://localhost:3000, .impeccable/review, the main routes.
 * Full-page captures are taken from the document top with entrance motion
 * settled so nothing reads as missing.
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.argv[2] || "http://localhost:3000";
const outDir = process.argv[3] || ".impeccable/review";
const routes = process.argv.slice(4);
const targets = routes.length ? routes : ["/", "/regions/sea", "/brief", "/learn", "/sources", "/preferences"];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

const sizes = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

for (const size of sizes) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 2,
    isMobile: Boolean(size.mobile),
    hasTouch: Boolean(size.mobile),
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const route of targets) {
    const slug = route === "/" ? "today" : route.replace(/^\//, "").replace(/[\/#?=]+/g, "-");
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const file = path.join(outDir, `${size.name}-${slug}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(`${size.name} ${route} -> ${file} (height ${height}px${overflow ? ", HORIZONTAL OVERFLOW" : ""})`);
  }
  await context.close();
}
await browser.close();
