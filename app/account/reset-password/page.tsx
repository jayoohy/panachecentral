"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/useAuth";
import { AuthForm } from "@/components/commerce/AuthForm";
import { PageHeading } from "@/components/shared/PageHeading";
import { buttonClassName } from "@/components/shared/Button";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPassword = useResetPassword();
  const router = useRouter();

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-6 py-16 text-center">
        <PageHeading>Reset Password</PageHeading>
        <p className="mt-4 text-sm text-bone/70">This reset link has expired or was already used.</p>
        <Link href="/account/forgot-password" className={buttonClassName("outline", "mt-6")}>
          Request New Link
        </Link>
      </div>
    );
  }

  if (resetPassword.isError) {
    return (
      <div className="mx-auto max-w-sm px-6 py-16 text-center">
        <PageHeading>Reset Password</PageHeading>
        <p className="mt-4 text-sm text-bone/70">This reset link has expired or was already used.</p>
        <Link href="/account/forgot-password" className={buttonClassName("outline", "mt-6")}>
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <PageHeading>Set New Password</PageHeading>
      <div className="mt-8">
        <AuthForm
          fields={[
            {
              name: "newPassword",
              label: "New Password",
              type: "password",
              autoComplete: "new-password",
              required: true,
              hint: "At least 8 characters.",
            },
          ]}
          submitLabel="Update Password"
          loadingLabel="Updating…"
          loading={resetPassword.isPending}
          error={null}
          onSubmit={(values) =>
            resetPassword.mutate(
              { token, newPassword: values.newPassword },
              { onSuccess: () => router.push("/account/login") }
            )
          }
        />
      </div>
    </div>
  );
}
