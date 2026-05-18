"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { initAuthPersistence } from "@/app/src/lib/auth/initAuth";
import { toAuthUser } from "@/app/src/lib/auth/mapAuthUser";
import { setLoading, setUser } from "@/app/src/redux/features/authSlice";
import { syncUserDocument, setUserStatus } from "@/app/src/services/profileService";
import { auth } from "@/lib/firebase";

export function AuthListener({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let currentUid: string | null = null;

    const setup = async () => {
      await initAuthPersistence();
      dispatch(setLoading(true));

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        dispatch(setUser(toAuthUser(firebaseUser)));
        dispatch(setLoading(false));

        if (firebaseUser) {
          currentUid = firebaseUser.uid;
          // Set Online in Firestore then immediately bust the profile cache
          // so the sidebar reads the fresh status without waiting for stale-time
          syncUserDocument()
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["profile", firebaseUser.uid] });
            })
            .catch(console.error);
        } else {
          if (currentUid) {
            setUserStatus(currentUid, "Offline").catch(() => {});
            queryClient.invalidateQueries({ queryKey: ["profile", currentUid] });
          }
          currentUid = null;
        }
      });
    };

    setup().catch(() => dispatch(setLoading(false)));

    function handleBeforeUnload() {
      const uid = auth.currentUser?.uid;
      if (uid) setUserStatus(uid, "Offline").catch(() => {});
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      unsubscribe?.();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch, queryClient]);

  return children;
}
