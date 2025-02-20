import { BuildConfig } from "bun";
import path from "path";

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
    entry: "[dir]/[name].js",
  },
  plugins: [
    {
      name: "css",
      setup(build) {
        build.onResolve({ filter: /\.css$/ }, (args) => {
          const resolvedPath = path.resolve(
            path.dirname(args.importer), 
            args.path
          );
          return { 
            path: resolvedPath,
            namespace: "css"
          };
        });
        
        build.onLoad({ filter: /\.css$/, namespace: "css" }, async (args) => {
          try {
            const contents = await Bun.file(args.path).text();
            return {
              loader: "css",
              contents,
            };
          } catch (error) {
            console.error(`Failed to load CSS file: ${args.path}`, error);
            throw error;
          }
        });
      },
    },
  ],
};

export default config;
