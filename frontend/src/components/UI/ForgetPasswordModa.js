import React, { useContext, useEffect, useState } from "react";

// import logo from "../../assets/images/Web-Application-Logo.svg";
import { Form, Spinner, Container } from "react-bootstrap";

import { Link } from "react-router-dom";
// import {PostCallWithErrorResponse} from '../config.js/SetUp'
import configWeb from "../../config.js/configWeb";
import logo from "../../assets/new-logo/Car Rental Platform Logos/dark_logo_2480_1241.png";
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

function ForgetPasswordModal({
  forgetPasswordModalShow,
  setForgetPasswordModalShow,
  setRegisterModalShow,
  setResetPasswordModalShow,
  setCardModalShow,
}) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, set_loading] = useState(false);

  const [errMsg, setErrMsg] = useState({ email: "", password: "" });

 


  const Login = ( ) => {

    let body = {
      email : email,
    
  };

  set_loading(true);
  simplePostCall(
    configWeb.POST_FORGOT_PASSWORD, 
    JSON.stringify(body)
  )
    .then((res) => {
      if (!res?.error) {
        // localStorage.setItem('access_token', res?.access_token)
        notifySuccess('Success. We have sent you OTP via email.');
        // navigate(`/${language}/ResetPassword`)
        setForgetPasswordModalShow(false);
        setResetPasswordModalShow(true);
      } else {
        notifyError(res.message[0]);
       

        
      }
    })
    .catch((errr) => {
      notifyError('Something went wrong, please try again');
    })
    .finally(() => {
      set_loading(false);
    });

  }

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

  const handleRegisterClick = () => {
    setRegisterModalShow(true);
    setForgetPasswordModalShow(false);
  };

  return (
    <>
      <Modal
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={forgetPasswordModalShow}
        onHide={() => setForgetPasswordModalShow(false)}
        className="custom-modal-width"
      >
        <Modal.Header closeButton dir='ltr' >
          <Modal.Title id="contained-modal-title-vcenter">
            {t("Forgot Password")}
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
                          {t("Enter Your Email ID")}
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
                          { loading ? <Spinner animation="border" variant="#1D288E" /> :   t("Submit") }
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="close-button"
            onClick={() => setForgetPasswordModalShow(false)}
          >
            {t("Close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ForgetPasswordModal;
