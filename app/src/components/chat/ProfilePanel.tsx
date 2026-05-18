"use client";

import { useSelector } from "react-redux";
import { requiresEmailVerification } from "@/app/src/lib/auth/authHelpers";
import { Alert } from "@/app/src/components/ui";
import {
  getAuthMutationError,
  useResendVerificationMutation,
} from "@/app/src/hooks/useAuth";
import { AvatarUpload } from "@/app/src/components/profile/AvatarUpload";
import { ProfileForm } from "@/app/src/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/app/src/components/profile/ChangePasswordForm";
import type { RootState } from "@/app/src/redux/store";

interface ProfilePanelProps {
  onBack: () => void;
}

export function ProfilePanel({ onBack }: ProfilePanelProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const resendMutation = useResendVerificationMutation();
  const needsVerification = !!user && requiresEmailVerification(user);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Back to chat"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-white">Profile Settings</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {needsVerification && (
          <Alert variant="info" title="Verify your email">
            A verification link was sent to{" "}
            <span className="font-medium text-white">{user?.email}</span>.{" "}
            <button
              className="underline hover:text-indigo-300 disabled:opacity-50"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending || resendMutation.isSuccess}
            >
              {resendMutation.isSuccess ? "Email sent" : "Resend email"}
            </button>
          </Alert>
        )}
        {resendMutation.isError && (
          <Alert variant="error">
            {getAuthMutationError(resendMutation.error)}
          </Alert>
        )}

        <AvatarUpload user={user} />
        <ProfileForm user={user} />
        {user?.providerId === "password" && <ChangePasswordForm />}
      </div>
    </div>
  );
}
