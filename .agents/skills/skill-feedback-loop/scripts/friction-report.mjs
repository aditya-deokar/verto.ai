#!/usr/bin/env node
// Counts how often people had to repeat each known correction, per owning
// skill, from local harness transcripts. Prints aggregates and short quotes;
// never uploads anything.
// Usage: node friction-report.mjs [--since 14d] [--all-repos] [--patterns file] [--json]
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { factoryDir, parseArgs, parseDuration, readJson, repoRoot } from "./lib/factory.mjs";
import { collectEvents, transcriptFiles } from "./lib/transcripts.mjs";

const BUNDLED = new URL("../assets/friction-patterns.json", import.meta.url);

export function loadPatterns(file) {
  if (file) return readJson(file);
  const local = join(factoryDir(), "friction-patterns.json");
  return existsSync(local) ? readJson(local) : JSON.parse(readFileSync(BUNDLED, "utf8"));
}

function quote(text, re, max = 140) {
  const m = text.match(re);
  if (!m || text.length <= max) return text.slice(0, max);
  const start = Math.max(0, Math.min(m.index - 40, text.length - max));
  return (start > 0 ? "..." : "") + text.slice(start, start + max) + (start + max < text.length ? "..." : "");
}

/** Throws with exitCode 2 when there are no transcripts to read at all. */
export function frictionReport({ since = "14d", repoPath, allRepos = false, patterns, samples = 3, now = Date.now() } = {}) {
  const windowMs = parseDuration(since);
  const from = now - windowMs;
  const prevFrom = now - 2 * windowMs;
  if (!transcriptFiles(prevFrom).length)
    throw Object.assign(new Error("no Claude Code or Codex transcripts found in the window. Could not run."), { exitCode: 2 });

  const repo = allRepos ? null : repoPath || repoRoot();
  const users = collectEvents({ repoPath: repo, fromMs: prevFrom, toMs: now, kinds: ["user"] });
  const current = users.filter((e) => Date.parse(e.ts) >= from);
  const previous = users.filter((e) => Date.parse(e.ts) < from);

  const rows = patterns.map((p) => {
    const re = new RegExp(p.re, p.flags ?? "i");
    const hits = current.filter((e) => re.test(e.text));
    const prev = previous.filter((e) => re.test(e.text)).length;
    const count = hits.length;
    const trend = count && !prev ? "new" : count > prev ? "up" : count < prev ? "down" : "flat";
    return {
      key: p.key,
      label: p.label,
      owner: p.owner,
      count,
      previous: prev,
      trend,
      samples: hits.slice(-samples).map((e) => quote(e.text, re)),
    };
  });
  rows.sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  return {
    window: since,
    from: new Date(from).toISOString(),
    to: new Date(now).toISOString(),
    repo: repo || "all",
    user_turns: current.length,
    previous_user_turns: previous.length,
    patterns: rows,
  };
}

export function renderFriction(rep) {
  const lines = [
    `## Friction report (last ${rep.window}, ${rep.repo})`,
    "",
    `${rep.user_turns} user turns this window, ${rep.previous_user_turns} the window before.`,
    "",
    "| Key | Owner | Count | Previous | Trend |",
    "|---|---|---|---|---|",
    ...rep.patterns.map((p) => `| ${p.key} | ${p.owner} | ${p.count} | ${p.previous} | ${p.trend} |`),
  ];
  const quoted = rep.patterns.filter((p) => p.samples.length);
  if (quoted.length) {
    lines.push("", "### Samples");
    for (const p of quoted) {
      lines.push("", `**${p.key}** (${p.label})`);
      for (const s of p.samples) lines.push(`- "${s.replace(/\|/g, "\\|")}"`);
    }
  }
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const rep = frictionReport({
      since: args.since || "14d",
      allRepos: !!args["all-repos"],
      repoPath: typeof args.repo === "string" ? args.repo : undefined,
      patterns: loadPatterns(typeof args.patterns === "string" ? args.patterns : undefined),
      samples: args.samples ? Number(args.samples) : 3,
    });
    console.log(args.json ? JSON.stringify(rep, null, 2) : renderFriction(rep));
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(err.exitCode || 1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
