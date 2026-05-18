"use client";

import { useEffect, useRef, useState } from "react";

interface VoicePlayerProps {
  audioURL: string;
  duration?: number;
  isOwn: boolean;
}

export function VoicePlayer({ audioURL, duration = 0, isOwn }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const dur = audio.duration || duration || 1;
      setProgress((audio.currentTime / dur) * 100);
    };
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [duration]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  function formatSecs(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const displayDuration = audioRef.current?.duration || duration;

  return (
    <div className="flex items-center gap-2 py-0.5">
      <audio ref={audioRef} src={audioURL} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
          isOwn ? "bg-white/20 hover:bg-white/30" : "bg-indigo-600/80 hover:bg-indigo-500",
        ].join(" ")}
      >
        {playing ? (
          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="h-3 w-3 translate-x-px text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1 min-w-[100px]">
        <div className="relative h-1 rounded-full bg-white/20">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white/70 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs opacity-60">
          {playing ? formatSecs(currentTime) : formatSecs(displayDuration)}
        </span>
      </div>
    </div>
  );
}
