import { AuthLayout } from "@/app/src/components/auth/AuthLayout";
import { GuestGuard } from "@/app/src/components/auth/GuestGuard";
import { LoginForm } from "@/app/src/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <GuestGuard>
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to continue to your conversations"
        footerText="Don't have an account?"
        footerLinkText="Create one"
        footerHref="/signup"
      >
        <LoginForm />
      </AuthLayout>
    </GuestGuard>
  );
}
