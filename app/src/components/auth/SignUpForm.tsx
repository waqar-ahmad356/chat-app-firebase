"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Alert, Button, Card, Input } from "@/app/src/components/ui";
import { AuthDivider } from "@/app/src/components/auth/AuthDivider";
import { GoogleSignInButton } from "@/app/src/components/auth/GoogleSignInButton";
import {
  getAuthMutationError,
  useSignUpMutation,
} from "@/app/src/hooks/useAuth";
import {
  signUpSchema,
  type SignUpFormValues,
} from "@/app/src/lib/validations/authSchema";

export function SignUpForm() {
  const signUpMutation = useSignUpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: SignUpFormValues) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="space-y-5">
      <GoogleSignInButton />
      <AuthDivider />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {signUpMutation.isError && (
            <Alert variant="error" title="Sign up failed">
              {getAuthMutationError(signUpMutation.error)}
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

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            hint="At least 8 characters with uppercase, lowercase, and a number"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={signUpMutation.isPending}
          >
            Create account
          </Button>
        </form>
      </Card>
    </div>
  );
}
