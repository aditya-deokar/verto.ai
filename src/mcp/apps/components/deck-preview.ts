import {
  byId,
  callMcpTool,
  getArray,
  getNumber,
  getRecord,
  getString,
  injectStyles,
  logWidgetWarning,
  mountWidget,
  onTeardown,
  onToolInputPartial,
  pushModelContext,
  requestDisplayMode,
} from './shared/runtime';
import {
  canPresentFullscreen,
  extractWidgetLinks,
  findTheme,
  openVertoLink,
  renderDeepLinkMenu,
  resolveThemeTokens,
  setWidgetTheme,
  VERTO_THEMES,
} from './shared/verto-skin';
import {
  getControlLabel,
  iconElement,
  iconLabel,
  setButtonIcon,
  setControlLabel,
} from './shared/icons';
import { renderSlideContent } from '../../../lib/slides/render-core/index';
import { cleanSlideName } from '../../../lib/slides/slide-names';
import {
  applyPatchesToSlides,
  createSlideEditor,
  type SlideEditPatch,
  type SlideEditorHandle,
} from './shared/slide-editor';
import {
  dropTargetIndex,
  duplicateSlide,
  filterThemes,
  insertSlide,
  moveSlide,
  removeSlide,
} from './shared/deck-model';

/**
 * Every slide renders on one fixed logical canvas and is scaled to its frame,
 * so the stage, the thumbnails and the presenter show the same layout.
 */
const CANVAS_WIDTH = 720;
const UNDO_WINDOW_MS = 10_000;
const CONFIRM_WINDOW_MS = 6_000;

const deckStyles = `
  .deck-shell {
    container-type: inline-size;
    display: grid;
    gap: 16px;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    letter-spacing: -0.01em;
  }
  .deck-header { display: grid; gap: 6px; padding-right: 48px; }
  .deck-kicker { color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; }
  .deck-title { margin: 0; max-width: 42rem; font-size: 26px; font-weight: 800; line-height: 1.2; overflow-wrap: anywhere; }
  .deck-summary { max-width: 44rem; margin: 2px 0 8px; color: var(--muted); font-size: 15px; overflow-wrap: anywhere; }
  .badge-row { display: flex; flex-wrap: wrap; gap: 8px; min-height: 28px; }
  .badge {
    display: inline-flex; align-items: center; gap: 7px; min-height: 26px; max-width: 100%;
    border: 1px solid color-mix(in srgb, var(--line) 40%, transparent); border-radius: 99px;
    padding: 4px 12px; background: color-mix(in srgb, var(--surface) 60%, transparent);
    color: var(--fg); font-size: 12px; font-weight: 600; overflow-wrap: anywhere;
  }
  .badge.is-published {
    border-color: color-mix(in srgb, var(--accent) 40%, transparent); color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  /* Stage + rail. align-items:start matters: a stretched 16:9 item derives
     its width from the row height and overflows its column. */
  .deck-stage { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
  @container (min-width: 720px) {
    .deck-stage { grid-template-columns: minmax(0, 1fr) 248px; }
  }
  .stage-col { display: grid; gap: 10px; min-width: 0; }

  .slide-frame {
    position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
    border-radius: var(--vt-radius, 12px);
  }
  .slide-canvas {
    position: absolute; top: 0; left: 0; width: ${CANVAS_WIDTH}px; height: ${CANVAS_WIDTH * 9 / 16}px;
    display: flex; flex-direction: column; justify-content: center; box-sizing: border-box;
    padding: 36px 44px; overflow: hidden; transform-origin: 0 0; transform: scale(var(--vt-scale, 0.5));
  }
  .slide-canvas .vts-title { font-size: 34px; }
  .slide-canvas .vts-heading1 { font-size: 30px; }
  .slide-canvas .vts-heading2 { font-size: 25px; }
  .slide-canvas .vts-heading3 { font-size: 19px; }
  .slide-canvas :is(.vts-p, .vts-li-text, .vts-toc, .vts-callout-body) { font-size: 16px; }
  .slide-canvas .vts-stat-value { font-size: 34px; }
  /* The kernel stacks columns on narrow viewports; the canvas is always
     ${CANVAS_WIDTH}px wide, so it keeps the desktop layout and scales instead. */
  .slide-canvas :is(.vts-row, .vts-media-row) { flex-direction: row; }
  .slide-canvas .vts-media-row .vts-media-image { flex: 1 1 45%; width: auto; }
  .slide-canvas .vts-media-row .vts-media-text { flex: 1 1 55%; width: auto; }
  .slide-fallback-title { margin: 0 0 10px; font-family: var(--vt-heading-font); font-size: 34px; line-height: 1.15; overflow-wrap: anywhere; }
  .slide-fallback-text { margin: 0; color: var(--vt-slide-muted); font-size: 17px; line-height: 1.5; overflow-wrap: anywhere; }

  .stage-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; min-width: 0; }
  .stage-caption { display: grid; flex: 1 1 180px; min-width: 0; }
  .stage-pos { color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .stage-name { overflow: hidden; font-size: 14px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
  .stage-tools { display: flex; flex-wrap: wrap; gap: 6px; }
  .tool-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 34px; min-height: 34px;
    border: 1px solid color-mix(in srgb, var(--line) 60%, transparent); border-radius: 99px; padding: 0 12px;
    background: var(--surface); color: var(--fg); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
  }
  .tool-btn.vt-icon-only { padding: 0; }
  .tool-btn:hover:not(:disabled) { border-color: var(--accent); }
  .tool-btn:disabled { cursor: default; opacity: 0.45; }
  .tool-btn.is-primary { border-color: var(--accent); background: var(--accent); color: var(--bg); }
  .tool-btn.is-danger { border-color: #dc2626; background: #dc2626; color: #ffffff; }
  .tool-btn[hidden] { display: none; }

  .action-panel, .theme-panel {
    display: grid; align-content: start; gap: 10px; min-width: 0;
    border: 1px solid color-mix(in srgb, var(--line) 60%, transparent); border-radius: 16px; padding: 16px;
    background: color-mix(in srgb, var(--surface) 85%, transparent); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
  }
  .action-panel[hidden], .theme-panel[hidden] { display: none; }
  .action-title { margin: 0; font-size: 15px; font-weight: 700; }
  .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  @container (min-width: 720px) { .action-grid { grid-template-columns: 1fr; } }
  .action-note { min-height: 36px; margin: 0; color: var(--muted); font-size: 13px; line-height: 1.4; }
  .button {
    display: inline-flex; align-items: center; justify-content: center; width: 100%; min-height: 38px;
    border: 1px solid color-mix(in srgb, var(--line) 50%, transparent); border-radius: 99px; padding: 7px 14px;
    background: color-mix(in srgb, var(--surface) 80%, transparent); color: var(--fg);
    font: inherit; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  }
  .button:hover:not(:disabled) { background: var(--surface); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); transform: translateY(-1px); }
  .button.primary { border-color: var(--accent); background: var(--accent); color: var(--bg); }
  .button.present-btn { border-color: transparent; background-color: #dc2626; background-image: var(--vt-brand-gradient); color: #ffffff; }
  .button[aria-disabled="true"], .button:disabled { cursor: default; opacity: 0.5; }
  .button.is-busy { cursor: wait; opacity: 0.7; }

  .theme-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .theme-panel-title { margin: 0; font-size: 15px; font-weight: 800; }
  .theme-panel-buttons { display: flex; gap: 6px; }
  .theme-search {
    width: 100%; min-height: 36px; box-sizing: border-box; border: 1px solid var(--line); border-radius: 10px;
    padding: 6px 10px; background: var(--bg); color: var(--fg); font: inherit; font-size: 13px;
  }
  .theme-list { display: grid; grid-template-columns: 1fr; gap: 6px; max-height: 292px; overflow-y: auto; padding: 2px; }
  @container (max-width: 719px) { .theme-list { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); } }
  .theme-card {
    display: flex; align-items: center; gap: 10px; width: 100%; min-width: 0; border: 1px solid var(--line);
    border-radius: 10px; padding: 6px; background: var(--surface); color: var(--fg); font: inherit; text-align: left; cursor: pointer;
  }
  .theme-card:hover { border-color: var(--accent); }
  .theme-card[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
  .theme-chip {
    position: relative; display: grid; place-items: center; flex: none; width: 46px; height: 30px; overflow: hidden;
    border: 1px solid rgba(127, 127, 127, 0.25); border-radius: 6px; font-size: 13px; font-weight: 800;
  }
  .theme-chip::after { content: ""; position: absolute; left: 6px; right: 6px; bottom: 4px; height: 3px; border-radius: 3px; background: var(--chip-accent); }
  .theme-card-text { display: grid; min-width: 0; }
  .theme-card-name { overflow: hidden; font-size: 13px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
  .theme-card-type { color: var(--muted); font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .theme-empty { margin: 8px 0; color: var(--muted); font-size: 13px; }

  .filmstrip { display: grid; gap: 10px; }
  .filmstrip-head {
    display: flex; justify-content: space-between; gap: 12px; color: var(--muted);
    font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  }
  .filmstrip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
  .thumb {
    position: relative; display: grid; gap: 6px; min-width: 0; border: 0; border-radius: 12px; padding: 4px;
    background: transparent; color: var(--fg); font: inherit; text-align: left; cursor: pointer;
    -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
  }
  .filmstrip-hint { color: var(--muted); font-size: 12px; font-weight: 600; letter-spacing: 0; text-transform: none; }
  .filmstrip-hint[hidden] { display: none; }
  .filmstrip-grid.is-reorderable .thumb { cursor: grab; }
  .filmstrip-grid.is-dragging, .filmstrip-grid.is-dragging .thumb { cursor: grabbing; }
  .thumb.is-drag-source { opacity: 0.35; }
  .thumb:is(.drop-before, .drop-after)::before {
    content: ""; position: absolute; top: 4px; bottom: 26px; width: 4px; border-radius: 4px; background: var(--accent);
  }
  .thumb.drop-before::before { left: -8px; }
  .thumb.drop-after::before { right: -8px; }
  .drag-ghost {
    position: fixed; top: 0; left: 0; z-index: 50; pointer-events: none; opacity: 0.92;
    border-radius: 8px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  }
  .thumb .slide-frame { border-radius: 8px; }
  .thumb:hover .slide-frame { border-color: var(--accent); }
  .thumb[aria-current="true"] { box-shadow: 0 0 0 2px var(--accent); }
  .thumb-caption { display: flex; gap: 6px; min-width: 0; font-size: 12px; font-weight: 600; }
  .thumb-num { flex: none; color: var(--muted); }
  .thumb-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .empty-state {
    border: 1px dashed color-mix(in srgb, var(--line) 60%, transparent); border-radius: 12px; padding: 24px;
    color: var(--muted); background: color-mix(in srgb, var(--surface) 40%, transparent); text-align: center; font-size: 14px;
  }
  .is-loading :is(.slide-frame, .badge, .button, .thumb) { opacity: 0.6; pointer-events: none; }
  @media (max-width: 560px) {
    .deck-shell { padding: 16px; }
    .filmstrip-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  /* Presenting hides everything else, so an inline host that refuses
     fullscreen shrinks the iframe to the presenter instead of stretching it. */
  .deck-shell[data-mode="present"] > :not(.presenter) { display: none; }
  .presenter { display: grid; gap: 12px; }
  .presenter[hidden] { display: none; }
  .presenter-bar, .presenter-nav { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .presenter-nav { justify-content: center; }
  .presenter-counter { color: var(--muted); font-size: 14px; font-weight: 700; }
  .presenter .slide-frame { width: min(100%, calc((100vh - 150px) * 16 / 9)); margin: 0 auto; }
  .presenter .button { width: auto; min-height: 36px; }
`;

