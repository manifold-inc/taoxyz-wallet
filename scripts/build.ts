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
    await mkdir("./dist/public", { recursive: true });
    await copyFile("./manifest.json", "./dist/manifest.json");
    await copyFile("./src/ui/popup.html", "./dist/popup.html");
    await copyFile("./public/tao.png", "./dist/public/tao.png");
    await copyFile("./public/globals.css", "./dist/public/globals.css");
  } catch (error) {
    console.error("Error copying assets:", error);
  }
}

async function main() {
  try {
    await cleanDist();
    const result = await build(config);
    if (!result.success) {
      throw new Error("Build failed");
    }
    await copyAssets();
  } catch (error) {
    console.error("Build error:", error);
    process.exit(1);
  }
}

main();
