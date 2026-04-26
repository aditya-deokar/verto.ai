/**
 * Seed script for the "Agentic AI" presentation template.
 * 
 * Run with:
 *   npx tsx prisma/seed-agentic-ai.ts
 */

import { PrismaClient } from "../src/generated/prisma";
import { SEED_TEMPLATES } from "../src/lib/templates/seed-templates";

const prisma = new PrismaClient();

async function main() {
  // Find the Agentic AI template from SEED_TEMPLATES
  const agenticTemplate = SEED_TEMPLATES.find(
    (t) => t.name === "Agentic AI"
  );

  if (!agenticTemplate) {
    console.error("❌ Agentic AI template not found in SEED_TEMPLATES");
    process.exit(1);
  }

  // Check if it already exists
  const existing = await prisma.presentationTemplate.findFirst({
    where: { name: "Agentic AI" },
  });

  if (existing) {
    // Update the existing one
    await prisma.presentationTemplate.update({
      where: { id: existing.id },
      data: {
        description: agenticTemplate.description,
        category: agenticTemplate.category as any,
        tags: agenticTemplate.tags,
        difficulty: agenticTemplate.difficulty as any,
        slideCount: agenticTemplate.slideCount,
        slides: agenticTemplate.slides as any,
        themeName: agenticTemplate.themeName,
        layoutSequence: agenticTemplate.layoutSequence,
        outlines: agenticTemplate.outlines,
        isPremium: agenticTemplate.isPremium,
        isFeatured: agenticTemplate.isFeatured,
        aiEnhanceable: true,
        isPublished: true,
        isNew: true,
        previewImages: [],
        authorName: "Verto AI",
      },
    });
    console.log("✅ Updated existing Agentic AI template (id:", existing.id, ")");
  } else {
    // Create new
    const created = await prisma.presentationTemplate.create({
      data: {
        name: agenticTemplate.name,
        description: agenticTemplate.description,
        category: agenticTemplate.category as any,
        tags: agenticTemplate.tags,
        difficulty: agenticTemplate.difficulty as any,
        slideCount: agenticTemplate.slideCount,
        slides: agenticTemplate.slides as any,
        themeName: agenticTemplate.themeName,
        layoutSequence: agenticTemplate.layoutSequence,
        outlines: agenticTemplate.outlines,
        isPremium: agenticTemplate.isPremium,
        isFeatured: agenticTemplate.isFeatured,
        aiEnhanceable: true,
        isPublished: true,
        isNew: true,
        previewImages: [],
        authorName: "Verto AI",
      },
    });
    console.log("✅ Created Agentic AI template (id:", created.id, ")");
  }

  console.log("\n📊 Template details:");
  console.log("   Slides:", agenticTemplate.slideCount);
  console.log("   Layouts used:", agenticTemplate.layoutSequence.length);
  console.log("   Theme:", agenticTemplate.themeName);
  console.log("   Category:", agenticTemplate.category);
  console.log("   Layout types:", agenticTemplate.layoutSequence.join(", "));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
