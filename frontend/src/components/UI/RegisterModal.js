import React, { useState } from "react";
import "../../styles/register.css";
import { Form, Spinner, Container } from "react-bootstrap";
import CommonSection from "../../components/UI/CommonSection";
import {
  getWithAuthCallWithErrorResponse,
  simpleGetCall,
  simplePostCall_New,
  simplePostCall,
  getApiLang,
} from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { useEffect } from "react";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import { trackSignUp } from "../../SharedComponent/tracking";
import { Link, useNavigate } from "react-router-dom";
import { UseSelector, useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import { pixelLeadEvent } from "../../actions/facebookPixelEvents";
import ExistingCustomerRadio from "../../SharedComponent/AreYouExistingUser/ExistingCustomerRadio";
import { setIsLoginFromRegister } from "../../reducers/Slices/isLoginFromRegisterSlice";
import { OTPVerification } from "../../components/UI/OTP";

function RegisterModal({
  registerModalShow,
  setRegisterModalShow,
  setLoginModalShow,
  isExistingCustomer,
  handleSelectionChange,
}) {

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const [loading, set_loading] = useState(false);
  // State variables for each input field
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [cities, setCities] = useState("");
  const [countryCode, setCountryCode] = useState("212");
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

  // Handler functions to update the state
  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);
  const handleDateOfBirthChange = (e) => setDateOfBirth(e.target.value);
  // const handleNationalityChange = (e) => setNationality(e.target.value);

  const handleNationalityChange = (e) => {
    const selectedCountry = countries.find(
      (country) => country.name === e.target.value
    );
    setNationality(e.target.value);
    setCountryCode(selectedCountry ? selectedCountry.phone_code : "");
    setCountryID(selectedCountry ? selectedCountry.id : "");
  };
  const handleCountryCodeChange = (e) => {
    const selectedCode = e.target.value;
    setCountryCode(selectedCode);
    // Also set countryID so it's available for registration
    const selectedCountry = countries.find(
      (country) => country.phone_code === selectedCode
    );
    setCountryID(selectedCountry ? selectedCountry.id : "");
  };
  const handleCitiesChange = (e) => {
    setCities(e.target.value);
  };
  // const handleCountryCodeChange = (e) => setCountryCode(e.target.value);
  const handleContactNumberChange = (e) => setContactNumber(e.target.value);
  const handleGenderChange = (e) => setGender(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const [isChecked, setIsChecked] = useState(false); // State to store checkbox value
  const [agreementError, setAgreementError] = useState('');
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked); // Update the state based on checkbox value
   
  };

  const registerUser = async (userData) => {
    const url = configWeb.POST_REGISTER;

    try {
      const response = await simplePostCall_New(url, userData);
      return response;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

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
          notifySuccess(
            "Thank you, Please proceed"
          );
          pixelLeadEvent("Login");
          setLoginModalShow(false);
          setRegisterModalShow(false);
          // setCardModalShow(true);
          setFirstName("");
          setLastName("");
          setCountryCode("");
          setContactNumber("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
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

  const handleSubmit = async (event) => {
    const form = event.currentTarget;

    event.preventDefault();
    if(!isChecked){
      setAgreementError("Please agree in order to register");
    }
    if (form.checkValidity() === false || password !== confirmPassword || !isChecked) {
      event.stopPropagation();
      setValidated(true);
    } else {
      await Registration_OLD();
    }
  };
  // Auto-login removed - user now provides their own password during registration

  const Registration_OLD = () => {
    return new Promise((resolve, reject) => {
      // Send real user data so the account is created with correct credentials
      let body = {
        first_name: firstName,
        last_name: lastName,
        phone_code: countryCode,
        phone_number: contactNumber,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        dob: "2000-01-01",
        gender: "male",
        ...(countryID ? { country_id: countryID } : {}),
      };

      if (countryCode === "212") {
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
              countryID,
              phoneCode: countryCode,
              phoneNumber: contactNumber,
              email,
              password,
              confirmPassword,
              cities: countryCode === "212" ? cities : null,
            });
            set_otp_flag(true);
          } else {
            const errorMsg = Array.isArray(res.message) ? res.message[0] : res.message;
            resolve(false);
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
          setAgreementError("");
        });
    });
  };

  // Handle successful OTP verification - user is now activated, log them in
  const handleOTPVerifySuccess = async (response) => {
    if (registrationData) {
      set_loading(true);
      try {
        // If OTP response contains a token, use it directly
        if (response?.access_token) {
          const now = new Date();
          const token_item = {
            access_token: response.access_token,
            user_id: response.user_id,
            expiry: now.getTime() + 3 * 60 * 60 * 1000,
          };
          localStorage.setItem("token", JSON.stringify(token_item));
          dispatch(setIsLoginFromRegister(true));
          pixelLeadEvent("Register");
          // Account genuinely created — not merely submitted.

          trackSignUp("email");

          notifySuccess(t("Registration successful!"));
          set_otp_flag(false);
          setRegistrationData(null);
          setRegisterModalShow(false);
        } else {
          // Auto-login with the user's real credentials
          const loginBody = {
            email: registrationData.email,
            password: registrationData.password,
          };
          const loginResponse = await simplePostCall(
            configWeb.POST_LOGIN,
            JSON.stringify(loginBody)
          );
          if (!loginResponse?.error) {
            const now = new Date();
            const token_item = {
              access_token: loginResponse.access_token,
              user_id: loginResponse.user_id,
              expiry: now.getTime() + 3 * 60 * 60 * 1000,
            };
            localStorage.setItem("token", JSON.stringify(token_item));
            dispatch(setIsLoginFromRegister(true));
            pixelLeadEvent("Register");
            // Account genuinely created — not merely submitted.

            trackSignUp("email");

            notifySuccess(t("Registration successful!"));
            set_otp_flag(false);
            setRegistrationData(null);
            setRegisterModalShow(false);
          } else {
            // Login failed but registration succeeded — redirect to login page
            notifySuccess(t("Registration successful! Please login."));
            set_otp_flag(false);
            setRegistrationData(null);
            setRegisterModalShow(false);
            setLoginModalShow(true);
          }
        }
      } catch (error) {
        console.error("Login after registration error:", error);
        notifySuccess(t("Registration successful! Please login."));
        set_otp_flag(false);
        setRegistrationData(null);
        setRegisterModalShow(false);
        setLoginModalShow(true);
      } finally {
        set_loading(false);
      }
    }
  };

  const handleOTPClose = () => {
    set_otp_flag(false);
    setRegistrationData(null);
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
    fetchCountryData()
      .then((data) => {
        setCountries(data?.data);
        // setLoading(false);
      })
      .catch((err) => {
        // setError(err.message);
        // setLoading(false);
      });
    // citiesData();
  }, [language]);


  const handleRegister = async () => {
    // setLoading(true);
    const userData = {
      first_name: firstName,
      last_name: lastName,
      dob: dateOfBirth,
      gender: gender,
      country_id: countryID,
      city_id: 1,
      phone_code: countryCode,
      phone_number: contactNumber,
      email: email,
      password: password,
      confirm_password: confirmPassword,
    };

    try {
      const res = await registerUser(userData);
      if (res.status === "success") {
        // Assuming response contains a "result" field indicating success
        // Also assuming "notifySuccess" and "notifyError" are functions defined elsewhere
        notifySuccess(res.status);
        // navigate("/DispatchOrder");
      } else {
        notifyError(res.message[0]);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      notifyError(t("Something went wrong, please try again later"));
    } finally {
      // setLoading(false);
    }
  };

  ///////////////////////////////////////////////////RESET PASSWORD STATES AND METHODS ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // const [validated, setValidated] = useState(false);
  const [otp, setOtp] = useState("");
  // const [loading, set_loading] = useState(false);

  const [errMsg, setErrMsg] = useState({ email: "", password: "" });
  const [timer, setTimer] = useState(10);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  // const [isExistingCustomer, setIsExistingCustomer] = useState("no");

  // const handleSelectionChange = (value) => {
  //   if (value === "yes") {
  //     setRegisterModalShow(false);
  //     setLoginModalShow(true);
  //   }
  //   setIsExistingCustomer(value);
  // };
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOTP = () => {
    setIsResendDisabled(true);
    setTimer(10); // Set timer for 60 seconds
    // Add logic to resend OTP here
    let body = {
      email: email,
    };

    // set_loading(true);
    simplePostCall(configWeb.POST_FORGOT_PASSWORD, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          // localStorage.setItem('access_token', res?.access_token)
          notifySuccess(t("Success. We have sent you OTP via email"));
          //   navigate('/ResetPassword')
        } else {
          notifyError(res.message[0]);
        }
      })
      .catch((errr) => {
        notifyError(t("Something went wrong, please try again later"));
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  const registerOTP = () => {
    let body = {
      email: email,
      register_otp: otp,
    };

    set_loading(true);
    simplePostCall(configWeb.POST_REGISTER_OTP, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          // localStorage.setItem('access_token', res?.access_token)
          notifySuccess(t("You are registered successfully"));
          setRegisterModalShow(false);
          setLoginModalShow(true);

          set_otp_flag(false);
        } else {
          if (Array.isArray(res?.message)) {
            notifyError(res.message[0]);
          }

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

  // const handleSubmit2 = (event) => {
  //   const form = event.currentTarget;
  //   event.preventDefault();

  //   if (form.checkValidity() === false) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   } else {
  //     registerOTP();
  //   }

  //   setValidated(true);
  // };

  const SubmitOTP = () => {
    // registerOTP();
  };

  return (
    <>
      <Modal
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={registerModalShow}
        onHide={() => setRegisterModalShow(false)}
        className="custom-modal-width rf-reg-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
           
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-12">
            <div className="leftCOntent">
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12">
                    {/* <h1 className="headingTxt">Your personal details:</h1> */}
                  <div className="custom-radio-component- mt-4-">

                    <ExistingCustomerRadio
              value={isExistingCustomer}
              onSelectionChange={handleSelectionChange}
              />
              </div>
                    {
                      !otp_flag ? (
                        <label className="labelIn">
                          {/* Whether you have previously rented from Route Facile Rent a
                        Car or not, take advantage of the many special services
                        and join now without any obligation. */}
                        </label>
                      ) : (
                        <label className="labelIn">
                          {t("Please Enter the OTP provided to your phone number")}.
                        </label>
                      )
                    }
                  </div>
                  {
                    !otp_flag ? (
                      <>
                        <div className="col-lg-6 col-md-12 formBox mb-3">
                          <Form.Group controlId="validationFirstName">
                            <Form.Control
                              type="text"
                              placeholder={t("First Name")}
                              value={firstName}
                              onChange={handleFirstNameChange}
                              required
                              className="form-control borderedInp"
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Please provide a first name.")}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="col-lg-6 col-md-12 formBox mb-3">
                          <Form.Group controlId="validationLastName">
                            <Form.Control
                              type="text"
                              required
                              placeholder={t("Last Name")}
                              value={lastName}
                              onChange={handleLastNameChange}
                              className="form-control borderedInp"
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Please provide a last name.")}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>

                        <div className="col-lg-6 col-md-12 formBox mb-3">
                          <Form.Group controlId="validationNationality">
                            <Form.Select
                              value={nationality}
                              onChange={handleNationalityChange}
                              required
                              className="form-select borderedInp"
                            >
                              <option value="">{t("Nationality")}</option>
                              {countries?.map((country) => (
                                <option key={country.id} value={country.name}>
                                  {country?.name}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {t("Please select a nationality.")}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>

                        {/* <div className="col-lg-6 col-md-12 formBox">
                        <Form.Group controlId="validationLastName">
                          <Form.Control
                            type="date"
                            required
                            placeholder="Date of Birth"
                            value={dateOfBirth}
                            onChange={handleDateOfBirthChange}
                            className="form-control borderedInp"
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide date of birth.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div> */}
                        {/* <div className="col-lg-6 col-md-12 formBox">
                        <Form.Group controlId="validationNationality">
                          <Form.Select
                            value={nationality}
                            onChange={handleNationalityChange}
                            required
                            className="form-select borderedInp"
                          >
                            <option value="">Nationality</option>
                            {countries?.map((country) => (
                              <option key={country.id} value={country.name}>
                                {country?.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            Please select a nationality.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div> */}
                        {/* <div className="col-lg-6 col-md-12 formBox">
                        <Form.Group controlId="validationCountryCode">
                          <Form.Select
                            value={countryCode}
                            onChange={handleCountryCodeChange}
                            required
                            className="form-select borderedInp"
                          >
                            <option value="">Country Code</option>
                            {countries
                              ?.filter(
                                (country) => country.name === nationality
                              )
                              ?.map((country) => (
                                <option
                                  key={country.id}
                                  value={country.phone_code}
                                >
                                  {country.code} {country.phone_code}
                                </option>
                              ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            Please select a country code.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div> */}
                        {/* {countryCode === "212" && (
                        <div className="col-lg-6 col-md-12 formBox">
                          <Form.Group controlId="validationCountryCode">
                            <Form.Select
                              value={cities}
                              onChange={handleCitiesChange}
                              required
                              className="form-select borderedInp"
                            >
                              <option value="">Select Cities</option>
                              {citiesArray
                                // ?.filter((city) => city.name === nationality)
                                ?.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              Please select a country code.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      )} */}

                        <div className="col-lg-6 col-md-12 col-sm-12 formBox d-flex gap-1 mb-3">
                          <div className="col-lg-4 col-md-4 col-sm-4">
                            <Form.Group controlId="validationCountryCode">
                              <Form.Select
                                value={countryCode}
                                onChange={handleCountryCodeChange}
                                required
                                className="form-select borderedInp"
                              >
                                <option value="">{t("Country Code")}</option>
                                <option value="212">
                                  {
                                    countries?.find(
                                      (item) => item.phone_code === "212"
                                    )?.name
                                  }{" "}
                                  212{" "}
                                </option>
                                {countries?.map((country) => (
                                  <option
                                    key={country.id}
                                    value={country.phone_code}
                                  >
                                    {country.name} {country.phone_code}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">
                                {t("Please select a country code.")}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                          <div className="col-lg-8 col-md-8 col-sm-8">
                            <Form.Group controlId="validationContactNumber">
                              <Form.Control
                                type="text"
                                placeholder={t("Contact Number")}
                                value={contactNumber}
                                onChange={handleContactNumberChange}
                                className="form-control borderedInp"
                              />
                              <Form.Control.Feedback type="invalid">
                                {t("Please provide a contact number.")}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-12 formBox mb-3">
                          <Form.Group controlId="validationEmail">
                            <Form.Control
                              type="text"
                              placeholder={t("Enter Email")}
                              value={email}
                              onChange={handleEmailChange}
                              className="form-control borderedInp"
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Please provide email.")}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="col-lg-6 col-md-12 formBox mb-3">
                          <Form.Group controlId="validationPassword">
                            <Form.Control
                              type="password"
                              placeholder={t("Password")}
                              value={password}
                              onChange={handlePasswordChange}
                              required
                              minLength={6}
                              className="form-control borderedInp"
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Password must be at least 6 characters.")}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>

                        <div className="col-lg-6 col-md-12 formBox mb-3">
                          <Form.Group controlId="validationConfirmPassword">
                            <Form.Control
                              type="password"
                              placeholder={t("Confirm Password")}
                              value={confirmPassword}
                              onChange={handleConfirmPasswordChange}
                              required
                              className="form-control borderedInp"
                              isInvalid={password !== confirmPassword && confirmPassword !== ""}
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Passwords do not match.")}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        {/* <div className="col-md-12">
                        <Form.Group controlId="validationGender">
                          <div className="checFlex">
                            <div className="form-check">
                              <Form.Check
                                type="radio"
                                label="Male"
                                name="gender"
                                id="male"
                                value="male"
                                checked={gender === "male"}
                                onChange={handleGenderChange}
                                required
                              />
                            </div>
                            <div className="form-check">
                              <Form.Check
                                type="radio"
                                label="Female"
                                name="gender"
                                id="female"
                                value="female"
                                checked={gender === "female"}
                                onChange={handleGenderChange}
                                required
                              />
                            </div>
                          </div>
                          <Form.Control.Feedback type="invalid">
                            Please select a gender.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div> */}
                        <div className="col-12" style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
      <input
      className="formBox"
required
        type="checkbox"
        id="terms-checkbox"
        checked={isChecked} // Controlled component
        onChange={handleCheckboxChange} // Handle changes
        style={{height:'2rem', width:'2rem' , 
          ...(language === 'ar' ? {marginLeft:'8px'} : {marginRight:'8px'})
        }}
      />
      <label htmlFor="terms-checkbox" className="labelIn">
        {t("By selecting this option, you agree to our")}{" "}
        <Link to= {`/${language}/termscondition`} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
          {t("Terms and Conditions")}
        </Link>{" "}
        {t("and acknowledge that you have read our")}{" "}
        <Link to={`/${language}/privacypolicy`} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
          {t("Privacy Policy")}
        </Link>
        .
      </label>
    </div>
    <div>
     {agreementError && !isChecked && <p className="invalid-feedback-custom">{t(agreementError)}</p> } 
    </div>
                        <div className="col-md-12 btn-auth">
                          <button
                            type="submit"
                            className="rf-reg-submit"
                            disabled={loading ? true : false}
                          >
                            {loading ? (
                              <Spinner animation="border" variant="#1D288E" />
                            ) : (
                              t("Save & Continue")
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <OTPVerification
                          phoneNumber={registrationData?.phoneNumber}
                          phoneCode={registrationData?.phoneCode}
                          email={registrationData?.email}
                          verificationType="registration"
                          onVerifySuccess={handleOTPVerifySuccess}
                          onClose={handleOTPClose}
                          showPhoneNumber={true}
                          autoSend={false}
                        />

                        {/* <div className="form-check setp2_field mb-2" style={{}}>Hidden legacy OTP input
                        <span className="mr-1"> Not received OTP? </span>
                        <button
                          className="fw-semibold"
                          onClick={handleResendOTP}
                          disabled={isResendDisabled}
                          id="forgotpasswordresendotp_href"
                          style={{
                            background: "none",
                            border: "none",
                            color: "blue",
                            cursor: "pointer",
                            padding: 0,
                            display: timer > 0 && "none",
                          }}
                        >
                          Resend OTP
                        </button>
                        <span
                          id="forgotpasswordresendotp_timer"
                          style={{
                            color: "rgb(2, 37, 76)",
                            fontSize: "18px",
                            display: timer > 0 ? "inline" : "none",
                          }}
                        >
                          {timer}s
                        </span>
                      </div> */}



                      </>
                    )
                  }
                </div>
              </Form>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="close-button"
            onClick={() => setRegisterModalShow(false)}
          >
            {t("Close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RegisterModal;
