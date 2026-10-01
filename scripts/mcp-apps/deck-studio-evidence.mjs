#!/usr/bin/env node

/**
 * Before/after evidence for the deck preview widget.
 *
 * Mounts deck-preview.html inside the basic host (real AppBridge, stub
 * server), grows the iframe to the height the widget reports the way ChatGPT
 * and Claude do, then drives it and records two things per state: a
 * screenshot of what the person sees, and measurements a reviewer can check
 * without trusting the screenshot.
 *
 *   node scripts/mcp-apps/deck-studio-evidence.mjs --widgets <dir> --out <dir>
 *
 * `--widgets` defaults to src/mcp/apps/generated. Point it at a directory
 * holding an older deck-preview.html to capture the "before" side:
 *
 *   git show origin/master:src/mcp/apps/generated/deck-preview.html > /tmp/before/deck-preview.html
 *
 * States that need controls the older build does not have are skipped and
 * reported as such rather than failing.
 *
 * `--flow` instead walks one session through the new controls, checks an
 * assertion at each step, burns the result into the frame, and turns the
 * frames into flow.gif (needs ffmpeg on PATH).
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import puppeteer from 'puppeteer';

const root = process.cwd();
const widgetsDir = path.resolve(root, readArg('--widgets') || 'src/mcp/apps/generated');
const outDir = path.resolve(root, readArg('--out') || '.artifacts/deck-studio');
const html = await readFile(path.join(widgetsDir, 'deck-preview.html'), 'utf8');

/** What a person sees on first paint: roughly one laptop screen of chat. */
const FIRST_SCREEN = 900;

const hostPage = [
  '<!doctype html><html lang="en"><head><meta charset="utf-8" />',
  '<title>Verto basic host</title></head><body>',
  `<script>${await bundleHost()}</script>`,
  '</body></html>',
].join('\n');

const states = [
  { id: 'overview-desktop', width: 860, run: async () => ({}) },
  { id: 'overview-mobile', width: 390, run: async () => ({}) },
  { id: 'theme-picker', width: 860, run: openThemePicker },
  { id: 'theme-search', width: 860, run: searchThemes, needs: '#theme-search' },
  { id: 'select-slide', width: 860, run: selectFourthSlide, needs: '.thumb' },
  { id: 'delete-undo', width: 860, run: deleteThenOfferUndo, needs: '#delete-slide-action' },
  { id: 'drag-midway', width: 860, run: (ctx) => dragFirstThumb(ctx, { release: false }), needs: '.thumb' },
  { id: 'drag-drop', width: 860, run: (ctx) => dragFirstThumb(ctx, { release: true }), needs: '.thumb' },
].filter((state) => !readArg('--only') || readArg('--only').split(',').includes(state.id));

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  protocolTimeout: 120_000,
  args: ['--no-sandbox', ...(process.env.AGENT_BROWSER_ARGS || '').split(' ').filter(Boolean)],
});

const report = [];

