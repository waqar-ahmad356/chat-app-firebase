"use client";

import { useEffect, useRef, useState } from "react";
import {
  subscribeToConversations,
  subscribeToMessages,
  type Conversation,
  type ChatMessage,
} from "@/app/src/services/chatService";

export function useConversations(uid: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToConversations(uid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  return { conversations, loading };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  // keep ref to avoid stale closure in cleanup
  const convIdRef = useRef(conversationId);
  convIdRef.current = conversationId;

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    const unsub = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsub();
  }, [conversationId]);

  return { messages, loading };
}
