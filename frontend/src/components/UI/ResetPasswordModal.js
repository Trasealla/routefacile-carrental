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
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./LoginModal.css";
import { useSelector } from "react-redux";
import { pixelLeadEvent } from "../../actions/facebookPixelEvents";

function ResetPasswordModal({
  setResetPasswordModalShow,
  setLoginModalShow,
  resetPasswordModalShow,
}) {
  // const [forgetPasswordModalShow, setForgetPasswordModalShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
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
          // navigate(`/${language}/login`)
          setResetPasswordModalShow(false);
          setLoginModalShow(true);
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
    <>
      <Modal
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={resetPasswordModalShow}
        onHide={() => setResetPasswordModalShow(false)}
        className="custom-modal-width"
      >
        <Modal.Header closeButton dir="ltr">
          <Modal.Title id="contained-modal-title-vcenter">
            {t("Reset Password")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="wrapper row">
            <div>
              <div className="d-flex justify-content-center">
                <div className="top-logo mb-4">
                  <img src={logo} alt="" width={400} />
                </div>
              </div>
              <div className="d-flex justify-content-center">
                <h3>{t("Welcome Back !")}</h3>
              </div>

              <div className="auth-form">
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <div className="form-group ajax-msg w-100 mb-4">
                    <div className="alert alert-success" style={{}}>
                      {t(
                        "OTP has been sent to your email address and to your registered mobile number"
                      )}
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
                      {t("Please Enter Email ID.")}
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
                      {t("Please Enter New Password.")}
                    </Form.Control.Feedback>
                  </div>
                  <div className="mb-4">
                    <Form.Label className="common-labels">
                      {t("Confirm Password")}
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
                      {t("Password do not match.")}
                    </Form.Control.Feedback>
                  </div>
                  <div className="mb-2">
                    <Form.Label className="common-labels">
                      {t("OTP")}
                    </Form.Label>
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
                    </button>
                    {/* </Link> */}
                    <div className="or-section-main"></div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="close-button"
            onClick={() => setResetPasswordModalShow(false)}
          >
            {t("Close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ResetPasswordModal;
