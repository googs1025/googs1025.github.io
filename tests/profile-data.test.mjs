import assert from "node:assert/strict";
import test from "node:test";

import { PROFILE } from "../src/data/profile.mjs";

test("profile data contains the exact approved identity and experience", () => {
  assert.deepEqual(PROFILE.identity, {
    name: "江振瑜",
    latinName: "CYJiang",
    handle: "@googs1025",
    profession: "云原生开发与基础设施工程师",
    summary:
      "云原生开发与基础设施工程师，关注 Kubernetes 调度、GPU 资源管理与 LLM 推理基础设施。",
  });
  assert.deepEqual(PROFILE.experience, [
    {
      organization: "马上消费金融",
      status: "current",
      focus: "云原生基础设施",
      summary: "目前在马上消费金融从事云原生基础设施相关工作。",
    },
    {
      organization: "ByteDance",
      status: "previous",
      role: "云平台工程师",
      summary: "此前曾在 ByteDance 担任云平台工程师。",
    },
  ]);
});

test("profile data contains only the approved focus, roles, and projects", () => {
  assert.deepEqual(PROFILE.technicalFocus, [
    "Kubernetes 调度",
    "GPU 资源管理",
    "LLM 推理基础设施",
  ]);
  assert.deepEqual(PROFILE.openSourceRoles, [
    {
      project: "Kubernetes",
      role: "Member",
      url: "https://github.com/kubernetes/kubernetes",
    },
    {
      project: "Aibrix",
      role: "Maintainer",
      url: "https://github.com/vllm-project/aibrix",
    },
    {
      project: "Volcano",
      role: "Member",
      url: "https://github.com/volcano-sh/volcano",
    },
  ]);
  assert.deepEqual(PROFILE.collaborations, [
    {
      project: "scheduler-plugins",
      activity: "Reviewer",
      url: "https://github.com/kubernetes-sigs/scheduler-plugins",
    },
    {
      project: "descheduler",
      activity: "Reviewer",
      url: "https://github.com/kubernetes-sigs/descheduler",
    },
    {
      project: "llmaz",
      activity: "Reviewer",
      url: "https://github.com/llmaz/llmaz",
    },
    {
      project: "Volcano",
      activity: "Community member",
      url: "https://github.com/volcano-sh/volcano",
    },
    {
      project: "Koordinator",
      activity: "Community member",
      url: "https://github.com/koordinator-sh/koordinator",
    },
  ]);

  assert.deepEqual(
    [
      ...PROFILE.openSourceRoles,
      ...PROFILE.collaborations,
    ].map(({ project }) => project),
    [
      "Kubernetes",
      "Aibrix",
      "Volcano",
      "scheduler-plugins",
      "descheduler",
      "llmaz",
      "Volcano",
      "Koordinator",
    ],
  );
  assert.deepEqual(
    PROFILE.recognitions,
    [
      {
        title: "Kubernetes Contributor Award 2025 — SIG Scheduling",
        url: "https://www.kubernetes.dev/community/awards/2025/#scheduling",
      },
    ],
  );
  assert.deepEqual(
    PROFILE.musaProjects.map(({ project }) => project),
    ["fake-gpu-musa", "musa-learning-notes"],
  );
  assert.deepEqual(
    PROFILE.openSourceFocus.map(({ topic }) => topic),
    [
      "Kubernetes Scheduling",
      "LLM Inference Infrastructure",
      "GPU & Heterogeneous Computing",
    ],
  );
});

test("profile project URLs are frozen HTTPS GitHub links", () => {
  assert.equal(Object.isFrozen(PROFILE), true);
  assert.equal(Object.isFrozen(PROFILE.identity), true);

  for (const collection of [
    PROFILE.experience,
    PROFILE.technicalFocus,
    PROFILE.openSourceRoles,
    PROFILE.collaborations,
    PROFILE.openSourceFocus,
    PROFILE.musaProjects,
    PROFILE.recognitions,
    PROFILE.exploring,
  ]) {
    assert.equal(Object.isFrozen(collection), true);
  }

  for (const project of [
    ...PROFILE.openSourceRoles,
    ...PROFILE.collaborations,
    ...PROFILE.musaProjects,
    ...PROFILE.recognitions,
  ]) {
    const url = new URL(project.url);
    assert.equal(url.protocol, "https:");
    assert.ok(
      ["github.com", "www.kubernetes.dev"].includes(url.hostname),
    );
    assert.equal(Object.isFrozen(project), true);
  }

  for (const focus of PROFILE.openSourceFocus) {
    assert.equal(Object.isFrozen(focus), true);
    assert.equal(Object.isFrozen(focus.projects), true);
    for (const project of focus.projects) {
      assert.equal(Object.isFrozen(project), true);
    }
  }
});

test("profile data has no unsupported credentials, metrics, or title levels", () => {
  const forbiddenKeys = /^(?:date|dates|start|end|education|metric|metrics|level)$/i;
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        assert.doesNotMatch(key, forbiddenKeys);
        visit(child);
      }
    }
  };

  visit(PROFILE);

  const serialized = JSON.stringify(PROFILE)
    .replace("Kubernetes Contributor Award 2025 — SIG Scheduling", "")
    .replace(
      "https://www.kubernetes.dev/community/awards/2025/#scheduling",
      "",
    );
  assert.doesNotMatch(serialized, /\b(?:19|20)\d{2}\b/);
  assert.doesNotMatch(
    serialized,
    /education|university|publication|professor|senior|staff|principal|lead|高级|资深|负责人/i,
  );
});