try {
  if (process.argv.includes('--flow')) {
    report.push(...(await recordFlow()));
  } else {
    for (const state of states) {
      report.push(await capture(state));
    }
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outDir, 'metrics.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for (const entry of report) {
  const label = entry.skipped ? '[SKIP]' : entry.pass === false ? '[FAIL]' : entry.pass ? '[PASS]' : '[SHOT]';
  console.log(`${label} ${entry.id}${entry.skipped ? ` (${entry.skipped})` : ''}`);
}
console.log(`\nMetrics: ${path.relative(root, path.join(outDir, 'metrics.json')).replace(/\\/g, '/')}`);

/* ------------------------------------------------------------------ */

async function capture(state) {
  const page = await browser.newPage();
  await page.setViewport({ width: state.width, height: FIRST_SCREEN, deviceScaleFactor: 1 });
  // Pin the scheme: headless Chrome otherwise inherits the machine's setting,
  // and before/after must differ only by the change under test.
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  try {
    await page.setContent(hostPage, { waitUntil: 'domcontentloaded' });
    await page.evaluate(
      async (widgetHtml, payload, width, slides) => {
        window.__VERTO_HOST__.reset();
        window.__VERTO_HOST__.stubTool('presentation_render_theme_studio', { success: true });
        window.__VERTO_HOST__.stubTool('presentation_update_slides', {
          success: true,
          data: { ...payload.data, slide_count: slides.length, slides },
        });
        await window.__VERTO_HOST__.mount(widgetHtml, payload, { width, autoResize: true });
      },
      html,
      deckPayload(),
      state.width,
      deckSlides().filter((_, index) => index !== 3)
    );

    const frame = page.frames().find((candidate) => candidate.parentFrame() === page.mainFrame());
    await frame.waitForSelector('#cover-preview', { timeout: 10_000 });
    await pause(600);

    if (state.needs && !(await frame.$(state.needs))) {
      return { id: state.id, skipped: `no ${state.needs} in this build` };
    }

    const extra = await state.run({ page, frame });
    await pause(500);
    await frame.evaluate(() => Promise.all([...document.images].map((img) =>
      img.complete ? null : new Promise((resolve) => { img.onload = img.onerror = resolve; })
    )));

    const metrics = { ...(await measure(page, frame)), ...extra };
    await page.screenshot({ path: path.join(outDir, `${state.id}.png`) });
    await page.screenshot({ path: path.join(outDir, `${state.id}-full.png`), fullPage: true });

    return { id: state.id, width: state.width, metrics, errors };
  } finally {
    await page.close();
  }
}

/** Layout facts measured in host-page coordinates (what the person sees). */
async function measure(page, frame) {
  const iframeTop = await page.$eval('#widget', (el) => el.getBoundingClientRect().top);
  const inner = await frame.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!el || el.hidden || el.closest('[hidden]')) return null;
      const r = el.getBoundingClientRect();
      return r.width && r.height ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
    };
    const overlap = (a, b) => {
      if (!a || !b) return 0;
      const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      return w > 0 && h > 0 ? Math.round(w * h) : 0;
    };
    const stage = rect('#cover-preview');
    const actions = rect('.action-panel');
    const themeUi = rect('#theme-drawer') || rect('#theme-panel');
    const apply = rect('#theme-apply-btn');
    const doc = document.documentElement;
    const badgeText = [...document.querySelectorAll('#badges .badge')].map((b) => b.textContent.trim());

    return {
      documentHeight: doc.scrollHeight,
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
      stageVsActionsOverlapPx: overlap(stage, actions),
      stageVsThemeUiOverlapPx: overlap(stage, themeUi),
      stageClippedRightPx: stage ? Math.max(0, Math.round(stage.x + stage.w - doc.clientWidth)) : null,
      applyButtonTop: apply ? Math.round(apply.y) : null,
      stageText: (document.querySelector('#cover-preview')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      themeBadge: badgeText[2] || null,
      themeCardsShown: document.querySelectorAll('.theme-card:not([hidden])').length,
      layoutTagsVisible: (document.body.innerText.match(/\[[a-z]+ - [^\]]+\]/gi) || []).length,
      note: document.getElementById('action-note')?.textContent?.trim() || '',
    };
  });

  return {
    ...inner,
    applyButtonOnFirstScreen:
      inner.applyButtonTop == null ? null : iframeTop + inner.applyButtonTop < FIRST_SCREEN,
  };
}

async function openThemePicker({ frame }) {
  await frame.click('#theme-action');
  await frame.waitForSelector('#theme-apply-btn', { visible: true, timeout: 10_000 });
  await pause(300);
  // A dark theme makes the live preview obvious. Builds without
  // data-theme-name fall back to the first card.
  const card = (await frame.$('.theme-card[data-theme-name="Neon Nights"]')) || (await frame.$('.theme-card'));
  if (card) await card.click();
  return {};
}

async function searchThemes({ frame }) {
  await openThemePicker({ frame });
  await frame.type('#theme-search', 'neon');
  await pause(200);
  return {};
}

