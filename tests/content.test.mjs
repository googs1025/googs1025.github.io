import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
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
  const imageReferences = [
    ...post.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g),
  ].map((match) => ({ alt: match[1], path: match[2] }));

  assert.ok(
    imageReferences.length > 0,
    "expected at least one KubeCon image reference",
  );

  for (const image of imageReferences) {
    assert.ok(image.alt.trim(), `expected nonempty alt text for ${image.path}`);
    assert.match(image.path, /^\/images\/kubecon2025\//);
  }

  await Promise.all(
    imageReferences.map(({ path }) =>
      access(new URL(`../public${path}`, import.meta.url)),
    ),
  );
});

test("all 16 public KubeCon PNGs match tracked checksums", async () => {
  const manifestPath = new URL(
    "./fixtures/kubecon2025-sha256.json",
    import.meta.url,
  );
  const publicDirectory = new URL(
    "../public/images/kubecon2025/",
    import.meta.url,
  );
  const expectedChecksums = JSON.parse(await readFile(manifestPath, "utf8"));
  const expectedNames = Object.keys(expectedChecksums).sort();
  const publicNames = (await readdir(publicDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => entry.name)
    .sort();

  assert.equal(expectedNames.length, 16);
  assert.equal(publicNames.length, 16);
  assert.deepEqual(publicNames, expectedNames);

  await Promise.all(
    publicNames.map(async (name) => {
      const publicImage = await readFile(new URL(name, publicDirectory));
      const checksum = createHash("sha256").update(publicImage).digest("hex");

      assert.equal(checksum, expectedChecksums[name], `${name} checksum differs`);
    }),
  );
});
