"use client";

import { useEffect, useRef, useState } from "react";
import { startRecording, stopRecording } from "@/app/src/services/voiceService";

const MAX_SECONDS = 120;

interface VoiceRecorderProps {
  onRecorded: (blob: Blob, duration: number) => void;
}

export function VoiceRecorder({ onRecorded }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startXRef = useRef<number>(0);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRec(false);
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  async function startRec(clientX: number) {
    setCancelled(false);
    startXRef.current = clientX;
    try {
      const recorder = await startRecording();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      // microphone denied — silently ignore
    }
  }

  async function stopRec(cancel: boolean) {
    if (!recorderRef.current || !recording) return;
    setRecording(false);
    const blob = await stopRecording(recorderRef.current);
    recorderRef.current = null;
    if (!cancel) {
      onRecorded(blob, seconds || 1);
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startRec(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!recording) return;
    const delta = startXRef.current - e.clientX;
    if (delta > 60) {
      setCancelled(true);
      stopRec(true);
    }
  }

  function handlePointerUp() {
    if (recording) stopRec(cancelled);
  }

  return (
    <div className="flex items-center gap-2">
      {recording && (
        <span className="text-xs text-slate-400">
          {cancelled ? (
            <span className="text-red-400">← Slide to cancel</span>
          ) : (
            <>
              <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {seconds}s — slide ← to cancel
            </>
          )}
        </span>
      )}
      <button
        type="button"
        aria-label={recording ? "Release to send voice message" : "Hold to record voice message"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-xl transition-colors select-none",
          recording
            ? "bg-red-600 text-white"
            : "text-slate-400 hover:bg-white/10 hover:text-white",
        ].join(" ")}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    </div>
  );
}
