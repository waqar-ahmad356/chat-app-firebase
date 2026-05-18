"use client";

import { useSelector } from "react-redux";
import { Alert, Button, Card } from "@/app/src/components/ui";
import {
  getAuthMutationError,
  useCheckEmailVerifiedMutation,
  useLogoutMutation,
  useResendVerificationMutation,
} from "@/app/src/hooks/useAuth";
import { EmailDeliveryTips } from "@/app/src/components/auth/EmailDeliveryTips";
import type { RootState } from "@/app/src/redux/store";

export function VerifyEmailContent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const resendMutation = useResendVerificationMutation();
  const checkMutation = useCheckEmailVerifiedMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <Card className="space-y-6">
      <Alert variant="info" title="Verify your email">
        We sent a verification link to{" "}
        <span className="font-medium text-white">{user?.email}</span>. Open the
        link in your inbox, then click the button below.
      </Alert>

      {resendMutation.isSuccess && (
        <Alert variant="success" title="Email sent">
          Verification email sent again. Check your inbox and spam folder.
        </Alert>
      )}

      <EmailDeliveryTips email={user?.email} />

      {resendMutation.isError && (
        <Alert variant="error">
          {getAuthMutationError(resendMutation.error)}
        </Alert>
      )}

      {checkMutation.isError && (
        <Alert variant="error">
          {getAuthMutationError(checkMutation.error)}
        </Alert>
      )}

      {checkMutation.isSuccess &&
        user &&
        !user.emailVerified &&
        !checkMutation.isPending && (
          <Alert variant="info">
            Email not verified yet. Check your inbox and try again.
          </Alert>
        )}

      <div className="flex flex-col gap-3">
        <Button
          fullWidth
          size="lg"
          onClick={() => checkMutation.mutate()}
          isLoading={checkMutation.isPending}
        >
          I&apos;ve verified my email
        </Button>

        <Button
          variant="outline"
          fullWidth
          onClick={() => resendMutation.mutate()}
          isLoading={resendMutation.isPending}
          disabled={resendMutation.isPending}
        >
          Resend verification email
        </Button>

        <Button
          variant="ghost"
          fullWidth
          onClick={() => logoutMutation.mutate()}
          isLoading={logoutMutation.isPending}
        >
          Sign out
        </Button>
      </div>
    </Card>
  );
}
