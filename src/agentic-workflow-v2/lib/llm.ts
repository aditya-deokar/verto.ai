import { getAiModel } from "@/lib/ai-provider";

/**
 * Shared LLM model instance for all agents
 * Using getAiModel to support BYOAK with fallback to system defaults.
 */
export async function getModel() {
  return await getAiModel("gemini-2.5-flash");
}

/**
 * Configuration for different agent types
 */
export const modelConfigs = {
  // For outline generation - needs creativity
  outline: {
    temperature: 0.8,
    maxOutputTokens: 2000,
  },
  
  // For content writing - balanced
  content: {
    temperature: 0.7,
    maxOutputTokens: 8000,
  },
  
  // For layout selection - needs consistency
  layout: {
    temperature: 0.3,
    maxOutputTokens: 1000,
  },
  
  // For image queries - needs more output for proper JSON
  imageQuery: {
    temperature: 0.7,
    maxOutputTokens: 2000,
  },
  
  // For JSON compilation - needs precision
  jsonCompiler: {
    temperature: 0.2,
    maxOutputTokens: 8000,
  },
};
