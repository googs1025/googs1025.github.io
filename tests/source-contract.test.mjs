import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

export const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Astro targets the production site and package scripts verify it", async () => {
  const config = await read("astro.config.mjs");
  const pkg = JSON.parse(await read("package.json"));

  assert.match(config, /site:\s*["']https:\/\/googs1025\.github\.io["']/);
  assert.match(config, /sitemap\(\{[\s\S]*filter:/);
  assert.match(
    config,
    /\/posts\/2025\/06\/14\/kubecon-2025-experience\//,
  );
  assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs");
  assert.equal(
    pkg.scripts.build,
    "astro build && pagefind --site dist && node scripts/verify-archive-build.mjs",
  );
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
  assert.match(postList, /postListItem\(post\)/);
  assert.match(postList, /datetime=\{item\.machineDate\}/);
  assert.match(postList, /item\.hasCategories/);
  assert.match(postList, /href=\{category\.url\}/);
  assert.doesNotMatch(postList, /set:html|innerHTML/);
});

test("post lists distinguish external canonical links accessibly", async () => {
  const postList = await read("src/components/PostList.astro");

  assert.match(postList, /href=\{item\.url\}/);
  assert.match(postList, /target=\{item\.target\}/);
  assert.match(postList, /rel=\{item\.rel\}/);
  assert.match(postList, /aria-label=\{item\.linkAriaLabel\}/);
  assert.match(postList, /item\.isExternal/);
  assert.match(postList, /item\.externalText/);
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
  assert.match(archive, /archivePage\(published,\s*1\)/);
  assert.match(archive, /<h1[^>]*>全部文章<\/h1>/);
  assert.match(archive, /showPagination/);
  assert.match(archive, /<nav\s+aria-label=["']文章分页["']/);
  assert.match(archive, /href=\{nextHref\}/);
  assert.doesNotMatch(archive, /paginatePosts|PAGE_SIZE|\/blog\/2\//);
});

test("dynamic blog pages start at page two and expose previous and next links", async () => {
  const archivePage = await read("src/pages/blog/[page].astro");

  assert.match(archivePage, /getStaticPaths/);
  assert.match(archivePage, /getCollection\(["']blog["']\)/);
  assert.match(archivePage, /publishedPosts\(/);
  assert.match(archivePage, /archiveDynamicPages\(published\)/);
  assert.match(archivePage, /previousHref/);
  assert.match(archivePage, /nextHref/);
  assert.match(archivePage, /aria-label=["']文章分页["']/);
  assert.doesNotMatch(archivePage, /paginatePosts|Math\.ceil|PAGE_SIZE|currentPage\s*===\s*2/);
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

test("post layout renders semantic, indexed article content and optional navigation", async () => {
  const layout = await read("src/layouts/PostLayout.astro");

  assert.match(layout, /<TableOfContents\s+headings=\{headings\}/);
  assert.match(layout, /<time\s+datetime=/);
  assert.match(
    layout,
    /<article\s+class=["']prose["']\s+data-pagefind-body>/,
  );
  assert.match(layout, /<nav\s+class=["']post-navigation["']\s+aria-label=["']文章导航["']/);
  assert.match(layout, /previous\s*\|\|\s*next/);
});

test("base and post layouts emit typed Open Graph article metadata", async () => {
  const [baseLayout, postLayout] = await Promise.all([
    read("src/layouts/BaseLayout.astro"),
    read("src/layouts/PostLayout.astro"),
  ]);

  assert.match(baseLayout, /ogType\?:\s*["']website["']\s*\|\s*["']article["']/);
  assert.match(baseLayout, /ogType\s*=\s*["']website["']/);
  assert.match(baseLayout, /property=["']og:type["']\s+content=\{ogType\}/);
  assert.match(baseLayout, /property=["']article:published_time["']/);
  assert.match(baseLayout, /property=["']article:modified_time["']/);
  assert.match(postLayout, /ogType=["']article["']/);
  assert.match(postLayout, /articlePublishedTime=\{data\.pubDate\.toISOString\(\)\}/);
  assert.match(postLayout, /articleModifiedTime=\{modifiedTime\}/);
});

test("content schema rejects an update before publication", async () => {
  const config = await read("src/content.config.ts");

  assert.match(config, /isUpdatedDateOnOrAfterPubDate/);
  assert.match(config, /updatedDate must be on or after pubDate/);
  assert.match(config, /path:\s*\[["']updatedDate["']\]/);
});

test("table of contents keeps second and third level headings and hides short outlines", async () => {
  const toc = await read("src/components/TableOfContents.astro");

  assert.match(toc, /MarkdownHeading\[\]/);
  assert.match(toc, /heading\.depth\s*===\s*2\s*\|\|\s*heading\.depth\s*===\s*3/);
  assert.match(toc, /eligibleHeadings\.length\s*>=\s*2/);
  assert.match(toc, /<nav\s+class=["']toc["']\s+aria-label=["']本文目录["']/);
  assert.match(toc, /href=\{`#\$\{heading\.slug\}`\}/);
  assert.doesNotMatch(toc, /set:html|innerHTML/);
});

test("post routes render local published entries with deterministic adjacent posts", async () => {
  const page = await read("src/pages/posts/[...slug].astro");

  assert.match(page, /getCollection\(["']blog["']\)/);
  assert.match(page, /publishedPosts\(/);
  assert.match(page, /!post\.data\.canonicalURL/);
  assert.match(page, /adjacentPosts\(/);
  assert.match(page, /params:\s*\{\s*slug:\s*post\.id\s*\}/);
  assert.match(page, /await\s+render\(post\)/);
  assert.match(page, /<PostLayout[^>]*post=\{post\}[^>]*headings=\{headings\}/s);
  assert.match(page, /<Content\s*\/>/);
});

test("legacy KubeCon URL declares the destination and a visible fallback link", async () => {
  const [legacyPage, baseLayout] = await Promise.all([
    read("src/pages/posts/2025/06/14/kubecon-2025-experience/index.astro"),
    read("src/layouts/BaseLayout.astro"),
  ]);

  assert.match(legacyPage, /destination\s*=\s*["']\/posts\/kubecon-china-2025\/["']/);
  assert.match(legacyPage, /canonical=\{canonicalURL\}/);
  assert.match(legacyPage, /http-equiv=["']refresh["']/);
  assert.match(legacyPage, /href=\{destination\}/);
  assert.match(legacyPage, />继续阅读<\/a>/);
  assert.match(baseLayout, /<slot\s+name=["']head["']\s*\/>/);
});
