"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toAuthUser } from "@/app/src/lib/auth/mapAuthUser";
import { setUser } from "@/app/src/redux/features/authSlice";
import {
  reloadCurrentUser,
  resendVerificationEmail,
  sendPasswordReset,
  signIn,
  signInWithGoogle,
  signUp,
  logout,
} from "@/app/src/services/authService";
import { getFirebaseErrorMessage } from "@/app/src/lib/firebaseErrors";
import { setUserStatus } from "@/app/src/services/profileService";
import { auth } from "@/lib/firebase";
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  SignUpFormValues,
} from "@/app/src/lib/validations/authSchema";
import type { User } from "firebase/auth";

function navigateAfterAuth(
  firebaseUser: User,
  dispatch: ReturnType<typeof useDispatch>,
  router: ReturnType<typeof useRouter>,
) {
  const authUser = toAuthUser(firebaseUser);
  if (!authUser) return;

  dispatch(setUser(authUser));
  router.replace("/");
}

export function useSignInMutation() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: LoginFormValues) =>
      signIn(email, password),
    onSuccess: (firebaseUser) => {
      navigateAfterAuth(firebaseUser, dispatch, router);
    },
  });
}

export function useSignUpMutation() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: SignUpFormValues) =>
      signUp(email, password),
    onSuccess: (firebaseUser) => {
      navigateAfterAuth(firebaseUser, dispatch, router);
    },
  });
}

export function useGoogleSignInMutation() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: (firebaseUser) => {
      navigateAfterAuth(firebaseUser, dispatch, router);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: ({ email }: ForgotPasswordFormValues) =>
      sendPasswordReset(email),
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: resendVerificationEmail,
  });
}

export function useCheckEmailVerifiedMutation() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: reloadCurrentUser,
    onSuccess: (firebaseUser) => {
      if (!firebaseUser) return;
      const authUser = toAuthUser(firebaseUser);
      if (!authUser) return;

      dispatch(setUser(authUser));

      if (!requiresEmailVerification(authUser)) {
        router.replace("/");
      }
    },
  });
}

export function useLogoutMutation() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Set Offline before signing out so the write succeeds while auth is still valid
      const uid = auth.currentUser?.uid;
      if (uid) await setUserStatus(uid, "Offline").catch(() => {});
      return logout();
    },
    onSuccess: () => {
      dispatch(setUser(null));
      router.replace("/login");
    },
  });
}

export function getAuthMutationError(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
