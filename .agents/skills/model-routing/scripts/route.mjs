#!/usr/bin/env node
// Resolves a task to a model tier (and a model for this harness) from
// .factory/routing.json. First matching rule wins; no match gives the default.
// Usage: node route.mjs --beat <b> [--class <c>] [--size <s>] [--harness h] [--json]
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { detectHarness, factoryDir, parseArgs, readJson } from "./lib/factory.mjs";
import { validate } from "./lib/schema.mjs";

const SCHEMA = JSON.parse(readFileSync(new URL("./schemas/routing.schema.json", import.meta.url), "utf8"));

export function loadRouting(file) {
  if (!existsSync(file))
    throw Object.assign(new Error(`no routing rules at ${file}. Run factory-setup, or pass --routing.`), { exitCode: 2 });
  const routing = readJson(file);
  const errors = validate(SCHEMA, routing);
  if (errors.length) throw new Error(`invalid ${file}:\n  ${errors.join("\n  ")}`);
  return routing;
}

function matches(rule, task) {
  return Object.entries(rule.match).every(([key, want]) => task[key] != null && [].concat(want).includes(task[key]));
}

/** { tier, model, rule } for a task. model is null when the harness has no mapping. */
export function resolveRoute(routing, task, harness = "unknown") {
  const rule = routing.rules.find((r) => matches(r, task)) || null;
  const tier = rule ? rule.tier : routing.default;
  if (!routing.tiers[tier]) throw new Error(`tier "${tier}" is not defined in routing tiers`);
  return {
    tier,
    model: routing.tiers[tier][harness] ?? null,
    rule: rule ? rule.id : "default",
    harness,
    evidence: rule && routing.evidence?.[rule.id] ? routing.evidence[rule.id] : null,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const routing = loadRouting(args.routing || join(factoryDir({ dir: args.dir }), "routing.json"));
    const harness = args.harness || detectHarness();
    const route = resolveRoute(routing, { beat: args.beat, class: args.class, size: args.size }, harness);
    if (args.json) return console.log(JSON.stringify(route, null, 2));
    console.log(
      `tier ${route.tier}, model ${route.model || `(none mapped for ${harness}; use your ${route.tier} model)`}, rule ${route.rule}` +
        (route.evidence ? `, backed by ${route.evidence}` : "")
    );
    console.log(`ledger flags: --tier ${route.tier}${route.model ? ` --model ${route.model}` : ""} --rule ${route.rule}`);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(err.exitCode || 1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
