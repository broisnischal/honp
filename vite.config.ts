import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import cloudflareAdapter from "@hono/vite-dev-server/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
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
