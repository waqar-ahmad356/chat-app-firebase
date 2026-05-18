"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/src/redux/store";
import { AvatarUpload } from "./AvatarUpload";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function ProfileSettings() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
      </div>

      {/* Avatar */}
      <AvatarUpload user={user} />

      {/* Profile info */}
      <ProfileForm user={user} />

      {/* Change password — only for email/password accounts */}
      {user?.providerId === "password" && <ChangePasswordForm />}
    </div>
  );
}
