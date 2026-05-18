"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Card, Input } from "@/app/src/components/ui";
import {
  getProfileMutationError,
  useChangePasswordMutation,
} from "@/app/src/hooks/useProfile";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/app/src/lib/validations/authSchema";

export function ChangePasswordForm() {
  const changeMutation = useChangePasswordMutation();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  function onSubmit(data: ChangePasswordFormValues) {
    changeMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Change Password
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="At least 8 characters with uppercase, lowercase, and a number"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword")}
        />

        {saved && (
          <Alert variant="success">✓ Password changed successfully.</Alert>
        )}
        {changeMutation.isError && (
          <Alert variant="error">
            {getProfileMutationError(changeMutation.error)}
          </Alert>
        )}

        <Button
          type="submit"
          isLoading={changeMutation.isPending}
          disabled={!isDirty}
        >
          {changeMutation.isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Card>
  );
}
