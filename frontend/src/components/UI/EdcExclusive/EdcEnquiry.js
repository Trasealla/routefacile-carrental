import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
} from "reactstrap";
import Helmet from "../../Helmet/Helmet";
import "../../../styles/contact.css";
import { Button, Form, Spinner } from "react-bootstrap";
import configWeb from "../../../config.js/configWeb";
import { simpleGetCall, simplePostCall } from "../../../config.js/SetUp";
import { notifyError, notifySuccess } from "../../../SharedComponent/notify";
import MetaHelmet from "../../Helmet/MetaHelmet";
import PhoneInput from 'react-phone-input-2';
import { useTranslation } from "react-i18next";
import 'react-phone-input-2/lib/style.css';

const EdcEnquiry = (props) => {
  const { t } = useTranslation();
  const [enquiryState, setEnquiryState] = useState({
    first_name: "",
    last_name: "",
    phone_code: "971",
    phone_number: "",
    email: "",
    car_id: props.car_id,
    detail: "",
    city_id: "",
    captcha: false,
    duration: 9,
    promo_code: props.promoCode || "EDCVIP2025"
  });
  const [full_phone_number, set_full_phone_number] = useState("");
  const [country_code, set_country_code] = useState("");
  const [phone_number, set_phone_number] = useState("");
  
  const [validated, setValidated] = useState(false);
  const [enquiry_loading, set_enquiry_loading] = useState(false);
  const [citiesArray, setCitiesArray] = useState([]);
  

  const citiesData = () => {
    const url = `${configWeb.GET_CITIES}`;
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
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnquiryState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    window.scroll(0, 0);
    citiesData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
    } else {
      const enquire = await postEnquireMain();
      if (!enquire) setValidated(true);
      else setValidated(false);
    }
  };

 
  const postEnquireMain = () => {
    return new Promise((resolve, reject) => {
      // Get EDC verification data from localStorage if available
      const edcVerification = localStorage.getItem('edc_verification');
      const edcData = edcVerification ? JSON.parse(edcVerification) : null;
      
      const body = JSON.stringify({
        name: enquiryState?.first_name,
        phone_code: country_code,
        phone_number: phone_number,
        email: enquiryState?.email,
        car_id: enquiryState?.car_id*1,
        details: enquiryState?.detail,
        city_id: enquiryState?.city_id*1,
        duration: enquiryState?.duration*1,
        promo_code: enquiryState.promo_code,
        edc_student_id: edcData?.studentId || ""
      });

      // Use EDC-specific enquiry endpoint
      const url = configWeb.POST_EDC_ENQUIRY;
      set_enquiry_loading(true);
      simplePostCall(url, body)
        .then((res) => {
          if (res?.status === "success") {
            notifySuccess(t("Enquiry submitted successfully! We will contact you shortly."));
            resolve(true);
            setEnquiryState({
              first_name: "",
              last_name: "",
              phone_code: "",
              phone_number: "",
              email: "",
              car_id: "",
              detail: "",
              city_id: "",
              captcha: false,
              promo_code: props.promoCode || "EDCVIP2025"
            });
            set_full_phone_number("");
            set_phone_number("");
            set_country_code("");

          } else if (res?.error) {
            notifyError(res?.message[0]);
            resolve(false);
          }
        })
        .catch((error) => {
          console.error("Enquiry failed:", error);
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_enquiry_loading(false);
        });
    });
  };

  const handlePhoneChange = (value, data) => {
    const countryDialCode = `${data.dialCode}`;
    const numberWithoutCode = value.replace(countryDialCode, "");
    set_full_phone_number(value);
    set_country_code(countryDialCode);
    set_phone_number(numberWithoutCode);
  };

  return (
    <Helmet title={props.title}>
        <MetaHelmet
        title={props.title}
        description="EDC Exclusive Car Rental Enquiry"
        keywords="EDC car rental, Cities Driving Company discount, student car rental UAE"
        canonicalUrl={`https://routefacilecarrental.com/en/edc-exclusive`}
        />
      <section>
        <Container>
          <div className="">
            <div className="mb-3">
              <h2 className="section__title">{t("EDC Exclusive Enquiry")}</h2>
              <p style={{ 
                background: 'linear-gradient(135deg, rgba(239, 103, 33, 0.1), rgba(218, 40, 38, 0.1))',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                border: '1px dashed #f2421b'
              }}>
                <strong>{t("Promo Code Applied")}:</strong> {enquiryState.promo_code}
              </p>
            </div>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="">

                <Col md={6} xs={12} className="mb-3">
                  <Form.Group controlId="first_name">
                    <Form.Label>
                      {t("Full Name")} <span className="text-danger">&#8727;</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="first_name"
                      value={enquiryState.first_name}
                      onChange={handleChange}
                      placeholder={t("Enter your name")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please enter your name")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} xs={12} className="mb-3">
                  <Form.Group controlId="phone_code">
                    <Form.Label>
                      {t("Phone Number")} <span className="text-danger">&#8727;</span>
                    </Form.Label>
                    <PhoneInput
                      inputProps={{
                        name: 'phone_number',
                        required: true,
                      }}
                      autoFormat
                      placeholder={t('Enter phone number')}
                      country={'ae'}
                      value={full_phone_number}
                      enableSearch={true}
                      onChange={handlePhoneChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} xs={12} className="mb-3">
                  <Form.Group controlId="email">
                    <Form.Label>
                      {t("Email")} <span className="text-danger">&#8727;</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="email"
                      name="email"
                      value={enquiryState.email}
                      onChange={handleChange}
                      placeholder={t("Enter your email")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please enter a valid email")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} xs={12} className="mb-3">
                  <Form.Group controlId="city_id">
                    <Form.Label>
                      {t("City")} <span className="text-danger">&#8727;</span>
                    </Form.Label>

                    <Form.Select
                      name="city_id"
                      value={enquiryState.city_id}
                      onChange={handleChange}
                      placeholder={t("Select City")}
                      required
                    >
                      <option value="">{t("Select City")}</option>
                      {citiesArray?.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {t("Please Select an city ID")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} xs={12} className="mb-3">
                  <Form.Group controlId="car_id">
                    <Form.Label>
                     {t("Car")} 
                    </Form.Label>
                  
                    <Form.Select
                      name="car_id"
                      value={enquiryState.car_id || props.car_id}
                      onChange={handleChange}
                      placeholder={t("Select Car")}
                    >
                      <option value="">{t("Select...")}</option>
                      {props.cars?.map((car) => (
                        <option key={car.car_id} value={car.car_id}>
                          {car.car.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} xs={12} className="mb-3">
                  <Form.Group controlId="duration">
                    <Form.Label>
                     {t("Duration")} 
                    </Form.Label>
                  
                    <Form.Select
                      name="duration"
                      onChange={handleChange}
                      placeholder="Select duration"
                      value={enquiryState.duration}
                    >
                      <option value="1">1 {t("Month")}</option>
                      <option value="3">3 {t("Months")}</option>
                      <option value="6">6 {t("Months")}</option>
                      <option value="9">9 {t("Months")}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} className="mb-3">
                  <Form.Group controlId="detail">
                    <Form.Label>
                      {t("Details")}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="detail"
                      value={enquiryState.detail}
                      onChange={handleChange}
                      placeholder={t("Enter details (e.g., your EDC Student ID)")}
                      rows={3}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} className="mt-3">
                  <Button
                    type="submit"
                    style={{ 
                      background: 'linear-gradient(135deg, #f2421b, #da2826)', 
                      color: "white",
                      border: 'none',
                      padding: '0.8rem 2rem',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}
                    className="w-100"
                    disabled={enquiry_loading}
                  >
                    {enquiry_loading ? <Spinner size="sm" /> : t("Submit Enquiry")}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </section>
     </Helmet>
  );
};

export default EdcEnquiry;
