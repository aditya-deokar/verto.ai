#!/usr/bin/env node

/**
 * Before/after visual diff for the MCP App widgets.
 *
 * Renders the same widget region from two builds and composes a labelled
 * side-by-side PNG, so a PR can show what changed on screen rather than
 * describing it. Pairs are written to
 * `docs/mcp-apps/submission-assets/visual-diff/`.
 *
 * The baseline build is whatever is in `--before <dir>`; extract one from git:
 *
 *   mkdir -p /tmp/before
 *   for w in presentation-list deck-preview deck-live theme-studio; do
 *     git show <ref>:src/mcp/apps/generated/$w.html > /tmp/before/$w.html
 *   done
 *   node scripts/mcp-apps/visual-diff.mjs --before /tmp/before
 *
 * Nothing is uploaded anywhere: the pairs are committed alongside the change.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer';

const root = process.cwd();
const afterDir = path.join(root, 'src/mcp/apps/generated');
const outDir = path.join(root, 'docs/mcp-apps/submission-assets/visual-diff');

const beforeArg = process.argv.indexOf('--before');
if (beforeArg === -1 || !process.argv[beforeArg + 1]) {
  console.error('Usage: node scripts/mcp-apps/visual-diff.mjs --before <dir>');
  process.exit(1);
}
const beforeDir = path.resolve(root, process.argv[beforeArg + 1]);

/**
 * Each pair renders one widget with one payload, then clips to `selector`.
 * `scale` enlarges small controls so the glyphs are legible in a PR.
 */
const pairs = [
  {
    id: 'presenter-controls',
    title: 'Presenter navigation and overflow menu',
    note: 'Previous / Next arrows, the grid and fullscreen controls, and the deck menu.',
    widget: 'deck-live',
    payload: () => deckLivePayload(),
    selector: '.live-controls',
    viewport: { width: 1200, height: 900 },
    colorScheme: 'dark',
    scale: 2,
  },
  {
    id: 'presenter-slide-markup',
    title: 'Inline markup in slide text',
    note: 'Model-written <em> in the body copy, as rendered on the slide.',
    widget: 'deck-live',
    payload: () => deckLivePayload(),
    selector: '.vt-canvas',
    viewport: { width: 1200, height: 900 },
    colorScheme: 'dark',
    scale: 1,
  },
  {
    id: 'deck-filmstrip-reorder',
    title: 'Slide reorder controls',
    note: 'The up/down control column beside each slide row.',
    widget: 'deck-preview',
    payload: () => deckPreviewPayload(),
    selector: '.filmstrip-grid',
    viewport: { width: 1200, height: 1100 },
    colorScheme: 'dark',
    scale: 2,
    clipHeight: 260,
  },
  {
    id: 'deck-action-panel',
    title: 'Deck action panel',
    note: 'The six primary deck actions.',
    widget: 'deck-preview',
    payload: () => deckPreviewPayload(),
    selector: '.action-panel',
    viewport: { width: 1200, height: 1100 },
    colorScheme: 'dark',
    scale: 2,
  },
  {
    id: 'workspace-row-actions',
    title: 'Workspace row actions and pager',
    note: 'Per-row actions plus the Load more control the cursor now feeds.',
    widget: 'presentation-list',
    payload: () => listPayload(),
    selector: '.presentation-panel',
    viewport: { width: 1280, height: 1000 },
    colorScheme: 'light',
    scale: 1.6,
    clipHeight: 420,
  },
];

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', ...(process.env.AGENT_BROWSER_ARGS || '').split(' ').filter(Boolean)],
  protocolTimeout: 120_000,
});

const written = [];

try {
  for (const pair of pairs) {
    const before = await shoot(browser, beforeDir, pair);
    const after = await shoot(browser, afterDir, pair);
    const file = path.join(outDir, `${pair.id}.png`);
    await compose(browser, pair, before, after, file);
    written.push(path.relative(root, file).replace(/\\/g, '/'));
    console.log(`[PASS] ${pair.title} -> ${path.relative(root, file).replace(/\\/g, '/')}`);
  }
} finally {
  await browser.close();
}

