#!/usr/bin/env node

/**
 * Encoding guard for MCP App widget sources.
 *
 * Widget glyphs (arrows, ellipses, the overflow dot-row) are literal
 * characters in the TypeScript sources, and esbuild copies them straight into
 * the generated single-file HTML. When an editor saves one of those files as
 * cp1252 instead of UTF-8, `←` becomes `â†<90>` and ships to every host that
 * renders the widget.
 *
 * This check fails on the two ways that damage arrives:
 *
 *   1. Mojibake — UTF-8 bytes that were decoded as cp1252 and re-encoded.
 *   2. A UTF-8 BOM, which is what leaves an editor in that mode to begin with.
 *
 * Run it over the widget sources and the shared render kernel they bundle.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

const SCAN_DIRS = [
  'src/mcp/apps/components',
  'src/lib/slides/render-core',
];

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.js', '.css']);

/**
 * Mojibake signatures, written as the characters they are (never as the
 * damage itself) so this file stays readable and cannot be broken by the very
 * bug it detects. Each entry is the UTF-8 encoding of `char` re-read as
 * cp1252 — exactly the sequence a mis-saved editor leaves behind.
 */
const RECOVERABLE_GLYPHS = [
  '←', // left arrow
  '→', // right arrow
  '↑', // up arrow
  '↓', // down arrow
  '…', // horizontal ellipsis
  '—', // em dash
  '–', // en dash
  '‘', // left single quote
  '’', // right single quote
  '“', // left double quote
  '”', // right double quote
  '⋯', // midline horizontal ellipsis (overflow menu)
  '≤', // less-than or equal
  '≥', // greater-than or equal
  '§', // section sign
  '·', // middle dot
  '×', // multiplication sign
];

/** cp1252 code points for bytes 0x80-0x9F, which differ from Latin-1. */
const CP1252_HIGH_RANGE = [
  0x20ac, 0x0081, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021,
  0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x008d, 0x017d, 0x008f,
  0x0090, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x009d, 0x017e, 0x0178,
];

/** Renders `char` the way a cp1252 decoder would show its UTF-8 bytes. */
function toMojibake(char) {
  return [...Buffer.from(char, 'utf8')]
    .map((byte) => String.fromCodePoint(
      byte >= 0x80 && byte <= 0x9f ? CP1252_HIGH_RANGE[byte - 0x80] : byte
    ))
    .join('');
}

const SIGNATURES = RECOVERABLE_GLYPHS.map((char) => ({
  char,
  damaged: toMojibake(char),
  name: `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
}));

const failures = [];

for (const dir of SCAN_DIRS) {
  for (const file of await collectFiles(path.join(root, dir))) {
    const text = await readFile(file, 'utf8');
    const relative = path.relative(root, file).replace(/\\/g, '/');

    if (text.charCodeAt(0) === 0xfeff) {
      failures.push(`${relative}: starts with a UTF-8 BOM (save as UTF-8 without BOM).`);
    }

    for (const signature of SIGNATURES) {
      const line = lineOfFirstMatch(text, signature.damaged);
      if (line > 0) {
        failures.push(
          `${relative}:${line}: mojibake for ${signature.name} "${signature.char}" `
          + '(file was saved as cp1252; re-save as UTF-8).'
        );
      }
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[FAIL] ${failure}`);
  }
  console.error(`\n${failures.length} encoding problem(s) found.`);
  process.exit(1);
}

console.log('[PASS] MCP app widget sources are clean UTF-8 (no BOM, no mojibake).');

async function collectFiles(dir) {
  const found = [];
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...await collectFiles(full));
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      found.push(full);
    }
  }

  return found;
}

function lineOfFirstMatch(text, needle) {
  const index = text.indexOf(needle);
  if (index === -1) return 0;
  return text.slice(0, index).split('\n').length;
}
