import { auth } from "@clerk/nextjs/server";
import prisma from "@/generated/prisma";
import { NextResponse } from "next/server";
import { inngest } from "@/mobile-design/inngest/client";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Find user in database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const { name, prompt } = await req.json();

        // Create mobile project
        const project = await prisma.mobileProject.create({
            data: {
                userId: user.id,
                name,
            },
        });

        // Trigger Inngest screen generation
        await inngest.send({
            name: "ui/generate.screens",
            data: {
                userId: user.id,
                projectId: project.id,
                prompt,
                frames: [],
                theme: null,
            },
        });

        return NextResponse.json({ project });
    } catch (error) {
        console.error("Error creating mobile project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return new Response("User not found", { status: 404 });
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

        return NextResponse.json({ projects });
    } catch (error) {
        console.error("Error fetching mobile projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}
