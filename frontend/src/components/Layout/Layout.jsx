import React, { Fragment, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeaderNew from "../Header/HeaderNew";
import Footer from "../Footer/Footer";
import NewsletterSection from "../UI/NewsletterSection/NewsletterSection";
import PrivacyNotice from "../UI/PrivacyNotice/PrivacyNotice";
import Routers from "../../routers/Routers";
import "../../styles/stickybar.css";
import "../../styles/ourFleet.css";
import LowercaseRedirect from "../LowercaseRedirect";
import { trackWhatsappClick, trackPhoneClick } from "../../SharedComponent/tracking";
import usePrefetchRoutes from "../../hooks/usePrefetchRoutes";

const Layout = () => {

  // WhatsApp and call buttons appear in the header, the footer, the floating
  // action button and inside several page sections. Rather than wiring an
  // onClick into each one — and having to remember for every new one — a single
  // delegated listener catches any click that lands on a wa.me / whatsapp or
  // tel: link anywhere in the app. `capture` so it still fires if the handler
  // on the link itself navigates away.
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const where = link.closest("header") ? "header"
        : link.closest("footer") ? "footer"
        : link.closest("[class*='float'], [class*='sticky']") ? "floating_button"
        : "page";
      if (/wa\.me|api\.whatsapp\.com|whatsapp/i.test(href)) trackWhatsappClick(where);
      else if (/^tel:/i.test(href)) trackPhoneClick(where);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  const [isCollapse, setIsCollapse] = useState(false);

  // Warm the Fleet/Offers/CarDetails chunks once the browser is idle.
  usePrefetchRoutes();
  const location = useLocation();
  const isKycRoute = /^\/(?:[a-z]{2}\/)?kyc(?:\/|$)/i.test(location.pathname || "");

  return (
    <Fragment>
      {!isKycRoute && <HeaderNew />}
      {/* Portal target for the hero search form's date/time pickers (see
          CustomDateTimePicker3.js / DropoffDateTimePicker.js). Placed here —
          right after the header, near the top of the DOM — rather than at
          document.body: a portal appended at the very end of <body> sits
          after the footer, and focusing something inside it used to drag the
          whole page down to the bottom. Being a sibling of the header, with
          no ancestor `overflow: hidden` or low stacking context in between,
          it can also render above the header instead of being clipped by the
          hero section or capped by the hero card's z-index. */}
      <div id="rf-datepicker-portal" />
      {/* <main> landmark: the page had no main region, so assistive tech had no
          way to skip the header and jump straight to the page content. */}
      <main id="main-content" className="overflow-x-hidden main-content-wrapper">
        <LowercaseRedirect>
          <Routers />
        </LowercaseRedirect>
        {!isKycRoute && <div className={isCollapse ? "d-none" : "sticky-media-bar"}>
          <div className="social-share-container --chatbot-sticky-bar-- d-none">
            <div
              className="icons share icon-canter social-share-side"
              onClick={() => {
                setIsCollapse(true);
              }}
            >
              <i className="fas fa-share social-share-side"></i>{" "}
            </div>
          </div>
        </div>}
        {!isKycRoute && <div
          className={
            isCollapse ? "sticky-media-bar d-block" : " sticky-media-bar d-none"
          }
        >
          <div className="social-container">
            <div
              className="icons share icon-canter bg-secondary p-sm-0  social-share-side"
              onClick={() => {
                setIsCollapse(false);
              }}
            >
              <i className="ri-close-line"></i>{" "}
            </div>
            <div className="icons twitter icon-canter">
              {/* <a href="" aria-label="Twitter "> */}
                <i className="fab fa-twitter"></i>
              {/* </a> */}
            </div>
            <div className="icons github  icon-canter">
              {/* <a className href="" aria-label=""> */}
                <i className="fab fa-github "></i>
              {/* </a> */}
            </div>
            <div className="icons linkedin  icon-canter">
              {/* <a href="" aria-label="Linkedin -"> */}
                <i className="fab fa-linkedin-in "></i>
              {/* </a> */}
            </div>
            <div className="icons facebook icon-canter">
              {/* <a href="" aria-label="Facebook - "> */}
                <i className="fab fa-facebook"></i>
              {/* </a> */}
            </div>
            <div className="icons reddit icon-canter">
              {/* <a href="" aria-label="Reddit - "> */}
                <i className="fab fa-reddit  "></i>
              {/* </a> */}
            </div>
          </div>
        </div>}
      </main>
      {!isKycRoute && <NewsletterSection />}
      {!isKycRoute && <PrivacyNotice />}
      {!isKycRoute && <Footer />}

      {/* Floating WhatsApp chat button — bottom-right on every page */}
      {!isKycRoute && (
        <a
          href="https://api.whatsapp.com/send/?phone=212655585859&text=Hello+Route+Facile%21+I+would+like+information+about+car+rental.&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="rf-whatsapp-fab"
          aria-label="Chat on WhatsApp"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      )}
    </Fragment>
  );
};

export default Layout;
