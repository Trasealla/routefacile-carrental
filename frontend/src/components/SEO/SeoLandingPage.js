import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Accordion } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";
import SchemaMarkup from "../SchemaMarkup/SchemaMarkup";
import InternalLinksSection from "./InternalLinksSection";
import SEO_PAGES from "./seoPageData";
import SEO_SLUGS_FOR_CHECK from "./seoSlugs";
import { localizeSeoPage } from "./seoPageLocalize";
import SEO_CONTENT_FR from "./seoPageContent.fr";
import SEO_CONTENT_AR from "./seoPageContent.ar";
import NotFound from "../../pages/NotFound";
import "./SeoLandingPage.css";

// ─────────────────────────────────────────────────────────────────────────────
// SeoLandingPage
//
// Dynamically renders any SEO landing page based on the :seoSlug param.
// Used by the router at /:lang/seo/:seoSlug
//
// Also exported with a static `slug` prop for pages mounted at fixed paths.
// ─────────────────────────────────────────────────────────────────────────────

// Development-only guard: the router builds its routes from seoSlugs.js while
// the copy lives here. If someone adds a page to one and not the other, the
// route either does not exist or renders empty — this surfaces that immediately
// instead of at a 404 in production. Stripped from production builds.
if (process.env.NODE_ENV !== "production") {
  const declared = new Set(SEO_SLUGS_FOR_CHECK);
  const defined = new Set(SEO_PAGES.map((p) => p.slug));
  const missingRoute = [...defined].filter((s) => !declared.has(s));
  const missingData = [...declared].filter((s) => !defined.has(s));
  if (missingRoute.length || missingData.length) {
    // eslint-disable-next-line no-console
    console.error(
      "[seo] seoSlugs.js and seoPageData.js are out of sync.",
      missingRoute.length ? `No route for: ${missingRoute.join(", ")}.` : "",
      missingData.length ? `No content for: ${missingData.join(", ")}.` : ""
    );
  }
}

const SeoLandingPage = ({ staticSlug }) => {
  const { seoSlug } = useParams();
  const slug = staticSlug || seoSlug;
  const language = useSelector((state) => state.language.language);
  // Only "ar" and "en" were ever mapped here, so the CTA below sent a French
  // visitor to /en/cars and dropped them out of their language mid-journey.
  const lang = ["en", "fr", "ar"].includes(language) ? language : "en";
  const { t } = useTranslation();

  const englishPage = SEO_PAGES.find((p) => p.slug === slug);

  // Redirect to 404 if slug not found
  if (!englishPage) {
    return <NotFound />;
  }

  // These pages used to render their English copy in every language, so /fr and
  // /ar served English under a translated <title> — and in Arabic the RTL
  // direction threw each sentence's full stop to the head of the line. The packs
  // supply real French and Arabic; anything they do not cover still falls back
  // to English rather than rendering blank.
  const PACKS = { fr: SEO_CONTENT_FR, ar: SEO_CONTENT_AR };
  const pageData = localizeSeoPage(englishPage, language, PACKS[language]);

  const {
    metaTitle,
    metaDesc,
    metaKeywords,
    h1,
    h2Intro,
    sections = [],
    faq = [],
    breadcrumbs = [],
    canonicalUrl,
  } = pageData;

  // Build localised breadcrumb text links
  const breadcrumbTrail =
    breadcrumbs.length > 0 ? (
      <nav aria-label="Breadcrumb" className="seo-breadcrumb">
        <ol>
          {breadcrumbs.map((crumb, i) => (
            <li key={i}>
              {i < breadcrumbs.length - 1 ? (
                <>
                  <Link to={crumb.url.replace("https://routefacilecarrental.com", "")}>
                    {crumb.name}
                  </Link>
                  <span aria-hidden="true"> › </span>
                </>
              ) : (
                <span aria-current="page">{crumb.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    ) : null;

  return (
    <>
      {/* ── Meta + Schema ─────────────────────────────── */}
      <MetaHelmet
        title={metaTitle}
        description={metaDesc}
        keywords={metaKeywords}
        canonicalUrl={canonicalUrl}
        ogTitle={metaTitle}
        ogDescription={metaDesc}
        ogUrl={canonicalUrl}
      />
      <SchemaMarkup
        schemas={["localBusiness", "faq", "breadcrumb"]}
        faq={faq}
        breadcrumbs={breadcrumbs}
      />

      {/* ── Hero / Banner ─────────────────────────────── */}
      <section className="seo-hero">
        <Container>
          {breadcrumbTrail}
          <h1 className="seo-hero__h1">{h1}</h1>
          <p className="seo-hero__intro">{h2Intro}</p>
          <Link
            to={`/${lang}/cars`}
            className="btn btn-primary seo-hero__cta"
          >
            {t("View Available Cars")}
          </Link>
        </Container>
      </section>

      {/* ── Content Sections ──────────────────────────── */}
      {sections.length > 0 && (
        <section className="seo-content-section">
          <Container>
            <Row>
              {sections.map((sec, i) => (
                <Col key={i} lg={sections.length === 1 ? 12 : 6} className="mb-5">
                  <h2 className="seo-content-section__h2">{sec.heading}</h2>
                  <p className="seo-content-section__body">{sec.body}</p>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* ── FAQ Accordion ─────────────────────────────── */}
      {faq.length > 0 && (
        <section className="seo-faq-section">
          <Container>
            <h2 className="seo-faq-section__heading">
              {t("Frequently Asked Questions")}
            </h2>
            <Accordion>
              {faq.map((item, i) => (
                <Accordion.Item eventKey={String(i)} key={i}>
                  <Accordion.Header>{item.question}</Accordion.Header>
                  <Accordion.Body>{item.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Container>
        </section>
      )}

      {/* ── Explore More Links ────────────────────────── */}
      <section className="seo-explore-section">
        <Container>
          <h2 className="seo-explore-section__heading">
            {t("Explore More Car Rental Options")}
          </h2>
        </Container>
        <InternalLinksSection />
      </section>
    </>
  );
};

export default SeoLandingPage;
