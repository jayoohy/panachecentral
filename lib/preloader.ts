// Shared by the root layout (runs the script before first paint) and the Preloader component.
export const PRELOAD_SEEN_KEY = "panache:preloaded";

// Runs in <head> before paint: arms the preloader once per browser session, never for reduced motion.
// With no JS this never runs, so the overlay stays hidden by default (see globals.css).
export const PRELOAD_INIT_SCRIPT = `try{if(!sessionStorage.getItem("${PRELOAD_SEEN_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.preload="active"}catch(e){}`;

export const PRELOAD_MIN_MS = 2200; // long enough for the line to draw and the wordmark to settle
export const PRELOAD_MAX_MS = 4500; // never hold the visitor hostage to a slow asset
export const PRELOAD_LEAVE_MS = 1000; // matches the curtain transition in globals.css
