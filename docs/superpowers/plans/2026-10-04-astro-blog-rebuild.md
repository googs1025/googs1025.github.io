# Astro Blog Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Academic Pages/Jekyll site with a Calm Teal Astro blog that preserves authentic content, supports dark mode, static search and RSS, and deploys to GitHub Pages.

**Architecture:** Astro statically generates the homepage, archive, categories, posts, profile pages, legacy redirect, RSS, sitemap, and 404 page. An Astro content collection validates Markdown; Pagefind indexes `dist/`; small framework-free scripts handle theme, search, and mobile navigation.

**Tech Stack:** Astro 7, TypeScript 6, Astro content collections, `@astrojs/rss`, `@astrojs/sitemap`, Pagefind, Geist variable fonts, Node test runner, GitHub Pages Actions.

---

## Safety and file map

The working tree already contains user work in `_posts/我的 KubeCon China 2025 参与之旅.md` and `images/kubecon2025/`. Never restore or overwrite it. Migrate the current on-disk versions and verify them before removing Jekyll sources.

The current `_pages/cv.md` and `_data/cv.json` are demo content. The new CV may use only verified facts from the current About page, configuration, and approved design.

```text
astro.config.mjs                         Astro and sitemap configuration
package.json / package-lock.json         dependencies and commands
public/images/                           profile and migrated post images
scripts/verify-build.mjs                 production-output contract
tests/*.test.mjs                         unit and source contracts
src/content.config.ts                    post schema
src/content/blog/*.md                    authentic posts
src/data/site.ts                         identity and contact constants
src/lib/posts.mjs                        filtering and pagination
src/components/*.astro                   shell, lists, search, TOC
src/layouts/{BaseLayout,PostLayout}.astro shared page structures
src/pages/**                             static routes, RSS, compatibility URL
src/styles/global.css                    Calm Teal visual system
.github/workflows/deploy.yml             verified Pages deployment
```

### Task 1: Establish a testable Astro foundation

**Files:** Create `tests/source-contract.test.mjs`, `astro.config.mjs`, `tsconfig.json`, `src/data/site.ts`, `src/pages/index.astro`; replace `package.json`; modify `.gitignore`.

- [ ] **Step 1: Write the failing configuration contract**

```js
// tests/source-contract.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
export const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Astro targets the production site and package scripts verify it", async () => {
  const config = await read("astro.config.mjs");
  const pkg = JSON.parse(await read("package.json"));
  assert.match(config, /site:\s*["']https:\/\/googs1025\.github\.io["']/);
  assert.match(config, /sitemap\(\)/);
  assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs");
  assert.equal(pkg.scripts.verify, "npm test && npm run check && npm run build && node scripts/verify-build.mjs");
});
```

- [ ] **Step 2: Run `node --test tests/source-contract.test.mjs`**

Expected: FAIL because `astro.config.mjs` is absent and the old package has no Astro scripts.

- [ ] **Step 3: Replace the package manifest**

```json
{
  "name":"googs1025.github.io","version":"1.0.0","private":true,"type":"module",
  "scripts":{"dev":"astro dev","check":"astro check","test":"node --test tests/*.test.mjs","build":"astro build && pagefind --site dist","preview":"astro preview","verify":"npm test && npm run check && npm run build && node scripts/verify-build.mjs"},
  "dependencies":{"@astrojs/check":"^0.9.10","@astrojs/rss":"^4.0.19","@astrojs/sitemap":"^3.7.4","@fontsource-variable/geist":"^5.3.0","@fontsource-variable/geist-mono":"^5.3.0","astro":"^7.3.5","pagefind":"^1.5.2","sharp":"^0.35.5","typescript":"^6.0.3"},
  "engines":{"node":">=24.0.0"}
}
```

- [ ] **Step 4: Add exact Astro configuration**

