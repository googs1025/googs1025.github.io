import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import { PROFILE } from "../src/data/profile.mjs";

const readDist = (path) =>
  readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const profileMain = (html) => {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main, "expected profile content inside main");
  return main;
};

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
  rss,
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
    readDist("rss.xml"),
  ]);

await access(new URL("../dist/pagefind/pagefind.js", import.meta.url));

assert.match(home, /<dialog\b[^>]*aria-label="全文搜索"/);
assert.match(home, /<input\b[^>]*type="search"/);
assert.match(home, /aria-live="polite"/);
assert.doesNotMatch(home, /\.innerHTML\s*=|javascript:/);
assert.doesNotMatch(home, /__VITE_PRELOAD__/);
const searchScriptHref = home.match(
  /<script\s+type="module"\s+src="([^"]*SearchDialog[^"]*)"/,
)?.[1];
assert.ok(searchScriptHref, "expected a generated search client script");
const searchScript = await readDist(searchScriptHref.replace(/^\//, ""));
assert.match(searchScript, /pagefind\/pagefind\.js/);
assert.doesNotMatch(
  searchScript,
  /__VITE_PRELOAD__|\.innerHTML\s*=|javascript:/,
);

for (const html of [home, blog, cloudNative, openSource]) {
  assert.match(html, /<ul class="post-list">[\s\S]*<article>/);
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
  const main = profileMain(html);

  assert.match(main, new RegExp(escapeRegExp(PROFILE.identity.name)));
  assert.match(main, new RegExp(escapeRegExp(PROFILE.identity.summary)));

  for (const experience of PROFILE.experience) {
    assert.match(main, new RegExp(escapeRegExp(experience.summary)));
  }

  for (const focus of PROFILE.technicalFocus) {
    assert.match(main, new RegExp(`<li>${escapeRegExp(focus)}</li>`));
  }

  for (const role of PROFILE.openSourceRoles) {
    assert.match(
      main,
      new RegExp(
        `<a href="${escapeRegExp(role.url)}">${escapeRegExp(role.project)}</a> ${escapeRegExp(role.role)}`,
      ),
    );
  }

  for (const collaboration of PROFILE.collaborations) {
    assert.match(
      main,
      new RegExp(
        `<a href="${escapeRegExp(collaboration.url)}">${escapeRegExp(collaboration.project)}</a>：${escapeRegExp(collaboration.activity)}`,
      ),
    );
  }

  for (const forbidden of [
    "GitHub University",
    "Version Control Theory",
    "Skill 1",
    "Professor Hub",
    "academicpages",
    "Second University",
    "First University",
  ]) {
    assert.doesNotMatch(main, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(main, /\b(?:19|20)\d{2}\b/);
  assert.doesNotMatch(
    main,
    /education|award|publication|professor|senior|staff|principal|lead|高级|资深|负责人/i,
  );
  assert.doesNotMatch(main, /\b\d+(?:\.\d+)?%/);
}

assert.match(about, /<img[^>]+src="\/images\/profile\.jpg"[^>]+alt="江振瑜"/);
assert.ok(profileImage.byteLength > 0, "expected the profile image in dist");
assert.match(notFound, /<h1[^>]*>页面未找到<\/h1>/);
assert.match(notFound, /<meta name="robots" content="noindex,nofollow">/);
assert.doesNotMatch(notFound, /<link rel="canonical"/);
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

const indexedPages = Object.values(JSON.parse(pagefindEntry).languages)
  .reduce((total, language) => total + language.page_count, 0);
assert.ok(indexedPages >= 1, "expected Pagefind to index at least one page");

assert.match(rss, /<title>江振瑜<\/title>/);
assert.match(
  rss,
  new RegExp(
    `<description>${escapeRegExp("江振瑜的技术博客，记录 Kubernetes 调度、云原生基础设施与 LLM 推理平台实践。")}</description>`,
  ),
);
assert.match(
  rss,
  /<item>[\s\S]*<title>我的 KubeCon China 2025 参与之旅<\/title>/,
);
assert.match(
  rss,
  /<link>https:\/\/googs1025\.github\.io\/posts\/kubecon-china-2025\/<\/link>/,
);

console.log("Archive and profile build output verified.");
