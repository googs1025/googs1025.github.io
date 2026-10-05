import assert from "node:assert/strict";
import test from "node:test";

import { PROFILE } from "../src/data/profile.mjs";

test("profile data contains the exact approved identity and experience", () => {
  assert.deepEqual(PROFILE.identity, {
    name: "江振瑜",
    latinName: "CYJiang",
    handle: "@googs1025",
    summary:
      "I’m Jiang Zhenyu (CYJiang). My open source work focuses on Kubernetes scheduling, GPU infrastructure, LLM inference infrastructure, and accelerator-aware workload orchestration.",
    motto: "I am a slow walker, but I never walk backwards.",
  });
  assert.deepEqual(PROFILE.experience, [
    {
      organization: "Current role",
      status: "current",
      focus: "MUSA open source ecosystem",
      summary:
        "In my current role, I help grow the MUSA open source ecosystem and explore its integration with cloud native and AI infrastructure.",
    },
    {
      organization: "ByteDance",
      status: "previous",
      role: "Cloud platform engineering",
      summary: "Previously, I worked on cloud platform engineering at ByteDance.",
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
      description: "Contributing to Kubernetes and the SIG Scheduling ecosystem.",
    },
    {
      project: "Aibrix",
      role: "Maintainer",
      url: "https://github.com/vllm-project/aibrix",
      description:
        "Supporting the development and community of cloud native GenAI inference infrastructure.",
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
        description:
          "Recognized for contributions across Kubernetes scheduler, descheduler, and scheduler-plugins.",
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
  assert.deepEqual(
    PROFILE.openSourceFocus.map(({ description }) => description),
    [
      "Scheduling, resource orchestration, batch workloads, and related projects including scheduler-plugins, descheduler, Volcano, and Koordinator.",
      "Cloud native infrastructure for scalable model serving, including Aibrix, llmaz, vLLM, SGLang, and llm-d.",
      "GPU management, Kubernetes device integration, accelerator-aware scheduling, CUDA, and MUSA.",
    ],
  );
  assert.deepEqual(
    PROFILE.roleGroups.map(({ title, description }) => ({ title, description })),
    [
      {
        title: "Reviewer",
        description:
          "Participating in design discussions and code reviews for scheduler-plugins, descheduler, and llmaz.",
      },
      {
        title: "Community Member",
        description:
          "Participating in the Volcano and Koordinator communities.",
      },
    ],
  );
  assert.deepEqual(PROFILE.chineseSummary, [
    "我是江振瑜（CYJiang）。我的开源工作主要关注 Kubernetes 调度、GPU 基础设施、LLM 推理基础设施和异构算力工作负载编排。目前，我也会在工作中协助建设和扩展 MUSA 开源生态，探索 MUSA 与云原生及 AI 基础设施的结合。此前曾在字节跳动从事云平台相关工作。",
    "我是 Kubernetes Member、Aibrix Maintainer，以及 scheduler-plugins、descheduler 和 llmaz Reviewer，同时参与 Volcano 与 Koordinator 社区。2025 年，我获得了 Kubernetes SIG Scheduling Contributor Award。",
    "当前主要学习和探索 MUSA、GPU 计算、Kubernetes GPU 管理与调度，以及大规模 LLM 推理工作负载。",
  ]);
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
    PROFILE.roleGroups,
    PROFILE.chineseSummary,
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
  for (const group of PROFILE.roleGroups) {
    assert.equal(Object.isFrozen(group), true);
    assert.equal(Object.isFrozen(group.projects), true);
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
    )
    .replace("2025 年，我获得了 Kubernetes SIG Scheduling Contributor Award。", "");
  assert.doesNotMatch(serialized, /\b(?:19|20)\d{2}\b/);
  assert.doesNotMatch(
    serialized,
    /education|university|publication|professor|senior|staff|principal|lead|高级|资深|负责人|马上消费金融|云原生开发与基础设施工程师/i,
  );
});
