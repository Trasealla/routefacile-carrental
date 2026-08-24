import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './EdcExclusive.css';
import { Container, Modal, Form, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import configWeb from "../../../config.js/configWeb";
import { simpleGetCall, simplePostCall, getApiLang } from "../../../config.js/SetUp";
import { Spinner } from "reactstrap";
import MetaHelmet from "../../Helmet/MetaHelmet";
import EdcEnquiry from "./EdcEnquiry";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../context/CurrencyContext";
import { useNavigate } from "react-router-dom";
import brandLogo from "../../../assets/new-logo/Car Rental Platform Logos/logo-1009_191.png";
import { notifySuccess, notifyError } from "../../../SharedComponent/notify";

const EdcExclusive = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { t } = useTranslation();
  const { format: fmt } = useCurrency();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);

  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [carsData, setCarsData] = useState([]);
  
  // EDC Verification State
  const [edcStudentId, setEdcStudentId] = useState("");
  const [edcStudentName, setEdcStudentName] = useState("");
  const [edcStudentEmail, setEdcStudentEmail] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  
  // Terms & Conditions Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // Promo Info State
  const [promoInfo, setPromoInfo] = useState(null);
  const EDC_PROMO_CODE = promoInfo?.promo_code || "EDCVIP2025";

  // Fetch EDC Promo Info
  const getEdcPromoInfo = () => {
    const url = `${configWeb.GET_EDC_PROMO_INFO}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setPromoInfo(res);
        }
      })
      .catch((error) => {
        console.log("EDC promo info API failed-->", error);
      });
  };

  // Fetch EDC Car Rates
  const getEdcRates = () => {
    const url = `${configWeb.GET_EDC_RATES}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCarsData(res || []);
        }
      })
      .catch((error) => {
        console.log("EDC rates API failed-->", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getEdcPromoInfo();
    getEdcRates();
  }, [language]);

  const handleEnquireClick = (car_id) => {
    setSelectedCar(car_id);
    setShowModal(true);
  };

  const handleBookNowClick = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);

    if (!termsConfirmed) {
      return;
    }
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    setVerificationLoading(true);

    // Call EDC Verification API
    const body = JSON.stringify({
      student_id: edcStudentId,
      full_name: edcStudentName,
      email: edcStudentEmail
    });

    simplePostCall(configWeb.POST_EDC_VERIFY, body)
      .then((res) => {
        if (res?.status === "success" && res?.verified) {
          // Store EDC verification data in localStorage
          const edcData = {
            verificationId: res?.data?.verification_id,
            studentId: edcStudentId,
            studentName: edcStudentName,
            studentEmail: edcStudentEmail,
            promoCode: res?.data?.promo_code || EDC_PROMO_CODE,
            discountPercentage: res?.data?.discount_percentage,
            memberType: res?.data?.member_type,
            verifiedAt: new Date().toISOString(),
            expiresAt: res?.data?.valid_until || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
          
          localStorage.setItem('edc_verification', JSON.stringify(edcData));
          localStorage.setItem('edc_promo_code', res?.data?.promo_code || EDC_PROMO_CODE);
          // Mark that user just verified - this flag is checked on home page
          // If user refreshes without clicking "Find My Car", the promo will be cleared
          sessionStorage.setItem('edc_just_verified', 'true');
          
          setShowVerificationModal(false);
          notifySuccess(t("EDC Student verified! Redirecting to booking with your exclusive discount..."));
          
          // Redirect to home page with booking form after a short delay
          setTimeout(() => {
            navigate(`/${language || 'en'}`);
          }, 1500);
        } else {
          notifyError(res?.message || t("Verification failed. Please check your details and try again."));
        }
      })
      .catch((error) => {
        console.error("EDC verification failed:", error);
        notifyError(t("Verification failed. Please try again later."));
      })
      .finally(() => {
        setVerificationLoading(false);
      });
  };

  const resetVerificationForm = () => {
    setEdcStudentId("");
    setEdcStudentName("");
    setEdcStudentEmail("");
    setValidated(false);
    setTermsConfirmed(false);
  };

  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: 'Exclusive Car Rental Discounts for EDC Students | Route Facile',
      description: 'EDC students get exclusive car rental discounts with Route Facile. Special rates on daily, weekly & monthly rentals. Book now and save!',
      author: {
        "@type": "Organization",
        name: "Route Facile",
      },
      publisher: {
        "@type": "Organization",
        name: "Route Facile",
        logo: {
          "@type": "ImageObject",
          url: brandLogo,
        },
      },
      datePublished: "2025-01-01",
      dateModified: "2025-01-01",
    };
  };

  const benefits = [
    {
      icon: "ri-price-tag-3-line",
      title: t("Special Discounted Rates"),
      description: t("Exclusive pricing available only for EDC students and staff")
    },
    {
      icon: "ri-truck-line",
      title: t("Free Delivery"),
      description: t("Complimentary delivery on monthly rentals")
    },
    {
      icon: "ri-shield-check-line",
      title: t("No Deposit Option"),
      description: t("Flexible payment options available")
    },
    {
      icon: "ri-eye-line",
      title: t("Transparent Pricing"),
      description: t("No hidden charges - what you see is what you pay")
    },
    {
      icon: "ri-roadster-line",
      title: t("Wide Vehicle Selection"),
      description: t("Choose from compact, sedan, SUV, and more")
    }
  ];

  const eligiblePersons = [
    t("EDC Students"),
    t("EDC Staff Members"),
    t("EDC Instructors")
  ];

  return (
    <div className="edc-exclusive-page">
      {loading ? (
        <div className="edc-loading">
          <Spinner color="light" />
        </div>
      ) : (
        <>
          <MetaHelmet
            title="Exclusive Car Rental Discounts for EDC Students | Route Facile"
            description="EDC students get exclusive car rental discounts with Route Facile. Special rates on daily, weekly & monthly rentals. Free delivery, no-deposit options & more. Book now!"
            keywords="EDC car rental, Cities Driving Company discount, student car rental UAE, Route Facile EDC offer"
            ogTitle="Exclusive Car Rental Discounts for EDC Students"
            ogDescription="EDC students get exclusive car rental discounts with Route Facile. Special rates on daily, weekly & monthly rentals."
            ogUrl={window.location.href}
            twitterTitle="Exclusive Car Rental Discounts for EDC Students"
            twitterDescription="EDC students get exclusive car rental discounts with Route Facile."
            twitterCard="summary_large_image"
            canonicalUrl={`https://routefacilecarrental.com/en/edc-exclusive`}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateStructuredData()),
            }}
          />

          {/* Partnership Header with Both Logos */}
          <section className="edc-partnership-header">
            <Container>
              <div className="partnership-logos">
                <div className="logo-container edc-logo-container">
                  <img 
                    src="https://edc-cms-storage-cdn-dev.azureedge.net/strapi/assets/Logo_7399ed159f.svg" 
                    alt="Cities Driving Company" 
                    className="edc-logo"
                  />
                </div>
                {/* <span className="partnership-separator">×</span> */}
                <div className="logo-container">
                  <img 
                    src={brandLogo} 
                    alt="Route Facile" 
                    className="brand-logo"
                  />
                </div>
              </div>
              {/* <div className="partnership-headline">
                <h1 style={{ color: '#f2421b' }}>{t("EDC EXCLUSIVE OFFER")}</h1>
                <p className="subtitle">{t("Special Car Rental Discounts for EDC Students & Staff")}</p>
              </div> */}
            </Container>
          </section>

          {/* Hero Banner */}
          <section className="edc-hero-banner">
            <Container>
              <div className="hero-content">
                <div className="hero-text">
                  <h2 className="text-white">
                    {t("Drive More, Pay Less")} <br />
                    <span>{t("Exclusive Rates for EDC Community")}</span>
                  </h2>
                  <p>
                    {t("As an EDC student or staff member, you deserve special treatment. Enjoy exclusive car rental discounts with Route Facile. Whether you need a car for your daily commute, weekend getaway, or long-term rental, we've got you covered with the best rates in the UAE.")}
                  </p>
                  <div className="promo-code-box">
                    <p>{t("Your Exclusive Promo Code")}</p>
                    <div className="promo-code">{EDC_PROMO_CODE}</div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      {t("Auto-applied when booking through this page")}
                    </p>
                  </div>
                </div>
                <div className="hero-image">
                  <div className="hero-car-visual">
                    <div className="car-offer-badge">
                      <span className="badge-discount">EXCLUSIVE</span>
                      <span className="badge-text">EDC Members Only</span>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Benefits Section */}
          <section className="edc-benefits-section">
            <Container>
              <div className="section-title">
                <h2 className="text-white">{t("What You Get")}</h2>
              </div>
              <div className="benefits-grid">
                {benefits.map((benefit, index) => (
                  <div className="benefit-card" key={index}>
                    <div className="benefit-icon"><i className={benefit.icon}></i></div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* Eligibility Section */}
          <section className="edc-eligibility-section">
            <Container>
              <div className="eligibility-box">
                <h2 className="text-white">{t("Who's Eligible?")}</h2>
                <ul className="eligibility-list">
                  {eligiblePersons.map((person, index) => (
                    <li key={index}>
                    
                      {person}
                    </li>
                  ))}
                </ul>
                <div className="eligibility-disclaimers">
                  <span className="eligibility-disclaimer-chip">* {t("Valid EDC Student ID or Staff ID is required to avail this offer")}</span>
                  <span className="eligibility-disclaimer-chip">* {t("Offer valid for limited time only")}</span>
                  <span className="eligibility-disclaimer-chip">* {t("Terms and conditions apply")}</span>
                </div>
              </div>
            </Container>
          </section>

          {/* Cars Section */}
          {carsData.length > 0 && (
            <section className="edc-cars-section">
              <Container>
                <div className="section-title">
                  <h2>{t("Available Vehicles")}</h2>
                  <p>{t("Choose from our wide selection of vehicles")}</p>
                </div>
                <div className="cars-grid">
                  {carsData.map((item, index) => (
                    <div className="car-card-edc" key={index}>
                      <img src={item.car.image} alt={item.car.name} />
                      <div className="car-card-content">
                        <h3>{item.car.name}</h3>
                        <p className="price">
                          {t("From")} {fmt(item.rate)} / {t("Month")}
                        </p>
                        <button 
                          onClick={() => handleEnquireClick(item.car_id)} 
                          className="enquire-btn-edc"
                        >
                          {t("Enquire Now")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Container>
            </section>
          )}

          {/* CTA Section */}
          <section className="edc-cta-section">
            <Container>
              <div className="cta-box">
                <h2 className="text-white">{t("Ready to Hit the Road?")}</h2>
                <p>{t("Book now and enjoy your exclusive EDC discount!")}</p>
                <button 
                  className="cta-button"
                  onClick={handleBookNowClick}
                >
                  {t("Book Now")}
                </button>
              </div>
            </Container>
          </section>

          {/* Floating Book Now button - always visible (portaled to body to escape any stacking context) */}
          {ReactDOM.createPortal(
            (
              <button
                className="edc-floating-book-now"
                onClick={handleBookNowClick}
                aria-label={t("Book Now")}
              >
                <i className="ri-car-line"></i>
                <span>{t("Book Now")}</span>
              </button>
            ),
            document.body
          )}

          {/* EDC Student Verification Modal */}
          <Modal 
            show={showVerificationModal} 
            onHide={() => {
              setShowVerificationModal(false);
              resetVerificationForm();
            }} 
            centered
            className="edc-verification-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <div className="verification-modal-title">
                  <img 
                    src="https://edc-cms-storage-cdn-dev.azureedge.net/strapi/assets/Logo_7399ed159f.svg" 
                    alt="EDC" 
                    style={{ height: '30px', marginRight: '10px' }}
                  />
                  {t("EDC Verification")}
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="verification-info-box">
                <p>{t("Enter your EDC details to unlock your exclusive discount")}</p>
                <div className="discount-preview">
                  <span>{t("Promo Code")}: </span>
                  <strong>{EDC_PROMO_CODE}</strong>
                </div>
              </div>
              
              <Form noValidate validated={validated} onSubmit={handleVerificationSubmit}>
                <Form.Group className="mb-3" controlId="edcStudentId">
                  <Form.Label>
                    {t("EDC Student/Staff ID")} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder={t("Enter your EDC ID")}
                    value={edcStudentId}
                    onChange={(e) => setEdcStudentId(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please enter your EDC ID")}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="edcStudentName">
                  <Form.Label>
                    {t("Full Name")} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder={t("Enter your full name")}
                    value={edcStudentName}
                    onChange={(e) => setEdcStudentName(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please enter your full name")}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="edcStudentEmail">
                  <Form.Label>
                    {t("Email Address")} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder={t("Enter your email")}
                    value={edcStudentEmail}
                    onChange={(e) => setEdcStudentEmail(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please enter a valid email")}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="verification-terms">
                  <p className="verification-terms-text">
                    {termsConfirmed ? (
                      <span className="terms-confirmed-badge">✓ {t("Terms confirmed")}</span>
                    ) : (
                      <>
                        {t("I confirm that I am an EDC student/staff member and agree to")}{" "}
                        <span
                          className="edc-terms-link"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTermsModal(true);
                          }}
                        >
                          {t("terms and conditions")}
                        </span>
                        {". "}
                        {t("Please read and confirm in the popup to continue.")}
                      </>
                    )}
                  </p>
                  {!termsConfirmed && validated && (
                    <p className="text-danger small mb-0">{t("You must read and confirm the terms and conditions before submitting")}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="verification-submit-btn"
                  disabled={verificationLoading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #f2421b, #da2826)',
                    border: 'none',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: verificationLoading ? 'not-allowed' : 'pointer',
                    opacity: verificationLoading ? 0.7 : 1
                  }}
                >
                  {verificationLoading ? (
                    <>
                      <Spinner size="sm" /> {t("Verifying...")}
                    </>
                  ) : (
                    t("Verify & Continue to Booking")
                  )}
                </button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Enquiry Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{t("EDC Exclusive Enquiry")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <EdcEnquiry 
                title="EDC Exclusive Car Rental" 
                car_id={selectedCar} 
                cars={carsData}
                promoCode={EDC_PROMO_CODE}
              />
            </Modal.Body>
          </Modal>

          {/* Terms & Conditions Modal */}
          <Modal
            show={showTermsModal}
            onHide={() => setShowTermsModal(false)}
            size="lg"
            centered
            scrollable
            className="edc-terms-modal"
          >
            <Modal.Header closeButton className="edc-terms-modal-header">
              <Modal.Title className="edc-terms-modal-title">
                {t("Terms & Conditions")}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="edc-terms-modal-body">
              <div className="edc-terms-content">
                <div className="edc-terms-intro">
                  <h5>{t("Additional Terms & Conditions")}</h5>
                  <p className="edc-terms-subtitle">{t("New & Limited Driving License Holders")}</p>
                  <p>
                    {t("These conditions apply in addition to Route Facile's standard Terms & Conditions and are applicable to customers holding new UAE driving licenses, licenses under 6 months, or Golden Chance licenses.")}
                  </p>
                </div>

                <div className="edc-terms-section-block">
                  <div className="edc-terms-section-number">1</div>
                  <div className="edc-terms-section-content">
                    <h6>{t("Driving License Eligibility")}</h6>
                    <ul>
                      <li>{t("Only a valid Moroccan driving licence is accepted.")}</li>
                      <li>
                        {t("License holders are classified as:")}
                        <ul>
                          <li><strong>{t("New License Holder:")}</strong> {t("License issued less than 6 months (cannot participate)")}</li>
                          <li><strong>{t("6-Month License Holder:")}</strong> {t("License issued between 6 months (can rent limited car restrictions / age restrictions apply)")}</li>
                          <li><strong>{t("Golden Chance License Holder:")}</strong> {t("License obtained via Golden Chance scheme (can rent limited car restrictions / age restrictions apply)")}</li>
                        </ul>
                      </li>
                      <li>{t("International licences and learner permits are not accepted under this programme.")}</li>
                    </ul>
                  </div>
                </div>

                <div className="edc-terms-section-block">
                  <div className="edc-terms-section-number">2</div>
                  <div className="edc-terms-section-content">
                    <h6>{t("Vehicle Eligibility")}</h6>
                    <ul>
                      <li>{t("New License and Golden Chance holders are restricted to Economy and Compact vehicles only. New driver fee to be included.")}</li>
                      <li>{t("6-Month License holders may rent Economy, Compact, and select Sedan vehicles (subject to availability). New driver fee to be included and higher excess.")}</li>
                      <li>{t("SUVs, luxury, sports, and premium vehicles are not permitted.")}</li>
                    </ul>
                    <p className="edc-terms-note">{t("Route Facile reserves the right to refuse vehicle upgrade requests for risk and insurance reasons.")}</p>
                  </div>
                </div>

                <div className="edc-terms-section-block">
                  <div className="edc-terms-section-number">3</div>
                  <div className="edc-terms-section-content">
                    <h6>{t("Security Deposit / Pre-Authorization")}</h6>
                    <p>{t("A mandatory security deposit will be blocked on the customer's credit card at the time of rental:")}</p>
                    <div className="edc-terms-deposit-grid">
                      <div className="edc-terms-deposit-card">
                        <span className="edc-terms-deposit-label">{t("New License / Golden Chance")}</span>
                        <span className="edc-terms-deposit-amount">{t("MAD")} 2,000</span>
                      </div>
                      <div className="edc-terms-deposit-card">
                        <span className="edc-terms-deposit-label">{t("6-Month License")}</span>
                        <span className="edc-terms-deposit-amount">{t("MAD")} 1,500</span>
                      </div>
                    </div>
                    <h6 className="mt-3">{t("Key Notes:")}</h6>
                    <ul>
                      <li>{t("Cash deposits are not accepted")}</li>
                      <li>{t("Debit cards are not accepted")}</li>
                      <li>{t("Deposit will be released within 30 days from contract closure")}</li>
                      <li>{t("Deposit may be used against traffic fines, Salik/Darb, damages, refuelling charges, or other non-rental dues")}</li>
                    </ul>
                    <p className="edc-terms-note">{t("Route Facile reserves the right to charge the credit card without prior notification for any outstanding amounts.")}</p>
                  </div>
                </div>

                <div className="edc-terms-section-block">
                  <div className="edc-terms-section-number">4</div>
                  <div className="edc-terms-section-content">
                    <h6>{t("Insurance & Excess")}</h6>
                    <ul>
                      <li>{t("Standard motor insurance is included.")}</li>
                      <li>{t("A valid police report is mandatory for all insurance claims.")}</li>
                      <li>{t("SCDW cannot be sold to new drivers and 6-month-old licenses. Golden Chance license holders can purchase SCDW.")}</li>
                    </ul>
                    <p><strong>{t("Insurance Excess (Non-Waivable):")}</strong></p>
                    <ul>
                      <li>{t("Ranges from MAD 2,500 + VAT")}</li>
                      <li>{t("Excess applies per incident")}</li>
                    </ul>
                  </div>
                </div>

                <div className="edc-terms-section-block">
                  <div className="edc-terms-section-number">5</div>
                  <div className="edc-terms-section-content">
                    <h6>{t("Rental Duration Restrictions")}</h6>
                    <div className="edc-terms-deposit-grid">
                      <div className="edc-terms-deposit-card">
                        <span className="edc-terms-deposit-label">{t("New License & Golden Chance")}</span>
                        <span className="edc-terms-deposit-amount">{t("Max 14 days")}</span>
                      </div>
                      <div className="edc-terms-deposit-card">
                        <span className="edc-terms-deposit-label">{t("6-Month License")}</span>
                        <span className="edc-terms-deposit-amount">{t("Max 30 days")}</span>
                      </div>
                    </div>
                    <p className="edc-terms-note mt-2">{t("Extensions are subject to manual approval and rental history review.")}</p>
                  </div>
                </div>

                <div className="edc-terms-section-block">
                  <div className="edc-terms-section-number">6</div>
                  <div className="edc-terms-section-content">
                    <h6>{t("Accident, Misuse & Violations")}</h6>
                    <ul>
                      <li>{t("A valid police report is mandatory for all accidents or damages.")}</li>
                      <li>
                        {t("Insurance becomes void if the vehicle is:")}
                        <ul>
                          <li>{t("Driven by an unauthorized driver")}</li>
                          <li>{t("Used under the influence of alcohol or drugs")}</li>
                          <li>{t("Used for off-road driving, racing, or commercial ride-hailing")}</li>
                        </ul>
                      </li>
                      <li>{t("All traffic fines, Salik/Darb, and violations will be charged to the renter with applicable admin fees.")}</li>
                    </ul>
                  </div>
                </div>

                <div className="edc-terms-section-block">
                  <div className="edc-terms-section-number">7</div>
                  <div className="edc-terms-section-content">
                    <h6>{t("Right of Refusal")}</h6>
                    <p>{t("Route Facile reserves the right to:")}</p>
                    <ul>
                      <li>{t("Refuse or terminate a rental without prior notice")}</li>
                      <li>{t("Amend eligibility, deposits, excess, or vehicle access based on risk assessment")}</li>
                      <li>{t("Override system approvals where misuse or misrepresentation is suspected")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="edc-terms-modal-footer">
              <Button 
                variant="primary"
                onClick={() => {
                  setTermsConfirmed(true);
                  setShowTermsModal(false);
                }}
                className="edc-terms-accept-btn"
              >
                {t("I Confirm")}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default EdcExclusive;