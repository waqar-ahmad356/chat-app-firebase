import { AuthGuard } from "@/app/src/components/auth/AuthGuard";
import { ProfileSettings } from "@/app/src/components/profile/ProfileSettings";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <main className="flex flex-1 flex-col bg-slate-950">
        <ProfileSettings />
      </main>
    </AuthGuard>
  );
}
