"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shared/Button";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "@/components/shared/field-styles";

export type AuthField = {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  required?: boolean;
  hint?: string;
};

/**
 * Shared shell for login/register/forgot/reset — one component, different
 * field sets, so the four auth screens don't fork into four bespoke layouts
 * (design spec §5).
 */
export function AuthForm({
  fields,
  submitLabel,
  loadingLabel,
  loading,
  error,
  onSubmit,
  footer,
}: {
  fields: AuthField[];
  submitLabel: string;
  loadingLabel: string;
  loading: boolean;
  error: string | null;
  onSubmit: (values: Record<string, string>) => void;
  footer?: React.ReactNode;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((field) => [field.name, ""]))
  );
  const [shaking, setShaking] = useState(false);
  const previousError = useRef(error);

  useEffect(() => {
    if (error && error !== previousError.current) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 300);
      previousError.current = error;
      return () => clearTimeout(timer);
    }
    previousError.current = error;
  }, [error]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-shaking={shaking}>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className={FIELD_LABEL_CLASS}>
            {field.label}
          </label>
          <input
            id={field.name}
            type={field.type}
            required={field.required}
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "auth-error" : undefined}
            className={`t-shake mt-1 ${FIELD_CLASS}`}
          />
          {field.hint && <p className="mt-1 text-xs text-bone/40">{field.hint}</p>}
        </div>
      ))}

      {error && (
        <p id="auth-error" role="alert" className="text-sm text-(--color-error)">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary-gold" className="w-full" loading={loading}>
        {loading ? loadingLabel : submitLabel}
      </Button>

      {footer}
    </form>
  );
}
