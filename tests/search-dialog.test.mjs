import assert from "node:assert/strict";
import test from "node:test";

import {
  createPagefindLoader,
  MAX_RESULTS,
  setupSearchDialog,
} from "../src/lib/search-dialog.mjs";

class FakeElement {
  listeners = new Map();
  textContent = "";
  focusCount = 0;

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, properties = {}) {
    const event = {
      ...properties,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }

  focus() {
    this.focusCount += 1;
  }
}

class FakeDialog extends FakeElement {
  open = false;

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.dispatch("close");
  }
}

class FakeResults extends FakeElement {
  children = [];

  replaceChildren(...children) {
    this.children = children;
  }
}

const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

const harness = ({ loadPagefind }) => {
  const trigger = new FakeElement();
  const dialog = new FakeDialog();
  const input = new FakeElement();
  const status = new FakeElement();
  const results = new FakeResults();
  const timers = [];
  let timerId = 0;

  input.value = "";
  setupSearchDialog({
    trigger,
    dialog,
    input,
    status,
    results,
    loadPagefind,
    renderResult: ({ title }) => title,
    renderEmpty: (target) => target.replaceChildren("empty"),
    setTimer: (callback, delay) => {
      timerId += 1;
      timers.push({ callback, delay, id: timerId, cancelled: false });
      return timerId;
    },
    clearTimer: (id) => {
      const timer = timers.find((candidate) => candidate.id === id);
      if (timer) timer.cancelled = true;
    },
  });

  return { trigger, dialog, input, status, results, timers };
};

test("search dialog initializes once, debounces, renders, and restores focus", async () => {
  let imports = 0;
  let initializations = 0;
  const pagefind = {
    async init() {
      initializations += 1;
    },
    async search(query) {
      return {
        results: [{ data: async () => ({ title: `${query} result` }) }],
      };
    },
  };
  const loadPagefind = createPagefindLoader(async () => {
    imports += 1;
    return pagefind;
  });
  const ui = harness({ loadPagefind });

  const click = ui.trigger.dispatch("click");
  await settle();
  ui.trigger.dispatch("click");
  await settle();
  assert.equal(ui.dialog.open, true);
  assert.equal(click.defaultPrevented, true);
  assert.equal(ui.input.focusCount, 2);
  assert.equal(imports, 1);
  assert.equal(initializations, 1);

  ui.input.value = "KubeCon";
  ui.input.dispatch("input");
  assert.equal(ui.timers.at(-1).delay, 150);
  assert.equal(ui.status.textContent, "正在搜索…");
  ui.timers.at(-1).callback();
  await settle();
  assert.deepEqual(ui.results.children, ["KubeCon result"]);
  assert.equal(ui.status.textContent, "找到 1 篇相关文章");

  const escape = ui.dialog.dispatch("keydown", { key: "Escape" });
  assert.equal(escape.defaultPrevented, true);
  assert.equal(ui.dialog.open, false);
  assert.equal(ui.trigger.focusCount, 1);
});

test("superseded search responses are discarded before result hydration", async () => {
  let resolveOldSearch;
  let oldHydrations = 0;
  const pagefind = {
    async init() {},
    search(query) {
      if (query === "old") {
        return new Promise((resolve) => {
          resolveOldSearch = resolve;
        });
      }
      return Promise.resolve({ results: [] });
    },
  };
  const ui = harness({ loadPagefind: createPagefindLoader(async () => pagefind) });
  ui.trigger.dispatch("click");
  await settle();

  ui.input.value = "old";
  ui.input.dispatch("input");
  ui.timers.at(-1).callback();
  await settle();
  ui.input.value = "new";
  ui.input.dispatch("input");
  resolveOldSearch({
    results: [
      {
        async data() {
          oldHydrations += 1;
          return { title: "stale" };
        },
      },
    ],
  });
  await settle();

  assert.equal(oldHydrations, 0);
  assert.deepEqual(ui.results.children, []);
});

test("search dialog hydrates and renders at most MAX_RESULTS", async () => {
  let hydrations = 0;
  const total = MAX_RESULTS + 5;
  const pagefind = {
    async init() {},
    async search() {
      return {
        results: Array.from({ length: total }, (_, index) => ({
          async data() {
            hydrations += 1;
            return { title: `result ${index}` };
          },
        })),
      };
    },
  };
  const ui = harness({ loadPagefind: createPagefindLoader(async () => pagefind) });
  ui.trigger.dispatch("click");
  await settle();
  ui.input.value = "many";
  ui.input.dispatch("input");
  ui.timers.at(-1).callback();
  await settle();

  assert.equal(hydrations, MAX_RESULTS);
  assert.equal(ui.results.children.length, MAX_RESULTS);
  assert.equal(
    ui.status.textContent,
    `找到 ${total} 篇相关文章，显示前 ${MAX_RESULTS} 篇`,
  );
});

test("cancelled debounce callbacks never search superseded queries", async () => {
  const searched = [];
  const pagefind = {
    async init() {},
    async search(query) {
      searched.push(query);
      return { results: [] };
    },
  };
  const ui = harness({ loadPagefind: createPagefindLoader(async () => pagefind) });
  ui.trigger.dispatch("click");
  await settle();

  ui.input.value = "first";
  ui.input.dispatch("input");
  ui.input.value = "second";
  ui.input.dispatch("input");
  for (const timer of ui.timers.filter(({ cancelled }) => !cancelled)) {
    timer.callback();
  }
  await settle();

  assert.deepEqual(searched, ["second"]);
});

test("search dialog ignores stale responses and reports empty and failed searches", async () => {
  const pending = new Map();
  const pagefind = {
    async init() {},
    search(query) {
      return new Promise((resolve, reject) => pending.set(query, { resolve, reject }));
    },
  };
  const ui = harness({ loadPagefind: createPagefindLoader(async () => pagefind) });
  ui.trigger.dispatch("click");
  await settle();

  ui.input.value = "old";
  ui.input.dispatch("input");
  ui.timers.at(-1).callback();
  await settle();
  ui.input.value = "new";
  ui.input.dispatch("input");
  ui.timers.at(-1).callback();
  await settle();

  pending.get("new").resolve({
    results: [{ data: async () => ({ title: "new result" }) }],
  });
  await settle();
  pending.get("old").resolve({
    results: [{ data: async () => ({ title: "old result" }) }],
  });
  await settle();
  assert.deepEqual(ui.results.children, ["new result"]);

  ui.input.value = "empty";
  ui.input.dispatch("input");
  ui.timers.at(-1).callback();
  await settle();
  pending.get("empty").resolve({ results: [] });
  await settle();
  assert.deepEqual(ui.results.children, ["empty"]);
  assert.equal(ui.status.textContent, "没有找到相关文章");

  ui.input.value = "failure";
  ui.input.dispatch("input");
  ui.timers.at(-1).callback();
  await settle();
  pending.get("failure").reject(new Error("offline"));
  await settle();
  assert.deepEqual(ui.results.children, []);
  assert.equal(ui.status.textContent, "搜索暂时不可用，请稍后再试");
});
