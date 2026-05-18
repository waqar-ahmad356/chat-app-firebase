# Advanced Messaging — Design

## Architecture Overview

All features extend the existing Firestore data model and the `ChatArea` / `chatService` layer. No new top-level routes are needed.

---

## Data Model Changes

### Message document (`conversations/{convId}/messages/{msgId}`)

```ts
{
  senderId: string
  text: string
  createdAt: Timestamp
  type: "text" | "voice" | "gif"   // default "text"

  // Reply
  replyTo?: {
    messageId: string
    senderId: string
    text: string        // snapshot at reply time
  }

  // Forward
  forwarded?: boolean

  // Edit
  edited?: boolean

  // Delete
  deleted?: boolean

  // Voice
  audioURL?: string
  duration?: number     // seconds

  // GIF
  gifUrl?: string
  gifPreviewUrl?: string

  // Reactions
  reactions?: Record<string, string[]>  // { "👍": ["uid1", "uid2"] }
}
```

### Conversation document (`conversations/{convId}`)

```ts
{
  // existing fields ...
  pinnedMessages?: string[]   // array of message IDs, max 3
}
```

---

## Component Structure

```
ChatArea
├── PinnedMessageBanner       (new) — shows latest pinned message
├── MessageList
│   └── MessageBubble         (refactored)
│       ├── ReplyQuote        (new) — quoted block for replies
│       ├── BubbleContent     — text / voice player / gif image
│       ├── ReactionBar       (new) — emoji counts below bubble
│       └── MessageActions    (new) — hover toolbar (reply/forward/pin/edit/delete)
├── ForwardModal              (new) — conversation picker
├── ReplyBar                  (new) — reply preview above input
└── ChatInput                 (refactored)
    ├── VoiceRecorder         (new) — mic hold-to-record
    └── GifPicker             (new) — tenor search grid
```

---

## Service Layer

### `chatService.ts` additions

```ts
editMessage(convId, msgId, newText): Promise<void>
deleteMessage(convId, msgId): Promise<void>
pinMessage(convId, msgId): Promise<void>
unpinMessage(convId, msgId): Promise<void>
addReaction(convId, msgId, emoji, uid): Promise<void>
removeReaction(convId, msgId, emoji, uid): Promise<void>
forwardMessage(fromConvId, msgId, toConvId, senderUid): Promise<void>
sendVoiceMessage(convId, senderId, blob, duration, otherUid): Promise<void>
sendGif(convId, senderId, gifUrl, gifPreviewUrl, otherUid): Promise<void>
```

### `voiceService.ts` (new)

```ts
startRecording(): Promise<MediaRecorder>
stopRecording(recorder): Promise<Blob>
uploadVoiceMessage(convId, msgId, blob): Promise<string>  // returns URL
```

### `gifService.ts` (new)

```ts
fetchTrendingGifs(): Promise<GifResult[]>
searchGifs(query: string): Promise<GifResult[]>
```

Uses Tenor API v2 (`NEXT_PUBLIC_TENOR_API_KEY` env var).

---

## State Management

All feature state is local to `ChatArea` — no Redux changes needed:

```ts
// ChatArea local state additions
replyingTo: ChatMessage | null;
editingMessageId: string | null;
forwardingMessage: ChatMessage | null;
isRecording: boolean;
showGifPicker: boolean;
```

---

## Correctness Properties

### P1 — Reaction toggle is idempotent

**Validates: Requirements 8.2, 8.3**
For any user UID and emoji, calling `addReaction` twice results in the same state as calling it once. Calling `removeReaction` after `addReaction` results in the UID not being present.

### P2 — Pin limit enforced

**Validates: Requirement 3.6**
After any sequence of pin operations, `pinnedMessages.length <= 3` always holds.

### P3 — Deleted message content is cleared

**Validates: Requirements 5.3, 5.4**
After `deleteMessage`, the message document has `deleted: true` and `text === ""`. The original text is not recoverable from the document.

### P4 — Edit preserves sender

**Validates: Requirement 4.6**
`editMessage` only succeeds when called by the original `senderId`. Calls from other UIDs are rejected by Firestore rules.

### P5 — Voice message duration matches recording

**Validates: Requirement 6.7**
The `duration` stored on a voice message equals the actual recording length in seconds, capped at 120.

---

## Firestore Security Rules Additions

```
match /conversations/{convId}/messages/{msgId} {
  // Edit: only sender can update text
  allow update: if request.auth.uid == resource.data.senderId
                && request.resource.data.senderId == resource.data.senderId
    // OR any participant can update reactions/pin only
    || (request.auth.uid in get(...).data.participants
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['reactions']));
}
```

---

## Environment Variables

```
NEXT_PUBLIC_TENOR_API_KEY=your_tenor_api_key
```

Get a free key at https://developers.google.com/tenor/guides/quickstart
