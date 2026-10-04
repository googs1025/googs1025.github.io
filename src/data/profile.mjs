/** @typedef {{ organization: string, status: "current", focus: string, summary: string } | { organization: string, status: "previous", role: string, summary: string }} Experience */
/** @typedef {{ project: string, role: string, url: string }} OpenSourceRole */
/** @typedef {{ project: string, activity: string, url: string }} Collaboration */

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
    activity: "工作、讨论与代码评审",
    url: "https://github.com/kubernetes-sigs/scheduler-plugins",
  }),
  Object.freeze({
    project: "descheduler",
    activity: "工作、讨论与代码评审",
    url: "https://github.com/kubernetes-sigs/descheduler",
  }),
]);

export const PROFILE = Object.freeze({
  identity,
  experience,
  technicalFocus,
  openSourceRoles,
  collaborations,
});
