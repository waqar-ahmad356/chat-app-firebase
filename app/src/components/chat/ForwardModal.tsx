"use client";

import { useEffect, useState } from "react";
import { subscribeToConversations, type Conversation } from "@/app/src/services/chatService";

interface ForwardModalProps {
  myUid: string;
  onSelect: (conversation: Conversation) => void;
  onClose: () => void;
}

export function ForwardModal({ myUid, onSelect, onClose }: ForwardModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const unsub = subscribeToConversations(myUid, setConversations);
    return () => unsub();
  }, [myUid]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Forward to…</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="max-h-72 overflow-y-auto py-1">
          {conversations.map((conv) => {
            const otherUid = conv.participants.find((p) => p !== myUid) ?? "";
            const profile = conv.participantProfiles[otherUid];
            return (
              <li key={conv.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conv)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="truncate text-sm text-slate-200">
                    {profile?.displayName ?? "Unknown"}
                  </span>
                </button>
              </li>
            );
          })}
          {conversations.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-slate-500">No conversations</li>
          )}
        </ul>
      </div>
    </div>
  );
}
