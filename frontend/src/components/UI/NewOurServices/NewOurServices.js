import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import contactBanner from "../../../assets/all-images/banners/contact-us-header-banner.png";
import MetaHelmet from "../../Helmet/MetaHelmet";
import configWeb from "../../../config.js/configWeb";
import "./newOurServices.css";

// Only services Route Facile actually provides.
//
// Removed: Staff Transportation, School Transportation, Commercial Vehicle
// Leasing, Electric Car Rentals and Chauffeur Services. The bookable fleet is
// eleven passenger cars — petrol, diesel and hybrid, nothing electric, nothing
// above five seats and no vans — so none of those could be delivered, and three
// of them linked to /commercialvehicles and /chauffeur-module, which are not
// routes in this app. Add any of them back once the fleet and the pages exist.
const SERVICES = [
  {
    icon: "fa-solid fa-calendar-days",
    titleKey: "Daily & Weekly Rentals",
    descKey: "dailyDesc",
    color: "#F2421B",
    link: "ourfleetlist",
  },
  {
    icon: "fa-solid fa-rotate",
    titleKey: "Monthly Subscriptions",
    descKey: "monthlyDesc",
    color: "#0D4FA0",
    link: "ourfleetlist",
  },
  {
    icon: "fa-solid fa-briefcase",
    titleKey: "Corporate Leasing",
    descKey: "corporateDesc",
    color: "#0D7A55",
    link: "fleet-leasing",
  },
  {
    icon: "fa-solid fa-plane-arrival",
    titleKey: "Airport Pick-up & Delivery",
    descKey: "airportDesc",
    color: "#7C3AED",
    link: "location",
  },
];

// Every figure here has to be one we can point at. "500+ Vehicles Available"
// and "5★ Rated by Customers" were neither — the fleet is a fraction of that and
// the rating was not tied to any profile. Cities and pick-up points are counted
// from the locations table; unlimited mileage is on every rental we sell.
const STATS = [
  { value: "8", labelKey: "Cities Covered" },
  { value: "16", labelKey: "Pick-up Points" },
  { value: "24/7", labelKey: "Customer Support" },
  { value: "∞", labelKey: "Unlimited Mileage" },
];

const NewOurServices = () => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const isRTL = language === "ar";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const descMap = {
    dailyDesc: t("Flexible day-by-day or week-by-week rentals. Pick up in any city, drive unlimited kilometres, return when you're done."),
    monthlyDesc: t("All-inclusive monthly plans with free delivery, full insurance and no hidden costs. Perfect for expats and long stays."),
    corporateDesc: t("Tailored fleet solutions for businesses of all sizes. Dedicated account manager, custom pricing and priority service."),
    staffDesc: t("Reliable bus and van hire for employee commutes and site transfers. Scheduled routes or on-demand — we handle the logistics."),
    schoolDesc: t("Safe, GPS-tracked school bus operations with trained drivers, guardian notifications and full compliance."),
    commercialDesc: t("Trucks, vans and pickups for your supply chain. Short or long-term contracts with maintenance included."),
    electricDesc: t("Drive the future. Our growing EV fleet offers zero-emission mobility with free charging at select locations."),
    chauffeurDesc: t("Professional chauffeur service for airport transfers, VIP events and executive travel. Available 24/7."),
  };

  return (
    <div className="nos-page" dir={isRTL ? "rtl" : "ltr"}>
      <MetaHelmet
        title={language === "ar" ? "خدماتنا — روت فاسيل" : language === "fr" ? "Nos Services — Route Facile" : "Our Services — Route Facile Car Rental Morocco"}
        description={language === "ar"
          ? "اكتشف خدمات تأجير السيارات من روت فاسيل في المغرب — إيجار يومي، شهري، تأجير الشركات، الحافلات، السيارات الكهربائية وخدمات السائق الخاص."
          : "Explore Route Facile's full range of car rental services in Morocco — daily, monthly, corporate leasing, staff transport, EV rentals and chauffeur services."}
        keywords="car rental Morocco, corporate leasing Morocco, monthly car rental, chauffeur service Morocco, Route Facile"
        canonicalUrl={`https://routefacilecarrental.com/${language}/our-services`}
        hreflangs={[
          { hreflang: "en", href: `${configWeb.BASE_WEB_URL}/en/our-services` },
          { hreflang: "ar", href: `${configWeb.BASE_WEB_URL}/ar/our-services` },
          { hreflang: "fr", href: `${configWeb.BASE_WEB_URL}/fr/our-services` },
        ]}
      />
      <Helmet>
        <link rel="preload" as="image" href={contactBanner} />
      </Helmet>

      {/* ── Hero banner (same as Contact) ── */}
      <div className="nos-hero" style={{ backgroundImage: `url(${contactBanner})` }}>
        <div className="nos-hero-inner">
          <div className="nos-hero-badge">
            <i className="fa-solid fa-stars" />
            {t("What We Offer")}
          </div>
          <h1>{t("Our")} <span>{t("Services")}</span></h1>
          <p>{t("Premium fleet. Free delivery. Every solution — under one roof.")}</p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="nos-stats-strip">
        <Container>
          <div className="nos-stats-grid">
            {STATS.map((s, i) => (
              <div className="nos-stat" key={i}>
                <span className="nos-stat-value">{s.value}</span>
                <span className="nos-stat-label">{t(s.labelKey)}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ── Section intro ── */}
      <section className="nos-section">
        <Container>
          <div className="nos-intro">
            <span className="nos-eyebrow">{t("Everything you need")}</span>
            <h2>{t("One company.")} <span>{t("Every solution.")}</span></h2>
            <p>{t("From a single day trip to a multi-year corporate fleet — Route Facile has a service built for you. Available in 8 cities across Morocco with free delivery to your door or the airport.")}</p>
          </div>

          {/* ── Service cards grid ── */}
          <div className="nos-grid">
            {SERVICES.map((svc, i) => (
              <div className="nos-card" key={i}>
                <div className="nos-card-icon" style={{ "--svc-color": svc.color }}>
                  <i className={svc.icon} />
                </div>
                <div className="nos-card-body">
                  <h3 className="nos-card-title">{t(svc.titleKey)}</h3>
                  <p className="nos-card-desc">{descMap[svc.descKey]}</p>
                </div>
                <Link to={`/${language}/${svc.link}`} className="nos-card-link">
                  {t("Learn More")} <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            ))}
          </div>

          {/* ── CTA banner ── */}
          <div className="nos-cta-banner">
            <div className="nos-cta-text">
              <h3>{t("Not sure which plan fits you?")}</h3>
              <p>{t("Tell us your needs and we'll recommend the right solution within 2 hours.")}</p>
            </div>
            <div className="nos-cta-actions">
              <Link to={`/${language}/contact`} className="nos-cta-primary">
                <i className="fa-solid fa-paper-plane" /> {t("Get a Free Quote")}
              </Link>
              <a href="https://wa.me/212655585859" target="_blank" rel="noopener noreferrer" className="nos-cta-whatsapp">
                <i className="fab fa-whatsapp" /> {t("Chat on WhatsApp")}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default NewOurServices;
