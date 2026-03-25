import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const sourcePath = path.join(repoRoot, 'tmp', 'docs', 'AI_RISK_SYSTEM_DIAGRAMS.md');
const outputDir = path.join(repoRoot, 'tmp', 'docs', 'rendered-diagrams');

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function extractDiagrams(markdown) {
  const lines = markdown.split('\n');
  const diagrams = [];
  let currentHeading = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = line.match(/^##\s+\d+\.\s+(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim();
      continue;
    }

    if (line.trim() === '```mermaid') {
      const mermaidLines = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== '```') {
        mermaidLines.push(lines[index]);
        index += 1;
      }

      if (currentHeading) {
        diagrams.push({
          title: currentHeading,
          slug: slugify(currentHeading),
          mermaid: mermaidLines.join('\n'),
        });
      }
    }
  }

  return diagrams;
}

function renderHtml(diagram) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${diagram.title}</title>
    <style>
      :root {
        color-scheme: dark;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        padding: 32px;
        background:
          radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 30%),
          radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 32%),
          linear-gradient(180deg, #050816 0%, #0f172a 100%);
        color: #e2e8f0;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .frame {
        max-width: 1680px;
        margin: 0 auto;
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 32px;
        background: rgba(15, 23, 42, 0.78);
        box-shadow: 0 32px 90px rgba(2, 6, 23, 0.55);
        overflow: hidden;
      }
      header {
        padding: 24px 28px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        background: rgba(2, 6, 23, 0.38);
      }
      header .eyebrow {
        color: #38bdf8;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }
      header h1 {
        margin: 10px 0 0;
        font-size: 32px;
        line-height: 1.05;
        font-style: italic;
        text-transform: uppercase;
      }
      main {
        padding: 28px;
      }
      .mermaid {
        min-height: 300px;
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <header>
        <div class="eyebrow">Captiv8 AI Risk System</div>
        <h1>${diagram.title}</h1>
      </header>
      <main>
        <pre class="mermaid">${escapeHtml(diagram.mermaid)}</pre>
      </main>
    </div>
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: {
          curve: 'basis',
          htmlLabels: true,
          useMaxWidth: true
        },
        sequence: {
          useMaxWidth: true
        },
        er: {
          useMaxWidth: true
        }
      });

      await mermaid.run({
        querySelector: '.mermaid'
      });

      document.body.dataset.rendered = 'true';
    </script>
  </body>
</html>`;
}

async function main() {
  const markdown = await fs.readFile(sourcePath, 'utf8');
  const diagrams = extractDiagrams(markdown);
  await fs.mkdir(outputDir, { recursive: true });

  const manifest = [];
  for (const diagram of diagrams) {
    const htmlPath = path.join(outputDir, `${diagram.slug}.html`);
    await fs.writeFile(htmlPath, renderHtml(diagram), 'utf8');
    manifest.push({
      title: diagram.title,
      slug: diagram.slug,
      htmlPath,
    });
  }

  const manifestPath = path.join(outputDir, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(JSON.stringify({ count: manifest.length, manifestPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
