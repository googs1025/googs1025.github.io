import assert from "node:assert/strict";
import test from "node:test";

import {
  isCategoryLabel,
  isHttpUrl,
  isLegacyPath,
  isUpdatedDateOnOrAfterPubDate,
} from "../src/lib/content-validation.mjs";

test("category labels are non-empty safe path segments", () => {
  for (const value of ["云原生", "Open Source", "C++"]) {
    assert.equal(isCategoryLabel(value), true, value);
  }

  for (const value of [
    "",
    " 云原生",
    "云原生 ",
    ".",
    "..",
    "Kubernetes/调度",
    String.raw`Kubernetes\调度`,
    "topic?draft",
    "topic#section",
    "100% Kubernetes",
  ]) {
    assert.equal(isCategoryLabel(value), false, JSON.stringify(value));
  }
});

test("isHttpUrl accepts absolute HTTP and HTTPS URLs", () => {
  for (const value of [
    "https://example.com/posts/sample-entry",
    "http://localhost:4321/archive?page=2#posts",
  ]) {
    assert.equal(isHttpUrl(value), true, value);
  }
});

test("isHttpUrl rejects non-HTTP and non-absolute URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/plain,hello",
    "mailto:hello@example.com",
    "//example.com/posts",
    "/posts/sample-entry",
  ]) {
    assert.equal(isHttpUrl(value), false, value);
  }
});

test("isLegacyPath accepts same-origin pathnames including Chinese paths", () => {
  for (const value of [
    "/",
    "/posts/2025/01/02/sample-entry/",
    "/文章/云原生/",
    "/%E4%BA%91%E5%8E%9F%E7%94%9F/",
  ]) {
    assert.equal(isLegacyPath(value), true, value);
  }
});

test("isLegacyPath rejects external, malformed, and traversal paths", () => {
  for (const value of [
    "posts/sample-entry",
    "//example.com/posts",
    "/posts/../admin",
    "/posts/./draft",
    "/posts/%2e%2e/admin",
    "/posts/%252e%252e/admin",
    "/posts/%252e%252e%252fadmin",
    "/posts/%25252e%25252e/admin",
    "/%252f%252fevil.example/posts",
    "/posts?draft=1",
    "/posts#draft",
    String.raw`/posts\draft`,
    "/posts/%255cdraft",
    "/posts/\u0000draft",
    "/posts/\ndraft",
    "/posts/%2525252541",
  ]) {
    assert.equal(isLegacyPath(value), false, JSON.stringify(value));
  }
});

test("post dates accept an absent, equal, or later update", () => {
  const pubDate = new Date("2025-06-14T12:00:00.000Z");

  assert.equal(isUpdatedDateOnOrAfterPubDate(pubDate, undefined), true);
  assert.equal(
    isUpdatedDateOnOrAfterPubDate(
      pubDate,
      new Date("2025-06-14T12:00:00.000Z"),
    ),
    true,
  );
  assert.equal(
    isUpdatedDateOnOrAfterPubDate(
      pubDate,
      new Date("2025-06-15T00:00:00.000Z"),
    ),
    true,
  );
});

test("post dates reject an update before publication", () => {
  assert.equal(
    isUpdatedDateOnOrAfterPubDate(
      new Date("2025-06-14T12:00:00.000Z"),
      new Date("2025-06-14T11:59:59.999Z"),
    ),
    false,
  );
});
