"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useProfileQuery } from "@/app/src/hooks/useProfile";
import { useLogoutMutation } from "@/app/src/hooks/useAuth";
import { getAllUsers } from "@/app/src/services/chatService";
import type { RootState } from "@/app/src/redux/store";
import type { Conversation } from "@/app/src/services/chatService";
import type { ActivePanel } from "./ChatLayout";

const STATUS_COLOR: Record<string, string> = {
  Online: "bg-emerald-400",
  Busy: "bg-red-400",
  Away: "bg-amber-400",
  "Do not disturb": "bg-red-400",
  Offline: "bg-slate-500",
};

export function Avatar({
  name,
  photoURL,
  size = "md",
  status,
}: {
  name: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  status?: string;
}) {
  const sz =
    size === "sm"
      ? "h-9 w-9 text-sm"
      : size === "lg"
        ? "h-12 w-12 text-lg"
        : "h-10 w-10 text-base";
  return (
    <div className="relative shrink-0">
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt={name}
          className={`${sz} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sz} flex items-center justify-center rounded-full bg-indigo-600/30 font-semibold text-indigo-300`}
        >
          {name[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      {status !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 ${STATUS_COLOR[status] ?? "bg-slate-500"}`}
        />
      )}
    </div>
  );
}

export function formatTime(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

type Tab = "chats" | "people";

interface UserEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  status: string;
}

interface SidebarProps {
  myUid: string;
  conversations: Conversation[];
  loadingConversations: boolean;
  activeConvId: string | null;
  activePanel: ActivePanel;
  onSelectConversation: (id: string) => void;
  onStartConversation: (otherUid: string) => void;
  onOpenProfile: () => void;
}

export function Sidebar({
  myUid,
  conversations,
  loadingConversations,
  activeConvId,
  activePanel,
  onSelectConversation,
  onStartConversation,
  onOpenProfile,
}: SidebarProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: profile } = useProfileQuery();
  const logoutMutation = useLogoutMutation();

  const [tab, setTab] = useState<Tab>("chats");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<UserEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersLoaded, setUsersLoaded] = useState(false);

  function loadUsers() {
    if (!myUid) return;
    setLoadingUsers(true);
    setUsersLoaded(false);
    getAllUsers(myUid)
      .then((users) => {
        setAllUsers(users);
        setLoadingUsers(false);
        setUsersLoaded(true);
      })
      .catch((err) => {
        console.error("[Sidebar] getAllUsers error:", err);
        setLoadingUsers(false);
        setUsersLoaded(true);
      });
  }

  const displayName = user?.displayName ?? profile?.displayName ?? "You";
  const photoURL = profile?.photoURL ?? user?.photoURL ?? null;
  const myStatus = profile?.status ?? "Offline";

  // Load all users once when People tab is first opened
  useEffect(() => {
    if (tab !== "people" || usersLoaded || !myUid) return;
    getAllUsers(myUid)
      .then((users) => {
        setAllUsers(users);
        setLoadingUsers(false);
        setUsersLoaded(true);
      })
      .catch((err) => {
        console.error("[Sidebar] getAllUsers error:", err);
        setLoadingUsers(false);
        setUsersLoaded(true);
      });
  }, [tab, myUid, usersLoaded]);

  const q = search.trim().toLowerCase();

  const filteredUsers = q
    ? allUsers.filter((u) => u.displayName.toLowerCase().includes(q))
    : allUsers;

  const filteredConvs = q
    ? conversations.filter((conv) => {
        const otherUid = conv.participants.find((p) => p !== myUid) ?? "";
        const name = conv.participantProfiles[otherUid]?.displayName ?? "";
        return name.toLowerCase().includes(q);
      })
    : conversations;
  return (
    <div className="flex h-full flex-col">
      {/* My profile header */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4">
        <button
          onClick={onOpenProfile}
          className="flex flex-1 items-center gap-3 rounded-xl p-1 text-left transition-colors hover:bg-white/5"
          aria-label="Open profile settings"
        >
          <Avatar
            name={displayName}
            photoURL={photoURL}
            size="md"
            status={myStatus}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-400">{myStatus}</p>
          </div>
        </button>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          aria-label="Sign out"
          title="Sign out"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {(["chats", "people"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setSearch("");
            }}
            className={[
              "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors",
              tab === t
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-slate-500 hover:text-slate-300",
            ].join(" ")}
          >
            {t === "chats" ? "Messages" : "People"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder={
              tab === "chats" ? "Search messages…" : "Search people…"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2 pl-9 pr-8 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {tab === "chats" ? (
          <>
            {loadingConversations && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
                Loading…
              </div>
            )}
            {!loadingConversations && filteredConvs.length === 0 && (
              <p className="px-3 py-4 text-sm text-slate-500">
                {search
                  ? "No conversations match."
                  : "No messages yet. Go to People to start a chat."}
              </p>
            )}
            {filteredConvs.map((conv) => {
              const otherUid = conv.participants.find((p) => p !== myUid) ?? "";
              const other = conv.participantProfiles[otherUid];
              const unread = conv.unreadCount[myUid] ?? 0;
              const isActive =
                conv.id === activeConvId && activePanel === "chat";
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "bg-indigo-600/20 text-white"
                      : "text-slate-300 hover:bg-white/5",
                  ].join(" ")}
                >
                  <Avatar
                    name={other?.displayName ?? "?"}
                    photoURL={other?.photoURL ?? null}
                    size="md"
                    status={other?.status ?? "Offline"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium">
                        {other?.displayName ?? "Unknown"}
                      </p>
                      <span className="ml-2 shrink-0 text-xs text-slate-500">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        ) : (
          <>
            {loadingUsers && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
                Loading users…
              </div>
            )}
            {!loadingUsers && filteredUsers.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-slate-500">No other users found.</p>
                <button
                  onClick={loadUsers}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Retry
                </button>
              </div>
            )}
            {filteredUsers.map((u) => {
              const existingConv = conversations.find((c) =>
                c.participants.includes(u.uid),
              );
              return (
                <button
                  key={u.uid}
                  onClick={() => {
                    onStartConversation(u.uid);
                    setTab("chats");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-300 transition-colors hover:bg-white/5"
                >
                  <Avatar
                    name={u.displayName}
                    photoURL={u.photoURL}
                    size="md"
                    status={u.status}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {u.displayName}
                    </p>
                    <p className="text-xs text-slate-500">{u.status}</p>
                  </div>
                  {existingConv ? (
                    <span className="shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                      Chat
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-400">
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