console.log(`\n${written.length} before/after pair(s) written to ${path.relative(root, outDir).replace(/\\/g, '/')}.`);

/* ------------------------------------------------------------------ */

/** Screenshots one clipped region and returns it as a data URI. */
async function shoot(browser, dir, pair) {
  const html = await readFile(path.join(dir, `${pair.widget}.html`), 'utf8');
  const page = await browser.newPage();

  try {
    await page.setViewport({
      ...pair.viewport,
      deviceScaleFactor: Math.max(2, pair.scale || 1),
    });
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: pair.colorScheme },
    ]);
    await page.setContent(injectPayload(html, pair.payload()), {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector(pair.selector, { timeout: 10_000 });
    await new Promise((resolve) => setTimeout(resolve, 400));

    const element = await page.$(pair.selector);
    const box = await element.boundingBox();
    const clip = {
      x: Math.max(0, box.x - 8),
      y: Math.max(0, box.y - 8),
      width: Math.min(box.width + 16, pair.viewport.width),
      height: Math.min(pair.clipHeight || box.height + 16, box.height + 16),
    };

    const buffer = await page.screenshot({ clip, encoding: 'base64' });
    return `data:image/png;base64,${buffer}`;
  } finally {
    await page.close();
  }
}

/** Lays the two shots out side by side with labels and screenshots that. */
async function compose(browser, pair, before, after, file) {
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1400, height: 400, deviceScaleFactor: 1 });
    await page.setContent(comparisonPage(pair, before, after), {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('.vd-sheet');
    await new Promise((resolve) => setTimeout(resolve, 200));

    const sheet = await page.$('.vd-sheet');
    await sheet.screenshot({ path: file });
  } finally {
    await page.close();
  }
}

