/**
 * Centralized data for all SEO landing pages.
 *
 * Each entry maps a URL slug to its full page content:
 *  slug          — used in the router  /:lang/<slug>
 *  slug2         — optional second URL that also resolves to this page
 *  metaTitle     — <title> tag
 *  metaDesc      — meta description (≤160 chars)
 *  metaKeywords  — meta keywords
 *  h1            — main heading
 *  h2Intro       — intro paragraph under H1
 *  sections      — array of { heading, body } content blocks
 *  faq           — array of { question, answer }
 *  breadcrumbs   — array of { name, url } for BreadcrumbList schema
 *  canonicalUrl  — absolute canonical URL
 *  pageType      — 'city' | 'category' | 'area'
 *
 * ---------------------------------------------------------------------------
 * These pages were inherited from the previous UAE business and targeted Dubai,
 * Abu Dhabi, Sharjah, Palm Jumeirah, Yas Island and so on — all published under
 * the Route Facile name. They have been rewritten for the cities Route Facile
 * actually serves in Morocco.
 *
 * House rules for anything added here:
 *  • Quote only rates that match the live fleet (economy from MAD 400/day,
 *    SUVs from MAD 600/day, premium up to MAD 1,400/day). Do not invent prices.
 *  • No insurance claims and no VAT/tax figures — neither is offered or charged.
 *  • Requirements must reflect Moroccan rules, not UAE ones.
 * ---------------------------------------------------------------------------
 */

const BASE = "https://routefacilecarrental.com";

// Repeated verbatim across pages, so keep the wording in one place.
const REQUIREMENTS_BODY =
  "To rent a car with Route Facile you need a driving licence held for at least one year, a passport (for visitors) or a CIN (for residents), and a card or cash deposit. Licences issued in the Latin alphabet are accepted as they are; if yours is in another script, bring an International Driving Permit alongside it. The minimum age is 21. Drivers under 25 are welcome on our economy and compact categories.";

const DELIVERY_BODY =
  "We deliver to airports, hotels, riads and private addresses, and collect the car wherever suits you at the end of the rental. Delivery is arranged when you book — tell us the address and the time, and the car is waiting. Airport handovers are met in the arrivals hall.";