async function selectFourthSlide({ frame }) {
  const thumbs = await frame.$$('.thumb');
  await thumbs[3].click();
  await pause(200);
  return frame.evaluate(() => ({
    selectedThumb: document.querySelector('.thumb[aria-current="true"]')?.getAttribute('data-index'),
  }));
}

/**
 * Presses on thumbnail 1 and drags it past the middle of thumbnail 3, which
 * should land it at position 3. With `release: false` the pointer stays down
 * so the screenshot shows the drag in progress.
 */
async function dragFirstThumb({ page, frame }, { release }) {
  const thumbs = await frame.$$('.thumb');
  const from = await thumbs[0].boundingBox();
  const to = await thumbs[2].boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width * 0.8, to.y + to.height / 2, { steps: 12 });
  await pause(250);

  if (!release) {
    return {
      dropIndicator: await frame.evaluate(() =>
        document.querySelector('.thumb.drop-before, .thumb.drop-after')?.getAttribute('data-index') ?? null
      ),
    };
  }

  await page.mouse.up();
  await pause(900);
  const calls = await page.evaluate(() => window.__VERTO_HOST__.toolCalls());
  const save = calls.find((call) => call.name === 'presentation_update_slides');
  return {
    savedOrder: save ? save.arguments.slides.slice(0, 4).map((slide) => slide.id).join(',') : null,
    stagePosition: await frame.$eval('#stage-pos', (el) => el.textContent.trim()).catch(() => null),
  };
}

async function deleteThenOfferUndo({ page, frame }) {
  const thumbs = await frame.$$('.thumb');
  await thumbs[3].click();
  await frame.click('#delete-slide-action');
  await pause(150);
  await frame.click('#delete-slide-action');
  await pause(700);
  const calls = await page.evaluate(() => window.__VERTO_HOST__.toolCalls());
  const update = calls.find((call) => call.name === 'presentation_update_slides');
  return {
    slidesSent: update ? update.arguments.slides.length : null,
    undoVisible: await frame.$eval('#undo-slide-action', (el) => !el.hidden).catch(() => false),
  };
}

/**
 * One session through the new controls. Each step acts, then checks what a
 * reviewer would check by hand; the check's result is burned into the frame.
 */
