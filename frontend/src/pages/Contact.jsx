import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import "../styles/contact.css";
import contactBanner from "../assets/all-images/banners/contact-us-header-banner.png";
import { Form } from "react-bootstrap";
import configWeb from "../config.js/configWeb";
import { simpleGetCall, simplePostCall, getApiLang } from "../config.js/SetUp";
import { useSelector } from "react-redux";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
import { trackGenerateLead } from "../SharedComponent/tracking";
import { useLocation } from "react-router-dom";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import { Helmet } from "react-helmet";

const Contact = () => {
  const location = useLocation();
  const { car_id } = location.state || {};
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const isRTL = language === "ar";

  const [enquiryState, setEnquiryState] = useState({
    first_name: "",
    last_name: "",
    phone_code: "212",   // Morocco default
    phone_number: "",
    email: "",
    type: "",
    duration: "",
    car_id: car_id || "",
    city_id: "",
    detail: "",
  });

  const [validated, setValidated] = useState(false);
  const [countries, setCountries] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [carListArray, setCarListArray] = useState([]);
  const [carsLoaded, setCarsLoaded] = useState(false);
  const [enquiry_loading, set_enquiry_loading] = useState(false);

  // Keep a ref so postEnquireMain never stales on enquiryState
  const enquiryRef = useRef(enquiryState);
  useEffect(() => { enquiryRef.current = enquiryState; }, [enquiryState]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEnquiryState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getCountriesData = useCallback(() => {
    const url = `${configWeb.GET_COUNTRY_LIST}?lang=${getApiLang(language)}&page_size=260`;
    simpleGetCall(url)
      .then((res) => { setCountries(Array.isArray(res?.data) ? res.data : []); })
      .catch(() => {});
  }, [language]);

  const citiesData = useCallback(() => {
    const url = `${configWeb.GET_CITIES}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        setCitiesArray(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
      })
      .catch(() => {});
  }, [language]);

  const getCars = useCallback(() => {
    const url = `${configWeb.GET_CAR_LIST}?lang=${getApiLang(language)}&page=1&page_size=200`;
    simpleGetCall(url)
      .then((res) => { if (!res?.error) setCarListArray(Array.isArray(res?.data) ? res.data : []); })
      .catch(() => {});
  }, [language]);

  // Lazy-load car list only when the dropdown is first opened
  const handleCarDropdownFocus = useCallback(() => {
    if (!carsLoaded) { getCars(); setCarsLoaded(true); }
  }, [carsLoaded, getCars]);

  // Countries + cities fire in parallel on mount; cars are deferred
  useEffect(() => {
    getCountriesData();
    citiesData();
  }, [getCountriesData, citiesData]);

  useEffect(() => { window.scroll(0, 0); }, []);

  const otherCountries = useMemo(() => countries.filter(c => c.phone_code !== "212"), [countries]);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `https://routefacilecarrental.com/${language}/contact`,
        "name": language === "ar" ? "تواصل معنا — روت فاسيل" : language === "fr" ? "Contactez-Nous — Route Facile" : "Contact Us — Route Facile",
        "description": language === "ar"
          ? "تواصل مع روت فاسيل لتأجير السيارات في المغرب. احصل على عرض أسعار أو استفسر عن أسطولنا."
          : language === "fr"
            ? "Contactez Route Facile pour la location de voiture au Maroc. Obtenez un devis personnalisé ou renseignez-vous sur notre flotte."
            : "Get in touch with Route Facile car rental Morocco. Request a quote or enquire about our fleet.",
        "url": `https://routefacilecarrental.com/${language}/contact`,
        "isPartOf": { "@id": "https://routefacilecarrental.com/#website" }
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://routefacilecarrental.com/#localbusiness",
        "name": "Route Facile",
        "url": "https://routefacilecarrental.com",
        "logo": "https://routefacilecarrental.com/images/logo-header.png",
        "image": "https://routefacilecarrental.com/images/logo-header.png",
        "telephone": "+212655585859",
        "email": "info@routefacilecarrental.com",
        "priceRange": "MAD",
        "areaServed": "MA",
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
        "openingHoursSpecification": [
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "20:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "09:00", "closes": "18:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Sunday"], "opens": "10:00", "closes": "16:00" }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://routefacilecarrental.com" },
          { "@type": "ListItem", "position": 2, "name": language === "ar" ? "تواصل معنا" : language === "fr" ? "Contactez-Nous" : "Contact Us", "item": `https://routefacilecarrental.com/${language}/contact` }
        ]
      }
    ]
  }), [language]);

  const jsonLdStr = useMemo(() => JSON.stringify(jsonLd), [jsonLd]);

  const postEnquireMain = useCallback(() => new Promise((resolve) => {
    const s = enquiryRef.current;
    const body = JSON.stringify({
      first_name: s.first_name,
      last_name: s.last_name,
      phone_code: s.phone_code,
      phone_number: s.phone_number,
      email: s.email,
      type: s.type,
      duration: s.duration,
      car_id: s.car_id ? s.car_id * 1 : null,
      city_id: s.city_id ? s.city_id * 1 : null,
      detail: s.detail,
    });
    set_enquiry_loading(true);
    simplePostCall(configWeb.POST_ENQUIRE, body)
      .then((res) => {
        if (res?.status === "success") {
          // Only after the server accepted it — a lead that failed to send is
          // not a lead.
          trackGenerateLead("contact_form");
          notifySuccess(t("Enquire Successfully"));
          resolve(true);
          setEnquiryState({ first_name: "", last_name: "", phone_code: "212", phone_number: "", email: "", type: "", duration: "", car_id: "", city_id: "", detail: "" });
        } else {
          notifyError(res?.message?.[0] || t("Something went wrong, please try again later"));
          resolve(false);
        }
      })
      .catch(() => { notifyError(t("Something went wrong, please try again later")); resolve(false); })
      .finally(() => { set_enquiry_loading(false); });
  }), [t]); // no enquiryState dependency — reads via ref

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) { e.stopPropagation(); setValidated(true); return; }
    const ok = await postEnquireMain();
    setValidated(!ok);
  }, [postEnquireMain]);

  return (
    <div className="ct-page" dir={isRTL ? "rtl" : "ltr"}>
      <MetaHelmet
        title={language === "ar" ? "تواصل معنا" : language === "fr" ? "Contactez-Nous" : "Contact Us"}
        description={language === "ar"
          ? "تواصل مع روت فاسيل لتأجير السيارات في المغرب. احصل على عرض أسعار مخصص لأسطولنا من السيارات الحديثة."
          : language === "fr"
            ? "Contactez Route Facile pour un devis personnalisé sur la location de voiture au Maroc. Réponse garantie en moins de 2 heures."
            : "Contact Route Facile for a personalized car rental quote in Morocco. Fast response within 2 hours. Fleet delivered across Casablanca, Rabat, Marrakech and more."}
        keywords={language === "ar"
          ? "تواصل مع روت فاسيل, تأجير سيارات المغرب, عرض سعر تأجير السيارات, حجز سيارة المغرب"
          : language === "fr"
            ? "contact location voiture Maroc, devis Route Facile, demande location voiture, louer voiture Casablanca"
            : "contact car rental Morocco, Route Facile quote, enquiry rent a car Morocco, car hire Casablanca Marrakech"}
        ogImage="https://routefacilecarrental.com/images/logo-header.png"
        ogTitle={language === "ar" ? "تواصل معنا — روت فاسيل" : language === "fr" ? "Contactez-Nous — Route Facile" : "Contact Us — Route Facile"}
        canonicalUrl={`https://routefacilecarrental.com/${language}/contact`}
        hreflangs={[
          { hreflang: "en", href: "https://routefacilecarrental.com/en/contact" },
          { hreflang: "ar", href: "https://routefacilecarrental.com/ar/contact" },
          { hreflang: "fr", href: "https://routefacilecarrental.com/fr/contact" },
          { hreflang: "x-default", href: "https://routefacilecarrental.com/en/contact" },
        ]}
      />
      <Helmet>
        <link rel="preload" as="image" href={contactBanner} />
        <script type="application/ld+json">{jsonLdStr}</script>
      </Helmet>

      {/* ── Hero ── */}
      <div className="ct-hero" style={{ backgroundImage: `url(${contactBanner})` }}>
        <div className="ct-hero-inner">
          <div className="ct-hero-badge">
            <i className="fa-solid fa-location-dot"></i>
            {t("Get In Touch")}
          </div>
          <h1>{t("Request a")} <span>{t("Quote")}</span></h1>
          <p>{t("Fill out the form below and we'll get back to you shortly")}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <section className="ct-body">
        <Container>
          <Row>
            {/* ── Sidebar ── */}
            <Col lg="4" md="12" className="mb-4 mb-lg-0">
              <div className="ct-sidebar">

                <div className="ct-info-card">
                  <div className="ct-info-icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div className="ct-info-content">
                    <h6>{t("Our Office")}</h6>
                    <p>{t("Marrakech, Morocco")}</p>
                    <p className="ct-info-note">{t("Delivery across Morocco")}</p>
                  </div>
                </div>

                <div className="ct-info-card">
                  <div className="ct-info-icon"><i className="fa-solid fa-phone"></i></div>
                  <div className="ct-info-content">
                    <h6>{t("Call Us")}</h6>
                    <a href="tel:+212655585859" dir="ltr">+212 655 585 859</a>
                  </div>
                </div>

                <div className="ct-info-card">
                  <div className="ct-info-icon"><i className="fa-solid fa-envelope"></i></div>
                  <div className="ct-info-content">
                    <h6>{t("Email")}</h6>
                    <a href="mailto:routefacilerental@gmail.com">routefacilerental@gmail.com</a>
                  </div>
                </div>

                <a
                  href="https://api.whatsapp.com/send/?phone=212655585859&text=Hello+Route+Facile%21+I+would+like+information+about+car+rental.&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ct-whatsapp-btn"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  {t("Chat on WhatsApp")}
                </a>

                <div className="ct-hours-card">
                  <h6>{t("Working Hours")}</h6>
                  <div className="ct-hours-row">
                    <span><i className="fa-brands fa-whatsapp" style={{ color: "#25D366", marginInlineEnd: 6 }}></i>{t("WhatsApp Support")}</span>
                    <span>{t("24/7")}</span>
                  </div>
                  <div className="ct-hours-row">
                    <span>{t("Office")}</span>
                    <span>09:00 – 21:00</span>
                  </div>
                </div>

              </div>
            </Col>

            {/* ── Form ── */}
            <Col lg="8" md="12">
              <div className="ct-form-card">
                <div className="ct-form-header">
                  <h2>{t("Quotation")} <span>{t("Request")}</span></h2>
                  <p>{t("Complete the fields below — we respond within 2 hours")}</p>
                </div>

                <div className="ct-form-body">
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>

                    {/* Personal Info */}
                    <div className="ct-section-label">{t("Personal Information")}</div>
                    <Row>
                      <Col md={6}>
                        <div className="ct-field">
                          <label className="ct-label">{t("First Name")}<span className="ct-req">*</span></label>
                          <Form.Control required type="text" name="first_name" value={enquiryState.first_name}
                            onChange={handleChange} placeholder={t("Enter your first name")} className="ct-input" />
                          <Form.Control.Feedback type="invalid" className="ct-invalid">{t("Please enter your first name")}</Form.Control.Feedback>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="ct-field">
                          <label className="ct-label">{t("Last Name")}<span className="ct-req">*</span></label>
                          <Form.Control required type="text" name="last_name" value={enquiryState.last_name}
                            onChange={handleChange} placeholder={t("Enter your last name")} className="ct-input" />
                          <Form.Control.Feedback type="invalid" className="ct-invalid">{t("Please enter your last name")}</Form.Control.Feedback>
                        </div>
                      </Col>
                    </Row>

                    {/* Phone */}
                    <div className="ct-field">
                      <label className="ct-label">{t("Phone Number")}<span className="ct-req">*</span></label>
                      <div className="ct-phone-row">
                        <Form.Select name="phone_code" value={enquiryState.phone_code} onChange={handleChange} required className="ct-select">
                          <option value="212">🇲🇦 +212</option>
                          {otherCountries.map((c) => (
                            <option key={c.id} value={c.phone_code}>{c.code} +{c.phone_code}</option>
                          ))}
                        </Form.Select>
                        <Form.Control required type="tel" name="phone_number" value={enquiryState.phone_number}
                          onChange={handleChange} placeholder={t("Enter phone number")} className="ct-input"
                          pattern="[0-9]{7,15}" minLength={7} maxLength={15} />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="ct-field">
                      <label className="ct-label">{t("Email")}<span className="ct-req">*</span></label>
                      <Form.Control required type="email" name="email" value={enquiryState.email}
                        onChange={handleChange} placeholder={t("Enter your email")} className="ct-input" />
                      <Form.Control.Feedback type="invalid" className="ct-invalid">{t("Please enter a valid email address")}</Form.Control.Feedback>
                    </div>

                    {/* Rental Details */}
                    <div className="ct-section-label">{t("Rental Details")}</div>
                    <Row>
                      <Col md={6}>
                        <div className="ct-field">
                          <label className="ct-label">{t("City")}<span className="ct-req">*</span></label>
                          <Form.Select name="city_id" value={enquiryState.city_id} onChange={handleChange} required className="ct-select">
                            <option value="">{t("Select City")}</option>
                            {citiesArray.map((city) => (
                              <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                          </Form.Select>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="ct-field">
                          <label className="ct-label">{t("Duration")}<span className="ct-req">*</span></label>
                          <Form.Select name="duration" value={enquiryState.duration} onChange={handleChange} required className="ct-select">
                            <option value="">{t("Select duration")}</option>
                            <option value="daily">{t("Daily")}</option>
                            <option value="weekly">{t("Weekly")}</option>
                            <option value="monthly">{t("Monthly")}</option>
                            <option value="yearly">{t("Yearly")}</option>
                          </Form.Select>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <div className="ct-field">
                          <label className="ct-label">{t("Enquiry Type (optional)")}</label>
                          <Form.Select name="type" value={enquiryState.type} onChange={handleChange} className="ct-select">
                            <option value="">{t("Select Type")}</option>
                            <option value="individual">{t("Individual")}</option>
                            <option value="corporate">{t("Corporate")}</option>
                          </Form.Select>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="ct-field">
                          <label className="ct-label">{t("Select the car that you want to enquire for (optional)")}</label>
                          <Form.Select name="car_id" value={enquiryState.car_id} onChange={handleChange} onFocus={handleCarDropdownFocus} className="ct-select">
                            <option value="">{t("Select...")}</option>
                            {carListArray.map((car) => (
                              <option key={car.id} value={car.id}>{car.name}</option>
                            ))}
                          </Form.Select>
                        </div>
                      </Col>
                    </Row>

                    {/* Remarks */}
                    <div className="ct-section-label">{t("Additional Information")}</div>
                    <div className="ct-field">
                      <label className="ct-label">{t("Your Remarks")}<span className="ct-req">*</span></label>
                      <Form.Control required as="textarea" name="detail" value={enquiryState.detail}
                        onChange={handleChange} placeholder={t("Enter details")} rows={4} className="ct-textarea" />
                      <Form.Control.Feedback type="invalid" className="ct-invalid">{t("Please provide some details")}</Form.Control.Feedback>
                    </div>

                    <button type="submit" className="ct-submit-btn" disabled={enquiry_loading}>
                      {enquiry_loading
                        ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> {t("Submitting...")}</>
                        : <><i className="fa-solid fa-paper-plane"></i> {t("Submit Request")}</>
                      }
                    </button>

                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