let stylesInjected = false;

type DeckViewModel = {
  id: string;
  title: string;
  /** The theme actually painted: a catalog name, never a stored style prompt. */
  themeName: string;
  slideCount: number;
  updatedAt: string;
  isPublished: boolean;
  shareUrl: string;
  openUrl: string;
  actions: Record<string, unknown>;
  /** What the widget shows: raw slides when it has them, else the widget summary. */
  slides: unknown[];
  /** Raw slides from `data.presentation.slides`, the only shape safe to save. */
  rawSlides: unknown[];
};

const EMPTY_DECK: DeckViewModel = {
  id: '',
  title: 'Deck preview',
  themeName: 'Default',
  slideCount: 0,
  updatedAt: '',
  isPublished: false,
  shareUrl: '',
  openUrl: '',
  actions: {},
  slides: [],
  rawSlides: [],
};

function ensureDeckStyles(): void {
  if (stylesInjected) return;
  injectStyles(deckStyles);
  stylesInjected = true;
}

function ensureMarkup(): void {
  if (document.getElementById('verto-deck-widget')) {
    return;
  }

  document.body.innerHTML = `
    <main class="deck-shell" id="verto-deck-widget">
      <div class="vt-links" id="deck-links"></div>
      <section class="deck-header" aria-labelledby="title">
        <div class="deck-kicker">Verto AI deck</div>
        <h1 class="deck-title" id="title">Deck preview</h1>
        <p class="deck-summary" id="summary">Waiting for deck data.</p>
        <div class="badge-row" id="badges" aria-label="Deck metadata"></div>
      </section>
      <section class="deck-stage" aria-label="Deck overview">
        <div class="stage-col">
          <article class="slide-frame" id="cover-preview" aria-label="Selected slide"></article>
          <div class="stage-bar" id="slide-tools" role="toolbar" aria-label="Slide tools">
            <div class="stage-caption" aria-live="polite">
              <span class="stage-pos" id="stage-pos">Slide 0 of 0</span>
              <span class="stage-name" id="stage-name">Deck preview</span>
            </div>
            <div class="stage-tools">
              <button class="tool-btn" id="move-up-action" type="button"></button>
              <button class="tool-btn" id="move-down-action" type="button"></button>
              <button class="tool-btn vt-has-icon" id="duplicate-slide-action" type="button">${iconLabel('copy', 'Duplicate')}</button>
              <button class="tool-btn vt-has-icon" id="delete-slide-action" type="button">${iconLabel('trash', 'Delete')}</button>
              <button class="tool-btn vt-has-icon" id="undo-slide-action" type="button" hidden>${iconLabel('rotate-ccw', 'Undo')}</button>
            </div>
          </div>
        </div>
        <aside class="action-panel" id="action-panel" aria-label="Deck actions">
          <p class="action-title">Next action</p>
          <button class="button present-btn vt-has-icon" id="present-action" type="button">${iconLabel('maximize', 'Present live')}</button>
          <div class="action-grid">
            <button class="button vt-has-icon" id="edit-action" type="button">${iconLabel('pencil', 'Edit this slide')}</button>
            <button class="button vt-has-icon" id="theme-action" type="button">${iconLabel('palette', 'Change theme')}</button>
            <a class="button vt-has-icon" id="open-link">${iconLabel('external-link', 'Open in Verto')}</a>
            <button class="button vt-has-icon" id="secondary-action" type="button">${iconLabel('share', 'Copy link')}</button>
            <button class="button vt-has-icon" id="refresh-action" type="button">${iconLabel('refresh', 'Refresh preview')}</button>
          </div>
          <p class="action-note" id="action-note" role="status" aria-live="polite">Open the deck to continue editing in Verto.</p>
        </aside>
        <section class="theme-panel" id="theme-panel" aria-label="Theme picker" hidden>
          <div class="theme-panel-head">
            <h2 class="theme-panel-title">Theme</h2>
            <div class="theme-panel-buttons">
              <button class="tool-btn" id="theme-cancel-btn" type="button">Cancel</button>
              <button class="tool-btn is-primary" id="theme-apply-btn" type="button">Apply</button>
            </div>
          </div>
          <input class="theme-search" id="theme-search" type="search" autocomplete="off" aria-label="Search themes" placeholder="Search ${VERTO_THEMES.length} themes" />
          <div class="theme-list" id="theme-list" aria-label="Themes"></div>
          <p class="action-note" id="theme-note" role="status" aria-live="polite"></p>
        </section>
      </section>
      <section class="filmstrip" aria-label="Slide filmstrip">
        <div class="filmstrip-head">
          <span>Slides <span class="filmstrip-hint" id="filmstrip-hint" hidden>Drag, or Alt + arrow keys, to reorder</span></span>
          <span id="filmstrip-count">0 shown</span>
        </div>
        <div class="filmstrip-grid" id="slides"></div>
      </section>
      <section id="slide-editor" aria-label="Guided slide editor"></section>
      <section class="presenter" id="presenter" aria-label="Presenter" hidden>
        <div class="presenter-bar">
          <span class="presenter-counter" id="presenter-counter">Slide 1 of 1</span>
          <button class="button vt-has-icon" id="presenter-close-btn" type="button">${iconLabel('x', 'Exit presenter')}</button>
        </div>
        <div class="slide-frame" id="presenter-frame"></div>
        <div class="presenter-nav">
          <button class="button vt-has-icon" id="presenter-prev-btn" type="button">${iconLabel('chevron-left', 'Previous')}</button>
          <button class="button primary vt-has-icon" id="presenter-next-btn" type="button">${iconLabel('chevron-right', 'Next')}</button>
        </div>
      </section>
    </main>
  `;

  setButtonIcon(byId('move-up-action'), 'arrow-up', '', 'Move slide earlier');
  setButtonIcon(byId('move-down-action'), 'arrow-down', '', 'Move slide later');
  wireStaticControls();
}

