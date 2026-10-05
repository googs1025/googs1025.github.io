/** @typedef {{ organization: string, status: "current", focus: string, summary: string } | { organization: string, status: "previous", role: string, summary: string }} Experience */
/** @typedef {{ project: string, role: string, url: string, description: string }} OpenSourceRole */
/** @typedef {{ project: string, activity: string, url: string }} Collaboration */
/** @typedef {{ project: string, description: string, url: string }} Project */

const identity = Object.freeze({
  name: "江振瑜",
  latinName: "CYJiang",
  handle: "@googs1025",
  summary:
    "I’m Jiang Zhenyu (CYJiang). My open source work focuses on Kubernetes scheduling, GPU infrastructure, LLM inference infrastructure, and accelerator-aware workload orchestration.",
  motto: "I am a slow walker, but I never walk backwards.",
});

/** @type {readonly Experience[]} */
const experience = Object.freeze([
  Object.freeze({
    organization: "Current role",
    status: "current",
    focus: "MUSA open source ecosystem",
    summary:
      "In my current role, I help grow the MUSA open source ecosystem and explore its integration with cloud native and AI infrastructure.",
  }),
  Object.freeze({
    organization: "ByteDance",
    status: "previous",
    role: "Cloud platform engineering",
    summary: "Previously, I worked on cloud platform engineering at ByteDance.",
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
    description: "Contributing to Kubernetes and the SIG Scheduling ecosystem.",
  }),
  Object.freeze({
    project: "Aibrix",
    role: "Maintainer",
    url: "https://github.com/vllm-project/aibrix",
    description:
      "Supporting the development and community of cloud native GenAI inference infrastructure.",
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

const roleGroups = Object.freeze([
  Object.freeze({
    title: "Reviewer",
    description:
      "Participating in design discussions and code reviews for scheduler-plugins, descheduler, and llmaz.",
    projects: Object.freeze(collaborations.slice(0, 3)),
  }),
  Object.freeze({
    title: "Community Member",
    description: "Participating in the Volcano and Koordinator communities.",
    projects: Object.freeze(collaborations.slice(3)),
  }),
]);

const openSourceFocus = Object.freeze([
  Object.freeze({
    topic: "Kubernetes Scheduling",
    description:
      "Scheduling, resource orchestration, batch workloads, and related projects including scheduler-plugins, descheduler, Volcano, and Koordinator.",
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
    description:
      "Cloud native infrastructure for scalable model serving, including Aibrix, llmaz, vLLM, SGLang, and llm-d.",
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
    description:
      "GPU management, Kubernetes device integration, accelerator-aware scheduling, CUDA, and MUSA.",
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
    description:
      "Recognized for contributions across Kubernetes scheduler, descheduler, and scheduler-plugins.",
  }),
]);

const exploring = Object.freeze([
  "MUSA and GPU computing fundamentals",
  "GPU management, device integration, and scheduling on Kubernetes",
  "Large-scale LLM inference workloads",
]);

const chineseSummary = Object.freeze([
  "我是江振瑜（CYJiang）。我的开源工作主要关注 Kubernetes 调度、GPU 基础设施、LLM 推理基础设施和异构算力工作负载编排。目前，我也会在工作中协助建设和扩展 MUSA 开源生态，探索 MUSA 与云原生及 AI 基础设施的结合。此前曾在字节跳动从事云平台相关工作。",
  "我是 Kubernetes Member、Aibrix Maintainer，以及 scheduler-plugins、descheduler 和 llmaz Reviewer，同时参与 Volcano 与 Koordinator 社区。2025 年，我获得了 Kubernetes SIG Scheduling Contributor Award。",
  "当前主要学习和探索 MUSA、GPU 计算、Kubernetes GPU 管理与调度，以及大规模 LLM 推理工作负载。",
]);

export const PROFILE = Object.freeze({
  identity,
  experience,
  technicalFocus,
  openSourceRoles,
  collaborations,
  roleGroups,
  openSourceFocus,
  musaProjects,
  recognitions,
  exploring,
  chineseSummary,
});
