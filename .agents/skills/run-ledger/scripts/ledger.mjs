#!/usr/bin/env node
// Run ledger: one JSON record per task under .factory/runs/.
// Usage: node ledger.mjs <command> [args]   (node ledger.mjs help for the list)
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  BEATS,
  currentBranch,
  detectHarness,
  factoryDir,
  listFiles,
  median,
  nowIso,
  parseArgs,
  parseAssignment,
  parseDuration,
  readJson,
  repoRoot,
  slugify,
  today,
  writeJson,
} from "./lib/factory.mjs";
import { validate } from "./lib/schema.mjs";
import { collectEvents, sumUsage } from "./lib/transcripts.mjs";

const SCHEMA = JSON.parse(readFileSync(new URL("./schemas/run.schema.json", import.meta.url), "utf8"));
const CLASSES = SCHEMA.properties.task.properties.class.enum;
const SIZES = SCHEMA.properties.task.properties.size.enum;
const OUTCOMES = SCHEMA.properties.outcome.enum.filter(Boolean);
const TOUCH_KINDS = SCHEMA.properties.human_touches.items.properties.kind.enum;

const HELP = `run ledger, one record per task in .factory/runs/

  start   --class <c> --size <s> [--title t] [--source ref] [--harness h]
          [--tier t] [--model id] [--rule r]            prints the run id
  current                                               id of the open run on this branch
  beat    <id|current> <beat> [--set k=v]... [--add k=v]...
  touch   <id|current> --beat <b> --kind <k> [--ref url] [--note text]
  finish  <id|current> --outcome <o> [--no-tokens] [--scope worktree|repo]
          --scope repo also counts sessions started in other worktrees of this
          repository (e.g. a session in the main checkout that cd's into the
          task worktree); it over-counts if parallel sessions ran meanwhile
  show    <id|current>
  list    [--open]
  report  [--since 14d] [--json]

classes:  ${CLASSES.join(", ")}
sizes:    ${SIZES.join(", ")}
beats:    ${BEATS.join(", ")}
touches:  ${TOUCH_KINDS.join(", ")}
outcomes: ${OUTCOMES.join(", ")}
Global: --dir <path> overrides the .factory location (also FACTORY_DIR).`;

export { detectHarness };

/** Library code throws; only main() turns errors into exit codes. */
function fail(msg, exitCode = 1) {
  throw Object.assign(new Error(msg), { exitCode });
}

const runsDir = (dir) => join(dir, "runs");
const runPath = (dir, id) => join(runsDir(dir), `${id}.json`);

export function loadRuns(dir) {
  return listFiles(runsDir(dir), ".json").map((f) => readJson(f));
}

export function openRunForBranch(dir, branch) {
  return loadRuns(dir)
    .filter((r) => !r.finished_at && r.branch === branch)
    .sort((a, b) => a.started_at.localeCompare(b.started_at))
    .pop();
}

function resolveId(dir, ref, cwd) {
  if (ref && ref !== "current") return ref;
  const branch = currentBranch(cwd);
  const run = openRunForBranch(dir, branch);
  if (!run) fail(`no open run for branch ${branch || "(detached)"}; start one with: ledger.mjs start`);
  return run.id;
}

function load(dir, id) {
  const p = runPath(dir, id);
  if (!existsSync(p)) fail(`no run record ${id} in ${runsDir(dir)}`);
  return readJson(p);
}

function save(dir, run) {
  const errors = validate(SCHEMA, run);
  if (errors.length) fail(`refusing to write an invalid run record:\n  ${errors.join("\n  ")}`);
  writeJson(runPath(dir, run.id), run);
}

function setPath(obj, key, value) {
  const parts = key.split(".");
  let o = obj;
  for (const p of parts.slice(0, -1)) o = o[p] = typeof o[p] === "object" && o[p] ? o[p] : {};
  o[parts.at(-1)] = value;
}

function addPath(obj, key, value) {
  const parts = key.split(".");
  let o = obj;
  for (const p of parts.slice(0, -1)) o = o[p] = typeof o[p] === "object" && o[p] ? o[p] : {};
  const k = parts.at(-1);
  o[k] = Array.isArray(o[k]) ? o[k] : [];
  if (!o[k].includes(value)) o[k].push(value);
}

export function startRun(dir, opts, { cwd, now = new Date(), rand = Math.random } = {}) {
  if (!CLASSES.includes(opts.class)) fail(`--class must be one of: ${CLASSES.join(", ")}`);
  if (!SIZES.includes(opts.size)) fail(`--size must be one of: ${SIZES.join(", ")}`);
  const branch = currentBranch(cwd);
  const suffix = Math.floor(rand() * 0xffff).toString(16).padStart(4, "0");
  const run = {
    schema: 1,
    id: `${today(now)}-${slugify(opts.title || branch || opts.class, 32)}-${suffix}`,
    title: opts.title || null,
    branch,
    task: { source: opts.source || null, class: opts.class, size: opts.size },
    harness: opts.harness || detectHarness(),
    model: opts.tier || opts.model || opts.rule ? { tier: opts.tier || null, id: opts.model || null, rule: opts.rule || null } : null,
    beats: {},
    memories: { used: [], written: [] },
    human_touches: [],
    cost: null,
    started_at: nowIso(now),
    finished_at: null,
    outcome: null,
  };
  save(dir, run);
  return run;
}

