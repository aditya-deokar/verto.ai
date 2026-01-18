"use server";

import { auth } from "@clerk/nextjs/server";

export async function fetchRealtimeSubscriptionToken() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Return channel for this user
    return {
        channel: `user:${userId}`,
    };
}
