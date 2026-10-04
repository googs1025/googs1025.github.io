import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const postPath = new URL(
  "../src/content/blog/kubecon-china-2025.md",
  import.meta.url,
);

test("the migrated KubeCon post has normalized metadata and no authoring prompts", async () => {
  const post = await readFile(postPath, "utf8");

  assert.match(post, /^pubDate: 2025-06-14$/m);
  assert.match(
    post,
    /^\s*- \/posts\/2025\/06\/14\/kubecon-2025-experience\/$/m,
  );

  for (const marker of ["你可以在此处添加", "请填写", "TODO", "TBD"]) {
    assert.doesNotMatch(post, new RegExp(marker));
  }
});

test("every KubeCon image referenced by the migrated post exists in public", async () => {
  const post = await readFile(postPath, "utf8");
  const imagePaths = [
    ...post.matchAll(/!\[[^\]]*\]\((\/images\/kubecon2025\/[^)\s]+)\)/g),
  ].map((match) => match[1]);

  assert.ok(imagePaths.length > 0, "expected at least one KubeCon image reference");

  await Promise.all(
    imagePaths.map((imagePath) =>
      access(new URL(`../public${imagePath}`, import.meta.url)),
    ),
  );
});
