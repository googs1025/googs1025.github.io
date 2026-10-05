import assert from "node:assert/strict";
import test from "node:test";

import {
  assertExactPathSet,
  assertHtmlFilesOmitTerms,
  assertLegacyRedirectHtml,
  findLegacyRedirectPages,
  routePathToHtmlFile,
} from "../scripts/verify-build-lib.mjs";

test("legacy page discovery exposes unexpected redirect-shaped output", async () => {
  const htmlByPath = new Map([
    ["index.html", '<link rel="canonical" href="https://googs1025.github.io/">'],
    [
      "old/expected/index.html",
      '<meta http-equiv="refresh" content="0;url=/posts/current/">',
    ],
    [
      "old/unexpected/index.html",
      '<meta http-equiv="refresh" content="0;url=/posts/other/">',
    ],
  ]);
  const actual = await findLegacyRedirectPages(
    [...htmlByPath.keys()],
    async (path) => htmlByPath.get(path),
  );

  assert.deepEqual(actual, [
    "old/expected/index.html",
    "old/unexpected/index.html",
  ]);
  assert.throws(
    () =>
      assertExactPathSet(
        actual,
        ["old/expected/index.html"],
        "legacy redirect pages",
      ),
    {
      message:
        "legacy redirect pages mismatch; missing: none; unexpected: old/unexpected/index.html",
    },
  );
});

test("path set verification rejects missing and unexpected generated pages", () => {
  assert.doesNotThrow(() =>
    assertExactPathSet(
      ["posts/one/index.html", "posts/two/index.html"],
      ["posts/two/index.html", "posts/one/index.html"],
      "canonical post pages",
    ),
  );
  assert.throws(
    () =>
      assertExactPathSet(
        ["posts/one/index.html", "posts/extra/index.html"],
        ["posts/one/index.html", "posts/missing/index.html"],
        "canonical post pages",
      ),
    {
      message:
        "canonical post pages mismatch; missing: posts/missing/index.html; unexpected: posts/extra/index.html",
    },
  );
});

test("legacy route paths map to static HTML files", () => {
  assert.equal(routePathToHtmlFile("/old/post/"), "old/post/index.html");
  assert.equal(
    routePathToHtmlFile("/%E6%97%A7%E6%96%87/"),
    "旧文/index.html",
  );
});

test("legacy redirect HTML requires canonical, immediate refresh, and fallback link", () => {
  const target = "/posts/current/";
  const html = `
    <link rel="canonical" href="https://googs1025.github.io/posts/current/">
    <meta http-equiv="refresh" content="0;url=/posts/current/">
    <p><a href="/posts/current/">前往文章的新地址</a></p>
  `;

  assert.doesNotThrow(() =>
    assertLegacyRedirectHtml(html, target, "old/post/index.html"),
  );
  assert.throws(
    () =>
      assertLegacyRedirectHtml(
        html.replace('content="0;url=/posts/current/"', 'content="5;url=/posts/current/"'),
        target,
        "old/post/index.html",
      ),
    { message: "legacy redirect old/post/index.html must refresh immediately to /posts/current/" },
  );
});

test("generated HTML diagnostics name the exact file and forbidden term", async () => {
  const reads = [];
  const htmlByPath = new Map([
    ["index.html", "<main>真实内容</main>"],
    ["posts/example/index.html", "<main>请填写正文</main>"],
    ["unread.html", "<main>unused</main>"],
  ]);

  await assert.rejects(
    assertHtmlFilesOmitTerms(
      [...htmlByPath.keys()],
      ["TODO", "请填写"],
      async (path) => {
        reads.push(path);
        return htmlByPath.get(path);
      },
    ),
    {
      message: 'Forbidden term "请填写" found in posts/example/index.html',
    },
  );
  assert.deepEqual(reads, ["index.html", "posts/example/index.html"]);
});

test("generated HTML scan accepts clean files sequentially", async () => {
  const reads = [];

  await assert.doesNotReject(
    assertHtmlFilesOmitTerms(
      ["index.html", "about/index.html"],
      ["academicpages"],
      async (path) => {
        reads.push(path);
        return `<main>${path}</main>`;
      },
    ),
  );
  assert.deepEqual(reads, ["index.html", "about/index.html"]);
});
