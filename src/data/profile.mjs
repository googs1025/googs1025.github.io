/** @typedef {{ organization: string, status: "current", focus: string, summary: string } | { organization: string, status: "previous", role: string, summary: string }} Experience */
/** @typedef {{ project: string, role: string, url: string }} OpenSourceRole */
/** @typedef {{ project: string, activity: string, url: string }} Collaboration */
/** @typedef {{ project: string, description: string, url: string }} Project */

const identity = Object.freeze({
  name: "江振瑜",
  latinName: "CYJiang",
  handle: "@googs1025",
  profession: "云原生开发与基础设施工程师",
  summary:
    "云原生开发与基础设施工程师，关注 Kubernetes 调度、GPU 资源管理与 LLM 推理基础设施。",
});

/** @type {readonly Experience[]} */
const experience = Object.freeze([
  Object.freeze({
    organization: "马上消费金融",
    status: "current",
    focus: "云原生基础设施",
    summary: "目前在马上消费金融从事云原生基础设施相关工作。",
  }),
  Object.freeze({
    organization: "ByteDance",
    status: "previous",
    role: "云平台工程师",
    summary: "此前曾在 ByteDance 担任云平台工程师。",
  }),
]);

const technicalFocus = Object.freeze([
  "Kubernetes 调度",
  "GPU 资源管理",
  "LLM 推理基础设施",
]);

/** @type {readonly OpenSourceRole[]} */
const openSourceRoles = Object.freeze([
  Object.freeze({
    project: "Kubernetes",
    role: "Member",
    url: "https://github.com/kubernetes/kubernetes",
  }),
  Object.freeze({
    project: "Aibrix",
    role: "Maintainer",
    url: "https://github.com/vllm-project/aibrix",
  }),
  Object.freeze({
    project: "Volcano",
    role: "Member",
    url: "https://github.com/volcano-sh/volcano",
  }),
]);

/** @type {readonly Collaboration[]} */
const collaborations = Object.freeze([
  Object.freeze({
    project: "scheduler-plugins",
    activity: "Reviewer",
    url: "https://github.com/kubernetes-sigs/scheduler-plugins",
  }),
  Object.freeze({
    project: "descheduler",
    activity: "Reviewer",
    url: "https://github.com/kubernetes-sigs/descheduler",
  }),
  Object.freeze({
    project: "llmaz",
    activity: "Reviewer",
    url: "https://github.com/llmaz/llmaz",
  }),
  Object.freeze({
    project: "Volcano",
    activity: "Community member",
    url: "https://github.com/volcano-sh/volcano",
  }),
  Object.freeze({
    project: "Koordinator",
    activity: "Community member",
    url: "https://github.com/koordinator-sh/koordinator",
  }),
]);

const openSourceFocus = Object.freeze([
  Object.freeze({
    topic: "Kubernetes Scheduling",
    projects: Object.freeze([
      Object.freeze({
        project: "scheduler-plugins",
        url: "https://github.com/kubernetes-sigs/scheduler-plugins",
      }),
      Object.freeze({
        project: "descheduler",
        url: "https://github.com/kubernetes-sigs/descheduler",
      }),
      Object.freeze({
        project: "Volcano",
        url: "https://github.com/volcano-sh/volcano",
      }),
      Object.freeze({
        project: "Koordinator",
        url: "https://github.com/koordinator-sh/koordinator",
      }),
    ]),
  }),
  Object.freeze({
    topic: "LLM Inference Infrastructure",
    projects: Object.freeze([
      Object.freeze({
        project: "Aibrix",
        url: "https://github.com/vllm-project/aibrix",
      }),
      Object.freeze({
        project: "llmaz",
        url: "https://github.com/llmaz/llmaz",
      }),
      Object.freeze({
        project: "vLLM",
        url: "https://github.com/vllm-project/vllm",
      }),
      Object.freeze({
        project: "SGLang",
        url: "https://github.com/sgl-project/sglang",
      }),
      Object.freeze({
        project: "llm-d",
        url: "https://github.com/llm-d/llm-d",
      }),
    ]),
  }),
  Object.freeze({
    topic: "GPU & Heterogeneous Computing",
    projects: Object.freeze([
      Object.freeze({
        project: "CUDA",
        url: "https://developer.nvidia.com/cuda-toolkit",
      }),
      Object.freeze({
        project: "MUSA",
        url: "https://github.com/MooreThreads",
      }),
    ]),
  }),
]);

/** @type {readonly Project[]} */
const musaProjects = Object.freeze([
  Object.freeze({
    project: "fake-gpu-musa",
    description:
      "Simulates MUSA and CUDA GPU components in Kubernetes environments, including user-space libraries, command-line tools, and device integration.",
    url: "https://github.com/googs1025/fake-gpu-musa",
  }),
  Object.freeze({
    project: "musa-learning-notes",
    description: "Notes and experiments from learning the MUSA SDK and GPU computing stack.",
    url: "https://github.com/googs1025/musa-learning-notes",
  }),
]);

const recognitions = Object.freeze([
  Object.freeze({
    title: "Kubernetes Contributor Award 2025 — SIG Scheduling",
    url: "https://www.kubernetes.dev/community/awards/2025/#scheduling",
  }),
]);

const exploring = Object.freeze([
  "MUSA and GPU computing fundamentals",
  "GPU management, device integration, and scheduling on Kubernetes",
  "Large-scale LLM inference workloads",
]);

const chineseSummary =
  "我的开源工作主要关注 Kubernetes 调度、GPU 基础设施、LLM 推理基础设施和异构算力工作负载编排。目前也在协助建设 MUSA 开源生态，探索 MUSA 与云原生及 AI 基础设施的结合。";

export const PROFILE = Object.freeze({
  identity,
  experience,
  technicalFocus,
  openSourceRoles,
  collaborations,
  openSourceFocus,
  musaProjects,
  recognitions,
  exploring,
  chineseSummary,
});
