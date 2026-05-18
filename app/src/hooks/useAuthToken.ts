"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/app/src/lib/auth/token";
import { queryKeys } from "@/app/src/constants/queryKeys";

/** Fetches the current user's Firebase ID token (JWT) for API requests */
export function useAuthToken(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.token,
    queryFn: () => getAuthToken(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
