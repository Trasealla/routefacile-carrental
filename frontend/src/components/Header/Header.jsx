import React, { useRef, useState, useEffect, useContext } from "react";

import { Container, Row, Col } from "reactstrap";
import {
  Link,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "../../styles/header.css";
import Logout from "../../assets/all-images/Logout.svg";
import Login from "../../assets/all-images/Login.svg";
import Register from "../../assets/all-images/Register.svg";
import personDark from "../../assets/all-images/persondark.svg";
import Booking from "../../assets/all-images/Booking.svg";
import Dropdown from "react-bootstrap/Dropdown";
import { useTranslation } from "react-i18next";
// import { AppContext } from "../../context/AppContext";
import { UseSelector, useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../../actions/action";
import { notifyError } from "../../SharedComponent/notify";

const carlogo = "/images/logo-header-v4.webp";

const Header = () => {
  const { t, i18n } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const isLoginFromRegister = useSelector(
    (state) => state.isLoginFromRegister.isLoginFromRegister
  );
  const dispatch = useDispatch();
  const { lang } = useParams();
  const allowedLangs = ["en", "ar", "fr", "ae"];

  useEffect(() => {
    if (lang) {
      if (!allowedLangs.includes(lang)) {
        navigate("/not-found");
      }
    }
  }, [lang]);

  const menuRef = useRef(null);
  const navLinks = [
    {
      path: `/${language}/offerspage`,
      display: t("Special Offers"),
    },
    {
      path: `/${language}/segment-pricing`,
      display: t("Segment Pricing"),
      new: true
    },
    {
      path: `/${language}/edc-exclusive`,
      display: t("EDC Offer"),
      new: true
    },
    {
      path: `/${language}/ourfleetlist`,
      display: t("Our Fleet"),
    },
    {
      path: `/${language}/location`,
      display: t("Our Locations"),
    },
  
    {
      display: t('Platform'),
      children: [
        {
          path: `/${language}/platform-modules`,
          display: t("All Modules"),
        },
        {
          path: `/${language}/fleet-leasing`,
          display: t("Fleet & Leasing"),
        },
        {
          path: `/${language}/chauffeur-module`,
          display: t("Chauffeur Module"),
        },
    
      ]
    }
  ];

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isDropdownLink, setDropdownLink] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const toggleMenu = () => menuRef.current.classList.toggle("menu__active");
  // const { SetChangeLang , language, setLanguage} = useContext(AppContext);

  //   const addonSettingData = useSelector((state) => state.auth.addonModule);

  // Get the language preference from local storage or default to 'en'
  // const [language, setLanguage] = useState(localStorage.getItem("language") || "ar");
  //   const [language, setLanguage] = useState("ar");

  useEffect(() => {
    i18n.changeLanguage(language);
    document.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = location.pathname.split("/")[1]; // Get current language from URL
  const handleLangChange = async (lang) => {
    dispatch(setLanguage(lang));
   await i18n.changeLanguage(lang);
    document.dir = lang === "ar" ? "rtl" : "ltr"; 
    // document.documentElement.lang = lang;      
    // document.documentElement.dir = i18n.dir(lang);

    const newPath = location.pathname.replace(`/${currentLang}`, `/${lang}`);
    navigate(newPath);
  };

  const setTokenExpiryHandler = () => {
    const token_item = localStorage.getItem("token");
    if (!token_item) {
      return;
    }
    const item = JSON.parse(token_item);
    const now = new Date();
    const timeRemaining = item.expiry - now.getTime();

    if (timeRemaining <= 0) {
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      // Set a timeout to log out the user when the token expires
      setTimeout(() => {
        localStorage.removeItem("token");
      }, timeRemaining);
    }
  };

  useEffect(() => {
    setTokenExpiryHandler();
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
  };


 
  const toggleSubMenu =(index)=>{
   
 setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <header className="header sticky-top">
      {/* ============ header top ============ */}
      {/* <div className="header__top">
        <Container>
          <Row>
            <Col lg="6" md="6" sm="6">
              <div className="header__top__left">
                <span>Need Help?</span>
                <span className="header__top__help">
                  <i className="ri-phone-fill"></i> +1-202-555-0149
                </span>
              </div>
            </Col>

            <Col lg="6" md="6" sm="6">
              <div className="header__top__right d-flex align-items-center justify-content-end gap-3">
                <Link
                  to="/login"
                  className=" d-flex align-items-center gap-1"
                  style={{ textDecoration: "none" }}
                >
                  <i className="ri-login-circle-line"></i>
                  <span style={{ color: "#fff" }}>Login</span>
                </Link>

                <Link
                  to="/register"
                  className=" d-flex align-items-center gap-1"
                >
                  <i className="ri-user-line"></i>{" "}
                  <span style={{ color: "#fff" }}>Register</span>
                </Link>
               
              </div>
            </Col>
          </Row>
        </Container>
      </div> */}

      {/* =============== header middle =========== */}
      <div className="header__middle sticky-top bg-light shadow-lg">
        <Container>
          <Row>
            <Col className="logo" lg="4" md="3" sm="4">
              <div>
                <div>
                  <Link to="/" className=" d-flex align-items-center gap-2">
                    {/* <i className="ri-car-line"></i> */}
                    <img
                      src={carlogo}
                      height="50px"
                      width="auto"
                      alt="car logo"
                    />
                    <span></span>
                  </Link>
                </div>
              </div>
            </Col>

            <Col lg="8">
              {/* ========== main navigation =========== */}

              <div className="main__navbar ">
                <Container className="tab-header-menu">
                  <div className="navigation__wrapper d-flex align-items-center justify-content-end">
                    <span className={`mobile__menu ${language === 'ar' ? 'margin-left-auto' : 'margin-right-auto'}`}>
                      <i
                        className="ri-menu-line text-secondary"
                        onClick={toggleMenu}
                      ></i>
                    </span>
                    <div
                      /* className="d-block d-md-none" */ className="d-not-on-med"
                    >
                      <Link to="/">
                        <img
                          src={carlogo}
                          height="50px"
                          width="auto"
                          alt="car logo"
                        />
                      </Link>
                    </div>
                    <div
                      className="navigation"
                      ref={menuRef}
                      onClick={toggleMenu}
                    >
                      <div className="menu">
                        <div className="text-end w-100 d-block d-md-none">
                          <i className="ri-close-line mx-3 text-secondary"></i>
                        </div>

                        {navLinks.map((item, index) => (
                          <div className="footer-badge-2" key={index}>
                            {item.children ? (
                              <div className="nav__item nav__submenu-parent"
                                  //for mobile toggle on click
                                  onClick={(event)=>{
                                    event.stopPropagation(); // Prevent menu from closing
                                    if(window.innerWidth <= 768) toggleSubMenu(index)
                                  }}
                              >
                                <span>{item.display}</span>
                              
                                <div  className={`nav__submenu ${
        window.innerWidth <= 768
          ? openIndex === index
            ? "submenu-open"
            : "submenu-closed"
          : ""
      }`}>
                                  {item.children.map((child, idx) => (
                                    <NavLink
                                      to={child.path}
                                      key={idx}
                                      className={(navClass) =>
                                        navClass.isActive ? "nav__active nav__item nav__item__child" : "nav__item__child nav__item"
                                      }

                                  
                                    >
                                      {child.display }
                                    </NavLink>
                                  ))}
                                </div>
                             
                              </div>
                            ) : (
                              <NavLink
                                to={item.path}
                                className={(navClass) =>
                                  navClass.isActive ? "nav__active nav__item" : "nav__item"
                                }
                              >
                                {item.display}
                                {item.new && <span className={`badge animated-badge  ${language === 'en' ? 'margin-left' : 'margin-right'}`}>{t("New")}</span>}
                              </NavLink>
                            )}
                          </div>
                        ))} 

                        <div
                          className="activeHolder"
                          onMouseEnter={() => setDropdownVisible(true)}
                          onClick={() => setDropdownVisible(true)}
                          onMouseLeave={() => setDropdownVisible(false)}
                        >
                          <img
                            src={personDark}
                            alt="person dark"
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent menu from closing
                              setDropdownVisible(!isDropdownVisible);
                            }}
                          />
                          {isDropdownVisible  ? (
                            <div
                              className="dropdownBox mobie-menu-login-register"
                              // onMouseEnter={() => setDropdownLink(true)}
                              // onMouseLeave={() => setDropdownLink(false)}
                            >
                              {localStorage.getItem("token") &&
                                !isLoginFromRegister && (
                                  <>
                                    <Link
                                      to={
                                        localStorage.getItem("token")
                                          ? `/${language}/myaccount`
                                          : `/${language}/login`
                                      }
                                      state={{ tab_type: "first" }}
                                    >
                                      <img
                                        src={personDark}
                                        className="me-2"
                                        alt="person dark"
                                      />{" "}
                                      {t("My Account")}
                                    </Link>
                                    <Link
                                      to={
                                        localStorage.getItem("token")
                                          ? `/${language}/myaccount`
                                          : `/${language}/login`
                                      }
                                      state={{ tab_type: "bookings" }}
                                    >
                                      <img
                                        src={Booking}
                                        className="me-2"
                                        alt="person dark"
                                      />{" "}
                                      {t("Bookings")}
                                    </Link>

                                    {/* <Link
                                    to={
                                      localStorage.getItem("token")
                                        ? `/${language}/myaccount`
                                        : `/${language}/login`
                                    }
                                    state={{ tab_type: "fifth" }}
                                  >
                                    <img
                                      src={Invoices}
                                      className="me-2"
                                      alt="person dark"
                                    />{" "}
                                    {t("Invoices")}
                                  </Link>
                                  <Link
                                    to={
                                      localStorage.getItem("token")
                                        ? `/${language}/myaccount`
                                        : `/${language}/login`
                                    }
                                    state={{ tab_type: "sixth" }}
                                  >
                                    <img
                                      src={Loyalty}
                                      className="me-2"
                                      alt="person dark"
                                    />{" "}
                                    {t("Route Facile Rewards")}
                                  </Link> */}
                                  </>
                                )}

                              {(!localStorage.getItem("token") || isLoginFromRegister) && (
                                <Link
                                  to={`/${language}/login`}
                                  className=" d-flex align-items-center gap-1"
                                  style={{ textDecoration: "none" }}
                                >
                                  <img
                                    src={Login}
                                    className="me-2"
                                    alt="login symbol"
                                  />{" "}
                                  {t("Login")}
                                </Link>
                              )}
                              {(!localStorage.getItem("token") || isLoginFromRegister) &&  (
                                <Link
                                  to={`/${language}/register`}
                                  className=" d-flex align-items-center gap-1"
                                >
                                  <img
                                    src={Register}
                                    className="me-2"
                                    alt="register symbol"
                                  />{" "}
                                  {t("Register")}
                                </Link>
                              )}
                              {(localStorage.getItem("token") && !isLoginFromRegister) && (
                                <Link
                                  to={`/${language}/login`}
                                  onClick={handleLogOut}
                                >
                                  <img
                                    src={Logout}
                                    className="me-2"
                                    alt="logout symbol"
                                  />{" "}
                                  {t("Logout")}
                                </Link>
                              )}
                            </div>
                          ) : null}
                        </div>

                         <Dropdown onClick={(e)=> e.stopPropagation() }>
                          <Dropdown.Toggle variant="light" id="dropdown-basic">
                            <svg
                              className=" "
                              style={{ color: "#020a4de9" }}
                              fill="currentColor"
                              height="20"
                              viewBox="0 0 16 16"
                              width="30"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855q-.215.403-.395.872c.705.157 1.472.257 2.282.287zM4.249 3.539q.214-.577.481-1.078a7 7 0 0 1 .597-.933A7 7 0 0 0 3.051 3.05q.544.277 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9 9 0 0 1-1.565-.667A6.96 6.96 0 0 0 1.018 7.5zm1.4-2.741a12.3 12.3 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332M8.5 5.09V7.5h2.99a12.3 12.3 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.6 13.6 0 0 1 7.5 10.91V8.5zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741zm-3.282 3.696q.18.469.395.872c.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a7 7 0 0 1-.598-.933 9 9 0 0 1-.481-1.079 8.4 8.4 0 0 0-1.198.49 7 7 0 0 0 2.276 1.522zm-1.383-2.964A13.4 13.4 0 0 1 3.508 8.5h-2.49a6.96 6.96 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667m6.728 2.964a7 7 0 0 0 2.275-1.521 8.4 8.4 0 0 0-1.197-.49 9 9 0 0 1-.481 1.078 7 7 0 0 1-.597.933M8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855q.216-.403.395-.872A12.6 12.6 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.96 6.96 0 0 0 14.982 8.5h-2.49a13.4 13.4 0 0 1-.437 3.008M14.982 7.5a6.96 6.96 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008zM11.27 2.461q.266.502.482 1.078a8.4 8.4 0 0 0 1.196-.49 7 7 0 0 0-2.275-1.52c.218.283.418.597.597.932m-.488 1.343a8 8 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z"></path>
                            </svg>
                          </Dropdown.Toggle>

                          <Dropdown.Menu
                            className="nav__item"
                            style={{ fontWeight: "600" }}
                          >
                            <Dropdown.Item
                              // href="#/action-1"
                              className="nav__item"
                              style={{
                                color: "#020a4de9",
                                fontWeight: "600",
                                transition: "0.3s",
                              }}
                              onClick={() => handleLangChange("en")}
                            >
                              English
                            </Dropdown.Item>
                            <Dropdown.Item
                              // href="#/action-2"
                              className="nav__item"
                              style={{ color: "#020a4de9", fontWeight: "600" }}
                              onClick={() => handleLangChange("ar")}
                            >
                              العربية
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown> 
                      </div>
                    </div>
                  </div>
                </Container>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </header>
  );
};

export default Header;
