# Chinese Profile Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the GitHub Pages homepage into a Chinese-first profile card page that presents CYJiang's cloud native, Kubernetes scheduling, LLM inference infrastructure, and open source identity clearly.

**Architecture:** Keep the existing Jekyll/Academic Pages layout, masthead, sidebar, and `layout/homepage_refresh` Sass import. Replace the homepage body in `_pages/about.md` with semantic sections and dedicated class hooks, then replace `_sass/layout/_homepage_refresh.scss` with scoped styles for the new profile panel, focus grid, project cards, writing section, contact block, and responsive behavior. Update the shell verification script to protect the new Chinese-first structure and required content.

**Tech Stack:** Jekyll, kramdown Markdown, Sass, POSIX shell, GitHub Pages-compatible static HTML/CSS.

---

## File Structure

- Modify: `scripts/verify_homepage_refresh.sh`
  - Validate the Chinese-first homepage sections, wrapper class, profile/focus/project/contact style hooks, required project/community references, and existing Sass import.
- Modify: `_pages/about.md`
  - Replace the current English-first homepage with the approved Chinese profile card content.
- Modify: `_sass/layout/_homepage_refresh.scss`
  - Replace the previous topic-chip and image-card styles with the new Chinese profile page components.
- Unchanged: `assets/css/main.scss`
  - Keep the existing `layout/homepage_refresh` import.

## Task 1: Update Homepage Structure Verification

**Files:**
- Modify: `scripts/verify_homepage_refresh.sh`

- [ ] **Step 1: Replace the verification script**

Replace the entire contents of `scripts/verify_homepage_refresh.sh` with:

```bash
#!/usr/bin/env bash
set -euo pipefail

about_file="_pages/about.md"
scss_file="_sass/layout/_homepage_refresh.scss"
main_scss="assets/css/main.scss"

required_sections=(
  "## 技术方向"
  "## 开源与社区"
  "## 最近记录"
  "## 联系方式"
  "## English Summary"
)

for section in "${required_sections[@]}"; do
  if ! grep -Fxq "$section" "$about_file"; then
    echo "Missing homepage section: $section" >&2
    exit 1
  fi
done

required_content=(
  "江振瑜"
  "CYJiang / googs1025"
  "专注云原生调度与 LLM 推理基础设施"
  "Kubernetes Member"
  "Aibrix Maintainer"
  "Volcano Member"
  "scheduler-plugins"
  "descheduler"
  "vLLM"
  "SGLang"
  "llm-d"
  "googs1025@gmail.com"
)

for text in "${required_content[@]}"; do
  if ! grep -Fq "$text" "$about_file"; then
    echo "Missing required homepage content: $text" >&2
    exit 1
  fi
done

homepage_refresh_class="class[[:space:]]*=[[:space:]]*\"([^\"]*[[:space:]])?homepage-refresh([[:space:]][^\"]*)?\"|class[[:space:]]*=[[:space:]]*'([^']*[[:space:]])?homepage-refresh([[:space:]][^']*)?'"
profile_card_class="class[[:space:]]*=[[:space:]]*\"([^\"]*[[:space:]])?profile-card([[:space:]][^\"]*)?\"|class[[:space:]]*=[[:space:]]*'([^']*[[:space:]])?profile-card([[:space:]][^']*)?'"
focus_card_class="class[[:space:]]*=[[:space:]]*\"([^\"]*[[:space:]])?focus-card([[:space:]][^\"]*)?\"|class[[:space:]]*=[[:space:]]*'([^']*[[:space:]])?focus-card([[:space:]][^']*)?'"
project_card_class="class[[:space:]]*=[[:space:]]*\"([^\"]*[[:space:]])?project-card([[:space:]][^\"]*)?\"|class[[:space:]]*=[[:space:]]*'([^']*[[:space:]])?project-card([[:space:]][^']*)?'"

if ! grep -Eq "$homepage_refresh_class" "$about_file"; then
  echo "Missing homepage wrapper class token: homepage-refresh" >&2
  exit 1
fi

if ! grep -Eq "$profile_card_class" "$about_file"; then
  echo "Missing profile card class token: profile-card" >&2
  exit 1
fi

focus_card_count="$(grep -Ec "$focus_card_class" "$about_file")"
if [ "$focus_card_count" -lt 4 ]; then
  echo "Expected at least 4 focus-card items, found $focus_card_count" >&2
  exit 1
fi

project_card_count="$(grep -Ec "$project_card_class" "$about_file")"
if [ "$project_card_count" -lt 4 ]; then
  echo "Expected at least 4 project-card items, found $project_card_count" >&2
  exit 1
fi

if ! awk '
  function active_sass_line(input, line, start, end) {
    line = input

    while (1) {
      if (in_block_comment) {
        end = index(line, "*/")
        if (!end) {
          return ""
        }
        line = substr(line, end + 2)
        in_block_comment = 0
      }

      start = index(line, "/*")
      if (!start) {
        break
      }

      end = index(substr(line, start + 2), "*/")
      if (!end) {
        in_block_comment = 1
        line = substr(line, 1, start - 1)
        break
      }

      line = substr(line, 1, start - 1) substr(line, start + end + 3)
    }

    sub(/[[:space:]]*\/\/.*/, "", line)
    return line
  }

  {
    line = active_sass_line($0)
  }

  line ~ /^[[:space:]]*@import([[:space:]]|$)/ {
    in_import = 1
  }

  in_import && line ~ /"layout\/homepage_refresh"/ {
    found = 1
  }

  in_import && line ~ /;/ {
    in_import = 0
  }

  END {
    exit found ? 0 : 1
  }
' "$main_scss"; then
  echo "assets/css/main.scss does not import layout/homepage_refresh" >&2
  exit 1
fi

required_selectors=(
  ".homepage-refresh"
  ".profile-hero"
  ".profile-card"
  ".profile-avatar"
  ".role-list"
  ".hero-actions"
  ".focus-grid"
  ".focus-card"
  ".project-grid"
  ".project-card"
  ".writing-list"
  ".contact-panel"
  ".english-summary"
)

for selector in "${required_selectors[@]}"; do
  if ! grep -Fq "$selector" "$scss_file"; then
    echo "Missing homepage style selector: $selector" >&2
    exit 1
  fi
done
```

