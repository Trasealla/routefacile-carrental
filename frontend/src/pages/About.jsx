import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import carMoroccoImg from "../assets/all-images/about-us/3.png";
import "../styles/about-routefacile.css";
import { useSelector } from "react-redux";
import configWeb from "../config.js/configWeb";
import { simpleGetCall, getApiLang } from "../config.js/SetUp";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../components/Helmet/MetaHelmet";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const [corporateLeasing, setCorporateLeasing] = useState([]);
  const getCorporateLeasing = () => {
    const url = `${configWeb.GET_PRIVACY_POLICY(
      "about_company"
    )}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCorporateLeasing(res || []); // Ensure it"s always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {});
  };
  useEffect(() => {
    getCorporateLeasing();
  }, [language]);


  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": "https://routefacilecarrental.com/en/about",
      url: "https://routefacilecarrental.com/en/about",
      name: corporateLeasing?.title || "About Route Facile — Car Rental Morocco",
      description:
        corporateLeasing?.seo_meta_description ||
        "Route Facile est une société marocaine de location de voitures — véhicules récents, kilométrage illimité, réservation instantanée par WhatsApp.",
      publisher: {
        "@type": "Organization",
        "@id": "https://routefacilecarrental.com/#organization",
        name: "Route Facile",
        url: "https://routefacilecarrental.com",
        logo: {
          "@type": "ImageObject",
          url: "https://routefacilecarrental.com/images/logo-header.png",
          width: 689,
          height: 191,
        },
        email: "info@routefacilecarrental.com",
        telephone: "+212655585859",
        // Kept in step with SchemaMarkup.js — Marrakech, no street line until a
        // verified address matching the Google Business Profile exists.
        address: {
          "@type": "PostalAddress",
          addressLocality: "Marrakech",
          addressRegion: "Marrakech-Safi",
          addressCountry: "MA",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 31.629472,
          longitude: -7.981084,
        },
        areaServed: [
          { "@type": "City", name: "Marrakech" },
          { "@type": "City", name: "Casablanca" },
          { "@type": "City", name: "Rabat" },
          { "@type": "City", name: "Agadir" },
          { "@type": "City", name: "Tanger" },
          { "@type": "City", name: "Fès" },
        ],
      },
      datePublished: "2024-10-11",
      dateModified: "2026-07-14",
    };
  };
  const generateBreadcrumbsStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home Page Route Facile",
          "item": `${configWeb.BASE_WEB_URL}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name":"About Us | Route Facile",
          "item": window?.location.href,
        },
       
      ]
    };
  };
  return (
      <>
      {/* The page copy below comes from our own translations, and so does the
          meta. The CMS record for "about_company" still carries the previous
          owner's SEO text (a UAE-based car rental company blurb)
          and the placeholder title "About company"; reading seo_description from
          it put that straight into Google's snippet for this page. Only the CMS
          image is still used, since that is genuinely editable content. */}
      <MetaHelmet
        title={t("about_meta_title")}
        description={t("about_meta_description")}
        keywords={t("about_meta_keywords")}
        ogTitle={t("about_meta_title")}
        ogDescription={t("about_meta_description")}
        ogImage={corporateLeasing?.image || `${configWeb.BASE_WEB_URL}/images/hero-banner.webp`}
        ogUrl={`${configWeb.BASE_WEB_URL}/${language}/about`}
        twitterTitle={t("about_meta_title")}
        twitterDescription={t("about_meta_description")}
        twitterImage={corporateLeasing?.image || `${configWeb.BASE_WEB_URL}/images/hero-banner.webp`}
        twitterCard="summary_large_image"
        canonicalUrl={`/${language}/about`}
        hreflangs={[
          { hreflang: "en", href: `${configWeb.BASE_WEB_URL}/en/about` },
          { hreflang: "fr", href: `${configWeb.BASE_WEB_URL}/fr/about` },
          { hreflang: "ar", href: `${configWeb.BASE_WEB_URL}/ar/about` },
          { hreflang: "x-default", href: `${configWeb.BASE_WEB_URL}/en/about` },
        ]}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbsStructuredData())}
        </script>
      </Helmet>
      <section className="rf-about">
        {/* HERO / INTRO */}
        <div className="rf-about-hero">
          <div className="rf-about-inner">
            <span className="rf-about-eyebrow">Car Rental in Morocco</span>
            <h1>{t("Rent your car with")} <span>{t("peace of mind")}</span></h1>
            <p>
              {t(
                "Route Facile is a Moroccan car rental company built on trust, transparency and speed. Fast service, recent vehicles and instant confirmation via WhatsApp — so every journey across Morocco feels effortless."
              )}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="rf-about-stats">
          {/* "4.9/5 Average Rating" and "100+ Satisfied Customers" were not tied
              to any reviewable profile — the same invented figures that were in
              the page's schema. Replaced with facts that can be checked against
              the locations table and the terms of every rental we sell. */}
          <div className="rf-stat-card">
            <div className="rf-stat-icon"><i className="fa-solid fa-location-dot"></i></div>
            <div className="rf-stat-num">8</div>
            <div className="rf-stat-label">{t("Cities Covered")}</div>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-icon"><i className="fa-solid fa-road"></i></div>
            <div className="rf-stat-num">∞</div>
            <div className="rf-stat-label">{t("Unlimited Mileage")}</div>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-icon"><i className="fa-brands fa-whatsapp"></i></div>
            <div className="rf-stat-num">5–10 min</div>
            <div className="rf-stat-label">{t("WhatsApp Response")}</div>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-icon"><i className="fa-solid fa-car-side"></i></div>
            <div className="rf-stat-num">2026</div>
            <div className="rf-stat-label">{t("Recent Fleet Models")}</div>
          </div>
        </div>

        {/* STORY */}
        <div className="rf-about-section">
          <div className="rf-story-grid">
            <div className="rf-story-text">
              <div className="rf-section-tag">{t("Our Story")}</div>
              <h2 className="rf-section-title">{t("Making car rental")} <span>{t("simple & reliable")}</span></h2>
              <p className="rf-story-quote">
                “{t("Creating memorable car rental experiences, one drive at a time.")}”
              </p>
              <p>
                {t(
                  "Based in Marrakech, Route Facile is a licensed Moroccan vehicle rental company (loueur de véhicules automobiles sans chauffeur), delivering across Morocco. We make renting a car straightforward — no hidden fees, no complicated paperwork, and no credit card required to book."
                )}
              </p>
              <p>
                {t(
                  "From Marrakech to Casablanca, Rabat, Agadir and Tangier, we deliver recent, fully-insured vehicles wherever you need them. Booking is instant on WhatsApp, and our team is always one message away."
                )}
              </p>
            </div>
            <div className="rf-story-visual">
              <img src={carMoroccoImg} alt="Route Facile — VW Tiguan à Marrakech, Maroc" loading="lazy" width="600" height="400" style={{ width: '100%', height: 'auto', borderRadius: 16 }} />
              <div className="rf-story-badge">
                <div className="rf-sb-icon"><i className="fa-solid fa-shield-halved"></i></div>
                <div>
                  <strong>{t("Fully Insured")}</strong>
                  <span>{t("Every vehicle, every trip")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MISSION / VISION */}
        <div className="rf-mv-section">
          <div className="rf-about-section">
            <div className="rf-mv-grid">
              <div className="rf-mv-card mission">
                <div className="rf-mv-icon"><i className="fa-solid fa-bullseye"></i></div>
                <h3>{t("Our Mission")}</h3>
                <p>
                  {t(
                    "To win the heart of every customer by consistently providing high-quality, worry-free transport solutions — backed by recent vehicles, full insurance and fast, friendly support at every step."
                  )}
                </p>
              </div>
              <div className="rf-mv-card vision">
                <div className="rf-mv-icon"><i className="fa-solid fa-eye"></i></div>
                <h3>{t("Our Vision")}</h3>
                <p>
                  {t(
                    "To become Morocco's most loved and trusted car rental service — the effortless first choice for locals and travellers exploring the country."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WHY CHOOSE */}
        <div className="rf-about-section">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <div className="rf-section-tag">{t("Why Route Facile")}</div>
            <h2 className="rf-section-title">{t("Everything for a")} <span>{t("worry-free rental")}</span></h2>
          </div>
          <div className="rf-why-grid">
            <div className="rf-why-card">
              <div className="rf-why-icon"><i className="fa-solid fa-shield-halved"></i></div>
              <h4>{t("Full Insurance")}</h4>
              <p>{t("Full protection for your peace of mind on all our vehicles.")}</p>
            </div>
            <div className="rf-why-card">
              <div className="rf-why-icon"><i className="fa-solid fa-road"></i></div>
              <h4>{t("Unlimited Mileage")}</h4>
              <p>{t("Explore Morocco freely without worrying about kilometers.")}</p>
            </div>
            <div className="rf-why-card">
              <div className="rf-why-icon"><i className="fa-solid fa-car-side"></i></div>
              <h4>{t("Recent Vehicles")}</h4>
              <p>{t("A premium fleet regularly renewed with the latest models.")}</p>
            </div>
            <div className="rf-why-card">
              <div className="rf-why-icon"><i className="fa-brands fa-whatsapp"></i></div>
              <h4>{t("Available Support")}</h4>
              <p>{t("Fast assistance via WhatsApp to answer all your questions.")}</p>
            </div>
          </div>
        </div>

        {/* VALUES */}
        <div className="rf-values-section">
          <div className="rf-about-section">
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
              <div className="rf-section-tag">{t("What Drives Us")}</div>
              <h2 className="rf-section-title">{t("Our Values")}</h2>
            </div>
            <div className="rf-values-grid">
              <div className="rf-value-card">
                <div className="rf-vnum">01</div>
                <h4>{t("Transparency & Integrity")}</h4>
                <p>{t("No hidden fees, no surprises. We honour every commitment and do things the right way.")}</p>
              </div>
              <div className="rf-value-card">
                <div className="rf-vnum">02</div>
                <h4>{t("Top-notch Service")}</h4>
                <p>{t("A smooth experience on and off the road — we work hard to win the heart of every customer.")}</p>
              </div>
              <div className="rf-value-card">
                <div className="rf-vnum">03</div>
                <h4>{t("Quality First")}</h4>
                <p>{t("Recent, spotless and safety-checked vehicles maintained to the highest standards.")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LOCATIONS */}
        <div className="rf-about-section" style={{ paddingBottom: 0 }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
            <div className="rf-section-tag">{t("Check out our Locations")}</div>
            <h2 className="rf-section-title">
              {t("Discover our branches across the country")}{" "}
              <span>{t("Our Locations")}</span>
            </h2>
          </div>
        </div>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 80px" }}>
          <div className="locations locations-8-items locations-desktop" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {[
              { id: 1, name: "Casablanca", image: "/images/cities/casablanca-v2.webp", city: "Casablanca" },
              { id: 2, name: "Marrakech",  image: "/images/cities/Marrakech-v2.webp",  city: "Marrakech" },
              { id: 3, name: "Agadir",     image: "/images/cities/Agadir-v2.webp",     city: "Agadir" },
              { id: 4, name: "Fes",        image: "/images/cities/Fes-v2.webp",        city: "Fes" },
              { id: 5, name: "Rabat",      image: "/images/cities/rabat-v2.webp",      city: "Rabat" },
              { id: 6, name: "Tetouan",    image: "/images/cities/Tetouan-v2.webp",    city: "Tetouan" },
            ].map((loc) => (
              <div key={loc.id} className="locations-address img-hover" style={{ flex: '1 1 0', minWidth: 0 }}>
                <figure className="location-image-wrapper location-svg">
                  <img src={loc.image} alt={loc.name} loading="lazy" decoding="async" width="200" height="400" />
                </figure>
                <a href={`/${language}/location?city=${loc.city}`}>{t(loc.name)}</a>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rf-about-cta">
          <div className="rf-cta-inner">
            <h2>{t("Ready to hit the road?")}</h2>
            <p>{t("Book your car in minutes — instant confirmation on WhatsApp.")}</p>
            <div className="rf-cta-btns">
              <a className="rf-cta-btn primary" href={`/${language}/ourfleetlist`}>
                <i className="fa-solid fa-car"></i> {t("Browse Our Fleet")}
              </a>
              <a
                className="rf-cta-btn secondary"
                href="https://api.whatsapp.com/send/?phone=212655585859&text=Hello+Route+Facile%21+I+would+like+information+about+car+rental.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp"></i> {t("Book on WhatsApp")}
              </a>
            </div>
          </div>
        </div>
      </section>
      </>
  );
};

export default About;
