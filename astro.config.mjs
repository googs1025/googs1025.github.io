import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const SITEMAP_EXCLUDED_PATHS = new Set([
  "/posts/2025/06/14/kubecon-2025-experience/",
]);

export default defineConfig({
  site: "https://googs1025.github.io",
  integrations: [
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDED_PATHS.has(new URL(page).pathname),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },
});
