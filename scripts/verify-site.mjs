#!/usr/bin/env node
import { mkdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { chromium } from "playwright";
import { createStaticServer } from "./site-server.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactsDir = join(root, "artifacts", "site");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function listen(server) {
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  assert(address && typeof address === "object", "Static server did not expose a port");
  return `http://127.0.0.1:${address.port}/docs/`;
}

async function checkViewport(page, viewport, screenshotName) {
  await page.setViewportSize(viewport);
  await page.reload({ waitUntil: "networkidle" });

  const title = await page.title();
  assert(title.includes("Supered"), `Unexpected page title: ${title}`);

  const bodyText = await page.locator("body").innerText();
  for (const word of ["Shape", "Build", "Prove", "Ship"]) {
    assert(bodyText.includes(word), `Missing workflow word: ${word}`);
  }

  const logoLoaded = await page.locator(".hero-media img").evaluate((img) => {
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  });
  assert(logoLoaded, "Hero logo did not load");

  const heroBox = await page.locator("#hero-title").boundingBox();
  assert(heroBox && heroBox.width > 0 && heroBox.height > 0, "Hero title is not visible");

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  assert(!hasHorizontalOverflow, `Horizontal overflow detected at ${viewport.width}px`);

  const overflowingBlocks = await page.locator("pre, code, .button").evaluateAll((elements) => {
    return elements
      .filter((element) => element.scrollWidth > element.clientWidth)
      .map((element) => element.tagName.toLowerCase());
  });
  assert(overflowingBlocks.length === 0, `Clipped UI text at ${viewport.width}px: ${overflowingBlocks.join(", ")}`);

  const screenshotPath = join(artifactsDir, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const screenshotStat = await stat(screenshotPath);
  assert(screenshotStat.size > 20_000, `Screenshot looks too small: ${screenshotName}`);
}

const server = createStaticServer(root);
const browser = await chromium.launch({ headless: true });

try {
  await mkdir(artifactsDir, { recursive: true });
  const url = await listen(server);
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  await checkViewport(page, { width: 1440, height: 1000 }, "desktop.png");
  await checkViewport(page, { width: 390, height: 844 }, "mobile.png");

  console.log(`Site verification passed: desktop and mobile screenshots saved in ${artifactsDir}.`);
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
