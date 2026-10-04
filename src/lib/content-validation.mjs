const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const HTTP_URL = /^https?:\/\//i;
const LEGACY_PATH_FORBIDDEN_CHARACTERS = /[?#\\\u0000-\u001f\u007f]/;

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
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    LEGACY_PATH_FORBIDDEN_CHARACTERS.test(value)
  ) {
    return false;
  }

  try {
    const decodedPath = decodeURIComponent(value);

    if (LEGACY_PATH_FORBIDDEN_CHARACTERS.test(decodedPath)) {
      return false;
    }

    return decodedPath
      .split("/")
      .every((segment) => segment !== "." && segment !== "..");
  } catch {
    return false;
  }
}
