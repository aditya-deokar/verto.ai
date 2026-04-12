import {
  getActiveImageProvider,
  getDefaultFallbackImage,
  getFallbackImageProvider,
  type ImageSearchResult,
} from "./imageProviders";

function selectImageResult(
  results: ImageSearchResult[],
  index: number
): ImageSearchResult | null {
  const validResults = results.filter((result) => validateImageUrl(result.url));
  if (validResults.length === 0) {
    return null;
  }

  return validResults[index % validResults.length];
}

export async function fetchImageForQuery(
  query: string,
  index: number = 0
): Promise<ImageSearchResult> {
  console.log(`Fetching image for query: "${query}"`);

  const provider = getActiveImageProvider();

  try {
    const results = await provider.searchImages(query, { index });
    const selectedImage = selectImageResult(results, index);

    if (selectedImage) {
      console.log(
        `Selected ${provider.id} image: ${selectedImage.url.substring(0, 80)}...`
      );
      return selectedImage;
    }
  } catch (error) {
    console.warn(
      `Primary image provider failed for "${query}":`,
      error instanceof Error ? error.message : error
    );
  }

  const fallbackResults = await getFallbackImageProvider().searchImages(query, {
    index,
  });
  const fallbackImage = selectImageResult(fallbackResults, index);

  if (fallbackImage) {
    return fallbackImage;
  }

  return {
    url: getDefaultImage(),
    altText: query,
    providerId: "fallback",
  };
}

export async function fetchImagesForQueries(
  queries: Array<{ query: string; altText: string }>
): Promise<Array<{ url: string; altText: string }>> {
  console.log(`Batch fetching ${queries.length} images...`);

  const results: Array<{ url: string; altText: string }> = [];

  for (let index = 0; index < queries.length; index++) {
    const query = queries[index];
    const result = await fetchImageForQuery(query.query, index);

    results.push({
      url: result.url,
      altText: result.altText || query.altText,
    });
  }

  return results;
}

export function validateImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function getDefaultImage(): string {
  return getDefaultFallbackImage();
}
