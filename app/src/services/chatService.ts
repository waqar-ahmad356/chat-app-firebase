import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  type: "text" | "voice" | "gif";
  replyTo?: {
    messageId: string;
    senderId: string;
    text: string;
  };
  forwarded?: boolean;
  edited?: boolean;
  deleted?: boolean;
  audioURL?: string;
  duration?: number;
  gifUrl?: string;
  gifPreviewUrl?: string;
  reactions?: Record<string, string[]>;
  seenBy?: string[]; // uids that have seen this message
}

export interface ParticipantProfile {
  displayName: string;
  photoURL: string | null;
  status: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantProfiles: Record<string, ParticipantProfile>;
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadCount: Record<string, number>;
  pinnedMessages?: string[]; // array of message IDs, max 3
  typing?: Record<string, number>; // uid -> timestamp when they started typing
}

/** Find or create a 1-on-1 conversation between two users */
export async function getOrCreateConversation(
  myUid: string,
  otherUid: string,
): Promise<string> {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", myUid),
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) =>
    (d.data().participants as string[]).includes(otherUid),
  );
  if (existing) return existing.id;

  // Fetch both profiles
  const [mySnap, otherSnap] = await Promise.all([
    getDoc(doc(db, "users", myUid)),
    getDoc(doc(db, "users", otherUid)),
  ]);
  const myData = mySnap.data() ?? {};
  const otherData = otherSnap.data() ?? {};

  const ref = await addDoc(collection(db, "conversations"), {
    participants: [myUid, otherUid],
    participantProfiles: {
      [myUid]: {
        displayName: myData.displayName ?? "Unknown",
        photoURL: myData.photoURL ?? null,
        status: myData.status ?? "Online",
      },
      [otherUid]: {
        displayName: otherData.displayName ?? "Unknown",
        photoURL: otherData.photoURL ?? null,
        status: otherData.status ?? "Online",
      },
    },
    lastMessage: "",
    lastMessageAt: null,
    unreadCount: { [myUid]: 0, [otherUid]: 0 },
  });
  return ref.id;
}

