import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);
const blogRoot = new URL("src/content/blog/", repositoryRoot);

// Publication denylist: these markers must never appear in production sources,
// public assets, route sources, or generated output.
const forbiddenPublicationMarkers = [
  "我的 KubeCon China 2025 参与之旅",
  "kubecon-china-2025",
  "posts/2025/06/14/kubecon-2025-experience",
  "/images/kubecon2025",
];

const productionRoots = ["src/content/blog", "public", "src/pages"];

test("the current repository publishes zero blog entries", async () => {
  const entries = (await readdir(blogRoot, { recursive: true })).filter((path) =>
    /\.(?:md|mdx)$/.test(path),
  );

  assert.deepEqual(entries, []);
});

test("production sources contain no excluded article, route, or asset markers", async () => {
  for (const root of productionRoots) {
    const rootUrl = new URL(`${root}/`, repositoryRoot);
    const files = await readdir(rootUrl, { recursive: true });

    for (const relativePath of files) {
      const repositoryPath = `${root}/${relativePath}`;
      const normalizedPath = repositoryPath.toLowerCase();

      for (const marker of forbiddenPublicationMarkers) {
        const normalizedMarker = marker.toLowerCase();
        assert.equal(
          normalizedPath.includes(normalizedMarker),
          false,
          `forbidden publication marker found in path: ${repositoryPath}`,
        );
      }

      const pathUrl = new URL(relativePath, rootUrl);
      if (!(await stat(pathUrl)).isFile()) {
        continue;
      }

      const normalizedContents = (await readFile(pathUrl))
        .toString("utf8")
        .toLowerCase();
      for (const marker of forbiddenPublicationMarkers) {
        const normalizedMarker = marker.toLowerCase();
        assert.equal(
          normalizedContents.includes(normalizedMarker),
          false,
          `forbidden publication marker found in file: ${repositoryPath}`,
        );
      }
    }
  }
});

test("article-specific checksum fixture is not part of the repository", async () => {
  await assert.rejects(
    access(new URL("tests/fixtures/kubecon2025-sha256.json", repositoryRoot)),
    { code: "ENOENT" },
  );
});
