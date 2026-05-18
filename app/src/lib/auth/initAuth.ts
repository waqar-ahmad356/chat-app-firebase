import { browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";

let persistenceReady: Promise<void> | null = null;

/** Persists Firebase auth session (refresh token) across browser restarts */
export function initAuthPersistence(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!persistenceReady) {
    persistenceReady = setPersistence(auth, browserLocalPersistence).catch(
      (error) => {
        persistenceReady = null;
        console.error("Failed to set auth persistence:", error);
        throw error;
      },
    );
  }

  return persistenceReady;
}