/** Send a message and update conversation metadata */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  otherUid: string,
  replyTo?: ChatMessage["replyTo"],
): Promise<void> {
  const msgRef = collection(db, "conversations", conversationId, "messages");
  await addDoc(msgRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
    type: "text",
    ...(replyTo ? { replyTo } : {}),
  });
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${otherUid}`]: (await getUnreadCount(conversationId, otherUid)) + 1,
  });
}

async function getUnreadCount(convId: string, uid: string): Promise<number> {
  const snap = await getDoc(doc(db, "conversations", convId));
  return (snap.data()?.unreadCount?.[uid] as number) ?? 0;
}

/** Mark conversation as read for a user — also stamps seenBy on all unseen messages */
export async function markAsRead(
  conversationId: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`unreadCount.${uid}`]: 0,
  });
  // Stamp seenBy on messages not yet seen by this user
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  const batch: Promise<void>[] = [];
  snap.docs.forEach((d) => {
    const seenBy: string[] = d.data().seenBy ?? [];
    if (!seenBy.includes(uid)) {
      batch.push(
        updateDoc(d.ref, { seenBy: arrayUnion(uid) })
      );
    }
  });
  await Promise.all(batch);
}

/** Subscribe to all conversations for a user */
export function subscribeToConversations(
  uid: string,
  callback: (convs: Conversation[]) => void,
): Unsubscribe {
  // No orderBy — Firestore excludes docs where the field is null when orderBy is used.
  // We sort client-side instead.
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
  );
  return onSnapshot(q, (snap) => {
    const convs: Conversation[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        participants: data.participants ?? [],
        participantProfiles: data.participantProfiles ?? {},
        lastMessage: data.lastMessage ?? "",
        lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() ?? null,
        unreadCount: data.unreadCount ?? {},
        pinnedMessages: (data.pinnedMessages as string[]) ?? [],
        typing: data.typing ?? undefined,
      };
    });
    // Sort newest first client-side
    convs.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    });
    callback(convs);
  });
}

/** Subscribe to messages in a conversation */
export function subscribeToMessages(
  conversationId: string,
  callback: (msgs: ChatMessage[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const msgs: ChatMessage[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        senderId: data.senderId,
        text: data.text ?? "",
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        type: (data.type as ChatMessage["type"]) ?? "text",
        replyTo: data.replyTo ?? undefined,
        forwarded: data.forwarded ?? undefined,
        edited: data.edited ?? undefined,
        deleted: data.deleted ?? undefined,
        audioURL: data.audioURL ?? undefined,
        duration: data.duration ?? undefined,
        gifUrl: data.gifUrl ?? undefined,
        gifPreviewUrl: data.gifPreviewUrl ?? undefined,
        reactions: data.reactions ?? undefined,
        seenBy: data.seenBy ?? undefined,
      };
    });
    callback(msgs);
  });
}

/** Get all users except the current user */
export async function getAllUsers(
  myUid: string,
): Promise<Array<{ uid: string; displayName: string; photoURL: string | null; status: string }>> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .filter((d) => d.id !== myUid)
    .map((d) => {
      const data = d.data();
      const displayName =
        data.displayName ||
        (data.email ? (data.email as string).split("@")[0] : null) ||
        "Unknown";
      return {
        uid: d.id,
        displayName,
        photoURL: data.photoURL ?? null,
        status: data.status ?? "Offline",
      };
    });
}

/** Search users by displayName prefix (case-sensitive, Firestore limitation) */
export async function searchUsers(
  searchTerm: string,
  myUid: string,
): Promise<Array<{ uid: string; displayName: string; photoURL: string | null; status: string }>> {
  if (!searchTerm.trim()) return [];
  const q = query(
    collection(db, "users"),
    where("displayName", ">=", searchTerm),
    where("displayName", "<=", searchTerm + "\uf8ff"),
  );
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.id !== myUid)
    .map((d) => ({
      uid: d.id,
      displayName: d.data().displayName ?? "Unknown",
      photoURL: d.data().photoURL ?? null,
      status: d.data().status ?? "Offline",
    }));
}

/** Edit a message's text and mark it as edited */
export async function editMessage(
  convId: string,
  msgId: string,
  newText: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", convId, "messages", msgId), {
    text: newText,
    edited: true,
  });
}

/** Soft-delete a message by clearing its text and setting deleted: true */
export async function deleteMessage(
  convId: string,
  msgId: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", convId, "messages", msgId), {
    deleted: true,
    text: "",
  });
}

/** Pin a message on a conversation (max 3; oldest is dropped if limit is reached) */
export async function pinMessage(
  convId: string,
  msgId: string,
): Promise<void> {
  const convRef = doc(db, "conversations", convId);
  const convSnap = await getDoc(convRef);
  const pinned: string[] = convSnap.data()?.pinnedMessages ?? [];

  if (pinned.includes(msgId)) return; // already pinned — no-op

  if (pinned.length >= 3) {
    // Remove the oldest (first) entry before adding the new one
    const [oldest, ...rest] = pinned;
    await updateDoc(convRef, {
      pinnedMessages: [...rest, msgId],
    });
  } else {
    await updateDoc(convRef, {
      pinnedMessages: arrayUnion(msgId),
    });
  }
}

/** Unpin a message from a conversation */
export async function unpinMessage(
  convId: string,
  msgId: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", convId), {
    pinnedMessages: arrayRemove(msgId),
  });
}

/** Add a user's reaction (emoji) to a message */
export async function addReaction(
  convId: string,
  msgId: string,
  emoji: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", convId, "messages", msgId), {
    [`reactions.${emoji}`]: arrayUnion(uid),
  });
}

/** Remove a user's reaction (emoji) from a message */
export async function removeReaction(
  convId: string,
  msgId: string,
  emoji: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", convId, "messages", msgId), {
    [`reactions.${emoji}`]: arrayRemove(uid),
  });
}

/** Forward a text message to another conversation (requirement 2.5: text only) */
export async function forwardMessage(
  fromConvId: string,
  msgId: string,
  toConvId: string,
  senderUid: string,
  otherUid: string,
): Promise<void> {
  // Read the original message
  const msgSnap = await getDoc(
    doc(db, "conversations", fromConvId, "messages", msgId),
  );
  if (!msgSnap.exists()) throw new Error("Message not found");

  const data = msgSnap.data();
  // Only text messages can be forwarded
  const msgType: string = data.type ?? "text";
  if (msgType !== "text") throw new Error("Only text messages can be forwarded");

  const text: string = data.text ?? "";

  // Write to destination conversation
  const msgRef = collection(db, "conversations", toConvId, "messages");
  await addDoc(msgRef, {
    senderId: senderUid,
    text,
    createdAt: serverTimestamp(),
    type: "text",
    forwarded: true,
  });

  // Update destination conversation metadata
  await updateDoc(doc(db, "conversations", toConvId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${otherUid}`]:
      (await getUnreadCount(toConvId, otherUid)) + 1,
  });
}

/** Send a voice message and update conversation metadata */
export async function sendVoiceMessage(
  convId: string,
  senderId: string,
  audioURL: string,
  duration: number,
  otherUid: string,
): Promise<void> {
  const msgRef = collection(db, "conversations", convId, "messages");
  await addDoc(msgRef, {
    senderId,
    text: "",
    createdAt: serverTimestamp(),
    type: "voice",
    audioURL,
    duration,
  });

  await updateDoc(doc(db, "conversations", convId), {
    lastMessage: "🎤 Voice message",
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${otherUid}`]:
      (await getUnreadCount(convId, otherUid)) + 1,
  });
}

/** Send a GIF message and update conversation metadata */
export async function sendGif(
  convId: string,
  senderId: string,
  gifUrl: string,
  gifPreviewUrl: string,
  otherUid: string,
): Promise<void> {
  const msgRef = collection(db, "conversations", convId, "messages");
  await addDoc(msgRef, {
    senderId,
    text: "",
    createdAt: serverTimestamp(),
    type: "gif",
    gifUrl,
    gifPreviewUrl,
  });

  await updateDoc(doc(db, "conversations", convId), {
    lastMessage: "GIF",
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${otherUid}`]:
      (await getUnreadCount(convId, otherUid)) + 1,
  });
}

/** Set typing status for a user in a conversation */
export async function setTyping(
  conversationId: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`typing.${uid}`]: Date.now(),
  });
}

/** Clear typing status for a user in a conversation */
export async function clearTyping(
  conversationId: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`typing.${uid}`]: null,
  });
}

/** Delete a conversation for the current user (removes them from participants) */
export async function deleteConversation(
  conversationId: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    participants: arrayRemove(uid),
  });
}
