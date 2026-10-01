#!/usr/bin/env node

/**
 * Basic-host smoke test for the MCP App widgets.
 *
 * `phase7-checks.mjs` greps sources and `phase9h-visual-qa.mjs` screenshots
 * them; neither one ever clicks anything, which is how a workspace full of
 * buttons that could not call their tools shipped green.
 *
 * This runs the widgets against a real `AppBridge` host (see
 * `basic-host/host.ts`): real `ui/*` handshake, real postMessage transport,
 * real MCP client, stub server that records what each button asked for.
 * Every case below clicks a control and asserts the resulting tool call.
 *
 * Usage: node scripts/mcp-apps/basic-host-smoke.mjs [--headful]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { build } from 'esbuild';
import puppeteer from 'puppeteer';

const root = process.cwd();
// VERTO_WIDGET_DIR points the harness at another build of the widgets, which
// is how the before/after comparison in the PR was produced: check the old
// generated HTML out to a directory and run the same scenarios against it.
const generatedDir = process.env.VERTO_WIDGET_DIR
  ? path.resolve(root, process.env.VERTO_WIDGET_DIR)
  : path.join(root, 'src/mcp/apps/generated');
const evidenceDir = path.join(root, 'docs/mcp-apps/submission-assets');
const reportPath = path.join(
  evidenceDir,
  process.env.VERTO_SMOKE_REPORT || 'basic-host-smoke-report.json'
);
const headful = process.argv.includes('--headful');

const widgetHtml = {
  list: await readFile(path.join(generatedDir, 'presentation-list.html'), 'utf8'),
  deck: await readFile(path.join(generatedDir, 'deck-preview.html'), 'utf8'),
  themeStudio: await readFile(path.join(generatedDir, 'theme-studio.html'), 'utf8'),
  actionResult: await readFile(path.join(generatedDir, 'action-result.html'), 'utf8'),
  publishCard: await readFile(path.join(generatedDir, 'publish-card.html'), 'utf8'),
  generation: await readFile(path.join(generatedDir, 'generation-progress.html'), 'utf8'),
};

const appVisibleTools = await readAppVisibleTools();
const hostBundle = await bundleHost();
const hostPage = [
  '<!doctype html><html lang="en"><head><meta charset="utf-8" />',
  '<title>Verto basic host</title></head><body>',
  `<script>${hostBundle}</script>`,
  '</body></html>',
].join('\n');

const results = [];
const browser = await puppeteer.launch({
  headless: headful ? false : 'new',
  protocolTimeout: 120_000,
  args: ['--no-sandbox', ...(process.env.AGENT_BROWSER_ARGS || '').split(' ').filter(Boolean)],
});

try {
  for (const scenario of scenarios()) {
    results.push(await runScenario(browser, scenario));
  }
} finally {
  await browser.close();
}

await mkdir(evidenceDir, { recursive: true });
await writeFile(
  reportPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
  'utf8'
);

const failed = results.filter((result) => result.status === 'fail');

for (const result of results) {
  const label = result.status === 'pass' ? '[PASS]' : '[FAIL]';
  console.log(`${label} ${result.label}`);
  for (const failure of result.failures) {
    console.log(`       ${failure}`);
  }
}

console.log(
  failed.length === 0
    ? `\nBasic-host smoke passed: ${results.length} widget interactions.`
    : `\nBasic-host smoke failed: ${failed.length} of ${results.length} interactions.`
);
console.log(`Report: ${path.relative(root, reportPath).replace(/\\/g, '/')}`);

process.exit(failed.length === 0 ? 0 : 1);

/* ------------------------------------------------------------------ */

