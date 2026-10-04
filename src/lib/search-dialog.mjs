import { createLatestRequest } from "./search.mjs";

export const MAX_RESULTS = 10;

export function createPagefindLoader(importPagefind) {
  let pagefindPromise;

  return () => {
    if (!pagefindPromise) {
      pagefindPromise = importPagefind()
        .then(async (pagefind) => {
          await pagefind.init();
          return pagefind;
        })
        .catch((error) => {
          pagefindPromise = undefined;
          throw error;
        });
    }

    return pagefindPromise;
  };
}

export function setupSearchDialog({
  trigger,
  dialog,
  input,
  status,
  results,
  loadPagefind,
  renderResult,
  renderEmpty,
  setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimer = (timer) => globalThis.clearTimeout(timer),
}) {
  const requests = createLatestRequest();
  let debounceTimer;

  const showSearchError = () => {
    status.textContent = "搜索暂时不可用，请稍后再试";
    results.replaceChildren();
  };

  const runSearch = async (query) => {
    const request = requests.next();

    try {
      const pagefind = await loadPagefind();
      if (!requests.isCurrent(request) || !dialog.open) return;

      const response = await pagefind.search(query);
      if (!requests.isCurrent(request) || !dialog.open) return;

      const totalMatches = response.results.length;
      const matches = await Promise.all(
        response.results.slice(0, MAX_RESULTS).map((result) => result.data()),
      );
      if (
        !requests.isCurrent(request) ||
        input.value.trim() !== query ||
        !dialog.open
      ) {
        return;
      }

      if (matches.length === 0) {
        renderEmpty(results);
        status.textContent = "没有找到相关文章";
        return;
      }

      results.replaceChildren(...matches.map(renderResult));
      status.textContent = totalMatches > matches.length
        ? `找到 ${totalMatches} 篇相关文章，显示前 ${matches.length} 篇`
        : `找到 ${totalMatches} 篇相关文章`;
    } catch {
      if (requests.isCurrent(request) && dialog.open) {
        showSearchError();
      }
    }
  };

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (!dialog.open) dialog.showModal();
    input.focus();

    const query = input.value.trim();
    if (query) {
      status.textContent = "正在搜索…";
      void runSearch(query);
      return;
    }

    status.textContent = "输入关键词开始搜索";
    void loadPagefind().catch(() => {
      if (dialog.open && !input.value.trim()) {
        showSearchError();
      }
    });
  });

  input.addEventListener("input", () => {
    clearTimer(debounceTimer);
    requests.invalidate();
    results.replaceChildren();

    const query = input.value.trim();
    if (!query) {
      status.textContent = "输入关键词开始搜索";
      return;
    }

    status.textContent = "正在搜索…";
    debounceTimer = setTimer(() => {
      void runSearch(query);
    }, 150);
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    clearTimer(debounceTimer);
    requests.invalidate();
    trigger.focus();
  });
}
