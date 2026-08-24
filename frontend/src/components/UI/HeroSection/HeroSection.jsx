import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "reactstrap";
import { useTranslation } from "react-i18next";
import "./HeroSection.css";
import "./HeroStudio.css";
import { simpleGetCall } from "../../../config.js/SetUp";
import configWeb from "../../../config.js/configWeb";
import FindCarForm2 from "../FindCarForm2";


// Hero banner served from public/ — allows <link rel="preload"> in index.html
const heroBanner = "/images/banners/hero-banner.png";

const HeroSection = () => {
  const { t } = useTranslation();

  // BOOK on a fleet card sends the visitor here with `focusSearch`, because a
  // car cannot be quoted without a pickup location and dates. Scrolling the
  // booking card into view is what makes that redirect read as "next step"
  // rather than "you have been dumped on the homepage".
  const routerLocation = useLocation();
  const searchCardRef = useRef(null);

  useEffect(() => {
    if (!routerLocation.state?.focusSearch || !searchCardRef.current) return;
    // Wait a frame: the card is below a 600px hero that is still settling, so
    // scrolling synchronously lands on the wrong offset.
    const id = requestAnimationFrame(() => {
      searchCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(id);
  }, [routerLocation.state]);
  // There was an `isMobile` state here backed by a resize listener reading
  // window.innerWidth. Nothing ever read the value — the component picks its
  // layout entirely from CSS and <picture> media queries — so it was pure cost:
  // an innerWidth read forces a layout flush, and it ran on every resize event
  // plus once during the initial render. Removed rather than converted; if a
  // breakpoint is ever needed here, use the useMediaQuery hook.


  // Preferred city display order
  const cityOrder = ["Marrakech", "Casablanca", "Rabat", "Agadir", "Tangier", "Fes", "Tetouan", "Ouarzazate"];
  const sortCities = (arr) => [...arr].sort((a, b) => {
    const ai = cityOrder.indexOf(a.name);
    const bi = cityOrder.indexOf(b.name);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  // Static cities data as fallback
  const staticCities = sortCities([
    { id: 1, name: "Casablanca" },
    { id: 2, name: "Tangier" },
    { id: 3, name: "Marrakech" },
    { id: 4, name: "Agadir" },
    { id: 5, name: "Fes" },
    { id: 6, name: "Rabat" },
    { id: 7, name: "Tetouan" },
    { id: 8, name: "Ouarzazate" },
  ]);

  const [citiesArray, setCitiesArray] = useState(staticCities);

  useEffect(() => {
    // Fetch cities/locations
    const getCities = async () => {
      try {
        const response = await simpleGetCall(configWeb.GET_CITIES);
        if (Array.isArray(response) && response.length > 0) {
          setCitiesArray(sortCities(response));
        } else {
          setCitiesArray(staticCities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCitiesArray(staticCities);
      }
    };
    getCities();
  }, []);

  return (
    <section id="home" className="hero-rf">
      {/* Full-bleed lifestyle banner — different crop for phones vs desktop */}
      <div className="hero-rf-media">
        {/* This is the LCP element. Phones previously got one fixed 740px WebP
            (90 KB) regardless of screen size; they now pick from a responsive
            AVIF set (19/46/67 KB) with a WebP fallback for older Safari.
            The list stops at 828px on purpose: with sizes="100vw" a DPR-3 phone
            would otherwise select an even larger file and download MORE than
            before, which is the opposite of what this is for.
            Keep the preload in index.html in step with these srcsets. */}
        <picture>
          <source
            type="image/avif"
            media="(max-width: 767px)"
            sizes="100vw"
            srcSet="/images/banners/rf-hero-m-414.avif 414w, /images/banners/rf-hero-m-640.avif 640w, /images/banners/rf-hero-m-828.avif 828w"
          />
          <source
            type="image/webp"
            media="(max-width: 767px)"
            sizes="100vw"
            srcSet="/images/banners/rf-hero-m-414.webp 414w, /images/banners/rf-hero-m-640.webp 640w, /images/banners/rf-hero-m-828.webp 828w"
          />
          <source media="(max-width: 767px)" srcSet="/images/banners/rf-hero-mobile-v2.jpg" />
          {/* Desktop AVIF ahead of each WebP: the browser takes the first source
              whose type it supports, so AVIF wins where available (110/77 KB
              against 217/160 KB) and everything else falls through to WebP. */}
          <source type="image/avif" media="(min-width: 1600px)" srcSet="/images/banners/rf-hero-desktop-v3.avif" />
          <source type="image/webp" media="(min-width: 1600px)" srcSet="/images/banners/rf-hero-desktop-v3.webp" />
          <source type="image/avif" srcSet="/images/banners/rf-hero-desktop-1280-v3.avif" />
          <source type="image/webp" srcSet="/images/banners/rf-hero-desktop-1280-v3.webp" />
          <img
            className="hero-rf-img"
            src="/images/banners/rf-hero-desktop-v2.jpg"
            alt={t("Route Facile Morocco Car Rental")}
            fetchpriority="high"
            decoding="async"
          />
        </picture>

        {/* Headline overlaid top-left */}
        <Container className="hero-rf-headline-wrap">
          <div className="hero-rf-headline">
            <h1 className="hero-rf-title">
              {t("Rent a Car")}<br />
              {t("in")} <span className="text-orange">{t("Morocco")}</span>
            </h1>
            <p className="hero-rf-subtitle">
              {/* Insurance claims removed at the client's instruction — the
                  cover level and excess were never stated, so promising "Full
                  Insurance" was a dispute waiting to happen. */}
              {t("No Deposit. Unlimited Mileage.")}<br />
              {t("Free Airport Delivery.")}
            </p>
            <span className="hero-rf-divider"></span>
          </div>
        </Container>

      </div>

      {/* Booking card — overlaps the bottom of the banner */}
      <Container className="hero-rf-card-wrap" innerRef={searchCardRef}>
        <div className="hero-rf-card">
          <FindCarForm2 citiesArray={citiesArray} simple />
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;