export function recordBeat(dir, id, beat, sets = [], adds = []) {
  if (!BEATS.includes(beat)) fail(`beat must be one of: ${BEATS.join(", ")}`);
  const run = load(dir, id);
  const b = run.beats[beat] || {};
  for (const s of [].concat(sets)) setPath(b, ...parseAssignment(s));
  for (const s of [].concat(adds)) addPath(b, ...parseAssignment(s));
  run.beats[beat] = b;
  save(dir, run);
  return run;
}

export function recordTouch(dir, id, { beat, kind, ref, note }, now = new Date()) {
  if (!BEATS.includes(beat)) fail(`--beat must be one of: ${BEATS.join(", ")}`);
  if (!TOUCH_KINDS.includes(kind)) fail(`--kind must be one of: ${TOUCH_KINDS.join(", ")}`);
  const run = load(dir, id);
  run.human_touches.push({ beat, kind, ref: ref || null, note: note || null, at: nowIso(now) });
  save(dir, run);
  return run;
}

/** Every worktree path of the repository containing cwd. */
function worktreePaths(cwd) {
  try {
    const out = execFileSync("git", ["worktree", "list", "--porcelain"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return out.split(/\r?\n/).filter((l) => l.startsWith("worktree ")).map((l) => l.slice(9));
  } catch {
    return [repoRoot(cwd)];
  }
}

export function finishRun(dir, id, { outcome, tokens = true, scope = "worktree", cwd, now = new Date() }) {
  if (!["worktree", "repo"].includes(scope)) fail("--scope must be worktree or repo");
  if (!OUTCOMES.includes(outcome)) fail(`--outcome must be one of: ${OUTCOMES.join(", ")}`);
  const run = load(dir, id);
  run.outcome = outcome;
  run.finished_at = nowIso(now);
  // Re-finishing (shipped, later merged) keeps the first token count unless it was empty.
  if (tokens && !run.cost) {
    const paths = scope === "repo" ? worktreePaths(cwd) : [repoRoot(cwd)];
    const events = paths.flatMap((repoPath) =>
      collectEvents({ repoPath, fromMs: Date.parse(run.started_at), toMs: now.getTime(), kinds: ["usage"] })
    );
    // A nested worktree path would match twice; count each usage event once.
    const seen = new Set();
    run.cost = sumUsage(events.filter((e) => {
      const k = `${e.file}|${e.ts}|${e.input}|${e.output}`;
      return !seen.has(k) && seen.add(k);
    }));
  }
  save(dir, run);
  return run;
}

// ---- report ----

const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : "n/a");
const fmt = (n) => (n == null ? "unknown" : Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(1));

export function computeReport(runs, { sinceMs = 0 } = {}) {
  const inWindow = runs.filter((r) => Date.parse(r.started_at) >= sinceMs);
  const count = (pred) => inWindow.filter(pred).length;
  const by = (keyFn) =>
    inWindow.reduce((acc, r) => {
      const k = keyFn(r) ?? "none";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  const shipped = inWindow.filter((r) => r.outcome === "shipped" || r.outcome === "merged");
  const merged = inWindow.filter((r) => r.outcome === "merged");
  const withCost = shipped.filter((r) => r.cost);
  const tokens = (r) => r.cost.input_tokens + r.cost.cached_input_tokens + r.cost.output_tokens;
  const touches = inWindow.flatMap((r) => r.human_touches);
  const reachedShip = inWindow.filter((r) => r.beats.ship);
  const durations = inWindow
    .filter((r) => r.finished_at)
    .map((r) => (Date.parse(r.finished_at) - Date.parse(r.started_at)) / 60000);

  return {
    runs: inWindow.length,
    open: count((r) => !r.finished_at),
    by_outcome: by((r) => r.outcome),
    by_class: by((r) => r.task.class),
    by_tier: by((r) => r.model?.tier),
    shipped: shipped.length,
    merged: merged.length,
    median_review_rounds: median(reachedShip.map((r) => r.beats.ship.review_rounds)),
    human_touches: touches.length,
    touches_per_shipped: shipped.length ? touches.length / shipped.length : null,
    corrections: touches.filter((t) => t.kind === "correction").length,
    corrections_by_beat: touches
      .filter((t) => t.kind === "correction")
      .reduce((a, t) => ((a[t.beat] = (a[t.beat] || 0) + 1), a), {}),
    evidence_rate: reachedShip.length
      ? reachedShip.filter((r) => (r.beats.prove?.evidence || []).some((e) => e !== "none")).length / reachedShip.length
      : null,
    before_captured_rate: reachedShip.length
      ? reachedShip.filter((r) => r.beats.prove?.before_captured).length / reachedShip.length
      : null,
    median_tokens_per_shipped: median(withCost.map(tokens)),
    tokens_known_for: `${withCost.length}/${shipped.length}`,
    median_minutes: median(durations),
    runs_using_memory: count((r) => r.memories.used.length > 0),
    memories_written: inWindow.reduce((a, r) => a + r.memories.written.length, 0),
    monitor_regressions: count((r) => r.beats.monitor?.status === "regression"),
  };
}

export function renderReport(rep, sinceLabel) {
  const kv = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(", ") || "none";
  const rate = (x) => (x == null ? "n/a" : `${Math.round(x * 100)}%`);
  return [
    `## Factory report (${sinceLabel})`,
    "",
    "| Measure | Value |",
    "|---|---|",
    `| Runs | ${rep.runs} (${rep.open} open) |`,
    `| Outcomes | ${kv(rep.by_outcome)} |`,
    `| By class | ${kv(rep.by_class)} |`,
    `| By tier | ${kv(rep.by_tier)} |`,
    `| Shipped / merged | ${rep.shipped} / ${rep.merged} |`,
    `| Median review rounds | ${fmt(rep.median_review_rounds)} |`,
    `| Human touches (per shipped run) | ${rep.human_touches} (${fmt(rep.touches_per_shipped)}) |`,
    `| Corrections by beat | ${kv(rep.corrections_by_beat)} |`,
    `| Evidence attached when shipped | ${rate(rep.evidence_rate)} |`,
    `| Before state captured | ${rate(rep.before_captured_rate)} |`,
    `| Median tokens per shipped run | ${fmt(rep.median_tokens_per_shipped)} (known for ${rep.tokens_known_for}) |`,
    `| Median minutes per run | ${fmt(rep.median_minutes)} |`,
    `| Runs that used memory | ${rep.runs_using_memory} of ${rep.runs} (${pct(rep.runs_using_memory, rep.runs)}) |`,
    `| Memories written | ${rep.memories_written} |`,
    `| Regressions found by monitor | ${rep.monitor_regressions} |`,
  ].join("\n");
}

// ---- cli ----

function main(argv) {
  const args = parseArgs(argv);
  const [cmd, ...rest] = args._;
  const dir = factoryDir({ dir: args.dir });

  switch (cmd) {
    case "start": {
      const run = startRun(dir, args);
      console.log(run.id);
      break;
    }
    case "current": {
      const run = openRunForBranch(dir, currentBranch());
      if (!run) fail("no open run on this branch", 3);
      console.log(run.id);
      break;
    }
    case "beat": {
      const [ref, beat] = rest;
      if (!beat) fail("usage: ledger.mjs beat <id|current> <beat> [--set k=v] [--add k=v]");
      const run = recordBeat(dir, resolveId(dir, ref), beat, args.set || [], args.add || []);
      console.log(`${run.id}: ${beat} ${JSON.stringify(run.beats[beat])}`);
      break;
    }
    case "touch": {
      const run = recordTouch(dir, resolveId(dir, rest[0]), args);
      console.log(`${run.id}: ${run.human_touches.length} human touch(es)`);
      break;
    }
    case "finish": {
      const run = finishRun(dir, resolveId(dir, rest[0]), { outcome: args.outcome, tokens: !args["no-tokens"], scope: args.scope || "worktree" });
      const c = run.cost;
      console.log(`${run.id}: ${run.outcome}, tokens ${c ? `${fmt(c.input_tokens)} in, ${fmt(c.cached_input_tokens)} cached, ${fmt(c.output_tokens)} out (${c.source})` : "unknown"}`);
      break;
    }
    case "show":
      console.log(JSON.stringify(load(dir, resolveId(dir, rest[0])), null, 2));
      break;
    case "list": {
      const runs = loadRuns(dir).filter((r) => !args.open || !r.finished_at);
      if (!runs.length) console.log("no runs");
      for (const r of runs) console.log(`${r.id}  ${r.task.class}/${r.task.size}  ${r.outcome || "open"}  ${r.branch || ""}`);
      break;
    }
    case "report": {
      if (!existsSync(runsDir(dir))) fail(`no runs directory at ${runsDir(dir)}; nothing to report`, 2);
      const since = args.since || "14d";
      const sinceMs = since === "all" ? 0 : Date.now() - parseDuration(since);
      const rep = computeReport(loadRuns(dir), { sinceMs });
      console.log(args.json ? JSON.stringify(rep, null, 2) : renderReport(rep, since === "all" ? "all time" : `last ${since}`));
      break;
    }
    case undefined:
    case "help":
    case "--help":
      console.log(HELP);
      break;
    default:
      fail(`unknown command "${cmd}"\n\n${HELP}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`${err.message}
`);
    process.exit(err.exitCode || 1);
  }
}
