import { createServer } from "node:http";
import { lstat, readFile, realpath } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function rejectUnsafeSegments(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.some((segment) => segment.startsWith("."))) {
    throw new Error("Refusing to serve hidden files");
  }
}

function ensureInside(path, allowedRoot) {
  const relativePrefix = `${allowedRoot}${sep}`;
  if (path !== allowedRoot && !path.startsWith(relativePrefix)) {
    throw new Error("Refusing to serve path outside public site files");
  }
}

function publicCandidate(root, pathname) {
  const normalized = normalize(pathname);

  if (normalized === "/" || normalized === "/docs" || normalized === "/docs/") {
    return join(root, "docs", "index.html");
  }

  if (normalized.startsWith("/docs/")) {
    return join(root, normalized);
  }

  if (normalized.startsWith("/assets/")) {
    return join(root, normalized);
  }

  if (normalized === "/1.svg") {
    return join(root, "1.svg");
  }

  throw new Error("Refusing to serve non-public file");
}

export async function resolveStaticRequest(root, requestUrl) {
  const absoluteRoot = resolve(root);
  const url = new URL(requestUrl, "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  rejectUnsafeSegments(pathname);

  const candidate = publicCandidate(absoluteRoot, pathname);
  const fileStat = await lstat(candidate);
  if (fileStat.isSymbolicLink()) {
    throw new Error("Refusing to serve symlink");
  }

  const realCandidate = await realpath(candidate);
  const realDocs = await realpath(join(absoluteRoot, "docs"));
  const realAssets = await realpath(join(absoluteRoot, "assets")).catch(() => "");
  const realLogo = await realpath(join(absoluteRoot, "1.svg")).catch(() => "");

  if (realCandidate === realLogo) {
    return realCandidate;
  }

  if (realAssets) {
    try {
      ensureInside(realCandidate, realAssets);
      return realCandidate;
    } catch {
      // Continue checking the docs root below.
    }
  }

  ensureInside(realCandidate, realDocs);
  return realCandidate;
}

export function createStaticServer(root) {
  return createServer(async (request, response) => {
    try {
      const filePath = await resolveStaticRequest(root, request.url ?? "/");
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
