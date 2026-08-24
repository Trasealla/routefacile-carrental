import React, { useEffect, useState, Suspense, useContext, useRef } from "react";
import { Container, Row, Col, Spinner, Modal } from "react-bootstrap";

import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import useInViewOnce from "../hooks/useInViewOnce";
import useMediaQuery from "../hooks/useMediaQuery";
import useScrollReveal from "../hooks/useScrollReveal";
import HeroSection from "../components/UI/HeroSection/HeroSection";
import trustpilotLogo from "../assets/trust-pilot-logo.webp";
import googleLogo from "../assets/Google-Logo.wine.svg";
import "./HomeNew.css";
import { simpleGetCall, getApiLang } from "../config.js/SetUp";
import configWeb from "../config.js/configWeb";
import {
  GOOGLE_REVIEWS_URL, GOOGLE_RATING, GOOGLE_REVIEW_COUNT,
  TRIPADVISOR_URL, TRUSTPILOT_URL, TESTIMONIALS, hasGoogleReviews,
} from "../config.js/reviewsConfig";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
import carlogo from "../assets/new-logo/Car Rental Platform Logos/logo-1009_191.png"; 
// Import step images
import step1Img from "../assets/all-images/Vector illustration.svg";
import step2Img from "../carbook-assets/img/Vector Illustrations (Book&Pay).svg";
import step3Img from "../carbook-assets/img/Vector Illustrations (Pickup&Drive).svg";
// Import location images


// Constants - declared after all imports
// Percentage icon - using public folder for easier cache busting
// Add ?v=2 to force browser to reload when icon is updated
const percentageIcon = "/images/percentage-icon.png?v=2";
// Large SVG moved to public folder to avoid webpack processing
const guySmilingImg = "/images/1guy-smiling.svg";

// Lazy load components for performance
const CarItem = React.lazy(() => import("../components/UI/CarItem"));
const WhyWe = React.lazy(() => import("../components/UI/WhyWe"));
const ServeList = React.lazy(() => import("../components/UI/ServiceList"));
const RamadanFestive = React.lazy(() => import("../components/UI/RamadanFestive/RamadanFestive"));
// Leaflet map isolated into its own chunk (heavy + below the fold)
const LocationMap = React.lazy(() => import("../components/UI/LocationMap/LocationMap"));
// Swiper carousel isolated into its own chunk (below the fold)
const LocationsCarousel = React.lazy(() => import("../components/UI/LocationsCarousel/LocationsCarousel"));


