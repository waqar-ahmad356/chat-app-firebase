"use client";

interface PinnedMessageBannerProps {
  text: string;
  onClick: () => void;
  onUnpin: () => void;
}

export function PinnedMessageBanner({ text, onClick, onUnpin }: PinnedMessageBannerProps) {
  return (
    <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
      <span className="text-amber-400" aria-hidden="true">📌</span>
      <button
        type="button"
        onClick={onClick}
        className="flex-1 truncate text-left text-xs text-amber-300 hover:text-amber-200 transition-colors"
      >
        <span className="font-semibold">Pinned: </span>
        {text || "Message"}
      </button>
      <button
        type="button"
        onClick={onUnpin}
        aria-label="Unpin message"
        className="rounded p-0.5 text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-amber-200"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