- [ ] **Step 2: Run verification to confirm it fails against the current page**

Run:

```bash
scripts/verify_homepage_refresh.sh
```

Expected: FAIL with a message such as `Missing homepage section: ## 技术方向`.

- [ ] **Step 3: Commit the failing verification update**

Run:

```bash
git add scripts/verify_homepage_refresh.sh
git -c commit.gpgsign=false commit -m "test: verify chinese profile homepage"
```

## Task 2: Replace Homepage Content

**Files:**
- Modify: `_pages/about.md`

- [ ] **Step 1: Replace the homepage Markdown**

Replace the entire contents of `_pages/about.md` with:

```markdown
---
permalink: /
title: "江振瑜 / CYJiang"
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<div class="homepage-refresh" markdown="1">

<section class="profile-hero" markdown="1">
<aside class="profile-card" markdown="1">
<div class="profile-avatar" aria-hidden="true">江</div>

### 江振瑜

<p class="profile-handle">CYJiang / googs1025</p>

<p class="profile-role">云原生开发工程师</p>

<ul class="role-list">
  <li>Kubernetes Member</li>
  <li>Aibrix Maintainer</li>
  <li>Volcano Member</li>
</ul>
</aside>

<div class="profile-intro" markdown="1">
<span class="eyebrow">Cloud Native · Kubernetes · LLM Inference</span>

# 专注云原生调度与 LLM 推理基础设施

我是江振瑜（CYJiang），目前从事云原生基础设施相关工作，关注 Kubernetes 调度、GPU 资源管理、模型推理平台和开源社区协作。此前曾在字节跳动担任云平台工程师。

我长期参与 Kubernetes 调度生态、Aibrix、Volcano、descheduler、scheduler-plugins 等开源项目，希望把复杂系统中的工程经验沉淀为可复用的基础设施能力和技术记录。

<div class="hero-actions">
  <a href="https://github.com/googs1025">GitHub</a>
  <a href="mailto:googs1025@gmail.com">Email</a>
  <a href="/year-archive/">文章</a>
  <a href="/cv/">CV</a>
</div>
</div>
</section>

## 技术方向

<div class="focus-grid">
  <section class="focus-card focus-card-blue" markdown="1">
  ### 调度系统
  Kubernetes scheduling、Volcano、scheduler-plugins、descheduler，以及面向批处理和异构资源的编排实践。
  </section>

  <section class="focus-card focus-card-green" markdown="1">
  ### 推理平台
  Aibrix、llmaz、vLLM、SGLang、llm-d 等 LLM inference 平台与引擎生态。
  </section>

  <section class="focus-card focus-card-amber" markdown="1">
  ### GPU 管理
  面向加速器工作负载的资源管理、调度策略、稳定性治理和运维协同。
  </section>

  <section class="focus-card focus-card-indigo" markdown="1">
  ### 开源协作
  参与社区讨论、代码评审、实现工作和工程实践分享，把实际问题反馈到开源生态。
  </section>
</div>

## 开源与社区

<div class="project-grid">
  <section class="project-card" markdown="1">
  <span class="project-badge">Member</span>
  ### [Kubernetes](https://github.com/kubernetes/kubernetes)
  参与上游社区协作，关注调度、资源管理和云原生基础设施相关议题。
  </section>

  <section class="project-card" markdown="1">
  <span class="project-badge">Maintainer</span>
  ### [Aibrix](https://github.com/vllm-project/aibrix)
  参与云原生 LLM 推理基础设施建设，关注模型服务、扩缩容、可观测和平台工程。
  </section>

  <section class="project-card" markdown="1">
  <span class="project-badge">Member</span>
  ### [Volcano](https://github.com/volcano-sh/volcano)
  参与批处理调度和工作负载编排相关社区工作，关注云原生场景下的资源效率。
  </section>

  <section class="project-card" markdown="1">
  <span class="project-badge">Reviewer</span>
  ### [SIG Scheduling Ecosystem](https://github.com/kubernetes-sigs/scheduler-plugins)
  参与 [scheduler-plugins](https://github.com/kubernetes-sigs/scheduler-plugins) 与 [descheduler](https://github.com/kubernetes-sigs/descheduler) 等调度生态项目的讨论和评审。
  </section>
</div>

## 最近记录

<div class="writing-list" markdown="1">
- [我的 KubeCon China 2025 参与之旅](/2025/06/14/我的-KubeCon-China-2025-参与之旅/)：记录云原生社区现场交流、议题观察和参与体验。
- 持续整理 Kubernetes 调度、LLM inference、GPU 资源管理和开源协作相关笔记。
</div>

## 联系方式

<div class="contact-panel" markdown="1">
- Email: [googs1025@gmail.com](mailto:googs1025@gmail.com)
- GitHub: [googs1025](https://github.com/googs1025)
- WeChat: `googs1025`
</div>

## English Summary

<div class="english-summary" markdown="1">
I am Jiang Zhenyu (CYJiang), a cloud native development engineer focused on Kubernetes scheduling, LLM inference infrastructure, GPU-aware workload operations, and open source collaboration. I work on cloud native infrastructure at Mashang Consumer Finance and previously worked on cloud platform engineering at ByteDance.
</div>

</div>
```

