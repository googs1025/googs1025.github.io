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

test("post lists render semantic articles with dates and rooted category links", async () => {
  const postList = await read("src/components/PostList.astro");

  assert.match(postList, /CollectionEntry<["']blog["']>\[\]/);
  assert.match(postList, /<ul\s+class=["']post-list["']/);
  assert.match(postList, /<li>[\s\S]*<article>[\s\S]*<time\s+datetime=/);
  assert.match(postList, /toLocaleDateString\(["']zh-CN["']/);
  assert.match(postList, /`\/categories\/\$\{encodeURIComponent\(category\)\}\//);
  assert.doesNotMatch(postList, /set:html|innerHTML/);
});

test("post lists distinguish external canonical links accessibly", async () => {
  const postList = await read("src/components/PostList.astro");

  assert.match(postList, /canonicalURL\s*\?\?/);
  assert.match(postList, /`\/posts\/\$\{post\.id\}\//);
  assert.match(postList, /target=\{[^}]*\?\s*["']_blank["']/);
  assert.match(postList, /rel=\{[^}]*\?\s*["']noreferrer["']/);
  assert.match(postList, />External</);
  assert.match(postList, /aria-label=/);
});

test("home loads published posts and intentionally handles an empty collection", async () => {
  const home = await read("src/pages/index.astro");

  assert.match(home, /getCollection\(["']blog["']\)/);
  assert.match(home, /publishedPosts\(/);
  assert.match(home, /\.slice\(0,\s*10\)/);
  assert.match(home, /<BaseLayout/);
  assert.match(home, /<h1[^>]*>文章<\/h1>/);
  assert.match(home, /<PostList\s+posts=/);
  assert.match(home, /posts\.length\s*>\s*0/);
});

test("blog index uses shared pagination and links to page two only when needed", async () => {
  const archive = await read("src/pages/blog/index.astro");

  assert.match(archive, /getCollection\(["']blog["']\)/);
  assert.match(archive, /publishedPosts\(/);
  assert.match(archive, /paginatePosts\([^,]+,\s*1,\s*10\)/);
  assert.match(archive, /<h1[^>]*>全部文章<\/h1>/);
  assert.match(archive, /totalPages\s*>\s*1/);
  assert.match(archive, /<nav\s+aria-label=["']文章分页["']/);
  assert.match(archive, /href=["']\/blog\/2\/["']/);
});

test("dynamic blog pages start at page two and expose previous and next links", async () => {
  const archivePage = await read("src/pages/blog/[page].astro");

  assert.match(archivePage, /getStaticPaths/);
  assert.match(archivePage, /getCollection\(["']blog["']\)/);
  assert.match(archivePage, /publishedPosts\(/);
  assert.match(archivePage, /paginatePosts\(/);
  assert.match(archivePage, /(?:from|start)\s*(?::|=)\s*2/);
  assert.match(archivePage, /currentPage\s*===\s*2\s*\?\s*["']\/blog\/["']/);
  assert.match(archivePage, /aria-label=["']文章分页["']/);
});

test("category pages derive exact published categories and share the post list", async () => {
  const categoryPage = await read("src/pages/categories/[category].astro");

  assert.match(categoryPage, /getStaticPaths/);
  assert.match(categoryPage, /getCollection\(["']blog["']\)/);
  assert.match(categoryPage, /publishedPosts\(/);
  assert.match(categoryPage, /new Set\(/);
  assert.match(categoryPage, /categories\.includes\(category\)/);
  assert.match(categoryPage, /分类：\{category\}/);
  assert.match(categoryPage, /<PostList\s+posts=/);
});
