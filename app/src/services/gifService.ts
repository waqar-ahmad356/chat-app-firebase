// Tenor v2 — free demo key (replace with your own from developers.google.com/tenor)
const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY ?? "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";
const BASE = "https://tenor.googleapis.com/v2";
const LIMIT = 20;

export interface GifResult {
  id: string;
  url: string;
  previewUrl: string;
  title: string;
}

interface TenorMediaFormats {
  gif?: { url: string };
  tinygif?: { url: string };
  mediumgif?: { url: string };
  nanogif?: { url: string };
}

interface TenorItem {
  id: string;
  content_description: string;
  media_formats: TenorMediaFormats;
}

interface TenorResponse {
  results: TenorItem[];
}

function mapItem(item: TenorItem): GifResult | null {
  const f = item.media_formats;
  // Pick best available format for display and preview
  const url = f.gif?.url ?? f.mediumgif?.url;
  const previewUrl = f.tinygif?.url ?? f.nanogif?.url ?? f.gif?.url ?? f.mediumgif?.url;
  if (!url || !previewUrl) return null;
  return { id: item.id, url, previewUrl, title: item.content_description ?? "" };
}

async function tenorFetch(endpoint: string): Promise<GifResult[]> {
  try {
    const res = await fetch(`${BASE}/${endpoint}&key=${TENOR_KEY}&limit=${LIMIT}&media_filter=gif,tinygif,mediumgif,nanogif`);
    if (!res.ok) return [];
    const data: TenorResponse = await res.json();
    return data.results.map(mapItem).filter((r): r is GifResult => r !== null);
  } catch {
    return [];
  }
}

export function fetchTrendingGifs(): Promise<GifResult[]> {
  return tenorFetch("featured?");
}

export function searchGifs(query: string): Promise<GifResult[]> {
  const q = query.trim();
  if (!q) return fetchTrendingGifs();
  return tenorFetch(`search?q=${encodeURIComponent(q)}`);
}
