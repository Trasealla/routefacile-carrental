import React, { useContext, useEffect, useState } from "react";

import { Form, Spinner, Container, Col } from "react-bootstrap";

import { Link } from "react-router-dom";
import { PostCallWithErrorResponse, simpleGetCall } from "../config.js/SetUp";
import configWeb from "../config.js/configWeb";
import { simplePostCall, getApiLang } from "../config.js/SetUp";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
import "../styles/login.css";
import "../styles/auth.css";
import { useTranslation, Trans } from "react-i18next";
import FindCarForm2 from "../components/UI/FindCarForm2";
import Helmet from "../components/Helmet/Helmet";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoginFromRegister } from "../reducers/Slices/isLoginFromRegisterSlice";
import { pixelLeadEvent } from "../actions/facebookPixelEvents";
import MetaHelmet from "../components/Helmet/MetaHelmet";

// The dark-background wordmark (white lettering) used to be imported here, which
// rendered as a bare orange swoosh on the white card. This is the light-background
// version, served from public/ like the header so both share one cached file.
const logo = "/images/logo-header-v4.webp";

const Login = () => {
  const { t, i18n } = useTranslation();
  const [citiesArray, setCitiesArray] = useState([]);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);

  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, set_loading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errMsg, setErrMsg] = useState({ email: "", password: "" });
  
  // Check if user is already logged in and redirect
  useEffect(() => {
    const checkExistingLogin = () => {
      try {
        const tokenData = localStorage.getItem("token");
        if (tokenData) {
          const parsedToken = JSON.parse(tokenData);
          const now = new Date().getTime();
          
          // If token exists and is not expired, redirect to home
          if (parsedToken?.access_token && parsedToken?.expiry > now) {
            console.log('User already logged in, redirecting to home');
            navigate(`/${language || 'en'}`);
            return;
          } else if (parsedToken?.expiry <= now) {
            // Token expired, clear it
            console.log('Token expired, clearing...');
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        localStorage.removeItem("token");
      }
    };
    
    checkExistingLogin();
    window.scroll(0, 0);
  }, [navigate, language]);

  const Login = () => {
    let body = {
      email: email,

      password: password,
    };

    set_loading(true);
    simplePostCall(configWeb.POST_LOGIN, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          const now = new Date();
          const token_item = {
            access_token: res?.access_token,
            user_id: res?.user_id,
            expiry: now.getTime() + 2 * 60 * 60 * 1000, //2 hours from now
          };
          localStorage.setItem("token", JSON.stringify(token_item));
          notifySuccess(t("Login successfull"));
          pixelLeadEvent("Login");
          navigate(`/`);
          dispatch(setIsLoginFromRegister(false));
        } else {
          notifyError(res.message);
        }
      })
      .catch((errr) => {
        notifyError(t("Something went wrong, please try again later"));
      })
      .finally(() => {
        set_loading(false);
      });
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      Login();
    }

    setValidated(true);
  };

  const citiesData = () => {
    const url = `${configWeb.GET_CITIES}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        setCitiesArray(res);
      })
      .catch((errr) => {
        console.log("errr", errr);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  useEffect(() => {
    // citiesData();
  }, [language]);

  return (
    <>
      <div className="main-auth rf-auth">
        <Helmet title="Login to your Route Facile Account">
          <MetaHelmet
            title="Login to your Route Facile Account"
            description="Access your Route Facile account to manage bookings, view rental history, and update your profile. Fast, secure, and easy login for a smooth experience."
            noindex={true}
          />
          
          <div className="login-page-container">
            {/* Animated Background Elements */}
            <div className="login-bg-elements">
              <div className="login-bg-orb login-bg-orb-1"></div>
              <div className="login-bg-orb login-bg-orb-2"></div>
              <div className="login-bg-orb login-bg-orb-3"></div>
              <div className="login-grid-pattern"></div>
              
              {/* Floating Particles */}
              <div className="login-particles">
                <div className="login-particle"></div>
                <div className="login-particle"></div>
                <div className="login-particle"></div>
                <div className="login-particle"></div>
                <div className="login-particle"></div>
                <div className="login-particle"></div>
                <div className="login-particle"></div>
                <div className="login-particle"></div>
              </div>
              
              {/* Road Animation */}
              <div className="login-road-lines">
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
              </div>
            </div>

            {/* Login Card */}
            <div className="login-card">
              {/* Decorative Circles */}
              <div className="login-decoration login-decoration-1"></div>
              <div className="login-decoration login-decoration-2"></div>
              
              {/* Navy Header Section with Logo */}
              <div className="login-card-header">
                <div className="login-logo-section">
                  <img
                    src={logo}
                    alt="Route Facile - Rent A Car"
                    width="689"
                    height="191"
                    decoding="async"
                    fetchpriority="high"
                  />
                </div>
                <div className="login-welcome">
                  <h2>{t("Next ride?")} <span className="login-welcome-highlight">{t("Let's get you moving!")}</span></h2>
                </div>
              </div>

              {/* Form Body Section */}
              <div className="login-form-body">
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={handleSubmit}
                  className="login-form"
                >
                  {/* Email Input */}
                  <div className="login-input-group">
                  <label>{t("Email ID / Mobile Number")}</label>
                  <div className="login-input-wrapper">
                    <Form.Control
                      required
                      type="email"
                      placeholder={t("Enter Your Email ID / Mobile Number")}
                      value={email}
                      onChange={(e) => {
                        setErrMsg({ ...errMsg, email: "" });
                        setEmail(e.target.value);
                      }}
                    />
                    <span className="login-input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {t("Please Enter Email ID / Mobile Number.")}
                  </Form.Control.Feedback>
                </div>

                {/* Password Input */}
                <div className="login-input-group">
                  <label>{t("Password")}</label>
                  <div className="login-input-wrapper">
                    <Form.Control
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Enter your password")}
                      value={password}
                      onChange={(e) => {
                        setErrMsg({ ...errMsg, password: "" });
                        setPassword(e.target.value);
                      }}
                      style={{ paddingRight: "50px" }}
                    />
                    <button 
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {t("Please Enter password.")}
                  </Form.Control.Feedback>
                </div>

                {/* Forgot Password */}
                <div className="login-forgot">
                  <Link to={`/${language}/forgetpassword`}>
                    {t("Forgot Password ?")}
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading ? true : false}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    t("Login")
                  )}
                </button>

                {/* Divider */}
                <div className="login-divider">
                  <div className="login-divider-line"></div>
                  <span className="login-divider-text">{t("or")}</span>
                  <div className="login-divider-line"></div>
                </div>

                {/* Register Link */}
                <div className="login-register-link">
                  {t("Don't have an account?")}
                  <Link to={`/${language}/register`}>
                    {t("Sign Up")}
                  </Link>
                </div>
              </Form>
              </div>

              {/* Car Icon Animation */}
              <div className="login-car-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L19 11l-2-3H7l-2 3-2.16.86a1 1 0 00-.84.99V16h3m10 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-5 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0"/>
                </svg>
              </div>
            </div>
          </div>
        </Helmet>
      </div>
    </>
  );
};

export default Login;