/* ------------------------------------------------------------------ */
/* Payload                                                             */
/* ------------------------------------------------------------------ */

function getDeckPayload(payload: Record<string, unknown>): {
  presentation: Record<string, unknown>;
  slides: unknown[];
  actions: Record<string, unknown>;
} {
  const widget = getRecord(payload.widget);

  if (widget.widget === 'deck_preview') {
    return {
      presentation: getRecord(widget.presentation),
      slides: getArray(widget.slides),
      actions: getRecord(widget.actions),
    };
  }

  const presentation = readPresentation(getRecord(payload.data || payload));

  return {
    presentation,
    slides: getArray(presentation.slides),
    actions: {},
  };
}

/** Tool results put the presentation at `data.presentation` or at `data`. */
function readPresentation(data: Record<string, unknown>): Record<string, unknown> {
  return getRecord(data.presentation || data);
}

function toDeckViewModel(payload: Record<string, unknown>): DeckViewModel {
  const { presentation, slides, actions } = getDeckPayload(payload);
  const rawSlides = extractRawSlides(payload);
  const storedTheme = getString(presentation.theme_name || presentation.themeName);

  return {
    id: getString(presentation.id),
    title: getString(presentation.title, 'Deck preview'),
    themeName: findTheme(storedTheme)?.name ?? 'Default',
    slideCount: getNumber(
      presentation.slide_count ?? presentation.slideCount,
      Math.max(slides.length, rawSlides.length)
    ),
    updatedAt: getString(presentation.updated_at || presentation.updatedAt),
    isPublished: Boolean(presentation.is_published || presentation.isPublished),
    shareUrl: getString(presentation.share_url || presentation.shareUrl),
    openUrl: getString(presentation.open_url || presentation.openUrl || presentation.verto_url || presentation.url),
    actions,
    slides: rawSlides.length > 0 ? rawSlides : slides,
    rawSlides,
  };
}

/**
 * Raw slides live only in `data.presentation.slides`. The widget summary in
 * `widget.slides` is a mapped shape (no type, className or slideName), and
 * saving it back would strip those fields from every slide.
 */
function extractRawSlides(payload: Record<string, unknown>): unknown[] {
  if (!payload.data) return [];
  return getArray(readPresentation(getRecord(payload.data)).slides);
}

function hasDeckData(deck: DeckViewModel): boolean {
  return Boolean(deck.id || deck.title !== 'Deck preview' || deck.slides.length > 0);
}

function getSlideTitle(slide: Record<string, unknown>, index: number): string {
  return cleanSlideName(getString(slide.title || slide.slideName || slide.slide_name, `Slide ${index + 1}`));
}

function getSlidePreview(slide: Record<string, unknown>): string {
  return getString(
    slide.previewText || slide.preview_text || slide.subtitle || slide.description || slide.body
  );
}

function formatUpdatedAt(value: string): string {
  if (!value) return 'Updated time unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Updated time unavailable';
  }

  return `Updated ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)}`;
}

function slideCountLabel(count: number): string {
  return `${count} slide${count === 1 ? '' : 's'}`;
}

function summaryFor(deck: DeckViewModel): string {
  return deck.slides.length > 0
    ? `${slideCountLabel(deck.slideCount)} in the ${deck.themeName} theme. Pick a slide to preview, edit or rearrange it.`
    : 'Deck metadata is ready. Slide previews are still unavailable.';
}

/* ------------------------------------------------------------------ */
/* Slide rendering                                                     */
/* ------------------------------------------------------------------ */

const frameScaler = typeof ResizeObserver === 'function'
  ? new ResizeObserver((entries) => {
      for (const entry of entries) {
        const frame = entry.target as HTMLElement;
        frame.style.setProperty('--vt-scale', String(entry.contentRect.width / CANVAS_WIDTH));
      }
    })
  : null;

/** Paints `slide` into `frame` on the shared scaled canvas. */
function paintSlide(frame: HTMLElement, slide: Record<string, unknown>, index: number, interactive: boolean): void {
  frame.textContent = '';
  frame.classList.add('vt-slide-surface');

  const canvas = document.createElement('div');
  canvas.className = 'slide-canvas';

  if (slide.content) {
    canvas.innerHTML = renderSlideContent(slide.content);
  } else {
    const heading = document.createElement('h2');
    heading.className = 'slide-fallback-title';
    heading.textContent = getSlideTitle(slide, index);
    canvas.appendChild(heading);

    const preview = getSlidePreview(slide);
    if (preview) {
      const text = document.createElement('p');
      text.className = 'slide-fallback-text';
      text.textContent = preview;
      canvas.appendChild(text);
    }
  }

  if (!interactive) {
    // Thumbnails sit inside a button, which must not contain other controls.
    canvas.setAttribute('aria-hidden', 'true');
    canvas.inert = true;
    canvas.querySelectorAll('a[href]').forEach((link) => link.removeAttribute('href'));
  }

  frame.appendChild(canvas);
  const width = frame.getBoundingClientRect().width;
  if (width > 0) frame.style.setProperty('--vt-scale', String(width / CANVAS_WIDTH));
  frameScaler?.observe(frame);
}

function renderBadges(deck: DeckViewModel): void {
  const badges = byId('badges');
  badges.textContent = '';
  badges.appendChild(renderBadge(deck.isPublished ? 'Published' : 'Draft', deck.isPublished ? 'is-published' : ''));
  badges.appendChild(renderBadge(slideCountLabel(deck.slideCount)));
  badges.appendChild(renderThemeBadge(deck.themeName));
  badges.appendChild(renderBadge(formatUpdatedAt(deck.updatedAt)));
}

function renderBadge(label: string, className = ''): HTMLElement {
  const badge = document.createElement('span');
  badge.className = `badge${className ? ` ${className}` : ''}`;
  badge.textContent = label;
  return badge;
}

function renderThemeBadge(themeName: string): HTMLElement {
  const badge = renderBadge('');
  const swatch = document.createElement('span');
  swatch.className = 'vt-swatch';
  swatch.setAttribute('aria-hidden', 'true');
  const theme = findTheme(themeName);
  swatch.style.background = theme ? resolveThemeTokens(theme).accentGradient : 'var(--vt-brand-gradient)';
  badge.appendChild(swatch);
  badge.appendChild(document.createTextNode(themeName));
  return badge;
}

/** The stage: the selected slide at full width, plus its caption and tools. */
function renderCover(deck: DeckViewModel): void {
  const total = deck.slides.length;
  const index = clampIndex(deck, selectedIndex);
  const slide = getRecord(deck.slides[index]);
  const stage = byId('cover-preview');

  if (total === 0) {
    paintSlide(stage, { title: deck.title, previewText: 'Slide previews will appear here.' }, 0, true);
  } else {
    paintSlide(stage, slide, index, true);
  }

  // Count the whole deck, not just the slides a truncated response carried.
  byId('stage-pos').textContent = total > 0
    ? `Slide ${index + 1} of ${Math.max(total, deck.slideCount)}`
    : 'No slides yet';
  byId('stage-name').textContent = total > 0 ? getSlideTitle(slide, index) : deck.title;
  configureSlideTools(deck);
}

