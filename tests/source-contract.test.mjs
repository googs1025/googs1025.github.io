import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

export const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Astro targets the production site and package scripts verify it", async () => {
  const config = await read("astro.config.mjs");
  const pkg = JSON.parse(await read("package.json"));

  assert.match(config, /site:\s*["']https:\/\/googs1025\.github\.io["']/);
  assert.match(config, /sitemap\(\)/);
  assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs");
  assert.equal(
    pkg.scripts.verify,
    "npm test && npm run check && npm run build && node scripts/verify-build.mjs",
  );
});

test("site shell exposes accessible navigation and motion preferences", async () => {
  const [layout, header, toggle, styles] = await Promise.all([
    read("src/layouts/BaseLayout.astro"),
    read("src/components/Header.astro"),
    read("src/components/ThemeToggle.astro"),
    read("src/styles/global.css"),
  ]);

  assert.match(layout, /href=["']#main-content["']/);
  assert.match(header, /aria-label=["']主导航["']/);
  assert.match(header, /aria-label=["']导航菜单["']/);
  assert.match(header, /title=["']导航菜单["']/);
  assert.doesNotMatch(header, /打开导航/);
  assert.match(toggle, /aria-label=["']切换颜色主题["']/);
  assert.match(styles, /scroll-padding-top:\s*4\.5rem/);
  assert.match(styles, /prefers-reduced-motion\s*:\s*reduce/);
});

test("site header stays visible with a translucent token-based surface", async () => {
  const styles = await read("src/styles/global.css");
  const siteHeader = styles.match(/\.site-header\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(siteHeader, /position:\s*sticky/);
  assert.match(siteHeader, /top:\s*0/);
  assert.match(
    siteHeader,
    /background:\s*var\(--background\);\s*background:\s*color-mix\([^;]*var\(--background\)[^;]*transparent[^;]*\)/,
  );
  assert.match(siteHeader, /(?:-webkit-)?backdrop-filter:\s*blur\(/);
});
