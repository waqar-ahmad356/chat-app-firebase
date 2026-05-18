import type { AuthUser } from "@/app/src/lib/auth/mapAuthUser";

export const PASSWORD_PROVIDER_ID = "password";
export const GOOGLE_PROVIDER_ID = "google.com";

export function isPasswordProvider(user: AuthUser): boolean {
  return user.providerId === PASSWORD_PROVIDER_ID;
}

export function requiresEmailVerification(user: AuthUser): boolean {
  return isPasswordProvider(user) && !user.emailVerified;
}