const HomeNew = () => {
  const { t } = useTranslation();
  const { format: fmt } = useCurrency();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("all");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeDistance, setRouteDistance] = useState(null);
  

  // Confetti effect on page load - DISABLED
  // const confettiRef = useRef(null);
  
  // useEffect(() => {
  //   // Create confetti instance
  //   confettiRef.current = new JSConfetti();
  //   
  //   // Fire confetti on page load
  //   const fireConfetti = () => {
  //     confettiRef.current.addConfetti({
  //       emojis: ['🚗', '🚘', '🔑', '📍', '⏰', '💳', '🛡️', '⭐', '🔥', '🚀'],
  //       emojiSize: 40,
  //       confettiNumber: 50,
  //     });
  //   };
  //   
  //   // Initial confetti burst
  //   fireConfetti();
  //   
  //   // Fire confetti every 1.5 seconds for 5 seconds total
  //   const interval = setInterval(fireConfetti, 1500);
  //   
  //   // Stop after 5 seconds
  //   setTimeout(() => {
  //     clearInterval(interval);
  //   }, 5000);
  //   
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  // Function to fetch route from OSRM (Open Source Routing Machine)
  const fetchRoute = async (destination) => {
    if (!userLocation) {
      notifyError(t("Please enable location access to see the route"));
      return;
    }

    const destLat = parseFloat(destination.lat) || parseFloat(destination.latitude);
    const destLng = parseFloat(destination.lng) || parseFloat(destination.long) || parseFloat(destination.longitude);

    if (!destLat || !destLng) {
      notifyError(t("Location coordinates not available"));
      return;
    }

    setRouteLoading(true);
    setSelectedDestination(destination);

    try {
      // OSRM API for routing (free, no API key required)
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(coordinates);
        
        // Distance in kilometers (OSRM returns meters)
        const distanceKm = (route.distance / 1000).toFixed(1);
        setRouteDistance(distanceKm);
      } else {
        notifyError(t("Could not find a route to this location"));
        setRouteCoordinates([]);
        setRouteDistance(null);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      notifyError(t("Failed to fetch route. Please try again."));
      setRouteCoordinates([]);
      setRouteDistance(null);
    } finally {
      setRouteLoading(false);
    }
  };

  // Clear route when location filter changes
  const clearRoute = () => {
    setRouteCoordinates([]);
    setSelectedDestination(null);
    setRouteDistance(null);
  };
  
  // Steps carousel state (How It Works section)
  const stepsScrollRef = useRef(null);
  const stepsItemWidthRef = useRef(0); // cached item width to avoid layout reads on every tick
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stepsCount = 3; // Choose Your Car, Book & Pay, Pick Up & Drive

  // Scroll the steps carousel to a given index without forcing a reflow on
  // every call. scrollWidth is measured once and cached (invalidated on resize).
  const scrollToStep = (index) => {
    const container = stepsScrollRef.current;
    if (!container) return;
    if (!stepsItemWidthRef.current) {
      stepsItemWidthRef.current = container.scrollWidth / stepsCount;
    }
    container.scrollLeft = index * stepsItemWidthRef.current;
  };

  // Track mobile viewport (used to show mobile carousel dots).
  // matchMedia rather than a resize listener reading innerWidth — see the hook.
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Scroll-reveal for `.wow` elements. Replaces wow.js, which read layout on
  // every scroll event. Re-scans once the async sections have rendered so any
  // `.wow` markup inside them is picked up too.
  useScrollReveal([featuredCars.length, filteredLocations.length]);

  // The cached step width is only valid for one viewport size, so drop it
  // whenever the breakpoint flips and let it be re-measured lazily.
  useEffect(() => {
    stepsItemWidthRef.current = 0;
  }, [isMobile]);
  
  // Auto-scroll steps carousel on mobile (every 3 seconds)
  useEffect(() => {
    if (!isMobile) return;

    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % stepsCount;
      setCurrentStepIndex(currentIndex);
      
      // Scroll using cached width - CSS has scroll-behavior: smooth
      scrollToStep(currentIndex);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
    // isMobile is a real dependency: the auto-scroll should start when the
    // viewport crosses into mobile and stop when it leaves.
  }, [isMobile]);
  
  // Locations data array
  const locationsData = [
    { id: 1, name: "Casablanca", nameKey: "Casablanca", image: "/images/cities/casablanca-v2.webp", city: "Casablanca" },
    { id: 2, name: "Marrakech", nameKey: "Marrakech", image: "/images/cities/Marrakech-v2.webp", city: "Marrakech" },
    { id: 3, name: "Agadir", nameKey: "Agadir", image: "/images/cities/Agadir-v2.webp", city: "Agadir" },
    { id: 4, name: "Fes", nameKey: "Fes", image: "/images/cities/Fes-v2.webp", city: "Fes" },
    { id: 5, name: "Rabat", nameKey: "Rabat", image: "/images/cities/rabat-v2.webp", city: "Rabat" },
    { id: 6, name: "Tetouan", nameKey: "Tetouan", image: "/images/cities/Tetouan-v2.webp", city: "Tetouan" },
  ];

  // Leaflet doesn't require an API key - it's free and open source!


  useEffect(() => {
    // Fetch featured cars
    fetchFeaturedCars();
    
    // Fetch cities first, then locations (locations depend on cities for correct IDs)
    fetchCities();

    // Handle hash navigation (e.g., #locations)
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    } else {
      // Scroll to top only if no hash
      window.scrollTo(0, 0);
    }
    
    // EDC Promo Logic
    const edcPromoConfirmed = localStorage.getItem('edc_promo_confirmed');
    const edcJustVerified = sessionStorage.getItem('edc_just_verified');
    
    // If user just verified from EDC page, confirm the promo permanently
    // so the banner stays visible even when the form re-renders
    if (edcJustVerified === 'true') {
      localStorage.setItem('edc_promo_confirmed', 'true');
      sessionStorage.removeItem('edc_just_verified');
    }
    
    // Clear EDC promo only if it was never confirmed
    if (edcPromoConfirmed !== 'true' && edcJustVerified !== 'true') {
      localStorage.removeItem('edc_promo_code');
      localStorage.removeItem('edc_verification');
      localStorage.removeItem('edc_promo_confirmed');
    }
  }, [language]);

  // Both of these sit below the fold and pull in heavy dependencies — Leaflet
  // plus a grid of @2x CartoCDN raster tiles (~250 KiB) for the map, and Swiper
  // (~102 KiB) for the mobile carousel. Mounting them on intersection keeps both
  // off the critical path; see the hook for why React.lazy alone is not enough.
  const [mapWrapperRef, mapInView] = useInViewOnce();
  const [carouselRef, carouselInView] = useInViewOnce();

  // Get user's current location for map marker.
  //
  // This used to call getCurrentPosition() unconditionally on mount, which threw
  // the browser's location permission prompt at every first-time visitor before
  // they had done anything — Lighthouse flags it (geolocation-on-start) and it
  // reads as hostile on a landing page. The position is only used to drop an
  // optional "you are here" marker on the contact map, so it is not worth a
  // prompt: we now read it only when the user has already granted permission on
  // a previous visit, and stay silent otherwise.
  useEffect(() => {
    if (!navigator.geolocation) return;

    let cancelled = false;
    const readPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return;
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Denied or unavailable — the marker is optional, so just skip it.
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    };

    // Permissions API is not available in every browser; where it is missing we
    // simply do not read the location rather than risk an unsolicited prompt.
    if (!navigator.permissions?.query) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (!cancelled && status.state === "granted") readPosition();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchFeaturedCars = async () => {
    setLoading(true);
    try {
      const response = await simpleGetCall(`${configWeb.BASE_URL}car/featured`);
      if (response.data.success) {
        setFeaturedCars(response.data.data.slice(0, 4)); // Get only 4 featured cars
      }
    } catch (error) {
      console.error("Error fetching featured cars:", error);
    } finally {
      setLoading(false);
    }
  };

  // The map shows the locations the API returns and nothing else.
  //
  // There used to be a getFakeLocations() helper here that appended nineteen
  // invented UAE branches — Dubai Marina, Abu Dhabi Corniche, Ras Al Khaimah —
  // each gated on finding a matching city by substring. "Marrakech" contains
  // "rak", so getCityId("rak") matched it and the five Ras Al Khaimah branches
  // were filed under Marrakech and drawn in the Persian Gulf. Route Facile does
  // not operate in the UAE, and an empty map beats an invented one.
  const fetchLocations = async () => {
    try {
      const url = `${configWeb.GET_PICKUP_LOCATION("pickup", getApiLang(language))}`;
      const response = await simpleGetCall(url);
      if (response?.error || !Array.isArray(response)) {
        setPickupLocations([]);
        setFilteredLocations([]);
        return;
      }

      const locations = response.filter((loc) => !loc.is_virtual);
      setPickupLocations(locations);

      if (selectedCityId === "all" || !selectedCityId) {
        setFilteredLocations(locations);
      } else {
        const filtered = locations.filter(
          (loc) => loc.city_id === parseInt(selectedCityId)
        );
        setFilteredLocations(filtered);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setPickupLocations([]);
      setFilteredLocations([]);
    }
  };

  const fetchCities = async () => {
    try {
      const url = `${configWeb.GET_CITIES}?lang=${getApiLang(language)}`;
      const response = await simpleGetCall(url);
      if (!response?.error && Array.isArray(response)) {
        setCitiesArray(response);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  // Update locations when cities are loaded or language changes
  useEffect(() => {
    if (citiesArray.length > 0) {
      fetchLocations();
    }
  }, [citiesArray.length, language]);

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);
    clearRoute(); // Clear route when changing filter
    if (cityId === "all" || !cityId) {
      // Show all locations
      setFilteredLocations(pickupLocations);
    } else {
      // Filter by city
      const filtered = pickupLocations.filter(loc => loc.city_id === parseInt(cityId));
      setFilteredLocations(filtered);
    }
  };

  // Handle location card click
  const handleLocationClick = (location) => {
    fetchRoute(location);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterLoading(true);
    try {
      const response = await simpleGetCall(`${configWeb.BASE_URL}newsletter/subscribe`, {
        email: newsletterEmail
      });
      if (response.data.success) {
        notifySuccess(t("Successfully subscribed to newsletter!"));
        setNewsletterEmail("");
      }
    } catch (error) {
      notifyError(t("Failed to subscribe. Please try again."));
    } finally {
      setNewsletterLoading(false);
    }
  };


  // SEO structured data for car rental business
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://routefacilecarrental.com/#organization",
        "name": "Route Facile",
        "alternateName": ["ROUTE FACILE", "Route Facile Car Rental", "روت فاسيل", "روت فاسيل لتأجير السيارات"],
        "url": "https://routefacilecarrental.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://routefacilecarrental.com/images/logo-header.png",
          "width": 200,
          "height": 60
        },
        "image": "https://routefacilecarrental.com/og-image.jpg",
        "description": language === 'ar' 
          ? "روت فاسيل لتأجير السيارات — مقرّنا في مراكش مع توصيل في جميع أنحاء المغرب: الدار البيضاء، الرباط، أكادير، فاس، طنجة وتطوان."
          : "Route Facile — car rental based in Marrakech with delivery across Morocco: Casablanca, Rabat, Agadir, Fes, Tangier and Tetouan. Daily, weekly and monthly rentals.",
        "foundingDate": "2015",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Marrakech",
          "addressRegion": "Marrakech-Safi",
          "addressCountry": "MA"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+212655585859",
            "contactType": "customer service",
            "areaServed": "MA",
            "availableLanguage": ["English", "Arabic", "French"]
          },
          {
            "@type": "ContactPoint",
            "telephone": "+212655585859",
            "contactType": "reservations",
            "areaServed": "MA",
            "availableLanguage": ["English", "Arabic", "French"]
          }
        ],
        "sameAs": [
          "https://www.facebook.com/routefacilecarrental",
          "https://www.instagram.com/routefacilecarrental/",
          "https://twitter.com/routefacile",
          "https://www.linkedin.com/company/routefacile",
          "https://www.youtube.com/@routefacile"
        ],
        "areaServed": [
          { "@type": "City", "name": "Marrakech" },
          { "@type": "City", "name": "Casablanca" },
          { "@type": "City", "name": "Rabat" },
          { "@type": "City", "name": "Agadir" },
          { "@type": "City", "name": "Tanger" },
          { "@type": "City", "name": "Fes" },
          { "@type": "City", "name": "Oujda" }
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://routefacilecarrental.com/#localbusiness",
        "name": "Route Facile",
        "image": "https://routefacilecarrental.com/og-image.jpg",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Marrakech",
          "addressRegion": "Marrakech-Safi",
          "addressCountry": "MA"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 31.629472,
          "longitude": -7.981084
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
        // No aggregateRating. It claimed 4.8 from 2,500 reviews, which is not
        // tied to any real profile — Google treats invented review markup as
        // spam and can issue a manual action. Put it back only with the exact
        // figures shown on the Google Business Profile (see reviewsConfig.js).
      },
      {
        "@type": "WebSite",
        "@id": "https://routefacilecarrental.com/#website",
        "url": "https://routefacilecarrental.com",
        "name": "Route Facile",
        "description": "Car rental across Morocco",
        "publisher": { "@id": "https://routefacilecarrental.com/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://routefacilecarrental.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": ["en", "ar"]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What documents do I need to rent a car in Morocco?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A valid driving licence held for at least one year, plus your passport or Moroccan national ID card. Visitors whose licence is not in Latin script should also carry an International Driving Permit."
            }
          },
          {
            "@type": "Question",
            "name": "What is the minimum age to rent a car in Morocco?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The minimum age to rent a car with Route Facile in Morocco is 21 years old. Some premium vehicles may require drivers to be 25 or older."
            }
          },
          {
            "@type": "Question",
            "name": "Does Route Facile offer monthly car rental?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Route Facile offers flexible monthly car rental plans with free delivery, 24/7 roadside assistance, and competitive rates starting from MAD 1,500 per month."
            }
          },
          {
            "@type": "Question",
            "name": "Can I pick up a car in one Moroccan city and drop it in another?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Route Facile offers one-way rentals between its pick-up points across Morocco, including Marrakech, Casablanca, Rabat, Agadir, Tangier and Fes."
            }
          },
          {
            "@type": "Question",
            "name": "How much does it cost to rent a car in Morocco?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Car rental in Morocco starts from MAD 400 per day for economy cars. Prices vary by vehicle, season and rental duration."
            }
          },
          {
            "@type": "Question",
            "name": "Does Route Facile provide car delivery service?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Route Facile delivers to airports, city centres and hotels across Morocco, and collects the car at the end of your rental."
            }
          },
          {
            "@type": "Question",
            "name": "What types of cars are available for rent at Route Facile?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Route Facile offers a wide range of vehicles including economy cars (Toyota Yaris, Nissan Sunny), sedans (Toyota Camry, Honda Accord), SUVs (Toyota Fortuner, Nissan Patrol), luxury cars (Mercedes, BMW), and commercial vehicles."
            }
          },
          {
            "@type": "Question",
            "name": "What is included in the monthly car rental package?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Route Facile monthly rental includes: comprehensive insurance, 24/7 roadside assistance, free delivery & pickup, flexible mileage packages, regular maintenance, and the option to swap vehicles during the rental period."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://routefacilecarrental.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Car Rental",
            "item": "https://routefacilecarrental.com/booking-engine"
          }
        ]
      },
      {
        "@type": "HowTo",
        "name": "How to Rent a Car with Route Facile",
        "description": "Simple 3-step process to rent a car in Morocco with Route Facile",
        "totalTime": "PT5M",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Choose Your Car",
            "text": "Browse our wide selection of vehicles and choose the car that suits your needs and budget. Filter by car type, price, or features.",
            "position": 1
          },
          {
            "@type": "HowToStep",
            "name": "Book & Pay",
            "text": "Complete your booking online with our secure payment system. Pay now for the best rates or choose pay-at-pickup option.",
            "position": 2
          },
          {
            "@type": "HowToStep",
            "name": "Pick Up & Drive",
            "text": "Collect your car at one of our pick-up points across Morocco, or have it delivered to your hotel or address.",
            "position": 3
          }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Popular Car Categories",
        // These 4 tiers are Service, not Product: nobody takes ownership,
        // ships, or returns a rental car the way Merchant Listings expects
        // (gtin, shippingDetails, hasMerchantReturnPolicy). "Product" put
        // this whole block in Google's Merchant-listing validation track,
        // which then flagged it for missing e-commerce fields that don't
        // apply to a rental — the fix is the right type, not fake fields.
        // Matches the "Service" node below for the business itself.
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Service",
              "name": "Economy Car Rental",
              "description": "Affordable economy cars for budget-conscious travelers. Fuel-efficient and easy to drive.",
              "offers": {
                "@type": "Offer",
                "priceCurrency": "MAD",
                "price": "80",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock"
              }
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Service",
              "name": "SUV Rental",
              "description": "Spacious SUVs for family trips, the Atlas mountains and desert routes across Morocco.",
              "offers": {
                "@type": "Offer",
                "priceCurrency": "MAD",
                "price": "150",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock"
              }
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Service",
              "name": "Luxury Car Rental",
              "description": "Premium luxury vehicles for special occasions and business travel.",
              "offers": {
                "@type": "Offer",
                "priceCurrency": "MAD",
                "price": "350",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock"
              }
            }
          },
          {
            "@type": "ListItem",
            "position": 4,
            "item": {
              "@type": "Service",
              "name": "Monthly Car Rental",
              "description": "Flexible monthly subscription with free delivery and 24/7 support.",
              "offers": {
                "@type": "Offer",
                "priceCurrency": "MAD",
                "price": "1500",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock"
              }
            }
          }
        ]
      },
      {
        "@type": "Service",
        "serviceType": "Car Rental",
        "provider": { "@id": "https://routefacilecarrental.com/#organization" },
        // This Service node listed the previous owner's GCC markets, which told
        // Google the business operates in six countries it has never served.
        "areaServed": [
          { "@type": "Country", "name": "Morocco" },
          { "@type": "City", "name": "Marrakech" },
          { "@type": "City", "name": "Casablanca" },
          { "@type": "City", "name": "Rabat" },
          { "@type": "City", "name": "Agadir" },
          { "@type": "City", "name": "Tanger" },
          { "@type": "City", "name": "Fes" }
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Car Rental Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Daily Car Rental"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Weekly Car Rental"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Monthly Car Rental"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Corporate Car Leasing"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Airport Pick-up and Delivery"
              }
            }
          ]
        }
      }
    ]
  };

  // Keywords for the market this business actually serves. These listed the GCC
  // and Egypt — Dubai, Riyadh, Doha, Cairo — inherited from the template, which
  // pulled the page towards searches Route Facile cannot fulfil.
  const seoKeywords = language === 'ar'
    ? "تأجير سيارات المغرب، كراء سيارات المغرب، تأجير سيارات مراكش، تأجير سيارات الدار البيضاء، تأجير سيارات الرباط، تأجير سيارات أكادير، تأجير سيارات طنجة، تأجير سيارات فاس، تأجير سيارات المطار، تأجير سيارات شهري، تأجير سيارات يومي، سيارات للإيجار بسائق، روت فاسيل"
    : language === 'fr'
    ? "location voiture Maroc, louer voiture Maroc, location voiture Marrakech, location voiture Casablanca, location voiture Rabat, location voiture Agadir, location voiture Tanger, location voiture Fès, location voiture aéroport Maroc, location longue durée Maroc, location voiture mensuelle, Route Facile"
    : "car rental Morocco, rent a car Morocco, car rental Marrakech, car rental Casablanca, car rental Rabat, car rental Agadir, car rental Tangier, car rental Fes, airport car rental Morocco, monthly car rental Morocco, long term car rental Morocco, cheap car rental Morocco, Route Facile"

  // SEO meta description — Route Facile car rental Morocco
  const seoDescription = language === 'ar'
    ? "روت فاسيل – شركة تأجير سيارات بالمغرب. حجز أونلاين فوري، أسعار تنافسية، تأمين شامل، كيلومتراج غير محدود في مراكش وكازابلانكا والرباط وأكادير وطنجة وفاس."
    : language === 'fr'
    ? "Route Facile — location de voitures au Maroc. Véhicules récents, kilométrage illimité. Réservation instantanée à Marrakech, Casablanca, Rabat, Agadir, Tanger et Fès."
    : "Route Facile — Car Rental in Morocco. Modern vehicles, unlimited mileage. Instant booking in Marrakech, Casablanca, Rabat, Agadir, Tangier and Fes.";

  // SEO title — Route Facile Morocco
  const seoTitle = language === 'ar'
    ? "روت فاسيل | تأجير سيارات بالمغرب — مراكش، كازابلانكا، الرباط، أكادير"
    : language === 'fr'
    ? "Route Facile | Location de Voitures au Maroc — Marrakech, Casablanca, Rabat, Agadir"
    : "Route Facile | Car Rental Morocco — Marrakech, Casablanca, Rabat, Agadir";

  return (
    <>
      <MetaHelmet 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        ogTitle={seoTitle}
        ogDescription={seoDescription}
        ogImage="https://routefacilecarrental.com/og-image.jpg"
        ogUrl={`https://routefacilecarrental.com/${language}`}
        twitterTitle={seoTitle}
        twitterDescription={seoDescription}
        twitterImage="https://routefacilecarrental.com/twitter-card.jpg"
        twitterCard="summary_large_image"
        canonicalUrl={`https://routefacilecarrental.com/en`}
      />
      
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Eid Al-Adha popup disabled — replaced by the site-wide DemoNoticeBanner */}
      {/*
      <Suspense fallback={null}>
        <RamadanFestive />
      </Suspense>
      */}

      <HeroSection />

      {/* Features Strip — 3-up, matches hero mockup */}
      <section className="rf-features-strip">
        <Container>
          <div className="rf-features-grid">
            <div className="rf-feature-item">
              <span className="rf-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <div className="rf-feature-text">
                <strong>{t("No Deposit")}</strong>
                <span>{t("No upfront payment required")}</span>
              </div>
            </div>
            <div className="rf-feature-item">
              <span className="rf-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <div className="rf-feature-text">
                <strong>{t("Unlimited Mileage")}</strong>
                <span>{t("Drive as far as you like")}</span>
              </div>
            </div>
            <div className="rf-feature-item">
              <span className="rf-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l3.2 4-2.5 2.5-2-.5a.5.5 0 0 0-.5.8l2.5 2.5 2.5 2.5a.5.5 0 0 0 .8-.5l-.5-2 2.5-2.5 4 3.2a.5.5 0 0 0 .8-.5Z" />
                </svg>
              </span>
              <div className="rf-feature-text">
                <strong>{t("Free Airport Delivery")}</strong>
                <span>{t("We bring the car to you")}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Review-platform badges.
          These showed an identical "4.9 / 80+ Reviews" for Google, Tripadvisor
          and Trustpilot with nothing linking to a real profile, and the section
          below claimed "200+ Google reviews" — figures that contradicted each
          other and could not be checked. Each badge now renders only once its
          profile URL and real numbers are set in reviewsConfig.js, and links
          straight to that profile so a visitor can verify it. */}
      {(hasGoogleReviews() || TRIPADVISOR_URL || TRUSTPILOT_URL) && (
        <section className="rf-trust-strip">
          <Container>
            <h2 className="rf-trust-title">{t("Trusted by Travelers Worldwide")}</h2>
            <div className="rf-trust-grid">
              {hasGoogleReviews() && (
                <a className="rf-trust-item" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
                  <div className="rf-trust-logo rf-trust-google" aria-label="Google">
                    <img src={googleLogo} alt="Google" className="rf-trust-logo-img" />
                  </div>
                  <div className="rf-trust-rating"><span className="rf-trust-score">{GOOGLE_RATING}</span><span className="rf-trust-stars">{[0,1,2,3,4].map(s=><i key={s} className="fa-solid fa-star"></i>)}</span></div>
                  <span className="rf-trust-count">{GOOGLE_REVIEW_COUNT} {t("Reviews")}</span>
                </a>
              )}
              {TRIPADVISOR_URL && (
                <a className="rf-trust-item" href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer">
                  <div className="rf-trust-logo rf-trust-tripadvisor" aria-label="Tripadvisor">
                    <svg viewBox="0 0 40 24" aria-hidden="true" className="rf-trust-owl">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="#00AA6C" strokeWidth="2"/>
                      <circle cx="28" cy="12" r="9" fill="none" stroke="#00AA6C" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3.4" fill="#00AA6C"/>
                      <circle cx="28" cy="12" r="3.4" fill="#00AA6C"/>
                    </svg>
                    <span>tripadvisor</span>
                  </div>
                </a>
              )}
              {TRUSTPILOT_URL && (
                <a className="rf-trust-item" href={TRUSTPILOT_URL} target="_blank" rel="noopener noreferrer">
                  <div className="rf-trust-logo rf-trust-trustpilot" aria-label="Trustpilot">
                    <img src={trustpilotLogo} alt="Trustpilot" className="rf-trust-logo-img" />
                  </div>
                </a>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Customer-quote marquee.
          The quotes below were placeholder copy (Sarah M., Karim, Layla …) with
          no link to a real review, presented alongside a "Trusted by thousands"
          headline and a "200+ Google reviews" figure that contradicted the "80+"
          badge above. The whole block now renders only once TESTIMONIALS and the
          Google figures in reviewsConfig.js are populated with real, verifiable
          reviews. */}
      {TESTIMONIALS.length > 0 && (() => {
        const reviews = [
          { name: "Sarah M.",   date: "June 2026",  rating: 5, text: "Excellent service! The car was spotless and delivered right to the airport. Super professional team." },
          { name: "Karim B.",   date: "May 2026",   rating: 5, text: "Best car rental in Morocco. Unlimited mileage made our road trip to the south totally stress-free!" },
          { name: "Layla R.",   date: "June 2026",  rating: 5, text: "24/7 support is real — had a small issue at midnight and they resolved it in minutes. Incredible." },
          { name: "Ahmed T.",   date: "April 2026", rating: 5, text: "Great cars, great prices and WhatsApp booking was instant. Highly recommend for Marrakech visits." },
          { name: "Emma J.",    date: "May 2026",   rating: 5, text: "Free delivery to Casablanca airport, full insurance, zero hidden fees. Exactly what you want." },
          { name: "Youssef D.", date: "June 2026",  rating: 5, text: "Picked up in Agadir, dropped off in Tangier. No extra charge. Car was brand new. Outstanding!" },
          { name: "Nadia F.",   date: "June 2026",  rating: 5, text: "Booked via WhatsApp in under 5 minutes. The car was clean, new and delivered on time. Love it!" },
          { name: "Omar S.",    date: "May 2026",   rating: 5, text: "Transparent pricing, friendly staff and real unlimited km. Route Facile is the only way to go." },
        ];
        const GoogleIcon = () => (
          <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
            <path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.9 14.4-5l-6.7-5.5C29.5 37 26.9 38 24 38c-6 0-10.6-3.8-12.3-9.1l-7 5.4C8.1 41.8 15.4 46 24 46z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 2.4-2.3 4.4-4.3 5.8l6.7 5.5C42.1 36.3 45 30.6 45 24c0-1.3-.2-2.7-.5-4z"/>
          </svg>
        );
        const Card = ({ r }) => (
          <div className="rf-rq-card">
            <div className="rf-rq-top">
              <div className="rf-rq-avatar">{r.name.charAt(0)}</div>
              <div className="rf-rq-meta">
                <strong>{r.name}</strong>
                <span>{r.date}</span>
              </div>
              <GoogleIcon />
            </div>
            <div className="rf-rq-stars">{[...Array(r.rating)].map((_,s)=><i key={s} className="fa-solid fa-star"></i>)}</div>
            <p className="rf-rq-text">{r.text}</p>
          </div>
        );
        const row1 = [...reviews.slice(0,4), ...reviews.slice(0,4)];
        const row2 = [...reviews.slice(4),   ...reviews.slice(4)];
        return (
          <section className="rf-reviews-marquee-section">
            {/* Header */}
            <div className="rf-rq-header">
              <div className="rf-rq-left">
                <div className="rf-rq-google-badge">
                  <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                    <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
                    <path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.9 14.4-5l-6.7-5.5C29.5 37 26.9 38 24 38c-6 0-10.6-3.8-12.3-9.1l-7 5.4C8.1 41.8 15.4 46 24 46z"/>
                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 2.4-2.3 4.4-4.3 5.8l6.7 5.5C42.1 36.3 45 30.6 45 24c0-1.3-.2-2.7-.5-4z"/>
                  </svg>
                  <span>{t("What our customers say")}</span>
                </div>
                <h2 className="rf-rq-title">{t("Trusted by thousands")}<br/><span>{t("across Morocco")}</span></h2>
              </div>
              <div className="rf-rq-score-block">
                <span className="rf-rq-score-num">4.9</span>
                <div>
                  <div className="rf-rq-score-stars">{[1,2,3,4,5].map(s=><i key={s} className="fa-solid fa-star"></i>)}</div>
                  <span className="rf-rq-score-label">{t("Based on 200+ Google reviews")}</span>
                </div>
              </div>
            </div>

            {/* Row 1 — scrolls left */}
            <div className="rf-rq-track-wrap rf-rq-fade">
              <div className="rf-rq-track rf-rq-scroll-left">
                {row1.map((r, i) => <Card key={i} r={r} />)}
              </div>
            </div>

            {/* Row 2 — scrolls right */}
            <div className="rf-rq-track-wrap rf-rq-fade" style={{marginTop: 16}}>
              <div className="rf-rq-track rf-rq-scroll-right">
                {row2.map((r, i) => <Card key={i} r={r} />)}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Featured Cars Section */}
      <section className="gap">
        <Container>
          <Row className="g-4">
            {loading ? (
              <Col className="text-center d-flex align-items-center justify-content-center" style={{ minHeight: 380 }}>
                <Spinner animation="border" variant="primary" /> 
              </Col>
            ) : (
      
              featuredCars.map((car, index) => (
                <Col lg={3} sm={6} key={car.id} className="wow fadeInUp" data-wow-delay={`.${3 + index * 2}s`}>
                  <div className={`car-book ${index % 2 === 1 ? 'two' : index % 3 === 2 ? 'three' : 'four'}`}>
                    <div className="save-upto">
                      <img src={percentageIcon} alt="Save" />
                      <h6>{t("Save Upto")} 15%</h6>
                    </div>
                    <img 
                      src={require("../carbook-assets/img/car-back-img.png")} 
                      alt="Background" 
                      className="car-back"
                      loading="lazy"
                      decoding="async"
                    />
                    <img 
                      loading="lazy"
                      decoding="async"
                      src={car.car_image || "https://placehold.co/258x160"} 
                      alt={car.car_name}
                    />
                    <h3>{car.car_name}</h3>
                    <ul>
                      <li>
                        <i className="flaticon-speedometer"></i>
                        {car.mileage || t("Unlimited")} {t("km")}
                      </li>
                      <li>
                        <i className="flaticon-coin"></i>
                        {fmt(car.daily_rate)}/{t("day")}
                      </li>
                    </ul>
                    <a href={`/${language}/car/${car.id}`}>
                      {t("Book Now")}<i className="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                </Col>
              ))
            )}
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="gap no-top steps-section">
        <Container>
          <div className="heading">
            <h2>{t("Rent a car in 3 simple steps")}</h2>
          </div>
          <div className="steps-scroll-container" ref={stepsScrollRef}>
            <div className="steps-scroll-wrapper">
              <div className="stap wow fadeInUp" data-wow-delay=".3s">
                <div className="step-img-wrapper">
                  <img src={step1Img} alt={t("Choose Your Car")} loading="lazy" decoding="async" />
                </div>
                <h3>{t("Choose Your Car")}</h3>
                <p>{t("Select from our wide range of vehicles that suit your needs and budget.")}</p>
              </div>
              <div className="stap wow fadeInUp" data-wow-delay=".5s">
                <div className="step-img-wrapper">
                  <img src={step2Img} alt={t("Book & Pay")} loading="lazy" decoding="async" />
                </div>
                <h3>{t("Book & Pay")}</h3>
                <p>{t("Complete your booking with our secure online payment system. Pay online or at pickup.")}</p>
              </div>
              <div className="stap wow fadeInUp" data-wow-delay=".7s">
                <div className="step-img-wrapper">
                  <img src={step3Img} alt={t("Pick Up & Drive")} loading="lazy" decoding="async" />
                </div>
                <h3>{t("Pick Up & Drive")}</h3>
                <p>{t("Collect your car from your chosen location and enjoy your journey.")}</p>
              </div>
            </div>
          </div>
          
          {/* Mobile steps carousel dots - OUTSIDE scroll container */}
          {isMobile && (
            <div className="steps-carousel-dots">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`steps-dot ${currentStepIndex === index ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentStepIndex(index);
                    scrollToStep(index);
                  }}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Our Services Section */}
      {/* <section className="gap no-top our-services-section" id="services">
        <Container>
          <div className="heading">
            <h2>
            <span>{t("Our Services")}</span>
            </h2>
            <h3>
              {t("Benefit from day one and get on the road")}{" "}
              {t("faster.")}
            </h3>
          </div>
          <Row className="g-4">
            {[
              { title: "Daily & Weekly Rentals", link: `/${language}/booking-engine`, image: serviceDailyWeekly },
              { title: "Monthly Subscriptions", link: `/${language}/monthly-rental`, image: serviceMonthly },
              { title: "Corporate Leasing", link: `/${language}/fleet-leasing`, image: serviceCorporate },
              { title: "Staff Transportation", link: `/${language}/commercialvehicles`, image: serviceStaff },
              { title: "School Transportation", link: `/${language}/commercialvehicles`, image: serviceSchool },
              { title: "Commercial Vehicle Leasing", link: `/${language}/commercialvehicles`, image: serviceCommercial },
              { title: "Electric Car Rentals", link: `/${language}/ourfleetlist`, image: serviceElectric },
              { title: "Chauffeur Services", link: `/${language}/chauffeur-module`, image: serviceChauffeur },
            ].map((service, index) => (
              <Col lg={3} md={4} sm={6} key={index} className="wow fadeInUp" data-wow-delay={`.${3 + index}s`}>
                <a href={service.link} className="service-card-link">
                  <div className="service-card">
                    <div className="service-card-image">
                      <img src={service.image} alt={t(service.title)} loading="lazy" decoding="async" />
                    </div>
                    <h3>{t(service.title)}</h3>
                  </div>
                </a>
              </Col>
            ))}
          </Row>
        </Container>
      </section> */}

      {/* Benefit Section - Hidden as per request */}
      {/* <section className="gap no-top benefit-section">
        <Container>
          <div className="heading">
            <h2>
              {t("Enjoy instant benefits and hit the road")}{" "}
              <span>{t("faster.")}</span>
            </h2>
          </div>
          <Row>
            <Col lg={8} className="wow fadeInUp" data-wow-delay=".5s">
              <Row>
                <Col lg={6}>
                  <div className="service">
                    <div>
                      <h3>{t("Flexible Monthly Car Rentals")}</h3>
                      <i className="flaticon-car-rental"></i>
                    </div>
                    <p>
                      {t(
                        "Experience the ease of flexible monthly plans. Designed for comfort and convenience every step of the way."
                      )}
                    </p>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="service">
                    <div>
                      <h3>{t("Fast & Hassle-Free Process")}</h3>
                      <i className="flaticon-booking"></i>
                    </div>
                    <p>
                      {t(
                        "From selection to pickup, every step made effortless."
                      )}
                    </p>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="service pb-lg-0">
                    <div>
                      <h3>{t("Affordable Rental Rates")}</h3>
                      <i className="flaticon-discount"></i>
                    </div>
                    <p>
                      {t(
                        "Rent with confidence, at rates you'll love."
                      )}
                    </p>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="service pb-lg-0">
                    <div>
                      <h3>{t("One-Way Car Rentals")}</h3>
                      <i className="flaticon-rental"></i>
                    </div>
                    <p>
                      {t(
                        "Pick up here, drop off there. Simple and stress-free."
                      )}
                    </p>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col lg={4} className="wow fadeInUp" data-wow-delay=".5s">
              <div className="video img-hover reveal1 it-reveal-animation">
                <figure>
                  <img
                    src={guySmilingImg}
                    alt="img"
                    className="img-fluid"
                  />
                </figure>
              </div>
            </Col>
          </Row>
        </Container>
      </section> */}


      {/* Locations Section */}
      <section id="locations" className="gap">
        <Container>
          <div className="heading">
            <span>{t("Check out our Locations")}</span>
            <h2>
              {t("Discover our branches across the country")}{" "}
              <span>{t("Our Locations")}</span>
            </h2>
          </div>
          
          {/* Desktop Grid View */}
          <div className="locations locations-8-items locations-desktop">
            {locationsData.map((location, index) => (
              <div key={location.id} className="locations-address img-hover wow fadeInUp" data-wow-delay={`.${2 + index * 0.1}s`}>
                <figure className="location-image-wrapper location-svg">
                  <img 
                    src={location.image} 
                    alt={location.name}
                    loading="lazy"
                    decoding="async"
                    width="200"
                    height="400"
                  />
                </figure>
                <a href={`/${language}/location?city=${location.city}`}>{t(location.nameKey)}</a>
              </div>
            ))}
          </div>

          {/* Mobile Carousel View — mounted only once it nears the viewport, so
              Swiper (~102 KiB, and a measurable source of forced reflow) stays
              off the initial load for a section that sits below the fold. */}
          <div ref={carouselRef} className="locations-carousel-mobile" style={{ display: 'block', visibility: 'visible', minHeight: '450px' }}>
            {carouselInView ? (
              <Suspense fallback={<div style={{ minHeight: '450px' }} />}>
                <LocationsCarousel locationsData={locationsData} language={language} t={t} />
              </Suspense>
            ) : (
              <div style={{ minHeight: '450px' }} aria-hidden="true" />
            )}
          </div>
        </Container>
      </section>

      {/* Locations Section with Map - Aligned Design */}
      <section className="locations-map-section gap">
        <Container>
          <div className="locations-map-container">
            {/* Map */}
            <div className="locations-map-wrapper" ref={mapWrapperRef}>
              {mapInView ? (
                <Suspense fallback={<div style={{ width: '100%', height: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f4f7' }}><Spinner animation="border" size="sm" /></div>}>
                  <LocationMap
                    filteredLocations={filteredLocations}
                    userLocation={userLocation}
                    routeCoordinates={routeCoordinates}
                    language={language}
                    t={t}
                  />
                </Suspense>
              ) : (
                // Same footprint as the map so nothing shifts when it mounts.
                <div style={{ width: '100%', height: '100%', minHeight: '500px', background: '#f2f4f7' }} aria-hidden="true" />
              )}
            </div>
            
            {/* Overlay Content */}
            <div className="locations-overlay">
              <div className="locations-overlay-content">
              <span className="locations-subtitle text-white">{t("Check out our Locations")}</span>
              <h2 className="locations-title">{t("Our Locations")}</h2>
              
              <select
                id="city-select-locations"
                className="locations-select"
                aria-label={t("Our Locations")}
                value={selectedCityId || "all"}
                onChange={handleCityChange}
              >
                <option value="all">{t("All locations")}</option>
                {Array.isArray(citiesArray) && citiesArray.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              
              {filteredLocations.length > 0 && (
                <div className="locations-cards">
                  {filteredLocations.slice(0, 4).map((location, index) => (
                    <div 
                      key={location.id} 
                      className={`location-card ${selectedDestination?.id === location.id ? 'location-card-selected' : ''}`}
                      onClick={() => handleLocationClick(location)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="location-card-icon">
                        {routeLoading && selectedDestination?.id === location.id ? (
                          <Spinner animation="border" size="sm" variant="light" />
                        ) : (
                          <i className="flaticon-pin"></i>
                        )}
                      </div>
                      <div className="location-card-info">
                        {/* h3, not h4: these sit directly under the "Our
                            Locations" h2, and skipping a level breaks the
                            document outline for screen readers. */}
                        <h3 className="location-card-title">{location.name}</h3>
                        <p>{location.address}</p>
                        {selectedDestination?.id === location.id && routeDistance && (
                          <p className="location-distance">
                             {routeDistance} km {t("from your location")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Newsletter Section moved to Layout.jsx - appears on all pages after App Download section */}

    </>
  );
};

export default HomeNew;
