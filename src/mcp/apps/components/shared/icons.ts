/**
 * Verto widget icon set.
 *
 * Widgets used to draw their controls with literal text glyphs (`←`, `↑`,
 * `⋯`). Those depend on whatever font the host iframe resolves, they sit on
 * the text baseline instead of the button's optical centre, and a single
 * mis-encoded save turns every one of them into mojibake (see
 * `scripts/mcp-apps/check-encoding.mjs`).
 *
 * These are inline SVG instead: no font dependency, crisp at any zoom, and
 * painted in `currentColor` so the host's light/dark theme flows straight
 * through the same token the button label already uses.
 *
 * Geometry is drawn on a 24x24 grid with 2px round-capped strokes, and sized
 * in `em` so an icon tracks the font-size of whatever control holds it.
 */

export type IconName =
  | 'arrow-down'
  | 'arrow-up'
  | 'check'
  | 'chevron-left'
  | 'chevron-right'
  | 'copy'
  | 'external-link'
  | 'eye'
  | 'grid'
  | 'maximize'
  | 'minimize'
  | 'more-horizontal'
  | 'palette'
  | 'pencil'
  | 'refresh'
  | 'rotate-ccw'
  | 'share'
  | 'trash'
  | 'x';

/** Path/shape markup per icon, drawn on a 24x24 viewBox. */
const ICON_SHAPES: Record<IconName, string> = {
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  'arrow-up': '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  copy:
    '<rect x="9" y="9" width="12" height="12" rx="2.5"/>'
    + '<path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/>',
  'external-link':
    '<path d="M14 4h6v6"/><path d="M20 4 11 13"/>'
    + '<path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  eye:
    '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/>'
    + '<circle cx="12" cy="12" r="2.75"/>',
  grid:
    '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/>'
    + '<rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/>'
    + '<rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/>'
    + '<rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  maximize: '<path d="M9 4H4v5"/><path d="M15 4h5v5"/><path d="M15 20h5v-5"/><path d="M9 20H4v-5"/>',
  minimize: '<path d="M4 9h5V4"/><path d="M20 9h-5V4"/><path d="M20 15h-5v5"/><path d="M4 15h5v5"/>',
  'more-horizontal':
    '<circle cx="5.5" cy="12" r="1.35" fill="currentColor" stroke="none"/>'
    + '<circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none"/>'
    + '<circle cx="18.5" cy="12" r="1.35" fill="currentColor" stroke="none"/>',
  palette:
    '<path d="M12 21a9 9 0 1 1 9-9c0 2-1.6 3-3.2 3H16a2 2 0 0 0-1.5 3.3A1.8 1.8 0 0 1 12 21Z"/>'
    + '<circle cx="8" cy="10.5" r="1.1" fill="currentColor" stroke="none"/>'
    + '<circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none"/>'
    + '<circle cx="16" cy="10.5" r="1.1" fill="currentColor" stroke="none"/>',
  pencil: '<path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m14.5 5.5 4 4"/>',
  refresh:
    '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4v5h-5"/>',
  'rotate-ccw':
    '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4v5h5"/>',
  share:
    '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/>'
    + '<circle cx="18" cy="18.5" r="2.5"/>'
    + '<path d="m8.2 10.8 7.6-4"/><path d="m8.2 13.2 7.6 4"/>',
  trash:
    '<path d="M4 6.5h16"/><path d="M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7"/>'
    + '<path d="M6.5 6.5 7.3 19a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5l.8-12.5"/>',
  x: '<path d="M6 6 18 18"/><path d="M18 6 6 18"/>',
};

/**
 * Inline SVG markup for `name`, safe to interpolate into a template string.
 * Always `aria-hidden`: the accessible name comes from the control's label or
 * `aria-label`, never from the icon.
 */
export function icon(name: IconName, size = '1.05em'): string {
  return (
    `<svg class="vt-icon" viewBox="0 0 24 24" width="${size}" height="${size}" `
    + 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    + `stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_SHAPES[name]}</svg>`
  );
}

/**
 * Icon plus label markup for the static `innerHTML` templates. The button
 * holding it needs the `vt-has-icon` class for alignment.
 */
export function iconLabel(name: IconName, label: string): string {
  return `${icon(name)}<span class="vt-btn-label">${label}</span>`;
}

/**
 * The same icon as a detached element, for the DOM-building code paths that
 * never touch `innerHTML`.
 */
export function iconElement(name: IconName, size = '1.05em'): SVGSVGElement {
  const template = document.createElement('template');
  template.innerHTML = icon(name, size);
  return template.content.firstElementChild as SVGSVGElement;
}

/**
 * Fills a button with an icon plus its text label. Icon-only controls pass an
 * empty `label` and keep their own `aria-label`; this sets one from
 * `accessibleName` when the caller has not.
 */
export function setButtonIcon(
  button: HTMLElement,
  name: IconName,
  label: string,
  accessibleName?: string
): void {
  button.textContent = '';
  button.classList.add('vt-has-icon');
  button.appendChild(iconElement(name));

  if (label) {
    const text = document.createElement('span');
    text.className = 'vt-btn-label';
    text.textContent = label;
    button.appendChild(text);
    button.classList.remove('vt-icon-only');
  } else {
    button.classList.add('vt-icon-only');
  }

  const name_ = accessibleName || label;
  if (name_ && !button.getAttribute('aria-label')) {
    button.setAttribute('aria-label', name_);
  }
}

/**
 * Reads the text of a control, ignoring its icon.
 */
export function getControlLabel(element: HTMLElement): string {
  const span = element.querySelector('.vt-btn-label');
  return (span ? span.textContent : element.textContent) || '';
}

/**
 * Rewrites the text of a control without disturbing its icon. Controls swap
 * labels constantly (idle -> busy -> confirm -> idle); assigning
 * `textContent` would wipe the icon on the first swap.
 */
export function setControlLabel(element: HTMLElement, label: string): void {
  const span = element.querySelector('.vt-btn-label');

  if (span) {
    span.textContent = label;
    return;
  }

  element.textContent = label;
}

/**
 * Layout for icon-bearing controls. Injected once with the Verto skin so
 * every widget gets identical icon alignment and sizing.
 */
export const iconStyles = `
  .vt-icon {
    flex: 0 0 auto;
    display: block;
    /* Optical centring: cap height sits slightly above the text baseline. */
    transform: translateY(-0.5px);
  }

  .vt-has-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .vt-icon-only {
    gap: 0;
  }

  .vt-btn-label {
    display: inline-block;
  }

  /* Busy controls swap their label for a spinner; keep the icon steady so the
     button does not jump width mid-action. */
  .vt-has-icon.is-busy .vt-icon {
    animation: vt-icon-pulse 1s ease-in-out infinite;
  }

  @keyframes vt-icon-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }

  @media (prefers-reduced-motion: reduce) {
    .vt-has-icon.is-busy .vt-icon { animation: none; opacity: 0.6; }
  }
`;
