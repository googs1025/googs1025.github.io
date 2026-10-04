# Astro Blog Rebuild Design

## Goal

Rebuild CYJiang's personal website as a focused, Chinese-first technical blog inspired by the calm, readable structure of `rudeigerc.dev`. The new site should remove the Academic Pages identity, make technical writing the homepage focus, and retain a concise personal profile and CV.

The rebuild will migrate the site from Jekyll to Astro while continuing to publish static files through GitHub Pages.

## Audience and Product Positioning

Primary visitors are open source collaborators, hiring managers, conference and community peers, and engineers interested in Kubernetes scheduling, cloud native infrastructure, GPU resource management, and LLM inference platforms.

The site should communicate a practical, technical, and community-minded identity. It should feel like an engineer's maintained publication rather than an academic template, marketing landing page, or online resume.

Content is Chinese-first. Established project names and technical terms remain in English where that is clearer. The site will not duplicate every page in two languages.

## Selected Direction

### Information model

Use a blog-first structure:

- `Home`: latest posts in reverse chronological order.
- `Blog`: complete post archive, pagination, categories, and search.
- `About`: profile, technical interests, open source roles, social links, and contact details.
- `CV`: a concise professional profile built only from verified facts already present in the site.
- Post pages: focused long-form reading with a table of contents, code highlighting, and previous/next navigation.

The main navigation is `Home / Blog / About / CV`. Academic Pages demo areas such as Publications, Talks, Teaching, Portfolio, and Guide are not part of the new site.

### Visual direction

Use the approved **Calm Teal** direction:

- A cold white background, neutral gray hierarchy, and a low-saturation teal accent.
- Geist-style sans-serif typography for interface and prose, with a companion monospace font for code and metadata.
- A reading column of approximately 720 pixels, with a slightly wider header container.
- Fine borders, restrained corner radii, generous vertical rhythm, and minimal shadows.
- Article rows organized through whitespace and subtle separators rather than card-heavy grids.
- Near-black dark mode surfaces with clear but restrained contrast.
- Small color and opacity transitions only; reduced-motion preferences disable nonessential motion.

The design borrows the reference site's information density and restraint, not its logo, personal copy, assets, or implementation.

## Technical Architecture

Build the replacement as an Astro static site.

### Core structure

- Astro owns routing, layouts, build output, RSS, and static generation.
- Astro content collections own Markdown post metadata and schema validation.
- Shared layouts provide the header, footer, metadata, theme initialization, and responsive container.
- Focused components provide post lists, formatted dates, category badges, search UI, theme switching, table of contents, and post pagination.
- Site identity and social/contact metadata live in one configuration module rather than being repeated across templates.

The implementation should favor small components with narrow responsibilities. Site content must remain readable without client-side JavaScript. JavaScript is reserved for search, theme switching, and the mobile navigation.

### Content schema

Blog entries use these fields:

- `title`: required post title.
- `description`: required short summary used in lists and metadata.
- `pubDate`: required publication date.
- `updatedDate`: optional last meaningful update date.
- `categories`: optional list of topic labels.
- `draft`: optional boolean, defaulting to false.
- `canonicalURL`: optional external canonical address.
- `legacyURLs`: optional list of prior Jekyll paths that require compatibility pages.

Schema validation must fail the production build when required metadata is absent or malformed.

### Generated output

At build time, published entries are sorted by date and used to generate:

- The latest-post homepage.
- The complete paginated archive.
- Category archive pages.
- Individual post pages.
- RSS output.
- Search index data.
- Compatibility pages for declared legacy URLs.

Search uses a build-time static index and requires no backend service. A visitor without JavaScript can still navigate and read every post through normal links.

## Page Design

### Header

The sticky header contains:

- A compact CYJiang/江振瑜 brand mark and name.
- `Home / Blog / About / CV` desktop navigation.
- Search and theme controls.
- A compact mobile navigation trigger at narrow widths.

The header uses a translucent background and subtle bottom border. It must not occupy enough height to compete with the content.

### Home and Blog

The homepage begins directly with the article list rather than a large hero. Each row shows:

- Title.
- Publication date.
- Categories when present.
- A short description.

Hover treatment is limited to a subtle accent-color change. The Blog page uses the same list language for the complete archive and adds pagination and search entry points. This shared presentation avoids creating two unrelated content systems.

### Post page

Posts use a narrow reading column and semantic headings. The page includes:

- Title, dates, categories, and optional external/canonical indicator.
- Responsive images with meaningful alternative text.
- Syntax-highlighted code with horizontal overflow containment.
- A table of contents for sufficiently structured long posts.
- Previous and next post links.
- A canonical URL and complete social/SEO metadata.

