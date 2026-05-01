// agents/projectInitializer.ts - Agent 1: Initialize Project in Database

import prisma from "@/lib/prisma";
import { AdvancedPresentationState } from "../lib/state";

/**
 * Agent 1: Project Initializer
 * 
 * Purpose: Creates a new project in the database before generation starts
 * This allows us to track progress and save results incrementally
 * 
 * @param state - Current graph state
 * @returns Updated state with projectId
 */
export async function runProjectInitializer(
  state: AdvancedPresentationState
): Promise<Partial<AdvancedPresentationState>> {
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│  🚀 AGENT 1: Project Initializer       │");
  console.log("└─────────────────────────────────────────┘");

  try {
    if (state.projectId) {
      console.log(`✅ Using existing project: ${state.projectId}`);
      
      // Update the theme if provided
      await prisma.project.update({
        where: { id: state.projectId },
        data: { themeName: state.themePreference || "light" }
      });
      
      return {
        projectId: state.projectId,
        currentStep: "Project Initialized",
        progress: 10,
      };
    }

    // Extract presentation title from user input (first 100 chars)
    const presentationTitle = state.userInput.slice(0, 100).trim();
    
    console.log(`📝 Creating project: "${presentationTitle}"`);
    console.log(`👤 Clerk User ID: ${state.userId}`);

    // Find the User record by Clerk ID to get the UUID
    const user = await prisma.user.findUnique({
      where: { clerkId: state.userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User not found with clerkId: ${state.userId}`);
    }

    console.log(`✅ Found user: ${user.id}`);

    // Create initial project in database
    const project = await prisma.project.create({
      data: {
        title: presentationTitle,
        userId: user.id, // Use the UUID from User table
        outlines: [], // Will be populated by outline agent
        themeName: state.themePreference || "light",
        isDeleted: false,
      },
    });

    console.log(`✅ Project created successfully!`);
    console.log(`   Project ID: ${project.id}`);
    console.log(`   Theme: ${project.themeName}`);

    return {
      projectId: project.id,
      currentStep: "Project Initialized",
      progress: 10, // 10% complete
    };
  } catch (error) {
    console.error("🔴 Error creating project:", error);
    return {
      error: `Failed to initialize project: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
