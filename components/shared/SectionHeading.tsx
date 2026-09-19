import type { ReactNode } from "react";

/** Playfair headline; `accent` is set in italic after the main text ("A House, *Not a Page*"). */
export function SectionHeading({
  children,
  accent,
  tone = "onyx",
}: {
  children: ReactNode;
  accent?: string;
  tone?: "onyx" | "bone";
}) {
  return (
    <h2
      className={`font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl ${
        tone === "onyx" ? "text-bone" : "text-onyx"
      }`}
    >
      {children}
      {accent && (
        <>
          {" "}
          <em className="italic">{accent}</em>
        </>
      )}
    </h2>
  );
}
