# Advanced Messaging — Requirements

## Overview

Extend PulseChat's real-time messaging with rich interaction features: replies, forwarding, pinning, editing, deletion, voice messages, GIF support, and emoji reactions.

---

## Requirements

### 1. Reply to Messages

**User Story:** As a user, I want to reply to a specific message so the context of my response is clear.

**Acceptance Criteria:**

- 1.1 Hovering a message shows an action toolbar with a Reply button
- 1.2 Clicking Reply shows a reply preview bar above the input with the quoted message text and sender name
- 1.3 Sending a reply stores a `replyTo: { messageId, senderId, text }` field on the new message
- 1.4 Replied messages render a quoted block above the bubble showing the original sender and truncated text
- 1.5 Clicking the quoted block scrolls to the original message
- 1.6 The reply bar can be dismissed with an X button

### 2. Forward Messages

**User Story:** As a user, I want to forward a message to another conversation.

**Acceptance Criteria:**

- 2.1 The message action toolbar includes a Forward button
- 2.2 Clicking Forward opens a modal listing all conversations the user participates in
- 2.3 Selecting a conversation sends the message text to that conversation with a `forwarded: true` flag
- 2.4 Forwarded messages display a "Forwarded" label above the bubble
- 2.5 Only text messages can be forwarded in this version

### 3. Pin Messages

**User Story:** As a user, I want to pin important messages so they are easy to find.

**Acceptance Criteria:**

- 3.1 The message action toolbar includes a Pin button
- 3.2 Pinning a message adds its ID to a `pinnedMessages[]` array on the conversation document
- 3.3 A pinned message banner appears at the top of the chat area showing the latest pinned message text
- 3.4 Clicking the banner scrolls to the pinned message
- 3.5 Any participant can unpin a message; unpinning removes it from `pinnedMessages[]`
- 3.6 Up to 3 messages can be pinned per conversation; pinning a 4th replaces the oldest

### 4. Edit Messages

**User Story:** As a user, I want to edit my own sent messages.

**Acceptance Criteria:**

- 4.1 The message action toolbar shows an Edit button only on the user's own messages
- 4.2 Clicking Edit replaces the input area with an edit field pre-filled with the message text
- 4.3 Saving updates the Firestore message document with the new `text` and sets `edited: true`
- 4.4 Edited messages display an "(edited)" label next to the timestamp
- 4.5 Pressing Escape cancels the edit without saving
- 4.6 Only the original sender can edit a message

### 5. Delete for Everyone

**User Story:** As a user, I want to delete a message so no one can see it.

**Acceptance Criteria:**

- 5.1 The message action toolbar shows a Delete button only on the user's own messages
- 5.2 Clicking Delete shows a confirmation prompt
- 5.3 Confirming sets `deleted: true` and `text: ""` on the message document (soft delete)
- 5.4 Deleted messages render as "This message was deleted" in italic, greyed out
- 5.5 Reactions and reply quotes referencing a deleted message still show the placeholder text
- 5.6 Only the original sender can delete a message

### 6. Voice Messages

**User Story:** As a user, I want to record and send voice messages.

**Acceptance Criteria:**

- 6.1 The input area includes a microphone button
- 6.2 Holding the mic button starts recording using the MediaRecorder API
- 6.3 Releasing sends the recording; a cancel gesture (slide left) discards it
- 6.4 The audio file is uploaded to Firebase Storage at `voice-messages/{convId}/{msgId}.webm`
- 6.5 The message is stored with `type: "voice"`, `audioURL`, and `duration` (seconds)
- 6.6 Voice messages render as an audio player with a waveform-style progress bar and duration
- 6.7 Maximum recording duration is 120 seconds; recording auto-stops at the limit

### 7. GIF Support

**User Story:** As a user, I want to search and send GIFs.

**Acceptance Criteria:**

- 7.1 The input area includes a GIF button that opens a GIF picker panel
- 7.2 The picker shows a search input and a grid of trending GIFs via the Tenor API
- 7.3 Typing in the search input fetches matching GIFs (debounced 400ms)
- 7.4 Clicking a GIF sends it as a message with `type: "gif"`, `gifUrl`, and `gifPreviewUrl`
- 7.5 GIF messages render as an inline image with a "GIF" badge
- 7.6 The GIF picker closes after sending or when clicking outside

### 8. Emoji Reactions

**User Story:** As a user, I want to react to messages with emoji.

**Acceptance Criteria:**

- 8.1 Hovering a message shows a quick-reaction bar with: 👍 ❤️ 😂 😮 😢 🔥
- 8.2 Clicking a reaction adds it to `reactions: { [emoji]: [uid, ...] }` on the message document
- 8.3 Clicking the same reaction again removes the user's reaction (toggle)
- 8.4 Reactions are displayed below the message bubble grouped by emoji with a count
- 8.5 Hovering a reaction group shows a tooltip with the names of users who reacted
- 8.6 Any participant can react to any non-deleted message

---

## Non-Functional Requirements

- All Firestore writes must respect existing security rules (only participants can write to a conversation)
- Voice uploads must be under 10 MB
- GIF picker must handle API errors gracefully with a fallback empty state
- Message actions toolbar must be keyboard accessible
