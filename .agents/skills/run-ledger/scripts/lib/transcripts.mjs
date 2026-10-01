// GENERATED from shared/lib/transcripts.mjs by scripts/sync-shared.mjs. Edit the source, then run it.
// Reads local harness transcripts into one event shape. Nothing here uploads
// anything: callers print aggregates and short quotes only.
//
// Claude Code: ~/.claude/projects/<dir>/<session>.jsonl. Every content block of
// one API response is its own line and repeats the same usage, so usage is
// deduplicated by message id.
// Codex: ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl. token_count events carry
// last_token_usage per turn; input_tokens there includes the cached share.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join } from "node:path";

export function transcriptRoots() {
  return {
    "claude-code": process.env.FACTORY_CLAUDE_DIR || join(homedir(), ".claude", "projects"),
    codex: process.env.FACTORY_CODEX_DIR || join(homedir(), ".codex", "sessions"),
  };
}

function walk(dir, sinceMs, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, sinceMs, out);
    else if (e.name.endsWith(".jsonl")) {
      try {
        if (statSync(p).mtimeMs >= sinceMs) out.push(p);
      } catch {
        /* vanished between readdir and stat */
      }
    }
  }
  return out;
}

/** [{ harness, file }] for transcripts modified since sinceMs. */
export function transcriptFiles(sinceMs = 0) {
  const files = [];
  for (const [harness, root] of Object.entries(transcriptRoots())) {
    if (!existsSync(root)) continue;
    for (const file of walk(root, sinceMs, [])) files.push({ harness, file });
  }
  return files;
}

// The same directory can be spelled differently by git and by a harness: a
// symlinked parent (/var -> /private/var on macOS) or a Windows 8.3 short name
// (RUNNER~1). Resolve to the real path when it still exists, cached because
// every transcript line is compared.
const realCache = new Map();
function real(p) {
  // A path that is not absolute here (C:/x on Linux, a transcript from another
  // machine) cannot be resolved; walking up from it would reach "." and splice
  // in the current directory. Compare those as written.
  if (!isAbsolute(p)) return p;
  if (!realCache.has(p)) {
    // Resolve the nearest ancestor that exists and re-append the rest, so a
    // deleted subfolder of a symlinked repo still maps into the real repo.
    let head = p;
    const tail = [];
    let r = p;
    while (head) {
      try {
        r = join(realpathSync.native(head), ...tail);
        break;
      } catch {
        const parent = dirname(head);
        if (parent === head) break;
        tail.unshift(basename(head));
        head = parent;
      }
    }
    realCache.set(p, r);
  }
  return realCache.get(p);
}

/** Normalises a path for comparison: real path, forward slashes, lower case, /c/ to c:/. */
export function normPath(p) {
  if (!p) return "";
  let s = String(p).replace(/^\/([a-zA-Z])\//, "$1:/");
  s = real(s).replace(/\\/g, "/").replace(/\/+$/, "");
  s = s.replace(/^\/([a-zA-Z])\//, "$1:/");
  return s.toLowerCase();
}

export function inside(childPath, parentPath) {
  const c = normPath(childPath);
  const p = normPath(parentPath);
  return !!c && !!p && (c === p || c.startsWith(p + "/"));
}

// Harness-injected blocks (IDE context, system reminders, command wrappers)
// are not things the person typed, so they must not count as corrections.
function cleanUserText(text) {
  const t = String(text)
    .replace(/<([a-zA-Z][\w-]*)[^>]*>[\s\S]*?<\/\1>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return /^\[Request interrupted/.test(t) ? "" : t;
}

function claudeEvents(lines) {
  const events = [];
  const seenUsage = new Set();
  for (const line of lines) {
    let j;
    try {
      j = JSON.parse(line);
    } catch {
      continue;
    }
    const base = { ts: j.timestamp, cwd: j.cwd, branch: j.gitBranch || null };
    if (j.type === "assistant" && j.message?.usage) {
      const id = j.message.id || j.requestId || j.uuid;
      if (seenUsage.has(id)) continue;
      seenUsage.add(id);
      const u = j.message.usage;
      events.push({
        ...base,
        kind: "usage",
        model: j.message.model || null,
        input: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0),
        cached: u.cache_read_input_tokens || 0,
        output: u.output_tokens || 0,
      });
    } else if (j.type === "user" && !j.isMeta && j.message?.role === "user") {
      const c = j.message.content;
      const parts = typeof c === "string" ? [c] : Array.isArray(c) ? c.filter((x) => x.type === "text").map((x) => x.text) : [];
      const text = cleanUserText(parts.join("\n"));
      if (text) events.push({ ...base, kind: "user", text });
    }
  }
  return events;
}

function codexEvents(lines) {
  const events = [];
  let cwd = null;
  let model = null;
  for (const line of lines) {
    let j;
    try {
      j = JSON.parse(line);
    } catch {
      continue;
    }
    const p = j.payload || {};
    if (j.type === "session_meta" || j.type === "turn_context") {
      cwd = p.cwd || cwd;
      model = p.model || model;
      continue;
    }
    if (j.type !== "event_msg") continue;
    const base = { ts: j.timestamp, cwd, branch: null };
    if (p.type === "user_message" && p.message) {
      const text = cleanUserText(p.message);
      if (text) events.push({ ...base, kind: "user", text });
    } else if (p.type === "token_count" && p.info?.last_token_usage) {
      const u = p.info.last_token_usage;
      const cached = u.cached_input_tokens || 0;
      events.push({
        ...base,
        kind: "usage",
        model,
        input: Math.max(0, (u.input_tokens || 0) - cached),
        cached,
        output: u.output_tokens || 0,
      });
    }
  }
  return events;
}

export function readEvents({ harness, file }) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  const events = harness === "codex" ? codexEvents(lines) : claudeEvents(lines);
  return events.map((e) => ({ ...e, harness, file }));
}

/**
 * Every event from transcripts whose working directory is inside repoPath,
 * between fromMs and toMs. repoPath null means all repositories.
 */
export function collectEvents({ repoPath = null, fromMs = 0, toMs = Infinity, kinds = null } = {}) {
  const out = [];
  for (const t of transcriptFiles(fromMs)) {
    for (const e of readEvents(t)) {
      if (kinds && !kinds.includes(e.kind)) continue;
      const ts = Date.parse(e.ts);
      if (!(ts >= fromMs && ts <= toMs)) continue;
      if (repoPath && !inside(e.cwd, repoPath)) continue;
      out.push(e);
    }
  }
  return out;
}

/** Sums usage events. Returns null when there were none, never zeros. */
export function sumUsage(events) {
  const usage = events.filter((e) => e.kind === "usage");
  if (!usage.length) return null;
  const harnesses = [...new Set(usage.map((e) => e.harness))];
  return {
    input_tokens: usage.reduce((a, e) => a + e.input, 0),
    cached_input_tokens: usage.reduce((a, e) => a + e.cached, 0),
    output_tokens: usage.reduce((a, e) => a + e.output, 0),
    usd: null,
    source: harnesses.join("+") + " transcript",
  };
}
