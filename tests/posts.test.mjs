import assert from "node:assert/strict";
import test from "node:test";

import * as postsModule from "../src/lib/posts.mjs";

const {
  adjacentPosts,
  categoryPath,
  hasMeaningfulUpdate,
  legacyRedirectPaths,
  paginatePosts,
  postPath,
  postRouteId,
  publishedPosts,
} = postsModule;

test("post route helpers NFC-normalize Astro entry IDs", () => {
  assert.equal(postRouteId("archive/e\u0301"), "archive/é");
  assert.equal(postPath("archive/e\u0301"), "/posts/archive/é/");
});

test("legacy redirects are generated only for published local posts", () => {
  const posts = [
    {
      id: "local",
      data: {
        title: "Local post",
        draft: false,
        pubDate: new Date("2025-01-03"),
        legacyURLs: [
          "/old/local/",
          "/%E6%97%A7%E6%96%87/",
          "/archive/e\u0301/",
        ],
      },
    },
    {
      id: "external",
      data: {
        title: "External post",
        draft: false,
        pubDate: new Date("2025-01-02"),
        canonicalURL: "https://example.com/external",
        legacyURLs: ["/old/external/"],
      },
    },
    {
      id: "draft",
      data: {
        title: "Draft post",
        draft: true,
        pubDate: new Date("2025-01-01"),
        legacyURLs: ["/old/draft/"],
      },
    },
  ];

  assert.deepEqual(legacyRedirectPaths(posts), [
    {
      params: { legacy: "old/local" },
      props: {
        title: "Local post",
        target: "/posts/local/",
      },
    },
    {
      params: { legacy: "旧文" },
      props: {
        title: "Local post",
        target: "/posts/local/",
      },
    },
    {
      params: { legacy: "archive/é" },
      props: {
        title: "Local post",
        target: "/posts/local/",
      },
    },
  ]);
});

test("legacy route checks preserve percent characters in raw post IDs and public files", () => {
  const posts = [
    {
      id: "100%-post",
      data: {
        title: "Percent post",
        draft: false,
        pubDate: new Date("2025-01-01"),
        legacyURLs: ["/old/percent-post/"],
      },
    },
  ];

  assert.deepEqual(
    legacyRedirectPaths(posts, { publicFiles: ["images/100%.svg"] }),
    [
      {
        params: { legacy: "old/percent-post" },
        props: {
          title: "Percent post",
          target: "/posts/100%-post/",
        },
      },
    ],
  );
});

test("legacy redirect targets and collisions use NFC post IDs", () => {
  const post = {
    id: "e\u0301",
    data: {
      title: "Unicode post",
      draft: false,
      pubDate: new Date("2025-01-01"),
      legacyURLs: ["/old/unicode/"],
    },
  };

  assert.equal(legacyRedirectPaths([post])[0].props.target, "/posts/é/");
  assert.throws(
    () => legacyRedirectPaths([{ ...post, data: { ...post.data, legacyURLs: ["/posts/é/"] } }]),
    { message: 'Legacy URL collision: "/posts/é/"' },
  );
});

test("legacy redirects reject duplicate, generated, and public path collisions", () => {
  const post = (id, legacyURLs) => ({
    id,
    data: {
      title: id,
      draft: false,
      pubDate: new Date("2025-01-01"),
      legacyURLs,
    },
  });

  assert.throws(
    () => legacyRedirectPaths([post("one", ["/old/path", "/old/path/"])]),
    { message: 'Legacy URL collision: "/old/path/"' },
  );
  assert.throws(
    () =>
      legacyRedirectPaths([
        post("one", ["/archive/é/", "/archive/e\u0301/"]),
      ]),
    { message: 'Legacy URL collision: "/archive/é/"' },
  );
  assert.throws(
    () =>
      legacyRedirectPaths([
        post("one", ["/posts/two/"]),
        post("two", []),
      ]),
    { message: 'Legacy URL collision: "/posts/two/"' },
  );
  for (const path of [
    "/",
    "/about/",
    "/blog/",
    "/cv/",
    "/404.html",
    "/rss.xml",
    "/sitemap-index.xml",
    "/sitemap-0.xml",
    "/pagefind/pagefind.js",
    "/_astro/app.js",
  ]) {
    assert.throws(() => legacyRedirectPaths([post("one", [path])]), {
      message: `Legacy URL collision: "${path}"`,
    });
  }

  for (const path of ["/favicon.svg", "/images/profile.jpg"]) {
    assert.throws(
      () =>
        legacyRedirectPaths([post("one", [path])], {
          publicFiles: ["favicon.svg", "images/profile.jpg"],
        }),
      { message: `Legacy URL collision: "${path}"` },
    );
  }
});

test("categoryPath encodes a validated category into one route segment", () => {
  assert.equal(categoryPath("云原生"), "/categories/%E4%BA%91%E5%8E%9F%E7%94%9F/");
  assert.throws(() => categoryPath("Kubernetes/调度"), {
    name: "TypeError",
    message: "category must be a safe path segment",
  });
  assert.throws(() => categoryPath("100% Kubernetes"), {
    name: "TypeError",
    message: "category must be a safe path segment",
  });
  assert.throws(() => categoryPath("e\u0301"), {
    name: "TypeError",
    message: "category must be a safe path segment",
  });
});

