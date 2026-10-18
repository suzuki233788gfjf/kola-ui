import path from "node:path";
import type { NextConfig } from "next";

// Racine du dépôt : le site importe les composants React de packages/kola-react.
const root = path.join(__dirname, "..", "..");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: root,
  turbopack: {
    root,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
