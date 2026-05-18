# Advanced Messaging — Tasks

## Task List

- [x] 1. Extend data model & service layer
  - [x] 1.1 Update `ChatMessage` interface in `chatService.ts` with new fields (type, replyTo, forwarded, edited, deleted, audioURL, duration, gifUrl, gifPreviewUrl, reactions)
  - [x] 1.2 Update `Conversation` interface with `pinnedMessages` field
  - [x] 1.3 Add `editMessage`, `deleteMessage`, `pinMessage`, `unpinMessage` to `chatService.ts`
  - [x] 1.4 Add `addReaction`, `removeReaction` to `chatService.ts`
  - [x] 1.5 Add `forwardMessage`, `sendVoiceMessage`, `sendGif` to `chatService.ts`
  - [x] 1.6 Create `app/src/services/voiceService.ts` (startRecording, stopRecording, uploadVoiceMessage)
  - [x] 1.7 Create `app/src/services/gifService.ts` (fetchTrendingGifs, searchGifs via Tenor API)

- [x] 2. Message actions toolbar & bubble refactor
  - [x] 2.1 Create `app/src/components/chat/MessageActions.tsx` — hover toolbar with Reply, Forward, Pin, Edit (own), Delete (own) buttons
  - [x] 2.2 Refactor `MessageBubble` rendering inside `ChatArea` into a standalone `MessageBubble.tsx` component
  - [x] 2.3 Add `ReplyQuote.tsx` — quoted block rendered inside bubble for replied messages
  - [x] 2.4 Wire `MessageActions` into `MessageBubble` with hover state

- [x] 3. Reply to messages
  - [x] 3.1 Add `replyingTo` state to `ChatArea`
  - [x] 3.2 Create `ReplyBar.tsx` — preview bar above input showing quoted sender + text with dismiss button
  - [x] 3.3 Update `sendMessage` call to include `replyTo` payload when replying
  - [x] 3.4 Render `ReplyQuote` inside bubbles that have `replyTo` set
  - [x] 3.5 Implement scroll-to-original on clicking the quote block

- [x] 4. Edit & delete messages
  - [x] 4.1 Add `editingMessageId` state to `ChatArea`
  - [x] 4.2 When editing, replace the input with an edit field pre-filled with message text; Escape cancels
  - [x] 4.3 On save call `editMessage`; show "(edited)" label on updated bubbles
  - [x] 4.4 Wire Delete button to `deleteMessage` with a confirmation dialog
  - [x] 4.5 Render deleted messages as "This message was deleted" placeholder

- [x] 5. Pin messages
  - [x] 5.1 Create `PinnedMessageBanner.tsx` — banner at top of chat showing latest pinned message
  - [x] 5.2 Wire Pin/Unpin in `MessageActions` to `pinMessage` / `unpinMessage`
  - [x] 5.3 Implement scroll-to-pinned on clicking the banner
  - [x] 5.4 Update `subscribeToConversations` to include `pinnedMessages` in the returned data

- [x] 6. Forward messages
  - [x] 6.1 Create `ForwardModal.tsx` — modal with conversation list picker
  - [x] 6.2 Add `forwardingMessage` state to `ChatArea`; open modal on Forward click
  - [x] 6.3 On conversation select call `forwardMessage`; show "Forwarded" label on forwarded bubbles

- [x] 7. Emoji reactions
  - [x] 7.1 Create `ReactionPicker.tsx` — quick bar with 6 emoji shown on message hover
  - [x] 7.2 Create `ReactionBar.tsx` — grouped emoji counts rendered below bubble
  - [x] 7.3 Wire add/remove to `addReaction` / `removeReaction`
  - [x] 7.4 Implement hover tooltip on reaction groups showing reactor names

- [x] 8. Voice messages
  - [x] 8.1 Create `VoiceRecorder.tsx` — mic button with hold-to-record, cancel slide, 120s cap
  - [x] 8.2 On release upload blob via `voiceService` and call `sendVoiceMessage`
  - [x] 8.3 Create `VoicePlayer.tsx` — audio player with progress bar and duration display
  - [x] 8.4 Render `VoicePlayer` inside bubbles where `type === "voice"`

- [x] 9. GIF support
  - [x] 9.1 Create `GifPicker.tsx` — panel with search input and scrollable GIF grid
  - [x] 9.2 Wire trending fetch on open and debounced search on input
  - [x] 9.3 On GIF click call `sendGif` and close picker
  - [x] 9.4 Render GIF bubbles as inline image with "GIF" badge

- [x] 10. Firestore rules update
  - [x] 10.1 Update security rules to allow reaction updates by any participant and restrict edit/delete to sender only
