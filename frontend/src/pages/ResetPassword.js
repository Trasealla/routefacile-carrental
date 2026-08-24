import React, { useContext, useEffect, useState } from "react";

// import logo from "../../assets/images/Web-Application-Logo.svg";
import { Form, Spinner, Container } from "react-bootstrap";

import { Link } from "react-router-dom";
import { PostCallWithErrorResponse } from "../config.js/SetUp";
import configWeb from "../config.js/configWeb";
import logo from "../assets/new-logo/Car Rental Platform Logos/dark_logo_2480_1241.png";
import { simplePostCall } from "../config.js/SetUp";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
import "../styles/login.css";
import CommonSection from "../components/UI/CommonSection";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MetaHelmet from "../components/Helmet/MetaHelmet";

// Large SVG moved to public folder
const CarImg = "/images/loginCar.svg";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, set_loading] = useState(false);

  const [errMsg, setErrMsg] = useState({ email: "", password: "" });
  const [timer, setTimer] = useState(10);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

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
  const Login = () => {
    let body = {
      email: email,
      password: password,
      confirm_password: confirmPassword,
      otp: otp,
    };

    set_loading(true);
    simplePostCall(configWeb.POST_RESET_PASSWORD, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          // localStorage.setItem('access_token', res?.access_token)
          notifySuccess(t("Your password has been updated successfully"));
          navigate(`/${language}/login`);
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

  return (
    <div className="main-auth my-4 ">
      <MetaHelmet title="Reset Password" description="" noindex={true} />
      <CommonSection title="Reset Password" />
      <Container>
        <div className="login-wrapper">
          <div className="row height-style">
            <div className="col-lg-6 col-md-12 left">
              <div className="bg-img">
                <h3 className="mt-5 mb-0">
                  <Trans
                    i18nKey="a_new_way_to_track"
                    components={{ br: <br /> }}
                  />
                </h3>
                <img src={CarImg} className="carImg" alt="" />
              </div>
            </div>

            <div className="col-lg-6 col-md-12 right cx-relative">
              <div className="wrapper row">
                <div>
                  <div className="top-logo">
                    <img src={logo} alt="" />
                  </div>
                  <h3 style={{ color: "#0D1B2A" }}>{t("Reset Password")}</h3>
                  <div className="auth-form">
                    <Form
                      noValidate
                      validated={validated}
                      onSubmit={handleSubmit}
                    >
                      <div className="form-group ajax-msg w-100 mb-4">
                        <div className="alert alert-success" style={{}}>
                          {t("OTP has been sent to your email address and to your registered mobile number")}
                        </div>
                      </div>
                      <div className="mb-4">
                        <Form.Label className="common-labels">
                          {t("Email ID")}
                        </Form.Label>
                        <Form.Control
                          required
                          type="email"
                          placeholder={t("Enter Your Email ID")}
                          value={email}
                          onChange={(e) => {
                            setErrMsg({ ...errMsg, email: "" });

                            setEmail(e.target.value);
                          }}
                        />

                        <Form.Control.Feedback type="invalid">
                          {t("Please Enter Email ID")}.
                        </Form.Control.Feedback>
                      </div>
                      <div className="mb-4">
                        <Form.Label className="common-labels">
                          {t("New Password")}
                        </Form.Label>
                        <Form.Control
                          required
                          type="password"
                          placeholder={t("Enter Your New Password")}
                          value={password}
                          onChange={(e) => {
                            setErrMsg({ ...errMsg, password: "" });

                            setPassword(e.target.value);
                          }}
                        />

                        <Form.Control.Feedback type="invalid">
                          {t("Please Enter New Password")}.
                        </Form.Control.Feedback>
                      </div>
                      <div className="mb-4">
                        <Form.Label className="common-labels">
                          {t("Confirm New Password")}
                        </Form.Label>
                        <Form.Control
                          required
                          type="password"
                          placeholder={t("Confirm Your New Password")}
                          value={confirmPassword}
                          onChange={(e) => {
                            setErrMsg({ ...errMsg, confirmPassword: "" });

                            setConfirmPassword(e.target.value);
                          }}
                          isInvalid={password !== confirmPassword}
                        />

                        <Form.Control.Feedback type="invalid">
                          {t("Passwords do not match")}.
                        </Form.Control.Feedback>
                      </div>
                      <div className="mb-2">
                        <Form.Label className="common-labels">{t("OTP")}</Form.Label>
                        <Form.Control
                          required
                          type="number"
                          placeholder={t("Enter OTP")}
                          value={otp}
                          onChange={(e) => {
                            setErrMsg({ ...errMsg, otp: "" });

                            setOtp(e.target.value);
                          }}
                        />

                        <Form.Control.Feedback type="invalid">
                          {t("Please Enter OTP")}.
                        </Form.Control.Feedback>
                      </div>

                      <div className="form-check setp2_field mb-2" style={{}}>
                        <span className="mr-1"> {t("Not received OTP?")} </span>
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
                          {t("Resend OTP")}
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
                      </div>

                      <div className="btn-auth">
                        {/* <Link to="/"> */}

                        <button
                          type="submit"
                          className="filled-btn"
                          //   onClick={Userlogin}
                          disabled={loading ? true : false}
                        >
                          {loading ? (
                            <Spinner animation="border" variant="#1D288E" />
                          ) : (
                            t("Submit")
                          )}
                          {/* {loading && (
                            <ColorRing
                              visible={true}
                              height="30"
                              width="30"
                              ariaLabel="blocks-loading"
                              wrapperStyle={{}}
                              wrapperClass="blocks-wrapper"
                              colors={[
                                "#e15b64",
                                "#f47e60",
                                "#f8b26a",
                                "#abbd81",
                                "#849b87",
                              ]}
                            />
                          )} */}
                        </button>
                        {/* </Link> */}
                        <div className="or-section-main"></div>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ResetPassword;
