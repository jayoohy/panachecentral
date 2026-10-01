"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/shared/Button";

/** Prev/next plus numbered page buttons so a visitor can jump straight to any page. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Which "…" (by position in the rendered list) is currently showing its jump-to-page input.
  const [openEllipsisAt, setOpenEllipsisAt] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openEllipsisAt !== null) inputRef.current?.focus();
  }, [openEllipsisAt]);

  if (totalPages <= 1) return null;

  function closeEllipsis() {
    setOpenEllipsisAt(null);
    setDraft("");
  }

  function submitDraft() {
    const target = Math.trunc(Number(draft));
    if (Number.isFinite(target) && draft.trim() !== "") {
      onPageChange(Math.min(Math.max(target, 1), totalPages));
    }
    closeEllipsis();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitDraft();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeEllipsis();
    }
  }

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        Previous
      </Button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === "ellipsis" ? (
          openEllipsisAt === index ? (
            <input
              key={`ellipsis-input-${index}`}
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draft}
              onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={onInputKeyDown}
              onBlur={submitDraft}
              placeholder="Page"
              aria-label={`Jump to a page between 1 and ${totalPages}`}
              className="h-11 w-16 border border-gold bg-transparent px-2 text-center text-sm tabular-nums text-bone focus:outline-none"
            />
          ) : (
            <button
              key={`ellipsis-${index}`}
              type="button"
              onClick={() => {
                setOpenEllipsisAt(index);
                setDraft("");
              }}
              aria-label="Choose a page number"
              className="flex h-11 min-w-11 items-center justify-center text-sm text-bone/40 transition-colors hover:text-gold"
            >
              …
            </button>
          )
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={`t-press flex h-11 min-w-11 items-center justify-center border px-3 text-sm tabular-nums transition-colors ${
              item === page
                ? "border-gold text-gold"
                : "border-bone/20 text-bone/70 hover:border-gold hover:text-gold"
            }`}
          >
            {item}
          </button>
        )
      )}

      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next
      </Button>
    </nav>
  );
}

/** All pages when there are few; otherwise first, last, and a window around the current page. */
function getPageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const windowStart = Math.max(2, page - 1);
  const windowEnd = Math.min(totalPages - 1, page + 1);

  if (windowStart > 2) items.push("ellipsis");
  for (let p = windowStart; p <= windowEnd; p++) items.push(p);
  if (windowEnd < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}
