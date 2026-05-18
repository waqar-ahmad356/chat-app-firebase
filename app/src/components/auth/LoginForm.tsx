"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Alert, Button, Card, Input, Label } from "@/app/src/components/ui";
import { AuthDivider } from "@/app/src/components/auth/AuthDivider";
import { GoogleSignInButton } from "@/app/src/components/auth/GoogleSignInButton";
import {
  getAuthMutationError,
  useSignInMutation,
} from "@/app/src/hooks/useAuth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/app/src/lib/validations/authSchema";

export function LoginForm() {
  const signInMutation = useSignInMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="space-y-5">
      <GoogleSignInButton />
      <AuthDivider />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {signInMutation.isError && (
            <Alert variant="error" title="Sign in failed">
              {getAuthMutationError(signInMutation.error)}
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors hover:border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 aria-invalid:border-red-500/60"
              {...register("password")}
            />
            {errors.password?.message && (
              <p className="text-xs text-red-400" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={signInMutation.isPending}
          >
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
