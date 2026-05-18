"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { Button } from "@/app/src/components/ui";
import { ChatLayout } from "@/app/src/components/chat/ChatLayout";
import type { RootState } from "@/app/src/redux/store";

export function HomeContent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
      </div>
    );
  }

  if (user) {
    return <ChatLayout />;
  }

  // Guest landing
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 ring-1 ring-indigo-500/30">
        <svg
          className="h-8 w-8 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Welcome to{" "}
        <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          PulseChat
        </span>
      </h1>
      <p className="mb-10 max-w-lg text-lg text-slate-400">
        Real-time messaging for teams and friends. Sign in or create an account
        to get started.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/login">
          <Button size="lg" className="min-w-[140px]">
            Sign in
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline" size="lg" className="min-w-[140px]">
            Create account
          </Button>
        </Link>
      </div>
    </div>
  );
}
