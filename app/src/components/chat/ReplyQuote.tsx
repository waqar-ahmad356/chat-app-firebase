"use client";

import React from "react";

export interface ReplyQuoteProps {
  replyTo: {
    messageId: string;
    senderId: string;
    /** Snapshot of the original message text at reply time */
    text: string;
  };
  /** Display name of the original sender */
  senderName: string;
  /** Scroll to the original message (Requirement 1.5) */
  onClick: () => void;
  /** Whether this quote is inside the current user's own bubble */
  isOwn?: boolean;
}

/**
 * ReplyQuote renders a compact quoted block inside a message bubble,
 * showing the original sender and a truncated preview of their message.
 * Clicking it scrolls to the original message (Requirement 1.4, 1.5).
 */
export function ReplyQuote({
  replyTo,
  senderName,
  onClick,
  isOwn = false,
}: ReplyQuoteProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // Layout
        "mb-1.5 w-full cursor-pointer rounded-lg border-l-[3px] px-3 py-1.5 text-left",
        "transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        // Colour scheme adapts to own (indigo) vs other (slate) bubble
        isOwn
          ? "border-white/60 bg-white/10"
          : "border-indigo-400/70 bg-white/5",
      ].join(" ")}
      aria-label={`Reply to ${senderName}: ${replyTo.text}`}
    >
      {/* Sender name */}
      <p
        className={[
          "mb-0.5 text-xs font-semibold leading-none",
          isOwn ? "text-indigo-200" : "text-indigo-400",
        ].join(" ")}
      >
        {senderName}
      </p>

      {/* Truncated message preview — max 2 lines */}
      <p
        className={[
          "line-clamp-2 text-xs leading-snug",
          isOwn ? "text-white/70" : "text-slate-400",
        ].join(" ")}
      >
        {replyTo.text || (
          <span className="italic">This message was deleted</span>
        )}
      </p>
    </button>
  );
}
