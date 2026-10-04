import assert from "node:assert/strict";
import test from "node:test";

import { assertHtmlFilesOmitTerms } from "../scripts/verify-build-lib.mjs";

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
