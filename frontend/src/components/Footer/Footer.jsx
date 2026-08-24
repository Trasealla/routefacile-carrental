import React from "react";
import { Link } from "react-router-dom";
import "../../styles/footer.css";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const ARCLogo = "/images/logo-footer-v3.webp";

const Footer = () => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const isLoginFromRegister = useSelector((state) => state.isLoginFromRegister.isLoginFromRegister);

  const scrollTop = () => {
    // window.scrollTo alone is enough. The documentElement.scrollTop write that
    // used to follow it is a legacy fallback and, coming after scrollTo, forces
    // a layout flush on every footer link click.
    window.scrollTo(0, 0);
  };

  // Pages with no content yet. Linking to an empty page costs more trust than
  // the link is worth, and it gives Google thin pages to index. Flip a flag back
  // to true once the section has real content — the routes still exist, so
  // anyone holding a direct link is not broken.
  const SHOW_CAREERS = false;        // career_jobs table is empty
  const SHOW_LOST_AND_FOUND = false; // no lost-and-found process published yet

  const companyLinks = [
    { path: `/${language}/about`,        display: "About Us" },
    { path: `/${language}/our-services`, display: "Our Services" },
    ...(SHOW_CAREERS
      ? [{ path: `/${language}/careerspage`, display: "Careers" }]
      : []),
    {
      path: (localStorage.getItem("token") && !isLoginFromRegister)
        ? `/${language}/myaccount`
        : `/${language}/login`,
      display: "My Account",
    },
  ];

  const exploreLinks = [
    { path: `/${language}/ourfleetlist`,     display: "Our Fleet" },
    { path: `/${language}/offerspage`,       display: "Special Offers" },
    { path: `/${language}/discover-morocco`, display: "Discover Morocco" },
    { path: `/${language}/location`,         display: "Our Locations" },
  ];

  const supportLinks = [
    { path: `/${language}/faq`,               display: "FAQs" },
    ...(SHOW_LOST_AND_FOUND
      ? [{ path: `/${language}/lostandfound`, display: "Lost & Found" }]
      : []),
    { path: `/${language}/contact`,           display: "Contact Us" },
    { path: `/${language}/customer-feedback`, display: "Customer Feedback" },
  ];

  return (
    <footer className="footer">
      {/* Orange accent bar */}
      <div className="footer-top-bar" />

      {/* Main grid */}
      <div className="footer-main">
        <div className="row g-4">

          {/* Brand column */}
          <div className="col-lg-3 col-md-6">
            <div className="footer-brand">
              <Link to={`/${language}`} onClick={scrollTop}>
                {/* Intrinsic dimensions so the browser reserves the right box
                    before the file arrives (no layout shift); CSS still controls
                    the rendered size. */}
                <img
                  src={ARCLogo}
                  alt="Route Facile"
                  className="footer-logo"
                  width="560"
                  height="106"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <p className="footer-tagline">
                {t("Premium Car Rental — Across Morocco")}
              </p>
              <div className="footer-social">
                <a href="https://www.instagram.com/routefacilecarrental/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram" />
                </a>
                <a href="https://www.facebook.com/routefacilecarrental" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook-f" />
                </a>
                <a href="https://wa.me/212655585859" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <i className="fab fa-whatsapp" />
                </a>
                <a href="https://www.linkedin.com/company/routefacile" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in" />
                </a>
              </div>
            </div>
          </div>

          {/* Company */}
          <div className="col-lg-2 col-md-3 col-6">
            <h3 className="footer-col-title">{t("COMPANY")}</h3>
            <ul className="footer-links">
              {companyLinks.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} onClick={scrollTop}>{t(item.display)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div className="col-lg-2 col-md-3 col-6">
            <h3 className="footer-col-title">{t("EXPLORE")}</h3>
            <ul className="footer-links">
              {exploreLinks.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} onClick={scrollTop}>{t(item.display)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-3 col-6">
            <h3 className="footer-col-title">{t("SUPPORT")}</h3>
            <ul className="footer-links">
              {supportLinks.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} onClick={scrollTop}>{t(item.display)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-3 col-6">
            <h3 className="footer-col-title">{t("CONTACT US")}</h3>
            {/* No registered head office or legal branches — the business is based
                in Marrakech and delivers elsewhere, so it is described that way. */}
            <div className="footer-contact-item">
              <i className="fa-solid fa-location-dot" />
              <span>{t("Route Facile — Marrakech, Morocco")}</span>
            </div>
            <div className="footer-contact-item">
              <i className="fa-solid fa-truck" />
              <span>{t("Delivery available in Marrakech, Casablanca, Rabat, Tangier, Agadir and airports across Morocco.")}</span>
            </div>
            <div className="footer-contact-item">
              <i className="fa-solid fa-phone" />
              <a href="tel:+212655585859" dir="ltr">+212 655 585 859</a>
            </div>
            <div className="footer-contact-item">
              <i className="fa-solid fa-phone" />
              <a href="tel:+212655585853" dir="ltr">+212 655 585 853</a>
            </div>
            {/* info@ is the primary company address; the Gmail stays listed
                because it is already printed on existing bookings. */}
            <div className="footer-contact-item">
              <i className="fa-solid fa-envelope" />
              <a href="mailto:info@routefacilecarrental.com">info@routefacilecarrental.com</a>
            </div>
            <div className="footer-contact-item">
              <i className="fa-solid fa-envelope" />
              <a href="mailto:routefacilerental@gmail.com">routefacilerental@gmail.com</a>
            </div>
            <div className="footer-contact-item">
              <i className="fab fa-whatsapp" />
              <a href="https://wa.me/212655585859" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <p className="footer-bottom-copy">
          © {new Date().getFullYear()} Route Facile. {t("All Rights Reserved.")}
        </p>
        <div className="footer-bottom-links">
          <Link to={`/${language}/termscondition`} onClick={scrollTop}>{t("Terms")}</Link>
          <span>·</span>
          <Link to={`/${language}/privacypolicy`} onClick={scrollTop}>{t("Privacy")}</Link>
          <span>·</span>
          <a href={`/${language}/sitemap`}>{t("Sitemap")}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
