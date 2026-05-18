"use client";

import { useEffect, useRef, useState } from "react";
import { fetchTrendingGifs, searchGifs, type GifResult } from "@/app/src/services/gifService";

interface GifPickerProps {
  onSelect: (gif: GifResult) => void;
  onClose: () => void;
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load trending on open
  useEffect(() => {
    fetchTrendingGifs().then((results) => {
      setGifs(results);
      setLoading(false);
    });
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchGifs(value);
      setGifs(results);
      setLoading(false);
    }, 400);
  }

  return (
    <div className="absolute bottom-full mb-2 right-0 z-20 w-72 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-700 px-3 py-2">
        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search GIFs…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button type="button" onClick={onClose} aria-label="Close GIF picker" className="text-slate-400 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-56 overflow-y-auto p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
          </div>
        ) : gifs.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">No GIFs found</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => { onSelect(gif); onClose(); }}
                className="overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gif.previewUrl}
                  alt={gif.title}
                  className="h-24 w-full object-cover transition-opacity hover:opacity-80"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