async function recordFlow() {
  const page = await browser.newPage();
  await page.setViewport({ width: 860, height: FIRST_SCREEN, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.setContent(hostPage, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    async (widgetHtml, payload, slides) => {
      window.__VERTO_HOST__.reset();
      window.__VERTO_HOST__.stubTool('presentation_render_theme_studio', { success: true });
      window.__VERTO_HOST__.stubTool('presentation_update_slides', {
        success: true,
        data: { ...payload.data, slide_count: slides.length, slides },
      });
      await window.__VERTO_HOST__.mount(widgetHtml, payload, { width: 860, autoResize: true });
      const bar = document.createElement('div');
      bar.id = 'flow-caption';
      bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9;padding:12px 16px;'
        + 'font:600 15px/1.35 "Segoe UI",system-ui,sans-serif;color:#fff;background:#111827f0';
      document.body.appendChild(bar);
    },
    html,
    deckPayload(),
    deckSlides().filter((_, index) => index !== 3)
  );

  const frame = page.frames().find((candidate) => candidate.parentFrame() === page.mainFrame());
  await frame.waitForSelector('.thumb', { timeout: 10_000 });
  await pause(800);

  const stagePos = () => frame.$eval('#stage-pos', (el) => el.textContent.trim());
  const calls = () => page.evaluate(() => window.__VERTO_HOST__.toolCalls());
  const lastSave = async () => (await calls()).filter((c) => c.name === 'presentation_update_slides').pop();
  const layoutTag = /\[[a-z]+ - [^\]]+\]/i;

  const steps = [
    {
      id: 'flow-01-loaded',
      caption: 'Deck loads: slide 1 on the stage, no layout tags anywhere',
      act: async () => {},
      check: async () => (await stagePos()) === 'Slide 1 of 15'
        && !layoutTag.test(await frame.evaluate(() => document.body.innerText)),
    },
    {
      id: 'flow-02-thumbnail',
      caption: 'Click thumbnail 5: the stage shows slide 5',
      act: async () => frame.click('.thumb[data-index="4"]'),
      check: async () => (await stagePos()) === 'Slide 5 of 15',
    },
    {
      id: 'flow-03-keyboard',
      caption: 'Press ArrowLeft in the filmstrip: selection moves to slide 4',
      act: async () => page.keyboard.press('ArrowLeft'),
      check: async () => (await stagePos()) === 'Slide 4 of 15',
    },
    {
      id: 'flow-04-picker',
      caption: 'Change theme: picker opens beside the stage, Apply on the first screen',
      act: async () => {
        await frame.click('#theme-action');
        await frame.waitForSelector('#theme-apply-btn', { visible: true });
      },
      check: async () => {
        const top = await page.$eval('#widget', (el) => el.getBoundingClientRect().top);
        const apply = await frame.$eval('#theme-apply-btn', (el) => el.getBoundingClientRect().top);
        return top + apply < FIRST_SCREEN;
      },
    },
    {
      id: 'flow-05-preview',
      caption: 'Pick Neon Nights: stage and thumbnails repaint, nothing saved yet',
      act: async () => frame.click('.theme-card[data-theme-name="Neon Nights"]'),
      check: async () => !(await calls()).some((c) => c.name === 'presentation_update_theme'),
    },
    {
      id: 'flow-06-apply',
      caption: 'Apply: presentation_update_theme called with "Neon Nights"',
      act: async () => frame.click('#theme-apply-btn'),
      check: async () => (await calls()).some(
        (c) => c.name === 'presentation_update_theme' && c.arguments.theme_name === 'Neon Nights'
      ),
    },
    {
      id: 'flow-07-arm-delete',
      caption: 'Delete once: asks for confirmation, no save yet',
      act: async () => frame.click('#delete-slide-action'),
      check: async () => !(await lastSave())
        && (await frame.$eval('#delete-slide-action', (el) => el.textContent.includes('Confirm delete'))),
    },
    {
      id: 'flow-08-delete',
      caption: 'Confirm: 14 slides saved, Undo offered',
      act: async () => frame.click('#delete-slide-action'),
      check: async () => (await lastSave())?.arguments.slides.length === 14
        && (await frame.$eval('#undo-slide-action', (el) => !el.hidden)),
    },
    {
      id: 'flow-09-undo',
      caption: 'Undo: all 15 slides saved back in their original order',
      act: async () => frame.click('#undo-slide-action'),
      check: async () => {
        const save = await lastSave();
        const ids = save?.arguments.slides.map((slide) => slide.id).join(',');
        return save?.arguments.slides.length === 15 && ids === deckSlides().map((slide) => slide.id).join(',');
      },
    },
    {
      id: 'flow-10-drag',
      caption: 'Drag slide 1 past slide 3: a marker shows where it will land',
      act: async () => {
        const thumbs = await frame.$$('.thumb');
        const from = await thumbs[0].boundingBox();
        const to = await thumbs[2].boundingBox();
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
        await page.mouse.down();
        await page.mouse.move(to.x + to.width * 0.8, to.y + to.height / 2, { steps: 12 });
      },
      check: async () => (await frame.$eval('.thumb.drop-after', (el) => el.dataset.index).catch(() => null)) === '2',
    },
    {
      id: 'flow-11-drop',
      caption: 'Release: slide 1 saved at position 3, the stage follows it',
      act: async () => page.mouse.up(),
      check: async () => {
        const order = (await lastSave())?.arguments.slides.slice(0, 3).map((slide) => slide.id).join(',');
        return order === 'slide_2,slide_3,slide_1' && (await stagePos()) === 'Slide 3 of 15';
      },
    },
  ];

  const flowDir = path.join(outDir, 'flow');
  await mkdir(flowDir, { recursive: true });
  const results = [];

  try {
    for (const [index, step] of steps.entries()) {
      await step.act();
      await pause(700);
      const pass = Boolean(await step.check());
      await page.evaluate((text, ok) => {
        const bar = document.getElementById('flow-caption');
        bar.textContent = `${ok ? 'PASS' : 'FAIL'}  ${text}`;
        bar.style.borderTop = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
      }, `${index + 1}/${steps.length}  ${step.caption}`, pass);
      await page.screenshot({ path: path.join(flowDir, `frame-${String(index + 1).padStart(2, '0')}.png`) });
      results.push({ id: step.id, caption: step.caption, pass });
    }
  } finally {
    await page.close();
  }

  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-framerate', '1/2.2', '-i', path.join(flowDir, 'frame-%02d.png'),
    '-vf', 'fps=8,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer',
    '-loop', '0', path.join(outDir, 'flow.gif'),
  ]);

  return results;
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

