import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import node from "@astrojs/node";

export default defineConfig({
  integrations: [vue()],
  adapter: node({ mode: "standalone" }),
  server: { port: 4321 },
  vite: {
    server: {
      proxy: {
        "/api": "http://localhost:3000",
        "/uploads": "http://localhost:3000",
      },
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
