import { AuthLayout } from "@/app/src/components/auth/AuthLayout";
import { GuestGuard } from "@/app/src/components/auth/GuestGuard";
import { SignUpForm } from "@/app/src/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <GuestGuard>
      <AuthLayout
        title="Create your account"
        subtitle="Join PulseChat and start messaging in seconds"
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerHref="/login"
      >
        <SignUpForm />
      </AuthLayout>
    </GuestGuard>
  );
}
