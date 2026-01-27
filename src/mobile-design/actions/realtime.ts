"use server";

import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/mobile-design/inngest/client";
import { getSubscriptionToken } from "@inngest/realtime";
import prisma from "@/lib/prisma";

export async function fetchRealtimeSubscriptionToken() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Get the database user ID (not Clerk ID)
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Create a token using the Inngest API bound to this user's channel
    const token = await getSubscriptionToken(inngest, {
        channel: `user:${user.id}`,
        topics: [
            "generation.start",
            "analysis.start",
            "analysis.complete",
            "frame.created",
            "generation.complete",
        ],
    });

    return token;
}
