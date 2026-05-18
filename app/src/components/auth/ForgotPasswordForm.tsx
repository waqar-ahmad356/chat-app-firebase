"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Alert, Button, Card, Input } from "@/app/src/components/ui";
import {
  getAuthMutationError,
  useForgotPasswordMutation,
} from "@/app/src/hooks/useAuth";
import { EmailDeliveryTips } from "@/app/src/components/auth/EmailDeliveryTips";
import { getDisposableEmailWarning } from "@/app/src/lib/auth/emailUtils";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/app/src/lib/validations/authSchema";

export function ForgotPasswordForm() {
  const resetMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const watchedEmail = watch("email");
  const disposableWarning = getDisposableEmailWarning(watchedEmail);

  const onSubmit = (data: ForgotPasswordFormValues) => {
    resetMutation.mutate(data);
  };

  if (resetMutation.isSuccess) {
    return (
      <Card className="space-y-5">
        <Alert variant="success" title="Check your inbox">
          If an account exists for that email, Firebase sent a password reset
          link. Follow the link to set a new password.
        </Alert>
        <EmailDeliveryTips email={watchedEmail} />
        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {resetMutation.isError && (
          <Alert variant="error" title="Request failed">
            {getAuthMutationError(resetMutation.error)}
          </Alert>
        )}

        <p className="text-sm text-slate-400">
          Enter your account email and we&apos;ll send you a link to reset your
          password.
        </p>

        {disposableWarning && (
          <Alert variant="error" title="Temporary email detected">
            {disposableWarning}
          </Alert>
        )}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={resetMutation.isPending}
        >
          Send reset link
        </Button>

        <Link
          href="/login"
          className="block text-center text-sm text-slate-500 hover:text-slate-300"
        >
          Back to sign in
        </Link>
      </form>
    </Card>
  );
}
