import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readDist = (path) =>
  readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

const [
  home,
  blog,
  cloudNative,
  openSource,
  post,
  legacyPost,
  about,
  cv,
  notFound,
  profileImage,
  pagefindEntry,
  sitemap,
] =
  await Promise.all([
    readDist("index.html"),
    readDist("blog/index.html"),
    readDist("categories/云原生/index.html"),
    readDist("categories/开源社区/index.html"),
    readDist("posts/kubecon-china-2025/index.html"),
    readDist("posts/2025/06/14/kubecon-2025-experience/index.html"),
    readDist("about/index.html"),
    readDist("cv/index.html"),
    readDist("404.html"),
    readFile(new URL("../dist/images/profile.jpg", import.meta.url)),
    readDist("pagefind/pagefind-entry.json"),
    readDist("sitemap-0.xml"),
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
  assert.match(html, /<meta property="og:type" content="website">/);
}

assert.match(cloudNative, /<h1 id="page-title">分类：云原生<\/h1>/);
assert.match(openSource, /<h1 id="page-title">分类：开源社区<\/h1>/);

assert.match(post, /<title>我的 KubeCon China 2025 参与之旅 \| 江振瑜<\/title>/);
assert.match(
  post,
  /<meta name="description" content="分享我第一次参加 KubeCon China 2025 的现场体验、社区交流和技术观察。">/,
);
assert.match(
  post,
  /<link rel="canonical" href="https:\/\/googs1025\.github\.io\/posts\/kubecon-china-2025\/">/,
);
assert.match(post, /<meta property="og:type" content="article">/);
assert.match(
  post,
  /<meta property="article:published_time" content="2025-06-14T00:00:00\.000Z">/,
);
assert.doesNotMatch(post, /property="article:modified_time"/);
assert.match(post, /<nav class="toc" aria-label="本文目录">/);
assert.match(post, /<article class="prose" data-pagefind-body>/);
assert.match(post, /src="\/images\/kubecon2025\/img_13\.png"/);
assert.match(
  post,
  /<time datetime="2025-06-14T00:00:00\.000Z">2025年6月14日<\/time>/,
);
assert.doesNotMatch(post, /更新于|aria-label="文章导航"/);

assert.match(
  legacyPost,
  /<link rel="canonical" href="https:\/\/googs1025\.github\.io\/posts\/kubecon-china-2025\/">/,
);
assert.match(
  legacyPost,
  /<meta http-equiv="refresh" content="0; url=\/posts\/kubecon-china-2025\/">/,
);
assert.match(
  legacyPost,
  /<a href="\/posts\/kubecon-china-2025\/">继续阅读<\/a>/,
);
assert.match(legacyPost, /<meta property="og:type" content="website">/);

for (const html of [about, cv]) {
  for (const fact of [
    "江振瑜",
    "Kubernetes",
    "Aibrix",
    "Volcano",
    "ByteDance",
    "googs1025@gmail.com",
    "马上消费金融",
  ]) {
    assert.match(html, new RegExp(fact));
  }

  for (const forbidden of [
    "GitHub University",
    "Version Control Theory",
    "Skill 1",
    "Professor Hub",
    "academicpages",
  ]) {
    assert.doesNotMatch(html, new RegExp(forbidden, "i"));
  }

  assert.match(html, />Kubernetes<\/a> Member/);
  assert.match(html, />Aibrix<\/a> Maintainer/);
  assert.match(html, />Volcano<\/a> Member/);
}

assert.match(about, /<img[^>]+src="\/images\/profile\.jpg"[^>]+alt="江振瑜"/);
assert.ok(profileImage.byteLength > 0, "expected the profile image in dist");
assert.match(notFound, /<h1[^>]*>页面未找到<\/h1>/);
assert.match(notFound, /href="\/"/);
assert.match(notFound, /href="\/blog\/"/);

assert.match(
  sitemap,
  /<loc>https:\/\/googs1025\.github\.io\/posts\/kubecon-china-2025\/<\/loc>/,
);
assert.doesNotMatch(
  sitemap,
  /<loc>https:\/\/googs1025\.github\.io\/posts\/2025\/06\/14\/kubecon-2025-experience\/<\/loc>/,
);

assert.equal(JSON.parse(pagefindEntry).languages["zh-hans"].page_count, 1);

console.log("Archive and profile build output verified.");
