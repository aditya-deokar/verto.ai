#!/usr/bin/env node
// Validates a .factory/ directory against the bundled schemas.
// Exit 0: checked and valid. Exit 1: problems found. Exit 2: could not run
// (no directory, or nothing in it to check). Never 0 for an empty check.
// Usage: node check-factory.mjs [path/to/.factory]
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { factoryDir, listFiles, readJson } from "./lib/factory.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { validate } from "./lib/schema.mjs";
import { findSecrets } from "./lib/secrets.mjs";

const schema = (name) =>
  JSON.parse(readFileSync(new URL(`./schemas/${name}.schema.json`, import.meta.url), "utf8"));

export function checkFactory(dir) {
  const errors = [];
  const checked = {};
  const count = (k) => (checked[k] = (checked[k] || 0) + 1);
  const err = (file, msg) => errors.push(`${file}: ${msg}`);

  const json = (rel, schemaName, extra) => {
    const file = join(dir, rel);
    if (!existsSync(file)) return;
    let data;
    try {
      data = readJson(file);
    } catch (e) {
      return err(rel, `not valid JSON (${e.message})`);
    }
    count(schemaName);
    for (const e of validate(schema(schemaName), data)) err(rel, e);
    extra?.(data, (m) => err(rel, m));
  };

  json("config.json", "config");

  json("routing.json", "routing", (r, bad) => {
    const tiers = Object.keys(r.tiers || {});
    if (r.default && !tiers.includes(r.default)) bad(`default tier "${r.default}" is not defined in tiers`);
    const ids = new Set();
    for (const rule of r.rules || []) {
      if (!tiers.includes(rule.tier)) bad(`rule "${rule.id}" uses undefined tier "${rule.tier}"`);
      if (ids.has(rule.id)) bad(`duplicate rule id "${rule.id}"`);
      ids.add(rule.id);
    }
  });

  json("friction-patterns.json", "friction-patterns", (patterns, bad) => {
    const keys = new Set();
    for (const p of Array.isArray(patterns) ? patterns : []) {
      if (keys.has(p.key)) bad(`duplicate key "${p.key}"`);
      keys.add(p.key);
      let re;
      try {
        re = new RegExp(p.re, p.flags ?? "i");
      } catch (e) {
        bad(`"${p.key}" regex does not compile: ${e.message}`);
        continue;
      }
      for (const s of p.examples?.match || []) if (!re.test(s)) bad(`"${p.key}" should match: ${JSON.stringify(s)}`);
      for (const s of p.examples?.miss || []) if (re.test(s)) bad(`"${p.key}" should not match: ${JSON.stringify(s)}`);
    }
  });

  for (const file of listFiles(join(dir, "runs"), ".json")) {
    const rel = `runs/${basename(file)}`;
    let run;
    try {
      run = readJson(file);
    } catch (e) {
      err(rel, `not valid JSON (${e.message})`);
      continue;
    }
    count("run");
    for (const e of validate(schema("run"), run)) err(rel, e);
    if (run.id && `${run.id}.json` !== basename(file)) err(rel, `id "${run.id}" does not match the file name`);
  }

  const memDir = join(dir, "memory");
  const index = existsSync(join(memDir, "INDEX.md")) ? readFileSync(join(memDir, "INDEX.md"), "utf8") : null;
  const memFiles = listFiles(memDir, ".md").filter((f) => basename(f) !== "INDEX.md");
  for (const file of memFiles) {
    const rel = `memory/${basename(file)}`;
    const text = readFileSync(file, "utf8");
    const { data } = parseFrontmatter(text);
    count("memory");
    if (!data) {
      err(rel, "no frontmatter block");
      continue;
    }
    for (const e of validate(schema("memory"), data)) err(rel, e);
    if (data.name && `${data.name}.md` !== basename(file)) err(rel, `name "${data.name}" does not match the file name`);
    const secrets = findSecrets(text);
    if (secrets.length) err(rel, `looks like it contains a secret (${secrets.join(", ")}); remove it`);
    if (index !== null && !index.includes(`(${basename(file)})`))
      err(rel, "missing from memory/INDEX.md; run memory.mjs index");
  }
  if (memFiles.length && index === null) err("memory/INDEX.md", "missing; run memory.mjs index");
  if (index !== null) {
    for (const m of index.matchAll(/\]\(([^)]+\.md)\)/g))
      if (!existsSync(join(memDir, m[1]))) err("memory/INDEX.md", `links to ${m[1]}, which does not exist`);
  }

  for (const file of listFiles(join(dir, "proposals"), ".md")) {
    const rel = `proposals/${basename(file)}`;
    const { data } = parseFrontmatter(readFileSync(file, "utf8"));
    count("proposal");
    if (!data) err(rel, "no frontmatter block");
    else for (const e of validate(schema("proposal"), data)) err(rel, e);
  }

  return { errors, checked };
}

function main() {
  const dir = factoryDir({ dir: process.argv[2] });
  if (!existsSync(dir)) {
    console.log(`No .factory directory at ${dir}. Could not run.`);
    process.exit(2);
  }
  const { errors, checked } = checkFactory(dir);
  const total = Object.values(checked).reduce((a, b) => a + b, 0);
  if (!total) {
    console.log(`${dir} has nothing to check (no config, routing, runs, memory, or proposals). Could not run.`);
    process.exit(2);
  }
  console.log(`Checked ${Object.entries(checked).map(([k, v]) => `${v} ${k}`).join(", ")} in ${dir}`);
  if (errors.length) {
    for (const e of errors) console.log(`  ERROR  ${e}`);
    console.log(`\n${errors.length} error(s). Failed.`);
    process.exit(1);
  }
  console.log("Factory data OK.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
