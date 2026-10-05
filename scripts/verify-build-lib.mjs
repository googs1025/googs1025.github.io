import { normalizePathname } from "../src/lib/content-validation.mjs";
import { categoryPath } from "../src/lib/posts.mjs";

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
  const actual = new Set(actualPaths);
  const expected = new Set(expectedPaths);
  const missing = [...expected].filter((path) => !actual.has(path)).sort();
  const unexpected = [...actual].filter((path) => !expected.has(path)).sort();

  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${label} mismatch; missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}`,
    );
  }
}

export function routePathToHtmlFile(routePath) {
  const route = normalizePathname(routePath).replace(/^\/+|\/+$/g, "");
  return route ? `${route}/index.html` : "index.html";
}

export function expectedCategoryHtmlFiles(categories) {
  return [...categories].map((category) =>
    routePathToHtmlFile(categoryPath(category)),
  );
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

  if (
    !new RegExp(
      `<link\\s+rel=["']canonical["']\\s+href=["']https://googs1025\\.github\\.io${escapedTarget}["']`,
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
