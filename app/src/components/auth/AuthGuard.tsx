"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { requiresEmailVerification } from "@/app/src/lib/auth/authHelpers";
import type { RootState } from "@/app/src/redux/store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export function AuthGuard({
  children,
  requireVerified = false,
}: AuthGuardProps) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requireVerified && requiresEmailVerification(user)) {
      router.replace("/verify-email");
    }
  }, [user, isLoading, requireVerified, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireVerified && requiresEmailVerification(user)) {
    return null;
  }

  return <>{children}</>;
}
