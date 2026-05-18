import { AuthLayout } from "@/app/src/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/app/src/components/auth/ForgotPasswordForm";
import { GuestGuard } from "@/app/src/components/auth/GuestGuard";

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <AuthLayout
        title="Reset your password"
        subtitle="We'll email you a link to choose a new password"
        footerText="Remember your password?"
        footerLinkText="Sign in"
        footerHref="/login"
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </GuestGuard>
  );
}
