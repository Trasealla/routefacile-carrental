import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "./InternalLinksSection.css";

// ─────────────────────────────────────────────────────────────────────────────
// Default link groups — shown site-wide unless overridden via props
// All links use /:lang/ prefix so they work in both en/ and ae/ routes
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_GROUPS = [
  {
    heading: "Rent a Car by City",
    links: [
      { label: "Rent a Car Casablanca",  to: "/en/location" },
      { label: "Rent a Car Marrakech",   to: "/en/location" },
      { label: "Rent a Car Tangier",     to: "/en/location" },
      { label: "Rent a Car Rabat",       to: "/en/location" },
      { label: "Rent a Car Agadir",      to: "/en/location" },
      { label: "Rent a Car Fes",         to: "/en/location" },
      { label: "Rent a Car Ouarzazate",  to: "/en/location" },
    ],
  },
  {
    heading: "Rent a Car by Category",
    links: [
      { label: "SUV Rental Morocco",         to: "/en/ourfleetlist" },
      { label: "Luxury Car Rental Morocco",  to: "/en/ourfleetlist" },
      { label: "Economy Car Rental Morocco", to: "/en/ourfleetlist" },
      { label: "Monthly Car Rental Morocco", to: "/en/ourfleetlist" },
      { label: "Long Term Car Rental",       to: "/en/fleet-leasing" },
      { label: "Airport Car Rental Morocco", to: "/en/location" },
      { label: "7-Seater Rental Morocco",    to: "/en/ourfleetlist" },
    ],
  },
  {
    heading: "Popular Locations",
    links: [
      { label: "Casablanca Airport Car Rental", to: "/en/location" },
      { label: "Marrakech Menara Car Rental",   to: "/en/location" },
      { label: "Tangier Airport Car Rental",    to: "/en/location" },
      { label: "Rabat-Salé Car Rental",         to: "/en/location" },
      { label: "Agadir Al Massira Car Rental",  to: "/en/location" },
      { label: "Fes-Saïss Car Rental",          to: "/en/location" },
      { label: "Ouarzazate Car Rental",         to: "/en/location" },
    ],
  },
  {
    heading: "Our Services",
    links: [
      { label: "Corporate Car Leasing",    to: "/en/corporate-leasing" },
      { label: "Chauffeur Services",       to: "/en/chauffeur-services" },
      { label: "Commercial Vehicles",      to: "/en/commercialvehicles" },
      { label: "Special Offers",           to: "/en/offerspage" },
      { label: "Our Fleet",                to: "/en/ourfleetlist" },
      { label: "Car Rental FAQ",           to: "/en/faq" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   groups   — override the default link groups array
//              Each group: { heading: string, links: [{ label, to }] }
//   compact  — if true, renders a single-row strip instead of full section
// ─────────────────────────────────────────────────────────────────────────────
const InternalLinksSection = ({ groups, compact = false }) => {
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const lang = language === "ar" ? "ar" : "en";
  const linkGroups = groups || DEFAULT_GROUPS;

  // Swap /en/ prefix with current language prefix
  const localise = (path) => path.replace(/^\/en\//, `/${lang}/`);

  if (compact) {
    return (
      <div className="internal-links-strip">
        <Container>
          <ul className="internal-links-strip__list">
            {linkGroups.flatMap((g) =>
              g.links.map((link) => (
                <li key={link.to}>
                  <Link to={localise(link.to)}>{t(link.label)}</Link>
                </li>
              ))
            )}
          </ul>
        </Container>
      </div>
    );
  }

  return (
    <section className="internal-links-section" aria-label="Related pages">
      <Container>
        <Row>
          {linkGroups.map((group, gi) => (
            <Col key={gi} lg={3} md={6} sm={6} xs={12} className="mb-4">
              <h3 className="internal-links-section__heading">
                {t(group.heading)}
              </h3>
              <ul className="internal-links-section__list">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={localise(link.to)}>{t(link.label)}</Link>
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default InternalLinksSection;
