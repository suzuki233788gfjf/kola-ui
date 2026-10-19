import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// La vitrine est servie par le site sous /preview-vue/ (copiée dans apps/web/public/preview-vue).
export default defineConfig({
  base: "/preview-vue/",
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { "@kola": fileURLToPath(new URL("../../packages/kola-vue/src", import.meta.url)) } },
  server: { fs: { allow: ["../.."] } },
  build: { outDir: "../web/public/preview-vue", emptyOutDir: true },
});
