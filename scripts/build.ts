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
    // Create all necessary directories
    await mkdir("./dist", { recursive: true });
    await mkdir("./dist/icons", { recursive: true });
    
    // Copy manifest and other assets
    await copyFile("./public/manifest.json", "./dist/manifest.json");
    await copyFile("./public/popup.html", "./dist/popup.html");
    await copyFile("./public/icons/tao.png", "./dist/icons/tao.png");
    await copyFile("./src/ui/globals.css", "./dist/globals.css");

    // No need to move files since they're already in the right place
    // thanks to the build config naming setting
  } catch (error) {
    console.error("Error copying assets:", error);
    throw error; // Rethrow to see the full error chain
  }
}

async function main() {
  try {
    await cleanDist();
    const result = await build(config);
    
    // Log more details about the build result
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
