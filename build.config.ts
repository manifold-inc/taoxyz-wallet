import { BuildConfig } from "bun";

const config: BuildConfig = {
  entrypoints: [
    "./src/ui/index.tsx",
    "./src/background/background.ts",
    "./src/content/content.ts",
  ],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  minify: process.env.NODE_ENV === "production",
  sourcemap: "external",
  naming: {
    entry: "[dir]/[name].[ext]",
  },
  external: ["chrome"],
  define: {
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
};

export default config;
