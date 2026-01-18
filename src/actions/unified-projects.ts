"use server";

import prisma from "@/lib/prisma";
import { onAuthenticateUser } from "./user";

export interface DashboardProject {
    id: string;
    title: string;
    type: "PRESENTATION" | "MOBILE_DESIGN";
    thumbnail?: string | null;
    createdAt: Date;
    updatedAt: Date;
    slides?: any; // for PPT
    frames?: any; // for Mobile
    theme?: string | null;
    isSellable?: boolean;
}

export const getUnifiedProjects = async () => {
    try {
        const checkUser = await onAuthenticateUser();
        if (checkUser.status !== 200 || !checkUser.user) {
            return {
                status: 403,
                error: "User Not Authenticated",
            };
        }

        const userId = checkUser.user.id;

        // Fetch Presentation Projects (PPT)
        const pptProjects = await prisma.project.findMany({
            where: {
                userId: userId,
                isDeleted: false,
            },
        });

        // Fetch Mobile Design Projects
        const mobileProjects = await prisma.mobileProject.findMany({
            where: {
                userId: userId,
                isDeleted: false,
            },
            include: {
                frames: {
                    take: 1, // Only need the first frame for preview if needed, though card likely uses thumbnail or separate logic
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        // Normalize and Combine
        const unifiedProjects: DashboardProject[] = [
            ...pptProjects.map((p) => ({
                id: p.id,
                title: p.title,
                type: "PRESENTATION" as const,
                thumbnail: p.thumbnail,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                slides: p.slides,
                theme: p.themeName,
                isSellable: p.isSellable,
            })),
            ...mobileProjects.map((p) => ({
                id: p.id,
                title: p.name,
                type: "MOBILE_DESIGN" as const,
                thumbnail: p.thumbnail,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                frames: p.frames,
                theme: p.theme,
            })),
        ];

        // Sort by updatedAt descending
        unifiedProjects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        return {
            status: 200,
            data: unifiedProjects,
        };
    } catch (error) {
        console.log("🔴 ERROR", error);
        return {
            status: 500,
            error: "Internal Server Error",
        };
    }
};
