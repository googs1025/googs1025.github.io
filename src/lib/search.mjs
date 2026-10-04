const SEARCH_ORIGIN = "https://search.invalid";
const FALLBACK_HREF = "/blog/";

const nonEmptyText = (value, fallback) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export function safeSearchHref(value) {
  if (typeof value !== "string") {
    return FALLBACK_HREF;
  }

  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return FALLBACK_HREF;
  }

  try {
    const url = new URL(candidate, SEARCH_ORIGIN);
    return url.origin === SEARCH_ORIGIN
      ? `${url.pathname}${url.search}${url.hash}`
      : FALLBACK_HREF;
  } catch {
    return FALLBACK_HREF;
  }
}

export function searchResultView(result = {}) {
  const meta = result.meta ?? {};

  return {
    href: safeSearchHref(result.url),
    title: nonEmptyText(meta.title, "未命名文章"),
    description: nonEmptyText(
      meta.description,
      nonEmptyText(result.plain_excerpt, nonEmptyText(result.excerpt, "暂无摘要")),
    ),
  };
}

export function createLatestRequest() {
  let latest = 0;

  return {
    next() {
      latest += 1;
      return latest;
    },
    isCurrent(request) {
      return request === latest;
    },
    invalidate() {
      latest += 1;
    },
  };
}