```js
// astro.config.mjs
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
export default defineConfig({
  site:"https://googs1025.github.io", integrations:[sitemap()],
  markdown:{ shikiConfig:{ themes:{light:"github-light",dark:"github-dark"}, wrap:true } },
});
```

```json
// tsconfig.json
{"extends":"astro/tsconfigs/strict","compilerOptions":{"baseUrl":".","paths":{"@/*":["src/*"]}}}
```

```ts
// src/data/site.ts
export const SITE = {
  title:"江振瑜", handle:"@googs1025",
  description:"江振瑜的技术博客，记录 Kubernetes 调度、云原生基础设施与 LLM 推理平台实践。",
  url:"https://googs1025.github.io", email:"googs1025@gmail.com",
  github:"https://github.com/googs1025",
} as const;
```

Create a temporary `src/pages/index.astro` containing a valid `zh-Hans` document and `SITE.title`. Append `node_modules/`, `dist/`, `.astro/`, `.superpowers/`, and `.DS_Store` to `.gitignore`.

- [ ] **Step 5: Install and verify**

Run: `npm_config_cache=/private/tmp/googs1025-npm-cache npm install && npm test && npm run check && npm run build`

Expected: `package-lock.json` is created and all commands pass.

- [ ] **Step 6: Commit**

```bash
git add .gitignore package.json package-lock.json astro.config.mjs tsconfig.json src/data/site.ts src/pages/index.astro tests/source-contract.test.mjs
git commit -m "build: establish Astro site foundation"
```

### Task 2: Validate posts and migrate the authentic article

**Files:** Create `src/content.config.ts`, `src/lib/posts.mjs`, `tests/posts.test.mjs`, `tests/content.test.mjs`, `src/content/blog/kubecon-china-2025.md`, `public/images/kubecon2025/*.png`.

- [ ] **Step 1: Write failing post utility tests**

```js
// tests/posts.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { paginatePosts, publishedPosts } from "../src/lib/posts.mjs";
const entry=(id,date,draft=false)=>({id,data:{pubDate:new Date(date),draft}});
test("filters drafts and sorts newest first",()=>assert.deepEqual(publishedPosts([entry("old","2024-01-01"),entry("draft","2026-01-01",true),entry("new","2025-01-01")]).map(x=>x.id),["new","old"]));
test("paginates deterministically",()=>assert.deepEqual(paginatePosts(Array.from({length:11},(_,id)=>({id})),2,10),{items:[{id:10}],currentPage:2,totalPages:2}));
```

