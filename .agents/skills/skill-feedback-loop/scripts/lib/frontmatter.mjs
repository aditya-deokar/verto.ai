// GENERATED from shared/lib/frontmatter.mjs by scripts/sync-shared.mjs. Edit the source, then run it.
// Frontmatter for memory and proposal files. Flat keys only: scalars and
// flow lists like [a, b]. Enough for the files factory scripts write, and
// strict enough that a hand edit that breaks the shape gets reported.

export function parseFrontmatter(text) {
  const m = String(text).replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: null, body: String(text) };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    data[kv[1]] = parseValue(kv[2].trim());
  }
  return { data, body: String(text).slice(m[0].length) };
}

function parseValue(v) {
  if (v === "") return "";
  if (/^\[.*\]$/.test(v))
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => unquote(s.trim()))
      .filter(Boolean);
  if (/^-?\d+$/.test(v)) return Number(v);
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  return unquote(v);
}

function unquote(v) {
  if (/^".*"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"');
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

function formatValue(v) {
  if (Array.isArray(v)) return `[${v.join(", ")}]`;
  if (v === null || v === undefined) return "null";
  if (typeof v !== "string") return String(v);
  // Quote anything a YAML reader could misparse: colons, leading symbols.
  if (v === "" || /: |^[\s#&*!|>'"%@`[{-]|\s$/.test(v) || /^(true|false|null|-?\d+)$/.test(v))
    return JSON.stringify(v);
  return v;
}

export function stringifyFrontmatter(data, body = "") {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${formatValue(v)}`);
  const text = body.replace(/^\n+/, "");
  return `---\n${lines.join("\n")}\n---\n\n${text.endsWith("\n") || !text ? text : text + "\n"}`;
}
