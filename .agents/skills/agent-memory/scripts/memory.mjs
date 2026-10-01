#!/usr/bin/env node
// Factory memory: one markdown file per fact under .factory/memory/, plus a
// generated INDEX.md. Files live in git, so every memory is reviewed in a PR.
// Usage: node memory.mjs <command> [args]   (node memory.mjs help for the list)
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { currentBranch, factoryDir, listFiles, parseArgs, readJson, today, writeJson } from "./lib/factory.mjs";
import { parseFrontmatter, stringifyFrontmatter } from "./lib/frontmatter.mjs";
import { validate } from "./lib/schema.mjs";
import { findSecrets } from "./lib/secrets.mjs";

const SCHEMA = JSON.parse(readFileSync(new URL("./schemas/memory.schema.json", import.meta.url), "utf8"));
const RUN_SCHEMA = JSON.parse(readFileSync(new URL("./schemas/run.schema.json", import.meta.url), "utf8"));
const TYPES = SCHEMA.properties.type.enum;
const INDEX_BUDGET = 4096;

const HELP = `factory memory, one file per fact in .factory/memory/

  add       --name <slug> --type <t> --description <one line> --source <PR/issue URL>
            (--body <text> | --body-file <path>) [--run <id|current>] [--update]
  search    <terms...> [--limit 5] [--all]     ranked by keyword; --all includes stale
  use       <name> [--run <id|current>]         count a use, link it to the run
  index                                         regenerate INDEX.md (also after merge conflicts)
  prune     [--unused-days 90] [--dry-run]      mark long-unused memories stale
  graduate  [--min-uses 3]                      memories ready to move into a skill or AGENTS.md
  show      <name>

types: ${TYPES.join(", ")}
Global: --dir <path> overrides the .factory location (also FACTORY_DIR).`;

function fail(msg, exitCode = 1) {
  throw Object.assign(new Error(msg), { exitCode });
}

const memDir = (dir) => join(dir, "memory");

export function loadMemories(dir) {
  return listFiles(memDir(dir), ".md")
    .filter((f) => basename(f) !== "INDEX.md")
    .map((file) => {
      const { data, body } = parseFrontmatter(readFileSync(file, "utf8"));
      return { file, data: data || { name: basename(file, ".md") }, body: body.trim() };
    });
}

function save(file, data, body) {
  const errors = validate(SCHEMA, data);
  if (errors.length) fail(`refusing to write an invalid memory:\n  ${errors.join("\n  ")}`);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, stringifyFrontmatter(data, body));
}

const words = (s) => new Set(String(s).toLowerCase().match(/[a-z0-9]{3,}/g) || []);
function similarity(a, b) {
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return 0;
  const shared = [...A].filter((w) => B.has(w)).length;
  return shared / Math.min(A.size, B.size);
}

// ---- run record linkage (kept local so this skill works without run-ledger) ----

function openRunId(dir) {
  const branch = currentBranch();
  const runs = listFiles(join(dir, "runs"), ".json").map((f) => readJson(f));
  const open = runs.filter((r) => !r.finished_at && r.branch === branch).sort((a, b) => a.started_at.localeCompare(b.started_at));
  return open.at(-1)?.id || null;
}

export function linkRun(dir, runRef, field, name) {
  if (!runRef) return null;
  const id = runRef === "current" ? openRunId(dir) : runRef;
  if (!id) fail("no open run on this branch to link the memory to; drop --run or start one with run-ledger");
  const file = join(dir, "runs", `${id}.json`);
  if (!existsSync(file)) fail(`no run record ${id}`);
  const run = readJson(file);
  if (!run.memories[field].includes(name)) run.memories[field].push(name);
  const errors = validate(RUN_SCHEMA, run);
  if (errors.length) fail(`run record ${id} is invalid, not linking:\n  ${errors.join("\n  ")}`);
  writeJson(file, run);
  return id;
}

// ---- commands ----

export function addMemory(dir, opts, now = new Date()) {
  const name = opts.name;
  if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) fail("--name must be a lowercase slug, e.g. windows-symlink-install");
  const body = opts["body-file"] ? readFileSync(opts["body-file"], "utf8") : opts.body;
  if (!body || body === true) fail("--body or --body-file is required: the fact itself, with how to apply it");
  const secrets = findSecrets(`${opts.description} ${body}`);
  if (secrets.length) fail(`refusing to store what looks like a secret (${secrets.join(", ")}). Memory lives in git.`);

  const file = join(memDir(dir), `${name}.md`);
  const existing = existsSync(file) ? parseFrontmatter(readFileSync(file, "utf8")).data : null;
  if (existing && !opts.update) fail(`memory "${name}" exists. Read it, then rerun with --update to replace its text.`);

  const warnings = [];
  for (const m of loadMemories(dir)) {
    if (m.data.name === name) continue;
    const score = similarity(body, m.body);
    if (score >= 0.6) warnings.push(`similar to "${m.data.name}" (${Math.round(score * 100)}% shared words); consider updating it instead`);
  }

  const data = {
    name,
    description: opts.description,
    type: opts.type,
    source: opts.source,
    run: null,
    created: existing?.created || today(now),
    last_used: existing?.last_used || null,
    uses: existing?.uses || 0,
    status: existing?.status || "observed",
  };
  const runId = opts.run ? (opts.run === "current" ? openRunId(dir) : opts.run) : existing?.run || null;
  data.run = runId;
  save(file, data, body);
  if (opts.run) linkRun(dir, runId, "written", name);
  writeIndex(dir);
  return { file, warnings };
}

