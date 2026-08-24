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
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Helmet from "../components/Helmet/Helmet";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import { useTranslation, Trans } from "react-i18next";

// Large SVG moved to public folder
const CarImg = "/images/loginCar.svg";
const ForgetPassword = () => {
  const [validated, setValidated] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, set_loading] = useState(false);

  const [errMsg, setErrMsg] = useState({ email: "", password: "" });

  const Login = () => {
    let body = {
      email: email,
    };

    set_loading(true);
    simplePostCall(configWeb.POST_FORGOT_PASSWORD, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          // localStorage.setItem('access_token', res?.access_token)
          notifySuccess(t("forget_password_otp_success"));
          navigate(`/${language}/ResetPassword`);
        } else {
          notifyError(res.message[0]);
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
      <CommonSection title="Forgot Password" />
      <Helmet title="Reset Your Password | Route Facile">
        <MetaHelmet
          title="Reset Your Password | Route Facile"
          description="Easily reset your Route Facile account password. Follow the simple steps to regain access and continue booking car rentals across the UAE without hassle."
          noindex={true}
        />
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
                    {/* A New Way To Track ! <br /> Your Vehicle */}
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
                    <h3 style={{ color: "#0D1B2A" }}>{t("Forgot Password")}</h3>
                    <div className="auth-form">
                      <Form
                        noValidate
                        validated={validated}
                        onSubmit={handleSubmit}
                      >
                        <div className="mb-4">
                          <Form.Label className="common-labels">
                            {t("Email ID")}
                          </Form.Label>
                          <Form.Control
                            required
                            type="text"
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
      </Helmet>
    </div>
  );
};

export default ForgetPassword;
