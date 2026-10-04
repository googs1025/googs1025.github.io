import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("About and CV contain only verified profile facts", async () => {
  const [about, cv] = await Promise.all([
    readSource("src/pages/about.astro"),
    readSource("src/pages/cv.astro"),
  ]);

  for (const page of [about, cv]) {
    for (const fact of [
      "江振瑜",
      "Kubernetes",
      "Aibrix",
      "Volcano",
      "ByteDance",
      "googs1025@gmail.com",
      "马上消费金融",
    ]) {
      assert.match(page, new RegExp(fact), `expected ${fact} in profile page`);
    }
  }

  const forbiddenDemoText = [
    "GitHub University",
    "Version Control Theory",
    "Skill 1",
    "Professor Hub",
    "academicpages",
    "Second University",
    "First University",
  ];

  for (const page of [about, cv]) {
    for (const forbidden of forbiddenDemoText) {
      assert.doesNotMatch(page, new RegExp(forbidden, "i"));
    }
  }
});

test("the public profile image is the owned source portrait", async () => {
  const profile = await readFile(
    new URL("../public/images/profile.jpg", import.meta.url),
  );
  const checksum = createHash("sha256").update(profile).digest("hex");

  assert.equal(
    checksum,
    "70c7b3b310549fc36a199159e754fe2985d659eb611dacbff51265f914fa6427",
  );
});
