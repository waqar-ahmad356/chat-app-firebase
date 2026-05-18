"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMessages } from "@/app/src/hooks/useChat";
import { useProfileQuery } from "@/app/src/hooks/useProfile";
import {
  sendMessage,
  markAsRead,
  editMessage,
  deleteMessage,
  pinMessage,
  unpinMessage,
  addReaction,
  removeReaction,
  forwardMessage,
  sendVoiceMessage,
  sendGif,
} from "@/app/src/services/chatService";
import { uploadVoiceMessage } from "@/app/src/services/voiceService";
import { Avatar } from "./Sidebar";
import type { Conversation, ChatMessage } from "@/app/src/services/chatService";
import { MessageBubble } from "./MessageBubble";
import { ReplyBar } from "./ReplyBar";
import { PinnedMessageBanner } from "./PinnedMessageBanner";
import { ForwardModal } from "./ForwardModal";
import { VoiceRecorder } from "./VoiceRecorder";
import { GifPicker } from "./GifPicker";
import type { GifResult } from "@/app/src/services/gifService";

const STATUS_COLOR: Record<string, string> = {
  Online: "bg-emerald-400",
  Busy: "bg-red-400",
  Away: "bg-amber-400",
  "Do not disturb": "bg-red-400",
  Offline: "bg-slate-500",
};

interface ChatAreaProps {
  myUid: string;
  conversation: Conversation;
  onMenuClick: () => void;
}