function renderSlides(deck: DeckViewModel): void {
  // The thumbnails a drag was measuring are about to be replaced.
  endThumbDrag();
  const container = byId('slides');
  container.querySelectorAll('.slide-frame').forEach((frame) => frameScaler?.unobserve(frame));
  container.textContent = '';
  const shown = deck.slides;
  const reorderable = canReorder(deck);
  byId('filmstrip-count').textContent = `${shown.length} shown`;

  if (shown.length === 0) {
    const item = document.createElement('div');
    item.className = 'empty-state';
    item.textContent = 'Slide previews are not available yet. Open the deck to inspect the full presentation.';
    container.appendChild(item);
    return;
  }

  shown.forEach((slide, index) => {
    const record = getRecord(slide);
    const title = getSlideTitle(record, index);
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'slide-card thumb';
    thumb.dataset.index = String(index);
    thumb.setAttribute('aria-label', `Slide ${index + 1}: ${title}`);
    thumb.setAttribute('aria-current', index === selectedIndex ? 'true' : 'false');
    thumb.tabIndex = index === selectedIndex ? 0 : -1;
    if (reorderable) {
      thumb.setAttribute('aria-describedby', 'filmstrip-hint');
      thumb.setAttribute('aria-keyshortcuts', 'Alt+ArrowLeft Alt+ArrowRight');
    }

    const frame = document.createElement('div');
    frame.className = 'slide-frame';
    thumb.appendChild(frame);

    const caption = document.createElement('span');
    caption.className = 'thumb-caption';
    caption.setAttribute('aria-hidden', 'true');
    const num = document.createElement('span');
    num.className = 'thumb-num';
    num.textContent = String(index + 1);
    const name = document.createElement('span');
    name.className = 'thumb-name';
    name.textContent = title;
    caption.append(num, name);
    thumb.appendChild(caption);

    thumb.onclick = () => selectSlide(index);
    container.appendChild(thumb);
    paintSlide(frame, record, index, false);
  });
}

function clampIndex(deck: DeckViewModel, index: number): number {
  return Math.max(0, Math.min(index, Math.max(0, deck.slides.length - 1)));
}

let selectedIndex = 0;

function selectSlide(index: number, focus = false): void {
  const deck = currentDeck;
  if (!deck) return;

  selectedIndex = clampIndex(deck, index);
  renderCover(deck);

  byId('slides').querySelectorAll<HTMLButtonElement>('.thumb').forEach((thumb) => {
    const isSelected = Number(thumb.dataset.index) === selectedIndex;
    thumb.setAttribute('aria-current', isSelected ? 'true' : 'false');
    thumb.tabIndex = isSelected ? 0 : -1;
    if (isSelected && focus) thumb.focus();
  });
}

/** Arrow keys walk the filmstrip; Home/End jump to either end. */
function onFilmstripKey(event: KeyboardEvent): void {
  const deck = currentDeck;
  if (!deck || !(event.target instanceof HTMLElement) || !event.target.classList.contains('thumb')) return;

  const last = deck.slides.length - 1;
  const moves: Record<string, number> = {
    ArrowRight: selectedIndex + 1,
    ArrowDown: selectedIndex + 1,
    ArrowLeft: selectedIndex - 1,
    ArrowUp: selectedIndex - 1,
    Home: 0,
    End: last,
  };

  if (!(event.key in moves)) return;
  event.preventDefault();

  // Alt+Arrow is the keyboard twin of dragging: it moves the slide itself.
  if (event.altKey && event.key.startsWith('Arrow') && canReorder(deck)) {
    const to = Math.max(0, Math.min(moves[event.key], last));
    if (to !== selectedIndex) void runSlideChange('move', { to });
    return;
  }

  selectSlide(Math.max(0, Math.min(moves[event.key], last)), true);
}

/* ------------------------------------------------------------------ */
/* Slide structure: move, duplicate, delete, undo                      */
/* ------------------------------------------------------------------ */

let saving = false;
let deleteArmedFor = '';
let deleteArmTimer = 0;
let undoSnapshot: { deckId: string; slide: unknown; index: number } | null = null;
let undoTimer = 0;
/** Set by a delete, armed only once the server confirms the save. */
let armUndoAfterSave: { deckId: string; slide: unknown; index: number } | null = null;

/**
 * Structural edits send the whole slide array, so they are only allowed when
 * the widget can see every slide. A truncated response (40 slides or 200 KB)
 * saved back would delete the slides it left out.
 */
function structureBlockedReason(deck: DeckViewModel): string {
  if (!deck.id || !deck.actions.canUpdateSlides) return 'Slide changes are not available for this deck.';
  if (deck.slides.length < deck.slideCount) {
    return 'This deck is larger than chat can load, so slide changes are off here. Open it in Verto to reorder or delete slides.';
  }
  return '';
}

function canReorder(deck: DeckViewModel): boolean {
  return !structureBlockedReason(deck) && deck.slides.length > 1;
}

function configureSlideTools(deck: DeckViewModel): void {
  const blocked = Boolean(structureBlockedReason(deck)) || deck.slides.length === 0;
  const count = deck.slides.length;
  const setEnabled = (id: string, enabled: boolean) => {
    (byId(id) as HTMLButtonElement).disabled = !enabled || saving;
  };

  setEnabled('move-up-action', !blocked && selectedIndex > 0);
  setEnabled('move-down-action', !blocked && selectedIndex < count - 1);
  setEnabled('duplicate-slide-action', !blocked);
  setEnabled('delete-slide-action', !blocked && count > 1);
  byId('filmstrip-hint').hidden = !canReorder(deck);
  byId('slides').classList.toggle('is-reorderable', canReorder(deck));
  byId('undo-slide-action').hidden = !undoSnapshot || undoSnapshot.deckId !== deck.id;
  resetDeleteArm();
}

function resetDeleteArm(): void {
  deleteArmedFor = '';
  window.clearTimeout(deleteArmTimer);
  const button = byId('delete-slide-action');
  button.classList.remove('is-danger');
  setControlLabel(button, 'Delete');
}

function wireStaticControls(): void {
  byId('move-up-action').onclick = () => void runSlideChange('move', { to: selectedIndex - 1 });
  byId('move-down-action').onclick = () => void runSlideChange('move', { to: selectedIndex + 1 });
  byId('duplicate-slide-action').onclick = () => void runSlideChange('duplicate');
  byId('delete-slide-action').onclick = () => confirmOrDeleteSlide();
  byId('undo-slide-action').onclick = () => void undoLastDelete();
  byId('slides').addEventListener('keydown', onFilmstripKey);
  wireThumbnailDrag(byId('slides'));

  byId('theme-search').addEventListener('input', () => renderThemeList());
  byId('theme-cancel-btn').onclick = () => closeThemePicker(true);
  byId('theme-apply-btn').onclick = () => void applyPickedTheme();
  byId('theme-panel').addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeThemePicker(true);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Drag to reorder                                                     */
/* ------------------------------------------------------------------ */

/**
 * Pointer events rather than HTML5 drag and drop, which never fires for
 * touch. A mouse drag starts after a few pixels of travel. A touch drag
 * needs a long press, so a swipe across the filmstrip still scrolls the
 * chat instead of grabbing a slide.
 */
const DRAG_START_PX = 6;
const TOUCH_HOLD_MS = 300;
const TOUCH_SLOP_PX = 8;

type ThumbDrag = {
  pointerId: number;
  from: number;
  /** The slide object picked up, so a drop after a refresh cannot move another. */
  slide: unknown;
  source: HTMLElement;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  touch: boolean;
  active: boolean;
  slot: number;
  holdTimer: number;
  ghost: HTMLElement | null;
};

let thumbDrag: ThumbDrag | null = null;
let suppressThumbClick = false;

function wireThumbnailDrag(grid: HTMLElement): void {
  grid.addEventListener('pointerdown', (event) => {
    const thumb = (event.target as HTMLElement).closest<HTMLElement>('.thumb');
    const deck = currentDeck;
    if (!thumb || !deck || event.button !== 0 || saving || thumbDrag) return;
    if (!canReorder(deck)) return;

    const rect = thumb.getBoundingClientRect();
    const from = Number(thumb.dataset.index);
    thumbDrag = {
      pointerId: event.pointerId,
      from,
      slide: deck.slides[from],
      source: thumb,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      touch: event.pointerType === 'touch',
      active: false,
      slot: from,
      holdTimer: 0,
      ghost: null,
    };

    if (thumbDrag.touch) {
      const pending = thumbDrag;
      pending.holdTimer = window.setTimeout(() => {
        if (thumbDrag === pending) startThumbDrag(pending, pending.startX, pending.startY);
      }, TOUCH_HOLD_MS);
    }
  });

  window.addEventListener('pointermove', (event) => {
    const drag = thumbDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const travel = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.active) {
      if (drag.touch) {
        // Moving before the hold completes is a scroll, not a drag.
        if (travel > TOUCH_SLOP_PX) endThumbDrag();
        return;
      }
      if (travel < DRAG_START_PX) return;
      startThumbDrag(drag, event.clientX, event.clientY);
    }

    event.preventDefault();
    trackThumbDrag(drag, event.clientX, event.clientY);
  });

  window.addEventListener('pointerup', (event) => {
    const drag = thumbDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.active) {
      endThumbDrag();
      return;
    }

    const to = dropTargetIndex(drag.from, drag.slot);
    const sameSlide = currentDeck?.slides[drag.from] === drag.slide;
    endThumbDrag();
    // The click that follows a drag must not re-select the slide under the
    // pointer. Reset on the next tick in case no click arrives.
    suppressThumbClick = true;
    window.setTimeout(() => { suppressThumbClick = false; }, 0);
    if (to !== drag.from && sameSlide) void runSlideChange('move', { from: drag.from, to });
  });

  window.addEventListener('pointercancel', (event) => {
    if (thumbDrag && event.pointerId === thumbDrag.pointerId) endThumbDrag();
  });

  // A release outside the iframe can go to the host page instead. Losing
  // capture before our pointerup, or the frame losing focus, ends the drag.
  grid.addEventListener('lostpointercapture', (event) => {
    if (thumbDrag?.active && event.pointerId === thumbDrag.pointerId) endThumbDrag();
  });
  window.addEventListener('blur', () => endThumbDrag());

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && thumbDrag?.active) {
      event.preventDefault();
      endThumbDrag();
      byId('action-note').textContent = 'Drag cancelled. The slide order is unchanged.';
    }
  });

  grid.addEventListener('click', (event) => {
    if (suppressThumbClick) {
      event.stopPropagation();
      event.preventDefault();
      suppressThumbClick = false;
    }
  }, true);

  // Once a touch drag is live, the finger moves the slide, not the page.
  document.addEventListener('touchmove', (event) => {
    if (thumbDrag?.active) event.preventDefault();
  }, { passive: false });
  grid.addEventListener('contextmenu', (event) => {
    if (thumbDrag) event.preventDefault();
  });
}

