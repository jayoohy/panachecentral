"use client";

import { useEffect, useState } from "react";
import { FIELD_CLASS } from "@/components/shared/field-styles";

/** Debounced (300ms per design spec §5) search input for the product grid. */
export function SearchField({
  value,
  onChange,
  placeholder = "Search pieces",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  // Adjust local draft when the external value resets (e.g. clearing
  // filters) — computed during render per React's guidance, not via an
  // effect, so it doesn't cost an extra render pass.
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(value);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <label className="relative block">
      <span className="sr-only">Search products</span>
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className={FIELD_CLASS}
      />
    </label>
  );
}