const SEO_PAGES = [
  // ═══════════════════════════════════════════════
  // CITY PAGES
  // ═══════════════════════════════════════════════
  {
    slug: "rent-a-car-marrakech",
    metaTitle: "Rent a Car in Marrakech | Car Rental from MAD 400/day — Route Facile",
    metaDesc:
      "Car rental in Marrakech with Route Facile. Recent vehicles, unlimited mileage, free delivery to your riad, hotel or Menara Airport. Book online in minutes.",
    metaKeywords:
      "rent a car marrakech, car rental marrakech, location voiture marrakech, marrakech car hire, cheap car rental marrakech",
    h1: "Rent a Car in Marrakech",
    h2Intro:
      "Marrakech is where Route Facile is based, so this is the city we know best. Pick up at Menara Airport, in Gueliz, or have the car brought to your riad in the medina — then drive out to the Atlas, Essaouira or the Agafay desert whenever you like.",
    pageType: "city",
    canonicalUrl: `${BASE}/en/rent-a-car-marrakech`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Car Rental Morocco", url: `${BASE}/en/ourfleetlist` },
      { name: "Rent a Car Marrakech", url: `${BASE}/en/rent-a-car-marrakech` },
    ],
    sections: [
      {
        heading: "Why Rent a Car in Marrakech?",
        body: "Inside the medina you will walk, but everything worth seeing beyond it needs wheels. A car turns the Ourika Valley, the Ouzoud falls, Essaouira and the Agafay desert into easy day trips instead of full-day organised tours. Parking is straightforward in Gueliz and Hivernage, and the road to the Atlas is well surfaced the whole way.",
      },
      {
        heading: "Car Rental Prices in Marrakech",
        body: "Economy cars such as the Hyundai i20 and Renault Clio start from MAD 400 per day. Compact models like the Peugeot 208 start from MAD 550. SUVs including the Dacia Duster and Peugeot 2008 start from MAD 600, and premium vehicles run to MAD 1,400 per day. Every rate includes unlimited mileage, and weekly and monthly bookings are cheaper per day.",
      },
      {
        heading: "Delivery Across Marrakech",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "How much does it cost to rent a car in Marrakech?",
        answer:
          "Economy cars start from MAD 400 per day with unlimited mileage. SUVs start from MAD 600 per day. Longer bookings reduce the daily rate.",
      },
      {
        question: "Can I collect my car at Marrakech Menara Airport?",
        answer:
          "Yes. Send us your flight number when you book and we meet you in the arrivals hall with the car ready.",
      },
      {
        question: "Is a deposit required?",
        answer:
          "Yes, a refundable deposit is taken at handover by card or in cash, and returned when the car comes back in the same condition.",
      },
      {
        question: "Can I drive to the Atlas Mountains or Essaouira?",
        answer:
          "Yes. Mileage is unlimited and there is no restriction on driving anywhere in Morocco. Both roads are sealed and suitable for any car in our fleet.",
      },
    ],
  },

  {
    slug: "rent-a-car-casablanca",
    metaTitle: "Rent a Car in Casablanca | Car Rental & Airport Pickup — Route Facile",
    metaDesc:
      "Car rental in Casablanca with Route Facile. Delivery to Mohammed V Airport, the city centre or your office. Unlimited mileage, recent vehicles, clear pricing.",
    metaKeywords:
      "rent a car casablanca, car rental casablanca, location voiture casablanca, casablanca airport car rental",
    h1: "Rent a Car in Casablanca",
    h2Intro:
      "Casablanca is Morocco's business capital and its traffic rewards having your own car. Route Facile delivers to Mohammed V Airport, to hotels in the centre, and to offices in Sidi Maârouf and Casa Finance City.",
    pageType: "city",
    canonicalUrl: `${BASE}/en/rent-a-car-casablanca`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Car Rental Morocco", url: `${BASE}/en/ourfleetlist` },
      { name: "Rent a Car Casablanca", url: `${BASE}/en/rent-a-car-casablanca` },
    ],
    sections: [
      {
        heading: "Why Rent a Car in Casablanca?",
        body: "The city spreads a long way, and moving between the Corniche, the Habous quarter, Maârif and the business districts by taxi adds up quickly. A rental car also puts Rabat, El Jadida and Azemmour within an easy drive on the motorway.",
      },
      {
        heading: "Car Rental Prices in Casablanca",
        body: "Economy cars start from MAD 400 per day, compacts from MAD 550, and SUVs from MAD 600. Unlimited mileage is included on every booking. For stays of a month or more, ask about our long-term rates — they are considerably lower per day.",
      },
      {
        heading: "Delivery Across Casablanca",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "Do you deliver to Mohammed V Airport?",
        answer:
          "Yes. Give us your flight number and we meet you in arrivals at Mohammed V Airport with the car ready to drive.",
      },
      {
        question: "How much is car rental in Casablanca per day?",
        answer:
          "From MAD 400 per day for an economy car with unlimited mileage. SUVs start from MAD 600 per day.",
      },
      {
        question: "Can I rent a car in Casablanca and return it in Marrakech?",
        answer:
          "Yes, one-way rentals between the cities we serve can be arranged. Tell us both cities when booking so we can confirm the arrangement.",
      },
    ],
  },

  {
    slug: "rent-a-car-rabat",
    metaTitle: "Rent a Car in Rabat | Car Rental in the Capital — Route Facile",
    metaDesc:
      "Car rental in Rabat with Route Facile. Delivery to Rabat-Salé Airport, the Agdal district or your hotel. Unlimited mileage and clear, all-in pricing.",
    metaKeywords:
      "rent a car rabat, car rental rabat, location voiture rabat, rabat airport car hire",
    h1: "Rent a Car in Rabat",
    h2Intro:
      "Rabat is compact, green and easy to drive. Route Facile delivers to Rabat-Salé Airport, to the Agdal and Hassan districts, and to hotels along the river.",
    pageType: "city",
    canonicalUrl: `${BASE}/en/rent-a-car-rabat`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Car Rental Morocco", url: `${BASE}/en/ourfleetlist` },
      { name: "Rent a Car Rabat", url: `${BASE}/en/rent-a-car-rabat` },
    ],
    sections: [
      {
        heading: "Why Rent a Car in Rabat?",
        body: "The capital is pleasant to drive in by Moroccan standards, with wide avenues and manageable traffic. A car makes Salé, Temara and the beaches south of the city simple to reach, and Casablanca is under an hour away on the motorway.",
      },
      {
        heading: "Car Rental Prices in Rabat",
        body: "Rates start from MAD 400 per day for economy cars and MAD 600 for SUVs, all with unlimited mileage. Weekly and monthly bookings carry a lower daily rate — ask when you book.",
      },
      {
        heading: "Delivery Across Rabat",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "Can I pick up a car at Rabat-Salé Airport?",
        answer:
          "Yes. Send your flight details when booking and we will have the car waiting at the airport.",
      },
      {
        question: "What does car rental in Rabat cost?",
        answer:
          "From MAD 400 per day for an economy car including unlimited mileage.",
      },
      {
        question: "Is parking easy in Rabat?",
        answer:
          "Generally yes. Street parking is widely available in Agdal and Hassan, and attended car parks are inexpensive.",
      },
    ],
  },

  {
    slug: "rent-a-car-agadir",
    metaTitle: "Rent a Car in Agadir | Beach & Airport Car Rental — Route Facile",
    metaDesc:
      "Car rental in Agadir with Route Facile. Delivery to Al Massira Airport and beachfront hotels. Unlimited mileage, recent vehicles, transparent rates.",
    metaKeywords:
      "rent a car agadir, car rental agadir, location voiture agadir, agadir airport car rental",
    h1: "Rent a Car in Agadir",
    h2Intro:
      "Agadir is a driving city — the beach, the marina and the surf towns up the coast are all spread out. Route Facile delivers to Al Massira Airport and to hotels along the bay.",
    pageType: "city",
    canonicalUrl: `${BASE}/en/rent-a-car-agadir`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Car Rental Morocco", url: `${BASE}/en/ourfleetlist` },
      { name: "Rent a Car Agadir", url: `${BASE}/en/rent-a-car-agadir` },
    ],
    sections: [
      {
        heading: "Why Rent a Car in Agadir?",
        body: "With a car you can reach Taghazout and the surf beaches in half an hour, drive down to Sidi Ifni, or head inland to Paradise Valley and the Souss-Massa park. None of these are practical without your own vehicle.",
      },
      {
        heading: "Car Rental Prices in Agadir",
        body: "Economy cars start from MAD 400 per day and SUVs from MAD 600, with unlimited mileage on every booking. Longer rentals reduce the daily rate.",
      },
      {
        heading: "Delivery Across Agadir",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "Do you deliver to Agadir Al Massira Airport?",
        answer:
          "Yes. Share your flight number when booking and we meet you at arrivals.",
      },
      {
        question: "Can I drive to Taghazout or Paradise Valley?",
        answer:
          "Yes. Mileage is unlimited and both routes are sealed roads suitable for any car in the fleet.",
      },
      {
        question: "How much is car rental in Agadir?",
        answer: "From MAD 400 per day for an economy car with unlimited mileage.",
      },
    ],
  },

  {
    slug: "rent-a-car-tanger",
    slug2: "rent-a-car-tangier",
    metaTitle: "Rent a Car in Tangier | Car Rental & Port Pickup — Route Facile",
    metaDesc:
      "Car rental in Tangier with Route Facile. Delivery to Ibn Battouta Airport, the port and the city centre. Unlimited mileage and straightforward pricing.",
    metaKeywords:
      "rent a car tangier, car rental tanger, location voiture tanger, tangier airport car rental",
    h1: "Rent a Car in Tangier",
    h2Intro:
      "Tangier sits where the Mediterranean meets the Atlantic, and the coastline either side of it is the reason to have a car. Route Facile delivers to Ibn Battouta Airport, the ferry port and city-centre hotels.",
    pageType: "city",
    canonicalUrl: `${BASE}/en/rent-a-car-tanger`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Car Rental Morocco", url: `${BASE}/en/ourfleetlist` },
      { name: "Rent a Car Tangier", url: `${BASE}/en/rent-a-car-tanger` },
    ],
    sections: [
      {
        heading: "Why Rent a Car in Tangier?",
        body: "Cap Spartel, the Caves of Hercules, Asilah and Chefchaouen are all comfortable drives from Tangier. If you are arriving by ferry from Spain, having a car waiting at the port saves a great deal of time.",
      },
      {
        heading: "Car Rental Prices in Tangier",
        body: "From MAD 400 per day for economy cars and MAD 600 for SUVs, unlimited mileage included. Ask about weekly rates for longer stays.",
      },
      {
        heading: "Delivery Across Tangier",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "Can I collect a car at Tangier port?",
        answer:
          "Yes. Tell us your ferry arrival time when booking and we will meet you at the port.",
      },
      {
        question: "Can I drive from Tangier to Chefchaouen?",
        answer:
          "Yes, it is roughly a two-hour drive on good roads, and mileage is unlimited.",
      },
      {
        question: "What does car rental in Tangier cost?",
        answer: "Economy cars start from MAD 400 per day.",
      },
    ],
  },

  {
    slug: "rent-a-car-fes",
    metaTitle: "Rent a Car in Fes | Car Rental for the Medina & Beyond — Route Facile",
    metaDesc:
      "Car rental in Fes with Route Facile. Delivery to Fes-Saïss Airport and hotels near the medina. Unlimited mileage, recent vehicles, clear rates.",
    metaKeywords:
      "rent a car fes, car rental fes, location voiture fes, fez car hire morocco",
    h1: "Rent a Car in Fes",
    h2Intro:
      "Fes rewards a car once you step outside the medina — Meknes, Volubilis, Ifrane and the cedar forests of the Middle Atlas are all within easy reach. Route Facile delivers to Fes-Saïss Airport and to hotels around the old city.",
    pageType: "city",
    canonicalUrl: `${BASE}/en/rent-a-car-fes`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Car Rental Morocco", url: `${BASE}/en/ourfleetlist` },
      { name: "Rent a Car Fes", url: `${BASE}/en/rent-a-car-fes` },
    ],
    sections: [
      {
        heading: "Why Rent a Car in Fes?",
        body: "The medina itself is car-free, so a rental is about what lies beyond it. Volubilis and Meknes make an easy day out, and the drive up to Ifrane and the cedar forest is one of the best in the country.",
      },
      {
        heading: "Car Rental Prices in Fes",
        body: "Economy cars start from MAD 400 per day, SUVs from MAD 600, with unlimited mileage throughout.",
      },
      {
        heading: "Delivery Across Fes",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "Can I drive inside the Fes medina?",
        answer:
          "No, the medina is pedestrian only. We deliver to your hotel or to the nearest accessible parking, whichever is easier.",
      },
      {
        question: "How far is Volubilis from Fes by car?",
        answer: "Around 90 minutes each way on good roads.",
      },
      {
        question: "What does car rental in Fes cost?",
        answer: "From MAD 400 per day including unlimited mileage.",
      },
    ],
  },

  {
    slug: "rent-a-car-oujda",
    metaTitle: "Rent a Car in Oujda | Eastern Morocco Car Rental — Route Facile",
    metaDesc:
      "Car rental in Oujda with Route Facile. Delivery to Angads Airport and the city centre. Unlimited mileage and transparent pricing across eastern Morocco.",
    metaKeywords:
      "rent a car oujda, car rental oujda, location voiture oujda, oujda airport car rental",
    h1: "Rent a Car in Oujda",
    h2Intro:
      "Oujda is the gateway to eastern Morocco and the Mediterranean coast at Saïdia. Route Facile delivers to Angads Airport and across the city.",
    pageType: "city",
    canonicalUrl: `${BASE}/en/rent-a-car-oujda`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Car Rental Morocco", url: `${BASE}/en/ourfleetlist` },
      { name: "Rent a Car Oujda", url: `${BASE}/en/rent-a-car-oujda` },
    ],
    sections: [
      {
        heading: "Why Rent a Car in Oujda?",
        body: "Saïdia's beaches, the Beni-Snassen mountains and the Zegzel gorge are all short drives from the city, and none are well served by public transport.",
      },
      {
        heading: "Car Rental Prices in Oujda",
        body: "From MAD 400 per day for economy cars with unlimited mileage; SUVs from MAD 600 per day.",
      },
      {
        heading: "Delivery Across Oujda",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "Do you deliver to Oujda Angads Airport?",
        answer: "Yes, with your flight number we will meet you at arrivals.",
      },
      {
        question: "How far is Saïdia from Oujda?",
        answer: "About an hour by car on a good road.",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // CATEGORY PAGES
  // ═══════════════════════════════════════════════
  {
    slug: "suv-rental-morocco",
    metaTitle: "SUV Rental in Morocco | 4x4 & SUV Hire from MAD 600 — Route Facile",
    metaDesc:
      "Rent an SUV in Morocco with Route Facile. Dacia Duster, Peugeot 2008, Hyundai Tucson and more from MAD 600/day with unlimited mileage.",
    metaKeywords:
      "suv rental morocco, 4x4 rental morocco, rent an suv marrakech, dacia duster rental morocco",
    h1: "SUV Rental in Morocco",
    h2Intro:
      "Higher ground clearance and a bigger boot make an SUV the sensible choice for the Atlas, the desert routes and long family drives. Route Facile's SUV range starts from MAD 600 per day with unlimited mileage.",
    pageType: "category",
    canonicalUrl: `${BASE}/en/suv-rental-morocco`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Our Fleet", url: `${BASE}/en/ourfleetlist` },
      { name: "SUV Rental Morocco", url: `${BASE}/en/suv-rental-morocco` },
    ],
    sections: [
      {
        heading: "Our SUV Range",
        body: "The Dacia Duster and Peugeot 2008 start from MAD 600 per day, with the Hyundai Tucson from MAD 750. All are automatic, seat five, and come with unlimited mileage.",
      },
      {
        heading: "When an SUV Is Worth It",
        body: "Choose an SUV if you are heading into the Atlas, driving the Agafay or Merzouga routes, or travelling with a family and full luggage. For city driving and motorway trips an economy or compact car is cheaper and just as comfortable.",
      },
      {
        heading: "Where We Deliver",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "How much does an SUV cost to rent in Morocco?",
        answer:
          "SUVs start from MAD 600 per day with unlimited mileage. The Hyundai Tucson starts from MAD 750 per day.",
      },
      {
        question: "Are your SUVs automatic?",
        answer: "Yes, the SUVs in our fleet are automatic.",
      },
      {
        question: "Can I take an SUV on unpaved roads?",
        answer:
          "Light unsurfaced tracks are fine. Serious off-road driving and dune routes are not permitted — tell us your plans and we will advise on the right vehicle.",
      },
    ],
  },

  {
    slug: "luxury-car-rental-marrakech",
    metaTitle: "Luxury Car Rental in Marrakech | Premium Vehicles — Route Facile",
    metaDesc:
      "Premium car rental in Marrakech with Route Facile. Well-equipped recent vehicles delivered to your riad, hotel or Menara Airport.",
    metaKeywords:
      "luxury car rental marrakech, premium car hire marrakech, location voiture luxe marrakech",
    h1: "Luxury Car Rental in Marrakech",
    h2Intro:
      "For weddings, business trips and occasions where the car matters, Route Facile's premium range offers recent, well-equipped vehicles delivered wherever you are staying in Marrakech.",
    pageType: "category",
    canonicalUrl: `${BASE}/en/luxury-car-rental-marrakech`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Our Fleet", url: `${BASE}/en/ourfleetlist` },
      { name: "Luxury Car Rental Marrakech", url: `${BASE}/en/luxury-car-rental-marrakech` },
    ],
    sections: [
      {
        heading: "Our Premium Range",
        body: "Premium vehicles run from around MAD 900 to MAD 1,400 per day depending on model and season, with unlimited mileage included. Availability is limited, so book ahead for specific dates.",
      },
      {
        heading: "Delivery and Handover",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "What does luxury car rental cost in Marrakech?",
        answer:
          "Premium vehicles range from roughly MAD 900 to MAD 1,400 per day with unlimited mileage, depending on model and season.",
      },
      {
        question: "Can the car be delivered to my riad?",
        answer:
          "Yes. Where the riad is inside the pedestrian medina, we deliver to the nearest vehicle access point and walk you the rest of the way.",
      },
      {
        question: "Do you provide a driver?",
        answer:
          "Our premium vehicles are offered for self-drive. Contact us directly to discuss other arrangements.",
      },
    ],
  },

  {
    slug: "cheap-car-rental-morocco",
    metaTitle: "Cheap Car Rental in Morocco | From MAD 400/day — Route Facile",
    metaDesc:
      "Affordable car rental in Morocco from MAD 400 per day. Unlimited mileage, no hidden fees, free delivery. Book with Route Facile in minutes.",
    metaKeywords:
      "cheap car rental morocco, affordable car hire morocco, budget car rental marrakech, location voiture pas cher maroc",
    h1: "Cheap Car Rental in Morocco",
    h2Intro:
      "The cheapest way to rent with Route Facile is an economy car from MAD 400 per day, booked for as long as you actually need it — daily rates fall as the rental gets longer.",
    pageType: "category",
    canonicalUrl: `${BASE}/en/cheap-car-rental-morocco`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Our Fleet", url: `${BASE}/en/ourfleetlist` },
      { name: "Cheap Car Rental Morocco", url: `${BASE}/en/cheap-car-rental-morocco` },
    ],
    sections: [
      {
        heading: "Our Most Affordable Cars",
        body: "The Hyundai i20 starts from MAD 400 per day and the Renault Clio from MAD 450. Both are automatic, seat five, and include unlimited mileage — which matters, because distances in Morocco add up fast.",
      },
      {
        heading: "How to Keep the Cost Down",
        body: "Book for the full period in one reservation rather than several short ones, take an economy car unless you genuinely need the space, and book early in high season when the cheaper categories go first.",
      },
      {
        heading: "No Hidden Charges",
        body: "The price you are quoted is the price you pay. Mileage is unlimited, delivery and collection are arranged as part of the booking, and there are no added service fees at handover. The only separate amount is the refundable deposit, returned when the car comes back as it left.",
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "What is the cheapest car rental in Morocco?",
        answer:
          "Our economy category starts from MAD 400 per day with unlimited mileage included.",
      },
      {
        question: "Are there hidden fees?",
        answer:
          "No. The quoted rate is what you pay, plus a refundable deposit that is returned at the end of the rental.",
      },
      {
        question: "Is mileage really unlimited?",
        answer:
          "Yes, on every booking. There is no per-kilometre charge anywhere in Morocco.",
      },
    ],
  },

  {
    slug: "monthly-car-rental-morocco",
    metaTitle: "Monthly Car Rental in Morocco | Long Stay Rates — Route Facile",
    metaDesc:
      "Monthly car rental in Morocco with Route Facile. Lower daily rates for long stays, unlimited mileage, delivery included. Ideal for remote workers and residents.",
    metaKeywords:
      "monthly car rental morocco, long term car rental morocco, location voiture mensuelle maroc",
    h1: "Monthly Car Rental in Morocco",
    h2Intro:
      "Staying a month or more? A monthly booking costs substantially less per day than repeated short rentals, and the car stays with you throughout.",
    pageType: "category",
    canonicalUrl: `${BASE}/en/monthly-car-rental-morocco`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Our Fleet", url: `${BASE}/en/ourfleetlist` },
      { name: "Monthly Car Rental Morocco", url: `${BASE}/en/monthly-car-rental-morocco` },
    ],
    sections: [
      {
        heading: "How Monthly Rental Works",
        body: "You choose the car and the start date, and keep it for the month. Servicing and routine maintenance are handled by us. If your plans change, extending is usually straightforward — just tell us before the return date.",
      },
      {
        heading: "Who It Suits",
        body: "Remote workers spending a season in Marrakech or Essaouira, families visiting for an extended stay, and residents between cars. For anything over three months, contact us directly — we can quote a longer arrangement.",
      },
      {
        heading: "Delivery and Collection",
        body: DELIVERY_BODY,
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "How much is a monthly car rental in Morocco?",
        answer:
          "Monthly rates depend on the vehicle and the season and work out well below the daily rate. Send us your dates and we will quote for the exact car.",
      },
      {
        question: "Can I extend a monthly rental?",
        answer:
          "Yes, subject to availability. Let us know before the return date and we will arrange it.",
      },
      {
        question: "Is maintenance included?",
        answer:
          "Yes. Routine servicing during your rental is handled by us at no extra cost.",
      },
    ],
  },

  {
    slug: "long-term-car-rental-casablanca",
    metaTitle: "Long Term Car Rental in Casablanca | Business Rates — Route Facile",
    metaDesc:
      "Long term car rental in Casablanca for companies and residents. Lower monthly rates, maintenance handled, delivery to your office. Route Facile.",
    metaKeywords:
      "long term car rental casablanca, monthly car hire casablanca, location longue duree casablanca",
    h1: "Long Term Car Rental in Casablanca",
    h2Intro:
      "For staff cars, project postings and extended stays, a long-term rental in Casablanca costs far less per day than a short booking and takes the running of the vehicle off your hands.",
    pageType: "category",
    canonicalUrl: `${BASE}/en/long-term-car-rental-casablanca`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Our Fleet", url: `${BASE}/en/ourfleetlist` },
      { name: "Long Term Car Rental Casablanca", url: `${BASE}/en/long-term-car-rental-casablanca` },
    ],
    sections: [
      {
        heading: "How It Works",
        body: "Choose the vehicle and the period, and we deliver it to your office or address in Casablanca. Servicing is our responsibility throughout. Invoicing can be arranged monthly for company accounts.",
      },
      {
        heading: "For Companies",
        body: "If you need several vehicles, or vehicles across more than one city, contact us at info@routefacilecarrental.com and we will put together a quote for the whole requirement.",
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "What counts as long term?",
        answer:
          "Anything from one month upward. For three months or more, contact us for a tailored rate.",
      },
      {
        question: "Can you invoice a company?",
        answer:
          "Yes. Monthly invoicing for company accounts can be arranged when you book.",
      },
      {
        question: "Who handles servicing?",
        answer: "We do, for the whole period of the rental.",
      },
    ],
  },

  {
    slug: "airport-car-rental-morocco",
    metaTitle: "Airport Car Rental in Morocco | Meet & Greet Pickup — Route Facile",
    metaDesc:
      "Car rental at Moroccan airports — Marrakech Menara, Casablanca Mohammed V, Agadir Al Massira, Tangier Ibn Battouta. Met at arrivals by Route Facile.",
    metaKeywords:
      "airport car rental morocco, marrakech airport car hire, casablanca airport car rental, agadir airport car rental",
    h1: "Airport Car Rental in Morocco",
    h2Intro:
      "Route Facile meets you in the arrivals hall with the car ready. No shuttle bus to an off-site depot and no queue at a counter — send your flight number when you book and we track the arrival.",
    pageType: "category",
    canonicalUrl: `${BASE}/en/airport-car-rental-morocco`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Our Fleet", url: `${BASE}/en/ourfleetlist` },
      { name: "Airport Car Rental Morocco", url: `${BASE}/en/airport-car-rental-morocco` },
    ],
    sections: [
      {
        heading: "Airports We Cover",
        body: "Marrakech Menara (RAK), Casablanca Mohammed V (CMN), Agadir Al Massira (AGA), Tangier Ibn Battouta (TNG), Fes-Saïss (FEZ), Rabat-Salé (RBA) and Oujda Angads (OUD).",
      },
      {
        heading: "How the Handover Works",
        body: "Give us your flight number at the time of booking. We monitor the arrival, so a delayed flight does not cost you the car. Our driver meets you in arrivals with the keys and the paperwork, walks you around the vehicle, and you go.",
      },
      {
        heading: "Late and Early Flights",
        body: "Arrivals outside normal hours are fine — tell us the time and we will be there. Returns work the same way: we collect the car from the airport when you fly out.",
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "What if my flight is delayed?",
        answer:
          "We track your flight number, so the handover simply moves with the arrival time at no extra charge.",
      },
      {
        question: "Is airport delivery charged extra?",
        answer:
          "Airport delivery is arranged as part of your booking — confirm it when you reserve and the cost is included in the quote you see.",
      },
      {
        question: "Can I return the car at a different airport?",
        answer:
          "Yes, between the airports we serve. Tell us both airports when booking so we can confirm the arrangement.",
      },
    ],
  },

  {
    slug: "7-seater-car-rental-morocco",
    metaTitle: "7 Seater Car Rental in Morocco | Family & Group Hire — Route Facile",
    metaDesc:
      "7 seater and family car rental in Morocco with Route Facile. Room for luggage, unlimited mileage, delivery to your hotel or airport.",
    metaKeywords:
      "7 seater car rental morocco, family car rental morocco, minivan rental marrakech, 7 places location maroc",
    h1: "7 Seater Car Rental in Morocco",
    h2Intro:
      "Travelling as a family or a group? Our larger vehicles carry seven and still leave room for luggage, which matters on the long drives between Moroccan cities.",
    pageType: "category",
    canonicalUrl: `${BASE}/en/7-seater-car-rental-morocco`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Our Fleet", url: `${BASE}/en/ourfleetlist` },
      { name: "7 Seater Car Rental Morocco", url: `${BASE}/en/7-seater-car-rental-morocco` },
    ],
    sections: [
      {
        heading: "Family and Group Vehicles",
        body: "Availability of seven-seat vehicles varies by city and season. Tell us your dates, your group size and how much luggage you have, and we will confirm what we can put on the ground for you.",
      },
      {
        heading: "Planning a Group Trip",
        body: "For Marrakech to Merzouga, or a tour taking in Fes, Chefchaouen and Tangier, unlimited mileage means the distance costs you nothing extra. Child seats can be arranged — ask when you book.",
      },
      {
        heading: "What You Need to Rent",
        body: REQUIREMENTS_BODY,
      },
    ],
    faq: [
      {
        question: "Do you have 7 seater cars available?",
        answer:
          "Availability varies by city and date. Send us your dates and group size and we will confirm what is available.",
      },
      {
        question: "Can I get child seats?",
        answer: "Yes, child seats can be arranged — request them when you book.",
      },
      {
        question: "Is there enough luggage space for seven people?",
        answer:
          "Tell us how many bags you are carrying and we will recommend the right vehicle rather than leaving you to guess.",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // AREA / AIRPORT PAGES
  // ═══════════════════════════════════════════════
  {
    slug: "car-rental-marrakech-menara-airport",
    metaTitle: "Car Rental at Marrakech Menara Airport (RAK) — Route Facile",
    metaDesc:
      "Rent a car at Marrakech Menara Airport. Met at arrivals with the car ready, flight tracked, unlimited mileage. Book with Route Facile.",
    metaKeywords:
      "marrakech menara airport car rental, RAK car hire, car rental marrakech airport",
    h1: "Car Rental at Marrakech Menara Airport",
    h2Intro:
      "Menara is a ten-minute drive from the medina, and having the car at arrivals means you are on the road immediately instead of negotiating a taxi after a flight.",
    pageType: "area",
    canonicalUrl: `${BASE}/en/car-rental-marrakech-menara-airport`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Rent a Car Marrakech", url: `${BASE}/en/rent-a-car-marrakech` },
      { name: "Menara Airport", url: `${BASE}/en/car-rental-marrakech-menara-airport` },
    ],
    sections: [
      {
        heading: "Meeting You at RAK",
        body: "Send your flight number when you book. We watch the arrival time, meet you in the arrivals hall, hand over the keys and walk you to the car. There is no depot shuttle and no counter queue.",
      },
      {
        heading: "Rates from Menara Airport",
        body: "Economy cars from MAD 400 per day, SUVs from MAD 600, all with unlimited mileage.",
      },
      {
        heading: "Returning the Car",
        body: "We collect the vehicle at the airport when you depart. Give us your departure time and we will meet you there.",
      },
    ],
    faq: [
      {
        question: "Where exactly do we meet at Menara Airport?",
        answer:
          "In the arrivals hall after you clear customs. We confirm the meeting point by WhatsApp before you fly.",
      },
      {
        question: "What if my flight lands late at night?",
        answer:
          "That is fine. Tell us the arrival time when booking and we will be there.",
      },
    ],
  },

  {
    slug: "car-rental-casablanca-mohammed-v-airport",
    metaTitle: "Car Rental at Casablanca Mohammed V Airport (CMN) — Route Facile",
    metaDesc:
      "Rent a car at Casablanca Mohammed V Airport. Met at arrivals, flight tracked, unlimited mileage, clear pricing. Book with Route Facile.",
    metaKeywords:
      "casablanca airport car rental, mohammed v airport car hire, CMN car rental",
    h1: "Car Rental at Casablanca Mohammed V Airport",
    h2Intro:
      "Mohammed V is Morocco's main international gateway and sits about 30 km from central Casablanca. Having your own car at arrivals makes both the city and the motorway to Rabat or Marrakech straightforward.",
    pageType: "area",
    canonicalUrl: `${BASE}/en/car-rental-casablanca-mohammed-v-airport`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Rent a Car Casablanca", url: `${BASE}/en/rent-a-car-casablanca` },
      { name: "Mohammed V Airport", url: `${BASE}/en/car-rental-casablanca-mohammed-v-airport` },
    ],
    sections: [
      {
        heading: "Meeting You at CMN",
        body: "Give us your flight number and we track the arrival. Our driver meets you in the arrivals hall with the car ready and the paperwork done.",
      },
      {
        heading: "Rates from Mohammed V Airport",
        body: "From MAD 400 per day for economy cars and MAD 600 for SUVs, unlimited mileage included.",
      },
      {
        heading: "Onward Drives",
        body: "Rabat is under an hour on the motorway, Marrakech around three hours, and El Jadida about ninety minutes down the coast.",
      },
    ],
    faq: [
      {
        question: "How far is Mohammed V Airport from central Casablanca?",
        answer: "Roughly 30 km, about 30 to 40 minutes depending on traffic.",
      },
      {
        question: "Can I drive straight to Marrakech from CMN?",
        answer:
          "Yes. It is about three hours on the motorway and mileage is unlimited.",
      },
    ],
  },

  {
    slug: "car-rental-agadir-al-massira-airport",
    metaTitle: "Car Rental at Agadir Al Massira Airport (AGA) — Route Facile",
    metaDesc:
      "Rent a car at Agadir Al Massira Airport. Met at arrivals with the car ready, unlimited mileage, transparent rates. Route Facile.",
    metaKeywords:
      "agadir airport car rental, al massira car hire, AGA car rental morocco",
    h1: "Car Rental at Agadir Al Massira Airport",
    h2Intro:
      "Al Massira sits about 25 km from Agadir's beachfront. With a car waiting you can be at your hotel — or up the coast in Taghazout — within the hour.",
    pageType: "area",
    canonicalUrl: `${BASE}/en/car-rental-agadir-al-massira-airport`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Rent a Car Agadir", url: `${BASE}/en/rent-a-car-agadir` },
      { name: "Al Massira Airport", url: `${BASE}/en/car-rental-agadir-al-massira-airport` },
    ],
    sections: [
      {
        heading: "Meeting You at AGA",
        body: "Send your flight number when booking. We meet you in arrivals with the keys and complete the handover there.",
      },
      {
        heading: "Rates from Al Massira Airport",
        body: "Economy cars from MAD 400 per day, SUVs from MAD 600, unlimited mileage throughout.",
      },
      {
        heading: "Where People Drive From Here",
        body: "Taghazout and the surf beaches are half an hour north, Paradise Valley about an hour inland, and Sidi Ifni around two and a half hours south.",
      },
    ],
    faq: [
      {
        question: "How far is Al Massira Airport from Agadir?",
        answer: "About 25 km, roughly 30 minutes by car.",
      },
      {
        question: "Can I return the car at the airport?",
        answer:
          "Yes. Tell us your departure time and we will collect it at the airport.",
      },
    ],
  },

  {
    slug: "car-rental-tanger-ibn-battouta-airport",
    metaTitle: "Car Rental at Tangier Ibn Battouta Airport (TNG) — Route Facile",
    metaDesc:
      "Rent a car at Tangier Ibn Battouta Airport. Met at arrivals, unlimited mileage, easy drives to Chefchaouen and Asilah. Route Facile.",
    metaKeywords:
      "tangier airport car rental, ibn battouta car hire, TNG car rental morocco",
    h1: "Car Rental at Tangier Ibn Battouta Airport",
    h2Intro:
      "Ibn Battouta is about 15 km from central Tangier. A car at arrivals puts Asilah, Chefchaouen and the Cap Spartel coast within comfortable reach.",
    pageType: "area",
    canonicalUrl: `${BASE}/en/car-rental-tanger-ibn-battouta-airport`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Rent a Car Tangier", url: `${BASE}/en/rent-a-car-tanger` },
      { name: "Ibn Battouta Airport", url: `${BASE}/en/car-rental-tanger-ibn-battouta-airport` },
    ],
    sections: [
      {
        heading: "Meeting You at TNG",
        body: "Give us your flight number and we will be in the arrivals hall with the car ready to go.",
      },
      {
        heading: "Rates from Ibn Battouta Airport",
        body: "From MAD 400 per day for economy cars, MAD 600 for SUVs, unlimited mileage included.",
      },
      {
        heading: "Drives from Tangier",
        body: "Asilah is about 45 minutes down the Atlantic coast, Chefchaouen roughly two hours inland, and Cap Spartel a short drive from the city.",
      },
    ],
    faq: [
      {
        question: "Can you also meet me at the Tangier ferry port?",
        answer:
          "Yes. Tell us your ferry arrival time and we will meet you at the port instead.",
      },
      {
        question: "How far is the airport from central Tangier?",
        answer: "About 15 km, roughly 20 minutes.",
      },
    ],
  },

  {
    slug: "car-rental-marrakech-gueliz",
    metaTitle: "Car Rental in Gueliz, Marrakech | Delivery to Your Door — Route Facile",
    metaDesc:
      "Car rental in Gueliz, Marrakech. Delivered to your apartment, hotel or office in the new town. Unlimited mileage, clear pricing. Route Facile.",
    metaKeywords:
      "car rental gueliz, location voiture gueliz marrakech, gueliz car hire",
    h1: "Car Rental in Gueliz, Marrakech",
    h2Intro:
      "Gueliz is Marrakech's modern quarter and the easiest part of the city to drive and park in. Route Facile delivers to apartments, offices and hotels throughout the district.",
    pageType: "area",
    canonicalUrl: `${BASE}/en/car-rental-marrakech-gueliz`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Rent a Car Marrakech", url: `${BASE}/en/rent-a-car-marrakech` },
      { name: "Gueliz", url: `${BASE}/en/car-rental-marrakech-gueliz` },
    ],
    sections: [
      {
        heading: "Delivery in Gueliz",
        body: "Give us the address and a time and we bring the car to you. Handover takes a few minutes: paperwork, a walk around the vehicle, and the keys.",
      },
      {
        heading: "Driving and Parking in Gueliz",
        body: "Streets here are wide and signposted, and both street parking and attended car parks are easy to find — a contrast to the medina, where cars cannot go at all.",
      },
      {
        heading: "Rates",
        body: "Economy cars from MAD 400 per day, SUVs from MAD 600, unlimited mileage included.",
      },
    ],
    faq: [
      {
        question: "Do you deliver to apartments in Gueliz?",
        answer:
          "Yes, to apartments, hotels and offices anywhere in the district.",
      },
      {
        question: "Is parking easy in Gueliz?",
        answer:
          "Yes. Street parking and attended car parks are both widely available.",
      },
    ],
  },

  {
    slug: "car-rental-marrakech-hivernage",
    metaTitle: "Car Rental in Hivernage, Marrakech | Hotel Delivery — Route Facile",
    metaDesc:
      "Car rental in Hivernage, Marrakech. Delivered to your hotel or residence, unlimited mileage, straightforward pricing. Route Facile.",
    metaKeywords:
      "car rental hivernage, location voiture hivernage marrakech, hivernage car hire",
    h1: "Car Rental in Hivernage, Marrakech",
    h2Intro:
      "Hivernage is the hotel district, minutes from the Koutoubia and the Menara gardens. Route Facile delivers to hotel entrances throughout the quarter.",
    pageType: "area",
    canonicalUrl: `${BASE}/en/car-rental-marrakech-hivernage`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Rent a Car Marrakech", url: `${BASE}/en/rent-a-car-marrakech` },
      { name: "Hivernage", url: `${BASE}/en/car-rental-marrakech-hivernage` },
    ],
    sections: [
      {
        heading: "Hotel Delivery in Hivernage",
        body: "Tell us the hotel and the time. We meet you at the entrance, complete the handover there, and collect the car the same way at the end of your stay.",
      },
      {
        heading: "Getting Out of the City",
        body: "From Hivernage the road to the Atlas and the Ourika Valley is a straight run, and Menara Airport is about ten minutes away.",
      },
      {
        heading: "Rates",
        body: "From MAD 400 per day for economy cars and MAD 600 for SUVs, with unlimited mileage.",
      },
    ],
    faq: [
      {
        question: "Can the car be delivered to my hotel in Hivernage?",
        answer:
          "Yes, we meet you at the hotel entrance at whatever time suits you.",
      },
      {
        question: "How far is Hivernage from the airport?",
        answer: "About ten minutes by car.",
      },
    ],
  },

  {
    slug: "car-rental-casablanca-ain-diab",
    metaTitle: "Car Rental in Ain Diab, Casablanca | Corniche Delivery — Route Facile",
    metaDesc:
      "Car rental in Ain Diab, Casablanca. Delivered along the Corniche to your hotel or residence. Unlimited mileage and clear rates. Route Facile.",
    metaKeywords:
      "car rental ain diab, location voiture ain diab casablanca, corniche casablanca car hire",
    h1: "Car Rental in Ain Diab, Casablanca",
    h2Intro:
      "Ain Diab runs along Casablanca's Corniche, past the Hassan II Mosque and the beach clubs. Route Facile delivers to hotels and residences the length of it.",
    pageType: "area",
    canonicalUrl: `${BASE}/en/car-rental-casablanca-ain-diab`,
    breadcrumbs: [
      { name: "Home", url: `${BASE}/en` },
      { name: "Rent a Car Casablanca", url: `${BASE}/en/rent-a-car-casablanca` },
      { name: "Ain Diab", url: `${BASE}/en/car-rental-casablanca-ain-diab` },
    ],
    sections: [
      {
        heading: "Delivery Along the Corniche",
        body: "Give us the address and the time and we bring the car to you anywhere in Ain Diab or along the Corniche.",
      },
      {
        heading: "Driving from Ain Diab",
        body: "The city centre is around fifteen minutes away, Mohammed V Airport about forty, and the coast road south towards El Jadida starts from here.",
      },
      {
        heading: "Rates",
        body: "Economy cars from MAD 400 per day, SUVs from MAD 600, unlimited mileage included.",
      },
    ],
    faq: [
      {
        question: "Do you deliver to hotels on the Corniche?",
        answer: "Yes, anywhere along Ain Diab and the Corniche.",
      },
      {
        question: "How far is Ain Diab from Mohammed V Airport?",
        answer: "Roughly 40 minutes by car depending on traffic.",
      },
    ],
  },
];

export default SEO_PAGES;