function startThumbDrag(drag: ThumbDrag, x: number, y: number): void {
  drag.active = true;
  try {
    drag.source.setPointerCapture(drag.pointerId);
  } catch {
    // The pointer is already gone; lostpointercapture or blur cleans up.
  }
  byId('slides').classList.add('is-dragging');
  drag.source.classList.add('is-drag-source');

  const frame = drag.source.querySelector<HTMLElement>('.slide-frame');
  if (frame) {
    const ghost = frame.cloneNode(true) as HTMLElement;
    ghost.classList.add('drag-ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.width = `${frame.getBoundingClientRect().width}px`;
    document.body.appendChild(ghost);
    drag.ghost = ghost;
  }

  trackThumbDrag(drag, x, y);
}

/** Moves the ghost and works out which gap the pointer is over. */
function trackThumbDrag(drag: ThumbDrag, x: number, y: number): void {
  if (drag.ghost) {
    drag.ghost.style.transform = `translate(${x - drag.offsetX}px, ${y - drag.offsetY}px) rotate(2deg)`;
  }

  const thumbs = [...byId('slides').querySelectorAll<HTMLElement>('.thumb')];
  let nearest: { index: number; after: boolean; distance: number } | null = null;

  for (const thumb of thumbs) {
    const rect = thumb.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const distance = Math.hypot(x - cx, (y - cy) * 1.5);
    if (!nearest || distance < nearest.distance) {
      nearest = { index: Number(thumb.dataset.index), after: x > cx, distance };
    }
  }

  if (!nearest) return;
  drag.slot = nearest.index + (nearest.after ? 1 : 0);

  for (const thumb of thumbs) {
    const index = Number(thumb.dataset.index);
    thumb.classList.toggle('drop-before', !nearest.after && index === nearest.index);
    thumb.classList.toggle('drop-after', nearest.after && index === nearest.index);
  }

  // Dropping a slide next to itself changes nothing, so show no marker.
  if (dropTargetIndex(drag.from, drag.slot) === drag.from) {
    thumbs.forEach((thumb) => thumb.classList.remove('drop-before', 'drop-after'));
  }
}

function endThumbDrag(): void {
  const drag = thumbDrag;
  if (!drag) return;
  window.clearTimeout(drag.holdTimer);
  drag.ghost?.remove();
  drag.source.classList.remove('is-drag-source');
  const grid = byId('slides');
  grid.classList.remove('is-dragging');
  grid.querySelectorAll('.drop-before, .drop-after').forEach((thumb) =>
    thumb.classList.remove('drop-before', 'drop-after')
  );
  thumbDrag = null;
}

function confirmOrDeleteSlide(): void {
  const deck = currentDeck;
  if (!deck) return;

  const key = `${deck.id}:${selectedIndex}`;
  const button = byId('delete-slide-action');

  if (deleteArmedFor !== key) {
    deleteArmedFor = key;
    button.classList.add('is-danger');
    setControlLabel(button, 'Confirm delete');
    byId('action-note').textContent = `Click again to delete slide ${selectedIndex + 1}. You can undo it for a few seconds.`;
    window.clearTimeout(deleteArmTimer);
    deleteArmTimer = window.setTimeout(resetDeleteArm, CONFIRM_WINDOW_MS);
    return;
  }

  resetDeleteArm();
  void runSlideChange('delete');
}

function newSlideId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `slide-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Applies a structural change: paint it at once, save the whole array, adopt
 * what the server returns, and put everything back if the save fails.
 */
async function runSlideChange(
  kind: 'move' | 'duplicate' | 'delete',
  target: { from?: number; to?: number } = {}
): Promise<void> {
  const deck = currentDeck;
  if (!deck || saving) return;

  // Keyboard moves keep focus in the filmstrip across the re-render.
  const keepFocus = byId('slides').contains(document.activeElement);

  const note = byId('action-note');
  const blocked = structureBlockedReason(deck);
  if (blocked) {
    note.textContent = blocked;
    return;
  }

  saving = true;
  const before = { slides: deck.slides, rawSlides: deck.rawSlides, count: deck.slideCount, selected: selectedIndex };

  try {
    // Widget-only payloads carry the mapped summary; fetch the real slides
    // once before the first change so nothing structural is lost.
    const base = deck.rawSlides.length > 0 ? deck.rawSlides : await fetchCompleteRawSlides(deck);
    const from = target.from ?? selectedIndex;
    let next: unknown[];
    let nextSelected: number;
    let message: string;

    if (kind === 'move') {
      nextSelected = target.to ?? from;
      next = moveSlide(base, from, nextSelected);
      message = `Moved slide ${from + 1} to position ${nextSelected + 1}.`;
    } else if (kind === 'duplicate') {
      next = duplicateSlide(base, from, newSlideId);
      nextSelected = from + 1;
      message = `Duplicated slide ${from + 1}.`;
    } else {
      const removal = removeSlide(base, from);
      next = removal.slides;
      nextSelected = Math.min(from, next.length - 1);
      // The previous Undo stays live until this save succeeds; armUndo then
      // replaces it. Clearing it here would lose it if the save fails.
      message = `Deleted slide ${from + 1}. Undo is available for ${UNDO_WINDOW_MS / 1000} seconds.`;
      armUndoAfterSave = { deckId: deck.id, slide: removal.removed, index: from };
    }

    showSlides(deck, next, nextSelected);
    note.textContent = 'Saving…';

    showSlides(deck, await saveSlides(deck, next), nextSelected);

    if (kind === 'delete' && armUndoAfterSave) armUndo(armUndoAfterSave);
    note.textContent = message;
    pushSlideStructureContext(deck, kind, from, nextSelected);
  } catch (error) {
    deck.slides = before.slides;
    deck.rawSlides = before.rawSlides;
    deck.slideCount = before.count;
    selectedIndex = before.selected;
    renderBadges(deck);
    renderCover(deck);
    renderSlides(deck);
    note.textContent = `${getActionErrorMessage(error)} Nothing was changed.`;
  } finally {
    armUndoAfterSave = null;
    saving = false;
    configureSlideTools(deck);
    if (keepFocus) {
      byId('slides').querySelector<HTMLElement>(`.thumb[data-index="${selectedIndex}"]`)?.focus();
    }
  }
}

function showSlides(deck: DeckViewModel, slides: unknown[], selected: number): void {
  deck.slides = slides;
  deck.rawSlides = slides;
  deck.slideCount = slides.length;
  selectedIndex = clampIndex(deck, selected);
  byId('summary').textContent = summaryFor(deck);
  renderBadges(deck);
  renderCover(deck);
  renderSlides(deck);
}

function armUndo(snapshot: { deckId: string; slide: unknown; index: number }): void {
  undoSnapshot = snapshot;
  byId('undo-slide-action').hidden = false;
  window.clearTimeout(undoTimer);
  undoTimer = window.setTimeout(() => {
    undoSnapshot = null;
    byId('undo-slide-action').hidden = true;
  }, UNDO_WINDOW_MS);
}

async function undoLastDelete(): Promise<void> {
  const deck = currentDeck;
  const snapshot = undoSnapshot;
  if (!deck || !snapshot || snapshot.deckId !== deck.id || saving) return;

  const note = byId('action-note');
  const withoutSlide = deck.rawSlides;
  const restored = insertSlide(withoutSlide, snapshot.slide, snapshot.index);

  saving = true;
  window.clearTimeout(undoTimer);
  undoSnapshot = null;
  showSlides(deck, restored, snapshot.index);

  try {
    showSlides(deck, await saveSlides(deck, restored), snapshot.index);
    note.textContent = `Restored slide ${snapshot.index + 1}.`;
    pushSlideStructureContext(deck, 'restore', snapshot.index, snapshot.index);
  } catch (error) {
    showSlides(deck, withoutSlide, snapshot.index);
    note.textContent = `${getActionErrorMessage(error)} The slide is still deleted.`;
  } finally {
    saving = false;
    configureSlideTools(deck);
  }
}

/** Saves the full array; returns the server's slides when it sends them back. */
async function saveSlides(deck: DeckViewModel, slides: unknown[]): Promise<unknown[]> {
  const result = await callMcpTool('presentation_update_slides', {
    presentation_id: deck.id,
    slides,
  });

  const returned = extractRawSlides(result);
  if (returned.length === slides.length) return returned;

  const refreshed = await callMcpTool('presentation_get', {
    presentation_id: deck.id,
    include_slides: true,
  });
  const fresh = extractRawSlides(refreshed);
  return fresh.length === slides.length ? fresh : slides;
}

/**
 * Reads the deck's current raw slides and refuses a partial list: saving one
 * back would delete every slide the response left out.
 */
async function fetchCompleteRawSlides(deck: DeckViewModel): Promise<unknown[]> {
  const payload = await callMcpTool('presentation_get', {
    presentation_id: deck.id,
    include_slides: true,
  });
  const slides = extractRawSlides(payload);
  const total = getNumber(readPresentation(getRecord(payload.data)).slide_count, slides.length);

  if (slides.length === 0) {
    throw new Error('Could not read the current slides from Verto.');
  }
  if (slides.length < total) {
    throw new Error('This deck is larger than chat can load, so it can only be changed in Verto.');
  }

  deck.rawSlides = slides;
  return slides;
}

function pushSlideStructureContext(
  deck: DeckViewModel,
  kind: 'move' | 'duplicate' | 'delete' | 'restore',
  from: number,
  to: number
): void {
  const verbs = {
    move: `moved slide ${from + 1} to position ${to + 1}`,
    duplicate: `duplicated slide ${from + 1}`,
    delete: `deleted slide ${from + 1}`,
    restore: `restored the deleted slide ${from + 1}`,
  };

  void pushModelContext(
    { event: 'slides_restructured', presentationId: deck.id, change: kind, from, to, slideCount: deck.slides.length },
    `User ${verbs[kind]} in presentation ${deck.title} (${deck.id}) from chat. It now has ${slideCountLabel(deck.slides.length)}.`
  );
}

/* ------------------------------------------------------------------ */
/* Theme picker                                                        */
/* ------------------------------------------------------------------ */

let themeBeforePicker = '';
let pickedTheme = '';
let applyingTheme = false;

function openThemePicker(deck: DeckViewModel): void {
  themeBeforePicker = deck.themeName;
  pickedTheme = deck.themeName;
  const search = byId('theme-search') as HTMLInputElement;
  search.value = '';
  byId('theme-note').textContent = `Current theme: ${deck.themeName}. Pick one to preview it on the slides.`;
  byId('action-panel').hidden = true;
  byId('theme-panel').hidden = false;
  renderThemeList();
  byId('theme-list').querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' });
  search.focus({ preventScroll: true });
}

function closeThemePicker(restore: boolean): void {
  // Cancel or Escape mid-save would repaint the old theme while the new one
  // is being stored; the Apply result decides what the deck looks like.
  if (applyingTheme && restore) return;
  if (restore && currentDeck) {
    previewTheme(themeBeforePicker);
  }
  byId('theme-panel').hidden = true;
  byId('action-panel').hidden = false;
  byId('theme-action').focus({ preventScroll: true });
}

function renderThemeList(): void {
  const list = byId('theme-list');
  const query = (byId('theme-search') as HTMLInputElement).value;
  const themes = filterThemes(VERTO_THEMES, query);
  list.textContent = '';

  if (themes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'theme-empty';
    empty.textContent = `No theme matches "${query}".`;
    list.appendChild(empty);
    return;
  }

  for (const theme of themes) {
    const tokens = resolveThemeTokens(theme);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'theme-card';
    card.dataset.themeName = theme.name;
    card.setAttribute('aria-pressed', theme.name === pickedTheme ? 'true' : 'false');

    // A thumbnail of the theme itself: slide background, heading font in the
    // slide text color, and the accent as an underline.
    const chip = document.createElement('span');
    chip.className = 'theme-chip';
    chip.setAttribute('aria-hidden', 'true');
    chip.textContent = 'Aa';
    chip.style.backgroundColor = tokens.slideBackgroundSolid;
    chip.style.backgroundImage = /gradient\(/i.test(tokens.slideBackground) ? tokens.slideBackground : 'none';
    chip.style.color = tokens.slideForeground;
    chip.style.fontFamily = tokens.headingFontFamily;
    chip.style.setProperty('--chip-accent', tokens.accentGradient);

    const text = document.createElement('span');
    text.className = 'theme-card-text';
    const name = document.createElement('span');
    name.className = 'theme-card-name';
    name.textContent = theme.name;
    const type = document.createElement('span');
    type.className = 'theme-card-type';
    type.textContent = theme.type;
    text.append(name, type);

    card.append(chip, text);
    card.onclick = () => {
      pickedTheme = theme.name;
      previewTheme(theme.name);
      list.querySelectorAll('.theme-card').forEach((other) =>
        other.setAttribute('aria-pressed', other === card ? 'true' : 'false')
      );
      byId('theme-note').textContent = theme.name === themeBeforePicker
        ? `${theme.name} is the current theme.`
        : `Previewing ${theme.name}. Apply to save it to the deck.`;
    };
    list.appendChild(card);
  }
}

/** Repaints the widget in `themeName` without saving anything. */
function previewTheme(themeName: string): void {
  const deck = currentDeck;
  if (!deck) return;

  setWidgetTheme(themeName);
  renderBadges({ ...deck, themeName });
  // The render kernel reads theme colors at render time (callout contrast),
  // so the slides are re-rendered, not just re-colored.
  renderCover(deck);
  renderSlides(deck);
}

async function applyPickedTheme(): Promise<void> {
  const deck = currentDeck;
  if (!deck) return;

  const themeName = pickedTheme;
  if (themeName === themeBeforePicker) {
    closeThemePicker(false);
    byId('action-note').textContent = `${themeName} is already this deck's theme.`;
    return;
  }

  const button = byId('theme-apply-btn') as HTMLButtonElement;
  const cancel = byId('theme-cancel-btn') as HTMLButtonElement;
  applyingTheme = true;
  button.disabled = true;
  cancel.disabled = true;
  button.textContent = 'Applying…';

  try {
    await callMcpTool('presentation_update_theme', {
      presentation_id: deck.id,
      theme_name: themeName,
    });

    deck.themeName = themeName;
    themeBeforePicker = themeName;
    previewTheme(themeName);
    byId('summary').textContent = summaryFor(deck);
    closeThemePicker(false);
    byId('action-note').textContent = `Theme updated to ${themeName}.`;

    void pushModelContext(
      { event: 'theme_changed', presentationId: deck.id, themeName },
      `User updated the presentation theme to "${themeName}" from chat.`
    );
  } catch (error) {
    byId('theme-note').textContent = getActionErrorMessage(error);
  } finally {
    applyingTheme = false;
    button.disabled = false;
    cancel.disabled = false;
    button.textContent = 'Apply';
  }
}

