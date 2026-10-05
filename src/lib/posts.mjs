import {
  isCategoryLabel,
  isLegacyPath,
  normalizePathname,
} from "./content-validation.mjs";

export const PAGE_SIZE = 10;

export function categoryPath(category) {
  if (!isCategoryLabel(category)) {
    throw new TypeError("category must be a safe path segment");
  }

  return `/categories/${encodeURIComponent(category)}/`;
}

function normalizedRoutePath(path) {
  const normalized = normalizePathname(path);

  return normalized === "/" ? normalized : normalized.replace(/\/+$/, "");
}

/**
 * @param {any[]} posts
 * @param {{ publicFiles?: string[] }} [options]
 */
export function legacyRedirectPaths(posts, { publicFiles = [] } = {}) {
  const published = publishedPosts(posts);
  const localPosts = published.filter(({ data }) => !data.canonicalURL);
  const occupied = new Set(
    [
      "/",
      "/about/",
      "/blog/",
      "/cv/",
      "/404.html",
      "/favicon.svg",
      "/rss.xml",
      "/sitemap-index.xml",
      "/sitemap-0.xml",
      ...publicFiles.map((path) => `/${path}`),
      ...archiveDynamicPages(published).map(
        ({ currentPage }) => `/blog/${currentPage}/`,
      ),
      ...published.flatMap(({ data }) =>
        (data.categories ?? []).map(categoryPath),
      ),
      ...localPosts.map(({ id }) => `/posts/${id}/`),
    ].map(normalizedRoutePath),
  );
  const routes = [];
  const reservedPrefixes = ["/pagefind", "/_astro"];

  for (const post of localPosts) {
    for (const legacyURL of post.data.legacyURLs ?? []) {
      if (!isLegacyPath(legacyURL)) {
        throw new TypeError(`Invalid legacy URL: "${legacyURL}"`);
      }

      const normalized = normalizedRoutePath(legacyURL);
      if (
        occupied.has(normalized) ||
        reservedPrefixes.some(
          (prefix) =>
            normalized === prefix || normalized.startsWith(`${prefix}/`),
        )
      ) {
        throw new Error(`Legacy URL collision: "${legacyURL}"`);
      }
      occupied.add(normalized);

      routes.push({
        params: { legacy: normalized.slice(1) },
        props: {
          title: post.data.title,
          target: `/posts/${post.id}/`,
        },
      });
    }
  }

  return routes;
}

export function publishedPosts(posts) {
  return posts
    .filter(({ data }) => !data.draft)
    .sort((left, right) => {
      const dateOrder = right.data.pubDate - left.data.pubDate;

      if (dateOrder !== 0) {
        return dateOrder;
      }

      return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
    });
}

export function paginatePosts(posts, currentPage, pageSize) {
  if (!Number.isInteger(currentPage) || currentPage < 1) {
    throw new RangeError("currentPage must be a positive integer");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("pageSize must be a positive integer");
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));

  if (currentPage > totalPages) {
    throw new RangeError("currentPage must not exceed totalPages");
  }

  const start = (currentPage - 1) * pageSize;

  return {
    items: posts.slice(start, start + pageSize),
    currentPage,
    totalPages,
  };
}

export function archivePageHref(page) {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("page must be a positive integer");
  }

  return page === 1 ? "/blog/" : `/blog/${page}/`;
}

export function archivePage(posts, currentPage) {
  const page = paginatePosts(posts, currentPage, PAGE_SIZE);

  return {
    ...page,
    showPagination: page.totalPages > 1,
    previousHref:
      currentPage > 1 ? archivePageHref(currentPage - 1) : undefined,
    nextHref:
      currentPage < page.totalPages
        ? archivePageHref(currentPage + 1)
        : undefined,
  };
}

export function archiveDynamicPages(posts) {
  const { totalPages } = archivePage(posts, 1);

  return Array.from({ length: totalPages - 1 }, (_, index) =>
    archivePage(posts, index + 2),
  );
}

/**
 * Map adjacent articles from a newest-first list. "previous" is the older
 * article and "next" is the newer article, matching chronological reading.
 */
export function adjacentPosts(posts, currentIndex) {
  if (
    !Number.isInteger(currentIndex) ||
    currentIndex < 0 ||
    currentIndex >= posts.length
  ) {
    throw new RangeError("currentIndex must identify a post");
  }

  return {
    previous: posts[currentIndex + 1],
    next: posts[currentIndex - 1],
  };
}

function utcCalendarDate(date) {
  return date.toISOString().slice(0, 10);
}

export function hasMeaningfulUpdate(pubDate, updatedDate) {
  return Boolean(
    updatedDate && utcCalendarDate(updatedDate) > utcCalendarDate(pubDate),
  );
}

export function postListItem(post) {
  const isExternal = Boolean(post.data.canonicalURL);
  const categories = post.data.categories.map((category) => ({
    name: category,
    url: categoryPath(category),
  }));

  return {
    title: post.data.title,
    description: post.data.description,
    url: post.data.canonicalURL ?? `/posts/${post.id}/`,
    isExternal,
    target: isExternal ? "_blank" : undefined,
    rel: isExternal ? "noreferrer" : undefined,
    linkAriaLabel: isExternal
      ? `${post.data.title}（外部链接，将在新标签页打开）`
      : undefined,
    externalText: isExternal ? "External" : undefined,
    machineDate: post.data.pubDate.toISOString(),
    humanDate: post.data.pubDate.toLocaleDateString("zh-CN", {
      dateStyle: "long",
      timeZone: "UTC",
    }),
    hasCategories: categories.length > 0,
    categories,
  };
}
