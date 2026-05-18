"use client";

import { useRef } from "react";
import { Alert, Card } from "@/app/src/components/ui";
import {
  getProfileMutationError,
  useUploadProfilePictureMutation,
  useProfileQuery,
} from "@/app/src/hooks/useProfile";
import type { AuthUser } from "@/app/src/lib/auth/mapAuthUser";

interface AvatarUploadProps {
  user: AuthUser | null;
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProfilePictureMutation();
  // Firestore is the source of truth for photoURL (Auth rejects base64)
  const { data: profile } = useProfileQuery();
  const photoURL = profile?.photoURL ?? user?.photoURL ?? null;
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB");
      return;
    }
    uploadMutation.mutate(file);
    // reset so same file can be re-selected
    e.target.value = "";
  }

  const initials =
    user?.displayName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "?";

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Profile Picture
      </h2>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          {photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoURL}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-700"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600/20 text-2xl font-bold text-indigo-300 ring-2 ring-slate-700">
              {initials}
            </div>
          )}
          {uploadMutation.isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="rounded-xl border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-white/5 disabled:pointer-events-none disabled:opacity-50"
          >
            {uploadMutation.isPending ? "Uploading…" : "Upload photo"}
          </button>
          <p className="text-xs text-slate-500">JPG, PNG or WebP · max 5 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {uploadMutation.isSuccess && (
        <Alert variant="success" className="mt-4">
          Profile picture updated.
        </Alert>
      )}
      {uploadMutation.isError && (
        <Alert variant="error" className="mt-4">
          {getProfileMutationError(uploadMutation.error)}
        </Alert>
      )}
    </Card>
  );
}
