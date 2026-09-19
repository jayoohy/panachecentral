"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api-client";
import { AuthForm } from "@/components/commerce/AuthForm";
import { PageHeading } from "@/components/shared/PageHeading";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const login = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <PageHeading>Log In</PageHeading>
      <div className="mt-8">
        <AuthForm
          fields={[
            { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
            { name: "password", label: "Password", type: "password", autoComplete: "current-password", required: true },
          ]}
          submitLabel="Log In"
          loadingLabel="Logging In…"
          loading={login.isPending}
          error={login.isError ? (login.error instanceof ApiError ? "Incorrect email or password." : "Something went wrong.") : null}
          onSubmit={(values) =>
            login.mutate(
              { email: values.email, password: values.password },
              { onSuccess: () => router.push(redirectTo) }
            )
          }
          footer={
            <div className="space-y-2 text-center text-sm text-bone/70">
              <p>
                <Link href="/account/forgot-password" className="underline underline-offset-2 hover:text-gold">
                  Forgot password?
                </Link>
              </p>
              <p>
                New here?{" "}
                <Link href="/account/register" className="underline underline-offset-2 hover:text-gold">
                  Create an account
                </Link>
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}
