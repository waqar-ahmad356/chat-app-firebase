const TENOR_API_BASE = "https://tenor.googleapis.com/v2";
const TENOR_API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY ?? "";
const RESULT_LIMIT = 20;

/**
 * A single GIF result mapped from the Tenor API response.
 */
export interface GifResult {
  /** Tenor's unique ID for this GIF */
  id: string;
  /** Full-quality GIF URL */
  url: string;
  /** Smaller preview GIF URL (tinygif) */
  previewUrl: string;
  /** Human-readable description / title */
  title: string;
}

/** Shape of a single entry in the Tenor v2 `results` array. */
interface TenorResult {
  id: string;
  content_description: string;
  media_formats: {
    gif?: { url: string };
    tinygif?: { url: string };
  };
}

/** Top-level shape of a Tenor v2 API response. */
interface TenorResponse {
  results: TenorResult[];
}

/**
 * Maps a raw Tenor result object to our GifResult interface.
 * Returns null if required media formats are missing.
 */
function mapTenorResult(item: TenorResult): GifResult | null {
  const url = item.media_formats?.gif?.url;
  const previewUrl = item.media_formats?.tinygif?.url;

  if (!url || !previewUrl) {
    return null;
  }

  return {
    id: item.id,
    url,
    previewUrl,
    title: item.content_description ?? "",
  };
}

/**
 * Fetches the current trending GIFs from the Tenor API v2.
 * Returns an empty array on any API or network error (Requirement 7.2 / NFR).
 */
export async function fetchTrendingGifs(): Promise<GifResult[]> {
  if (!TENOR_API_KEY) {
    console.warn("gifService: NEXT_PUBLIC_TENOR_API_KEY is not set.");
    return [];
  }

  try {
    const url = `${TENOR_API_BASE}/featured?key=${TENOR_API_KEY}&limit=${RESULT_LIMIT}&media_filter=gif`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `gifService: Tenor trending request failed with status ${response.status}`
      );
      return [];
    }

    const data: TenorResponse = await response.json();
    return data.results.map(mapTenorResult).filter((r): r is GifResult => r !== null);
  } catch (error) {
    console.error("gifService: Failed to fetch trending GIFs:", error);
    return [];
  }
}

/**
 * Searches for GIFs matching the given query via the Tenor API v2.
 * Returns an empty array on any API or network error (Requirement 7.3 / NFR).
 */
export async function searchGifs(query: string): Promise<GifResult[]> {
  if (!TENOR_API_KEY) {
    console.warn("gifService: NEXT_PUBLIC_TENOR_API_KEY is not set.");
    return [];
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return fetchTrendingGifs();
  }

  try {
    const encodedQuery = encodeURIComponent(trimmed);
    const url = `${TENOR_API_BASE}/search?q=${encodedQuery}&key=${TENOR_API_KEY}&limit=${RESULT_LIMIT}&media_filter=gif`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `gifService: Tenor search request failed with status ${response.status}`
      );
      return [];
    }

    const data: TenorResponse = await response.json();
    return data.results.map(mapTenorResult).filter((r): r is GifResult => r !== null);
  } catch (error) {
    console.error("gifService: Failed to search GIFs:", error);
    return [];
  }
}
