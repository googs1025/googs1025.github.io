import assert from "node:assert/strict";
import test from "node:test";

import { paginatePosts, publishedPosts } from "../src/lib/posts.mjs";

test("publishedPosts filters drafts and sorts newest posts first without mutating input", () => {
  const posts = [
    { id: "older", data: { draft: false, pubDate: new Date("2024-01-01") } },
    { id: "draft", data: { draft: true, pubDate: new Date("2026-01-01") } },
    { id: "newer", data: { draft: false, pubDate: new Date("2025-01-01") } },
  ];
  const originalOrder = posts.map(({ id }) => id);

  assert.deepEqual(
    publishedPosts(posts).map(({ id }) => id),
    ["newer", "older"],
  );
  assert.deepEqual(
    posts.map(({ id }) => id),
    originalOrder,
  );
});

test("paginatePosts returns the second page and pagination metadata", () => {
  const posts = Array.from({ length: 11 }, (_, index) => index + 1);

  assert.deepEqual(paginatePosts(posts, 2, 10), {
    items: [11],
    currentPage: 2,
    totalPages: 2,
  });
});

test("paginatePosts keeps an empty collection on page one", () => {
  assert.deepEqual(paginatePosts([], 1, 10), {
    items: [],
    currentPage: 1,
    totalPages: 1,
  });
});

test("paginatePosts requires currentPage to be a positive integer", () => {
  for (const currentPage of [0, -1, 1.5, Number.NaN]) {
    assert.throws(() => paginatePosts([1], currentPage, 10), {
      name: "RangeError",
      message: "currentPage must be a positive integer",
    });
  }
});

test("paginatePosts requires pageSize to be a positive integer", () => {
  for (const pageSize of [0, -1, 1.5, Number.NaN]) {
    assert.throws(() => paginatePosts([1], 1, pageSize), {
      name: "RangeError",
      message: "pageSize must be a positive integer",
    });
  }
});

test("paginatePosts rejects pages beyond the available range", () => {
  for (const posts of [[], [1]]) {
    assert.throws(() => paginatePosts(posts, 2, 10), {
      name: "RangeError",
      message: "currentPage must not exceed totalPages",
    });
  }
});
