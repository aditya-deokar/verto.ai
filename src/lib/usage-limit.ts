import prisma from "./prisma";
import { SubscriptionStatus } from "@/generated/prisma";

export const LIMITS = {
  FREE: 5,
  BYOAK: 15,
};

/**
 * Calculates the total project limit for a user based on their status and keys.
 */
export async function getUserUsageDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      AiKeys: { select: { id: true } },
      Subscription: { select: { status: true } },
    },
  });

  if (!user) return { usage: 0, limit: LIMITS.FREE, isUnlimited: false };

  // 1. Check for Active Subscription
  const isUnlimited = user.Subscription?.status === SubscriptionStatus.ACTIVE;
  if (isUnlimited) {
    return { usage: user.usageCount, limit: Infinity, isUnlimited: true };
  }

  // 2. Check for BYOAK
  const hasAiKeys = user.AiKeys.length > 0;
  const limit = hasAiKeys ? LIMITS.BYOAK : LIMITS.FREE;

  return { usage: user.usageCount, limit, isUnlimited: false };
}

/**
 * Checks if a user is within their limit and increments the count.
 */
export async function checkAndIncrementUsage(userId: string) {
  const { usage, limit, isUnlimited } = await getUserUsageDetails(userId);

  if (!isUnlimited && usage >= limit) {
    return { 
      success: false, 
      error: `Usage limit reached (${usage}/${limit}). Upgrade or add an API key to continue.`,
      usage,
      limit
    };
  }

  // Increment the usage count
  await prisma.user.update({
    where: { id: userId },
    data: { usageCount: { increment: 1 } },
  });

  return { success: true, usage: usage + 1, limit };
}
