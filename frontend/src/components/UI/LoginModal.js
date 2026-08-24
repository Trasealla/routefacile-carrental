import React, { useContext, useEffect, useState } from "react";

// import logo from "../../assets/images/Web-Application-Logo.svg";
import { Form, Spinner, Container } from "react-bootstrap";

import { Link } from "react-router-dom";
// import {PostCallWithErrorResponse} from '../config.js/SetUp'
import configWeb from "../../config.js/configWeb";
import logo from "../../assets/new-logo/logo.png";
import { simplePostCall } from "../../config.js/SetUp";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import "../../styles/login.css";
import CommonSection from "../../components/UI/CommonSection";

import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./LoginModal.css";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoginFromRegister } from "../../reducers/Slices/isLoginFromRegisterSlice";
import { pixelLeadEvent } from "../../actions/facebookPixelEvents";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../context/CurrencyContext";
// Morocco first and selected by default — it is where essentially every booking
// comes from. The rest cover the markets that actually show up in the visitor
// logs, so the list stays short enough to scan on a phone.
const DEFAULT_PHONE_CODE = "212";
const PHONE_CODES = [
  { code: "212", flag: "\u{1F1F2}\u{1F1E6}" }, // Morocco
  { code: "33",  flag: "\u{1F1EB}\u{1F1F7}" }, // France
  { code: "34",  flag: "\u{1F1EA}\u{1F1F8}" }, // Spain
  { code: "32",  flag: "\u{1F1E7}\u{1F1EA}" }, // Belgium
  { code: "31",  flag: "\u{1F1F3}\u{1F1F1}" }, // Netherlands
  { code: "49",  flag: "\u{1F1E9}\u{1F1EA}" }, // Germany
  { code: "39",  flag: "\u{1F1EE}\u{1F1F9}" }, // Italy
  { code: "44",  flag: "\u{1F1EC}\u{1F1E7}" }, // United Kingdom
  { code: "1",   flag: "\u{1F1FA}\u{1F1F8}" }, // United States / Canada
  { code: "213", flag: "\u{1F1E9}\u{1F1FF}" }, // Algeria
  { code: "216", flag: "\u{1F1F9}\u{1F1F3}" }, // Tunisia
  { code: "971", flag: "\u{1F1E6}\u{1F1EA}" }, // United Arab Emirates
  { code: "966", flag: "\u{1F1F8}\u{1F1E6}" }, // Saudi Arabia
];

