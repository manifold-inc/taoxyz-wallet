import { BuildConfig } from "bun";

const config: BuildConfig = {
  entrypoints: [
    "./src/ui/App.tsx",
    "./src/background/background.ts",
    "./src/content/content.ts",
  ],
  outdir: "./dist",
  target: "browser",
  minify: process.env.NODE_ENV === "production",
  sourcemap: "external",
};

export default config;
