'use server'

import { AiProvider } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { encryptKey } from "@/lib/encryption";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

export async function saveUserAiKey(provider: AiProvider, key: string) {
  try {
    const user = await currentUser();
    if (!user) return { status: 403, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!dbUser) return { status: 404, error: "User not found" };

    // Encrypt the key
    const { key: encryptedKey, iv, tag } = encryptKey(key);

    await prisma.userAiKey.upsert({
      where: {
        userId_provider: {
          userId: dbUser.id,
          provider,
        },
      },
      update: {
        key: encryptedKey,
        iv,
        tag,
      },
      create: {
        userId: dbUser.id,
        provider,
        key: encryptedKey,
        iv,
        tag,
      },
    });

    revalidatePath("/settings");
    return { status: 200, message: "API key saved successfully" };
  } catch (error) {
    console.error("Failed to save AI key:", error);
    return { status: 500, error: "Failed to save API key" };
  }
}

export async function deleteUserAiKey(provider: AiProvider) {
  try {
    const user = await currentUser();
    if (!user) return { status: 403, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    if (!dbUser) return { status: 404, error: "User not found" };

    await prisma.userAiKey.delete({
      where: {
        userId_provider: {
          userId: dbUser.id,
          provider,
        },
      },
    });

    revalidatePath("/settings");
    return { status: 200, message: "API key deleted successfully" };
  } catch (error) {
    console.error("Failed to delete AI key:", error);
    return { status: 500, error: "Failed to delete API key" };
  }
}

export async function getUserAiKeysStatus() {
  try {
    const user = await currentUser();
    if (!user) return { status: 403, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { AiKeys: { select: { provider: true } } },
    });

    if (!dbUser) return { status: 404, error: "User not found" };

    return {
      status: 200,
      data: {
        google: dbUser.AiKeys.some((k) => k.provider === AiProvider.GOOGLE),
        openai: dbUser.AiKeys.some((k) => k.provider === AiProvider.OPENAI),
        groq: dbUser.AiKeys.some((k) => k.provider === AiProvider.GROQ),
      },
    };
  } catch (error) {
    console.error("Failed to get AI keys status:", error);
    return { status: 500, error: "Failed to fetch AI keys status" };
  }
}

export async function testAiKeyConnection(provider: AiProvider, key: string) {
    try {
        let model;
        switch (provider) {
            case AiProvider.OPENAI:
                model = createOpenAI({ apiKey: key })('gpt-4o-mini');
                break;
            case AiProvider.GOOGLE:
                model = createGoogleGenerativeAI({ apiKey: key })('gemini-1.5-flash');
                break;
            case AiProvider.GROQ:
                model = createGroq({ apiKey: key })('llama-3.1-8b-instant');
                break;
            default:
                throw new Error("Unsupported provider");
        }

        const { text } = await generateText({
            model,
            prompt: "Say 'Hello' only.",
            maxOutputTokens: 5,
        });

        if (text && text.length > 0) {
            return { status: 200, message: "Connection successful!" };
        } else {
            return { status: 400, error: "Provider responded unexpectedly." };
        }
    } catch (error) {
        console.error("AI Key test failed:", error);
        return { status: 500, error: "Connection failed. Please check your API key." };
    }
}
