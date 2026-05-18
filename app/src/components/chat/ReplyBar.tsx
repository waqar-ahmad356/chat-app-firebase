"use client";

import type { ChatMessage } from "@/app/src/services/chatService";

interface ReplyBarProps {
  replyingTo: ChatMessage;
  senderName: string;
  onDismiss: () => void;
}

export function ReplyBar({ replyingTo, senderName, onDismiss }: ReplyBarProps) {
  return (
    <div className="flex items-center gap-2 border-t border-slate-700 bg-slate-800/80 px-4 py-2">
      <div className="flex-1 border-l-2 border-indigo-400 pl-2">
        <p className="text-xs font-semibold text-indigo-400">{senderName}</p>
        <p className="line-clamp-1 text-xs text-slate-400">
          {replyingTo.text || "Voice / GIF message"}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cancel reply"
        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
