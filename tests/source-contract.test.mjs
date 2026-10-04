import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";

export const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Astro targets the production site and package scripts verify it", async () => {
  const config = await read("astro.config.mjs");
  const pkg = JSON.parse(await read("package.json"));

  assert.match(config, /site:\s*["']https:\/\/googs1025\.github\.io["']/);
  assert.match(config, /sitemap\(\)/);
  assert.doesNotMatch(config, /SITEMAP_EXCLUDED_PATHS|kubecon-2025-experience/);
  assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs");
  assert.equal(
    pkg.scripts.build,
    "astro build && pagefind --site dist",
  );
  assert.equal(pkg.scripts["test:e2e"], "playwright test");
  assert.equal(
    pkg.scripts.verify,
    "npm test && npm run check && npm run build && node scripts/verify-build.mjs && npm run test:e2e",
  );
  assert.equal(pkg.devDependencies["@playwright/test"], "^1.63.0");
  assert.equal(pkg.devDependencies.yaml, "^2.9.1");
});

test("production verification entrypoint owns the complete generated-output checks", async () => {
  const verifier = await read("scripts/verify-build.mjs");

  assert.match(verifier, /readDist\(["']index\.html["']\)/);
  assert.match(verifier, /dist\/pagefind\/pagefind\.js|pagefind\/pagefind\.js/);
  assert.match(verifier, /PROFILE/);
  assert.match(verifier, /lang=["']zh-Hans["']/);
  assert.match(verifier, /rss\.xml/);
  assert.match(verifier, /data-theme-toggle/);
  assert.doesNotMatch(verifier, /verify-archive-build/);
  await assert.rejects(access(new URL("../scripts/verify-archive-build.mjs", import.meta.url)));
});

const ACTION_PINS = [
  [
    "actions/checkout",
    "3d3c42e5aac5ba805825da76410c181273ba90b1",
    "v7.0.1",
  ],
  [
    "actions/setup-node",
    "820762786026740c76f36085b0efc47a31fe5020",
    "v7.0.0",
  ],
  [
    "actions/configure-pages",
    "45bfe0192ca1faeb007ade9deae92b16b8254a0d",
    "v6.0.0",
  ],
  [
    "actions/upload-pages-artifact",
    "fc324d3547104276b827a68afc52ff2a11cc49c9",
    "v5.0.0",
  ],
  [
    "actions/deploy-pages",
    "368f82528645a54fb793d4d04e342629a3f51346",
    "v5.0.1",
  ],
];

test("Pages deployment parses with immutable official action releases", async () => {
  const source = await read(".github/workflows/deploy.yml");
  const workflow = parse(source);

  assert.deepEqual(workflow.on, {
    push: { branches: ["master"] },
    workflow_dispatch: null,
  });
  assert.deepEqual(workflow.permissions, {});
  assert.deepEqual(workflow.concurrency, {
    group: "pages",
    "cancel-in-progress": false,
  });

  for (const [repository, sha, release] of ACTION_PINS) {
    assert.match(source, new RegExp(`uses: ${repository}@${sha} # ${release}`));
  }
  assert.doesNotMatch(source, /uses:\s*actions\/[^\s@]+@v\d/);
});

test("Pages build has read-only source access and no publication credentials", async () => {
  const workflow = parse(await read(".github/workflows/deploy.yml"));
  const build = workflow.jobs.build;
  const checkout = build.steps.find(({ uses }) =>
    uses?.startsWith("actions/checkout@"));
  const setupNode = build.steps.find(({ uses }) =>
    uses?.startsWith("actions/setup-node@"));
  const upload = build.steps.find(({ uses }) =>
    uses?.startsWith("actions/upload-pages-artifact@"));

  assert.equal(build["runs-on"], "ubuntu-latest");
  assert.equal(build["timeout-minutes"], 30);
  assert.deepEqual(build.permissions, { contents: "read" });
  assert.equal(checkout.with["persist-credentials"], false);
  assert.equal(setupNode.with["node-version"], 24);
  assert.equal(setupNode.with.cache, "npm");
  assert.deepEqual(build.steps.filter(({ run }) => run).map(({ run }) => run), [
    "npm ci",
    "npx playwright install --with-deps chromium",
    "npm run verify",
  ]);
  assert.equal(upload.with.path, "dist");
  assert.equal(
    build.steps.some(({ uses }) => uses?.startsWith("actions/configure-pages@")),
    false,
  );
  assert.equal(
    build.steps.some(({ uses }) => uses?.startsWith("actions/deploy-pages@")),
    false,
  );
});

test("Pages deploy alone receives publication credentials", async () => {
  const workflow = parse(await read(".github/workflows/deploy.yml"));
  const deploy = workflow.jobs.deploy;
  const configureIndex = deploy.steps.findIndex(({ uses }) =>
    uses?.startsWith("actions/configure-pages@"));
  const deploymentIndex = deploy.steps.findIndex(({ uses }) =>
    uses?.startsWith("actions/deploy-pages@"));

  assert.equal(deploy.needs, "build");
  assert.equal(deploy["runs-on"], "ubuntu-latest");
  assert.equal(deploy["timeout-minutes"], 10);
  assert.deepEqual(deploy.permissions, {
    pages: "write",
    "id-token": "write",
  });
  assert.deepEqual(deploy.environment, {
    name: "github-pages",
    url: "${{ steps.deployment.outputs.page_url }}",
  });
  assert.ok(configureIndex >= 0);
  assert.ok(deploymentIndex > configureIndex);
  assert.equal(deploy.steps[deploymentIndex].id, "deployment");
  await assert.rejects(access(new URL("../.github/workflows/scrape_talks.yml", import.meta.url)));
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

test("search dialog exposes a safe accessible Pagefind interface", async () => {
  const [searchDialog, header] = await Promise.all([
    read("src/components/SearchDialog.astro"),
    read("src/components/Header.astro"),
  ]);

  assert.match(searchDialog, /<dialog\b/);
  assert.match(
    searchDialog,
    /<a\b[^>]*href=["']\/blog\/["'][^>]*data-search-open/,
  );
  assert.match(searchDialog, /aria-label=["']全文搜索["']/);
  assert.match(searchDialog, /\/pagefind\/pagefind\.js/);
  assert.match(searchDialog, /import\([^)]*pagefindPath\)/);
  assert.match(searchDialog, /aria-live=["']polite["']/);
  assert.match(searchDialog, /没有找到相关文章/);
  assert.doesNotMatch(searchDialog, /innerHTML/);
  assert.match(header, /import\s+SearchDialog\s+from/);
  assert.match(header, /<SearchDialog\s*\/>/);
  assert.doesNotMatch(header, /<a[^>]+aria-label=["']搜索文章["']/);
});

test("generated verifier scales with additional posts", async () => {
  const verifier = await read("scripts/verify-build.mjs");

  assert.doesNotMatch(verifier, /page_count\s*,\s*1/);
  assert.match(verifier, /indexedPages\s*>=\s*1/);
  assert.match(verifier, /readdir\([\s\S]*?recursive:\s*true/);
  assert.match(verifier, /publishedEntries\.length/);
  assert.match(verifier, /rssItems\.length/);
  assert.match(verifier, /forbiddenPublicationMarkers/);
  assert.match(verifier, /publishedEntries\.length\s*===\s*0/);
  assert.match(verifier, /sitemap-index\.xml/);
  assert.match(verifier, /你可以在此处添加/);
  assert.match(verifier, /请填写/);
  assert.doesNotMatch(verifier, /generatedHtml\s*=|\.join\(["']\\n["']\)/);
  assert.doesNotMatch(verifier, /categories\/云原生|categories\/开源社区/);
});

test("Playwright runs production search and no-JS smoke tests", async () => {
  const [config, smoke, gitignore] = await Promise.all([
    read("playwright.config.mjs"),
    read("tests/search-dialog.e2e.spec.mjs"),
    read(".gitignore"),
  ]);

  assert.match(config, /npm run preview -- --host 127\.0\.0\.1/);
  assert.match(config, /baseURL:\s*["']http:\/\/127\.0\.0\.1:4321["']/);
  assert.match(smoke, /javaScriptEnabled:\s*false/);
  assert.match(smoke, /Kubernetes/);
  assert.match(smoke, /name:\s*["']江振瑜["']/);
  assert.match(smoke, /href\)\.toBe\(["']\/about\/["']\)/);
  assert.match(smoke, /press\(["']Escape["']\)/);
  assert.match(gitignore, /^test-results\/$/m);
  assert.match(gitignore, /^playwright-report\/$/m);
});

test("RSS is generated from published posts and shared site metadata", async () => {
  const feed = await read("src/pages/rss.xml.ts");

  assert.match(feed, /from\s+["']@astrojs\/rss["']/);
  assert.match(feed, /publishedPosts/);
  assert.match(feed, /SITE/);
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

test("base layout can omit canonical metadata and mark error pages noindex", async () => {
  const [baseLayout, notFoundPage] = await Promise.all([
    read("src/layouts/BaseLayout.astro"),
    read("src/pages/404.astro"),
  ]);

  assert.match(baseLayout, /canonical\?:\s*URL\s*\|\s*string\s*\|\s*false/);
  assert.match(baseLayout, /noindex\?:\s*boolean/);
  assert.match(baseLayout, /canonical\s*===\s*false\s*\?\s*undefined/);
  assert.match(
    baseLayout,
    /canonicalURL\s*&&\s*<link\s+rel=["']canonical["']/,
  );
  assert.match(
    baseLayout,
    /noindex\s*&&\s*<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']/,
  );
  assert.match(notFoundPage, /canonical=\{false\}/);
  assert.match(notFoundPage, /\bnoindex\b/);
});

test("print styles force light colors and expose external destinations", async () => {
  const styles = await read("src/styles/global.css");
  const printStyles = styles.slice(styles.indexOf("@media print"));

  assert.match(
    printStyles,
    /:root\s*,\s*:root\[data-theme=["']dark["']\]\s*\{[\s\S]*color-scheme:\s*light[\s\S]*--background:\s*#fff[\s\S]*--foreground:\s*#000[\s\S]*--muted:[^;]+;[\s\S]*--border:[^;]+;[\s\S]*--accent:[^;]+;/,
  );
  assert.match(
    printStyles,
    /body\s*\{[^}]*background:\s*#fff[^}]*color:\s*#000/s,
  );
  assert.match(
    printStyles,
    /\.cv-page a\[href\^=["']http:\/\/["']\]::after/,
  );
  assert.match(
    printStyles,
    /\.cv-page a\[href\^=["']https:\/\/["']\]::after/,
  );
  assert.match(
    printStyles,
    /content:\s*["'] \(["']\s*attr\(href\)\s*["']\)["']/,
  );
  assert.doesNotMatch(printStyles, /a\[href\^=["']mailto:/);
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

test("About marks its meaningful profile content for Pagefind", async () => {
  const about = await read("src/pages/about.astro");

  assert.match(
    about,
    /<article\s+class=["']content profile-page["']\s+data-pagefind-body>/,
  );
  assert.match(about, /PROFILE\.technicalFocus/);
});
