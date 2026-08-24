import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, inView] and flips inView to true the first time the referenced
 * element comes near the viewport, then stops observing.
 *
 * Use this to gate mounting of below-the-fold widgets that pull in heavy
 * dependencies. React.lazy alone is not enough: it splits the chunk but still
 * fetches it as soon as the component renders, and a lazy component sitting in
 * the initial tree renders immediately — so the chunk lands on the critical path
 * regardless of the Suspense boundary around it. Gating the render is what
 * actually defers the download.
 *
 * rootMargin defaults to 400px so the chunk starts loading slightly before the
 * section scrolls into view and is ready by the time it is visible.
 *
 * Falls back to mounting immediately where IntersectionObserver is unavailable,
 * so the content is never withheld.
 */
export default function useInViewOnce({ rootMargin = "400px 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}
