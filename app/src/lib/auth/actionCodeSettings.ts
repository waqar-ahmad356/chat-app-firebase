import type { ActionCodeSettings } from "firebase/auth";

/** App origin used in Firebase email links (must match Authorized domains in Firebase Console) */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getEmailVerificationSettings(): ActionCodeSettings {
  return {
    url: `${getAppOrigin()}/verify-email`,
    handleCodeInApp: false,
  };
}

export function getPasswordResetSettings(): ActionCodeSettings {
  return {
    url: `${getAppOrigin()}/login`,
    handleCodeInApp: false,
  };
}
