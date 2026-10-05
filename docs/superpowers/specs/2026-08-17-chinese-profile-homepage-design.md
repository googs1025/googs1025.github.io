# Chinese Profile Homepage Design

## Goal

Refresh the GitHub Pages homepage into a Chinese-first personal profile page for CYJiang. The page should feel like a polished Chinese engineer profile rather than an English portfolio or an academic homepage.

The primary visitor should quickly understand:

- Who CYJiang is.
- What technical areas he focuses on.
- Which open source communities and projects he is involved in.
- Where to read recent writing and how to contact him.

## Selected Direction

Use the approved **Chinese profile card** direction.

This design combines a personal card with a concise technical resume:

- Left side: identity block with name, handle, current role, location, and key open source roles.
- Right side: primary introduction, technical focus grid, and clear links to projects, writing, GitHub, email, and WeChat.
- Later sections: compact open source/community cards, recent writing, and a shorter English summary.

The homepage should be Chinese-first. English can appear where it is natural for project names, community roles, and a compact bilingual summary, but the main copy should read naturally in Chinese.

## Visual Style

The page should be clean, bright, and professional:

- Use a white or very light neutral background.
- Use restrained accent colors from engineering domains: blue, green, amber, and indigo.
- Use compact cards with small radius, subtle borders, and no heavy shadows.
- Avoid a dark terminal aesthetic, oversized marketing hero, gradient-heavy backgrounds, or decorative blobs.
- Keep the existing Jekyll/Academic Pages masthead, sidebar, and navigation model intact.

The first viewport should make the personal brand obvious through the name `江振瑜`, handle `CYJiang / googs1025`, and the short technical positioning.

## Homepage Structure

### Hero/Profile

The homepage starts with a two-column profile panel:

- Identity card:
  - `江振瑜`
  - `CYJiang / googs1025`
  - 云原生开发工程师
  - Kubernetes Member
  - Aibrix Maintainer
  - Volcano Member
- Intro area:
  - Main headline: `专注云原生调度与 LLM 推理基础设施`
  - Short paragraph explaining current cloud native infrastructure work, prior ByteDance cloud platform experience, and open source collaboration.
  - Quick action links for GitHub, Email, Blog/Posts, and CV if the existing navigation supports it.

### Focus Areas

Below the intro, add a four-item focus grid:

- 调度系统: Kubernetes scheduling, scheduler-plugins, descheduler, Volcano.
- 推理平台: Aibrix, llmaz, vLLM, SGLang, llm-d.
- GPU 管理: accelerator-aware scheduling and resource operations.
- 开源协作: reviews, discussions, implementation, and community work.

Each item should have a short title, one-line description, and a colored left accent or small badge.

### Open Source

Use compact project/community cards for:

- Kubernetes
- Aibrix
- Volcano
- Kubernetes SIG Scheduling ecosystem, including descheduler and scheduler-plugins

Cards should include role badges and short descriptions. They should prioritize links and scanability over long prose.

### Recent Writing

Show a short writing section with recent notes, including the existing KubeCon China 2025 post if it is available. If automatic post listing is too intrusive for the current theme, use a small manually curated list on the homepage.

### Contact

Use a compact contact block:

- Email: `googs1025@gmail.com`
- GitHub: `googs1025`
- WeChat: `googs1025`

### English Summary

End with a short English summary rather than a full duplicate of the Chinese content. It should help non-Chinese visitors understand the same positioning without making the page overly long.

## Implementation Boundaries

Keep changes scoped to the homepage and its dedicated styles:

- Modify `_pages/about.md`.
- Modify `_sass/layout/_homepage_refresh.scss` or replace its internal structure while keeping it dedicated to homepage styles.
- Keep `assets/css/main.scss` import unchanged unless the current import is broken.
- Update or add verification scripts only if they directly protect the new homepage structure.

Do not change unrelated posts, images, navigation, site config, generated assets, or existing user work.

## Responsive Behavior

The profile panel should stack cleanly on mobile:

- Identity card above intro content.
- Focus grid becomes one column or two compact columns depending on available width.
- Project cards stack vertically.
- Button and tag text must not overflow.

Desktop should remain readable inside the existing Academic Pages content width. The design should not assume full-bleed layout because the current theme already has masthead/sidebar structure.

## Verification

Before completion, verify:

- The Jekyll site builds successfully with the locally available command.
- `git diff --check` passes.
- Homepage Markdown/frontmatter remains valid.
- The homepage includes the approved Chinese-first sections and required open source/project references.
- The layout is checked visually at desktop and mobile widths if a local server can be started.

## Open Decisions Resolved

- Visual direction: Chinese profile card page.
- Language priority: Chinese-first, compact English summary.
- Scope: Homepage refresh only, no theme migration.
- Style: Bright, professional, restrained, card-based.