Comments, reactions, animated reading progress, and other engagement widgets are out of scope.

### About

The About page presents a compact profile rather than a second homepage. It includes:

- Jiang Zhenyu / CYJiang / googs1025 identity.
- Cloud native engineering focus.
- Kubernetes scheduling, GPU management, and LLM inference interests.
- Real open source roles and projects, including Kubernetes, Aibrix, Volcano, descheduler, and scheduler-plugins where current content supports them.
- GitHub, email, and other existing verified contact links.

### CV and utility pages

The current Jekyll CV sources contain Academic Pages demonstration data rather than the site owner's resume. The new CV page therefore uses only verified facts already present in the site: identity, current cloud native engineering focus, previous ByteDance cloud platform experience, technical areas, and established open source roles. It must not invent dates, education, employers, titles, or achievements that are not supported by the source content. The 404 page includes the normal header, a concise message, and paths back to Home and Blog.

## Content Policy

Publish only content that the site owner has explicitly approved. Personal biography, verified links, owned profile imagery, and supported professional facts remain in scope. Demo publications, talks, teaching entries, portfolio examples, placeholder images, sample comments, and Academic Pages documentation remain excluded.

Future approved posts use the Astro schema, canonical paths under `/posts/<slug>/`, and optional declared legacy URLs. Compatibility pages may use canonical metadata, an immediate client-side redirect, and a visible fallback link.

### Publication override

The site owner explicitly excluded the article “我的 KubeCon China 2025 参与之旅” and all of its images from published source and generated output. Its post route, dated compatibility route, sitemap references, search entry, RSS item, and public assets must not ship. Authentic originals remain outside this feature worktree in the parent checkout and the verified backup; they are preserved there rather than copied into the public tree.

## Search, Theme, and RSS

### Search

Use a static full-text index generated after the Astro build. The search dialog is keyboard accessible, shows a useful empty state, and links to normal generated pages.

### Theme

Support light, dark, and system-derived initial appearance. Theme initialization should occur before visible page rendering to avoid a prominent flash of the wrong theme. The selected preference persists locally.

### RSS

Generate an RSS feed from published posts with the site title, description, canonical post URLs, dates, and summaries.

## Responsive and Accessible Behavior

- The main reading column uses fluid side padding on small screens.
- Navigation collapses without hiding search or theme controls.
- Long URLs, code blocks, tables, and media cannot force horizontal page overflow.
- All interactive controls are keyboard reachable and have visible focus states.
- Headings remain hierarchical and landmarks remain semantic.
- Text and controls meet readable contrast in both themes.
- Images provide useful alternative text unless they are strictly decorative.
- `prefers-reduced-motion` removes nonessential transitions and animation.

## Error and Empty States

- Missing or invalid required content metadata stops the build with a clear schema error.
- Search with no results shows a concise empty state and preserves the entered query.
- Posts without categories omit category UI entirely.
- An archive with only one page omits pagination controls.
- Unknown routes render the designed 404 page.
- External canonical posts are labeled and opened deliberately without breaking internal navigation.

## Deployment

Use GitHub Actions to install dependencies, validate the project, build the Astro site, generate the search index, and deploy the static output to GitHub Pages.

Deployment configuration must respect the repository's production hostname and base path. Generated canonical URLs, RSS links, sitemap entries, asset URLs, and legacy compatibility pages must be correct for that final origin.

## Verification

Before the rebuild is considered complete:

- Astro type and content checks pass.
- The production site and search index build successfully.
- Approved Markdown content and RSS output render correctly, including the valid zero-post state.
- Internal links and any future declared legacy URLs resolve.
- No Academic Pages demo content appears in generated output.
- Home, Blog, About, CV, post, search, and 404 views are checked at desktop and mobile widths.
- Light and dark themes are checked for each primary template.
- Keyboard navigation, focus visibility, semantic headings, image alternatives, color contrast, reduced motion, and overflow behavior are checked.
- `git diff --check` passes.

## Scope Boundaries

This rebuild includes the static blog architecture, approved content, search, theme support, RSS, responsive behavior, accessibility work, optional legacy post compatibility, and GitHub Pages deployment.

It does not include a CMS, server-side API, analytics migration, comments, multilingual duplication, user accounts, dynamic reactions, or new editorial content beyond the existing authentic material.

## Decisions Confirmed

- Platform: Astro static site.
- Hosting: GitHub Pages.
- Homepage: blog-first article list.
- Navigation: `Home / Blog / About / CV`.
- Language: Chinese-first with natural English technical terminology.
- Visual system: Calm Teal, inspired by the reference site's restraint.
- Core features: dark mode, static full-text search, and RSS.
- Migration: real content only; remove Academic Pages demo content.