Run: `node --test tests/posts.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 2: Implement the tested helpers**

```js
// src/lib/posts.mjs
export const publishedPosts=(posts)=>posts.filter(({data})=>!data.draft).toSorted((a,b)=>b.data.pubDate.valueOf()-a.data.pubDate.valueOf());
export function paginatePosts(posts,currentPage,pageSize){
  const totalPages=Math.max(1,Math.ceil(posts.length/pageSize));
  return {items:posts.slice((currentPage-1)*pageSize,currentPage*pageSize),currentPage,totalPages};
}
```

- [ ] **Step 3: Define the content collection**

```ts
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
const blog=defineCollection({loader:glob({base:"./src/content/blog",pattern:"**/*.{md,mdx}"}),schema:z.object({
  title:z.string().min(1), description:z.string().min(1), pubDate:z.coerce.date(), updatedDate:z.coerce.date().optional(),
  categories:z.array(z.string()).default([]), draft:z.boolean().default(false), canonicalURL:z.string().url().optional(),
  legacyURLs:z.array(z.string().startsWith("/")).default([]),
})});
export const collections={blog};
```

- [ ] **Step 4: Write the failing migration contract**

```js
// tests/content.test.mjs
import assert from "node:assert/strict";
import { access,readFile } from "node:fs/promises";
import test from "node:test";
const path=new URL("../src/content/blog/kubecon-china-2025.md",import.meta.url);
test("post is normalized and contains no prompts",async()=>{const post=await readFile(path,"utf8");assert.match(post,/pubDate: 2025-06-14/);assert.match(post,/\/posts\/2025\/06\/14\/kubecon-2025-experience\//);assert.doesNotMatch(post,/你可以在此处添加|请填写|TODO|TBD/);});
test("referenced images exist",async()=>{const post=await readFile(path,"utf8");const refs=[...post.matchAll(/!\[[^\]]+\]\((\/images\/kubecon2025\/[^)]+)\)/g)].map(x=>x[1]);assert.ok(refs.length>0);await Promise.all(refs.map(x=>access(new URL(`../public${x}`,import.meta.url))));});
```

Run: `node --test tests/content.test.mjs`

Expected: FAIL because the Astro post is absent.

- [ ] **Step 5: Migrate article and images**

Copy the current 16 PNG files to `public/images/kubecon2025/`. Create the Astro post from the current on-disk Jekyll post using:

```yaml
---
title: "我的 KubeCon China 2025 参与之旅"
description: "分享我第一次参加 KubeCon China 2025 的现场体验、社区交流和技术观察。"
pubDate: 2025-06-14
updatedDate: 2025-06-14
categories: [云原生, 开源社区]
legacyURLs: [/posts/2025/06/14/kubecon-2025-experience/]
---
```

Preserve all authored prose and current uncommitted edits. Remove the duplicate H1 and authoring-prompt blockquotes. Rewrite each image URL under `/images/kubecon2025/` while retaining its original basename, and add factual alt text derived from adjacent prose.

- [ ] **Step 6: Verify and commit**

Run: `npm test && npm run check`

```bash
git add src/content.config.ts src/lib/posts.mjs src/content/blog public/images/kubecon2025 tests/posts.test.mjs tests/content.test.mjs
git commit -m "content: migrate blog post to Astro collection"
```

### Task 3: Build the Calm Teal site shell

**Files:** Create `public/favicon.svg`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/{Header,Footer,ThemeToggle}.astro`; replace `src/pages/index.astro`; modify `tests/source-contract.test.mjs`.

- [ ] **Step 1: Add a failing accessibility contract**

Append a test that reads the four shell files and asserts `href="#main-content"`, `aria-label="主导航"`, `aria-label="切换颜色主题"`, and `prefers-reduced-motion:reduce` are present. Run `npm test`; expect missing-file failure.

- [ ] **Step 2: Implement `BaseLayout.astro`**

It must import both Geist variable fonts and global CSS, accept `title`, `description`, and `canonical`, render canonical/RSS/favicon plus `og:title`, `og:description`, `og:url`, and `og:type` metadata, run an inline pre-paint theme initializer, and wrap Header, `<main id="main-content">`, and Footer. Include `<a class="skip-link" href="#main-content">跳到正文</a>`.

Copy the existing owned icon without modification: `mkdir -p public && cp images/favicon.svg public/favicon.svg`.

- [ ] **Step 3: Implement header, footer, and theme control**

Header contains brand, exact links `Home / Blog / About / CV`, a semantic desktop nav, `<details>` mobile nav, temporary `/blog/` search link, and ThemeToggle. Footer contains year, identity, GitHub, email, and RSS. ThemeToggle uses this behavior:

```js
document.querySelectorAll("[data-theme-toggle]").forEach((button)=>button.addEventListener("click",()=>{
  const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
  document.documentElement.dataset.theme=next;localStorage.setItem("theme",next);
}));
```

- [ ] **Step 4: Implement the full visual token system**

Start `global.css` with these exact tokens, then add complete reset, typography, `.shell` (70rem), `.content` (45rem), prose, header/footer, navigation, post list, badges, buttons, focus, mobile, image/table/code overflow, and reduced-motion rules:

```css
:root{color-scheme:light;--background:#fff;--foreground:#18181b;--muted:#71717a;--border:#e4e4e7;--accent:#356b78;--accent-soft:#edf5f6;--surface:#fafafa;--code-background:#f4f4f5}
:root[data-theme="dark"]{color-scheme:dark;--background:#0d0f10;--foreground:#f4f4f5;--muted:#a1a1aa;--border:#292c2f;--accent:#82bcc8;--accent-soft:#16262a;--surface:#141617;--code-background:#090a0b}
*,*::before,*::after{box-sizing:border-box} body{margin:0;background:var(--background);color:var(--foreground);font-family:"Geist Variable","PingFang SC","Microsoft YaHei",sans-serif;line-height:1.65}.shell{width:min(100% - 2rem,70rem);margin-inline:auto}.content{width:min(100% - 2rem,45rem);margin-inline:auto}:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 55%,transparent);outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
```

Do not add gradients or shadows.

- [ ] **Step 5: Exercise the shell and commit**

Replace the temporary index with `BaseLayout` and a `.content` heading. Run `npm test && npm run check && npm run build`; expect pass.

```bash
git add src/components src/layouts/BaseLayout.astro src/styles/global.css src/pages/index.astro tests/source-contract.test.mjs
git commit -m "feat: add Calm Teal site shell"
```

### Task 4: Generate home, blog, categories, and pagination

**Files:** Create `src/components/PostList.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[page].astro`, `src/pages/categories/[category].astro`; replace `src/pages/index.astro`; modify `tests/source-contract.test.mjs`.

- [ ] **Step 1: Add failing route contracts**

Append a test that reads the five route/component files and asserts they contain `getCollection("blog")`, `publishedPosts`, `<time`, category links under `/categories/`, and `aria-label="文章分页"`. Run `npm test`; expect missing-file failure.

- [ ] **Step 2: Implement `PostList.astro`**

Accept `posts: CollectionEntry<"blog">[]`. Render `<ul class="post-list">`; each item renders a linked title, `<time datetime={post.data.pubDate.toISOString()}>`, linked category badges, and description. Use `post.data.canonicalURL ?? /posts/${post.id}/`; external links get `target="_blank" rel="noreferrer"` and an `External` badge.

- [ ] **Step 3: Implement Home and Blog page one**

Both load `getCollection("blog")` and pass it through `publishedPosts`. Home renders the first ten under `文章`. Blog renders page one under `全部文章`; when more than ten posts exist it links to `/blog/2/` inside `<nav aria-label="文章分页">`.

- [ ] **Step 4: Implement remaining archive pages**

`src/pages/blog/[page].astro` uses `getStaticPaths()` and `paginatePosts(posts,page,10)` to generate pages 2..N, with previous/next links. `src/pages/categories/[category].astro` generates one URI-encoded route per unique category and renders matching published posts through `PostList`.

- [ ] **Step 5: Verify routes and commit**

Run: `npm test && npm run check && npm run build`

Expected: pass; `dist/index.html`, `dist/blog/index.html`, and `dist/categories/云原生/index.html` exist.

```bash
git add src/components/PostList.astro src/pages/index.astro src/pages/blog src/pages/categories tests/source-contract.test.mjs
git commit -m "feat: add blog and category archives"
```

### Task 5: Build article reading and old-URL compatibility

**Files:** Create `src/components/TableOfContents.astro`, `src/layouts/PostLayout.astro`, `src/pages/posts/[...slug].astro`, `src/pages/posts/2025/06/14/kubecon-2025-experience/index.astro`; modify `tests/source-contract.test.mjs`.

- [ ] **Step 1: Add failing reader contracts**

Append assertions that PostLayout contains `<article`, `<time`, `data-pagefind-body`, `aria-label="文章导航"`, and `TableOfContents`; assert the legacy page contains a canonical link and visible fallback to `/posts/kubecon-china-2025/`. Run `npm test`; expect failure.

- [ ] **Step 2: Implement table of contents and post layout**

TableOfContents accepts Astro `headings`, retains depth 2/3, returns nothing for fewer than two headings, and otherwise renders `<nav class="toc" aria-label="本文目录">`. PostLayout accepts post, headings, previous, and next; uses BaseLayout; renders title, dates, categories, TOC, `<article class="prose" data-pagefind-body><slot /></article>`, and labeled adjacent-post navigation.

- [ ] **Step 3: Generate article routes**

`src/pages/posts/[...slug].astro` loads and sorts published posts. `getStaticPaths()` excludes entries with `canonicalURL`, returns each `post.id`, and supplies adjacent posts. Use `const { Content, headings } = await render(post)` and render them through PostLayout.

- [ ] **Step 4: Create the exact compatibility page**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
const destination="/posts/kubecon-china-2025/";
---
<BaseLayout title="文章已迁移" canonical={new URL(destination,Astro.site)}>
  <meta slot="head" http-equiv="refresh" content={`0; url=${destination}`} />
  <div class="content prose"><h1>文章已迁移</h1><p>正在前往新地址。若浏览器没有自动跳转，请<a href={destination}>继续阅读</a>。</p></div>
</BaseLayout>
```

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run check && npm run build`

Expected: both canonical and dated article paths exist.

```bash
git add src/components/TableOfContents.astro src/layouts/PostLayout.astro src/pages/posts tests/source-contract.test.mjs
git commit -m "feat: add article reading experience"
```

### Task 6: Add authentic About, CV, and 404 pages

**Files:** Create `public/images/profile.jpg`, `src/pages/about.astro`, `src/pages/cv.astro`, `src/pages/404.astro`, `tests/profile-content.test.mjs`.

- [ ] **Step 1: Write the failing authenticity test**

```js
// tests/profile-content.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read=(p)=>readFile(new URL(`../${p}`,import.meta.url),"utf8");
test("profile pages contain verified facts and no demo resume",async()=>{const pages=`${await read("src/pages/about.astro")}\n${await read("src/pages/cv.astro")}`;for(const fact of ["江振瑜","Kubernetes","Aibrix","Volcano","ByteDance","googs1025@gmail.com"])assert.match(pages,new RegExp(fact));assert.doesNotMatch(pages,/GitHub University|Version Control Theory|Skill 1|Professor Hub|academicpages/);});
```

Run: `node --test tests/profile-content.test.mjs`; expect `ENOENT`.

- [ ] **Step 2: Copy the owned profile image**

Run: `mkdir -p public/images && cp 'images/两寸.jpg' public/images/profile.jpg`

- [ ] **Step 3: Create About**

Use BaseLayout and factual sections for `江振瑜 / CYJiang / googs1025`, current cloud native infrastructure focus, previous ByteDance cloud platform experience, Kubernetes scheduling, GPU management, LLM inference, Kubernetes Member, Aibrix Maintainer, Volcano Member, scheduler-plugins/descheduler work, GitHub, and email. Render the image with `alt="江振瑜"`.

- [ ] **Step 4: Create CV without unsupported claims**

Use headings Professional Summary, Experience, Open Source, Technical Focus, and Contact. Include the verified current role direction and previous ByteDance experience, but no invented dates, education, job levels, awards, employers, or metrics.

- [ ] **Step 5: Create 404 and commit**

The 404 page says `页面未找到` and links visibly to `/` and `/blog/`. Run `npm test && npm run check && npm run build`; expect pass.

```bash
git add public/images/profile.jpg src/pages/about.astro src/pages/cv.astro src/pages/404.astro tests/profile-content.test.mjs
git commit -m "feat: add authentic profile pages"
```

### Task 7: Add static search and RSS

**Files:** Create `src/components/SearchDialog.astro`, `src/pages/rss.xml.ts`; modify `src/components/Header.astro`, `tests/source-contract.test.mjs`.

- [ ] **Step 1: Add failing search/feed contracts**

Assert SearchDialog contains `<dialog`, `aria-label="全文搜索"`, `/pagefind/pagefind.js`, an `aria-live` region, and `没有找到相关文章`. Assert RSS imports `@astrojs/rss`, `publishedPosts`, and `SITE`. Run `npm test`; expect failure.

- [ ] **Step 2: Implement safe Pagefind search**

Render a native dialog with trigger, labeled input, close button, status region, and results list. The client script dynamically imports `/pagefind/pagefind.js`, initializes it, debounces input by 150ms, calls `search(query)`, awaits `result.data()`, creates result elements with DOM APIs and `textContent` (never interpolated `innerHTML`), reports count through `aria-live="polite"`, renders `没有找到相关文章` when empty, and returns focus to the trigger after close.

- [ ] **Step 3: Install search in Header and generate RSS**

Replace the temporary search link with SearchDialog. Create:

```ts
// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/data/site";
import { publishedPosts } from "@/lib/posts.mjs";
export const GET:APIRoute=async({site})=>{const posts=publishedPosts(await getCollection("blog"));return rss({title:SITE.title,description:SITE.description,site:site!,items:posts.map((post)=>({title:post.data.title,description:post.data.description,pubDate:post.data.pubDate,link:post.data.canonicalURL??`/posts/${post.id}/`}))});};
```

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run check && npm run build`

Expected: `dist/pagefind/pagefind.js` and `dist/rss.xml` exist; Pagefind indexes at least one page.

```bash
git add src/components/SearchDialog.astro src/components/Header.astro src/pages/rss.xml.ts tests/source-contract.test.mjs
git commit -m "feat: add static search and RSS"
```

### Task 8: Verify generated output and deploy to GitHub Pages

**Files:** Create `scripts/verify-build.mjs`, `.github/workflows/deploy.yml`; replace `README.md`; remove `.github/workflows/scrape_talks.yml`.

- [ ] **Step 1: Create the exact generated-output verifier**

```js
// scripts/verify-build.mjs
import assert from "node:assert/strict";
import { access,readFile } from "node:fs/promises";
const required=["dist/index.html","dist/blog/index.html","dist/about/index.html","dist/cv/index.html","dist/404.html","dist/rss.xml","dist/sitemap-index.xml","dist/pagefind/pagefind.js","dist/posts/kubecon-china-2025/index.html","dist/posts/2025/06/14/kubecon-2025-experience/index.html"];
await Promise.all(required.map(access));
const html=await Promise.all(required.filter(x=>x.endsWith(".html")).map(x=>readFile(x,"utf8")));
const output=html.join("\n");
for(const forbidden of ["GitHub University","Version Control Theory","academicpages","Teaching experience 1","Portfolio item number 1","你可以在此处添加","请填写"])assert.doesNotMatch(output,new RegExp(forbidden));
assert.match(html[0],/lang="zh-Hans"/);assert.match(html[0],/href="\/rss.xml"/);assert.match(html[0],/data-theme-toggle/);
assert.match(output,/data-pagefind-body/);assert.match(output,/\/images\/kubecon2025\//);
console.log(`Verified ${required.length} production artifacts.`);
```

- [ ] **Step 2: Run `npm run verify`**

Expected: tests, Astro checks, build, Pagefind, and artifact assertions pass.

- [ ] **Step 3: Replace obsolete automation**

Delete `.github/workflows/scrape_talks.yml`. Create:

```yaml
# .github/workflows/deploy.yml
name: Deploy Astro site to Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run verify
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 4: Replace template README**

Document the site purpose, Node 24 prerequisite, `npm install`, `npm run dev`, `npm run verify`, `src/content/blog/`, and the Pages workflow. Remove Academic Pages instructions.

- [ ] **Step 5: Verify and commit**

Run: `npm run verify && git diff --check`

```bash
git add .github/workflows/deploy.yml .github/workflows/scrape_talks.yml scripts/verify-build.mjs README.md
git commit -m "ci: deploy verified Astro site to Pages"
```

### Task 9: Remove Jekyll only after successful migration

**Files:** Remove only listed Jekyll/template files; preserve `docs/`, Astro sources, migrated assets, license, and unrelated user files.

- [ ] **Step 1: Gate destructive cleanup on a green build**

Run: `npm run verify`

Expected: PASS. Stop if it fails.

- [ ] **Step 2: Prove user content is migrated**

Run:

```bash
test -f src/content/blog/kubecon-china-2025.md
test "$(find public/images/kubecon2025 -type f | wc -l | tr -d ' ')" = "16"
rg -n 'KubeCon|开源社区|技术大会' src/content/blog/kubecon-china-2025.md
```

Expected: article exists, all 16 images exist, and authentic subject matter is present.

- [ ] **Step 3: Remove tracked Jekyll/template paths with recoverable Git deletion**

Use `git rm -r` only for paths that exist in this explicit list:

```text
_data _drafts _includes _layouts _pages _portfolio _posts _publications _sass
_talks _teaching assets files markdown_generator talkmap
Gemfile Dockerfile docker-compose.yaml _config.yml _config_docker.yml
talkmap.py talkmap.ipynb talkmap_out.ipynb scripts/cv_markdown_to_json.py
scripts/update_cv_json.sh scripts/verify_homepage_refresh.sh
```

Remove obsolete root demo images only after checking `public/images/profile.jpg`, `public/favicon.svg`, and migrated KubeCon assets. Do not delete `docs/`, `.git`, `.github/workflows/deploy.yml`, `src/`, `public/`, or files outside the explicit legacy set.

- [ ] **Step 4: Check for leaked template references**

Run: `rg -n 'academicpages|GitHub University|site\.data|site\.posts|layout:' --glob '!docs/**' --glob '!package-lock.json' .`

Expected: no production-source matches.

- [ ] **Step 5: Re-run everything and commit**

Run: `npm run verify && git diff --check`

```bash
git add -A
git commit -m "refactor: remove legacy Jekyll template"
```

### Task 10: Final browser and repository verification

**Files:** Modify only exact files implicated by a verified defect.

- [ ] **Step 1: Start the production preview**

Run: `npm run build && npm run preview -- --host 127.0.0.1`

Expected: a local URL serving `dist/`.

- [ ] **Step 2: Check primary routes at desktop width**

Inspect `/`, `/blog/`, `/about/`, `/cv/`, `/posts/kubecon-china-2025/`, the dated legacy URL, and a missing URL. Verify hierarchy, images, links, canonical redirect, TOC, and 404 recovery.

- [ ] **Step 3: Check mobile and interactions**

At about 390px width verify mobile navigation, matching/empty search, dialog close and focus return, theme persistence, keyboard navigation, visible focus, code/table/image containment, and no horizontal overflow.

- [ ] **Step 4: Check theme and motion variants**

Inspect every primary template in light/dark mode. Emulate `prefers-reduced-motion: reduce` and verify nonessential transitions are disabled.

- [ ] **Step 5: Run final automated evidence**

```bash
npm run verify
git diff --check
git status --short
```

Expected: verification and diff checks pass. Status includes only intentional rebuild changes plus any explicitly preserved unrelated user files.

- [ ] **Step 6: Commit only if verification required fixes**

Stage exact fixed files and run `git commit -m "fix: polish responsive blog experience"`. If no file changed, do not create an empty commit.

## Completion criteria

- `npm run verify` passes on the Astro-only site.
- Home is the approved Calm Teal article list.
- Blog, category, post, About, CV, 404, dark mode, search, RSS, sitemap, and legacy URL work.
- The current KubeCon article and all 16 images survive migration without authoring prompts.
- No Academic Pages demo content appears in production output.
- GitHub Pages deployment is defined and uses the verified `dist/` artifact.
- No unrelated user work is discarded.