- [ ] **Step 2: Run verification to confirm content is present but styles are still incomplete**

Run:

```bash
scripts/verify_homepage_refresh.sh
```

Expected: FAIL with a message such as `Missing homepage style selector: .profile-hero`.

- [ ] **Step 3: Commit the homepage content**

Run:

```bash
git add _pages/about.md
git -c commit.gpgsign=false commit -m "content: add chinese profile homepage"
```

## Task 3: Replace Homepage Styles

**Files:**
- Modify: `_sass/layout/_homepage_refresh.scss`

- [ ] **Step 1: Replace the homepage Sass partial**

Replace the entire contents of `_sass/layout/_homepage_refresh.scss` with:

```scss
.homepage-refresh {
  --homepage-bg: #f7f8fa;
  --homepage-surface: #ffffff;
  --homepage-surface-soft: #f8fafc;
  --homepage-text: #111827;
  --homepage-muted: #5f6b7a;
  --homepage-border: #e2e8f0;
  --homepage-blue: #0ea5e9;
  --homepage-green: #16a34a;
  --homepage-amber: #d97706;
  --homepage-indigo: #6366f1;
  --homepage-link: #2563eb;
  color: var(--homepage-text);
}

html[data-theme="dark"] .homepage-refresh {
  --homepage-bg: #111827;
  --homepage-surface: #1f2937;
  --homepage-surface-soft: #162033;
  --homepage-text: #e5e7eb;
  --homepage-muted: #b6c0cf;
  --homepage-border: #334155;
  --homepage-link: #7dd3fc;
}

.homepage-refresh h1 {
  margin: 0.2em 0 0.45em;
  font-size: 1.95em;
  line-height: 1.18;
  letter-spacing: 0;
}

.homepage-refresh h2 {
  margin-top: 2.2em;
  margin-bottom: 0.8em;
  font-size: 1.25em;
  letter-spacing: 0;
}

.homepage-refresh h3 {
  margin-top: 0;
  margin-bottom: 0.45em;
  font-size: 1em;
  letter-spacing: 0;
}

.homepage-refresh p {
  color: var(--homepage-muted);
}

.homepage-refresh a {
  color: var(--homepage-link);
}

.homepage-refresh .profile-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
  gap: 1.25em;
  align-items: stretch;
  margin: 0.5em 0 2em;
}

.homepage-refresh .profile-card,
.homepage-refresh .profile-intro,
.homepage-refresh .focus-card,
.homepage-refresh .project-card,
.homepage-refresh .contact-panel,
.homepage-refresh .english-summary {
  border: 1px solid var(--homepage-border);
  border-radius: 8px;
  background: var(--homepage-surface);
}

.homepage-refresh .profile-card {
  padding: 1.1em;
  background: var(--homepage-surface-soft);
}

.homepage-refresh .profile-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.9em;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(135deg, var(--homepage-blue), var(--homepage-green));
  font-size: 1.45em;
  font-weight: 700;
}

.homepage-refresh .profile-handle {
  margin: -0.25em 0 0.8em;
  color: var(--homepage-muted);
  font-size: 0.9em;
}

.homepage-refresh .profile-role {
  margin-bottom: 0.75em;
  color: var(--homepage-text);
  font-weight: 700;
}

.homepage-refresh .role-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.homepage-refresh .role-list li {
  margin-bottom: 0.45em;
  padding-left: 0.75em;
  border-left: 3px solid var(--homepage-blue);
  color: var(--homepage-muted);
}

.homepage-refresh .profile-intro {
  padding: 1.25em 1.35em;
}

.homepage-refresh .eyebrow {
  display: inline-block;
  color: var(--homepage-green);
  font-size: 0.78em;
  font-weight: 700;
  text-transform: uppercase;
}

.homepage-refresh .hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55em;
  margin-top: 1em;
}

.homepage-refresh .hero-actions a {
  display: inline-flex;
  align-items: center;
  min-height: 2.2rem;
  padding: 0.35em 0.75em;
  border: 1px solid var(--homepage-border);
  border-radius: 6px;
  color: var(--homepage-text);
  background: var(--homepage-surface-soft);
  font-size: 0.9em;
  font-weight: 700;
  text-decoration: none;
}

.homepage-refresh .hero-actions a:hover {
  border-color: var(--homepage-blue);
  color: var(--homepage-link);
}

.homepage-refresh .focus-grid,
.homepage-refresh .project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85em;
}

.homepage-refresh .focus-card,
.homepage-refresh .project-card {
  padding: 1em;
}

.homepage-refresh .focus-card {
  border-left-width: 4px;
}

.homepage-refresh .focus-card p,
.homepage-refresh .project-card p {
  margin-bottom: 0;
}

.homepage-refresh .focus-card-blue {
  border-left-color: var(--homepage-blue);
}

.homepage-refresh .focus-card-green {
  border-left-color: var(--homepage-green);
}

.homepage-refresh .focus-card-amber {
  border-left-color: var(--homepage-amber);
}

.homepage-refresh .focus-card-indigo {
  border-left-color: var(--homepage-indigo);
}

.homepage-refresh .project-card {
  position: relative;
}

.homepage-refresh .project-card h3 {
  padding-right: 5.5em;
}

.homepage-refresh .project-badge {
  position: absolute;
  top: 0.9em;
  right: 0.9em;
  max-width: 7.5em;
  padding: 0.25em 0.5em;
  border-radius: 5px;
  color: #ffffff;
  background: var(--homepage-indigo);
  font-size: 0.72em;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
}

.homepage-refresh .writing-list,
.homepage-refresh .contact-panel,
.homepage-refresh .english-summary {
  padding: 1em 1.1em;
}

.homepage-refresh .writing-list {
  border-left: 4px solid var(--homepage-green);
  background: var(--homepage-surface-soft);
}

.homepage-refresh .writing-list ul,
.homepage-refresh .contact-panel ul {
  margin-bottom: 0;
}

.homepage-refresh .contact-panel {
  border-left: 4px solid var(--homepage-blue);
}

.homepage-refresh .english-summary {
  border-left: 4px solid var(--homepage-indigo);
}

$homepage-scroll-offset: 2em;
.homepage-refresh .anchor:before {
  content: "";
  display: block;
  position: relative;
  width: 0;
  height: $homepage-scroll-offset;
  margin-top: -$homepage-scroll-offset;
}

@include breakpoint($medium) {
  .homepage-refresh .profile-hero {
    grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  }
}

@media (max-width: 760px) {
  .homepage-refresh .profile-hero,
  .homepage-refresh .focus-grid,
  .homepage-refresh .project-grid {
    grid-template-columns: 1fr;
  }

  .homepage-refresh h1 {
    font-size: 1.6em;
  }

  .homepage-refresh .profile-card,
  .homepage-refresh .profile-intro,
  .homepage-refresh .focus-card,
  .homepage-refresh .project-card,
  .homepage-refresh .writing-list,
  .homepage-refresh .contact-panel,
  .homepage-refresh .english-summary {
    padding: 0.9em;
  }

  .homepage-refresh .project-card h3 {
    padding-right: 0;
  }

  .homepage-refresh .project-badge {
    position: static;
    display: inline-block;
    margin-bottom: 0.65em;
  }
}
```

