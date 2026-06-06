#!/usr/bin/env node
import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactsDir = join(root, "artifacts", "site");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function resolveRequestPath(url) {
  const pathname = new URL(url, "http://127.0.0.1").pathname;
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath === "/" ? "docs/index.html" : safePath);
  return filePath.endsWith("/") ? join(filePath, "index.html") : filePath;
}

function createStaticServer() {
  return createServer(async (request, response) => {
    try {
      const filePath = resolveRequestPath(request.url ?? "/");
      const relativePath = normalize(filePath).slice(root.length);
      assert(!relativePath.includes(".."), "Refusing to serve path outside project root");
      const body = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
      });
      response.end(body);
    } catch (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.message);
    }
  });
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

const server = createStaticServer();
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
