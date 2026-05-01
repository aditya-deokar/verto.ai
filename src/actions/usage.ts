'use server'

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getUserUsageDetails } from "@/lib/usage-limit";

export async function getUserUsage() {
  try {
    const user = await currentUser();
    if (!user) return { status: 403, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) return { status: 404, error: "User not found" };

    const details = await getUserUsageDetails(dbUser.id);

    return {
      status: 200,
      data: details
    };
  } catch (error) {
    console.error("Failed to get user usage:", error);
    return { status: 500, error: "Internal server error" };
  }
}
