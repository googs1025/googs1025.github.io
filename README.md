# 江振瑜的技术博客

这是 [googs1025.github.io](https://googs1025.github.io) 的源码仓库，内容聚焦 Kubernetes 调度、云原生基础设施、开源社区与 LLM 推理平台实践。

站点使用 Astro 和 Markdown 静态生成，Pagefind 提供离线全文搜索，并通过 GitHub Pages 发布。构建结果还包含 RSS、站点地图、文章元数据和旧链接兼容页。

## 本地开发

需要 Node.js 24 或更高版本。

```bash
npm install
npx playwright install chromium
npm run dev
```

提交前运行完整验证：

```bash
npm run verify
```

该命令依次执行单元与源码契约测试、Astro 类型检查、生产构建、生成产物校验和 Playwright 端到端测试。

## 添加文章

文章存放在 `src/content/blog/`。基本 frontmatter 如下：

```yaml
---
title: "文章标题"
description: "用于列表、搜索和 SEO 的摘要"
pubDate: 2026-10-04
updatedDate: 2026-10-05 # 可选，不得早于发布日期
categories: [云原生]
draft: false
canonicalURL: https://example.com/original # 可选，外部首发地址
legacyURLs: [/old/article/path/] # 可选，站内旧地址
---
```

正文图片放在 `public/images/` 下，并在 Markdown 中使用以 `/images/` 开头的绝对站内路径。图片应提供准确的替代文本；不要提交来源不明或无权使用的素材。

所有公开内容必须来自作者确认的真实资料。不要加入模板演示内容、写作提示、占位符、未经证实的履历、日期、头衔或量化成果。

## 生产发布

`.github/workflows/deploy.yml` 在 `master` 分支更新时运行，也可手动触发。工作流使用 Node.js 24，通过 `npm ci` 安装锁定依赖，安装 Chromium 及 CI 系统依赖，运行 `npm run verify`，然后仅将生成的 `dist/` 上传并部署到 GitHub Pages。
