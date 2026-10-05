import assert from "node:assert/strict";
import test from "node:test";

import {
  createLatestRequest,
  safeSearchHref,
  searchResultView,
} from "../src/lib/search.mjs";

test("safeSearchHref keeps rooted local Pagefind URLs", () => {
  assert.equal(safeSearchHref("/posts/hello/?source=search#intro"), "/posts/hello/?source=search#intro");
  assert.equal(safeSearchHref("/categories/%E4%BA%91%E5%8E%9F%E7%94%9F/"), "/categories/%E4%BA%91%E5%8E%9F%E7%94%9F/");
});

test("safeSearchHref rejects external and executable Pagefind URLs", () => {
  for (const unsafe of [
    "https://evil.example/phishing",
    "//evil.example/phishing",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "posts/missing-leading-slash/",
  ]) {
    assert.equal(safeSearchHref(unsafe), "/blog/");
  }
});

test("searchResultView supplies safe content fallbacks", () => {
  assert.deepEqual(searchResultView({ url: "javascript:alert(1)", meta: {} }), {
    href: "/blog/",
    title: "未命名文章",
    description: "暂无摘要",
  });

  assert.deepEqual(
    searchResultView({
      url: "/posts/example/",
      meta: { title: "Example", description: "Summary" },
      excerpt: "ignored excerpt",
    }),
    {
      href: "/posts/example/",
      title: "Example",
      description: "Summary",
    },
  );
});

test("searchResultView uses excerpt text when metadata has no description", () => {
  assert.equal(
    searchResultView({ meta: { title: "Result" }, excerpt: "Matched text" })
      .description,
    "Matched text",
  );
});

test("searchResultView prefers Pagefind plain excerpt text", () => {
  assert.equal(
    searchResultView({
      meta: { title: "Result" },
      excerpt: "Matched <mark>unsafe-looking</mark> text",
      plain_excerpt: "Matched unsafe-looking text",
    }).description,
    "Matched unsafe-looking text",
  );
});

test("latest request gate rejects responses from superseded queries", () => {
  const requests = createLatestRequest();
  const first = requests.next();
  const second = requests.next();

  assert.equal(requests.isCurrent(first), false);
  assert.equal(requests.isCurrent(second), true);
  requests.invalidate();
  assert.equal(requests.isCurrent(second), false);
});
