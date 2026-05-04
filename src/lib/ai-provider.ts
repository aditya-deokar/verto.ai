import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { AiProvider } from '@/generated/prisma';
import prisma from './prisma';
import { decryptKey } from './encryption';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Returns an initialized AI provider based on user settings or system defaults.
 * @param providerPreference Optional preference for the provider (GOOGLE, OPENAI, GROQ)
 * @returns An initialized AI provider function (e.g., google(), openai(), groq())
 */
export async function getAiProvider(providerPreference?: AiProvider) {
  // 1. Get current user
  const user = await currentUser();
  
  if (user) {
    // 2. Fetch user in Prisma to get the internal ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { AiKeys: true }
    });

    if (dbUser) {
      // 3. Determine which provider to use
      // If user has a preference, try to find that key
      // Otherwise, try to find ANY key the user has provided
      const targetProvider = providerPreference || AiProvider.GOOGLE;
      const userKey = dbUser.AiKeys.find(k => k.provider === targetProvider);

      if (userKey) {
        const decryptedKey = decryptKey(userKey.key, userKey.iv, userKey.tag);
        
        switch (targetProvider) {
          case AiProvider.OPENAI:
            return createOpenAI({ apiKey: decryptedKey });
          case AiProvider.GROQ:
            return createGroq({ apiKey: decryptedKey });
          case AiProvider.GOOGLE:
            return createGoogleGenerativeAI({ apiKey: decryptedKey });
        }
      }
    }
  }

  // 4. Default Fallback to System Google Key
  return createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
  });
}

/**
 * Helper to get a specific model instance directly.
 * @param modelName Optional model name (e.g., 'gpt-4o', 'gemini-2.5-flash')
 * @param providerPreference Optional preference for the provider
 * @returns A configured model instance
 */
export async function getAiModel(modelName?: string, providerPreference?: AiProvider) {
  // If the user hasn't provided a preference, we check if they have ANY key saved.
  // We'll try to find a provider they HAVE a key for.
  const user = await currentUser();
  let actualProviderType = providerPreference;

  if (!actualProviderType && user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { AiKeys: { select: { provider: true } } }
    });
    if (dbUser && dbUser.AiKeys.length > 0) {
      // Pick the first available key, or prefer GOOGLE if they have it
      const hasGoogle = dbUser.AiKeys.some(k => k.provider === AiProvider.GOOGLE);
      actualProviderType = hasGoogle ? AiProvider.GOOGLE : dbUser.AiKeys[0].provider;
    }
  }

  const provider = await getAiProvider(actualProviderType);
  const finalProvider = actualProviderType || AiProvider.GOOGLE;

  // If a model name is provided, we use it ONLY if it belongs to the target provider.
  // This is a simple heuristic: Google models start with 'gemini', OpenAI with 'gpt', Groq varies.
  const isModelCompatible = !modelName || 
    (finalProvider === AiProvider.GOOGLE && modelName.startsWith('gemini')) ||
    (finalProvider === AiProvider.OPENAI && modelName.startsWith('gpt'));

  if (!isModelCompatible || !modelName) {
    switch (finalProvider) {
      case AiProvider.OPENAI:
        return provider('gpt-4o');
      case AiProvider.GROQ:
        return provider('llama-3.3-70b-versatile');
      case AiProvider.GOOGLE:
      default:
        return provider('gemini-3-flash-preview');
    }
  }

  return provider(modelName);
}
