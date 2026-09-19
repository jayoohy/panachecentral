const LINE = `absolute left-0 h-px w-full bg-current transition-[transform,opacity] duration-500 [transition-timing-function:var(--reveal-ease)]`;

/** Three hairlines that morph into an X — the bars rotate rather than swapping icons. */
export function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden="true">
      <span className={`${LINE} top-0 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
      <span className={`${LINE} top-[7px] ${open ? "scale-x-0 opacity-0" : ""}`} />
      <span className={`${LINE} top-[14px] ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
    </span>
  );
}
