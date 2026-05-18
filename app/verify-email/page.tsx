import { AuthLayout } from "@/app/src/components/auth/AuthLayout";
import { VerifyEmailContent } from "@/app/src/components/auth/VerifyEmailContent";
import { VerifyEmailGuard } from "@/app/src/components/auth/VerifyEmailGuard";

export default function VerifyEmailPage() {
  return (
    <VerifyEmailGuard>
      <AuthLayout
        title="Verify your email"
        subtitle="One more step before you can start chatting"
        footerText="Need a different account?"
        footerLinkText="Back to sign in"
        footerHref="/login"
      >
        <VerifyEmailContent />
      </AuthLayout>
    </VerifyEmailGuard>
  );
}