const syntheticPosts = (count) =>
  Array.from({ length: count }, (_, index) => ({
    id: `post-${index + 1}`,
    data: {
      draft: false,
      pubDate: new Date("2025-01-01"),
    },
  }));

const postIds = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, index) => `post-${start + index}`);

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

test("publishedPosts breaks equal publication dates by id regardless of input order", () => {
  const pubDate = new Date("2025-01-01");
  const ascending = [
    { id: "alpha", data: { draft: false, pubDate } },
    { id: "beta", data: { draft: false, pubDate } },
  ];
  const reversed = [...ascending].reverse();

  assert.deepEqual(
    publishedPosts(ascending).map(({ id }) => id),
    ["alpha", "beta"],
  );
  assert.deepEqual(
    publishedPosts(reversed).map(({ id }) => id),
    ["alpha", "beta"],
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

test("archive page policy uses ten items and hides pagination through ten posts", () => {
  assert.equal(postsModule.PAGE_SIZE, 10);

  const summaries = [0, 1, 10, 11, 21].map((count) => {
    const page = postsModule.archivePage?.(syntheticPosts(count), 1);

    return {
      count,
      itemIds: page?.items.map(({ id }) => id),
      totalPages: page?.totalPages,
      showPagination: page?.showPagination,
    };
  });

  assert.deepEqual(summaries, [
    { count: 0, itemIds: [], totalPages: 1, showPagination: false },
    { count: 1, itemIds: ["post-1"], totalPages: 1, showPagination: false },
    { count: 10, itemIds: postIds(1, 10), totalPages: 1, showPagination: false },
    { count: 11, itemIds: postIds(1, 10), totalPages: 2, showPagination: true },
    { count: 21, itemIds: postIds(1, 10), totalPages: 3, showPagination: true },
  ]);
});

test("archive dynamic pages omit page one and preserve every remaining item", () => {
  const pageSets = [0, 1, 10, 11, 21].map((count) => ({
    count,
    pages:
      postsModule.archiveDynamicPages?.(syntheticPosts(count)).map((page) => ({
        currentPage: page.currentPage,
        itemIds: page.items.map(({ id }) => id),
      })) ?? null,
  }));

  assert.deepEqual(pageSets, [
    { count: 0, pages: [] },
    { count: 1, pages: [] },
    { count: 10, pages: [] },
    { count: 11, pages: [{ currentPage: 2, itemIds: ["post-11"] }] },
    {
      count: 21,
      pages: [
        { currentPage: 2, itemIds: postIds(11, 20) },
        { currentPage: 3, itemIds: ["post-21"] },
      ],
    },
  ]);
});

test("archive navigation points page two homeward and later pages numerically", () => {
  const posts = syntheticPosts(21);
  const pages = [1, 2, 3].map((currentPage) => {
    const page = postsModule.archivePage?.(posts, currentPage);

    return {
      currentPage,
      previousHref: page?.previousHref,
      nextHref: page?.nextHref,
    };
  });

  assert.deepEqual(pages, [
    { currentPage: 1, previousHref: undefined, nextHref: "/blog/2/" },
    { currentPage: 2, previousHref: "/blog/", nextHref: "/blog/3/" },
    { currentPage: 3, previousHref: "/blog/2/", nextHref: undefined },
  ]);
});

test("adjacentPosts maps previous to older and next to newer in newest-first order", () => {
  const posts = syntheticPosts(3);

  assert.deepEqual(adjacentPosts(posts, 0), {
    previous: posts[1],
    next: undefined,
  });
  assert.deepEqual(adjacentPosts(posts, 1), {
    previous: posts[2],
    next: posts[0],
  });
  assert.deepEqual(adjacentPosts(posts, 2), {
    previous: undefined,
    next: posts[1],
  });
});

test("adjacentPosts leaves a single post without navigation targets", () => {
  const posts = syntheticPosts(1);

  assert.deepEqual(adjacentPosts(posts, 0), {
    previous: undefined,
    next: undefined,
  });
});

test("adjacentPosts rejects an index outside the collection", () => {
  assert.throws(() => adjacentPosts(syntheticPosts(1), 1), {
    name: "RangeError",
    message: "currentIndex must identify a post",
  });
});

test("hasMeaningfulUpdate suppresses times on the same UTC calendar day", () => {
  assert.equal(
    hasMeaningfulUpdate(
      new Date("2025-06-14T01:00:00.000Z"),
      new Date("2025-06-14T23:00:00.000Z"),
    ),
    false,
  );
});

test("hasMeaningfulUpdate detects the next UTC calendar day", () => {
  assert.equal(
    hasMeaningfulUpdate(
      new Date("2025-06-14T23:00:00.000Z"),
      new Date("2025-06-15T00:00:00.000Z"),
    ),
    true,
  );
});

test("hasMeaningfulUpdate suppresses an update before the publication UTC day", () => {
  assert.equal(
    hasMeaningfulUpdate(
      new Date("2025-06-14T01:00:00.000Z"),
      new Date("2025-06-13T23:00:00.000Z"),
    ),
    false,
  );
});
