import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import cloudflareAdapter from "@hono/vite-dev-server/cloudflare";

export default defineConfig({
  plugins: [
    devServer({
      adapter: cloudflareAdapter,
      entry: "src/index.ts",
    }),
  ],
  build: {
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      input: "src/index.ts",
      output: {
        entryFileNames: "_worker.js",
        format: "es",
      },
    },
    target: "esnext",
  },
});
