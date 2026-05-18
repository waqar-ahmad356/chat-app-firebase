"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useConversations } from "@/app/src/hooks/useChat";
import { getOrCreateConversation } from "@/app/src/services/chatService";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { ProfilePanel } from "./ProfilePanel";
import type { RootState } from "@/app/src/redux/store";

export type ActivePanel = "chat" | "profile";

export function ChatLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { conversations, loading } = useConversations(user?.uid);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>("chat");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  async function openOrCreateConversation(otherUid: string) {
    if (!user) return;
    const convId = await getOrCreateConversation(user.uid, otherUid);
    setActiveConvId(convId);
    setActivePanel("chat");
    setMobileSidebarOpen(false);
  }

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) ?? null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={[
          "fixed inset-y-0 left-0 z-30 w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 lg:relative lg:flex lg:translate-x-0",
          mobileSidebarOpen ? "flex translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar
          myUid={user?.uid ?? ""}
          conversations={conversations}
          loadingConversations={loading}
          activeConvId={activeConvId}
          activePanel={activePanel}
          onSelectConversation={(id) => {
            setActiveConvId(id);
            setActivePanel("chat");
            setMobileSidebarOpen(false);
          }}
          onStartConversation={openOrCreateConversation}
          onOpenProfile={() => {
            setActivePanel("profile");
            setMobileSidebarOpen(false);
          }}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {activePanel === "profile" ? (
          <ProfilePanel onBack={() => setActivePanel("chat")} />
        ) : activeConversation ? (
          <ChatArea
            myUid={user?.uid ?? ""}
            conversation={activeConversation}
            onMenuClick={() => setMobileSidebarOpen(true)}
          />
        ) : (
          <EmptyState onMenuClick={() => setMobileSidebarOpen(true)} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-slate-800 bg-slate-900/80 px-4 py-3 lg:hidden">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-500/20">
          <svg
            className="h-8 w-8 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-white">
          No conversation selected
        </p>
        <p className="text-sm text-slate-500">
          Search for a user in the sidebar to start chatting.
        </p>
      </div>
    </div>
  );
}