export function renderIndex(memories) {
  const line = (m) => `- [${m.data.name}](${m.data.name}.md) ${m.data.type}, used ${m.data.uses ?? 0}x: ${m.data.description}`;
  const active = memories.filter((m) => m.data.status !== "stale").sort((a, b) => a.data.name.localeCompare(b.data.name));
  const stale = memories.filter((m) => m.data.status === "stale").sort((a, b) => a.data.name.localeCompare(b.data.name));
  const out = [
    "# Factory memory",
    "",
    "Generated by `agent-memory` (`memory.mjs index`). Read this at the start of",
    "every task; open a memory file only when its line is relevant. On a merge",
    "conflict here, do not hand-merge: run `memory.mjs index` to regenerate it.",
    "",
    active.length ? active.map(line).join("\n") : "(no memories yet)",
  ];
  if (stale.length) out.push("", "## Stale (unused for a long time; verify before relying on one)", "", stale.map(line).join("\n"));
  return out.join("\n") + "\n";
}

export function writeIndex(dir) {
  const text = renderIndex(loadMemories(dir));
  mkdirSync(memDir(dir), { recursive: true });
  writeFileSync(join(memDir(dir), "INDEX.md"), text);
  return text;
}

export function searchMemories(dir, terms, { limit = 5, all = false } = {}) {
  const qs = terms.flatMap((t) => String(t).toLowerCase().match(/[a-z0-9]{2,}/g) || []);
  if (!qs.length) fail("search needs at least one term");
  const count = (text, q) => (String(text).toLowerCase().match(new RegExp(`\\b${q}`, "g")) || []).length;
  return loadMemories(dir)
    .filter((m) => all || m.data.status !== "stale")
    .map((m) => ({
      m,
      score: qs.reduce((s, q) => s + 3 * count(m.data.name?.replace(/-/g, " "), q) + 2 * count(m.data.description, q) + count(m.body, q), 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.m.data.name.localeCompare(b.m.data.name))
    .slice(0, limit);
}

export function useMemory(dir, name, runRef, now = new Date()) {
  const file = join(memDir(dir), `${name}.md`);
  if (!existsSync(file)) fail(`no memory "${name}"`);
  const { data, body } = parseFrontmatter(readFileSync(file, "utf8"));
  data.uses = (data.uses || 0) + 1;
  data.last_used = today(now);
  if (data.status === "stale") data.status = "observed";
  save(file, data, body);
  const runId = linkRun(dir, runRef, "used", name);
  writeIndex(dir);
  return { data, runId };
}

export function pruneMemories(dir, { unusedDays = 90, dryRun = false, now = new Date() } = {}) {
  const cutoff = now.getTime() - unusedDays * 86400e3;
  const marked = [];
  for (const m of loadMemories(dir)) {
    if (m.data.status === "stale") continue;
    const last = Date.parse(m.data.last_used || m.data.created);
    if (!(last < cutoff)) continue;
    marked.push(m.data.name);
    if (!dryRun) save(m.file, { ...m.data, status: "stale" }, m.body);
  }
  if (!dryRun && marked.length) writeIndex(dir);
  return marked;
}

export function graduationCandidates(dir, minUses = 3) {
  return loadMemories(dir)
    .filter((m) => m.data.status !== "stale" && (m.data.uses || 0) >= minUses)
    .sort((a, b) => b.data.uses - a.data.uses);
}

function main(argv) {
  const args = parseArgs(argv);
  const [cmd, ...rest] = args._;
  const dir = factoryDir({ dir: args.dir });

  switch (cmd) {
    case "add": {
      const { file, warnings } = addMemory(dir, args);
      console.log(`saved ${file}`);
      for (const w of warnings) console.log(`  note: ${w}`);
      break;
    }
    case "search": {
      const hits = searchMemories(dir, rest, { limit: Number(args.limit) || 5, all: !!args.all });
      if (!hits.length) console.log("no matching memories");
      for (const { m, score } of hits) console.log(`${m.data.name}  (score ${score}, ${m.data.type}, used ${m.data.uses}x)\n  ${m.data.description}`);
      break;
    }
    case "use": {
      if (!rest[0]) fail("usage: memory.mjs use <name> [--run <id|current>]");
      const { data, runId } = useMemory(dir, rest[0], args.run);
      console.log(`${data.name}: used ${data.uses}x${runId ? `, linked to run ${runId}` : ""}`);
      break;
    }
    case "index":
      writeIndex(dir);
      console.log(`wrote ${join(memDir(dir), "INDEX.md")}`);
      break;
    case "prune": {
      const marked = pruneMemories(dir, {
        unusedDays: args["unused-days"] ? Number(args["unused-days"]) : 90,
        dryRun: !!args["dry-run"],
      });
      console.log(marked.length ? `${args["dry-run"] ? "would mark" : "marked"} stale: ${marked.join(", ")}` : "nothing to prune");
      break;
    }
    case "graduate": {
      const c = graduationCandidates(dir, Number(args["min-uses"]) || 3);
      if (!c.length) console.log("no memories are ready to graduate");
      for (const m of c) console.log(`${m.data.name}  used ${m.data.uses}x  (${m.data.type})\n  ${m.data.description}`);
      break;
    }
    case "show": {
      const file = join(memDir(dir), `${rest[0]}.md`);
      if (!existsSync(file)) fail(`no memory "${rest[0]}"`);
      process.stdout.write(readFileSync(file, "utf8"));
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

  const idx = join(memDir(dir), "INDEX.md");
  if (existsSync(idx) && readFileSync(idx).length > INDEX_BUDGET)
    console.log(`note: INDEX.md is over ${INDEX_BUDGET} bytes. Prune, merge related memories, or graduate some into skills.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(err.exitCode || 1);
  }
}
