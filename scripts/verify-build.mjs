import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";

import { parse } from "yaml";

import { PROFILE } from "../src/data/profile.mjs";
import { assertHtmlFilesOmitTerms } from "./verify-build-lib.mjs";

const repositoryRoot = new URL("../", import.meta.url);
const distRoot = new URL("dist/", repositoryRoot);
const blogRoot = new URL("src/content/blog/", repositoryRoot);

const readDist = (path) => readFile(new URL(path, distRoot), "utf8");
const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const profileMain = (html) => {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main, "expected profile content inside main");
  return main;
};

const readPublishedEntries = async () => {
  const paths = (await readdir(blogRoot, { recursive: true })).filter((path) =>
    /\.(?:md|mdx)$/.test(path),
  );

  return Promise.all(
    paths.map(async (path) => {
      const source = await readFile(new URL(path, blogRoot), "utf8");
      const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/)?.[1];
      assert.ok(frontmatter, `expected YAML frontmatter in ${path}`);
      return { path, data: parse(frontmatter) };
    }),
  ).then((entries) => entries.filter(({ data }) => data.draft !== true));
};

const distEntries = await readdir(distRoot, { recursive: true });
const distFiles = [];
for (const path of distEntries) {
  if ((await stat(new URL(path, distRoot))).isFile()) {
    distFiles.push(path);
  }
}

const publishedEntries = await readPublishedEntries();
const localPublishedEntries = publishedEntries.filter(
  ({ data }) => !data.canonicalURL,
);
const expectedCategories = new Set(
  publishedEntries.flatMap(({ data }) => data.categories ?? []),
);

const requiredPaths = [
  "index.html",
  "blog/index.html",
  "about/index.html",
  "cv/index.html",
  "404.html",
  "favicon.svg",
  "images/profile.jpg",
  "rss.xml",
  "sitemap-index.xml",
  "sitemap-0.xml",
  "pagefind/pagefind.js",
  "pagefind/pagefind-entry.json",
];
await Promise.all(
  requiredPaths.map((path) => access(new URL(path, distRoot))),
);

const [home, blog, about, cv, notFound, pagefindEntry, sitemapIndex, sitemap, rss] =
  await Promise.all([
    readDist("index.html"),
    readDist("blog/index.html"),
    readDist("about/index.html"),
    readDist("cv/index.html"),
    readDist("404.html"),
    readDist("pagefind/pagefind-entry.json"),
    readDist("sitemap-index.xml"),
    readDist("sitemap-0.xml"),
    readDist("rss.xml"),
  ]);

const forbiddenPublicationMarkers = [
  "我的 KubeCon China 2025 参与之旅",
  "kubecon-china-2025",
  "posts/2025/06/14/kubecon-2025-experience",
  "/images/kubecon2025",
];
for (const path of distFiles) {
  const normalizedPath = path.toLowerCase();
  const normalizedContents = (await readFile(new URL(path, distRoot)))
    .toString("utf8")
    .toLowerCase();

  for (const marker of forbiddenPublicationMarkers) {
    const normalizedMarker = marker.toLowerCase();
    assert.equal(
      normalizedPath.includes(normalizedMarker),
      false,
      `forbidden publication marker found in dist path: ${path}`,
    );
    assert.equal(
      normalizedContents.includes(normalizedMarker),
      false,
      `forbidden publication marker found in dist file: ${path}`,
    );
  }
}

const generatedHtmlFiles = distFiles.filter((path) => path.endsWith(".html"));
await assertHtmlFilesOmitTerms(
  generatedHtmlFiles,
  [
    "GitHub University",
    "Version Control Theory",
    "Skill 1",
    "Professor Hub",
    "academicpages",
    "Second University",
    "First University",
    "Teaching experience 1",
    "Portfolio item number 1",
    "你可以在此处添加",
    "请填写",
    "TODO",
    "TBD",
  ],
  readDist,
);

