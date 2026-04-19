// src/lib/templates/index.ts
// Template system barrel export

export { SEED_TEMPLATES, type SeedTemplate } from "./seed-templates";
export {
  extractPlaceholders,
  populatePlaceholders,
  walkContentItem,
  validateTemplate,
  buildTemplatePromptContext,
} from "./template-utils";
