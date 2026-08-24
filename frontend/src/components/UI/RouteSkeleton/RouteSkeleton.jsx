import React from "react";
import "./RouteSkeleton.css";

/**
 * Placeholder shown while a lazily-loaded route chunk is being fetched.
 *
 * Replaces a spinner centred in a 100vh empty box, which read as "the site is
 * broken" for the second or two it took Fleet and Offers to arrive — the page
 * went white, the footer was pushed off-screen, and nothing suggested what was
 * coming.
 *
 * This keeps the page height plausible and sketches the layout that is about to
 * appear, so the transition reads as loading rather than as a blank screen. The
 * shimmer animates `transform` only (never width/left), so it runs on the
 * compositor and cannot trigger layout during the very moment the browser is
 * busy parsing the incoming chunk.
 */
const RouteSkeleton = ({ cards = 6 }) => (
  <div className="rf-skel" role="status" aria-live="polite" aria-busy="true">
    <span className="rf-skel__sr">Loading…</span>

    <div className="rf-skel__head">
      <div className="rf-skel__bar rf-skel__bar--title" />
      <div className="rf-skel__bar rf-skel__bar--sub" />
    </div>

    <div className="rf-skel__grid">
      {Array.from({ length: cards }).map((_, i) => (
        <div className="rf-skel__card" key={i}>
          <div className="rf-skel__thumb" />
          <div className="rf-skel__bar rf-skel__bar--line" />
          <div className="rf-skel__bar rf-skel__bar--line short" />
        </div>
      ))}
    </div>
  </div>
);

export default RouteSkeleton;
