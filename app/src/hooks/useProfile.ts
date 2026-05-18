"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/app/src/redux/features/authSlice";
import {
  fetchProfile,
  updateDisplayName,
  updateBioAndStatus,
  uploadProfilePicture,
  changePassword,
} from "@/app/src/services/profileService";
import { toAuthUser } from "@/app/src/lib/auth/mapAuthUser";
import { auth } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/app/src/lib/firebaseErrors";
import type { RootState } from "@/app/src/redux/store";
import type { ProfileFormValues, ChangePasswordFormValues } from "@/app/src/lib/validations/authSchema";

export function useProfileQuery() {
  const uid = useSelector((state: RootState) => state.auth.user?.uid);
  return useQuery({
    queryKey: ["profile", uid],
    queryFn: () => fetchProfile(uid!),
    enabled: !!uid,
  });
}

export function useUpdateProfileMutation() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const uid = useSelector((state: RootState) => state.auth.user?.uid);

  return useMutation({
    mutationFn: async ({ displayName, bio, status }: ProfileFormValues) => {
      await updateDisplayName(displayName);
      await updateBioAndStatus(bio ?? "", status ?? "");
    },
    onSuccess: () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const authUser = toAuthUser(firebaseUser);
        if (authUser) dispatch(setUser(authUser));
      }
      queryClient.invalidateQueries({ queryKey: ["profile", uid] });
    },
  });
}

export function useUploadProfilePictureMutation() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const uid = useSelector((state: RootState) => state.auth.user?.uid);

  return useMutation({
    mutationFn: (file: File) => uploadProfilePicture(file),
    onSuccess: (photoURL: string) => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const authUser = toAuthUser(firebaseUser);
        if (authUser) dispatch(setUser({ ...authUser, photoURL }));
      }
      queryClient.invalidateQueries({ queryKey: ["profile", uid] });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordFormValues) =>
      changePassword(currentPassword, newPassword),
  });
}

export function getProfileMutationError(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
