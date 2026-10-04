import assert from "node:assert/strict";
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

test("all 16 public KubeCon PNGs are byte-identical source copies", async () => {
  const sourceDirectory = new URL("../images/kubecon2025/", import.meta.url);
  const publicDirectory = new URL(
    "../public/images/kubecon2025/",
    import.meta.url,
  );
  const pngNames = async (directory) =>
    (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
      .map((entry) => entry.name)
      .sort();

  const sourceNames = await pngNames(sourceDirectory);
  const publicNames = await pngNames(publicDirectory);

  assert.equal(publicNames.length, 16);
  assert.deepEqual(publicNames, sourceNames);

  await Promise.all(
    publicNames.map(async (name) => {
      const [sourceImage, publicImage] = await Promise.all([
        readFile(new URL(name, sourceDirectory)),
        readFile(new URL(name, publicDirectory)),
      ]);

      assert.deepEqual(publicImage, sourceImage, `${name} differs from source`);
    }),
  );
});
