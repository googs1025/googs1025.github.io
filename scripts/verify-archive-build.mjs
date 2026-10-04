import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readDist = (path) =>
  readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

const [home, blog, cloudNative, openSource] = await Promise.all([
  readDist("index.html"),
  readDist("blog/index.html"),
  readDist("categories/云原生/index.html"),
  readDist("categories/开源社区/index.html"),
]);

for (const html of [home, blog, cloudNative, openSource]) {
  assert.match(html, /<ul class="post-list">[\s\S]*<article>/);
  assert.match(html, /href="\/posts\/kubecon-china-2025\/"/);
  assert.match(
    html,
    /<time datetime="2025-06-14T00:00:00\.000Z">2025年6月14日<\/time>/,
  );
  assert.match(
    html,
    /href="\/categories\/%E4%BA%91%E5%8E%9F%E7%94%9F\/"/,
  );
}

assert.match(cloudNative, /<h1 id="page-title">分类：云原生<\/h1>/);
assert.match(openSource, /<h1 id="page-title">分类：开源社区<\/h1>/);

console.log("Archive build output verified.");
