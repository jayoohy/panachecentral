import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary-gold" | "primary-onyx" | "outline" | "ghost";

// Stitch design system: flat, 0px radius, label-caps, 1px focus ring offset 3px, no shadows/glows.
const BASE =
  "rounded-none text-[0.6875rem] font-semibold uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[3px]";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  "primary-gold": `${BASE} bg-gold text-onyx hover:bg-gold/90 focus-visible:outline-gold`,
  // For Bone surfaces only (e.g. the homepage's light bands) — invisible on Onyx.
  "primary-onyx": `${BASE} bg-onyx text-bone hover:bg-onyx/90 focus-visible:outline-onyx`,
  outline: `${BASE} border border-bone/40 text-bone hover:border-gold hover:text-gold focus-visible:outline-gold`,
  ghost: `${BASE} text-bone/70 hover:text-gold focus-visible:outline-gold`,
};

/** Shared class builder so a `<Link>` can look identical to a `<Button>` without an asChild/Slot dependency. */
export function buttonClassName(variant: ButtonVariant = "primary-gold", className = "") {
  return `t-press inline-flex min-h-11 items-center justify-center gap-2 px-8 py-3 transition-colors ${VARIANT_CLASSES[variant]} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
};

/**
 * The one pressable-control implementation for the storefront (design spec
 * §5) — square Stitch styling shared with the marketing CTAs, press feedback and
 * loading crossfade per emil-design-eng's animation decision framework.
 */
export function Button({
  variant = "primary-gold",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${buttonClassName(variant)} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      <span
        className="transition-[filter,opacity] duration-200"
        style={loading ? { filter: "blur(2px)", opacity: 0.7 } : undefined}
      >
        {children}
      </span>
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
    </button>
  );
}
