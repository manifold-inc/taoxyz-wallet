import { copyFile, mkdir, rm } from "node:fs/promises";
import { build } from "bun";
import config from "../build.config";

async function cleanDist() {
  try {
    await rm("./dist", { recursive: true, force: true });
  } catch (error) {
    console.error("Error cleaning dist:", error);
  }
}

async function copyAssets() {
  try {
    await mkdir("./dist", { recursive: true });
    await mkdir("./dist/icons", { recursive: true });

    await copyFile("./public/manifest.json", "./dist/manifest.json");
    await copyFile("./public/icons/tao.png", "./dist/icons/tao.png");
    await copyFile("./public/globals.css", "./dist/globals.css");
    await copyFile("./public/index.html", "./dist/index.html");
  } catch (error) {
    console.error("Error copying assets:", error);
    throw error;
  }
}

async function main() {
  try {
    await cleanDist();
    const result = await build(config);
    if (!result.success) {
      console.error("Build logs:", result.logs);
      throw new Error(`Build failed with errors: ${result.logs}`);
    }

    await copyAssets();
  } catch (error) {
    console.error("Build error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    process.exit(1);
  }
}

main();
