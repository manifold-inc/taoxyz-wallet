import { BuildConfig } from "bun";

const config: BuildConfig = {
  entrypoints: [
    "./src/client/index.tsx",
    "./src/background/background.ts",
    "./src/content/content.ts",
    "./src/content/inject.ts",
  ],
  outdir: "./dists/chrome",
  target: "browser",
  format: "esm",
  minify: process.env.NODE_ENV === "production",
  sourcemap: "external",
  naming: {
    entry: "[dir]/[name].[ext]",
  },
  external: ["chrome"],
};

export default config;
