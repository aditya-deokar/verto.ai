// GENERATED from shared/lib/schema.mjs by scripts/sync-shared.mjs. Edit the source, then run it.
// A small JSON Schema subset validator, so factory scripts need no dependencies.
// Supported: type (string or array), enum, const, required, properties,
// additionalProperties (boolean or schema), items, pattern, format (date,
// date-time), minimum, minLength, minItems. Anything else is ignored, so keep
// the schemas in shared/schemas inside this subset.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  return typeof v;
}

function typeMatches(want, v) {
  const got = typeOf(v);
  return [].concat(want).some((t) => t === got || (t === "number" && got === "integer"));
}

export function validate(schema, value, path = "$") {
  const errors = [];
  const push = (msg) => errors.push(`${path}: ${msg}`);

  if (schema.type && !typeMatches(schema.type, value)) {
    push(`expected ${[].concat(schema.type).join(" or ")}, got ${typeOf(value)}`);
    return errors;
  }
  if ("const" in schema && value !== schema.const) push(`must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value))
    push(`must be one of ${schema.enum.map((e) => JSON.stringify(e)).join(", ")}, got ${JSON.stringify(value)}`);

  if (typeof value === "string") {
    if (schema.minLength != null && value.length < schema.minLength) push(`shorter than ${schema.minLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) push(`does not match /${schema.pattern}/`);
    if (schema.format === "date" && !DATE.test(value)) push("not a YYYY-MM-DD date");
    if (schema.format === "date-time" && !DATE_TIME.test(value)) push("not an ISO 8601 date-time");
  }
  if (typeof value === "number" && schema.minimum != null && value < schema.minimum)
    push(`less than ${schema.minimum}`);

  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) push(`fewer than ${schema.minItems} items`);
    if (schema.items) value.forEach((v, i) => errors.push(...validate(schema.items, v, `${path}[${i}]`)));
  }

  if (typeOf(value) === "object") {
    for (const key of schema.required || [])
      if (!(key in value)) push(`missing required field "${key}"`);
    const props = schema.properties || {};
    for (const [key, v] of Object.entries(value)) {
      if (props[key]) errors.push(...validate(props[key], v, `${path}.${key}`));
      else if (schema.additionalProperties === false) push(`unknown field "${key}"`);
      else if (typeof schema.additionalProperties === "object")
        errors.push(...validate(schema.additionalProperties, v, `${path}.${key}`));
    }
  }
  return errors;
}
