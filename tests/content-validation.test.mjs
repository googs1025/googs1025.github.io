import assert from "node:assert/strict";
import test from "node:test";

import {
  isHttpUrl,
  isLegacyPath,
} from "../src/lib/content-validation.mjs";

test("isHttpUrl accepts absolute HTTP and HTTPS URLs", () => {
  for (const value of [
    "https://example.com/posts/kubecon",
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
    "/posts/kubecon",
  ]) {
    assert.equal(isHttpUrl(value), false, value);
  }
});

test("isLegacyPath accepts same-origin pathnames including Chinese paths", () => {
  for (const value of [
    "/",
    "/posts/2025/06/14/kubecon-2025-experience/",
    "/文章/云原生/",
  ]) {
    assert.equal(isLegacyPath(value), true, value);
  }
});

test("isLegacyPath rejects external, malformed, and traversal paths", () => {
  for (const value of [
    "posts/kubecon",
    "//example.com/posts",
    "/posts/../admin",
    "/posts/./draft",
    "/posts/%2e%2e/admin",
    "/posts?draft=1",
    "/posts#draft",
    String.raw`/posts\draft`,
    "/posts/\u0000draft",
    "/posts/\ndraft",
  ]) {
    assert.equal(isLegacyPath(value), false, JSON.stringify(value));
  }
});