/* ------------------------------------------------------------------ */
/* Deck actions                                                        */
/* ------------------------------------------------------------------ */

function setDisabled(button: HTMLButtonElement, disabled: boolean): void {
  button.disabled = disabled;
  button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
}

function configureOpenLink(deck: DeckViewModel): void {
  const link = byId('open-link');

  if (!(link instanceof HTMLAnchorElement)) return;

  setControlLabel(link, 'Open in Verto');

  if (!deck.openUrl) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    link.onclick = null;
    return;
  }

  link.href = deck.openUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-disabled', 'false');
  link.onclick = (event) => {
    event.preventDefault();
    void openVertoLink(deck.openUrl);
  };
}

let presenterIndex = 0;
let presenterKeyHandler: ((e: KeyboardEvent) => void) | null = null;

function openInWidgetPresenter(deck: DeckViewModel): void {
  const root = byId('verto-deck-widget');
  const presenter = byId('presenter');
  const frame = byId('presenter-frame');
  const prevBtn = byId('presenter-prev-btn') as HTMLButtonElement;
  const nextBtn = byId('presenter-next-btn') as HTMLButtonElement;
  const slides = deck.slides.length > 0 ? deck.slides : [{ title: deck.title, previewText: 'Slide preview unavailable' }];

  void requestDisplayMode('fullscreen');
  root.dataset.mode = 'present';
  presenter.hidden = false;

  const show = (index: number) => {
    presenterIndex = Math.max(0, Math.min(index, slides.length - 1));
    paintSlide(frame, getRecord(slides[presenterIndex]), presenterIndex, true);
    byId('presenter-counter').textContent = `Slide ${presenterIndex + 1} of ${slides.length}`;
    prevBtn.disabled = presenterIndex <= 0;
    nextBtn.disabled = presenterIndex >= slides.length - 1;
  };

  const close = () => {
    presenter.hidden = true;
    delete root.dataset.mode;
    void requestDisplayMode('inline');
    if (presenterKeyHandler) {
      window.removeEventListener('keydown', presenterKeyHandler);
      presenterKeyHandler = null;
    }
    selectSlide(presenterIndex);
  };

  byId('presenter-close-btn').onclick = close;
  prevBtn.onclick = () => show(presenterIndex - 1);
  nextBtn.onclick = () => show(presenterIndex + 1);

  if (presenterKeyHandler) {
    window.removeEventListener('keydown', presenterKeyHandler);
  }

  presenterKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      show(presenterIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      show(presenterIndex - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  window.addEventListener('keydown', presenterKeyHandler);
  show(clampIndex(deck, selectedIndex));
}

function configurePresentAction(deck: DeckViewModel): void {
  const button = byId('present-action');

  if (!(button instanceof HTMLButtonElement)) return;

  // Plan 10 F10: when the host advertises its display modes and fullscreen
  // is not among them, the presenter would only duplicate this preview —
  // hide the hero entry point.
  const fullscreenAvailable = canPresentFullscreen();
  button.hidden = fullscreenAvailable === false;

  setDisabled(button, !deck.id);
  button.onclick = deck.id ? () => presentDeck(deck, button, byId('action-note')) : null;
}

async function presentDeck(
  deck: DeckViewModel,
  button: HTMLButtonElement,
  note: HTMLElement
): Promise<void> {
  await runButtonAction(button, note, 'Opening presenter…', async () => {
    try {
      await callMcpTool('presentation_render_deck', {
        presentation_id: deck.id,
      });
    } catch {
      // Best effort: the in-widget presenter works without it.
    }
    openInWidgetPresenter(deck);
    note.textContent = 'Presenter opened. Use the arrow keys or Space to move, Esc to exit.';
  });
}

function configureThemeAction(deck: DeckViewModel): void {
  const button = byId('theme-action');
  const note = byId('action-note');

  if (!(button instanceof HTMLButtonElement)) return;

  setDisabled(button, !deck.id);
  button.onclick = deck.id ? () => openThemeStudio(deck, button, note) : null;
}

async function openThemeStudio(
  deck: DeckViewModel,
  button: HTMLButtonElement,
  note: HTMLElement
): Promise<void> {
  await runButtonAction(button, note, 'Opening themes…', async () => {
    try {
      await callMcpTool('presentation_render_theme_studio', {
        presentation_id: deck.id,
      });
    } catch {
      // Best effort: the inline picker needs nothing from the server.
    }
    openThemePicker(deck);
  });
}

function configureEditAction(deck: DeckViewModel): void {
  const button = byId('edit-action');

  if (!(button instanceof HTMLButtonElement)) return;

  const canEdit = Boolean(deck.id)
    && Boolean(deck.actions.canUpdateSlides)
    && deck.slides.length > 0;

  setDisabled(button, !canEdit);
  button.onclick = canEdit ? () => openSlideEditor(deck) : null;
}

function configureSecondaryAction(deck: DeckViewModel): void {
  const button = byId('secondary-action');
  const note = byId('action-note');

  if (!(button instanceof HTMLButtonElement)) return;

  setDisabled(button, false);
  button.onclick = null;

  if (deck.shareUrl) {
    setButtonIcon(button, 'copy', 'Copy share link');
    note.textContent = 'This deck is published. Share the public link when you are ready.';
    button.onclick = () => copyShareLink(deck.shareUrl, button, note);
    return;
  }

  if (deck.actions.canPublish !== false && deck.id) {
    setButtonIcon(button, 'share', 'Publish from chat');
    note.textContent = 'Publish when you want a public share link.';
    button.onclick = () => confirmOrPublishDeck(deck, button, note);
    return;
  }

  setButtonIcon(button, 'share', 'Share unavailable');
  setDisabled(button, true);
  note.textContent = 'Sharing is unavailable for this deck state.';
}

function configureRefreshAction(deck: DeckViewModel): void {
  const button = byId('refresh-action');
  const note = byId('action-note');

  if (!(button instanceof HTMLButtonElement)) return;

  setControlLabel(button, 'Refresh preview');
  setDisabled(button, !deck.id);
  button.onclick = deck.id ? () => refreshDeckPreview(deck, button, note) : null;
}

let pendingPublishPresentationId = '';

let currentDeck: DeckViewModel | null = null;
let slideEditorHandle: SlideEditorHandle | null = null;
let teardownWired = false;

/** One teardown handler: the runtime keeps only the last one registered. */
function wireEditorTeardown(): void {
  if (teardownWired) return;
  teardownWired = true;

  onTeardown(() => {
    dismissStreamStatus();
    if (slideEditorHandle?.hasUnsavedEdits()) {
      logWidgetWarning(
        'Verto deck preview was torn down with unsaved guided slide edits.'
      );
    }
  });
}

/**
 * Plan 10 F6: opens the guided editor on the selected slide. Saving re-fetches
 * the deck, applies patches onto the fresh tree, and performs a
 * full-replacement `presentation_update_slides` call before confirming with a
 * diff strip.
 */
function openSlideEditor(deck: DeckViewModel): void {
  slideEditorHandle?.close();
  currentDeck = deck;

  slideEditorHandle = createSlideEditor({
    container: byId('slide-editor'),
    getSlides: () => currentDeck?.slides ?? [],
    canUpdate: Boolean(deck.actions.canUpdateSlides) && deck.slides.length > 0,
    save: (patches) => saveSlideEdits(patches),
    onClose: (hadUnsavedEdits) => {
      if (hadUnsavedEdits) {
        logWidgetWarning('Verto guided slide editor closed with unsaved edits.');
      }
    },
  });

  slideEditorHandle.open(selectedIndex);
}

async function saveSlideEdits(patches: SlideEditPatch[]): Promise<void> {
  const deck = currentDeck;

  if (!deck?.id) {
    throw new Error('This deck is not available for editing.');
  }

  const freshSlides = await fetchCompleteRawSlides(deck);
  const nextSlides = applyPatchesToSlides(freshSlides, patches);

  const result = await callMcpTool('presentation_update_slides', {
    presentation_id: deck.id,
    slides: nextSlides,
  });

  assertSuccess(result);
  syncAfterSave(deck, nextSlides, patches);
}

function assertSuccess(payload: Record<string, unknown>): void {
  if (payload.success === false) {
    const error = getRecord(payload.error);
    throw new Error(getString(error.message, 'Verto could not complete that action.'));
  }
}

function syncAfterSave(
  deck: DeckViewModel,
  nextSlides: unknown[],
  patches: SlideEditPatch[]
): void {
  deck.updatedAt = new Date().toISOString();
  showSlides(deck, nextSlides, selectedIndex);
  byId('action-note').textContent = 'Slide edits saved to Verto.';

  void pushModelContext(
    {
      event: 'slides_edited',
      presentationId: deck.id,
      editedBlocks: patches.length,
      edits: patches.map((patch) => ({
        slideTitle: patch.slideTitle,
        originalText: patch.originalText,
        newText: patch.newText,
      })),
    },
    `User edited ${patches.length} text ${patches.length === 1 ? 'block' : 'blocks'} on `
      + `"${patches[0].slideTitle}" of presentation ${deck.title} (${deck.id}) from chat.`
  );
}

function confirmOrPublishDeck(
  deck: DeckViewModel,
  button: HTMLButtonElement,
  note: HTMLElement
): void {
  if (pendingPublishPresentationId !== deck.id) {
    pendingPublishPresentationId = deck.id;
    setControlLabel(button, 'Confirm publish');
    note.textContent = 'This creates a public share link for this deck.';
    window.setTimeout(() => {
      if (pendingPublishPresentationId === deck.id && getControlLabel(button) === 'Confirm publish') {
        pendingPublishPresentationId = '';
        setControlLabel(button, 'Publish from chat');
        note.textContent = 'Publish when you want a public share link.';
      }
    }, CONFIRM_WINDOW_MS);
    return;
  }

  pendingPublishPresentationId = '';
  void publishDeck(deck, button, note);
}

async function publishDeck(
  deck: DeckViewModel,
  button: HTMLButtonElement,
  note: HTMLElement
): Promise<void> {
  await runButtonAction(button, note, 'Publishing...', async () => {
    const publishedPayload = await callMcpTool('presentation_publish', {
      presentation_id: deck.id,
    });

    try {
      const refreshedPayload = await callMcpTool('presentation_get', {
        presentation_id: deck.id,
        include_slides: true,
      });
      renderDeckPayload(refreshedPayload);
    } catch {
      renderDeckPayload(publishedPayload);
    }

    byId('action-note').textContent = 'Deck published. The share link is ready.';
  });
}

async function refreshDeckPreview(
  deck: DeckViewModel,
  button: HTMLButtonElement,
  note: HTMLElement
): Promise<void> {
  await runButtonAction(button, note, 'Refreshing...', async () => {
    const payload = await callMcpTool('presentation_get', {
      presentation_id: deck.id,
      include_slides: true,
    });
    renderDeckPayload(payload);
    byId('action-note').textContent = 'Preview refreshed from Verto.';
  });
}

async function runButtonAction(
  button: HTMLButtonElement,
  note: HTMLElement,
  busyLabel: string,
  action: () => Promise<void>
): Promise<void> {
  const previousLabel = getControlLabel(button);
  setDisabled(button, true);
  button.classList.add('is-busy');
  setControlLabel(button, busyLabel);

  try {
    await action();
  } catch (error) {
    note.textContent = getActionErrorMessage(error);
  } finally {
    setDisabled(button, false);
    button.classList.remove('is-busy');
    if (getControlLabel(button) === busyLabel) {
      setControlLabel(button, previousLabel);
    }
  }
}

function getActionErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string') {
      return record.message;
    }
  }

  return 'Verto could not complete that action. Try again in a moment.';
}