function comparisonPage(pair, before, after) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #ffffff; font-family: -apple-system, "Segoe UI", system-ui, sans-serif; }
  .vd-sheet { display: inline-block; padding: 24px; background: #ffffff; }
  .vd-title { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: #111827; }
  .vd-note { margin: 0 0 18px; font-size: 13px; color: #6b7280; }
  .vd-cols { display: flex; gap: 20px; align-items: flex-start; }
  .vd-col { flex: 1 1 0; min-width: 0; }
  .vd-tag {
    display: inline-block; margin-bottom: 8px; padding: 3px 10px;
    border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.02em;
  }
  .vd-before .vd-tag { background: #fee2e2; color: #991b1b; }
  .vd-after .vd-tag { background: #dcfce7; color: #166534; }
  .vd-frame {
    border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;
    background: #f9fafb; line-height: 0;
  }
  .vd-frame img { width: 100%; height: auto; display: block; }
</style></head>
<body>
  <div class="vd-sheet">
    <p class="vd-title">${escapeHtml(pair.title)}</p>
    <p class="vd-note">${escapeHtml(pair.note)}</p>
    <div class="vd-cols">
      <div class="vd-col vd-before">
        <span class="vd-tag">BEFORE</span>
        <div class="vd-frame"><img src="${before}" alt="before" /></div>
      </div>
      <div class="vd-col vd-after">
        <span class="vd-tag">AFTER</span>
        <div class="vd-frame"><img src="${after}" alt="after" /></div>
      </div>
    </div>
  </div>
</body></html>`;
}

/** Same standalone hook phase9h uses to seed a widget without a host. */
function injectPayload(html, payload) {
  const safe = JSON.stringify(payload).replace(/</g, '\\u003c');
  return html.replace(
    '<body>',
    `<body>\n<script>window.__VERTO_MCP_PAYLOAD__=${safe};</script>`
  );
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

function richSlides() {
  return [
    {
      id: 's1',
      slideName: 'Quarterly growth review',
      type: 'title',
      slideOrder: 0,
      content: [
        { id: 'c1', type: 'title', content: 'Quarterly growth review' },
        { id: 'c2', type: 'divider', content: '' },
        { id: 'c3', type: 'heading2', content: 'Market momentum' },
        {
          id: 'c4',
          type: 'paragraph',
          content:
            'Expansion in <em>enterprise</em> accounts drove the majority of new '
            + 'bookings this quarter & retention stayed above target.',
        },
      ],
    },
    {
      id: 's2',
      slideName: 'Problem',
      type: 'title',
      slideOrder: 1,
      content: [
        { id: 'c5', type: 'heading1', content: 'Problem' },
        {
          id: 'c6',
          type: 'paragraph',
          content: 'Students need immediate help, but human tutoring is expensive to scale.',
        },
      ],
    },
    {
      id: 's3',
      slideName: 'Product',
      type: 'title',
      slideOrder: 2,
      content: [
        { id: 'c7', type: 'heading1', content: 'Product' },
        {
          id: 'c8',
          type: 'paragraph',
          content: 'Personalized guidance, generated practice, and teacher-ready diagnostics.',
        },
      ],
    },
  ];
}

function deckLivePayload() {
  return {
    widget: {
      widget: 'deck_live',
      version: 2,
      links: {
        editorUrl: 'https://example.invalid/presentation/deck_demo_123',
        presentUrl: 'https://example.invalid/present/deck_demo_123',
        shareUrl: null,
      },
      presentation: {
        id: 'deck_demo_123',
        title: 'AI tutoring investor pitch deck',
        themeName: 'Dark Elegance',
        slideCount: 3,
      },
      slides: richSlides(),
      actions: { canRefresh: true },
    },
  };
}

function deckPreviewPayload() {
  return {
    widget: {
      widget: 'deck_preview',
      version: 2,
      links: {
        editorUrl: 'https://example.invalid/presentation/deck_demo_123',
        shareUrl: null,
      },
      presentation: {
        id: 'deck_demo_123',
        title: 'AI tutoring investor pitch deck',
        themeName: 'Dark Elegance',
        slideCount: 3,
        updatedAt: '2026-06-18T10:00:00.000Z',
        isPublished: false,
        shareUrl: '',
        openUrl: 'https://example.invalid/presentation/deck_demo_123',
      },
      slides: richSlides(),
      actions: {
        canUpdateSlides: true,
        canPublish: true,
        canRefresh: true,
        canUpdateTheme: true,
      },
    },
  };
}

function listPayload() {
  const rows = [
    ['deck_1', 'AI tutoring investor pitch deck', 'Dark Elegance', 7, false],
    ['deck_2', 'Series A metrics review', 'Arctic Aurora', 12, true],
    ['deck_3', 'Onboarding walkthrough', 'Sunset Glow', 9, false],
  ];

  return {
    widget: {
      widget: 'presentation_list',
      version: 2,
      links: { editorUrl: 'https://example.invalid/presentation/deck_1' },
      presentations: rows.map(([id, title, themeName, slideCount, isPublished]) => ({
        id,
        title,
        themeName,
        slideCount,
        updatedAt: '2026-06-18T10:00:00.000Z',
        isPublished,
        isDeleted: false,
        shareUrl: isPublished ? 'https://example.invalid/share/' + id : '',
        openUrl: 'https://example.invalid/presentation/' + id,
      })),
      pagination: {
        nextCursor: 'cursor_page_2',
        hasMore: true,
        totalCount: 44,
        pageSize: 20,
      },
      summary: {
        shownCount: rows.length,
        totalCount: 44,
        publishedCount: 1,
        draftCount: 2,
        deletedCount: 0,
      },
      actions: { canRefresh: true, canOpenLatest: true, canPreviewLatest: true },
    },
  };
}
