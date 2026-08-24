import React, { useEffect } from "react";
import FindCarForm2 from "./FindCarForm2";
import CommonSection from "./CommonSection";
import "../../styles/corporate.css";
import { Col, Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import configWeb from "../../config.js/configWeb";
import carlogo from "../../assets/new-logo/Car Rental Platform Logos/logo-1009_191.png";

import { useTranslation } from "react-i18next";


import MetaHelmet from "../Helmet/MetaHelmet";
import EnquireNowButton from "../../SharedComponent/EnquireNowButton/EnquireNowButton";
import carLeasingBanner from "../../assets/all-images/banners/car leasing.png";

// Static SEO + content defaults; this page does not depend on a CMS backend.
//
// It previously sold the PLATFORM rather than the service: a "live demo of the
// Fleet & Leasing module" aimed at rental operators in the UAE, Saudi Arabia,
// Oman, Kuwait, Qatar and Egypt, ending in "Request a Demo". That is the
// software vendor's marketing, and it was sitting on the customer-facing site
// of a Moroccan car rental company, in the sitemap and indexable. Rewritten to
// describe the long-term and corporate rental Route Facile actually offers.
const PAGE_SEO = {
  title: "Corporate & Long-Term Car Leasing in Morocco | Route Facile",
  description: "Long-term and corporate car rental in Morocco from one month upward. Lower monthly rates, unlimited mileage, servicing handled by us and delivery to your office in Casablanca, Marrakech, Rabat and Tangier.",
  keywords: "corporate car leasing morocco, long term car rental morocco, monthly car rental casablanca, company car rental morocco, fleet rental marrakech, location longue duree maroc",
};

const LeasingCorporatePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);

  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: PAGE_SEO.title,
      description: PAGE_SEO.description,
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

  return (
    <>
      <MetaHelmet
        title={PAGE_SEO.title}
        description={PAGE_SEO.description}
        keywords={PAGE_SEO.keywords}
        ogTitle={PAGE_SEO.title}
        ogDescription={PAGE_SEO.description}
        ogUrl={window.location.href}
        twitterCard="summary_large_image"
        // Was hardcoded to /en/fleet-leasing, so the French and Arabic versions
        // of this page both told Google the English one was canonical — asking
        // for two of the three to be dropped from the index.
        canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/fleet-leasing`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />

      <CommonSection title="" backgroundImage={carLeasingBanner} />

      <Container className="py-5 corporate-static-body">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <span className="badge bg-primary-subtle text-primary px-3 py-2 mb-3">
                {t("Corporate & Long-Term Car Rental")}
              </span>
              <h1 className="fw-bold mb-3" style={{ fontSize: "2.25rem" }}>
                {t("Long-Term Car Rental for Companies and Residents in Morocco")}
              </h1>
              <p className="text-muted mx-auto" style={{ maxWidth: 820 }}>
                {t("For staff cars, project postings and extended stays, a long-term rental costs far less per day than repeated short bookings and takes the running of the vehicle off your hands. We deliver to your office or address anywhere we operate, handle servicing throughout, and can invoice monthly for company accounts.")}
              </p>
              <div className="mt-3">
                <EnquireNowButton buttonText={t("Request a Quote")} link={`/${language}/contact`} />
              </div>
            </div>

            <Row className="g-4 mb-5">
              {[
                { icon: "fa-handshake", title: t("From One Month Upward"), desc: t("Rentals start at one month and extend as long as you need. The daily rate falls the longer the booking runs, and extending is straightforward \u2014 just tell us before the return date.") },
                { icon: "fa-file-invoice-dollar", title: t("Monthly Invoicing"), desc: t("Company accounts can be invoiced monthly rather than per booking, so the vehicle appears once on your accounts each month instead of as a series of separate rentals.") },
                { icon: "fa-car-side", title: t("Servicing Included"), desc: t("Routine servicing and maintenance during your rental are handled by us at no extra cost. If a vehicle needs to go in, we arrange it around your schedule.") },
                { icon: "fa-people-roof", title: t("Delivery and Collection"), desc: t("We deliver the car to your office, your home or the airport, and collect it the same way at the end. Tell us the address and the time when you book.") },
                { icon: "fa-chart-line", title: t("Unlimited Mileage"), desc: t("Every rental includes unlimited mileage, so distance costs you nothing extra \u2014 which matters when staff travel between Casablanca, Marrakech and Tangier.") },
                { icon: "fa-globe", title: t("Across Morocco"), desc: t("Casablanca, Marrakech, Rabat, Tangier, Agadir, Fes, Tetouan and Ouarzazate, with airport delivery at each.") },
              ].map((f, i) => (
                <Col md={6} lg={4} key={i}>
                  <div className="h-100 p-4 border rounded-3 bg-white shadow-sm">
                    <div className="mb-3 text-primary fs-3">
                      <i className={`fa-solid ${f.icon}`} />
                    </div>
                    <h5 className="fw-bold">{f.title}</h5>
                    <p className="text-muted mb-0">{f.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>

            <div className="p-4 p-md-5 rounded-3 bg-light mb-5">
              <h2 className="fw-bold mb-3" style={{ fontSize: "1.5rem" }}>
                {t("Who long-term rental suits")}
              </h2>
              <ul className="text-muted mb-0" style={{ lineHeight: "1.9" }}>
                <li>{t("Companies needing staff or project vehicles without buying and maintaining a fleet.")}</li>
                <li>{t("Teams on assignment in Morocco for a season, a project or a posting.")}</li>
                <li>{t("Remote workers and long-stay visitors spending several months in Marrakech, Essaouira or Agadir.")}</li>
                <li>{t("Residents between cars, or anyone who needs a vehicle for months rather than days.")}</li>
              </ul>
            </div>

            <div className="text-center">
              <h2 className="fw-bold mb-3" style={{ fontSize: "1.5rem" }}>
                {t("Need a vehicle for a month or longer?")}
              </h2>
              <p className="text-muted mb-4">
                {t("Send us your dates, the city and how many vehicles you need, and we will quote for the exact requirement. For several vehicles or more than one city, write to info@routefacilecarrental.com.")}
              </p>
              <EnquireNowButton buttonText={t("Contact Us")} link={`/${language}/contact`} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LeasingCorporatePage;