async function copyShareLink(
  shareUrl: string,
  button: HTMLButtonElement,
  note: HTMLElement
): Promise<void> {
  try {
    await navigator.clipboard?.writeText(shareUrl);
    setControlLabel(button, 'Copied');
    note.textContent = 'Share link copied.';
    window.setTimeout(() => {
      setControlLabel(button, 'Copy share link');
    }, 1400);
  } catch {
    note.textContent = shareUrl;
  }
}

function renderLoading(): void {
  const root = byId('verto-deck-widget');
  root.classList.add('is-loading');
  currentDeck = null;
  byId('title').textContent = 'Loading deck preview';
  byId('summary').textContent = 'Waiting for deck data from Verto.';

  const empty = { ...EMPTY_DECK, themeName: 'Theme pending' };
  renderBadges(empty);
  renderCover(empty);
  configureOpenLink(empty);
  configurePresentAction(empty);
  configureThemeAction(empty);
  configureEditAction(empty);
  configureSecondaryAction({ ...empty, actions: { canPublish: false } });
  configureRefreshAction(empty);
  renderSlides(empty);
}

function renderDeckPayload(payload: Record<string, unknown>): void {
  ensureDeckStyles();
  ensureMarkup();
  wireEditorTeardown();

  const deck = toDeckViewModel(payload);
  const root = byId('verto-deck-widget');

  if (!hasDeckData(deck)) {
    renderLoading();
    return;
  }

  // A refresh of the same deck keeps the selected slide; a new deck starts
  // at slide one.
  if (currentDeck?.id !== deck.id) selectedIndex = 0;
  currentDeck = deck;
  selectedIndex = clampIndex(deck, selectedIndex);

  setWidgetTheme(deck.themeName);
  renderDeepLinkMenu(byId('deck-links'), extractWidgetLinks(payload));

  root.classList.remove('is-loading');
  byId('title').textContent = deck.title;
  byId('summary').textContent = summaryFor(deck);
  byId('theme-panel').hidden = true;
  byId('action-panel').hidden = false;

  renderBadges(deck);
  configureOpenLink(deck);
  configurePresentAction(deck);
  configureThemeAction(deck);
  configureEditAction(deck);
  configureSecondaryAction(deck);
  configureRefreshAction(deck);
  renderCover(deck);
  renderSlides(deck);

  const blocked = structureBlockedReason(deck);
  if (blocked && deck.id && deck.actions.canUpdateSlides) {
    byId('action-note').textContent = blocked;
  }
}

