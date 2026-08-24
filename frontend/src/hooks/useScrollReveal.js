import { useEffect } from "react";

/**
 * Adds the `animated` class to `.wow` elements as they scroll into view.
 *
 * This replaces the wow.js library. wow.js drives its reveal from a scroll
 * listener that calls getComputedStyle().getPropertyValue() and reads
 * pageYOffset on every scroll event — both force the engine to flush layout, so
 * it was the largest remaining source of forced reflow on the homepage once the
 * innerWidth reads were gone. IntersectionObserver answers the same question off
 * the main thread and never forces layout.
 *
 * The animation itself lives in styles/wow-animations.css and is additive:
 * elements are visible by default and simply fade in where this runs. So if an
 * element is added after the scan (or the observer is unavailable) the page is
 * still correct — it just misses the flourish.
 *
 * Pass `deps` when `.wow` elements can appear after the initial render, so the
 * scan picks them up.
 */
export default function useScrollReveal(deps = []) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".wow:not(.animated)"));
    if (elements.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => el.classList.add("animated"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("animated");
          observer.unobserve(entry.target);
        });
      },
      // Trigger slightly after the element's top edge enters, which is roughly
      // where wow.js fired and keeps the reveal from happening off-screen.
      { rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