- [ ] **Step 2: Run homepage verification**

Run:

```bash
scripts/verify_homepage_refresh.sh
```

Expected: PASS with no output.

- [ ] **Step 3: Run Sass/whitespace diff check**

Run:

```bash
git diff --check
```

Expected: PASS with no output.

- [ ] **Step 4: Commit the homepage styles**

Run:

```bash
git add _sass/layout/_homepage_refresh.scss
git -c commit.gpgsign=false commit -m "style: polish chinese profile homepage"
```

## Task 4: Build and Visual Verification

**Files:**
- No planned source edits unless verification exposes a concrete issue.

- [ ] **Step 1: Run the Jekyll build**

Run:

```bash
bundle exec jekyll build
```

Expected: PASS. The output should end with a successful site generation message.

- [ ] **Step 2: Start a local Jekyll server**

Run:

```bash
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Expected: The server starts and prints a local URL such as `http://127.0.0.1:4000/`.

- [ ] **Step 3: Inspect the homepage visually**

Open `http://127.0.0.1:4000/` and check:

- Desktop: the profile card and intro are two columns, role tags are readable, and project cards align in a two-column grid.
- Mobile width: the profile card stacks above intro content, focus and project cards become one column, and no button, badge, Chinese text, or English text overflows its container.
- Content: the page reads Chinese-first and includes the compact English summary at the end.

- [ ] **Step 4: Fix visual issues if found**

If a visual issue is found, make only the smallest scoped change in `_pages/about.md` or `_sass/layout/_homepage_refresh.scss`, then rerun:

```bash
scripts/verify_homepage_refresh.sh
git diff --check
bundle exec jekyll build
```

Expected: all commands pass.

- [ ] **Step 5: Commit any verification fix**

If Step 4 changed files, run:

```bash
git add _pages/about.md _sass/layout/_homepage_refresh.scss
git -c commit.gpgsign=false commit -m "fix: adjust chinese profile homepage layout"
```

If Step 4 made no file changes, skip this commit.

## Task 5: Final Status Check

**Files:**
- No planned source edits.

- [ ] **Step 1: Check repository status**

Run:

```bash
git status --short
```

Expected: only unrelated pre-existing user files may remain, such as the KubeCon post, `.DS_Store` files, `.superpowers/`, and `images/kubecon2025/`.

- [ ] **Step 2: Report completed commits and verification**

Report:

- Design commit: `8feceff docs: design chinese profile homepage`
- Implementation commits created by Tasks 1-4.
- Verification command results.
- Local preview URL if the Jekyll server is still running.
