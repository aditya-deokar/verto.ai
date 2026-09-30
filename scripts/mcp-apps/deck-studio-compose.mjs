#!/usr/bin/env node

/**
 * Lays out the screenshots from deck-studio-evidence.mjs as labelled
 * before/after sheets, with the measurements for each state printed under
 * the images, and writes them where the PR can link to them.
 *
 *   node scripts/mcp-apps/deck-studio-compose.mjs --before <dir> --after <dir> --out <dir>
 *
 * Nothing is uploaded: the sheets are committed next to the change, like the
 * pairs in submission-assets/visual-diff.
 */

import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer';

const root = process.cwd();
const beforeDir = path.resolve(root, readArg('--before') || '.artifacts/deck-studio/before');
const afterDir = path.resolve(root, readArg('--after') || '.artifacts/deck-studio/after');
const outDir = path.resolve(root, readArg('--out') || 'docs/mcp-apps/submission-assets/deck-studio');

const before = byId(JSON.parse(await readFile(path.join(beforeDir, 'metrics.json'), 'utf8')));
const after = byId(JSON.parse(await readFile(path.join(afterDir, 'metrics.json'), 'utf8')));

const sheets = [
  {
    id: 'overview-desktop',
    title: 'First screen at 860 px',
    facts: (m) => [
      `Stage and action panel overlap: ${m.stageVsActionsOverlapPx.toLocaleString('en-US')} px²`,
      `Widget height: ${m.documentHeight.toLocaleString('en-US')} px`,
      `Layout tags on screen: ${m.layoutTagsVisible}`,
      `Theme chip: ${m.themeBadge}`,
    ],
  },
  {
    id: 'theme-picker',
    title: 'Change theme, then pick Neon Nights',
    facts: (m) => [
      `Apply button: ${m.applyButtonTop.toLocaleString('en-US')} px from the top (${m.applyButtonOnFirstScreen ? 'on' : 'off'} the first screen)`,
      `Picker covers the stage: ${m.stageVsThemeUiOverlapPx.toLocaleString('en-US')} px²`,
      `Themes listed: ${m.themeCardsShown}`,
    ],
  },
  {
    id: 'overview-mobile',
    title: 'First screen at 390 px',
    facts: (m) => [
      `Widget height: ${m.documentHeight.toLocaleString('en-US')} px`,
      `Horizontal overflow: ${m.horizontalOverflowPx} px`,
      `Layout tags on screen: ${m.layoutTagsVisible}`,
    ],
  },
];

const newStates = [
  { id: 'select-slide', title: 'Thumbnail 4 selected', fact: (m) => `Stage shows slide ${Number(m.selectedThumb) + 1}` },
  { id: 'theme-search', title: 'Search "neon"', fact: (m) => `${m.themeCardsShown} matching themes` },
  { id: 'delete-undo', title: 'Delete confirmed', fact: (m) => `Saved ${m.slidesSent} slides, Undo ${m.undoVisible ? 'shown' : 'missing'}` },
];

await mkdir(outDir, { recursive: true });
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  for (const sheet of sheets) {
    const b = before[sheet.id];
    const a = after[sheet.id];
    const html = page2up(sheet.title, [
      { tag: 'BEFORE', tone: 'before', src: await dataUri(beforeDir, sheet.id), facts: sheet.facts(b.metrics) },
      { tag: 'AFTER', tone: 'after', src: await dataUri(afterDir, sheet.id), facts: sheet.facts(a.metrics) },
    ]);
    await shoot(browser, html, path.join(outDir, `${sheet.id}.png`));
  }

  const panels = [];
  for (const state of newStates) {
    const entry = after[state.id];
    panels.push({ tag: 'NEW', tone: 'after', src: await dataUri(afterDir, state.id), facts: [state.title, state.fact(entry.metrics)] });
  }
  await shoot(browser, page2up('Controls that did not exist before', panels), path.join(outDir, 'new-controls.png'));
} finally {
  await browser.close();
}

console.log(`Wrote ${sheets.length + 1} sheets to ${path.relative(root, outDir).replace(/\\/g, '/')}`);

/* ------------------------------------------------------------------ */

function byId(entries) {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry]));
}

async function dataUri(dir, id) {
  const buffer = await readFile(path.join(dir, `${id}.png`));
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function shoot(browser, html, file) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 2000, height: 600, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    const sheet = await page.$('.sheet');
    await sheet.screenshot({ path: file });
    console.log(`[SHEET] ${path.relative(root, file).replace(/\\/g, '/')}`);
  } finally {
    await page.close();
  }
}

function page2up(title, panels) {
  const cols = panels.map((panel) => `
    <div class="col">
      <span class="tag ${panel.tone}">${panel.tag}</span>
      <div class="frame"><img src="${panel.src}" alt="${escapeHtml(panel.tag)}" /></div>
      <ul>${panel.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>
    </div>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8" /><style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff; font-family: "Segoe UI", system-ui, sans-serif; color: #111827; }
    .sheet { display: inline-block; padding: 24px; background: #fff; }
    h1 { margin: 0 0 16px; font-size: 18px; }
    .cols { display: flex; gap: 20px; align-items: flex-start; }
    .col { width: ${panels.length > 2 ? 560 : 860}px; }
    .tag { display: inline-block; margin-bottom: 8px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .tag.before { background: #fee2e2; color: #991b1b; }
    .tag.after { background: #dcfce7; color: #166534; }
    .frame { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; line-height: 0; }
    .frame img { width: 100%; height: auto; }
    ul { margin: 10px 0 0; padding-left: 18px; font-size: 14px; line-height: 1.5; }
  </style></head><body><div class="sheet"><h1>${escapeHtml(title)}</h1><div class="cols">${cols}</div></div></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}
