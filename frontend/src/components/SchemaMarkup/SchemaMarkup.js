import React from "react";
import { Helmet } from "react-helmet";

// ─────────────────────────────────────────────────────────────────────────────
// Default schema data for Route Facile
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": ["CarRental", "LocalBusiness"],
  name: "Route Facile",
  description:
    "Route Facile est une société marocaine de location de voitures — véhicules récents, kilométrage illimité. Réservation instantanée à Marrakech, Casablanca, Rabat, Agadir, Tanger et Fès.",
  url: "https://routefacilecarrental.com",
  logo: "https://routefacilecarrental.com/images/route-facile-logo.png",
  image: "https://routefacilecarrental.com/images/route-facile-fleet.jpg",
  telephone: "+212 655 585 859",
  email: "info@routefacilecarrental.com",
  priceRange: "$$",
  currenciesAccepted: "MAD",
  paymentAccepted: "Cash, Credit Card, Debit Card",
  openingHours: "Mo-Su 00:00-23:59",
  // Marrakech is where the business actually operates. Google penalises a
  // LocalBusiness address that does not match the Business Profile, so this must
  // stay in step with the Google listing — street line intentionally omitted
  // until there is a verified address to publish.
  address: {
    "@type": "PostalAddress",
    addressLocality: "Marrakech",
    addressRegion: "Marrakech-Safi",
    addressCountry: "MA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "31.629472",
    longitude: "-7.981084",
  },
  sameAs: [
    "https://www.facebook.com/routefacilecarrental",
    "https://www.instagram.com/routefacilecarrental/",
    "https://www.linkedin.com/company/routefacile",
    "https://twitter.com/routefacile",
  ],
  hasMap: "https://www.google.com/maps?q=31.629472,-7.981084",
  areaServed: [
    { "@type": "City", name: "Marrakech" },
    { "@type": "City", name: "Casablanca" },
    { "@type": "City", name: "Rabat" },
    { "@type": "City", name: "Agadir" },
    { "@type": "City", name: "Tanger" },
    { "@type": "City", name: "Fès" },
    { "@type": "City", name: "Oujda" },
  ],
  serviceType: [
    "Car Rental",
    "Corporate Leasing",
    "Monthly Car Rental",
    "Long Term Car Rental",
    "Airport Pick-up and Delivery",
  ],
};

// Review markup is intentionally absent.
//
// This used to publish an aggregateRating of 4.7 from 1200 reviews, plus three
// named testimonials praising the service in Abu Dhabi and Dubai. None of it was
// real. Google treats invented review markup as spam and can apply a manual
// action, which is a far worse outcome than showing no stars at all.
//
// To turn it back on, populate reviewsConfig.js with the real Google Business
// Profile figures and build the schema from those.
const DEFAULT_AGGREGATE_RATING = null;

// FAQ markup is absent for the same reason as the reviews above: every entry
// described the UAE business — Dubai and Abu Dhabi airports, UAE driving
// licences, Sharjah branches, chauffeur and corporate services this company does
// not offer. Publishing it as structured data told Google the wrong things about
// a Moroccan rental company. Rebuild it from real Moroccan FAQs when they exist.
const DEFAULT_FAQ = null;

// ─────────────────────────────────────────────────────────────────────────────
// Car Rental Service schema  (per-page, e.g. specific car listings)
//
// "@type": "Service", not "Product". A rental car is never owned, shipped, or
// returned the way Merchant Listings expects (gtin, shippingDetails,
// hasMerchantReturnPolicy) — declaring it a Product put it in Google's
// Merchant-listing validation track, which then flagged it for missing
// e-commerce fields that don't apply here. Also dropped `itemCondition:
// NewCondition`: a rental fleet car isn't "new," it's the same vehicle rented
// out repeatedly, and that field only exists on Product/Offer for that reason.
// ─────────────────────────────────────────────────────────────────────────────
const buildCarRentalSchema = (carData = {}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: carData.name || "Car Rental — Route Facile Morocco",
  description:
    carData.description ||
    "Rent a quality car in Morocco with Route Facile. Daily, weekly and monthly rates available.",
  image: carData.image || "https://routefacilecarrental.com/images/route-facile-fleet.jpg",
  offers: {
    "@type": "Offer",
    priceCurrency: "MAD",
    price: carData.pricePerDay || "99",
    priceValidUntil: carData.priceValidUntil || "2026-12-31",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: "Route Facile",
      url: "https://routefacilecarrental.com",
    },
  },
  // Only emitted when a caller supplies real figures. The 4.7 / 1200 fallbacks
  // that used to sit here meant any car page without review data silently
  // published an invented rating.
  ...(carData.aggregateRating?.ratingValue && carData.aggregateRating?.reviewCount && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: carData.aggregateRating.ratingValue,
      reviewCount: carData.aggregateRating.reviewCount,
      bestRating: "5",
    },
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb schema builder
// breadcrumbs: array of { name, url }   e.g.
//   [ { name: 'Home', url: 'https://routefacilecarrental.com/' },
//     { name: 'Dubai', url: 'https://routefacilecarrental.com/en/rent-a-car-dubai' } ]
// ─────────────────────────────────────────────────────────────────────────────
const buildBreadcrumbSchema = (breadcrumbs = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});

// ─────────────────────────────────────────────────────────────────────────────
// SchemaMarkup component
//
// Props:
//  schemas      — array of schema type strings to inject:
//                 'localBusiness' | 'reviews' | 'faq' | 'carRental' | 'breadcrumb'
//                 Defaults to ['localBusiness', 'reviews', 'faq']
//  localBusiness — object overrides for the LocalBusiness schema
//  reviews       — object overrides for the AggregateRating/Review schema
//  faq           — array of { question, answer } to override default FAQ
//  carRental     — object for per-car schema (only used when 'carRental' in schemas)
//  breadcrumbs   — array of { name, url } for BreadcrumbList schema
// ─────────────────────────────────────────────────────────────────────────────
const SchemaMarkup = ({
  schemas = ["localBusiness", "reviews", "faq"],
  localBusiness,
  reviews,
  faq,
  carRental,
  breadcrumbs,
}) => {
  const schemaBlocks = [];

  if (schemas.includes("localBusiness")) {
    const data = localBusiness
      ? { ...DEFAULT_LOCAL_BUSINESS, ...localBusiness }
      : DEFAULT_LOCAL_BUSINESS;
    schemaBlocks.push(data);
  }

  if (schemas.includes("reviews")) {
    // Only emitted when the caller passes real review data. The default is null
    // now that the invented 4.7/1200 block is gone, and pushing null would
    // render a literal "null" JSON-LD script.
    if (reviews) {
      schemaBlocks.push({ ...(DEFAULT_AGGREGATE_RATING || {}), ...reviews });
    }
  }

  if (schemas.includes("faq")) {
    if (faq && Array.isArray(faq) && faq.length > 0) {
      schemaBlocks.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    } else if (DEFAULT_FAQ) {
      schemaBlocks.push(DEFAULT_FAQ);
    }
  }

  if (schemas.includes("carRental")) {
    schemaBlocks.push(buildCarRentalSchema(carRental || {}));
  }

  if (schemas.includes("breadcrumb") && breadcrumbs && breadcrumbs.length > 0) {
    schemaBlocks.push(buildBreadcrumbSchema(breadcrumbs));
  }

  return (
    <Helmet>
      {schemaBlocks.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema, null, 2)}
        </script>
      ))}
    </Helmet>
  );
};

export default SchemaMarkup;
