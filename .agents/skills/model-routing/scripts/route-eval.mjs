#!/usr/bin/env node
// Best-of-k routing eval: run each task k times per tier in throwaway
// worktrees, check each attempt, and recommend the cheapest tier whose pass
// rate is within --margin of the best. Never edits routing.json.
//
// Usage: node route-eval.mjs --tasks <dir> --agent-cmd "<command>" [--tiers fast,balanced]
//        [--k 3] [--margin 0.1] [--budget-tokens N] [--timeout-min 20] [--harness h] [--dry-run]
//
// --agent-cmd placeholders: {model} {tier} {prompt_file} {workdir}
// Task files: <dir>/*.md, frontmatter `check:` (required, exit 0 = pass) and
// optional `setup:`, both run in the attempt's worktree; the body is the prompt.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { detectHarness, factoryDir, listFiles, median, parseArgs, repoRoot, today, writeJson } from "./lib/factory.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { collectEvents, sumUsage } from "./lib/transcripts.mjs";
import { loadRouting } from "./route.mjs";

function fail(msg, exitCode = 1) {
  throw Object.assign(new Error(msg), { exitCode });
}

export function loadTasks(dir) {
  const tasks = listFiles(dir, ".md").map((file) => {
    const { data, body } = parseFrontmatter(readFileSync(file, "utf8"));
    if (!data?.check) fail(`${file} has no "check:" command in its frontmatter`);
    return { id: basename(file, ".md"), check: data.check, setup: data.setup || null, prompt: body.trim() };
  });
  if (!tasks.length) fail(`no task files (*.md) in ${dir}`, 2);
  return tasks;
}

const fill = (template, vars) => template.replace(/\{(model|tier|prompt_file|workdir)\}/g, (_, k) => vars[k] ?? "");
const sh = (cmd, cwd, timeoutMs) => spawnSync(cmd, { cwd, shell: true, encoding: "utf8", timeout: timeoutMs });

function attempt({ repo, task, tier, model, agentCmd, timeoutMs, keep }) {
  const workdir = mkdtempSync(join(tmpdir(), "sf-eval-"));
  rmSync(workdir, { recursive: true, force: true }); // git worktree add wants a fresh path
  execFileSync("git", ["worktree", "add", "--detach", workdir, "HEAD"], { cwd: repo, stdio: "ignore" });
  const promptDir = mkdtempSync(join(tmpdir(), "sf-prompt-"));
  const promptFile = join(promptDir, `${task.id}.md`);
  writeFileSync(promptFile, task.prompt + "\n");
  const started = Date.now();
  try {
    if (task.setup && sh(task.setup, workdir, timeoutMs).status !== 0) return { pass: false, error: "setup failed", seconds: 0, tokens: null };
    const agent = sh(fill(agentCmd, { model, tier, prompt_file: `"${promptFile}"`, workdir: `"${workdir}"` }), workdir, timeoutMs);
    const check = sh(task.check, workdir, timeoutMs);
    const ended = Date.now();
    const usage = sumUsage(collectEvents({ repoPath: workdir, fromMs: started, toMs: ended + 1000, kinds: ["usage"] }));
    return {
      pass: check.status === 0,
      agent_exit: agent.status,
      error: agent.error ? String(agent.error.message) : null,
      seconds: Math.round((ended - started) / 1000),
      tokens: usage ? usage.input_tokens + usage.cached_input_tokens + usage.output_tokens : null,
    };
  } finally {
    rmSync(promptDir, { recursive: true, force: true });
    if (!keep) {
      try {
        execFileSync("git", ["worktree", "remove", "--force", workdir], { cwd: repo, stdio: "ignore" });
      } catch {
        rmSync(workdir, { recursive: true, force: true });
      }
    }
  }
}

/** Cheapest tier (in routing order) within margin of the best pass rate. */
export function recommend(summary, tierOrder, margin = 0.1) {
  const rated = tierOrder.filter((t) => summary[t]?.attempts);
  if (!rated.length) return { tier: null, reason: "no attempts ran" };
  const best = Math.max(...rated.map((t) => summary[t].pass_rate));
  if (best === 0) return { tier: null, reason: "no tier passed any task; the tasks or checks may be wrong" };
  const tier = rated.find((t) => summary[t].pass_rate >= best - margin);
  return { tier, reason: `cheapest tier within ${Math.round(margin * 100)} points of the best pass rate (${Math.round(best * 100)}%)` };
}

