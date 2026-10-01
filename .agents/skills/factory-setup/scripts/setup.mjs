#!/usr/bin/env node
// Bootstraps the software factory in a repository. Idempotent: it only creates
// what is missing, never overwrites, and prints what it did (or would do).
// Usage: node setup.mjs [--target <repo>] [--workflows] [--no-agents-md] [--dry-run]
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs, repoRoot } from "./lib/factory.mjs";
import { checkFactory } from "./check-factory.mjs";

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
const MARKER = "<!-- factory-setup: software factory section -->";

function walk(dir, base = dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name), base) : [relative(base, join(dir, e.name))]
  );
}

/** Returns the list of planned actions without touching the disk. */
export function plan(target, { workflows = false, agentsMd = true } = {}) {
  const actions = [];
  const create = (src, dest) => actions.push({ kind: existsSync(dest) ? "exists" : "create", src, dest });

  // npm strips files named .gitignore from packages, so the asset ships as "gitignore".
  for (const rel of walk(join(ASSETS, "factory")))
    create(join(ASSETS, "factory", rel), join(target, ".factory", rel === "gitignore" ? ".gitignore" : rel));
  for (const sub of ["runs", "proposals", "evals"]) create(null, join(target, ".factory", sub, ".gitkeep"));

  if (agentsMd) {
    const dest = join(target, "AGENTS.md");
    if (!existsSync(dest)) actions.push({ kind: "create", src: join(ASSETS, "AGENTS.md"), dest, mark: true });
    else if (!readFileSync(dest, "utf8").includes(MARKER))
      actions.push({ kind: "append", src: join(ASSETS, "agents-section.md"), dest });
    else actions.push({ kind: "exists", dest });
  }
  if (workflows)
    for (const rel of walk(join(ASSETS, "workflows")))
      create(join(ASSETS, "workflows", rel), join(target, ".github", "workflows", rel));
  return actions;
}

export function apply(actions) {
  for (const a of actions) {
    if (a.kind === "exists") continue;
    mkdirSync(dirname(a.dest), { recursive: true });
    if (a.kind === "append") appendFileSync(a.dest, `\n${MARKER}\n${readFileSync(a.src, "utf8")}`);
    else if (a.src) copyFileSync(a.src, a.dest);
    else writeFileSync(a.dest, "");
    // Mark a created AGENTS.md too, or a rerun would append the section to it.
    if (a.mark) appendFileSync(a.dest, `\n${MARKER}\n`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = repoRoot(args.target || process.cwd());
  const actions = plan(target, { workflows: !!args.workflows, agentsMd: !args["no-agents-md"] });
  const todo = actions.filter((a) => a.kind !== "exists");
  const rel = (p) => relative(target, p).replace(/\\/g, "/");

  console.log(`Software factory setup in ${target}${args["dry-run"] ? " (dry run)" : ""}`);
  for (const a of actions) {
    const verb = { create: "create", append: "append section to", exists: "keep existing" }[a.kind];
    console.log(`  ${args["dry-run"] && a.kind !== "exists" ? `would ${verb}` : verb}  ${rel(a.dest)}`);
  }
  if (!todo.length) {
    console.log("\nNo changes. The factory is already set up here.");
    return;
  }
  if (args["dry-run"]) return;

  apply(actions);
  const { errors } = checkFactory(join(target, ".factory"));
  if (errors.length) {
    for (const e of errors) console.log(`  ERROR  ${e}`);
    process.exit(1);
  }
  console.log(`\n${todo.length} change(s). .factory/ validates. Next: fill in the repo-specific section of AGENTS.md.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
