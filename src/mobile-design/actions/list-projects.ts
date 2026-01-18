"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function listMobileProjects() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const projects = await prisma.mobileProject.findMany({
        where: {
            userId: user.id,
            isDeleted: false,
        },
        include: {
            frames: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return { projects };
}
