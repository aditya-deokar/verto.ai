// agents/imageFetcher.ts - Agent 6: Fetch images from the configured provider

import { AdvancedPresentationState } from "../lib/state";
import { fetchImagesForQueries, validateImageUrl, getDefaultImage } from "../utils/imageUtils";

function emitToken(state: AdvancedPresentationState, content: string) {
  if (state.streamEventHandler) {
    state.streamEventHandler({
      type: 'token',
      agentId: 'imageFetcher',
      content,
      timestamp: Date.now(),
    });
  }
}

/**
 * Agent 6: Image Fetcher
 * 
 * Purpose: Fetches actual images based on queries
 * - Uses the configured image provider (Unsplash by default)
 * - Falls back to safe placeholder images when provider calls fail
 * - Validates image URLs
 * - Keeps the overall generation run from failing on image issues
 * 
 * @param state - Current graph state
 * @returns Updated state with image URLs
 */
export async function runImageFetcher(
  state: AdvancedPresentationState
): Promise<Partial<AdvancedPresentationState>> {
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│  🖼️  AGENT 6: Image Fetcher            │");
  console.log("└─────────────────────────────────────────┘");

  if (!state.slideData || state.slideData.length === 0) {
    console.log("⚠️  No slide data to process. Skipping image fetching.");
    return {};
  }

  try {
    // Filter slides that have image queries but no URLs yet
    const slidesNeedingImages = state.slideData.filter(
      (slide) => slide.imageQuery && !slide.imageUrl
    );

    if (slidesNeedingImages.length === 0) {
      console.log("✅ All images already fetched or no images needed.");
      return {
        currentStep: "Images Fetched",
        progress: 75,
      };
    }

    console.log(`🖼️  Fetching images for ${slidesNeedingImages.length} slides...`);

    // Prepare queries for batch fetching
    const queries = slidesNeedingImages.map((slide) => ({
      query: slide.imageQuery!,
      altText: `Image for ${slide.slideTitle}`,
    }));

    // Fetch all images
    const fetchedImages = await fetchImagesForQueries(queries);

    console.log(`✅ Fetched ${fetchedImages.length} images successfully`);

    fetchedImages.forEach((img, i) => {
      emitToken(state, `Image ${i + 1}: ${img.url.slice(0, 50)}...`);
    });

    // Update slide data with fetched image URLs
    let imageIndex = 0;
    const updatedSlideData = state.slideData.map((slide) => {
      if (slide.imageQuery && !slide.imageUrl) {
        const imageData = fetchedImages[imageIndex];
        imageIndex++;

        // Validate URL
        const isValid = validateImageUrl(imageData.url);
        const finalUrl = isValid ? imageData.url : getDefaultImage();

        if (!isValid) {
          console.warn(
            `⚠️  Invalid image URL for slide "${slide.slideTitle}", using fallback`
          );
        }

        return {
          ...slide,
          imageUrl: finalUrl,
        };
      }

      return slide;
    });

    // Check if there are more images to fetch (for conditional edge)
    const remainingImages = updatedSlideData.filter(
      (slide) => slide.imageQuery && !slide.imageUrl
    );

    const allImagesFetched = remainingImages.length === 0;

    console.log(
      allImagesFetched
        ? "✅ All images fetched successfully!"
        : `⚠️  ${remainingImages.length} images still pending...`
    );

    return {
      slideData: updatedSlideData,
      currentStep: allImagesFetched ? "All Images Fetched" : "Fetching Images",
      progress: 75,
    };
  } catch (error) {
    console.error("🔴 Error fetching images:", error);
    
    // Don't fail the entire graph - use fallback images
    console.log("⚠️  Using fallback images for all slides");
    
    const fallbackSlideData = state.slideData.map((slide) => {
      if (slide.imageQuery && !slide.imageUrl) {
        return {
          ...slide,
          imageUrl: getDefaultImage(),
        };
      }
      return slide;
    });

    return {
      slideData: fallbackSlideData,
      currentStep: "Images Fetched (Fallback)",
      progress: 75,
    };
  }
}

/**
 * Router function: Determines if we need to fetch more images
 * Used for conditional edge in the graph
 */
export function shouldFetchMoreImages(
  state: AdvancedPresentationState
): "imageFetcher" | "jsonCompiler" {
  const pendingImages = state.slideData.filter(
    (slide) => slide.imageQuery && !slide.imageUrl
  );

  if (pendingImages.length > 0) {
    console.log(`🔄 ${pendingImages.length} images still pending - looping back`);
    return "imageFetcher";
  }

  console.log("✅ All images fetched - proceeding to JSON compilation");
  return "jsonCompiler";
}
