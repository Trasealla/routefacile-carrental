import React, { useRef, useCallback, useEffect, useState, lazy, Suspense, memo } from "react";
import { Nav } from "react-bootstrap";
import "../../styles/location.css";
import configWeb from "../../config.js/configWeb";
import { useSelector } from "react-redux";
import { simpleGetCall, getApiLang } from "../../config.js/SetUp";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";
import { useSearchParams } from "react-router-dom";
import locationsBanner from "../../assets/all-images/banners/our-locations.png";
import {
  PHONE_PRIMARY,
  PHONE_PRIMARY_DISPLAY,
  PHONE_SECONDARY,
  PHONE_SECONDARY_DISPLAY,
  whatsappUrl,
} from "../../config.js/contact";

// ── Lazy-load Leaflet map (saves ~140 KB from initial bundle) ──
const MapView = lazy(() => import("./MapView"));

// ── Static arrays allocated once, not on every render ──
const CITY_SKELETONS  = Array.from({ length: 5 });
const CARD_SKELETONS  = Array.from({ length: 6 });

// ── Memoised card: only re-renders when its own props change ──
const LocationCard = memo(({ location, idx, isActive, onCardClick, onLinkClick, t }) => {
  return (
    <div
      className={`loc-card${isActive ? " loc-card--active" : ""}`}
      onClick={() => onCardClick(location.id)}
    >
      <span className="loc-card-num">{String(idx + 1).padStart(2, "0")}</span>

      <div className="loc-card-body">
        <h5 className="loc-card-title">{location.name}</h5>

        {location.address && (
          <div className="loc-card-row">
            <i className="fas fa-map-marker-alt loc-icon" />
            <span>{location.address}</span>
          </div>
        )}
        {location.timing_detail && (
          <div className="loc-card-row">
            <i className="far fa-clock loc-icon" />
            <span>{location.timing_detail}</span>
          </div>
        )}
        {/* Deliberately no per-branch phone number: the locations table still
            holds placeholder numbers from the template. Every point of contact
            is the one line Route Facile actually answers on. */}
        <div className="loc-card-row">
          <i className="fas fa-phone loc-icon" />
          <a
            href={`tel:${PHONE_PRIMARY}`}
            className="loc-link"
            dir="ltr"
            onClick={onLinkClick}
          >
            {PHONE_PRIMARY_DISPLAY}
          </a>
        </div>
      </div>

      <div className="loc-card-actions">
        <a
          href={whatsappUrl(
            `Hello Route Facile! I would like information about car rental at ${location.name}.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="loc-btn loc-btn-whatsapp"
          onClick={onLinkClick}
        >
          <i className="fab fa-whatsapp" /> WhatsApp
        </a>
        {location.lat && location.long && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.long}`}
            target="_blank"
            rel="noopener noreferrer"
            className="loc-btn loc-btn-directions"
            onClick={onLinkClick}
          >
            <i className="fas fa-directions" /> {t("Get Directions")}
          </a>
        )}
      </div>
    </div>
  );
});

