export type ImageSearchResult = {
  url: string;
  altText: string;
  providerId: string;
  creditName?: string;
  creditUrl?: string;
};

export type ImageSearchOptions = {
  index?: number;
  timeoutMs?: number;
};

export interface ImageProvider {
  readonly id: string;
  searchImages(
    query: string,
    options?: ImageSearchOptions
  ): Promise<ImageSearchResult[]>;
}

const PLACEHOLDER_IMAGES = {
  business: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80",
  ],
  technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
  ],
  people: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
  ],
  nature: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  ],
  abstract: [
    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
  ],
  data: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  ],
  education: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
    "https://images.unsplash.com/photo-1557683304-673a23048d34?w=1200&q=80",
  ],
} as const;

function categorizeQuery(query: string): keyof typeof PLACEHOLDER_IMAGES {
  const lowercaseQuery = query.toLowerCase();

  if (
    lowercaseQuery.includes("business") ||
    lowercaseQuery.includes("office") ||
    lowercaseQuery.includes("corporate")
  ) {
    return "business";
  }
  if (
    lowercaseQuery.includes("tech") ||
    lowercaseQuery.includes("computer") ||
    lowercaseQuery.includes("digital")
  ) {
    return "technology";
  }
  if (
    lowercaseQuery.includes("people") ||
    lowercaseQuery.includes("team") ||
    lowercaseQuery.includes("group")
  ) {
    return "people";
  }
  if (
    lowercaseQuery.includes("nature") ||
    lowercaseQuery.includes("landscape") ||
    lowercaseQuery.includes("outdoor")
  ) {
    return "nature";
  }
  if (
    lowercaseQuery.includes("abstract") ||
    lowercaseQuery.includes("pattern") ||
    lowercaseQuery.includes("texture")
  ) {
    return "abstract";
  }
  if (
    lowercaseQuery.includes("data") ||
    lowercaseQuery.includes("chart") ||
    lowercaseQuery.includes("graph")
  ) {
    return "data";
  }
  if (
    lowercaseQuery.includes("education") ||
    lowercaseQuery.includes("learning") ||
    lowercaseQuery.includes("study")
  ) {
    return "education";
  }

  return "default";
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

class UnsplashImageProvider implements ImageProvider {
  readonly id = "unsplash";

  async searchImages(
    query: string,
    options: ImageSearchOptions = {}
  ): Promise<ImageSearchResult[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
    if (!accessKey) {
      return [];
    }

    const perPage = Math.max(
      3,
      Math.min(
        Number.parseInt(process.env.UNSPLASH_RESULTS_PER_QUERY ?? "6", 10) || 6,
        10
      )
    );

    const timeoutMs = options.timeoutMs ?? 8000;
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("content_filter", "high");

    const response = await fetchWithTimeout(
      url.toString(),
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
      },
      timeoutMs
    );

    if (response.status === 429) {
      throw new Error("Unsplash rate limit exceeded");
    }

    if (!response.ok) {
      throw new Error(`Unsplash request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      results?: Array<{
        alt_description?: string | null;
        description?: string | null;
        urls?: {
          regular?: string;
          full?: string;
        };
        user?: {
          name?: string;
          links?: {
            html?: string;
          };
        };
      }>;
    };

    const results: ImageSearchResult[] = [];

    for (const result of payload.results ?? []) {
      const imageUrl = result.urls?.regular || result.urls?.full;
      if (!imageUrl) {
        continue;
      }

      results.push({
        url: imageUrl,
        altText:
          result.alt_description ||
          result.description ||
          `Photo result for ${query}`,
        providerId: this.id,
        creditName: result.user?.name,
        creditUrl: result.user?.links?.html,
      });
    }

    return results;
  }
}

class FallbackImageProvider implements ImageProvider {
  readonly id = "fallback";

  async searchImages(
    query: string,
    options: ImageSearchOptions = {}
  ): Promise<ImageSearchResult[]> {
    const category = categorizeQuery(query);
    const images = PLACEHOLDER_IMAGES[category];
    const startIndex = options.index ?? 0;
    const orderedImages = images.map(
      (_, offset) => images[(startIndex + offset) % images.length]
    );

    return orderedImages.map((url) => ({
      url,
      altText: query,
      providerId: this.id,
      creditName: "Fallback image",
      creditUrl: undefined,
    })) as ImageSearchResult[];
  }
}

const fallbackProvider = new FallbackImageProvider();

export function getDefaultFallbackImage() {
  return PLACEHOLDER_IMAGES.default[0];
}

export function getFallbackImageProvider(): ImageProvider {
  return fallbackProvider;
}

export function getActiveImageProvider(): ImageProvider {
  const provider = (process.env.IMAGE_PROVIDER ?? "unsplash").toLowerCase();

  if (provider === "unsplash" && process.env.UNSPLASH_ACCESS_KEY?.trim()) {
    return new UnsplashImageProvider();
  }

  return fallbackProvider;
}
