/**
 * URL slugs for the SEO landing pages — and nothing else.
 *
 * The router needs to know which paths exist so it can register a <Route> for
 * each one. It does not need the page copy. Importing seoPageData.js for that
 * pulled ~49 KB of marketing text (headings, body sections, FAQs for 21 pages)
 * into the entry bundle, where it was dead weight on every single page view
 * including the home page. SeoLandingPage is lazily loaded, so the copy now
 * travels in that route's chunk and is fetched only when a landing page is
 * actually opened.
 *
 * Keep this list in step with seoPageData.js. The assertion below fails loudly
 * in development if the two drift apart, which would otherwise show up as a
 * landing page silently 404ing.
 */
const SEO_SLUGS = [
  // City pages
  "rent-a-car-marrakech",
  "rent-a-car-casablanca",
  "rent-a-car-rabat",
  "rent-a-car-agadir",
  "rent-a-car-tanger",
  "rent-a-car-fes",
  "rent-a-car-oujda",
  // Category pages
  "suv-rental-morocco",
  "luxury-car-rental-marrakech",
  "cheap-car-rental-morocco",
  "monthly-car-rental-morocco",
  "long-term-car-rental-casablanca",
  "airport-car-rental-morocco",
  "7-seater-car-rental-morocco",
  // Area / airport pages
  "car-rental-marrakech-menara-airport",
  "car-rental-casablanca-mohammed-v-airport",
  "car-rental-agadir-al-massira-airport",
  "car-rental-tanger-ibn-battouta-airport",
  "car-rental-marrakech-gueliz",
  "car-rental-marrakech-hivernage",
  "car-rental-casablanca-ain-diab",
];

export default SEO_SLUGS;
