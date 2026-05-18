"use client";

interface MessageActionsProps {
  messageId: string;
  isOwnMessage: boolean;
  isPinned: boolean;
  onReply: () => void;
  onForward: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: () => void;
}

interface IconBtnProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}

function IconBtn({ label, onClick, danger = false, children }: IconBtnProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={[
        "flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        danger
          ? "text-red-400 hover:bg-red-500/15 hover:text-red-300"
          : "text-slate-300 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function MessageActions({
  isOwnMessage,
  isPinned,
  onReply,
  onForward,
  onPin,
  onUnpin,
  onEdit,
  onDelete,
  onReact,
}: MessageActionsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Message actions"
      className="flex items-center gap-0.5 rounded-xl border border-slate-700/60 bg-slate-900 px-1 py-1 shadow-xl shadow-black/40"
    >
      {/* React */}
      <IconBtn label="React" onClick={onReact}>😊</IconBtn>

      {/* Reply */}
      <IconBtn label="Reply" onClick={onReply}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </IconBtn>

      {/* Forward */}
      <IconBtn label="Forward" onClick={onForward}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </IconBtn>

      {/* Pin / Unpin */}
      <IconBtn label={isPinned ? "Unpin" : "Pin"} onClick={isPinned ? onUnpin : onPin}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </IconBtn>

      {isOwnMessage && (
        <>
          <span className="mx-0.5 h-4 w-px bg-slate-700" aria-hidden="true" />

          {/* Edit */}
          <IconBtn label="Edit" onClick={onEdit}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </IconBtn>

          {/* Delete */}
          <IconBtn label="Delete" onClick={onDelete} danger>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </IconBtn>
        </>
      )}
    </div>
  );
}