export function runEval(opts) {
  const { repo, routing, tasks, tiers, k, agentCmd, harness, margin, budgetTokens, timeoutMs, keep, dryRun, log = console.log } = opts;
  const plan = tiers.flatMap((tier) => tasks.flatMap((task) => Array.from({ length: k }, (_, i) => ({ tier, task, i }))));
  const models = Object.fromEntries(tiers.map((t) => [t, routing.tiers[t]?.[harness] ?? null]));
  if (/\{model\}/.test(agentCmd))
    for (const t of tiers) if (!models[t]) fail(`tier "${t}" has no model for harness "${harness}" in routing.json, and --agent-cmd uses {model}`);
  if (dryRun) {
    log(`Would run ${plan.length} attempts (${tasks.length} tasks x ${tiers.length} tiers x k=${k}):`);
    for (const t of tiers) log(`  ${t}: ${fill(agentCmd, { model: models[t], tier: t, prompt_file: "<prompt>", workdir: "<worktree>" })}`);
    return null;
  }

  const results = [];
  let spent = 0;
  let stopped = null;
  for (const p of plan) {
    if (budgetTokens && spent >= budgetTokens) {
      stopped = `token budget ${budgetTokens} reached after ${results.length} attempts`;
      break;
    }
    const r = attempt({ repo, task: p.task, tier: p.tier, model: models[p.tier], agentCmd, timeoutMs, keep });
    spent += r.tokens || 0;
    results.push({ tier: p.tier, task: p.task.id, attempt: p.i + 1, ...r });
    log(`  ${p.tier} ${p.task.id} #${p.i + 1}: ${r.pass ? "pass" : "fail"} (${r.seconds}s, ${r.tokens ?? "?"} tokens)`);
  }

  const summary = {};
  for (const t of tiers) {
    const rs = results.filter((r) => r.tier === t);
    summary[t] = {
      model: models[t],
      attempts: rs.length,
      passes: rs.filter((r) => r.pass).length,
      pass_rate: rs.length ? rs.filter((r) => r.pass).length / rs.length : 0,
      median_tokens: median(rs.map((r) => r.tokens)),
      median_seconds: median(rs.map((r) => r.seconds)),
    };
  }
  return { date: today(), harness, k, tiers, tasks: tasks.map((t) => t.id), agent_cmd: agentCmd, stopped, summary, recommendation: recommend(summary, Object.keys(routing.tiers).filter((t) => tiers.includes(t)), margin), results };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repo = repoRoot();
  const dir = factoryDir({ dir: args.dir });
  try {
    if (!args.tasks) fail("--tasks <dir> is required (task files with a check: command)");
    if (!args["agent-cmd"]) fail('--agent-cmd is required, e.g. --agent-cmd "claude -p --model {model} < {prompt_file}"');
    const routing = loadRouting(args.routing || join(dir, "routing.json"));
    const tiers = args.tiers ? String(args.tiers).split(",") : Object.keys(routing.tiers);
    for (const t of tiers) if (!routing.tiers[t]) fail(`unknown tier "${t}"`);
    const out = runEval({
      repo,
      routing,
      tasks: loadTasks(resolve(args.tasks)),
      tiers,
      k: Number(args.k) || 3,
      agentCmd: args["agent-cmd"],
      harness: args.harness || detectHarness(),
      margin: args.margin != null ? Number(args.margin) : 0.1,
      budgetTokens: args["budget-tokens"] ? Number(args["budget-tokens"]) : null,
      timeoutMs: (Number(args["timeout-min"]) || 20) * 60e3,
      keep: !!args.keep,
      dryRun: !!args["dry-run"],
    });
    if (!out) return;
    const file = args.out || join(dir, "evals", `${out.date}-${basename(resolve(args.tasks))}.json`);
    writeJson(file, out);
    console.log(`\n| Tier | Model | Pass rate | Median tokens | Median seconds |\n|---|---|---|---|---|`);
    for (const t of tiers) {
      const s = out.summary[t];
      console.log(`| ${t} | ${s.model ?? "-"} | ${s.passes}/${s.attempts} | ${s.median_tokens ?? "unknown"} | ${s.median_seconds ?? "-"} |`);
    }
    console.log(`\nRecommendation: ${out.recommendation.tier ?? "none"} (${out.recommendation.reason})`);
    if (out.stopped) console.log(`Stopped early: ${out.stopped}`);
    console.log(`Wrote ${file}. Changing routing.json is a separate, reviewed PR.`);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(err.exitCode || 1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