assert.match(home, /<html lang="zh-Hans"/);
assert.match(home, /href="\/rss\.xml"/);
assert.match(home, /data-theme-toggle/);
assert.match(home, /<dialog\b[^>]*aria-label="全文搜索"/);
assert.match(home, /<input\b[^>]*type="search"/);
assert.match(home, /aria-live="polite"/);
assert.doesNotMatch(home, /\.innerHTML\s*=|javascript:|__VITE_PRELOAD__/);

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

for (const html of [home, blog]) {
  assert.match(html, /<meta property="og:type" content="website">/);
  if (publishedEntries.length === 0) {
    assert.match(html, /<p class="empty-state">这里还没有已发布的文章。<\/p>/);
    assert.doesNotMatch(html, /<ul class="post-list">/);
  } else {
    assert.match(html, /<ul class="post-list">[\s\S]*<article>/);
  }
}

const generatedPostPages = distFiles.filter((path) =>
  /^posts\/.+\/index\.html$/.test(path),
);
const generatedCategoryPages = distFiles.filter((path) =>
  /^categories\/.+\/index\.html$/.test(path),
);

if (publishedEntries.length === 0) {
  assert.deepEqual(generatedPostPages, []);
  assert.deepEqual(generatedCategoryPages, []);
  assert.equal(distFiles.some((path) => path.startsWith("posts/")), false);
  assert.equal(distFiles.some((path) => path.startsWith("categories/")), false);
} else {
  assert.ok(generatedPostPages.length >= localPublishedEntries.length);
  assert.equal(generatedCategoryPages.length, expectedCategories.size);
}

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
  assert.doesNotMatch(main, /\b(?:19|20)\d{2}\b/);
  assert.doesNotMatch(
    main,
    /education|award|publication|professor|senior|staff|principal|lead|高级|资深|负责人/i,
  );
  assert.doesNotMatch(main, /\b\d+(?:\.\d+)?%/);
}

assert.match(about, /<title>About \| 江振瑜<\/title>/);
assert.match(
  about,
  /<article class="content profile-page" data-pagefind-body>/,
);
assert.match(about, /<img[^>]+src="\/images\/profile\.jpg"[^>]+alt="江振瑜"/);
assert.ok(
  (await readFile(new URL("images/profile.jpg", distRoot))).byteLength > 0,
  "expected the profile image in dist",
);

assert.match(notFound, /<h1[^>]*>页面未找到<\/h1>/);
assert.match(notFound, /<meta name="robots" content="noindex,nofollow">/);
assert.doesNotMatch(notFound, /<link rel="canonical"/);
assert.match(notFound, /href="\/"/);
assert.match(notFound, /href="\/blog\/"/);

assert.match(
  sitemapIndex,
  /<loc>https:\/\/googs1025\.github\.io\/sitemap-0\.xml<\/loc>/,
);
for (const requiredUrl of ["/", "/about/", "/blog/", "/cv/"]) {
  assert.match(
    sitemap,
    new RegExp(
      `<loc>https:\/\/googs1025\\.github\\.io${escapeRegExp(requiredUrl)}<\\/loc>`,
    ),
  );
}

const indexedPages = Object.values(JSON.parse(pagefindEntry).languages).reduce(
  (total, language) => total + language.page_count,
  0,
);
assert.ok(indexedPages >= 1, "expected Pagefind to index the About page");

assert.match(rss, /<title>江振瑜<\/title>/);
assert.match(
  rss,
  new RegExp(
    `<description>${escapeRegExp("江振瑜的技术博客，记录 Kubernetes 调度、云原生基础设施与 LLM 推理平台实践。")}</description>`,
  ),
);
const rssItems = rss.match(/<item>/g) ?? [];
assert.equal(rssItems.length, publishedEntries.length);
if (publishedEntries.length === 0) {
  assert.doesNotMatch(rss, /<item>/);
}

console.log(
  `Build output verified: ${publishedEntries.length} published posts, ${generatedCategoryPages.length} category pages, ${indexedPages} Pagefind pages.`,
);
