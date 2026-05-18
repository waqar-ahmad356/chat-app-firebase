"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Card, Input } from "@/app/src/components/ui";
import {
  getProfileMutationError,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/app/src/hooks/useProfile";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/app/src/lib/validations/authSchema";
import type { AuthUser } from "@/app/src/lib/auth/mapAuthUser";

const STATUS_OPTIONS = ["Online", "Busy", "Away", "Do not disturb", "Offline"];

interface ProfileFormProps {
  user: AuthUser | null;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { data: profile } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? "",
      bio: "",
      status: "",
    },
  });

  // Populate form once Firestore profile loads
  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName ?? user?.displayName ?? "",
        bio: profile.bio ?? "",
        status: profile.status ?? "",
      });
    }
  }, [profile, user, reset]);

  const bioValue = watch("bio") ?? "";

  function onSubmit(data: ProfileFormValues) {
    updateMutation.mutate(data, {
      onSuccess: () => {
        // reset dirty state with the saved values
        reset(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Profile Info
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Username"
          placeholder="Your name"
          error={errors.displayName?.message}
          {...register("displayName")}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Bio
          </label>
          <textarea
            rows={3}
            placeholder="Tell people a little about yourself…"
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors hover:border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            {...register("bio")}
          />
          <p className="text-right text-xs text-slate-500">
            {bioValue.length}/160
          </p>
          {errors.bio?.message && (
            <p className="text-xs text-red-400" role="alert">
              {errors.bio.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Status
          </label>
          <select
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white transition-colors hover:border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            {...register("status")}
          >
            <option value="">— No status —</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.status?.message && (
            <p className="text-xs text-red-400" role="alert">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Feedback */}
        {saved && (
          <Alert variant="success">✓ Profile saved successfully.</Alert>
        )}
        {updateMutation.isError && (
          <Alert variant="error">
            {getProfileMutationError(updateMutation.error)}
          </Alert>
        )}

        <Button
          type="submit"
          isLoading={updateMutation.isPending}
          disabled={!isDirty}
        >
          {updateMutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
