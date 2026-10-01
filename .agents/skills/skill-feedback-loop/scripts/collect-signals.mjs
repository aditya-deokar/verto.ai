#!/usr/bin/env node
// Gathers every signal the outer loop acts on into one file:
// friction counts (transcripts), ledger aggregates (.factory/runs), human
// review comments on merged PRs (gh), memory graduation candidates, and the
// state of earlier proposals. Then ranks what to work on next.
// Usage: node collect-signals.mjs [--since 14d] [--no-gh] [--no-write] [--json]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { factoryDir, listFiles, median, parseArgs, parseDuration, readJson, repoRoot, today, writeJson } from "./lib/factory.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { frictionReport, loadPatterns } from "./friction-report.mjs";

const DEFAULT_LOOP = { enabled: true, window: "14d", min_occurrences: 2, max_open_prs: 1, cooldown_windows: 2 };

export function loadConfig(dir) {
  const file = join(dir, "config.json");
  const cfg = existsSync(file) ? readJson(file) : {};
  return { ...DEFAULT_LOOP, ...(cfg.loop || {}) };
}

export function ledgerSignals(dir, fromMs) {
  const runs = listFiles(join(dir, "runs"), ".json")
    .map((f) => readJson(f))
    .filter((r) => Date.parse(r.started_at) >= fromMs);
  const corrections = runs.flatMap((r) => r.human_touches.filter((t) => t.kind === "correction").map((t) => ({ ...t, run: r.id })));
  const byClass = {};
  for (const r of runs) if (r.beats.ship?.review_rounds != null) (byClass[r.task.class] ||= []).push(r.beats.ship.review_rounds);
  const shipped = runs.filter((r) => r.beats.ship);
  return {
    runs: runs.length,
    corrections_by_beat: corrections.reduce((a, t) => ((a[t.beat] = (a[t.beat] || 0) + 1), a), {}),
    correction_refs: corrections.filter((t) => t.ref).map((t) => ({ beat: t.beat, ref: t.ref, run: t.run })),
    median_review_rounds_by_class: Object.fromEntries(Object.entries(byClass).map(([k, v]) => [k, median(v)])),
    shipped_without_evidence: shipped.filter((r) => !(r.beats.prove?.evidence || []).some((e) => e !== "none")).map((r) => r.id),
    shipped_without_before: shipped.filter((r) => !r.beats.prove?.before_captured).map((r) => r.id),
  };
}

const isBot = (u) => !u || u.type === "Bot" || /\[bot\]$|greptile|coderabbit|copilot/i.test(u.login || "");

