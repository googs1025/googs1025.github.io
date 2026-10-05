# 贡献指南

本仓库维护一个中文优先的 Astro 技术博客。提交应保持内容真实、范围明确，并与现有站点结构一致。

## 本地环境

需要 Node.js 24 和 npm。首次开发时安装依赖与 Playwright 浏览器：

```bash
npm install
npx playwright install chromium
```

启动本地开发服务器：

```bash
npm run dev
```

## 添加或修改文章

文章位于 `src/content/blog/`，使用 Markdown 和以下 frontmatter：

```yaml
---
title: 文章标题
description: 用于列表、搜索和分享的摘要
pubDate: 2026-10-04
updatedDate: 2026-10-05 # 可选，不得早于发布日期
categories: [云原生]
draft: false
canonicalURL: https://example.com/original # 可选
legacyURLs: [/old/path/] # 可选
---
```

图片等公开资源放在 `public/images/`，并使用以 `/images/` 开头的站内路径。请提供准确的替代文本，只提交来源明确且有权使用的素材。

内容必须基于作者确认的真实资料。不得编造履历、职位、日期、指标、项目成果或社区角色；不确定的信息应先确认，不使用占位文字冒充完成内容。

## 验证

提交前运行完整检查：

```bash
npm run verify
```

该命令包含单元与源码契约测试、Astro 检查、生产构建、生成产物校验和 Playwright 端到端测试。首次安装浏览器后，也可按需分别运行 `npm test`、`npm run check`、`npm run build` 和 `npm run test:e2e` 定位问题。

## 提交规范

- 每个提交保持单一目的，避免混入无关格式调整或重构。
- 提交前检查 `git status` 和 diff，只纳入本次变更需要的文件。
- 不提交 `dist/`、测试报告、编辑器临时文件或依赖目录。
- 提交信息简洁说明变更意图；文档、测试与实现应在同一范围内保持一致。
