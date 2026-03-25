import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'tmp', 'docs', 'rendered-diagrams', 'manifest.json');
const outputDir = path.join(repoRoot, 'tmp', 'screenshots', 'ai-risk-diagrams');

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: {
      width: 1800,
      height: 1400,
    },
    deviceScaleFactor: 2,
  });

  const screenshots = [];

  for (const diagram of manifest) {
    await page.goto(`file://${diagram.htmlPath}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.rendered === 'true', undefined, { timeout: 15000 });
    await page.waitForTimeout(600);

    const frame = page.locator('.frame');
    const box = await frame.boundingBox();
    if (!box) {
      throw new Error(`Failed to determine layout bounds for ${diagram.slug}`);
    }

    const screenshotPath = path.join(outputDir, `${diagram.slug}.png`);
    await page.screenshot({
      path: screenshotPath,
      clip: {
        x: Math.max(0, box.x - 24),
        y: Math.max(0, box.y - 24),
        width: Math.ceil(box.width + 48),
        height: Math.ceil(box.height + 48),
      },
    });

    screenshots.push({
      title: diagram.title,
      slug: diagram.slug,
      screenshotPath,
    });
  }

  await browser.close();
  console.log(JSON.stringify({ count: screenshots.length, outputDir, screenshots }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
