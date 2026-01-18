"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/mobile-design/inngest/client";
import { revalidatePath } from "next/cache";

export async function regenerateFrame(frameId: string, projectId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    // Verify ownership
    const project = await prisma.mobileProject.findFirst({
        where: {
            id: projectId,
            userId: user.id,
        },
        include: {
            frames: {
                where: { id: frameId },
            },
        },
    });

    if (!project || !project.frames.length) {
        throw new Error("Frame not found");
    }

    const frame = project.frames[0];

    // Trigger Inngest regeneration
    await inngest.send({
        name: "ui/regenerate.frame",
        data: {
            userId: user.id,
            projectId: project.id,
            frameId: frame.id,
            frameData: {
                id: frame.screenId,
                title: frame.screenName,
                description: frame.tagline || "",
            },
            theme: project.theme,
        },
    });

    revalidatePath(`/mobile-design/${projectId}`);

    return { success: true };
}
