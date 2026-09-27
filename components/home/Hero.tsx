import { HeroVideo } from "@/components/home/HeroVideo";
import { buttonClassName } from "@/components/shared/Button";
import { TAGLINE_ACCENT, TAGLINE_LEAD } from "@/lib/constants";
import Link from "next/link";

export function Hero() {
  return (
    <section aria-label="Hero" className="bg-onyx text-bone">
      <HeroVideo>
        {/* Scrim: the video swings from near-black to brighter
            moments, so text needs guaranteed contrast against any of them,
            not just the darkest ones. Anchored where the copy sits: bottom on phones, left above. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,10,0.85)_0%,rgba(10,10,10,0.5)_40%,rgba(10,10,10,0)_65%)] sm:bg-[linear-gradient(90deg,rgba(10,10,10,0.8)_0%,rgba(10,10,10,0.45)_45%,rgba(10,10,10,0)_75%)]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex flex-col justify-end pb-16 sm:justify-center sm:pb-0 px-6 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-xl [text-shadow:0_2px_16px_rgba(10,10,10,0.65)]">
              <h1 className="hero-in [animation-delay:150ms] font-serif text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                {TAGLINE_LEAD}
                <br />
                <em className="italic">{TAGLINE_ACCENT}</em>
              </h1>
              <p className="hero-in mt-6 max-w-md [animation-delay:300ms] text-base font-light leading-[1.75] text-bone/90 sm:text-lg">
                Panache Isn&apos;t Loud. It&apos;s Certain.
              </p>
              <Link
                href="/shop"
                className={`hero-in pointer-events-auto [animation-delay:450ms] ${buttonClassName("primary-gold", "mt-10")}`}
              >
                Shop the Collection
              </Link>
            </div>
          </div>
        </div>
      </HeroVideo>
    </section>
  );
}
