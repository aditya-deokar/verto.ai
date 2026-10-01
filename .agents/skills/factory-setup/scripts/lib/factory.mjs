// GENERATED from shared/lib/factory.mjs by scripts/sync-shared.mjs. Edit the source, then run it.
// Shared helpers for every factory script. Source of truth lives in shared/lib;
// scripts/sync-shared.mjs copies it into each skill, because skills install one
// at a time and cannot import across skill folders.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export const BEATS = ["triage", "spec", "isolate", "build", "prove", "ship", "monitor"];

function git(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** Which agent harness is running this process. FACTORY_HARNESS overrides. */
export function detectHarness(env = process.env) {
  if (env.FACTORY_HARNESS) return env.FACTORY_HARNESS;
  if (env.CLAUDECODE || env.CLAUDE_CODE_ENTRYPOINT) return "claude-code";
  if (Object.keys(env).some((k) => k.startsWith("CODEX_"))) return "codex";
  if (env.CURSOR_TRACE_ID || env.CURSOR_AGENT) return "cursor";
  return "unknown";
}

export function repoRoot(cwd = process.cwd()) {
  return git(["rev-parse", "--show-toplevel"], cwd) || resolve(cwd);
}

export function currentBranch(cwd = process.cwd()) {
  const b = git(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  return b && b !== "HEAD" ? b : null;
}

/** Where .factory/ lives: --dir, then FACTORY_DIR, then the git root. */
export function factoryDir({ dir, cwd } = {}) {
  if (dir) return resolve(dir);
  if (process.env.FACTORY_DIR) return resolve(process.env.FACTORY_DIR);
  return join(repoRoot(cwd), ".factory");
}

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""));
}

export function writeJson(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function listFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => join(dir, f));
}

/**
 * Minimal argv parser. --key value, --key=value, bare --flag is true.
 * Repeated keys collect into an array, so --set a=1 --set b=2 works.
 */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    let key = a.slice(2);
    let val;
    const eq = key.indexOf("=");
    if (eq >= 0) {
      val = key.slice(eq + 1);
      key = key.slice(0, eq);
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      val = argv[++i];
    } else {
      val = true;
    }
    if (key in out) out[key] = [].concat(out[key], val);
    else out[key] = val;
  }
  return out;
}

export function nowIso(d = new Date()) {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function today(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function slugify(s, max = 40) {
  return String(s || "task")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "") || "task";
}

/** "14d", "36h", "2w" to milliseconds. */
export function parseDuration(s) {
  const m = String(s).match(/^(\d+)\s*([hdw])$/);
  if (!m) throw new Error(`bad duration "${s}" (use e.g. 14d, 36h, 2w)`);
  const n = Number(m[1]);
  return n * { h: 3600e3, d: 86400e3, w: 7 * 86400e3 }[m[2]];
}

/** "a=1" to ["a", 1]. Numbers, true, false, and null are coerced. */
export function parseAssignment(s) {
  const eq = String(s).indexOf("=");
  if (eq < 1) throw new Error(`expected key=value, got "${s}"`);
  return [s.slice(0, eq), coerce(s.slice(eq + 1))];
}

export function coerce(v) {
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

export function median(nums) {
  const xs = nums.filter((n) => typeof n === "number").sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

export function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}
