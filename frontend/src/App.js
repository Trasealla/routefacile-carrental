import Layout from "./components/Layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SchemaMarkup from "./components/SchemaMarkup/SchemaMarkup";

// Carbook CSS imports
// (bootstrap is imported once in index.js — importing it here as well was
//  redundant)
import './styles/wow-animations.css';
// Font Awesome is loaded via CDN in index.html for better reliability
// import './carbook-assets/css/fontawesome.min.css';
// nice-select.css removed: the jQuery plugin it styles is never imported and no
// element in the app carries a .nice-select class — 4 KB of dead rules that
// shipped in the entry stylesheet on every page.
import './carbook-assets/font/flaticon_mycollection.css';
// The carbook theme's bundled swiper.css (16 KB) is not imported here any more.
// The only Swiper in the app is LocationsCarousel, which imports Swiper's own
// stylesheets (swiper/css + navigation + pagination). Loading the theme's older
// copy globally meant every page paid for a carousel that appears on one
// below-the-fold section of the home page.
import './carbook-assets/css/style.css';
import './carbook-assets/css/responsive.css';

// Keep existing ARC styles that don't conflict
import './assets/style/main.css';

// Override styles to match carbook theme
import './carbook-override.css';
// Shared studio backdrop for car photos, used across fleet/details/booking.
import './styles/car-stage.css';
import { useLocation } from 'react-router-dom';
import { useEffect, startTransition } from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ScrollToTop from './components/ScrollToTop';
import { getValidAccessToken } from './config.js/SetUp';


function App() {
  const { i18n } = useTranslation();
  const language = useSelector((state) => state.language.language);

  // Sweep the stored session once on boot.
  //
  // getValidAccessToken() drops anything expired or belonging to staff, and the
  // CMS admin previously shared this exact storage key — so a browser that had
  // signed into /admin was holding an admin JWT that this site would send to the
  // booking API, failing checkout with a bare 401. Doing it here means such a
  // browser is cleaned the moment the app loads, rather than discovering the
  // problem at the point of confirming a booking.
  useEffect(() => {
    getValidAccessToken();
  }, []);
  
  // Update HTML direction and lang attribute based on language
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Set direction: RTL for Arabic (ar), LTR for others
    if (language === "ar" || language === "ae") {
      htmlElement.setAttribute("dir", "rtl");
      htmlElement.setAttribute("lang", "ar");
    } else {
      htmlElement.setAttribute("dir", "ltr");
      htmlElement.setAttribute("lang", language === "fr" ? "fr" : "en");
    }
  }, [language]);

  const location = useLocation();

  // Sync i18n language with Redux language — but only off the /:lang routes.
  //
  // On a language-prefixed URL the prefix is the single source of truth and
  // LangSync (routers/Routers.js) applies it to both Redux and i18n. This effect
  // pushes the other way, and when the two disagreed — a visitor whose stored
  // language was French opening an /ar/ link — the two took turns overwriting
  // each other and the stored language won: the page stayed French on an Arabic
  // URL. Skipping prefixed paths leaves exactly one writer.
  //
  // startTransition is still required: translations are fetched at runtime, so
  // changeLanguage suspends, and React treats suspending on synchronous input as
  // an error (#426) that blanks the page.
  useEffect(() => {
    const prefix = (location.pathname || "").split("/")[1];
    if (["en", "fr", "ar"].includes(prefix)) return;
    if (language && i18n.language !== language) {
      startTransition(() => {
        i18n.changeLanguage(language);
      });
    }
  }, [language, i18n, location.pathname]);
  // Page views are GTM's job. This used to send a second one through react-ga4
  // on every route change, so each navigation was counted twice in GA4 — once
  // by the container's tag and once from here.


  return (
  <>
     <SchemaMarkup schemas={["localBusiness", "reviews", "faq"]} />
     <ScrollToTop />
  <ToastContainer style={{ zIndex: 9999999999 }} />
    <Layout />
    </>);
}

export default App;