async function bundleHost() {
  const result = await build({
    absWorkingDir: root,
    entryPoints: [path.join(root, 'scripts/mcp-apps/basic-host/host.ts')],
    bundle: true,
    write: false,
    minify: true,
    platform: 'browser',
    format: 'iife',
    target: ['es2020'],
    legalComments: 'none',
  });
  return result.outputFiles[0].text;
}

/* ------------------------------------------------------------------ */
/* Fixture: the deck from the bug report                              */
/* ------------------------------------------------------------------ */

/** Same envelope presentation_get returns: raw slides in `data`, summary in `widget`. */
function deckPayload() {
  const slides = deckSlides();
  return {
    success: true,
    data: {
      id: 'deck_langgraph',
      title: 'LangGraph: Building Reliable Stateful AI Agents',
      theme_name: 'Modern technical, premium developer-tool aesthetic',
      slide_count: slides.length,
      slides,
    },
    widget: {
      widget: 'deck_preview',
      version: 2,
      links: { editorUrl: 'https://example.invalid/presentation/deck_langgraph', shareUrl: null },
      presentation: {
        id: 'deck_langgraph',
        title: 'LangGraph: Building Reliable Stateful AI Agents',
        // A style prompt the model passed as theme_preference, stored verbatim.
        themeName: 'Modern technical, premium developer-tool aesthetic',
        slideCount: slides.length,
        updatedAt: '2026-09-20T10:00:00.000Z',
        isPublished: false,
        shareUrl: '',
        openUrl: 'https://example.invalid/presentation/deck_langgraph',
      },
      slides,
      actions: { canUpdateSlides: true, canPublish: true, canRefresh: true },
    },
  };
}

// Function declarations, not consts: the top-level awaits above call into
// this fixture before a `const` down here would be initialized.
var nodeId = 0;
function node(type, content, extra = {}) {
  return { id: `n${++nodeId}`, type, name: type, content, ...extra };
}
function column(...children) {
  return node('column', children);
}
function columns(...cols) {
  return node('resizable-column', cols);
}

function slide(index, outline, layout, content) {
  return { id: `slide_${index + 1}`, slideName: outline, type: layout, slideOrder: index, content };
}

