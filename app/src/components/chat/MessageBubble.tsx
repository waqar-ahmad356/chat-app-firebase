"use client";

import React, { useRef, useState } from "react";
import type { ChatMessage } from "@/app/src/services/chatService";
import { Avatar } from "./Sidebar";
import type { ParticipantProfile } from "@/app/src/services/chatService";
import { MessageActions } from "./MessageActions";
import { ReplyQuote } from "./ReplyQuote";
import { ReactionBar } from "./ReactionBar";
import { ReactionPicker } from "./ReactionPicker";
import { VoicePlayer } from "./VoicePlayer";

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  currentUserId: string;
  conversationId: string;
  senderProfile?: ParticipantProfile;
  showAvatar: boolean;
  isPinned: boolean;
  messageRef?: React.RefObject<HTMLDivElement>;
  userNames?: Record<string, string>;
  /** Whether this is the last message sent by the current user (shows tick) */
  isLastOwn?: boolean;
  /** Status of the other participant */
  otherStatus?: string;
  /** uid of the other participant */
  otherUid?: string;
  onReply: (message: ChatMessage) => void;
  onForward: (message: ChatMessage) => void;
  onPin: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Tick status icon ──────────────────────────────────────────────────────────
// sent = single grey tick
// delivered (other is Online) = double grey tick
// seen (seenBy includes otherUid) = double green tick
function MessageTick({ seen, delivered }: { seen: boolean; delivered: boolean }) {
  const color = seen ? "text-emerald-400" : "text-slate-500";
  if (!delivered && !seen) {
    // Single tick — sent
    return (
      <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  // Double tick — delivered or seen
  return (
    <svg className={`h-3.5 w-3.5 ${color}`} viewBox="0 0 20 16" fill="none">
      <path d="M1 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
  senderProfile,
  showAvatar,
  isPinned,
  messageRef,
  userNames = {},
  isLastOwn = false,
  otherStatus,
  otherUid,
  onReply,
  onForward,
  onPin,
  onUnpin,
  onEdit,
  onDelete,
  onReact,
  onScrollToMessage,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsHovered(true);
  }

  function handleMouseLeave() {
    leaveTimer.current = setTimeout(() => {
      setIsHovered(false);
      setShowReactionPicker(false);
    }, 100);
  }

  // --- Deleted placeholder ---
  if (message.deleted) {
    return (
      <div
        ref={messageRef}
        className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      >
        <div className="w-7 shrink-0">
          {showAvatar && (
            <Avatar name={senderProfile?.displayName ?? "?"} photoURL={senderProfile?.photoURL} size="sm" />
          )}
        </div>
        <div className={`flex max-w-[70%] flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
          <div className={["rounded-2xl px-4 py-2.5 text-sm", isOwn ? "rounded-br-sm bg-indigo-600/40" : "rounded-bl-sm bg-slate-800/60"].join(" ")}>
            <span className="italic text-slate-400">This message was deleted</span>
          </div>
          <span className="px-1 text-xs text-slate-500">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  function handleReact(emoji: string) {
    setShowReactionPicker(false);
    setIsHovered(false);
    onReact(message.id, emoji);
  }

  function renderContent() {
    if (message.type === "voice" && message.audioURL) {
      return <VoicePlayer audioURL={message.audioURL} duration={message.duration} isOwn={isOwn} />;
    }
    if (message.type === "gif" && message.gifUrl) {
      return (
        <div className="relative overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={message.gifUrl} alt="GIF" className="max-w-[200px] rounded-xl" loading="lazy" />
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">GIF</span>
        </div>
      );
    }
    return <span>{message.text}</span>;
  }

  return (
    // Outer row — hover zone
    <div
      ref={messageRef}
      className={`group relative flex items-end gap-2 py-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar */}
      <div className="w-7 shrink-0">
        {showAvatar && (
          <Avatar name={senderProfile?.displayName ?? "?"} photoURL={senderProfile?.photoURL} size="sm" />
        )}
      </div>

      {/* Bubble column */}
      <div className={`flex max-w-[70%] flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Forwarded label */}
        {message.forwarded && (
          <span className="flex items-center gap-1 px-1 text-xs text-slate-400">
            <span aria-hidden="true">↪️</span>Forwarded
          </span>
        )}

        {/* Pinned indicator */}
        {isPinned && (
          <span className="flex items-center gap-1 px-1 text-xs text-amber-400">
            <span aria-hidden="true">📌</span>Pinned
          </span>
        )}

        {/* Bubble */}
        <div
          className={[
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-colors duration-100",
            isOwn
              ? `rounded-br-sm bg-indigo-600 text-white ${isHovered ? "bg-indigo-500" : ""}`
              : `rounded-bl-sm bg-slate-800 text-slate-100 ${isHovered ? "bg-slate-700" : ""}`,
          ].join(" ")}
        >
          {message.replyTo && (
            <ReplyQuote
              replyTo={message.replyTo}
              senderName={
                message.replyTo.senderId === currentUserId
                  ? "You"
                  : (userNames[message.replyTo.senderId] ?? "Unknown")
              }
              onClick={() => onScrollToMessage?.(message.replyTo!.messageId)}
              isOwn={isOwn}
            />
          )}
          {renderContent()}
        </div>

        {/* Timestamp + edited + tick */}
        <span className="flex items-center gap-1 px-1 text-xs text-slate-500">
          {formatTime(message.createdAt)}
          {message.edited && <span>(edited)</span>}
          {isOwn && isLastOwn && (
            <MessageTick
              seen={!!(otherUid && message.seenBy?.includes(otherUid))}
              delivered={otherStatus === "Online"}
            />
          )}
        </span>

        {/* Reaction bar */}
        {message.reactions && (
          <ReactionBar
            reactions={message.reactions}
            currentUserId={currentUserId}
            userNames={userNames}
            onToggle={(emoji) => onReact(message.id, emoji)}
          />
        )}
      </div>

      {/* ── Toolbar — sits beside the bubble, never overlapping it ── */}
      <div
        className={[
          "flex shrink-0 items-center self-center transition-all duration-150",
          isOwn ? "mr-1 flex-row-reverse" : "ml-1",
          isHovered
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // Stop any click inside the toolbar from bubbling up to the message list
        onClick={(e) => e.stopPropagation()}
      >
        {showReactionPicker ? (
          <ReactionPicker onSelect={handleReact} />
        ) : (
          <MessageActions
            messageId={message.id}
            isOwnMessage={isOwn}
            isPinned={isPinned}
            onReply={() => { onReply(message); setIsHovered(false); }}
            onForward={() => { onForward(message); setIsHovered(false); }}
            onPin={() => { onPin(message.id); setIsHovered(false); }}
            onUnpin={() => { onUnpin(message.id); setIsHovered(false); }}
            onEdit={() => { onEdit(message); setIsHovered(false); }}
            onDelete={() => { onDelete(message.id); setIsHovered(false); }}
            onReact={() => setShowReactionPicker(true)}
          />
        )}
      </div>
    </div>
  );
}
