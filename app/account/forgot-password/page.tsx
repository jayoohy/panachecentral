"use client";

import { useState } from "react";
import { useForgotPassword } from "@/hooks/useAuth";
import { AuthForm } from "@/components/commerce/AuthForm";
import { PageHeading } from "@/components/shared/PageHeading";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <PageHeading>Reset Password</PageHeading>
      <div className="mt-8">
        {submitted ? (
          <p className="text-sm text-bone/80">If that account exists, we&apos;ve sent a reset link.</p>
        ) : (
          <AuthForm
            fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email", required: true }]}
            submitLabel="Send Reset Link"
            loadingLabel="Sending…"
            loading={forgotPassword.isPending}
            error={null}
            onSubmit={(values) =>
              forgotPassword.mutate(values.email, { onSuccess: () => setSubmitted(true) })
            }
          />
        )}
      </div>
    </div>
  );
}
