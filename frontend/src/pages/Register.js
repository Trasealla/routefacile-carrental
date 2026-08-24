import React, { useState } from "react";
import "../styles/register.css";
import "../styles/auth.css";
import { Form, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Helmet from "../components/Helmet/Helmet";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import {
  simpleGetCall,
  simplePostCall,
  getApiLang,
} from "../config.js/SetUp";
import configWeb from "../config.js/configWeb";
import { useEffect } from "react";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { pixelLeadEvent } from "../actions/facebookPixelEvents";
import "react-datepicker/dist/react-datepicker.css";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import { OTPVerification } from "../components/UI/OTP";


// Same fix as the login page: the old import was the dark-background
// wordmark (white lettering), which showed as a bare orange swoosh on the
// white card. This is the light-background version, shared with the header.
const logo = "/images/logo-header-v4.webp";
const Register = () => {
  const language = useSelector((state) => state.language.language);
  const [validated, setValidated] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, set_loading] = useState(false);
  const [dobError, setDobError] = useState("");

  // State variables for each input field
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [nationality, setNationality] = useState("");
  const [cities, setCities] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countryID, setCountryID] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countries, setCountries] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [otp_flag, set_otp_flag] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handler functions
  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);

  const handleNationalityChange = (e) => {
    const selectedCountry = countries.find(
      (country) => country.name === e.target.value
    );
    setNationality(e.target.value);
    setCountryCode(selectedCountry ? selectedCountry.phone_code : "");
    setCountryID(selectedCountry ? selectedCountry.id : "");
  };
  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };
  const handleCitiesChange = (e) => {
    setCities(e.target.value);
  };
  const handleContactNumberChange = (e) => setContactNumber(e.target.value);
  const handleGenderChange = (e) => setGender(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    
    if(!isChecked){
      setAgreementError("Please agree in order to register");
    }
    if (!dateOfBirth) {
      setDobError("Please provide birth date");
    }
    if (
      form.checkValidity() === false ||
      password !== confirmPassword ||
      !dateOfBirth
    ) {
      event.stopPropagation();
      setValidated(true);
    } else {
      setDobError("");
      Registration_OLD();
    }
  };

  const Registration_OLD = () => {
    return new Promise((resolve, reject) => {
      // Add timestamp to make temp email unique for each registration attempt
      const timestamp = Date.now();
      const tempEmail = `${contactNumber}_${timestamp}@temp.com`;
      
      let body = {
        first_name: "temp",
        last_name: "temp",
        phone_code: countryCode,
        phone_number: contactNumber,
        email: tempEmail,
        password: "temp123",
        confirm_password: "temp123",
        dob: "2000-01-01",
        gender: "male",
        country_id: countryID,
      };
      
      if (countryCode === "971") {
        body.city_id = cities || "1";
      }

      set_loading(true);
      simplePostCall(configWeb.POST_REGISTER_CLASSIC, JSON.stringify(body))
        .then((res) => {
          if (res.status === "success") {
            resolve(true);
            setRegistrationData({
              firstName,
              lastName,
              dateOfBirth,
              gender,
              countryID,
              phoneCode: countryCode,
              phoneNumber: contactNumber,
              email,
              password,
              confirmPassword,
              cities: countryCode === "971" ? cities : null,
              tempEmail: tempEmail
            });
            set_otp_flag(true);
          } else {
            resolve(false);
            // Handle specific error messages
            const errorMsg = Array.isArray(res.message) ? res.message[0] : res.message;
            notifyError(t(errorMsg));
          }
        })
        .catch((errr) => {
          console.log("errr", errr);
          resolve(false);
          notifyError(t("Registration failed. Please try again."));
        })
        .finally(() => {
          set_loading(false);
          setAgreementError("")
        });
    });
  };

  const fetchCountryData = async () => {
    const url = `${configWeb.GET_COUNTRY_LIST}?lang=${getApiLang(language)}&page_size=260`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
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
        set_loading(false);
      });
  };

  useEffect(() => {
    window.scroll(0, 0);
    fetchCountryData()
      .then((data) => {
        setCountries(data?.data);
      })
      .catch((err) => {});
    citiesData();
  }, [language]);

  // ── Multi-step wizard ──────────────────────────────────────────────────
  // The form asks for 11 things. Presented as one wall it read as a chore and
  // pushed the submit button below the fold. Splitting it into three named
  // steps means each screen asks for a few related things and always fits.
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;
  const [stepError, setStepError] = useState("");

  // Each step is validated on its own before advancing, so a customer is never
  // told about a problem three screens after they caused it.
  const validateStep = (n) => {
    if (n === 1) {
      if (!firstName.trim() || !lastName.trim()) return t("Please enter your first and last name.");
      if (!dateOfBirth) return t("Please provide date of birth.");
      if (!nationality) return t("Please select nationality.");
    }
    if (n === 2) {
      if (!countryCode) return t("Please select country code.");
      if (!contactNumber.trim()) return t("Please provide a contact number.");
      if (!email.trim()) return t("Please provide email.");
    }
    return "";
  };

  const goNext = () => {
    const msg = validateStep(step);
    if (msg) { setStepError(msg); return; }
    setStepError("");
    setStep((n) => Math.min(n + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setStepError("");
    setStep((n) => Math.max(n - 1, 1));
  };

  const [isChecked, setIsChecked] = useState(false);
  const [agreementError, setAgreementError] = useState('');
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleOTPVerifySuccess = async (response) => {
    if (registrationData) {
      set_loading(true);
      try {
        const finalRegistrationBody = {
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          dob: registrationData.dateOfBirth,
          gender: registrationData.gender,
          country_id: registrationData.countryID,
          phone_code: registrationData.phoneCode,
          phone_number: registrationData.phoneNumber,
          email: registrationData.email,
          password: registrationData.password,
          confirm_password: registrationData.confirmPassword,
        };
        
        if (registrationData.phoneCode === "971" && registrationData.cities) {
          finalRegistrationBody.city_id = registrationData.cities;
        }

        const finalResponse = await simplePostCall(
          configWeb.POST_REGISTER, 
          JSON.stringify(finalRegistrationBody)
        );
        
        if (finalResponse.status === "success" || !finalResponse.error) {
          notifySuccess(t("You are registered successfully"));
          pixelLeadEvent("Register");
          set_otp_flag(false);
          navigate(`/${language}/login`);
        } else {
          const errorMsg = Array.isArray(finalResponse?.message) 
            ? finalResponse.message[0] 
            : finalResponse.message || t("Registration failed. Please try again.");
          notifyError(errorMsg);
        }
      } catch (error) {
        console.error("Final registration error:", error);
        notifyError(t("Registration failed. Please try again."));
      } finally {
        set_loading(false);
      }
    }
  };

  const handleOTPClose = () => {
    set_otp_flag(false);
    setRegistrationData(null);
  };

  const handleDateChange = (date) => {
    const formatDate = dayjs(date).format("YYYY-MM-DD");
    setDateOfBirth(formatDate);
  };

  return (
    <>
      <div className="main-auth rf-auth">
        <Helmet title="Create Your Route Facile Account Today">
          <MetaHelmet
            title="Create Your Route Facile Account Today"
            description="Register now to book cars faster, manage your rentals, and access exclusive deals. Join Route Facile for a smoother, smarter car rental experience."
            noindex={true}
          />
          
          <div className="login-page-container">
            {/* Animated Background Elements */}
            <div className="login-bg-elements">
              <div className="login-bg-orb login-bg-orb-1"></div>
              <div className="login-bg-orb login-bg-orb-2"></div>
              <div className="login-bg-orb login-bg-orb-3"></div>
              <div className="login-grid-pattern"></div>
              
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
              
              <div className="login-road-lines">
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
                <div className="login-road-line"></div>
              </div>
            </div>

            {/* Brand panel. Carries the logo and the three reasons to sign up,
                so the form card itself can stay purely functional. Hidden below
                992px, where the screen belongs to the form. */}
            <aside className="rf-auth-brand">
              <img
                className="rf-auth-brand-logo"
                src={logo}
                alt="Route Facile - Rent A Car"
                width="689"
                height="191"
                decoding="async"
              />
              <h2 className="rf-auth-brand-title">{t("Your journey, our comfort")}</h2>
              <p className="rf-auth-brand-sub">{t("Explore Morocco without limits with Route Facile")}</p>
              <span className="rf-auth-brand-rule"></span>

              <div className="rf-auth-usp">
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
                  {t("Fast and secure booking")}
                </h3>
                <ul>
                  <li>
                    <i className="fa-solid fa-bolt" aria-hidden="true"></i>
                    <span>{t("Instant confirmation")}</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-headset" aria-hidden="true"></i>
                    <span>{t("24/7 support")}</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-tag" aria-hidden="true"></i>
                    <span>{t("No hidden fees")}</span>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Register Card */}
            <div className="login-card register-card">
              <div className="login-decoration login-decoration-1"></div>
              <div className="login-decoration login-decoration-2"></div>
              
              {/* Header Section */}
              <div className="login-card-header">
                <span className="rf-auth-eyebrow">{t("Join Route Facile")}</span>
                <div className="login-welcome">
                  <h2>{t("Start your journey with us")}</h2>
                </div>
                <p className="rf-auth-lede">{t("Create your account in minutes and enjoy a faster booking experience.")}</p>
                <p className="rf-auth-secure">
                  <svg className="rf-auth-secure-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="10.5" width="16" height="10" rx="2" />
                    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
                  </svg>{" "}
                  {t("Your data is protected and secure")}
                </p>

                {/* Step indicator. Naming the steps sets the expectation that
                    this is short, which is the point of splitting it up. */}
                <ol className="rf-steps" aria-label={t("Registration steps")}>
                  {[
                    { n: 1, label: t("Personal information") },
                    { n: 2, label: t("Contact details") },
                    { n: 3, label: t("Security") },
                  ].map((s2) => (
                    <li
                      key={s2.n}
                      className={`rf-step ${step === s2.n ? "is-active" : ""} ${step > s2.n ? "is-done" : ""}`}
                      aria-current={step === s2.n ? "step" : undefined}
                    >
                      <span className="rf-step-dot">{step > s2.n ? (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="13" height="13"><path d="m5 12.5 4.5 4.5L19 7" /></svg>) : s2.n}</span>
                      <span className="rf-step-label">{s2.label}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Form Body Section */}
              <div className="login-form-body">
                {!otp_flag ? (
                  <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                    className="login-form"
                  >
                    {/* Name Row */}
                    {step === 1 && (
                    <>
                    <div className="register-row">
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("First Name")}</label>
                          <div className="login-input-wrapper">
                            <Form.Control
                              type="text"
                              placeholder={t("Enter first name")}
                              value={firstName}
                              onChange={handleFirstNameChange}
                              required
                            />
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {t("Please provide a first name.")}
                          </Form.Control.Feedback>
                        </div>
                      </div>
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("Last Name")}</label>
                          <div className="login-input-wrapper">
                            <Form.Control
                              type="text"
                              placeholder={t("Enter last name")}
                              value={lastName}
                              onChange={handleLastNameChange}
                              required
                            />
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {t("Please provide a last name.")}
                          </Form.Control.Feedback>
                        </div>
                      </div>
                    </div>

                    {/* DOB and Nationality Row */}
                    <div className="register-row">
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("Date of Birth")}</label>
                          <div className="login-input-wrapper">
                            <DatePicker
                              className={`form-control ${dobError && !dateOfBirth ? "is-invalid" : ""}`}
                              selected={dateOfBirth ? new Date(dateOfBirth) : null}
                              onChange={handleDateChange}
                              placeholderText={t("Select date")}
                              dateFormat="yyyy/MM/dd"
                              showYearDropdown
                              yearDropdownItemNumber={50}
                              scrollableYearDropdown
                              withPortal
                              popperModifiers={[
                                {
                                  name: 'offset',
                                  options: {
                                    offset: [0, 8],
                                  },
                                },
                                {
                                  name: 'preventOverflow',
                                  options: {
                                    rootBoundary: 'viewport',
                                    tether: false,
                                    altAxis: true,
                                  },
                                },
                              ]}
                            />
                          </div>
                          {dobError && !dateOfBirth && (
                            <span className="invalid-feedback d-block">{t(dobError)}</span>
                          )}
                        </div>
                      </div>
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("Nationality")}</label>
                          <div className="login-input-wrapper">
                            <Form.Select
                              value={nationality}
                              onChange={handleNationalityChange}
                              required
                            >
                              <option value="">{t("Select nationality")}</option>
                              {countries?.map((country) => (
                                <option key={country.id} value={country.name}>
                                  {country?.name}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {t("Please select a nationality")}.
                          </Form.Control.Feedback>
                        </div>
                      </div>
                    </div>

                    </>
                    )}

                    {step === 2 && (
                    <>
                    {/* Country Code and Contact Row */}
                    <div className="register-row">
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("Country Code")}</label>
                          <div className="login-input-wrapper">
                            <Form.Select
                              value={countryCode}
                              onChange={handleCountryCodeChange}
                              required
                            >
                              <option value="">{t("Select code")}</option>
                              {countries?.map((country) => (
                                <option key={country.id} value={country.phone_code}>
                                  {country.name} +{country.phone_code}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {t("Please select a country code")}.
                          </Form.Control.Feedback>
                        </div>
                      </div>
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("Contact Number")}</label>
                          <div className="login-input-wrapper">
                            <Form.Control
                              type="tel"
                              placeholder={t("Enter phone number")}
                              value={contactNumber}
                              onChange={handleContactNumberChange}
                              required
                            />
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {t("Please provide a contact number.")}
                          </Form.Control.Feedback>
                        </div>
                      </div>
                    </div>

                    {/* Cities (conditional) */}
                    {countryCode === "971" && (
                      <div className="login-input-group">
                        <label>{t("Cities")}</label>
                        <div className="login-input-wrapper">
                          <Form.Select
                            value={cities}
                            onChange={handleCitiesChange}
                            required
                          >
                            <option value="">{t("Select Cities")}</option>
                            {citiesArray?.map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {t("Please select an city")}.
                        </Form.Control.Feedback>
                      </div>
                    )}

                    {/* Email */}
                    <div className="login-input-group">
                      <label>{t("Email Address")}</label>
                      <div className="login-input-wrapper">
                        <Form.Control
                          type="email"
                          placeholder={t("Enter your email")}
                          value={email}
                          onChange={handleEmailChange}
                          required
                        />
                        <span className="login-input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </span>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {t("Please provide email.")}
                      </Form.Control.Feedback>
                    </div>

                    </>
                    )}

                    {step === 3 && (
                    <>
                    {/* Password Row */}
                    <div className="register-row">
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("Password")}</label>
                          <div className="login-input-wrapper">
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              placeholder={t("Enter password")}
                              value={password}
                              onChange={handlePasswordChange}
                              required
                              style={{ paddingRight: "50px" }}
                            />
                            <button 
                              type="button"
                              className="login-password-toggle"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {t("Please provide a password")}.
                          </Form.Control.Feedback>
                        </div>
                      </div>
                      <div className="register-col">
                        <div className="login-input-group">
                          <label>{t("Confirm Password")}</label>
                          <div className="login-input-wrapper">
                            <Form.Control
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder={t("Confirm password")}
                              value={confirmPassword}
                              onChange={handleConfirmPasswordChange}
                              required
                              isInvalid={password !== confirmPassword && confirmPassword !== ""}
                              style={{ paddingRight: "50px" }}
                            />
                            <button 
                              type="button"
                              className="login-password-toggle"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {t("Passwords do not match")}.
                          </Form.Control.Feedback>
                        </div>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="login-input-group">
                      <label>{t("Gender")}</label>
                      <div className="register-gender-row">
                        <label className="register-radio">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === "male"}
                            onChange={handleGenderChange}
                            required
                          />
                          <span className="register-radio-label">{t("Male")}</span>
                        </label>
                        <label className="register-radio">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === "female"}
                            onChange={handleGenderChange}
                            required
                          />
                          <span className="register-radio-label">{t("Female")}</span>
                        </label>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="register-terms">
                      <label className="register-checkbox">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={handleCheckboxChange}
                          required
                        />
                        <span className="register-checkbox-mark"></span>
                        <span className="register-checkbox-text">
                          {t("By selecting this option, you agree to our")}{" "}
                          <Link to={`/${language}/termscondition`} target="_blank">
                            {t("Terms and Conditions")}
                          </Link>{" "}
                          {t("and acknowledge that you have read our")}{" "}
                          <Link to={`/${language}/privacypolicy`} target="_blank">
                            {t("Privacy Policy")}
                          </Link>.
                        </span>
                      </label>
                      {agreementError && !isChecked && (
                        <p className="register-error">{t(agreementError)}</p>
                      )}
                    </div>

                    </>
                    )}

                    {/* Step error — shown when a step is incomplete, so the
                        customer is told immediately rather than on submit. */}
                    {stepError && <p className="register-error rf-step-error">{stepError}</p>}

                    {/* Navigation. Only the final step submits; the earlier ones
                        advance, so pressing Enter mid-form cannot register a
                        half-filled account. */}
                    <div className="rf-step-nav">
                      {step > 1 && (
                        <button type="button" className="rf-step-back" onClick={goBack}>
                          {t("Back")}
                        </button>
                      )}
                      {step < TOTAL_STEPS ? (
                        <button type="button" className="login-btn" onClick={goNext}>
                          {t("Continue")}
                        </button>
                      ) : (
                        <button type="submit" className="login-btn" disabled={loading}>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            t("Create Account")
                          )}
                        </button>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="login-divider">
                      <div className="login-divider-line"></div>
                      <span className="login-divider-text">{t("or")}</span>
                      <div className="login-divider-line"></div>
                    </div>

                    {/* Login Link */}
                    <div className="login-register-link">
                      {t("Already have an account?")}
                      <Link to={`/${language}/login`}>
                        {t("Sign In")}
                      </Link>
                    </div>
                  </Form>
                ) : registrationData ? (
                  <div className="otp-container">
                    <OTPVerification
                      phoneNumber={registrationData.phoneNumber}
                      phoneCode={registrationData.phoneCode}
                      email={registrationData.tempEmail}
                      verificationType="registration"
                      onVerifySuccess={handleOTPVerifySuccess}
                      onClose={handleOTPClose}
                      showPhoneNumber={true}
                      autoSend={true}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Helmet>
      </div>
    </>
  );
};

export default Register;