async function runScenario(browser, scenario) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  const failures = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => consoleErrors.push(String(error)));

  try {
    await page.setContent(hostPage, { waitUntil: 'domcontentloaded' });
    await page.evaluate(
      async (html, payload, stubs, visible) => {
        window.__VERTO_HOST__.reset();
        for (const [name, result] of Object.entries(stubs)) {
          window.__VERTO_HOST__.stubTool(name, result);
        }
        await window.__VERTO_HOST__.mount(html, payload, { appVisibleTools: visible });
      },
      scenario.html,
      scenario.payload,
      scenario.stubs || {},
      appVisibleTools
    );

    const frame = page.frames().find((candidate) => candidate.parentFrame() === page.mainFrame());
    if (!frame) throw new Error('widget iframe never attached');

    await frame.waitForSelector(scenario.readySelector, { timeout: 10_000 });

    const observed = await scenario.run({ page, frame });
    failures.push(...scenario.expect(observed));
  } catch (error) {
    failures.push(`threw: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await page.close();
  }

  if (consoleErrors.length > 0) {
    failures.push(`page errors: ${consoleErrors.join(' | ')}`);
  }

  return {
    id: scenario.id,
    label: scenario.label,
    status: failures.length === 0 ? 'pass' : 'fail',
    failures,
  };
}

/** Clicks a control by its visible label inside the widget frame. */
async function clickByLabel(frame, selector, label) {
  const clicked = await frame.evaluate(
    (sel, text) => {
      const match = [...document.querySelectorAll(sel)].find((element) => {
        const span = element.querySelector('.vt-btn-label');
        return ((span ? span.textContent : element.textContent) || '').trim() === text;
      });

      if (!match) return false;
      match.click();
      return true;
    },
    selector,
    label
  );

  if (!clicked) throw new Error(`no control matching "${label}" (${selector})`);
}

/**
 * Presses on thumbnail `from` and moves the mouse to `fraction` of the way
 * across thumbnail `to`, leaving the button down. Element boxes are in
 * main-page coordinates, so this works through the widget iframe.
 */
async function dragThumb(page, frame, from, to, fraction) {
  const source = await (await frame.$(`.thumb[data-index="${from}"]`)).boundingBox();
  const target = await (await frame.$(`.thumb[data-index="${to}"]`)).boundingBox();
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width * fraction, target.y + target.height / 2, { steps: 10 });
  await new Promise((resolve) => setTimeout(resolve, 150));
}

async function settle(page, ms = 450) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return page.evaluate(() => ({
    toolCalls: window.__VERTO_HOST__.toolCalls(),
    messages: window.__VERTO_HOST__.messages(),
    links: window.__VERTO_HOST__.links(),
  }));
}

function expectCall(observed, name, argsMatcher) {
  const call = observed.toolCalls.find((entry) => entry.name === name && !entry.refused);

  if (!call) {
    const refused = observed.toolCalls.find((entry) => entry.name === name && entry.refused);
    if (refused) {
      return [`the host refused ${name}: the server does not declare it app-visible`];
    }
    return [`expected a ${name} call, saw: ${observed.toolCalls.map((c) => c.name).join(', ') || 'none'}`];
  }

  return argsMatcher ? argsMatcher(call.arguments) : [];
}

function expectNoCall(observed, name) {
  return observed.toolCalls.some((entry) => entry.name === name && !entry.refused)
    ? [`did not expect a ${name} call`]
    : [];
}

/* ------------------------------------------------------------------ */
/* Scenarios                                                          */
/* ------------------------------------------------------------------ */

function scenarios() {
  return [
    {
      id: 'list-preview-uses-bridge',
      label: 'Workspace list: Preview calls presentation_get over the bridge',
      html: widgetHtml.list,
      payload: listPayload(),
      readySelector: '.presentation-row',
      async run({ page, frame }) {
        await clickByLabel(frame, '.row-action-btn', 'Preview');
        return settle(page);
      },
      expect: (observed) => [
        ...expectCall(observed, 'presentation_get', (args) =>
          args.presentation_id === 'deck_1' ? [] : [`wrong id: ${JSON.stringify(args)}`]
        ),
        ...(observed.messages.length > 0
          ? [`preview should cost no model turn, but posted: ${observed.messages.join(' | ')}`]
          : []),
      ],
    },
    {
      id: 'list-publish-round-trip',
      label: 'Workspace list: Publish calls the tool and refreshes the list',
      html: widgetHtml.list,
      payload: listPayload(),
      readySelector: '.presentation-row',
      async run({ page, frame }) {
        await clickByLabel(frame, '.row-action-btn', 'Publish');
        return settle(page, 700);
      },
      expect: (observed) => [
        ...expectCall(observed, 'presentation_publish', (args) =>
          args.presentation_id === 'deck_1' ? [] : [`wrong id: ${JSON.stringify(args)}`]
        ),
        ...expectCall(observed, 'presentation_list'),
      ],
    },
    {
      id: 'list-delete-needs-confirmation',
      label: 'Workspace list: Delete waits for a second click, then calls the tool',
      html: widgetHtml.list,
      payload: listPayload(),
      readySelector: '.presentation-row',
      async run({ page, frame }) {
        await clickByLabel(frame, '.row-action-btn', 'Delete');
        const afterFirst = await settle(page, 250);
        await clickByLabel(frame, '.row-action-btn', 'Confirm');
        const afterSecond = await settle(page, 700);
        return { afterFirst, ...afterSecond };
      },
      expect: (observed) => [
        ...expectNoCall(observed.afterFirst, 'presentation_delete'),
        ...expectCall(observed, 'presentation_delete', (args) =>
          args.presentation_id === 'deck_1' ? [] : [`wrong id: ${JSON.stringify(args)}`]
        ),
      ],
    },
    {
      id: 'list-recover-deleted-row',
      label: 'Workspace list: Recover calls presentation_recover',
      html: widgetHtml.list,
      payload: listPayload({ deleted: true }),
      readySelector: '.presentation-row',
      async run({ page, frame }) {
        await clickByLabel(frame, '.row-action-btn', 'Recover');
        return settle(page, 700);
      },
      expect: (observed) =>
        expectCall(observed, 'presentation_recover', (args) =>
          args.presentation_id === 'deck_1' ? [] : [`wrong id: ${JSON.stringify(args)}`]
        ),
    },
    {
      id: 'list-permanent-delete-keeps-model-turn',
      label: 'Workspace list: Delete forever asks the assistant instead of deleting',
      html: widgetHtml.list,
      payload: listPayload({ deleted: true }),
      readySelector: '.presentation-row',
      async run({ page, frame }) {
        await clickByLabel(frame, '.row-action-btn', 'Delete forever');
        await settle(page, 250);
        await clickByLabel(frame, '.row-action-btn', 'Confirm');
        return settle(page, 700);
      },
      expect: (observed) => [
        ...expectNoCall(observed, 'presentation_delete_permanently'),
        ...(observed.messages.some((text) => text.includes('Permanently delete'))
          ? []
          : [`expected a confirmation message, saw: ${observed.messages.join(' | ') || 'none'}`]),
      ],
    },
    {
      id: 'list-pager-sends-cursor',
      label: 'Workspace list: Load more sends the pagination cursor',
      html: widgetHtml.list,
      payload: listPayload({ hasMore: true }),
      readySelector: '#load-more-action',
      async run({ page, frame }) {
        await frame.click('#load-more-action');
        return settle(page, 700);
      },
      expect: (observed) =>
        expectCall(observed, 'presentation_list', (args) =>
          args.cursor === 'cursor_page_2' ? [] : [`expected the cursor, got: ${JSON.stringify(args)}`]
        ),
    },
    {
      id: 'list-failure-is-visible',
      label: 'Workspace list: a rejected tool call reports in the widget',
      html: widgetHtml.list,
      payload: listPayload(),
      readySelector: '.presentation-row',
      async run({ page, frame }) {
        await page.evaluate(() =>
          window.__VERTO_HOST__.failTool('presentation_publish', 'Usage limit reached for this workspace.')
        );
        await clickByLabel(frame, '.row-action-btn', 'Publish');
        await settle(page, 700);
        const note = await frame.$eval('#action-note', (element) => element.textContent || '');
        return { note };
      },
      expect: (observed) =>
        observed.note.includes('Usage limit reached')
          ? []
          : [`expected the server message in the note, got: "${observed.note}"`],
    },
    {
      id: 'deck-theme-studio-opens',
      label: 'Deck preview: Change theme calls presentation_render_theme_studio',
      html: widgetHtml.deck,
      payload: deckPayload(),
      readySelector: '#theme-action',
      async run({ page, frame }) {
        await frame.click('#theme-action');
        return settle(page, 700);
      },
      expect: (observed) => expectCall(observed, 'presentation_render_theme_studio'),
    },
    {
      id: 'deck-reorder-saves-slides',
      label: 'Deck preview: moving a slide fetches raw slides, then saves them renumbered',
      html: widgetHtml.deck,
      payload: deckPayload(),
      stubs: { presentation_get: deckGetResult() },
      readySelector: '#move-down-action',
      async run({ page, frame }) {
        await frame.click('#move-down-action');
        return settle(page, 900);
      },
      expect: (observed) => [
        ...expectCall(observed, 'presentation_get'),
        ...expectCall(observed, 'presentation_update_slides', (args) => {
          const slides = Array.isArray(args.slides) ? args.slides : [];
          const order = slides.map((slide) => `${slide.id}:${slide.slideOrder}`).join(',');
          return order === 's2:0,s1:1' && slides[0].type === 'title'
            ? []
            : [`expected raw slides s2,s1 renumbered, got: ${JSON.stringify(args).slice(0, 160)}`];
        }),
      ],
    },
    {
      id: 'deck-drag-reorders',
      label: 'Deck preview: dragging a thumbnail past its neighbour saves the new order',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '.thumb[data-index="1"]',
      async run({ page, frame }) {
        await dragThumb(page, frame, 0, 1, 0.8);
        await page.mouse.up();
        const observed = await settle(page, 900);
        const position = await frame.$eval('#stage-pos', (el) => el.textContent);
        return { position, ...observed };
      },
      expect: (observed) => [
        ...expectCall(observed, 'presentation_update_slides', (args) => {
          const order = (args.slides || []).map((slide) => `${slide.id}:${slide.slideOrder}`).join(',');
          return order === 's2:0,s1:1' ? [] : [`expected s2,s1 renumbered, got: ${order}`];
        }),
        ...(observed.position === 'Slide 2 of 2' ? [] : [`stage did not follow the dragged slide: ${observed.position}`]),
      ],
    },
    {
      id: 'deck-drag-across-rows',
      label: 'Deck preview: dragging slide 1 onto the second row saves it at that position',
      html: widgetHtml.deck,
      payload: deckRawPayload({ slides: 9 }),
      readySelector: '.thumb[data-index="8"]',
      async run({ page, frame }) {
        const rows = await frame.evaluate(() => {
          const top = (i) => document.querySelector(`.thumb[data-index="${i}"]`).getBoundingClientRect().top;
          return { first: top(0), target: top(7) };
        });
        await dragThumb(page, frame, 0, 7, 0.8);
        await page.mouse.up();
        const observed = await settle(page, 900);
        return { wrapped: rows.target > rows.first, ...observed };
      },
      expect: (observed) => [
        ...(observed.wrapped ? [] : ['slide 8 is on the first row, so this does not test wrapping']),
        ...expectCall(observed, 'presentation_update_slides', (args) => {
          const order = (args.slides || []).map((slide) => slide.id).join(',');
          return order === 's2,s3,s4,s5,s6,s7,s8,s1,s9' ? [] : [`expected s1 after s8, got: ${order}`];
        }),
      ],
    },
    {
      id: 'deck-refresh-ends-drag',
      label: 'Deck preview: a new tool result mid-drag ends the drag instead of moving a stale index',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '.thumb[data-index="1"]',
      async run({ page, frame }) {
        await dragThumb(page, frame, 0, 1, 0.8);
        // The model reorders the deck itself while the person is dragging.
        const reordered = deckRawPayload();
        reordered.data.slides.reverse();
        await page.evaluate((payload) => window.__VERTO_HOST__.pushToolResult(payload), reordered);
        await settle(page, 300);
        await page.mouse.up();
        const observed = await settle(page, 700);
        const leftovers = await frame.evaluate(() => document.querySelectorAll('.drag-ghost, .is-drag-source').length);
        return { leftovers, ...observed };
      },
      expect: (observed) => [
        ...expectNoCall(observed, 'presentation_update_slides'),
        ...(observed.leftovers === 0 ? [] : [`${observed.leftovers} drag artifacts left after the refresh`]),
      ],
    },
    {
      id: 'deck-drag-escape-cancels',
      label: 'Deck preview: Escape during a drag leaves the order alone',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '.thumb[data-index="1"]',
      async run({ page, frame }) {
        await dragThumb(page, frame, 0, 1, 0.8);
        await page.keyboard.press('Escape');
        await page.mouse.up();
        const observed = await settle(page, 600);
        const leftovers = await frame.evaluate(() =>
          document.querySelectorAll('.drag-ghost, .drop-before, .drop-after, .is-drag-source').length
        );
        return { leftovers, ...observed };
      },
      expect: (observed) => [
        ...expectNoCall(observed, 'presentation_update_slides'),
        ...(observed.leftovers === 0 ? [] : [`${observed.leftovers} drag artifacts left on screen`]),
      ],
    },
    {
      id: 'deck-touch-hold-drags',
      label: 'Deck preview: on touch, a long press then a drag reorders; a quick swipe does not',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '.thumb[data-index="1"]',
      async run({ page, frame }) {
        const source = await (await frame.$('.thumb[data-index="0"]')).boundingBox();
        const target = await (await frame.$('.thumb[data-index="1"]')).boundingBox();
        const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
        const end = { x: target.x + target.width * 0.8, y: target.y + target.height / 2 };

        // A swipe that starts moving at once is a scroll, not a drag.
        await page.touchscreen.touchStart(start.x, start.y);
        await page.touchscreen.touchMove(end.x, end.y);
        await page.touchscreen.touchEnd();
        const afterSwipe = await settle(page, 500);

        // Holding still past the long-press delay picks the slide up.
        await page.touchscreen.touchStart(start.x, start.y);
        await new Promise((resolve) => setTimeout(resolve, 450));
        await page.touchscreen.touchMove((start.x + end.x) / 2, end.y);
        await page.touchscreen.touchMove(end.x, end.y);
        await page.touchscreen.touchEnd();
        const afterHold = await settle(page, 900);
        return { afterSwipe, ...afterHold };
      },
      expect: (observed) => [
        ...expectNoCall(observed.afterSwipe, 'presentation_update_slides'),
        ...expectCall(observed, 'presentation_update_slides', (args) => {
          const order = (args.slides || []).map((slide) => slide.id).join(',');
          return order === 's2,s1' ? [] : [`expected s2,s1, got: ${order}`];
        }),
      ],
    },
    {
      id: 'deck-click-still-selects',
      label: 'Deck preview: a plain click on a thumbnail selects it without moving anything',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '.thumb[data-index="1"]',
      async run({ page, frame }) {
        await frame.click('.thumb[data-index="1"]');
        const observed = await settle(page, 400);
        const position = await frame.$eval('#stage-pos', (el) => el.textContent);
        return { position, ...observed };
      },
      expect: (observed) => [
        ...expectNoCall(observed, 'presentation_update_slides'),
        ...(observed.position === 'Slide 2 of 2' ? [] : [`click did not select: ${observed.position}`]),
      ],
    },
    {
      id: 'deck-alt-arrow-moves',
      label: 'Deck preview: Alt+ArrowRight moves the focused slide and keeps focus on it',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '.thumb[data-index="0"]',
      async run({ page, frame }) {
        await frame.focus('.thumb[data-index="0"]');
        await page.keyboard.down('Alt');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.up('Alt');
        const observed = await settle(page, 900);
        const focused = await frame.evaluate(() => document.activeElement?.getAttribute('aria-label'));
        return { focused, ...observed };
      },
      expect: (observed) => [
        ...expectCall(observed, 'presentation_update_slides', (args) => {
          const order = (args.slides || []).map((slide) => slide.id).join(',');
          return order === 's2,s1' ? [] : [`expected s2,s1, got: ${order}`];
        }),
        ...(observed.focused === 'Slide 2: Market shift' ? [] : [`focus did not follow the slide: ${observed.focused}`]),
      ],
    },
    {
      id: 'deck-thumbnail-selects-slide',
      label: 'Deck preview: clicking a thumbnail puts that slide on the stage',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '.thumb',
      async run({ page, frame }) {
        await frame.click('.thumb[data-index="1"]');
        await settle(page, 200);
        return frame.evaluate(() => ({
          position: document.getElementById('stage-pos').textContent,
          current: document.querySelector('.thumb[aria-current="true"]')?.dataset.index,
        }));
      },
      expect: (observed) =>
        observed.position === 'Slide 2 of 2' && observed.current === '1'
          ? []
          : [`stage did not follow the thumbnail: ${JSON.stringify(observed)}`],
    },
    {
      id: 'deck-duplicate-slide',
      label: 'Deck preview: Duplicate saves a copy with fresh ids',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '#duplicate-slide-action',
      async run({ page, frame }) {
        await frame.click('#duplicate-slide-action');
        return settle(page, 900);
      },
      expect: (observed) =>
        expectCall(observed, 'presentation_update_slides', (args) => {
          const slides = args.slides || [];
          const copy = slides[1] || {};
          return slides.length === 3 && copy.id !== 's1' && copy.slideName === 'Market shift (copy)'
            && copy.content?.id !== 'c1'
            ? []
            : [`expected a copy after slide 1 with new ids, got: ${JSON.stringify(args).slice(0, 200)}`];
        }),
    },
    {
      id: 'deck-delete-then-undo',
      label: 'Deck preview: Delete needs a second click, and Undo saves the slide back',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '#delete-slide-action',
      async run({ page, frame }) {
        await frame.click('#delete-slide-action');
        const afterFirst = await settle(page, 250);
        await frame.click('#delete-slide-action');
        await settle(page, 900);
        const undoVisible = await frame.$eval('#undo-slide-action', (el) => !el.hidden);
        await frame.click('#undo-slide-action');
        const final = await settle(page, 900);
        return { afterFirst, undoVisible, ...final };
      },
      expect: (observed) => {
        const saves = observed.toolCalls.filter((call) => call.name === 'presentation_update_slides');
        const lengths = saves.map((call) => call.arguments.slides.length).join(',');
        return [
          ...expectNoCall(observed.afterFirst, 'presentation_update_slides'),
          ...(observed.undoVisible ? [] : ['Undo was not offered after the delete']),
          ...(lengths === '1,2' ? [] : [`expected saves of 1 then 2 slides, got: ${lengths || 'none'}`]),
        ];
      },
    },
    {
      id: 'deck-failed-save-rolls-back',
      label: 'Deck preview: a rejected slide save restores the deck and says why',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '#move-down-action',
      async run({ page, frame }) {
        await page.evaluate(() =>
          window.__VERTO_HOST__.failTool('presentation_update_slides', 'Deck is locked by another editor.')
        );
        await frame.click('#move-down-action');
        await settle(page, 900);
        return frame.evaluate(() => ({
          note: document.getElementById('action-note').textContent,
          first: document.querySelector('.thumb[data-index="0"]')?.getAttribute('aria-label'),
        }));
      },
      expect: (observed) => [
        ...(observed.note.includes('Deck is locked') ? [] : [`note did not report the failure: "${observed.note}"`]),
        ...(observed.first === 'Slide 1: Market shift' ? [] : [`order was not restored: ${observed.first}`]),
      ],
    },
    {
      id: 'deck-truncated-blocks-structure',
      label: 'Deck preview: slide changes are off when the widget holds a partial deck',
      html: widgetHtml.deck,
      payload: deckRawPayload({ slideCount: 60 }),
      readySelector: '#move-down-action',
      async run({ page, frame }) {
        const disabled = await frame.evaluate(() =>
          ['move-down-action', 'duplicate-slide-action', 'delete-slide-action']
            .every((id) => document.getElementById(id).disabled)
        );
        const observed = await settle(page, 200);
        return { disabled, ...observed };
      },
      expect: (observed) => [
        ...(observed.disabled ? [] : ['structure controls stayed enabled on a truncated deck']),
        ...expectNoCall(observed, 'presentation_update_slides'),
      ],
    },
    {
      id: 'deck-inline-theme-apply',
      label: 'Deck preview: the inline picker previews and applies a theme',
      html: widgetHtml.deck,
      payload: deckRawPayload(),
      readySelector: '#theme-action',
      async run({ page, frame }) {
        await frame.click('#theme-action');
        await frame.waitForSelector('.theme-card[data-theme-name="Neon Nights"]', { visible: true });
        await frame.click('.theme-card[data-theme-name="Neon Nights"]');
        await frame.click('#theme-apply-btn');
        const observed = await settle(page, 700);
        const pickerClosed = await frame.$eval('#theme-panel', (el) => el.hidden);
        return { pickerClosed, ...observed };
      },
      expect: (observed) => [
        ...expectCall(observed, 'presentation_update_theme', (args) =>
          args.theme_name === 'Neon Nights' ? [] : [`wrong theme: ${JSON.stringify(args)}`]
        ),
        ...(observed.pickerClosed ? [] : ['picker stayed open after apply']),
      ],
    },
    {
      id: 'theme-studio-tabs-track-state',
      label: 'Theme studio: filter tabs mark themselves pressed',
      html: widgetHtml.themeStudio,
      payload: themeStudioPayload(),
      readySelector: '#tab-dark',
      async run({ page, frame }) {
        await frame.click('#tab-dark');
        await settle(page, 250);
        return frame.evaluate(() => ({
          all: document.getElementById('tab-all').getAttribute('aria-pressed'),
          dark: document.getElementById('tab-dark').getAttribute('aria-pressed'),
        }));
      },
      expect: (observed) =>
        observed.dark === 'true' && observed.all === 'false'
          ? []
          : [`tabs did not follow the filter: ${JSON.stringify(observed)}`],
    },
    {
      id: 'theme-studio-apply',
      label: 'Theme studio: applying a theme calls presentation_update_theme',
      html: widgetHtml.themeStudio,
      payload: themeStudioPayload(),
      readySelector: '.ts-card',
      async run({ page, frame }) {
        await frame.evaluate(() => {
          document.querySelector('.ts-card[data-theme-name="Neon Nights"]').click();
        });
        await settle(page, 200);
        await frame.click('#confirm-apply');
        return settle(page, 700);
      },
      expect: (observed) =>
        expectCall(observed, 'presentation_update_theme', (args) =>
          args.theme_name === 'Neon Nights' ? [] : [`wrong theme: ${JSON.stringify(args)}`]
        ),
    },
    {
      id: 'action-result-preview-uses-bridge',
      label: 'Action result: Preview deck calls presentation_get over the bridge',
      html: widgetHtml.actionResult,
      payload: actionResultPayload(),
      readySelector: '#preview-action',
      async run({ page, frame }) {
        await frame.click('#preview-action');
        return settle(page, 700);
      },
      expect: (observed) => [
        ...expectCall(observed, 'presentation_get'),
        ...(observed.messages.length > 0 ? ['preview should cost no model turn'] : []),
      ],
    },
    {
      id: 'action-result-recover',
      label: 'Action result: Recover deck calls presentation_recover',
      html: widgetHtml.actionResult,
      payload: actionResultPayload({ kind: 'presentation_delete' }),
      readySelector: '#dynamic-actions button',
      async run({ page, frame }) {
        await frame.click('#dynamic-actions button');
        return settle(page, 700);
      },
      expect: (observed) => expectCall(observed, 'presentation_recover'),
    },
    {
      id: 'publish-card-unpublish',
      label: 'Publish card: Unpublish confirms, then calls presentation_unpublish',
      html: widgetHtml.publishCard,
      payload: publishCardPayload(),
      readySelector: '#unpublish-action',
      async run({ page, frame }) {
        await frame.click('#unpublish-action');
        const afterFirst = await settle(page, 250);
        await frame.click('#unpublish-action');
        const afterSecond = await settle(page, 700);
        return { afterFirst, ...afterSecond };
      },
      expect: (observed) => [
        ...expectNoCall(observed.afterFirst, 'presentation_unpublish'),
        ...expectCall(observed, 'presentation_unpublish'),
      ],
    },
    {
      id: 'generation-progress-check-status',
      label: 'Generation progress: Check status polls presentation_generation_status',
      html: widgetHtml.generation,
      payload: generationPayload(),
      readySelector: '#inspect-action',
      async run({ page, frame }) {
        await frame.click('#inspect-action');
        return settle(page, 700);
      },
      expect: (observed) =>
        expectCall(observed, 'presentation_generation_status', (args) =>
          args.generation_run_id === 'run_1' ? [] : [`wrong run id: ${JSON.stringify(args)}`]
        ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

function listPayload({ deleted = false, hasMore = false } = {}) {
  return {
    widget: {
      widget: 'presentation_list',
      version: 2,
      presentations: [
        {
          id: 'deck_1',
          title: 'AI tutoring investor pitch deck',
          themeName: 'Dark Elegance',
          slideCount: 7,
          updatedAt: '2026-06-18T10:00:00.000Z',
          isPublished: false,
          isDeleted: deleted,
          shareUrl: '',
          openUrl: 'https://example.invalid/presentation/deck_1',
        },
      ],
      pagination: {
        nextCursor: hasMore ? 'cursor_page_2' : '',
        hasMore,
        totalCount: hasMore ? 44 : 1,
        pageSize: 20,
      },
      summary: {
        shownCount: 1,
        totalCount: hasMore ? 44 : 1,
        publishedCount: 0,
        draftCount: deleted ? 0 : 1,
        deletedCount: deleted ? 1 : 0,
      },
      actions: { canRefresh: true, canOpenLatest: true, canPreviewLatest: true },
    },
  };
}

function deckPayload() {
  return {
    widget: {
      widget: 'deck_preview',
      version: 2,
      presentation: {
        id: 'deck_1',
        title: 'AI tutoring investor pitch deck',
        themeName: 'Dark Elegance',
        slideCount: 2,
        updatedAt: '2026-06-18T10:00:00.000Z',
        isPublished: false,
        shareUrl: '',
        openUrl: 'https://example.invalid/presentation/deck_1',
      },
      slides: [
        { id: 's1', slideName: 'Market shift', type: 'title', slideOrder: 0, content: { type: 'title', content: 'Market shift' } },
        { id: 's2', slideName: 'Problem', type: 'title', slideOrder: 1, content: { type: 'title', content: 'Problem' } },
      ],
      actions: { canUpdateSlides: true, canPublish: true, canRefresh: true, canUpdateTheme: true },
    },
  };
}

/** Raw slides as the server stores them, the way presentation_get returns them in `data`. */
function deckRawSlides(count = 2) {
  const base = [
    { id: 's1', slideName: 'Market shift', type: 'title', slideOrder: 0, content: { id: 'c1', type: 'title', content: 'Market shift' } },
    { id: 's2', slideName: 'Problem', type: 'title', slideOrder: 1, content: { id: 'c2', type: 'title', content: 'Problem' } },
  ];
  for (let i = base.length; i < count; i += 1) {
    base.push({ id: `s${i + 1}`, slideName: `Slide ${i + 1}`, type: 'title', slideOrder: i, content: { id: `c${i + 1}`, type: 'title', content: `Slide ${i + 1}` } });
  }
  return base;
}

function deckGetResult() {
  return { success: true, data: { id: 'deck_1', title: 'AI tutoring investor pitch deck', slide_count: 2, slides: deckRawSlides() } };
}

function deckRawPayload({ slides = 2, slideCount = slides } = {}) {
  const payload = deckPayload();
  payload.widget.presentation.slideCount = slideCount;
  return {
    success: true,
    data: { id: 'deck_1', title: 'AI tutoring investor pitch deck', slide_count: slideCount, slides: deckRawSlides(slides) },
    ...payload,
  };
}

function themeStudioPayload() {
  return {
    widget: {
      widget: 'theme_studio',
      version: 2,
      presentation: { id: 'deck_1', title: 'AI tutoring investor pitch deck', themeName: 'Default' },
      themes: [
        { name: 'Default', type: 'light', background: '#ffffff', accentColor: '#3b82f6', fontColor: '#000000' },
        { name: 'Neon Nights', type: 'dark', background: '#09090b', accentColor: '#a3e635', fontColor: '#fafafa' },
        { name: 'Ocean Breeze', type: 'light', background: '#e0f2fe', accentColor: '#0284c7', fontColor: '#0c4a6e' },
      ],
      actions: { canApplyTheme: true },
    },
  };
}

function actionResultPayload({ kind = 'presentation_publish' } = {}) {
  return {
    widget: {
      widget: 'action_result',
      version: 2,
      operation: {
        kind,
        title: 'Presentation published',
        message: 'The deck is live.',
        status: 'success',
        completedAt: '2026-06-18T10:00:00.000Z',
      },
      presentation: {
        id: 'deck_1',
        title: 'AI tutoring investor pitch deck',
        themeName: 'Dark Elegance',
        slideCount: 7,
        updatedAt: '2026-06-18T10:00:00.000Z',
        isPublished: kind === 'presentation_publish',
        isDeleted: kind === 'presentation_delete',
        shareUrl: 'https://example.invalid/share/deck_1',
        openUrl: 'https://example.invalid/presentation/deck_1',
      },
      affectedPresentations: [],
    },
  };
}

function publishCardPayload() {
  return {
    widget: {
      widget: 'publish_card',
      version: 2,
      presentation: { id: 'deck_1', title: 'AI tutoring investor pitch deck', themeName: 'Dark Elegance' },
      isPublished: true,
      shareUrl: 'https://example.invalid/share/deck_1',
      actions: { canUnpublish: true, canCopyShareLink: true, canOpenShareLink: true },
    },
  };
}

function generationPayload() {
  return {
    widget: {
      widget: 'generation_progress',
      version: 2,
      generation: {
        runId: 'run_1',
        status: 'RUNNING',
        progress: 42,
        topic: 'AI tutoring investor pitch deck',
        steps: [],
      },
      actions: { canRefresh: true },
    },
  };
}

/* ------------------------------------------------------------------ */

/**
 * Reads the app surface straight off the live tool registrations: a tool is
 * app-visible when its metadata carries `appCallable: true` or
 * `appOnly: true`, which is what `createToolUiMeta` turns into
 * `ui.visibility`. Deriving it here means the harness gates on the policy the
 * server actually ships, not on a list copied into the test.
 */
async function readAppVisibleTools() {
  const source = await readFile(
    process.env.VERTO_TOOLS_SOURCE
      ? path.resolve(root, process.env.VERTO_TOOLS_SOURCE)
      : path.join(root, 'src/mcp/tools/presentation/index.ts'),
    'utf8'
  );
  const start = source.indexOf('const PRESENTATION_TOOL_METADATA');
  const table = start === -1 ? source : source.slice(start);
  const names = [];

  for (const match of table.matchAll(/\[TOOL_NAMES\.([A-Z_]+)\]:\s*\{/g)) {
    const from = match.index + match[0].length;
    const next = table.slice(from).search(/\n  \[TOOL_NAMES\./);
    const block = next === -1 ? table.slice(from) : table.slice(from, from + next);

    if (/appCallable:\s*true/.test(block) || /appOnly:\s*true/.test(block)) {
      names.push(toolNameFor(match[1]));
    }
  }

  if (names.length === 0) throw new Error('could not read any app-visible tools');
  return names;
}

/** TOOL_NAMES keys map one-to-one onto their snake_case tool names. */
function toolNameFor(key) {
  return key.toLowerCase();
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
    sourcemap: false,
  });

  const output = result.outputFiles?.[0]?.text;
  if (!output) throw new Error('esbuild did not emit the host bundle');
  return output;
}