/** Human review comments on PRs merged in the window, grouped by skill or top-level path. */
export function reviewSignals(fromMs, gh = (args) => execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })) {
  const since = new Date(fromMs).toISOString().slice(0, 10);
  const prs = JSON.parse(gh(["pr", "list", "--state", "merged", "--search", `merged:>=${since}`, "--json", "number,url", "--limit", "50"]));
  const byArea = {};
  let total = 0;
  for (const pr of prs) {
    const comments = JSON.parse(gh(["api", `repos/{owner}/{repo}/pulls/${pr.number}/comments`, "--paginate"]) || "[]");
    for (const c of comments) {
      if (isBot(c.user)) continue;
      const m = String(c.path || "").match(/^skills\/([^/]+)\//);
      const area = m ? m[1] : String(c.path || "(general)").split("/")[0];
      (byArea[area] ||= { count: 0, samples: [] }).count++;
      if (byArea[area].samples.length < 3) byArea[area].samples.push({ url: c.html_url, text: String(c.body).slice(0, 160) });
      total++;
    }
  }
  return { prs: prs.length, human_comments: total, by_area: byArea };
}

export function memorySignals(dir, minUses = 3) {
  return listFiles(join(dir, "memory"), ".md")
    .filter((f) => basename(f) !== "INDEX.md")
    .map((f) => parseFrontmatter(readFileSync(f, "utf8")).data)
    .filter((d) => d && d.status !== "stale" && (d.uses || 0) >= minUses)
    .map((d) => ({ name: d.name, uses: d.uses, type: d.type, description: d.description }));
}

export function proposalState(dir) {
  return listFiles(join(dir, "proposals"), ".md")
    .map((f) => ({ file: basename(f), ...(parseFrontmatter(readFileSync(f, "utf8")).data || {}) }))
    .filter((p) => p.key);
}

/**
 * Ranks what to do next. A friction key qualifies when it reached
 * min_occurrences, is new or climbing, and its owner has no open proposal and
 * no merged one inside the cooldown.
 */
export function rank({ friction, proposals, graduation, loop, now = Date.now() }) {
  const windowMs = parseDuration(loop.window);
  const open = proposals.filter((p) => p.status === "open" || p.status === "draft");
  const cooling = (target) =>
    proposals.some((p) => p.target === target && p.status === "merged" && now - Date.parse(p.date) < loop.cooldown_windows * windowMs);

  const skipped = [];
  const candidates = [];
  for (const p of friction?.patterns || []) {
    if (p.count < loop.min_occurrences) continue;
    if (!(p.trend === "up" || p.trend === "new")) {
      skipped.push({ key: p.key, reason: `trend ${p.trend}` });
      continue;
    }
    if (open.some((o) => o.target === p.owner)) {
      skipped.push({ key: p.key, reason: `${p.owner} already has an open proposal` });
      continue;
    }
    if (cooling(p.owner)) {
      skipped.push({ key: p.key, reason: `${p.owner} is cooling down after a merged proposal` });
      continue;
    }
    candidates.push({ kind: "friction", key: p.key, target: p.owner, count: p.count, previous: p.previous, samples: p.samples });
  }
  for (const g of graduation) candidates.push({ kind: "graduate-memory", key: g.name, target: "(owning skill)", count: g.uses });

  const budget = Math.max(0, loop.max_open_prs - open.length);
  return { next: budget ? candidates[0] || null : null, candidates, skipped, open_proposals: open.length, budget };
}

/** Did merged proposals move their number? */
export function followUp(proposals, friction, loop, now = Date.now()) {
  const windowMs = parseDuration(loop.window);
  return proposals
    .filter((p) => p.status === "merged")
    .map((p) => {
      const current = friction?.patterns.find((f) => f.key === p.key)?.count ?? null;
      const age = now - Date.parse(p.date);
      const moved = current == null ? null : current < p.baseline;
      return {
        key: p.key,
        target: p.target,
        baseline: p.baseline,
        current,
        moved,
        flag_for_revert: moved === false && age >= 2 * windowMs,
      };
    });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dir = factoryDir({ dir: args.dir });
  const loop = loadConfig(dir);
  const since = args.since || loop.window;
  const now = Date.now();
  const fromMs = now - parseDuration(since);
  const signals = { date: today(), window: since, repo: repoRoot(), loop };

  if (loop.enabled === false) {
    console.log("loop.enabled is false in .factory/config.json. Nothing to do.");
    return;
  }

  try {
    signals.friction = frictionReport({ since, patterns: loadPatterns(), now });
  } catch (err) {
    signals.friction = null;
    signals.friction_unavailable = err.message;
  }
  signals.ledger = existsSync(join(dir, "runs")) ? ledgerSignals(dir, fromMs) : null;
  if (!args["no-gh"]) {
    try {
      signals.reviews = reviewSignals(fromMs);
    } catch (err) {
      signals.reviews = null;
      signals.reviews_unavailable = `gh failed: ${String(err.stderr || err.message).split("\n")[0]}`;
    }
  }
  signals.graduation = memorySignals(dir);
  const proposals = proposalState(dir);
  signals.follow_up = followUp(proposals, signals.friction, loop, now);
  signals.ranking = rank({ friction: signals.friction, proposals, graduation: signals.graduation, loop, now });

  if (!args["no-write"]) {
    // .cache/ is gitignored: signals quote local transcripts, which stay local.
    const out = join(dir, ".cache", `signals-${signals.date}.json`);
    writeJson(out, signals);
    if (!args.json) console.log(`wrote ${out}\n`);
  }
  if (args.json) return console.log(JSON.stringify(signals, null, 2));

  const r = signals.ranking;
  const lines = [
    `## Loop signals (last ${since})`,
    "",
    `- Friction: ${signals.friction ? `${signals.friction.user_turns} user turns scanned` : signals.friction_unavailable}`,
    `- Ledger: ${signals.ledger ? `${signals.ledger.runs} runs, corrections by beat ${JSON.stringify(signals.ledger.corrections_by_beat)}` : "no runs directory"}`,
    `- Reviews: ${signals.reviews ? `${signals.reviews.human_comments} human comments on ${signals.reviews.prs} merged PRs` : signals.reviews_unavailable || "skipped (--no-gh)"}`,
    `- Memory ready to graduate: ${signals.graduation.map((g) => g.name).join(", ") || "none"}`,
    `- Open proposals: ${r.open_proposals} (budget for ${r.budget} more)`,
  ];
  for (const f of signals.follow_up)
    lines.push(`- Follow-up ${f.key} -> ${f.target}: baseline ${f.baseline}, now ${f.current ?? "unknown"}${f.flag_for_revert ? " (did not move in two windows: propose a revert)" : ""}`);
  lines.push("", r.next ? `Next: ${r.next.kind} "${r.next.key}" -> ${r.next.target} (${r.next.count} this window${r.next.previous != null ? `, ${r.next.previous} before` : ""})` : "Next: nothing qualifies. Do not open a proposal this round.");
  for (const s of r.skipped) lines.push(`  skipped ${s.key}: ${s.reason}`);
  console.log(lines.join("\n"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
