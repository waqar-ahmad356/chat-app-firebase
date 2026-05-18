import { auth } from "@/lib/firebase";

/** Returns Firebase ID token (JWT) for the current user, refreshed when expired */
export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}
