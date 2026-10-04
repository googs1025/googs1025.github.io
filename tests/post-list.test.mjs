import assert from "node:assert/strict";
import test from "node:test";

import * as postsModule from "../src/lib/posts.mjs";

const post = (overrides = {}) => ({
  id: "internal-post",
  data: {
    title: "内部文章",
    description: "文章简介",
    pubDate: new Date("2025-06-14T00:00:00.000Z"),
    categories: ["云原生"],
    draft: false,
    ...overrides,
  },
});

test("post list view model describes internal links, dates, and encoded categories", () => {
  const item = postsModule.postListItem?.(post());

  assert.deepEqual(item, {
    title: "内部文章",
    description: "文章简介",
    url: "/posts/internal-post/",
    isExternal: false,
    target: undefined,
    rel: undefined,
    linkAriaLabel: undefined,
    externalText: undefined,
    machineDate: "2025-06-14T00:00:00.000Z",
    humanDate: "2025年6月14日",
    hasCategories: true,
    categories: [
      {
        name: "云原生",
        url: "/categories/%E4%BA%91%E5%8E%9F%E7%94%9F/",
      },
    ],
  });
});

test("post list view model secures and announces HTTP external links", () => {
  const item = postsModule.postListItem?.(
    post({
      title: "外部文章",
      canonicalURL: "http://example.com/article",
    }),
  );

  assert.equal(item?.url, "http://example.com/article");
  assert.equal(item?.isExternal, true);
  assert.equal(item?.target, "_blank");
  assert.equal(item?.rel, "noreferrer");
  assert.equal(item?.externalText, "External");
  assert.match(item?.linkAriaLabel ?? "", /外部文章.*外部链接.*新标签页/);
});

test("post list view model suppresses the category container when categories are empty", () => {
  const item = postsModule.postListItem?.(post({ categories: [] }));

  assert.equal(item?.hasCategories, false);
  assert.deepEqual(item?.categories, []);
});
