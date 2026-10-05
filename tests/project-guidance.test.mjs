import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("PRODUCT.md describes the current Astro blog product direction", async () => {
  const product = await read("PRODUCT.md");

  assert.match(product, /Astro/);
  assert.match(product, /博客优先|blog-first/i);
  assert.match(product, /中文优先/);
  assert.match(product, /Calm Teal/);
  assert.match(product, /静态全文搜索/);
  assert.match(product, /RSS/);
  assert.match(product, /GitHub Pages/);
  assert.doesNotMatch(
    product,
    /Jekyll|Academic Pages|project[- ]card|项目卡片优先|项目卡片结构/i,
  );
});

test("CONTRIBUTING.md documents the complete Astro contribution workflow", async () => {
  const url = new URL("../CONTRIBUTING.md", import.meta.url);
  await access(url);
  const contributing = await read("CONTRIBUTING.md");

  assert.match(contributing, /Node\.js 24/);
  assert.match(contributing, /npm install/);
  assert.match(contributing, /npx playwright install chromium/);
  assert.match(contributing, /npm run verify/);
  assert.match(contributing, /src\/content\/blog\//);
  assert.match(contributing, /public\/images\//);
  assert.match(contributing, /真实|真实性/);
  assert.match(contributing, /不得编造|禁止编造/);
  assert.match(contributing, /单一目的|范围明确/);
  assert.doesNotMatch(contributing, /Jekyll|Academic Pages/i);
});
