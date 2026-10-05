# Homepage Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the homepage into a reference-style Academic Pages profile with clearer sections, project/community cards, and concise bilingual content.

**Architecture:** Keep the existing Jekyll theme and sidebar intact. Add a small custom Sass partial for homepage cards, import it from `assets/css/main.scss`, and rewrite `_pages/about.md` using Markdown plus supported inline HTML. Add a lightweight shell verification script that checks required homepage structure and style hooks.

**Tech Stack:** Jekyll, kramdown Markdown, Sass, POSIX shell, GitHub Pages-compatible static assets.

---

## File Structure

- Create: `scripts/verify_homepage_refresh.sh`
  - Local verification for required sections, card count, style import, and project-card CSS hooks.
- Create: `_sass/layout/_homepage_refresh.scss`
  - Custom styles for `.homepage-intro`, `.topic-list`, `.paper-box`, `.paper-box-image`, `.paper-box-text`, `.badge`, and responsive behavior.
- Modify: `assets/css/main.scss`
  - Import the new Sass partial after existing page/sidebar imports.
- Modify: `_pages/about.md`
  - Replace loose homepage content with the approved reference-style section hierarchy.

## Task 1: Add Failing Homepage Structure Verification

**Files:**
- Create: `scripts/verify_homepage_refresh.sh`

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify_homepage_refresh.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

about_file="_pages/about.md"
scss_file="_sass/layout/_homepage_refresh.scss"
main_scss="assets/css/main.scss"

required_sections=(
  "## About Me"
  "## Topics"
  "## News"
  "## Projects and Communities"
  "## Contact"
  "## Chinese"
)

for section in "${required_sections[@]}"; do
  if ! grep -Fq "$section" "$about_file"; then
    echo "Missing homepage section: $section" >&2
    exit 1
  fi
done

paper_box_count="$(grep -Fc "class='paper-box'" "$about_file")"
if [ "$paper_box_count" -lt 4 ]; then
  echo "Expected at least 4 paper-box project/community cards, found $paper_box_count" >&2
  exit 1
fi

for text in \
  "Kubernetes" \
  "Aibrix" \
  "Volcano" \
  "descheduler" \
  "scheduler-plugins" \
  "LLM inference"; do
  if ! grep -Fq "$text" "$about_file"; then
    echo "Missing required homepage content: $text" >&2
    exit 1
  fi
done

if ! grep -Fq "homepage_refresh" "$main_scss"; then
  echo "assets/css/main.scss does not import homepage_refresh" >&2
  exit 1
fi

for selector in \
  ".homepage-intro" \
  ".topic-list" \
  ".paper-box" \
  ".paper-box-image" \
  ".paper-box-text" \
  ".badge"; do
  if ! grep -Fq "$selector" "$scss_file"; then
    echo "Missing homepage style selector: $selector" >&2
    exit 1
  fi
done
```

- [ ] **Step 2: Make the script executable**

Run:

```bash
chmod +x scripts/verify_homepage_refresh.sh
```

- [ ] **Step 3: Run verification to confirm RED**

Run:

```bash
scripts/verify_homepage_refresh.sh
```

Expected: FAIL, because `_pages/about.md` does not yet contain the required new sections and `_sass/layout/_homepage_refresh.scss` does not exist.

- [ ] **Step 4: Commit the failing verification script**

Run:

```bash
git add scripts/verify_homepage_refresh.sh
git -c commit.gpgsign=false commit -m "test: add homepage refresh verification"
```

## Task 2: Add Homepage Styling Hooks

**Files:**
- Create: `_sass/layout/_homepage_refresh.scss`
- Modify: `assets/css/main.scss`

- [ ] **Step 1: Add the Sass partial**

Create `_sass/layout/_homepage_refresh.scss`:

```scss
.homepage-intro {
  margin-bottom: 1.5em;
}

.homepage-intro p {
  margin-bottom: 0.75em;
}

.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin: 0 0 1.5em;
  padding: 0;
  list-style: none;
}

.topic-list li {
  border: 1px solid #d9e2ef;
  border-radius: 4px;
  padding: 0.35em 0.65em;
  background: #f7f9fc;
}

.paper-box {
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  border-bottom: 1px solid #efefef;
  padding: 1.75em 0;
}

.paper-box-image {
  display: flex;
  justify-content: center;
  width: 100%;
  order: 2;
}

.paper-box-image > div {
  position: relative;
  width: 100%;
}

.paper-box-image img {
  width: 100%;
  max-width: 100%;
  border: 1px solid #e5e9f0;
  border-radius: 4px;
  object-fit: cover;
}

.paper-box-text {
  max-width: 100%;
  order: 1;
}

.paper-box-text p,
.paper-box-text ul {
  margin-bottom: 0.6em;
}

.badge {
  position: absolute;
  margin-top: 0.5em;
  margin-left: -0.5em;
  padding: 0.2em 0.75em;
  color: #fff;
  background-color: #224b8d;
  font-size: 0.8em;
  line-height: 1.5;
}

$scroll_offset: 2em;
h1:before,
.anchor:before {
  content: "";
  display: block;
  position: relative;
  width: 0;
  height: $scroll_offset;
  margin-top: -$scroll_offset;
}

@include breakpoint($medium) {
  .paper-box-image {
    justify-content: flex-start;
    min-width: 180px;
    max-width: 32%;
    order: 1;
  }

  .paper-box-text {
    max-width: 68%;
    padding-left: 1.5em;
    order: 2;
  }
}
```

- [ ] **Step 2: Import the Sass partial**

Modify `assets/css/main.scss` and add this import after `layout/sidebar`:

```scss
    "layout/sidebar",
    "layout/homepage_refresh",
```

- [ ] **Step 3: Run verification**

Run:

```bash
scripts/verify_homepage_refresh.sh
```

Expected: still FAIL, because `_pages/about.md` has not yet been rewritten with the required sections and cards.

- [ ] **Step 4: Commit styling hooks**

Run:

```bash
git add _sass/layout/_homepage_refresh.scss assets/css/main.scss
git -c commit.gpgsign=false commit -m "style: add homepage card styles"
```

## Task 3: Rewrite Homepage Content

**Files:**
- Modify: `_pages/about.md`

- [ ] **Step 1: Replace homepage content**

Rewrite `_pages/about.md` after the existing frontmatter with the approved structure. Use concise English content first, then compact Chinese content. Include at least four `paper-box` cards for Kubernetes, Aibrix, Volcano, and SIG/reviewer work.

- [ ] **Step 2: Run verification to confirm GREEN**

Run:

```bash
scripts/verify_homepage_refresh.sh
```

Expected: PASS with no output.

- [ ] **Step 3: Commit homepage content**

Run:

```bash
git add _pages/about.md
git -c commit.gpgsign=false commit -m "content: refresh homepage structure"
```

## Task 4: Build and Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 2: Run homepage verification**

Run:

```bash
scripts/verify_homepage_refresh.sh
```

Expected: no output and exit code 0.

- [ ] **Step 3: Run Jekyll build**

Run one of these, using the first available command:

```bash
bundle exec jekyll build
```

or:

```bash
jekyll build
```

Expected: build exits 0 and writes the static site to `_site/`.

- [ ] **Step 4: Inspect changed files**

Run:

```bash
git status --short
git diff -- _pages/about.md _sass/layout/_homepage_refresh.scss assets/css/main.scss scripts/verify_homepage_refresh.sh
```

Expected: only intended homepage refresh files are changed after the task commits, aside from pre-existing unrelated user changes.
