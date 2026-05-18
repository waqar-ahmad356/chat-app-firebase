"use client";

import { useState } from "react";

interface ReactionBarProps {
  reactions: Record<string, string[]>;
  currentUserId: string;
  /** Map of uid → displayName for tooltip */
  userNames: Record<string, string>;
  onToggle: (emoji: string) => void;
}

export function ReactionBar({ reactions, currentUserId, userNames, onToggle }: ReactionBarProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const entries = Object.entries(reactions).filter(([, uids]) => uids.length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {entries.map(([emoji, uids]) => {
        const reacted = uids.includes(currentUserId);
        const names = uids.map((uid) => userNames[uid] ?? uid).join(", ");
        return (
          <div key={emoji} className="relative">
            <button
              type="button"
              onClick={() => onToggle(emoji)}
              onMouseEnter={() => setTooltip(emoji)}
              onMouseLeave={() => setTooltip(null)}
              className={[
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                reacted
                  ? "border-indigo-500/60 bg-indigo-500/20 text-white"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600",
              ].join(" ")}
              aria-label={`${emoji} ${uids.length}`}
            >
              <span>{emoji}</span>
              <span>{uids.length}</span>
            </button>
            {tooltip === emoji && (
              <div className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-700 px-2 py-1 text-xs text-white shadow-lg">
                {names}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
