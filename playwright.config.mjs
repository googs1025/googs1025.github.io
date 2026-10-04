import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "search-dialog.e2e.spec.mjs",
  use: {
    baseURL: "http://127.0.0.1:4321",
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : undefined,
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    env: { ASTRO_PREVIEW_BACKGROUND: "0" },
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
});
