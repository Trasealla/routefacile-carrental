import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches.
 *
 * Use this instead of reading window.innerWidth in a resize listener. Reading
 * innerWidth makes the engine flush pending style and layout work before it can
 * answer, so a handler that runs on every resize event (and once on mount, while
 * the page is still settling) shows up as forced reflow — Lighthouse attributed
 * ~39 ms on the homepage to exactly that pattern.
 *
 * matchMedia is answered from the media-query cache and does not force layout,
 * and its change event fires only when the result actually flips rather than on
 * every resize frame.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);

    // Re-sync in case the viewport changed between first render and this effect.
    setMatches(mql.matches);

    // addListener is the pre-2019 Safari spelling; keep it as a fallback.
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}
