"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api-client";
import { AuthForm } from "@/components/commerce/AuthForm";
import { PageHeading } from "@/components/shared/PageHeading";

export default function RegisterPage() {
  const register = useRegister();
  const router = useRouter();

  const isDuplicate = register.isError && register.error instanceof ApiError && register.error.status === 409;

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <PageHeading>Create Account</PageHeading>
      <div className="mt-8">
        <AuthForm
          fields={[
            { name: "name", label: "Name", type: "text", autoComplete: "name", required: true },
            { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
            { name: "phone", label: "Phone (optional)", type: "tel", autoComplete: "tel" },
            {
              name: "password",
              label: "Password",
              type: "password",
              autoComplete: "new-password",
              required: true,
              hint: "At least 8 characters.",
            },
          ]}
          submitLabel="Create Account"
          loadingLabel="Creating Account…"
          loading={register.isPending}
          error={
            register.isError
              ? isDuplicate
                ? "An account with this email already exists."
                : "Something went wrong."
              : null
          }
          onSubmit={(values) =>
            register.mutate(
              {
                name: values.name,
                email: values.email,
                phone: values.phone || undefined,
                password: values.password,
              },
              { onSuccess: () => router.push("/account") }
            )
          }
          footer={
            isDuplicate ? (
              <p className="text-center text-sm text-bone/70">
                <Link href="/account/login" className="underline underline-offset-2 hover:text-gold">
                  Log in instead
                </Link>
              </p>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
