import type { ReactNode } from "react";

/** A native radio wrapped in a bordered, fully clickable card (checkout choices). */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer gap-3 border border-bone/15 p-4 text-sm transition-colors hover:border-gold has-checked:border-gold">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required
        className="mt-1 accent-gold"
      />
      <span>{children}</span>
    </label>
  );
}
