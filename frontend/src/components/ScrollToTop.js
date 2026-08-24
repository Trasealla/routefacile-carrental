import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Reset the scroll position on navigation.
  //
  // This used to fire six writes per navigation: window.scrollTo plus
  // documentElement.scrollTop plus body.scrollTop, then all three again inside a
  // setTimeout. The two scrollTop assignments are legacy fallbacks that no
  // supported browser needs, and because they follow scrollTo they each force
  // the engine to flush layout — Lighthouse attributed ~35 ms of forced reflow
  // to this component alone, on the critical path since it runs in a layout
  // effect before paint.
  //
  // window.scrollTo on its own does the job. Kept in useLayoutEffect (not
  // useEffect) deliberately: it runs before the browser paints, so a new route
  // never flashes at the previous scroll offset.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
