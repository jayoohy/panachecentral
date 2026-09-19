"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useCartStore } from "@/lib/store/cart-store";
import type { Customer } from "@/lib/duka/types";

export function useRegister() {
  const setLoggedIn = useCartStore((state) => state.setLoggedIn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { email: string; password: string; name: string; phone?: string }) =>
      apiFetch<{ customer: Customer }>("/api/storefront/account/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: ({ customer }) => {
      setLoggedIn(true);
      queryClient.setQueryData(["account"], customer);
    },
  });
}

export function useLogin() {
  const setLoggedIn = useCartStore((state) => state.setLoggedIn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<{ customer: Customer }>("/api/storefront/account/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: ({ customer }) => {
      setLoggedIn(true);
      queryClient.setQueryData(["account"], customer);
    },
  });
}

export function useLogout() {
  const setLoggedIn = useCartStore((state) => state.setLoggedIn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/api/storefront/account/logout", { method: "POST" }),
    onSuccess: () => {
      setLoggedIn(false);
      queryClient.removeQueries({ queryKey: ["account"] });
      queryClient.removeQueries({ queryKey: ["account-orders"] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<{ message: string }>("/api/storefront/account/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { token: string; newPassword: string }) =>
      apiFetch<{ message: string }>("/api/storefront/account/reset-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}
