import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import "./FooterNew.css";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import InternalLinksSection from "../SEO/InternalLinksSection";
import { simplePostCall } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { notifySuccess } from "../../SharedComponent/notify";
import { trackGenerateLead } from "../../SharedComponent/tracking";

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const FooterNew = () => {
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);

  // Scroll to top when footer link is clicked
  const handleFooterLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    {
      title: t("Information"),
      links: [
        { path: `/${language}/about`,        display: t("About Us") },
        { path: `/${language}/offerspage`,   display: t("Special Offers") },
        { path: `/${language}/ourfleetlist`, display: t("Our Fleet") },
        { path: `/${language}/location`,     display: t("Locations") },
        { path: `/${language}/blogs`,        display: t("Blog") },
        { path: `/${language}/faq`,          display: t("FAQ") },
      ],
    },
    // The "Platform" column (Booking Engine, Chauffeur Module, Segment Pricing,
    // All Modules) came from the rental-platform template this site was built
    // from. Route Facile rents cars; it does not sell a booking platform, so
    // those pages and their links are gone.
    {
      title: t("Rent by City"),
      links: [
        { path: `/${language}/location`, display: t("Rent a Car Casablanca") },
        { path: `/${language}/location`, display: t("Rent a Car Marrakech") },
        { path: `/${language}/location`, display: t("Rent a Car Tangier") },
        { path: `/${language}/location`, display: t("Rent a Car Rabat") },
        { path: `/${language}/location`, display: t("Rent a Car Agadir") },
      ],
    },
    {
      title: t("Legal"),
      links: [
        { path: `/${language}/termscondition`, display: t("Terms & Conditions") },
        { path: `/${language}/privacypolicy`,  display: t("Privacy Policy") },
        { path: `/${language}/contact`,        display: t("Contact Us") },
        { path: `/${language}/sitemap`,        display: t("Sitemap") },
      ],
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (subscribeLoading) return;

    const trimmed = (subscribeEmail || "").trim();
    if (!trimmed) {
      setSubscribeStatus("error");
      setSubscribeMessage(t("Please enter a valid email."));
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setSubscribeStatus("error");
      setSubscribeMessage(t("Please enter a valid email."));
      return;
    }

    setSubscribeLoading(true);
    setSubscribeStatus("idle");
    setSubscribeMessage("");

    try {
      const res = await simplePostCall(
        configWeb.POST_NEWSLETTER,
        JSON.stringify({ email: trimmed })
      );

      const messages = Array.isArray(res?.message)
        ? res.message
        : res?.message
        ? [res.message]
        : [];
      const isDuplicate = messages.some((m) =>
        /already\s+(exists|subscribed)/i.test(String(m))
      );

      if (res?.status === "success") {
          // Only once the API stored the subscription.
          trackGenerateLead("newsletter");
        const successMsg = t("Thank you for subscribing to our newsletter.");
        setSubscribeStatus("success");
        setSubscribeMessage(successMsg);
        setSubscribeEmail("");
        notifySuccess(successMsg);
      } else if (isDuplicate) {
        setSubscribeStatus("error");
        setSubscribeMessage(t("This email is already subscribed."));
      } else if (messages.length > 0) {
        setSubscribeStatus("error");
        setSubscribeMessage(messages[0]);
      } else {
        setSubscribeStatus("error");
        setSubscribeMessage(
          t("Something went wrong. Please try again later.")
        );
      }
    } catch (err) {
      setSubscribeStatus("error");
      setSubscribeMessage(
        t("Something went wrong. Please try again later.")
      );
    } finally {
      setSubscribeLoading(false);
    }
  };

  const [subscribeEmail, setSubscribeEmail] = React.useState("");
  const [subscribeLoading, setSubscribeLoading] = React.useState(false);
  const [subscribeStatus, setSubscribeStatus] = React.useState("idle"); // idle | success | error
  const [subscribeMessage, setSubscribeMessage] = React.useState("");

  const [scrollPercentage, setScrollPercentage] = React.useState(0);
  const [showProgress, setShowProgress] = React.useState(false);
  
  React.useEffect(() => {
    // Progress scroll to top functionality with percentage
    const updateProgress = () => {
      const scroll = window.pageYOffset;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = height > 0 ? Math.round((scroll / height) * 100) : 0;
      
      setScrollPercentage(percentage);
      setShowProgress(percentage > 0);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call

    return () => {
      window.removeEventListener('scroll', updateProgress);
    };
  }, []);
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── SEO Internal Links ── renders above footer on every page ── */}
      <InternalLinksSection />

      {/* Sponsor Marquee */}
      {/* <div className="container gap no-top">
        <div className="heading">
          <h4>{t("Trusted by Leading Car Rental Brands Worldwide")}</h4>
        </div>
        <div className="marquee">
          <div className="marquee-icon">
            <div className="marquee-content">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div className="marquee-item" key={num}>
                  <img 
                    src={require(`../../carbook-assets/img/sponsor-${num}.png`)} 
                    alt={`Sponsor ${num}`}
                  />
                </div>
              ))}
            </div>
            <div className="marquee-content">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div className="marquee-item" key={`dup-${num}`}>
                  <img 
                    src={require(`../../carbook-assets/img/sponsor-${num}.png`)} 
                    alt={`Sponsor ${num}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}

      <footer>
        {/* Orange accent top bar */}
        <div className="footer-accent-bar"></div>

        <Container>
          {/* Top row: logo + tagline + newsletter */}
          <div className="footer-hero-row">
            <div className="footer-brand-block">
              <Link to={`/${language}/home`} onClick={handleFooterLinkClick}>
                <img
                  src="/images/logo-footer-white-v3.webp"
                  alt="Route Facile - Rent A Car"
                  width="440"
                  height="122"
                  style={{ width: 220, height: "auto", objectFit: "contain", display: "block" }}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <p className="footer-tagline">{t("Premium Car Rental — Across Morocco")}</p>
              <div className="footer-social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            <div className="footer-newsletter-block">
              <h3>{t("Stay in the Loop")}</h3>
              <p>{t("Get exclusive deals and new car arrivals straight to your inbox.")}</p>
              <form className="get-subscribee" onSubmit={handleSubscribe} noValidate>
                <label htmlFor="footer-newsletter-email" className="visually-hidden sr-only">{t("Enter your email")}</label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  name="email"
                  placeholder={t("Your email address")}
                  value={subscribeEmail}
                  onChange={(e) => {
                    setSubscribeEmail(e.target.value);
                    if (subscribeStatus !== "idle") { setSubscribeStatus("idle"); setSubscribeMessage(""); }
                  }}
                  aria-invalid={subscribeStatus === "error"}
                  aria-describedby="footer-newsletter-msg"
                  disabled={subscribeLoading}
                  required
                />
                <button type="submit" className="btn" disabled={subscribeLoading} aria-busy={subscribeLoading}>
                  {subscribeLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <><i className="fa-solid fa-paper-plane"></i> {t("Subscribe")}</>
                  )}
                </button>
              </form>
              <div id="footer-newsletter-msg" className={`newsletter-feedback newsletter-feedback--${subscribeStatus}`} role={subscribeStatus === "error" ? "alert" : "status"} aria-live="polite">
                {subscribeMessage}
              </div>
            </div>
          </div>

          <div className="footer-divider"></div>

          {/* Links grid */}
          <Row className="footer-links-row">
            {quickLinks.map((section, index) => (
              <Col lg="2" md="4" xs="6" key={index} className="wow fadeInUp" data-wow-delay={`.${2 + index * 1}s`}>
                <div className="information-link">
                  <h3>{section.title}</h3>
                  <ul>
                    {section.links.map((item, idx) => (
                      <li key={idx}>
                        <Link to={item.path} onClick={handleFooterLinkClick}>{item.display}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}

            {/* Contact column */}
            <Col lg="4" md="8" className="wow fadeInUp" data-wow-delay=".7s">
              <div className="information-link footer-contact-block">
                <h3>{t("Contact Us")}</h3>
                <ul className="footer-contact-list">
                  {/* The business operates out of Marrakech and delivers elsewhere;
                      it has no registered head office or legal branches, so those
                      words are deliberately avoided here. */}
                  <li><i className="fa-solid fa-location-dot"></i> {t("Route Facile — Marrakech, Morocco")}</li>
                  <li><i className="fa-solid fa-truck"></i> {t("Delivery available in Marrakech, Casablanca, Rabat, Tangier, Agadir and airports across Morocco.")}</li>
                  <li><i className="fa-solid fa-phone"></i> <a href="tel:+212655585859" dir="ltr">+212 655 585 859</a></li>
                  {/* info@ is the primary company address; the Gmail stays listed
                      because it is already printed on existing bookings. */}
                  <li><i className="fa-solid fa-envelope"></i> <a href="mailto:info@routefacilecarrental.com">info@routefacilecarrental.com</a></li>
                  <li><i className="fa-solid fa-envelope"></i> <a href="mailto:routefacilerental@gmail.com">routefacilerental@gmail.com</a></li>
                </ul>
              </div>
            </Col>
          </Row>

          <div className="footer-divider"></div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p>© 2026 <strong>Route Facile LLC</strong>. {t("All Rights Reserved.")}</p>
            <div className="footer-bottom-links">
              <Link to={`/${language}/termscondition`} onClick={handleFooterLinkClick}>{t("Terms")}</Link>
              <span>·</span>
              <Link to={`/${language}/privacypolicy`} onClick={handleFooterLinkClick}>{t("Privacy")}</Link>
              <span>·</span>
              <Link to={`/${language}/sitemap`} onClick={handleFooterLinkClick}>{t("Sitemap")}</Link>
            </div>
          </div>
        </Container>
      </footer>
      
      {/* Progress to top with percentage */} 
      {showProgress && (
        <div 
          id="progress" 
          onClick={handleScrollToTop}
        >
          <svg className="progress-ring" viewBox="0 0 100 100">
            <circle 
              className="progress-ring-bg" 
              cx="50" 
              cy="50" 
              r="45"
            />
            <circle 
              className="progress-ring-fill" 
              cx="50" 
              cy="50" 
              r="45"
              style={{
                strokeDasharray: `${2 * Math.PI * 45}`,
                strokeDashoffset: `${2 * Math.PI * 45 * (1 - scrollPercentage / 100)}`
              }}
            />
          </svg>
          <span className="progress-percentage">{scrollPercentage}%</span>
        </div>
      )}
    </>
  );
};

export default FooterNew;
