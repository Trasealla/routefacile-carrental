import React, { useRef, useState, useEffect } from "react";
import { Container } from "reactstrap";
import { Link, NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import "./HeaderNew.css";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../../actions/action";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import { simpleGetCallAuth } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import PromoTicker from "../UI/PromoTicker/PromoTicker";
import { useCurrency } from "../../context/CurrencyContext";

const HeaderNew = () => {
  const { t, i18n } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const isLoginFromRegister = useSelector(
    (state) => state.isLoginFromRegister.isLoginFromRegister
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const allowedLangs = ["en", "ar", "fr", "ae"];
  const [isSticky, setIsSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [curDropdownOpen, setCurDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const curDropdownRef = useRef(null);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    if (lang) {
      if (!allowedLangs.includes(lang)) {
        navigate("/not-found");
      }
    }
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any dropdown parent
      const isInsideDropdown = event.target.closest('.nav-dropdown-parent');
      if (!isInsideDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleLangClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (curDropdownRef.current && !curDropdownRef.current.contains(event.target)) {
        setCurDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleLangClickOutside);
    return () => document.removeEventListener("click", handleLangClickOutside);
  }, []);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Check if user is logged in and fetch user details
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const tokenData = localStorage.getItem("token");
        console.log('HeaderNew - Token data:', tokenData ? 'exists' : 'null');
        
        if (tokenData) {
          const parsedToken = JSON.parse(tokenData);
          const now = new Date().getTime();
          
          console.log('HeaderNew - Token check:', {
            hasAccessToken: !!parsedToken?.access_token,
            expiry: parsedToken?.expiry,
            now: now,
            isExpired: parsedToken?.expiry <= now,
            timeRemaining: parsedToken?.expiry ? (parsedToken.expiry - now) / 1000 / 60 + ' minutes' : 'N/A'
          });
          
          // Check if token exists and is not expired
          if (parsedToken?.access_token && parsedToken?.expiry > now) {
            console.log('HeaderNew - User is logged in');
            setIsLoggedIn(true);
            
            // Fetch user details if we have user_id
            if (parsedToken?.user_id) {
              try {
                const userDetails = await simpleGetCallAuth(
                  configWeb.GET_USER_DETAILS(parsedToken.user_id)
                );
                if (userDetails && !userDetails.error) {
                  const name = userDetails.first_name || userDetails.name || userDetails.fullName || "";
                  setUserName(name);
                }
              } catch (err) {
                console.log("Error fetching user details:", err);
                // If API call fails, still keep user logged in if token is valid
                setIsLoggedIn(true);
              }
            }
          } else {
            // Token expired, clear it
            console.log('HeaderNew - Token expired or invalid, clearing...');
            localStorage.removeItem("token");
            // Also clear other auth-related items
            localStorage.removeItem("auth_token");
            localStorage.removeItem("customer_id");
            localStorage.removeItem("id");
            setIsLoggedIn(false);
            setUserName("");
          }
        } else {
          console.log('HeaderNew - No token found in localStorage');
          setIsLoggedIn(false);
          setUserName("");
        }
      } catch (error) {
        console.log("Error checking login status:", error);
        // Clear potentially corrupted token data
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkLoginStatus();
  }, [location.pathname]);

  // RouteFacile primary navigation
  const navLinks = [
    { path: `/${language}/home`, display: t("Home"), end: true },
    { path: `/${language}/ourfleetlist`, display: t("Fleet") },
    { path: `/${language}/location`, display: t("Destinations") },
    { path: `/${language}/offerspage`, display: t("Offers") },
    { path: `/${language}/about`, display: t("About Us") },
    { path: `/${language}/contact`, display: t("Contact Us") },
  ];

  // Official Route Facile contact number
  const CALL_DISPLAY = "+212 655 585 859";
  const CALL_TEL = "+212655585859";
  const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=212655585859&text=Hello+Route+Facile%21+I+would+like+information+about+car+rental.&type=phone_number&app_absent=0";

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    dispatch(setLanguage(lng));

    // Reflect the selected language in the URL: /en/, /fr/, /ar/
    const segments = location.pathname.split("/");
    if (allowedLangs.includes(segments[1])) {
      segments[1] = lng;
    } else {
      segments.splice(1, 0, lng);
    }
    const newPath = (segments.join("/") || `/${lng}`) + location.search;
    navigate(newPath);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName("");
    notifySuccess(t("Logout successful"));
    navigate(`/${language}/home`);
  };

  return (
    <header id="stickyHeader" className={`rf-header ${isSticky ? "sticky" : ""}`}>
      <div className="header-top-bar">
        <Container>
          <div className="bottom-bar rf-bar">
            {/* Brand / logo */}
            <Link to={`/${language}/home`} className="rf-logo" aria-label="Route Facile - Rent A Car">
              {/* One <picture> rather than two <img>s toggled with CSS display.
                  Both files used to be in the DOM on every viewport, so every
                  visitor downloaded both marks and threw one away — and the
                  mobile one (the colour mark, which is the LCP element on
                  phones) carried no fetchpriority. <picture> downloads exactly
                  one, and the media query matches the old CSS breakpoint:
                  <=991px the header sits on white and uses the colour mark,
                  above that it is dark and uses the white mark. */}
              <picture>
                <source media="(max-width: 991px)" srcSet="/images/logo-header-v4.webp" type="image/webp" />
                <img
                  className="rf-logo-img"
                  src="/images/logo-footer-white-v3.webp"
                  alt="Route Facile - Rent A Car"
                  fetchpriority="high"
                  decoding="async"
                  width="440"
                  height="122"
                  style={{ width: 200, height: "auto", objectFit: "contain", display: "block", flexShrink: 0 }}
                />
              </picture>
            </Link>

            {/* Mobile hamburger menu button */}
            <button
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Primary navigation */}
            <nav className={`rf-nav ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}>
              <ul>
                {navLinks.map((item, index) => (
                  <li key={index}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) => (isActive ? "nav__active" : "")}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.display}
                    </NavLink>
                  </li>
                ))}

                {/* Mobile-only language selector inside the menu */}
                <li className="mobile-language-selector">
                  <div className="mobile-language-title">
                    <i className="fa-solid fa-globe"></i>
                    {t("Language")}
                  </div>
                  <div className="mobile-language-options">
                    <button
                      className={language === "en" ? "active" : ""}
                      onClick={() => { handleLanguageChange("en"); setMobileMenuOpen(false); }}
                    >
                      English
                    </button>
                    <button
                      className={language === "fr" ? "active" : ""}
                      onClick={() => { handleLanguageChange("fr"); setMobileMenuOpen(false); }}
                    >
                      Français
                    </button>
                    <button
                      className={language === "ar" ? "active" : ""}
                      onClick={() => { handleLanguageChange("ar"); setMobileMenuOpen(false); }}
                    >
                      العربية
                    </button>
                  </div>
                </li>

                {/* Mobile-only currency selector */}
                <li className="mobile-language-selector">
                  <div className="mobile-language-title">
                    <i className="fa-solid fa-tag"></i>
                    {t("Currency")}
                  </div>
                  <div className="mobile-language-options">
                    <button
                      className={currency === "MAD" ? "active" : ""}
                      onClick={() => { setCurrency("MAD"); setMobileMenuOpen(false); }}
                    >
                      MAD (DH)
                    </button>
                    <button
                      className={currency === "EUR" ? "active" : ""}
                      onClick={() => { setCurrency("EUR"); setMobileMenuOpen(false); }}
                    >
                      EUR (€)
                    </button>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Right-side actions */}
            <div className="rf-actions">
              {/* Booking-on-WhatsApp block (desktop) */}
              <a
                className="rf-book-wa"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Booking on WhatsApp"
              >
                <span className="rf-book-wa-ico"><i className="fa-brands fa-whatsapp"></i></span>
                <span className="rf-book-wa-text">
                  <small>{t("Booking on WhatsApp:")}</small>
                  <bdi dir="ltr"><strong>{CALL_DISPLAY}</strong></bdi>
                </span>
              </a>

              {/* Compact language switcher */}
              <div className="rf-lang" ref={langDropdownRef}>
                <button
                  type="button"
                  className="rf-lang-trigger"
                  onClick={(e) => { e.preventDefault(); setLangDropdownOpen(!langDropdownOpen); }}
                >
                  <i className="fa-solid fa-globe"></i>
                  <span>{language === "en" ? "EN" : language === "fr" ? "FR" : "AR"}</span>
                  <i className={`fa-solid fa-chevron-down rf-caret ${langDropdownOpen ? "open" : ""}`}></i>
                </button>
                <div className={`rf-lang-menu${langDropdownOpen ? " show" : ""}`}>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLanguageChange("en"); setLangDropdownOpen(false); }}>English</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLanguageChange("fr"); setLangDropdownOpen(false); }}>Français</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLanguageChange("ar"); setLangDropdownOpen(false); }}>العربية</a>
                </div>
              </div>

              {/* Currency switcher — display only; bookings are charged in MAD */}
              <div className="rf-lang rf-cur" ref={curDropdownRef}>
                <button
                  type="button"
                  className="rf-lang-trigger"
                  onClick={(e) => { e.preventDefault(); setCurDropdownOpen(!curDropdownOpen); }}
                  aria-label={t("Currency")}
                >
                  <span className="rf-cur-sign">{currency === "EUR" ? "€" : "DH"}</span>
                  <span>{currency}</span>
                  <i className={`fa-solid fa-chevron-down rf-caret ${curDropdownOpen ? "open" : ""}`}></i>
                </button>
                <div className={`rf-lang-menu${curDropdownOpen ? " show" : ""}`}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrency("MAD"); setCurDropdownOpen(false); }}>
                    {t("Moroccan Dirham")} (MAD)
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrency("EUR"); setCurDropdownOpen(false); }}>
                    {t("Euro")} (EUR)
                  </a>
                </div>
              </div>

              {/* Call Us (icon-only on mobile) */}
              {/* aria-label is required: the <span> label below is hidden by CSS at
                  mobile widths, which left the link with no accessible name. */}
              <a className="rf-call-btn" href={`tel:${CALL_TEL}`} aria-label={t("Call Us")}>
                <i className="fa-solid fa-phone"></i>
                <span>{t("Call Us")}</span>
              </a>

              {/* WhatsApp icon button (mobile) */}
              <a
                className="rf-whatsapp-btn"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>

              {isLoggedIn ? (
                <div className="user-menu rf-account">
                  <a className="rf-account-trigger" href="#" onClick={(e) => e.preventDefault()} aria-label="Account">
                    <i className="fa-solid fa-user"></i>
                  </a>
                  <div className="user-dropdown">
                    <Link to={`/${language}/myaccount`}>
                      <i className="fa-solid fa-user"></i> {t("My Account")}
                    </Link>
                    <Link to={`/${language}/myaccount`} state={{ tab_type: "bookings" }}>
                      <i className="fa-solid fa-car"></i> {t("My Bookings")}
                    </Link>
                    <a href="#" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket"></i> {t("Logout")}
                    </a>
                  </div>
                </div>
              ) : (
                <Link className="rf-login-btn" to={`/${language}/login`} aria-label={t("Login / Register")} onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-user"></i>
                  <span>{t("Login / Register")}</span>
                </Link>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile-only "Booking on WhatsApp" pill bar */}
      <a
        className="rf-wa-pill-bar"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-whatsapp"></i>
        {/* bdi + dir="ltr": without it the bidi algorithm reorders the groups
            of an Arabic-context phone number and "+212 655 585 859" is shown
            as "859 585 655 212+". */}
        <span>
          {t("Booking on WhatsApp:")}{" "}
          <bdi dir="ltr"><strong>{CALL_DISPLAY}</strong></bdi>
        </span>
      </a>

      <PromoTicker />
    </header>
  );
};

export default HeaderNew;