const Location = ({dont_display}) => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get("city");

  const [pickupLocationArray, setPickupLocationArray] = useState([]);
  const [citiesArray,         setCitiesArray]         = useState([]);
  const [citiesLoading,       setCitiesLoading]       = useState(true);
  const [locationsLoading,    setLocationsLoading]    = useState(true);
  const [city_id,             set_city_id]            = useState(null);
  const [initialCitySet,      setInitialCitySet]      = useState(false);
  const [activeLocationId,    setActiveLocationId]    = useState(null);
  const cardRefs     = useRef({});
  const cityIdRef    = useRef(city_id);      // stable ref so callbacks don't go stale
  const hasMounted   = useRef(false);        // prevent double-fetch on city_id mount
  cityIdRef.current  = city_id;

  // ── Stable API fetchers (useCallback so effects don't re-run) ──
  const fetchLocations = useCallback((lang, cid) => {
    const base = `${configWeb.GET_PICKUP_LOCATION("pickup", getApiLang(lang))}`;
    const url  = cid ? `${base}&city_id=${cid}` : base;
    setLocationsLoading(true);
    simpleGetCall(url)
      .then((res) => { if (!res?.error) setPickupLocationArray(res.filter((l) => !l.is_virtual)); })
      .catch((err) => console.error("Locations fetch failed:", err))
      .finally(()  => setLocationsLoading(false));
  }, []);

  const fetchCities = useCallback((lang) => {
    setCitiesLoading(true);
    // getApiLang, not the raw code: this endpoint only accepts "en"|"ae", so
    // "ar" came back 400 and the city tabs silently stayed English on the
    // Arabic page. (The locations call next to it already mapped correctly.)
    simpleGetCall(`${configWeb.GET_CITIES}?lang=${getApiLang(lang)}`)
      .then((res) => { if (!res?.error) setCitiesArray(res); })
      .catch(() => {})
      .finally(() => setCitiesLoading(false));
  }, []);

  // ── Fire both API calls in parallel on language change ──
  useEffect(() => {
    fetchCities(language);
    fetchLocations(language, cityIdRef.current);
  }, [language, fetchCities, fetchLocations]);

  // ── Re-fetch locations when city filter changes (skip initial mount) ──
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    fetchLocations(language, city_id);
  }, [city_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-select city from URL ?city= param ──
  useEffect(() => {
    if (cityParam && citiesArray.length > 0 && !initialCitySet) {
      const match = citiesArray.find(
        (c) => c.name?.toLowerCase() === cityParam.toLowerCase()
      );
      if (match) { set_city_id(match.id); setInitialCitySet(true); }
    }
  }, [cityParam, citiesArray, initialCitySet]);

  // ── Stable event handlers ──
  const stopProp = useCallback((e) => e.stopPropagation(), []);

  const handleCardClick = useCallback((id) => {
    setActiveLocationId((prev) => (prev === id ? null : id));
  }, []);

  const handleMarkerClick = useCallback((id) => {
    setActiveLocationId(id);
    setTimeout(() => {
      cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }, []);

  const handleNavClick = useCallback((id) => {
    set_city_id(id);
    setActiveLocationId(null);
  }, []);

  return (
    <div className="locations-page-wrapper">
      <MetaHelmet
        title={t("locations_meta_title")}
        description={t("locations_meta_description")}
        keywords={t("locations_meta_keywords")}
        canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/location`}
        hreflangs={[
          { hreflang: "en", href: `${configWeb.BASE_WEB_URL}/en/location` },
          { hreflang: "ar", href: `${configWeb.BASE_WEB_URL}/ar/location` },
          { hreflang: "fr", href: `${configWeb.BASE_WEB_URL}/fr/location` },
          { hreflang: "x-default", href: `${configWeb.BASE_WEB_URL}/en/location` },
        ]}
      />

      {/* Banner — high priority so it doesn't block LCP */}
      {dont_display === "yes" ? null : (
        <img
          src={locationsBanner}
          alt={t("Our Locations")}
          className="locations-banner-img"
          fetchpriority="high"
          decoding="async"
        />
      )}

      <section className="offer__section">
        <div className="loc-container">
          {/* The page opened straight into the city tabs, so it shipped with no
              H1 at all — the one heading a crawler reads first to work out what
              the page is about. */}
          <h1 className="text-black bold text-center mb-3 title-custom pt-2 py-2">
            {t("locations_h1")}
          </h1>

          {/* City filter tabs */}
          <div className="loc-tabs-bar">
            <Nav
              variant="pills"
              activeKey={city_id ? `link-${city_id}` : "link-0"}
              className="nav-custom nav-pills"
            >
              <Nav.Item>
                <Nav.Link eventKey="link-0" onClick={() => handleNavClick(0)}>
                  {t("All Morocco")}
                </Nav.Link>
              </Nav.Item>
              {citiesLoading
                ? CITY_SKELETONS.map((_, i) => (
                    <Nav.Item key={`skeleton-${i}`}>
                      <div className="city-tab-skeleton" />
                    </Nav.Item>
                  ))
                : citiesArray?.map((city) => (
                    <Nav.Item key={city.id}>
                      <Nav.Link
                        eventKey={`link-${city.id}`}
                        onClick={() => handleNavClick(city.id)}
                      >
                        {city.name || city.name_en || city.name_ar || city.name_fr || city.city_name || city.title}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
            </Nav>
          </div>

          {/* Split panel */}
          <div className="loc-split">
            {/* ── LEFT: scrollable card list ── */}
            <div className="loc-list-panel">
              <div className="loc-panel-header">
                <span className="loc-panel-eyebrow">
                  <i className="fas fa-map-marked-alt" /> {t("Find us on the map")}
                </span>
                <h3 className="loc-panel-title">
                  {t("Delivery locations across Morocco")}
                </h3>
                <p className="loc-panel-sub">
                  {t("We are based in Marrakech and deliver your car to airports, city centres and hotels across Morocco. Tap any pin for the pick-up point, opening hours and directions.")}
                </p>
                {/* Counting pins as "branches" overstated the operation — these
                    are delivery and pick-up points, and the honest figure is the
                    number of cities served. */}
                <div className="loc-panel-stats">
                  <div className="loc-stat">
                    <span className="loc-stat-value">{citiesArray?.length || 0}</span>
                    <span className="loc-stat-label">{t("Cities Served")}</span>
                  </div>
                  <div className="loc-stat">
                    <span className="loc-stat-value">24/7</span>
                    <span className="loc-stat-label">{t("Support")}</span>
                  </div>
                </div>
                <p className="loc-panel-contact">
                  <a href={`tel:${PHONE_PRIMARY}`} dir="ltr">{PHONE_PRIMARY_DISPLAY}</a>
                  {" · "}
                  <a href={`tel:${PHONE_SECONDARY}`} dir="ltr">{PHONE_SECONDARY_DISPLAY}</a>
                </p>
              </div>

              <div className="loc-cards-scroll">
                {locationsLoading
                  ? CARD_SKELETONS.map((_, i) => (
                      <div className="location-card-skeleton" key={`sk-${i}`} />
                    ))
                  : pickupLocationArray?.length > 0
                  ? pickupLocationArray.map((location, idx) => (
                      <div
                        key={location.id}
                        ref={(el) => (cardRefs.current[location.id] = el)}
                      >
                        <LocationCard
                          location={location}
                          idx={idx}
                          isActive={activeLocationId === location.id}
                          onCardClick={handleCardClick}
                          onLinkClick={stopProp}
                          t={t}
                        />
                      </div>
                    ))
                  : (
                    <div className="loc-empty-state">
                      <i className="fas fa-map-marker-alt" />
                      <p>{t("No locations found for this city")}</p>
                    </div>
                  )}
              </div>
            </div>

            {/* ── RIGHT: sticky map — loaded lazily ── */}
            <div className="loc-map-panel">
              <Suspense fallback={<div className="loc-map-loading" />}>
                <MapView
                  locations={pickupLocationArray}
                  activeLocationId={activeLocationId}
                  onMarkerClick={handleMarkerClick}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

};

export default Location;