function LoginModal({
  loginModalShow,
  setLoginModalShow,
  setRegisterModalShow,
  setForgetPasswordModalShow,
  setCardModalShow,
  isExistingCustomer,
  handleSelectionChange,
  setIsExistingCustomer,
  selectedCar,
  bookingDetails,
  totalWithVAT,
  onLoginSuccess,
  allowGuest = false,
  onGuestContinue,
}) {
  // const [loginModalShow, setLoginModalShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const { t } = useTranslation();
  const { format: fmt } = useCurrency();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, set_loading] = useState(false);

  const [errMsg, setErrMsg] = useState({ email: "", password: "" });
  // Guest checkout is the default whenever it is on offer. Signing in is still
  // one click away for customers who want the booking in their history, but a
  // pay-later reservation should never be gated behind a password.
  const [showLogin, setShowLogin] = useState(!allowGuest);
  const [guestIdentifier, setGuestIdentifier] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestPhoneCode, setGuestPhoneCode] = useState(DEFAULT_PHONE_CODE);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestError, setGuestError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [agreementError, setAgreementError] = useState("");
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };
  // const [isExistingCustomer, setIsExistingCustomer] = useState("yes");

  // const handleSelectionChange = (value) => {
  //   if (value === "no") {
  //     setLoginModalShow(false);
  //     setRegisterModalShow(true);
  //   }
  //   setIsExistingCustomer(value);
  // };
  
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
            expiry: now.getTime() + 3 * 60 * 60 * 1000, //3 hours from now
            // expiry: now.getTime() + 1 * 60 * 1000, // 5 minutes from now
          };
          localStorage.setItem("token", JSON.stringify(token_item));
          notifySuccess(t("Login successfull"));
          pixelLeadEvent("Login");
          setLoginModalShow(false);
          dispatch(setIsLoginFromRegister(false));
          // Call onLoginSuccess callback if provided
          if (onLoginSuccess) {
            onLoginSuccess();
          }
          // setCardModalShow(true);
        } else {
          notifyError(res.message);
        }
      })
      .catch((errr) => {
        notifyError(t("Something went wrong, please try again"));
      })
      .finally(() => {
        set_loading(false);
      });
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    if (!isChecked) {
      setAgreementError("Please agree in order to login");
    }

    if (form.checkValidity() === false || !isChecked) {
      event.stopPropagation();
      setValidated(true);
      return;
    } else {
      setAgreementError("");
      Login();
    }

    setValidated(true);
  };

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const isPhone = (v) => /^\+?\d[\d\s\-().]{7,17}$/.test(v);

  const handleGuestSubmit = (event) => {
    event.preventDefault();

    const name = guestName.trim();
    const phone = guestPhone.replace(/[^\d]/g, "");
    const email = guestEmail.trim();

    if (!name) {
      setGuestError(t("Please enter your full name."));
      return;
    }
    // The mobile is what the counter actually calls when a customer is late or
    // the flight moves, so it is the one contact detail we insist on. Email is
    // asked for too but stays optional — plenty of customers here book on a
    // phone and have no address to hand.
    if (!phone) {
      setGuestError(t("Please enter your mobile number."));
      return;
    }
    if (phone.length < 6) {
      setGuestError(t("Please enter a valid mobile number."));
      return;
    }
    if (email && !isEmail(email)) {
      setGuestError(t("Please enter a valid email address."));
      return;
    }
    if (!isChecked) {
      setGuestError(t("Please agree to the Terms and Conditions to continue."));
      return;
    }

    setGuestError("");
    set_loading(true);
    Promise.resolve(
      onGuestContinue?.({
        full_name: name,
        phone_code: guestPhoneCode,
        phone_number: phone,
        email,
        // Kept so the caller can still show "we sent it to …" without having to
        // decide which of the two contact details was the meaningful one.
        identifier: email || `+${guestPhoneCode}${phone}`,
      })
    ).finally(() => set_loading(false));
  };

  const handleRegisterClick = () => {
    setRegisterModalShow(true);
    // setForgetPasswordModalShow(true);
    setLoginModalShow(false);
  };
  const handleForgetPasswordClick = () => {
    setForgetPasswordModalShow(true);
    setLoginModalShow(false);
  };

  return (
    <>
      <Modal
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={loginModalShow}
        onHide={() => setLoginModalShow(false)}
        className="lm-modal"
      >
        {/* ── Header ── */}
        <Modal.Header closeButton className="lm-header">
          <div className="lm-header-brand">
            <div className="lm-header-icon">
              <i className="fa-solid fa-lock" />
            </div>
            <div>
              <h5 className="lm-header-title">
                {showLogin ? t("Login & Continue") : t("Almost there")}
              </h5>
              <p className="lm-header-sub">
                {showLogin
                  ? t("Sign in to complete your booking")
                  : t("Just your email or mobile number — no account needed")}
              </p>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="lm-body">

          {/* ── Booking Summary Card ── */}
          {selectedCar && bookingDetails && (
            <div className="lm-booking-card">
              <div className="lm-booking-top">
                <i className="fa-solid fa-car" />
                <span>{t("Your Booking Details")}</span>
              </div>
              <div className="lm-booking-content">
                <span className="rf-car-stage rf-car-stage--sm lm-booking-thumb">
                  <img
                    src={selectedCar?.image}
                    alt={selectedCar?.car_name}
                    className="lm-booking-img"
                  />
                </span>
                <div className="lm-booking-info">
                  <p className="lm-booking-name">{selectedCar?.car_name}</p>
                  <div className="lm-booking-row">
                    <span>{t("Pickup")}:</span>
                    <span className="lm-val-green">{bookingDetails?.pickupDate} {t("at")} {bookingDetails?.pickupTime}</span>
                  </div>
                  <div className="lm-booking-row">
                    <span>{t("Dropoff")}:</span>
                    <span className="lm-val-green">{bookingDetails?.dropoffDate} {t("at")} {bookingDetails?.dropoffTime}</span>
                  </div>
                  <div className="lm-booking-row">
                    <span>{t("Total Days")}:</span>
                    <span className="lm-val-blue">{bookingDetails?.totalDays} {t("Days")}</span>
                  </div>
                  <div className="lm-booking-row">
                    <span>{t("Total Amount")}:</span>
                    <span className="lm-val-orange">{fmt(totalWithVAT)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Existing Customer Toggle (login flow only) ── */}
          {showLogin && (
          <div className="lm-toggle-row">
            <span className="lm-toggle-label">{t("Are you an existing customer ?")}</span>
            <div className="lm-toggle-pills">
              <button
                type="button"
                className={`lm-pill${isExistingCustomer === "yes" ? " active" : ""}`}
                onClick={() => handleSelectionChange("yes")}
              >
                {t("Yes")}
              </button>
              <button
                type="button"
                className={`lm-pill${isExistingCustomer === "no" ? " active" : ""}`}
                onClick={() => handleSelectionChange("no")}
              >
                {t("No")}
              </button>
            </div>
          </div>
          )}

          {/* ── Guest checkout: one field, no password ── */}
          {!showLogin && (
            <form onSubmit={handleGuestSubmit} className="lm-form" noValidate>
              <div className="lm-field">
                <label className="lm-label" htmlFor="guest-name">
                  <i className="fa-regular fa-user" />
                  {t("Full Name")}
                </label>
                <input
                  id="guest-name"
                  type="text"
                  autoComplete="name"
                  className="lm-input form-control"
                  placeholder={t("e.g. Youssef El Amrani")}
                  value={guestName}
                  onChange={(e) => { setGuestError(""); setGuestName(e.target.value); }}
                />
              </div>

              <div className="lm-field">
                <label className="lm-label" htmlFor="guest-phone">
                  <i className="fa-solid fa-mobile-screen" />
                  {t("Mobile Number")}
                </label>
                {/* Country code sits beside the number rather than inside it, so
                    the customer never has to know whether to type 0, +212 or
                    00212 — the three forms Moroccan numbers are written in. */}
                <div className="lm-phone-row">
                  <select
                    id="guest-phone-code"
                    className="lm-input form-control lm-phone-code"
                    value={guestPhoneCode}
                    onChange={(e) => { setGuestError(""); setGuestPhoneCode(e.target.value); }}
                    aria-label={t("Country code")}
                  >
                    {PHONE_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{`${c.flag} +${c.code}`}</option>
                    ))}
                  </select>
                  <input
                    id="guest-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className="lm-input form-control lm-phone-number"
                    placeholder={t("e.g. 655585859")}
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestError("");
                      // Strip a leading 0 and any punctuation: Moroccan mobiles
                      // are written 06.., but the international form drops it.
                      setGuestPhone(e.target.value.replace(/[^\d]/g, "").replace(/^0+/, ""));
                    }}
                  />
                </div>
              </div>

              <div className="lm-field">
                <label className="lm-label" htmlFor="guest-email">
                  <i className="fa-regular fa-envelope" />
                  {t("Email Address")}
                </label>
                <input
                  id="guest-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="lm-input form-control"
                  placeholder={t("e.g. you@example.com")}
                  value={guestEmail}
                  onChange={(e) => { setGuestError(""); setGuestEmail(e.target.value); }}
                />
                <p className="lm-guest-hint">
                  {t("We use these only to send your booking confirmation.")}
                </p>
              </div>

              <div className="lm-terms-row">
                <input
                  type="checkbox"
                  id="terms-checkbox-guest"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  className="lm-checkbox"
                />
                <label htmlFor="terms-checkbox-guest" className="lm-terms-label">
                  {t("By selecting this option, you agree to our")}{" "}
                  <Link to={`/${language}/termscondition`} target="_blank" rel="noopener noreferrer" className="lm-link">
                    {t("Terms and Conditions")}
                  </Link>{" "}
                  {t("and acknowledge that you have read our")}{" "}
                  <Link to={`/${language}/privacypolicy`} target="_blank" rel="noopener noreferrer" className="lm-link">
                    {t("Privacy Policy")}
                  </Link>.
                </label>
              </div>

              {guestError && <p className="lm-error">{guestError}</p>}

              <button type="submit" className="lm-submit-btn" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> {t("Confirming...")}</>
                  : <><i className="fa-solid fa-circle-check" /> {t("Confirm Booking")}</>
                }
              </button>

              <p className="lm-register-row">
                {t("Have an account?")}{" "}
                <button type="button" className="lm-register-link" onClick={() => { setGuestError(""); setShowLogin(true); }}>
                  {t("Log in instead")}
                </button>
              </p>
            </form>
          )}

          {/* ── Login Form ── */}
          {showLogin && (
          <Form noValidate validated={validated} onSubmit={handleSubmit} className="lm-form">

            <div className="lm-field">
              <label className="lm-label">
                <i className="fa-regular fa-envelope" />
                {t("Email ID / Mobile Number")}
              </label>
              <Form.Control
                required
                type="email"
                placeholder={t("Enter Your Email ID / Mobile Number")}
                value={email}
                className="lm-input"
                onChange={(e) => { setErrMsg({ ...errMsg, email: "" }); setEmail(e.target.value); }}
              />
              <Form.Control.Feedback type="invalid">
                {t("Please Enter Email ID / Mobile Number.")}
              </Form.Control.Feedback>
            </div>

            <div className="lm-field">
              <label className="lm-label">
                <i className="fa-solid fa-key" />
                {t("Password")}
              </label>
              <Form.Control
                required
                type="password"
                placeholder={t("Enter your password")}
                value={password}
                className="lm-input"
                onChange={(e) => { setErrMsg({ ...errMsg, password: "" }); setPassword(e.target.value); }}
              />
              <Form.Control.Feedback type="invalid">
                {t("Please Enter password.")}
              </Form.Control.Feedback>
            </div>

            <div className="lm-forgot-row">
              <Link to="#" className="lm-forgot-link" onClick={handleForgetPasswordClick}>
                {t("Forgot Password ?")}
              </Link>
            </div>

            {/* Terms checkbox */}
            <div className="lm-terms-row">
              <input
                type="checkbox"
                id="terms-checkbox-login"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="lm-checkbox"
              />
              <label htmlFor="terms-checkbox-login" className="lm-terms-label">
                {t("By selecting this option, you agree to our")}{" "}
                <Link to={`/${language}/termscondition`} target="_blank" rel="noopener noreferrer" className="lm-link">
                  {t("Terms and Conditions")}
                </Link>{" "}
                {t("and acknowledge that you have read our")}{" "}
                <Link to={`/${language}/privacypolicy`} target="_blank" rel="noopener noreferrer" className="lm-link">
                  {t("Privacy Policy")}
                </Link>.
              </label>
            </div>
            {agreementError && !isChecked && (
              <p className="lm-error">{t(agreementError)}</p>
            )}

            {/* Submit */}
            <button type="submit" className="lm-submit-btn" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> {t("Signing in...")}</>
                : <><i className="fa-solid fa-arrow-right-to-bracket" /> {t("Login & Continue")}</>
              }
            </button>

            {/* Register link */}
            <p className="lm-register-row">
              {t("Don't have an account?")}{" "}
              <button type="button" className="lm-register-link" onClick={handleRegisterClick}>
                {t("Register")}
              </button>
            </p>

            {allowGuest && (
              <p className="lm-register-row">
                <button type="button" className="lm-register-link" onClick={() => { setErrMsg({ email: "", password: "" }); setShowLogin(false); }}>
                  {t("Continue as guest instead")}
                </button>
              </p>
            )}
          </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default LoginModal;
