# Homepage Refresh Design

## Goal

Refresh the current Jekyll personal homepage to follow the readable structure of `https://rerankerguo.github.io/` while keeping CYJiang's own cloud native, scheduling, LLM infrastructure, and open source identity.

## Scope

The change will focus on the homepage at `_pages/about.md` and a small Sass addition for reusable project cards. The existing Academic Pages/Minimal Mistakes layout, sidebar profile, navigation, collections, and GitHub Pages build model should remain intact.

The homepage will be reorganized into these sections:

- About Me: concise identity statement and current role.
- Topics: cloud native, Kubernetes scheduling, LLM inference platforms, LLM inference engines, GPU management.
- News: short recent updates or contribution highlights, if current content supports them.
- Projects and Communities: reference-style project cards for key open source involvement.
- Contact: email, GitHub, and WeChat.
- Chinese: compact Chinese version of the profile, with the same hierarchy rather than a duplicated loose list.

## Reference Adaptation

The reference site uses a simple academic sidebar layout, emoji-led section headings, a short biography, topic bullets, news bullets, and `paper-box` project cards with an image on the left and descriptive text on the right. This site should borrow that information rhythm and card pattern, but not copy its personal voice, project list, or visual assumptions.

## Visual Treatment

Keep the current theme mostly unchanged. Add only focused styles:

- `.paper-box` as a responsive horizontal project/community item.
- `.paper-box-image` for a bounded image/logo area.
- `.paper-box-text` for Markdown content.
- `.badge` for small source/type labels such as `GitHub` or `Community`.
- Anchor offset for section links if needed.

Cards should be readable and restrained: light separators, limited shadows, modest radius, and responsive stacking on mobile. Avoid large decorative cards, gradients, and broad theme rewrites.

## Content Design

The English content should be the primary version and should explain why the visitor should trust the profile:

- Current cloud native development role.
- Prior ByteDance cloud platform experience.
- Kubernetes membership.
- Aibrix maintainer role.
- Volcano member role.
- Reviewer/member roles in descheduler, scheduler-plugins, and related communities.

The Chinese content should mirror the same structure in concise language. It should not repeat every English bullet verbatim if that makes the page too long.

## Implementation Notes

Use existing Jekyll Markdown and inline HTML patterns already supported by Academic Pages. Prefer editing `_pages/about.md` and adding Sass through the existing import path in `assets/css/main.scss` or a small `_sass` partial if that better matches local style.

Do not change unrelated pages, generated assets, post content, or existing user changes.

## Verification

After implementation, verify:

- The site builds with the available Jekyll command.
- The homepage renders without Markdown/frontmatter errors.
- Project cards stack correctly on narrow screens.
- Links and image paths are valid.
- `git diff --check` passes.

## Open Decisions

Use the user's selected direction A: close to the reference site's structure. For ambiguous scope, proceed with both English and Chinese homepage content so the page remains coherent.
