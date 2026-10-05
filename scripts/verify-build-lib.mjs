import { readdir, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { slug as githubSlug } from "github-slugger";

import {
  decodeLegacyPathname,
  normalizeRawPathname,
} from "../src/lib/content-validation.mjs";
import { postRouteId } from "../src/lib/posts.mjs";

export async function assertHtmlFilesOmitTerms(paths, forbiddenTerms, readHtml) {
  for (const path of paths) {
    const html = await readHtml(path);
    const normalizedHtml = html.toLowerCase();

    for (const term of forbiddenTerms) {
      if (normalizedHtml.includes(term.toLowerCase())) {
        throw new Error(`Forbidden term "${term}" found in ${path}`);
      }
    }
  }
}

export function assertExactPathSet(actualPaths, expectedPaths, label) {
  const seenExpected = new Set();
  for (const path of expectedPaths) {
    if (seenExpected.has(path)) {
      throw new Error(`${label} contains duplicate expected path: ${path}`);
    }
    seenExpected.add(path);
  }

  const actual = new Set(actualPaths);
  const expected = seenExpected;
  const missing = [...expected].filter((path) => !actual.has(path)).sort();
  const unexpected = [...actual].filter((path) => !expected.has(path)).sort();

  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${label} mismatch; missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}`,
    );
  }
}

export function routePathToHtmlFile(routePath) {
  const route = decodeLegacyPathname(routePath).replace(/^\/+|\/+$/g, "");
  return route ? `${route}/index.html` : "index.html";
}

export function expectedCategoryHtmlFiles(categories) {
  return [...categories].map((category) =>
    `${normalizeRawPathname(`categories/${category}`)}/index.html`,
  );
}

export function contentPathToPostId(path, frontmatterSlug) {
  const extension = extname(path);
  const withoutExtension = extension ? path.slice(0, -extension.length) : path;
  const generatedId = withoutExtension
    .split("/")
    .map((segment) => githubSlug(segment))
    .join("/")
    .replace(/\/index$/, "");

  return postRouteId(frontmatterSlug ? String(frontmatterSlug) : generatedId);
}

export async function listFiles(root) {
  const paths = await readdir(root, { recursive: true });
  const files = [];

  for (const path of paths) {
    if ((await stat(resolve(root, path))).isFile()) files.push(path);
  }

  return files.sort();
}

const LEGACY_REDIRECT_META =
  /<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])(?=[^>]*\bcontent=["']0;url=\/posts\/)[^>]*>/i;

export async function findLegacyRedirectPages(paths, readHtml) {
  const legacyPages = [];

  for (const path of paths) {
    if (LEGACY_REDIRECT_META.test(await readHtml(path))) {
      legacyPages.push(path);
    }
  }

  return legacyPages;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function assertLegacyRedirectHtml(html, target, path) {
  const escapedTarget = escapeRegExp(target);
  const escapedCanonical = escapeRegExp(
    new URL(target, "https://googs1025.github.io").href,
  );

  if (
    !new RegExp(
      `<link\\s+rel=["']canonical["']\\s+href=["']${escapedCanonical}["']`,
    ).test(html)
  ) {
    throw new Error(`legacy redirect ${path} must canonicalize to ${target}`);
  }
  if (
    !new RegExp(
      `<meta\\s+http-equiv=["']refresh["']\\s+content=["']0;url=${escapedTarget}["']`,
      "i",
    ).test(html)
  ) {
    throw new Error(`legacy redirect ${path} must refresh immediately to ${target}`);
  }
  if (!new RegExp(`<a\\s+href=["']${escapedTarget}["']`).test(html)) {
    throw new Error(`legacy redirect ${path} must link visibly to ${target}`);
  }
}
