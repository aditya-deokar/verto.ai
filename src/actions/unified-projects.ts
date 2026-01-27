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

export type ProjectFilter = 'all' | 'presentation' | 'mobile';

export const getUnifiedProjects = async (filter: ProjectFilter = 'all') => {
    try {
        const checkUser = await onAuthenticateUser();
        if (checkUser.status !== 200 || !checkUser.user) {
            return {
                status: 403,
                error: "User Not Authenticated",
            };
        }

        const userId = checkUser.user.id;

        let pptProjects: any[] = [];
        let mobileProjects: any[] = [];

        // Fetch Presentation Projects (PPT) if needed
        if (filter === 'all' || filter === 'presentation') {
            pptProjects = await prisma.project.findMany({
                where: {
                    userId: userId,
                    isDeleted: false,
                },
            });
        }

        // Fetch Mobile Design Projects if needed
        if (filter === 'all' || filter === 'mobile') {
            mobileProjects = await prisma.mobileProject.findMany({
                where: {
                    userId: userId,
                    isDeleted: false,
                },
                include: {
                    frames: {
                        take: 1,
                        orderBy: { createdAt: "asc" }
                    }
                }
            });
        }

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

export const searchProjects = async (
    query: string,
    filter: ProjectFilter = 'all',
    limit: number = 10
) => {
    try {
        // Return empty if query is too short
        if (!query || query.trim().length < 2) {
            return {
                status: 200,
                data: [],
            };
        }

        const checkUser = await onAuthenticateUser();
        if (checkUser.status !== 200 || !checkUser.user) {
            return {
                status: 403,
                error: "User Not Authenticated",
            };
        }

        const userId = checkUser.user.id;
        const searchTerm = query.trim();

        let pptProjects: any[] = [];
        let mobileProjects: any[] = [];

        // Search Presentation Projects (PPT) if needed
        if (filter === 'all' || filter === 'presentation') {
            pptProjects = await prisma.project.findMany({
                where: {
                    userId: userId,
                    isDeleted: false,
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                take: limit,
                orderBy: {
                    updatedAt: 'desc',
                },
            });
        }

        // Search Mobile Design Projects if needed
        if (filter === 'all' || filter === 'mobile') {
            mobileProjects = await prisma.mobileProject.findMany({
                where: {
                    userId: userId,
                    isDeleted: false,
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                include: {
                    frames: {
                        take: 1,
                        orderBy: { createdAt: "asc" }
                    }
                },
                take: limit,
            });
        }

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

        // Sort by updatedAt descending and limit total results
        unifiedProjects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        const limitedResults = unifiedProjects.slice(0, limit);

        return {
            status: 200,
            data: limitedResults,
        };
    } catch (error) {
        console.log("🔴 SEARCH ERROR", error);
        return {
            status: 500,
            error: "Internal Server Error",
        };
    }
};