mountWidget((payload) => {
  dismissStreamStatus();
  renderDeckPayload(payload);
});

/* ------------------------------------------------------------------ */
/* Plan D4: streaming partial tool input.                              */
/* While the model composes a large `presentation_update_slides` call,  */
/* hosts that stream partial arguments surface a live "preparing N      */
/* slides" strip so guided edits feel responsive instead of frozen.     */
/* ------------------------------------------------------------------ */

const STREAM_STATUS_ID = 'vdp-stream-status';

function dismissStreamStatus(): void {
  document.getElementById(STREAM_STATUS_ID)?.remove();
}

function showStreamStatus(message: string): void {
  let strip = document.getElementById(STREAM_STATUS_ID);

  if (!strip) {
    const root = document.getElementById('verto-deck-widget');
    if (!root) return;

    strip = document.createElement('div');
    strip.id = STREAM_STATUS_ID;
    strip.setAttribute('role', 'status');
    strip.setAttribute('aria-live', 'polite');
    Object.assign(strip.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      borderRadius: '12px',
      fontSize: '12px',
      lineHeight: '1.4',
      color: 'var(--fg)',
      background: 'var(--surface)',
      border: '1px solid var(--vt-accent, #3b82f6)',
    } as CSSStyleDeclaration);

    strip.appendChild(iconElement('pencil'));

    const label = document.createElement('span');
    label.className = 'vdp-stream-status-label';
    strip.appendChild(label);

    // In flow at the top, not fixed: in an iframe that grows to fit its
    // content, a fixed bottom strip lands thousands of pixels down.
    root.prepend(strip);
  }

  const label = strip.querySelector<HTMLSpanElement>('.vdp-stream-status-label');
  if (label) {
    label.textContent = message;
  }
}

// Registered before connect() per the runtime contract; inert on hosts
// that never stream partial tool input.
onToolInputPartial((args) => {
  if (typeof args.presentation_id !== 'string') return;
  if (!Array.isArray(args.slides)) return;

  const deckId = currentDeck?.id ?? '';
  if (deckId && args.presentation_id !== deckId) return;

  const count = args.slides.filter(
    (slide) => slide && typeof slide === 'object'
  ).length;

  showStreamStatus(`Assistant is updating slides… ${count} received`);
});
