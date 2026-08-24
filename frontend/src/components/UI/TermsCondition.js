import React, { useEffect, useState, useCallback } from "react";
import carlogo from "../../assets/new-logo/logo.png";
import "../../styles/termsCondition.css";
import { useSelector } from "react-redux";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, getApiLang } from "../../config.js/SetUp";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";
import { Link } from "react-router-dom";
import TermsConditionContent from "./TermsConditionContent";

// Strip all inline style/class attributes from CMS HTML to ensure consistent fonts

const TermsCondition = () => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const [corporateLeasing, setCorporateLeasing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getCorporateLeasing = () => {
    const url = `${configWeb.GET_PRIVACY_POLICY("terms_and_conditions")}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCorporateLeasing(res || []);
        }
      })
      .catch((error) => {
        console.log("Terms & Conditions API failed-->", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCorporateLeasing();
  }, [language]);

  // Scroll progress + back-to-top visibility
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setScrollProgress(progress);
    setShowBackToTop(scrollTop > 400);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // The CMS body is no longer rendered here, so the sanitiser and the
  // style-stripping pass that went with it are gone too. That pass walked the
  // container and removed every class attribute — harmless on pasted CMS HTML,
  // but it would have stripped the styling off the component we now render.

  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: corporateLeasing?.title,
      description: corporateLeasing?.seo_meta_description,
      image: corporateLeasing?.image,
      author: {
        "@type": "Organization",
        name: "Route Facile",
      },
      publisher: {
        "@type": "Organization",
        name: "Route Facile",
        logo: {
          "@type": "ImageObject",
          url: carlogo,
        },
      },
      datePublished: "2024-10-11",
      dateModified: "2024-10-12",
    };
  };

  if (loading) {
    return (
      <div className="tc-loading">
        <div className="tc-loading-spinner" />
        <span className="tc-loading-text">{t("Loading")}...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Scroll Progress Bar */}
      <div
        className="tc-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <MetaHelmet
        title={corporateLeasing?.title}
        description={corporateLeasing?.seo_description}
        keywords={
          corporateLeasing?.seo_meta_tags ||
          "car rental, affordable cars, rent a car"
        }
        ogTitle={corporateLeasing?.title}
        ogDescription={corporateLeasing?.seo_meta_description}
        ogImage={corporateLeasing?.image}
        ogUrl={window.location.href}
        twitterTitle={corporateLeasing?.title}
        twitterDescription={corporateLeasing?.seo_meta_description}
        twitterImage={corporateLeasing?.image}
        twitterCard="summary_large_image"
        canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/termscondition`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />

      {/* Hero Section */}
      <section className="tc-hero">
        <div className="tc-hero-shapes">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="tc-hero-content">
          <div className="tc-hero-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
            {t("Legal")}
          </div>
          <h1 className="tc-hero-title">{t("Terms & Conditions")}</h1>
          <p className="tc-hero-subtitle">
            {t(
              "Please review our rental terms carefully before making a reservation"
            )}
          </p>
          <nav className="tc-breadcrumb">
            <Link to={`/${language === "ar" ? "ar" : "en"}`}>{t("Home")}</Link>
            <span className="tc-breadcrumb-separator">&#9654;</span>
            <span className="tc-breadcrumb-current">
              {t("Terms & Conditions")}
            </span>
          </nav>
        </div>
      </section>

      {/* Content */}
      <div className="tc-main">
        <div className="tc-content-wrapper">
          <div className="tc-content-card">
            <div className="tc-last-updated">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("Last updated")}: {corporateLeasing?.updated_at
                ? new Date(corporateLeasing.updated_at).toLocaleDateString(
                    language === "ar" ? "ar-AE" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )
                : t("Recently")}
            </div>

            {/* Always the built-in component, never the CMS body.
                The CMS `pages` table only has English and Arabic columns, so a
                French visitor was served the English terms — and the terms are
                a legal document that has to match the language the customer
                booked in. TermsConditionContent is fully translated in all
                three languages, so it is the source of truth. The CMS record is
                still used for the page title and SEO fields above. */}
            <div className="tc-dynamic-content">
              <TermsConditionContent t={t} />
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button
        className={`tc-back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
};

export default TermsCondition;