export function ChatArea({ myUid, conversation, onMenuClick }: ChatAreaProps) {
  const { messages, loading } = useMessages(conversation.id);
  const { data: myProfile } = useProfileQuery();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Task 3.1 — reply state
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  // Task 4.1 — edit state
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editText, setEditText] = useState("");

  // Task 6.2 — forward state
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);

  // Task 4.4 — delete confirmation
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  // GIF picker
  const [showGifPicker, setShowGifPicker] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const otherUid = conversation.participants.find((p) => p !== myUid) ?? "";
  const other = conversation.participantProfiles[otherUid];
  // Merge fresh photoURL from Firestore profile query into the stale conversation snapshot
  const meRaw = conversation.participantProfiles[myUid];
  const me = meRaw
    ? { ...meRaw, photoURL: myProfile?.photoURL ?? meRaw.photoURL }
    : meRaw;

  // Build userNames map for reaction tooltips
  const userNames: Record<string, string> = {};
  for (const [uid, profile] of Object.entries(conversation.participantProfiles)) {
    userNames[uid] = uid === myUid ? "You" : profile.displayName;
  }

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when conversation opens
  useEffect(() => {
    if (conversation.id && myUid) {
      markAsRead(conversation.id, myUid).catch(() => {});
    }
  }, [conversation.id, myUid, messages.length]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessage) {
      editInputRef.current?.focus();
    }
  }, [editingMessage]);

  // Task 3.5 / 5.3 — scroll to a message by id
  const scrollToMessage = useCallback((msgId: string) => {
    const el = messageRefs.current[msgId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-indigo-400/60");
      setTimeout(() => el.classList.remove("ring-2", "ring-indigo-400/60"), 1500);
    }
  }, []);

  // Task 5.3 — scroll to latest pinned message
  function handlePinnedBannerClick() {
    const pinned = conversation.pinnedMessages;
    if (pinned && pinned.length > 0) {
      scrollToMessage(pinned[pinned.length - 1]);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    const reply = replyingTo
      ? { messageId: replyingTo.id, senderId: replyingTo.senderId, text: replyingTo.text }
      : undefined;
    setReplyingTo(null);
    try {
      await sendMessage(conversation.id, myUid, text, otherUid, reply);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Task 4.2 — start editing
  function handleStartEdit(msg: ChatMessage) {
    setEditingMessage(msg);
    setEditText(msg.text);
  }

  // Task 4.3 — save edit
  async function handleSaveEdit() {
    if (!editingMessage) return;
    const trimmed = editText.trim();
    if (!trimmed || trimmed === editingMessage.text) {
      setEditingMessage(null);
      return;
    }
    await editMessage(conversation.id, editingMessage.id, trimmed);
    setEditingMessage(null);
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditingMessage(null);
    }
  }

  // Task 4.4 — confirm delete
  async function handleConfirmDelete() {
    if (!deletingMessageId) return;
    await deleteMessage(conversation.id, deletingMessageId);
    setDeletingMessageId(null);
  }

  // Task 7.3 — toggle reaction
  async function handleReact(msgId: string, emoji: string) {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const reactors = msg.reactions?.[emoji] ?? [];
    if (reactors.includes(myUid)) {
      await removeReaction(conversation.id, msgId, emoji, myUid);
    } else {
      await addReaction(conversation.id, msgId, emoji, myUid);
    }
  }

  // Task 6.3 — forward message
  async function handleForwardSelect(targetConv: Conversation) {
    if (!forwardingMessage) return;
    const targetOtherUid = targetConv.participants.find((p) => p !== myUid) ?? "";
    await forwardMessage(
      conversation.id,
      forwardingMessage.id,
      targetConv.id,
      myUid,
      targetOtherUid,
    );
    setForwardingMessage(null);
  }

  // Task 8.2 — upload and send voice message
  async function handleVoiceRecorded(blob: Blob, duration: number) {
    const tempId = `voice_${Date.now()}`;
    const audioURL = await uploadVoiceMessage(conversation.id, tempId, blob);
    await sendVoiceMessage(conversation.id, myUid, audioURL, duration, otherUid);
  }

  // Task 9.3 — send GIF
  async function handleGifSelect(gif: GifResult) {
    await sendGif(conversation.id, myUid, gif.url, gif.previewUrl, otherUid);
  }

  // Latest pinned message text for banner
  const latestPinnedId = conversation.pinnedMessages?.at(-1);
  const latestPinnedMsg = latestPinnedId
    ? messages.find((m) => m.id === latestPinnedId)
    : undefined;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative shrink-0">
          <Avatar name={other?.displayName ?? "?"} photoURL={other?.photoURL} size="sm" />
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 ${STATUS_COLOR[other?.status ?? "Offline"] ?? "bg-slate-500"}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{other?.displayName ?? "Unknown"}</p>
          <p className="text-xs text-slate-400">{other?.status ?? "Offline"}</p>
        </div>

        <div className="flex items-center gap-1">
          {[
            { label: "Voice call", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
            { label: "Video call", d: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
          ].map(({ label, d }) => (
            <button key={label} aria-label={label} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={d} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Task 5.1 — Pinned message banner */}
      {latestPinnedMsg && (
        <PinnedMessageBanner
          text={latestPinnedMsg.text || (latestPinnedMsg.type === "voice" ? "🎤 Voice message" : "GIF")}
          onClick={handlePinnedBannerClick}
          onUnpin={() => unpinMessage(conversation.id, latestPinnedMsg.id)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
          </div>
        )}

        <div className="space-y-4">
          {(() => {
            const lastOwnIndex = messages.reduce(
              (last, m, idx) => (m.senderId === myUid ? idx : last),
              -1,
            );
            return messages.map((msg, i) => {
            const isMe = msg.senderId === myUid;
            const profile = isMe ? me : other;
            const showAvatar = i === 0 || messages[i - 1].senderId !== msg.senderId;
            const isLastOwn = isMe && i === lastOwnIndex;

            return (
              <div
                key={msg.id}
                ref={(el) => { messageRefs.current[msg.id] = el; }}
                className="rounded-lg transition-all"
              >
                <MessageBubble
                  message={msg}
                  isOwn={isMe}
                  currentUserId={myUid}
                  conversationId={conversation.id}
                  senderProfile={profile}
                  showAvatar={showAvatar}
                  isPinned={conversation.pinnedMessages?.includes(msg.id) ?? false}
                  userNames={userNames}
                  isLastOwn={isLastOwn}
                  otherStatus={other?.status}
                  otherUid={otherUid}
                  onReply={setReplyingTo}
                  onForward={setForwardingMessage}
                  onPin={(msgId) => pinMessage(conversation.id, msgId)}
                  onUnpin={(msgId) => unpinMessage(conversation.id, msgId)}
                  onEdit={handleStartEdit}
                  onDelete={setDeletingMessageId}
                  onReact={handleReact}
                  onScrollToMessage={scrollToMessage}
                />
              </div>
            );
          });
          })()}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Task 3.2 — Reply bar */}
      {replyingTo && (
        <ReplyBar
          replyingTo={replyingTo}
          senderName={
            replyingTo.senderId === myUid ? "You" : (other?.displayName ?? "Unknown")
          }
          onDismiss={() => setReplyingTo(null)}
        />
      )}

      {/* Task 4.2 — Edit field */}
      {editingMessage ? (
        <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur">
          <p className="mb-1.5 text-xs text-indigo-400">Editing message — Esc to cancel</p>
          <div className="flex items-end gap-3 rounded-2xl border border-indigo-500 bg-slate-800/60 px-4 py-2.5 ring-2 ring-indigo-500/30">
            <textarea
              ref={editInputRef}
              rows={1}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={handleSaveEdit}
              disabled={!editText.trim()}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Save edit"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Normal input */
        <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur">
          <div className="relative flex items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30">
            {/* GIF picker */}
            {showGifPicker && (
              <GifPicker
                onSelect={handleGifSelect}
                onClose={() => setShowGifPicker(false)}
              />
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${other?.displayName ?? ""}…`}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              style={{ maxHeight: "120px" }}
            />
            <div className="flex shrink-0 items-center gap-1 pb-0.5">
              {/* GIF button */}
              <button
                type="button"
                aria-label="Send GIF"
                onClick={() => setShowGifPicker((v) => !v)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-white"
              >
                <span className="text-xs font-bold">GIF</span>
              </button>

              {/* Voice recorder */}
              <VoiceRecorder onRecorded={handleVoiceRecorded} />

              {/* Emoji placeholder */}
              <button aria-label="Emoji" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                aria-label="Send message"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-40"
              >
                {sending ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg className="h-4 w-4 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-center text-xs text-slate-600">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}

      {/* Task 4.4 — Delete confirmation dialog */}
      {deletingMessageId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setDeletingMessageId(null)}
        >
          <div
            className="w-72 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-sm font-semibold text-white">Delete message?</p>
            <p className="mb-5 text-xs text-slate-400">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingMessageId(null)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task 6.1 — Forward modal */}
      {forwardingMessage && (
        <ForwardModal
          myUid={myUid}
          onSelect={handleForwardSelect}
          onClose={() => setForwardingMessage(null)}
        />
      )}
    </div>
  );
}
