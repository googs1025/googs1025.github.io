import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PROFILE } from "../src/data/profile.mjs";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("About and CV render repeated profile facts from shared data", async () => {
  const [about, cv] = await Promise.all([
    readSource("src/pages/about.astro"),
    readSource("src/pages/cv.astro"),
  ]);

  for (const page of [about, cv]) {
    assert.match(page, /import \{ PROFILE \} from ["']@\/data\/profile\.mjs["']/);
    assert.match(page, /import \{ SITE \} from ["']@\/data\/site["']/);
    assert.match(page, /PROFILE\.identity/);

    for (const collection of [
      "experience",
      "technicalFocus",
      "openSourceRoles",
      "collaborations",
    ]) {
      assert.match(page, new RegExp(`PROFILE\\.${collection}\\.map\\(`));
    }

    assert.match(page, /SITE\.github/);
    assert.match(page, /SITE\.email/);
    assert.doesNotMatch(
      page,
      /马上消费金融|ByteDance|Kubernetes 调度|GPU 资源管理|LLM 推理基础设施|github\.com\/kubernetes|github\.com\/vllm-project|github\.com\/volcano-sh|googs1025@gmail\.com/,
    );
  }
});

test("profile sources and data omit unsupported claims", async () => {
  const [about, cv, dataSource] = await Promise.all([
    readSource("src/pages/about.astro"),
    readSource("src/pages/cv.astro"),
    readSource("src/data/profile.mjs"),
  ]);

  const forbiddenDemoText = [
    "GitHub University",
    "Version Control Theory",
    "Skill 1",
    "Professor Hub",
    "academicpages",
    "Second University",
    "First University",
  ];

  for (const page of [about, cv, dataSource]) {
    for (const forbidden of forbiddenDemoText) {
      assert.doesNotMatch(page, new RegExp(forbidden, "i"));
    }
    assert.doesNotMatch(page, /\b(?:19|20)\d{2}\b/);
    assert.doesNotMatch(
      page,
      /education|award|publication|professor|senior|staff|principal|lead|高级|资深|负责人/i,
    );
    assert.doesNotMatch(page, /\b\d+(?:\.\d+)?%/);
  }

  assert.equal(PROFILE.experience.length, 2);
  assert.equal(PROFILE.openSourceRoles.length, 3);
  assert.equal(PROFILE.collaborations.length, 2);
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
