import { build } from 'bun';
import { exec } from 'child_process';
import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { promisify } from 'util';

import config from '../build.config';

const execAsync = promisify(exec);

async function buildTailwind() {
  try {
    await execAsync(
      'bunx tailwindcss -i ./public/globals.css -o ./dists/chrome/globals.css --minify'
    );
    await copyFile('./dists/chrome/globals.css', './dists/firefox/globals.css');
  } catch (error) {
    console.error('Error building Tailwind CSS:', error);
    throw error;
  }
}

async function cleanDist() {
  try {
    await rm('./dists', { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning dist:', error);
  }
}

async function copyAssets() {
  try {
    await mkdir('./dists', { recursive: true });
    await mkdir('./dists/firefox/icons', { recursive: true });
    await mkdir('./dists/chrome/icons', { recursive: true });
    await mkdir('./dists/firefox/fonts', { recursive: true });
    await mkdir('./dists/chrome/fonts', { recursive: true });

    await copyFile('./public/chrome_manifest.json', './dists/chrome/manifest.json');
    await copyFile('./public/firefox_manifest.json', './dists/firefox/manifest.json');

    await cp('./public/icons', './dists/chrome/icons', { recursive: true });
    await cp('./public/icons', './dists/firefox/icons', { recursive: true });
    await cp('./public/fonts', './dists/chrome/fonts', { recursive: true });
    await cp('./public/fonts', './dists/firefox/fonts', { recursive: true });

    await copyFile('./public/index.html', './dists/chrome/index.html');
    await copyFile('./public/index.html', './dists/firefox/index.html');
  } catch (error) {
    console.error('Error copying assets:', error);
    throw error;
  }
}

async function main() {
  try {
    await cleanDist();
    const result = await build(config);
    await cp('./dists/chrome', './dists/firefox', { recursive: true });
    if (!result.success) {
      console.error('Build logs:', result.logs);
      throw new Error(`Build failed with errors: ${result.logs}`);
    }

    await buildTailwind();
    await copyAssets();
  } catch (error) {
    console.error('Build error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

main();
