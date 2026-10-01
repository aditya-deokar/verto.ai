// GENERATED from shared/lib/secrets.mjs by scripts/sync-shared.mjs. Edit the source, then run it.
// High-confidence secret shapes only. A false positive blocks a memory write,
// so each pattern here matches a token format a vendor documents, not a guess.
const PATTERNS = [
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{50,}\b/],
  ["Anthropic key", /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ["OpenAI key", /\bsk-(proj-)?[A-Za-z0-9]{32,}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Private key", /-----BEGIN (RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/],
];

/** Returns the names of secret shapes found in text, empty when clean. */
export function findSecrets(text) {
  return PATTERNS.filter(([, re]) => re.test(String(text))).map(([name]) => name);
}
