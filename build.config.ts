import { BuildConfig } from "bun";

const config: BuildConfig = {
  entrypoints: [
    "./src/ui/popup.tsx",
    "./src/background/background.ts",
    "./src/content/content.ts",
  ],
  outdir: "./dist",
  target: "browser",
  minify: process.env.NODE_ENV === "production",
  sourcemap: "external",
  naming: {
    entry: "[name].js",
  },
  plugins: [
    {
      name: "css",
      setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
          return {
            loader: "css",
            contents: await Bun.file(args.path).text(),
          };
        });
      },
    },
  ],
};

export default config;