function deckSlides() {
  nodeId = 0;
  const specs = [
    ['Beyond Simple Chains: The Era of Stateful AI Agents [opening - creativeHero]', 'creativeHero', () =>
      column(columns(
        column(
          node('heading1', 'Beyond Simple Chains: The Era of Stateful AI Agents'),
          node('paragraph', 'Why graphs, state and checkpoints are how production agents stay reliable.'),
          node('customButton', 'Start building →'),
        ),
        column(node('image', 'https://images.unsplash.com/photo-1518770660439-4636190af475', { alt: 'Circuit board' })),
      ))],
    ['Why Linear Chains Break in Production [problem - bullet points]', 'titleAndContent', () =>
      column(
        node('heading2', 'Why linear chains break in production'),
        node('bulletList', [
          'No memory between steps once a call fails',
          'Retries restart the whole pipeline',
          'Humans cannot step in mid-run',
        ]),
      )],
    ['Agents That Remember [concept - with data]', 'bigNumberLayout', () =>
      column(
        node('heading2', 'Agents that remember'),
        columns(
          column(node('statBox', '73%', { label: 'fewer failed runs with checkpoints', icon: '✅' })),
          column(node('statBox', '4.1x', { label: 'faster recovery after tool errors', icon: '⚡' })),
        ),
      )],
    ['Graph Anatomy: Nodes, Edges, State [concept - with visuals]', 'imageAndText', () =>
      column(
        node('heading2', 'Graph anatomy: nodes, edges, state'),
        node('paragraph', 'Nodes do work, edges decide what runs next, and a typed state object travels between them.'),
        node('calloutBox', 'State is the contract between every node.', { callOutType: 'info' }),
      )],
    ['Defining State with TypedDict [process - step-by-step]', 'codeLayout', () =>
      column(
        node('heading2', 'Defining state'),
        node('codeBlock', '', { code: 'class AgentState(TypedDict):\n    messages: Annotated[list, add_messages]\n    plan: list[str]', language: 'python' }),
      )],
    ['Conditional Edges and Routing [process - step-by-step]', 'titleAndContent', () =>
      column(
        node('heading2', 'Conditional edges and routing'),
        node('numberedList', ['Score the last tool result', 'Route to retry, reflect or finish', 'Cap loops with a recursion limit']),
      )],
    ['Section Two: Reliability [section - divider]', 'sectionDivider', () =>
      column(node('title', 'Reliability'), node('paragraph', 'Checkpoints, retries and human review'))],
    ['Checkpointers and Time Travel [concept - with data]', 'titleAndContent', () =>
      column(
        node('heading2', 'Checkpointers and time travel'),
        node('paragraph', 'Every super-step is saved, so a run can resume, fork or replay from any point.'),
      )],
    ['Human-in-the-Loop Interrupts [features/tips - bullet points]', 'titleAndContent', () =>
      column(
        node('heading2', 'Human-in-the-loop interrupts'),
        node('bulletList', ['Pause before risky tools', 'Edit state, then resume', 'Approve or reject a plan']),
      )],
    ['Chains vs Graphs [comparison - multiple options]', 'comparisonLayout', () =>
      column(
        node('heading2', 'Chains vs graphs'),
        node('table', [['', 'Chains', 'Graphs'], ['Memory', 'None', 'Typed state'], ['Recovery', 'Restart', 'Resume from checkpoint']]),
      )],
    ['Multi-Agent Supervisor Pattern [concept - with visuals]', 'bentoGrid', () =>
      column(
        node('heading2', 'Supervisor pattern'),
        node('paragraph', 'A supervisor node routes work to specialist agents and merges their results.'),
      )],
    ['Case Study: Support Triage Agent [example - with visuals]', 'imageAndText', () =>
      column(
        node('heading2', 'Case study: support triage'),
        node('blockquote', 'Median time to first answer dropped from 9 minutes to 40 seconds.'),
      )],
    ['Rollout Timeline [timeline - roadmap]', 'timeline', () =>
      column(
        node('heading2', 'Rollout timeline'),
        columns(
          column(node('timelineCard', 'Prototype', { icon: '2026', placeholder: 'One graph, one tool' })),
          column(node('timelineCard', 'Pilot', { icon: '2027', placeholder: 'Checkpoints and review' })),
        ),
      )],
    ['Common Mistakes to Avoid [comparison - dos and donts]', 'titleAndContent', () =>
      column(
        node('heading2', 'Common mistakes'),
        node('bulletList', ['Unbounded loops', 'State that grows without pruning', 'No interrupt before side effects']),
      )],
    ['Start Building Today [CTA - conclusion]', 'callToAction', () =>
      column(
        node('heading1', 'Start building today'),
        node('paragraph', 'pip install langgraph, then model your first agent as a graph.'),
        node('customButton', 'Read the docs →'),
      )],
  ];

  return specs.map(([outline, layout, build], index) => slide(index, outline, layout, build()));
}
