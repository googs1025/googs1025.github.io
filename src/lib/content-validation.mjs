const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const CATEGORY_PATH_FORBIDDEN_CHARACTERS = /[/%?#\\\u0000-\u001f\u007f]/;
const HTTP_URL = /^https?:\/\//i;
const LEGACY_PATH_FORBIDDEN_CHARACTERS = /[?#\\\u0000-\u001f\u007f]/;
const ENCODED_PATH_SEPARATOR = /%(?:2f|5c)/i;
const MAX_LEGACY_PATH_DECODINGS = 4;
const POST_ROUTE_FORBIDDEN_CHARACTERS = /[/?#%\\\s\u0000-\u001f\u007f]/;

export function normalizeRawPathname(value) {
  return value.normalize("NFC");
}

export function decodeLegacyPathname(value) {
  let normalized = value;

  for (let pass = 0; pass < MAX_LEGACY_PATH_DECODINGS; pass += 1) {
    const decoded = decodeURIComponent(normalized);
    if (decoded === normalized) break;
    normalized = decoded;
  }

  return normalizeRawPathname(normalized);
}

export function isCategoryLabel(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    value === value.normalize("NFC") &&
    value !== "." &&
    value !== ".." &&
    !CATEGORY_PATH_FORBIDDEN_CHARACTERS.test(value)
  );
}

export function isPostRouteSegment(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.normalize("NFC") &&
    value !== "." &&
    value !== ".." &&
    !POST_ROUTE_FORBIDDEN_CHARACTERS.test(value)
  );
}

function isSafeLegacyPathForm(value) {
  return (
    value.startsWith("/") &&
    !value.includes("//") &&
    !LEGACY_PATH_FORBIDDEN_CHARACTERS.test(value) &&
    value
      .split("/")
      .every((segment) => segment !== "." && segment !== "..")
  );
}

export function isHttpUrl(value) {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    CONTROL_CHARACTERS.test(value) ||
    !HTTP_URL.test(value)
  ) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isLegacyPath(value) {
  if (typeof value !== "string") {
    return false;
  }

  let decodedPath = value;

  for (let pass = 0; pass < MAX_LEGACY_PATH_DECODINGS; pass += 1) {
    if (
      !isSafeLegacyPathForm(decodedPath) ||
      ENCODED_PATH_SEPARATOR.test(decodedPath)
    ) {
      return false;
    }

    try {
      const nextPath = decodeURIComponent(decodedPath);

      if (nextPath === decodedPath) {
        return true;
      }

      decodedPath = nextPath;
    } catch {
      return false;
    }
  }

  return false;
}

export function isUpdatedDateOnOrAfterPubDate(pubDate, updatedDate) {
  return !updatedDate || updatedDate.getTime() >= pubDate.getTime();
}
