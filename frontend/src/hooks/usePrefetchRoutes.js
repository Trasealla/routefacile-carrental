import { useEffect } from "react";

/**
 * Warms the chunks for the routes visitors reach for first.
 *
 * Every page is behind React.lazy, so the first click on Fleet or Offers paid
 * for a network round trip to fetch the chunk before anything could render —
 * that wait is what the route skeleton covers. Fetching those chunks while the
 * browser is otherwise idle means the click usually has nothing to wait for and
 * the skeleton is never seen.
 *
 * Deliberately scheduled after `load` and then on idle: pulling extra chunks
 * during the initial render would slow down the page the visitor is actually
 * looking at, which is the trade this is meant to avoid. Failures are ignored —
 * a warm-up that does not happen just means the normal lazy load runs later.
 */
const ROUTE_CHUNKS = [
  () => import("../components/UI/OurFleetList"),
  () => import("../components/UI/Offerspage"),
  () => import("../pages/CarDetails"),
];

export default function usePrefetchRoutes() {
  useEffect(() => {
    let cancelled = false;
    let idleId;

    const warm = () => {
      if (cancelled) return;
      ROUTE_CHUNKS.forEach((load) => {
        try {
          load().catch(() => {});
        } catch {
          /* ignore */
        }
      });
    };

    const schedule = () => {
      if (cancelled) return;
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(warm, { timeout: 4000 });
      } else {
        idleId = setTimeout(warm, 1500);
      }
    };

    // Data Saver / very slow connections: skip speculative downloads entirely.
    const conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))) return;

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId != null) {
        if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
        clearTimeout(idleId);
      }
    };
  }, []);
}
