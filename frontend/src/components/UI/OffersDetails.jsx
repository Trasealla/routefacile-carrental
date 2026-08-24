import React, { useEffect } from "react";

import { Container, Row, Col } from "reactstrap";

import { useParams } from "react-router-dom";
// import BookingForm from "../components/UI/BookingForm";
// import PaymentMethod from "../components/UI/PaymentMethod";

import { Badge, Button, Card, Form, Spinner } from "react-bootstrap";
import specIcon2 from "../../assets/all-images/cars-img/offers2.jpg";
import "../../styles/offersDetails.css";
import Helmet from "../Helmet/Helmet";
import CommonSection from "./CommonSection";
import BookingForm from "./BookingForm";
import carlogo from "../../assets/new-logo/logo.png";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, simplePostCall, getApiLang, getOfferApiLang } from "../../config.js/SetUp";
import { useState } from "react";
import { useSelector } from "react-redux";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import MetaHelmet from "../Helmet/MetaHelmet";
import { useTranslation } from "react-i18next";
const OffersDetails = () => {
  //   const { slug } = useParams();
  const { slug, id } = useParams();
  const { t } = useTranslation();
  //   const singleCarItem = carData.find((item) => item.carName === slug);
  const [special_offers_details, set_special_offers_details] = useState([]);
  const [loading, set_loading] = useState(true);
  const [enquiry_loading, set_enquiry_loading] = useState(false);
  const [countries, setCountries] = useState([]);
  const language = useSelector((state) => state.language.language);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getSpecialOffersDetails = () => {
    const url = configWeb.GET_SPECIAL_OFFER_DETAILS(id, getOfferApiLang(language));
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_special_offers_details(res || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {
        set_loading(false);
      });
  };

  useEffect(() => {
    getSpecialOffersDetails();
    getCountriesData();
  }, [language]);

  const [formState, setFormState] = useState({
    first_name: "",
    last_name: "",
    phone_code: "",
    phone_number: "",
    email: "",
    address: "",
  });

  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };
  const getCountriesData = () => {
    const url = `${configWeb.GET_COUNTRY_LIST}?lang=${getApiLang(language)}&page_size=260`;
    simpleGetCall(url)
      .then((res) => {
        setCountries(res?.data);
      })
      .catch((errr) => {
        console.log("errr", errr);
      })
      .finally(() => {});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      e.stopPropagation();
    } else {
      const enquire = await postEnquire();

      if (!enquire) setValidated(true);
      else setValidated(false);
      // Handle form submission logic here
    }
    // setValidated(true);
  };

  const postEnquire = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        first_name: formState?.first_name,
        last_name: formState?.last_name,
        phone_code: formState?.phone_code,
        phone_number: formState?.phone_number,
        email: formState?.email,
        offer_id: id,
        address: formState?.address,
      });

      const url = configWeb.POST_OFFER_ENQUIRE;
      set_enquiry_loading(true);
      simplePostCall(url, body)
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Enquire Successfully"));

            resolve(true);
            setFormState({
              first_name: "",
              last_name: "",
              phone_code: "",
              phone_number: "",
              email: "",
              address: "",
            });
          } else if (res?.error) {
            notifyError(res?.message[0]);
            resolve(false);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_enquiry_loading(false);
        });
    });
  };

  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
      headline: special_offers_details?.title,
      description:
        special_offers_details?.seo_meta_description ||
        special_offers_details?.description,
      image: special_offers_details?.desktop,
      author: {
        "@type": "Organization",
        name: "Route Facile",
      },
      publisher: {
        "@type": "Organization",
        name: "Route Facile",
        logo: {
          "@type": "ImageObject",
          url: carlogo,
        },
      },
      datePublished: special_offers_details?.start_date,
      dateModified: special_offers_details?.start_date,
    };
  };

  return (
    // <Helmet title="offer Details">
    <>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        >
          <Spinner />
        </div>
      ) : (
        <section>
          <MetaHelmet
            title={special_offers_details?.title}
            description={
              special_offers_details?.seo_meta_description ||
              special_offers_details?.description
            }
            keywords={
              special_offers_details?.seo_meta_tags ||
              "car rental, affordable cars, rent a car"
            }
            ogTitle={special_offers_details?.title}
            ogDescription={
              special_offers_details?.seo_meta_description ||
              special_offers_details?.description
            }
            ogImage={special_offers_details?.image}
            ogUrl={window.location.href}
            twitterTitle={special_offers_details?.title}
            twitterDescription={
              special_offers_details?.seo_meta_description ||
              special_offers_details?.description
            }
            twitterImage={special_offers_details?.image}
            twitterCard="summary_large_image"
            // twitterSite="@YourTwitterHandle"
            // twitterCreator="@AuthorTwitterHandle"
            canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/offersdetails/${slug}/${id}`}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateStructuredData()),
            }}
          />

          <CommonSection title="offer Details" />
          <Container>
            <Row>
              <Col lg="6">
                <img
                  src={special_offers_details?.desktop}
                  alt=""
                  className="w-100 mb-4"
                />
              </Col>

              <Col lg="6">
                <div className="car__info">
                  <h2 className="section__title">
                    {special_offers_details?.title}
                  </h2>
                  {/* 
                <div className=" d-flex align-items-center gap-5 mt-3">
                  <h6 className="rent__price fw-bold fs-4">{`Start Date : ${special_offers_details?.start_date}`}</h6>
                  <h6 className="rent__price fw-bold fs-4">{`End Date : ${special_offers_details?.end_date}`}</h6>
                                  
                </div> */}
                  <div className=" d-flex align-items-center gap-5 mt-3">
                    <h6>{`${t("Start Date")} : ${special_offers_details?.start_date}`}</h6>
                  </div>

                  {/* <div className=" d-flex align-items-center gap-5 mt-3">
                    <h6>{`End Date : ${special_offers_details?.end_date}`}</h6>
                  </div> */}
                  <div
                    className="section__description"
                    dangerouslySetInnerHTML={{
                      __html: special_offers_details?.description,
                    }}
                  />

                  {/* <h6 className="rent__price fw-bold fs-4">Features</h6>
                <div
                  className=" d-flex align-items-center mt-3"
                  style={{ columnGap: "4rem" }}
                >
                  <ul style={{ listStyleType: "square" }}>
                    <li>1.5L Engine, 99ho / 6000 rpm</li>
                    <li>Halogen head lamp</li>
                    <li>2 DIN AM / FM/ 1CD / MP3 / AUX/USB Two speakers</li>
                  </ul>
                </div>
                <h6 className="rent__price fw-bold fs-4">Safety Features:</h6>
                <div
                  className=" d-flex align-items-center mt-3"
                  style={{ columnGap: "4rem" }}
                >
                  <ul style={{ listStyleType: "square" }}>
                    <li>SRS dual front airbags</li>
                    <li>ABS (Anti-lock braking system)</li>
                    <li>EBD (Electronic brake force distribution system)</li>
                  </ul>
                </div> */}
                </div>
              </Col>

              {/* <Col
            
              // lg="11"
              // md="6"
              // sm="6"

              className="enqure-form mb-4"
            >
              <div className="booking-info mt-5">
                <h5 className="mb-4 fw-bold ">Enquire Information</h5>
                <BookingForm />
              </div>

              <div className="mt-4 find-my-card-btn d-flex  justify-content-center">
                <Button type="submit" className="findBtn">
                  Enquire Now
                </Button>
              </div>
            </Col> */}

              <div className="booking-info mt-5 ms-2">
                <h5 className="mb-4 fw-bold ">{t("Enquire Information")}</h5>
              </div>
            </Row>
            <Form
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
              className="p-2"
            >
              <Row>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="firstName">
                    {/* <Form.Label>First Name</Form.Label> */}
                    <Form.Control
                      required
                      type="text"
                      name="first_name"
                      value={formState.first_name}
                      onChange={handleChange}
                      placeholder={t("First Name")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide first name")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="lastName">
                    {/* <Form.Label>Last Name</Form.Label> */}
                    <Form.Control
                      required
                      type="text"
                      name="last_name"
                      value={formState.last_name}
                      onChange={handleChange}
                      placeholder={t("Last Name")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide last name")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col xs={4} md={2} className="mb-3">
                  <Form.Group controlId="phoneCode">
                    <Form.Select
                      name="phone_code"
                      value={formState.phone_code}
                      onChange={handleChange}
                      required
                      placeholder={t("Phone Code")}
                    >
                      <option value="">{t("Phone Code")}</option>
                      {countries?.map((country) => (
                        <option key={country.id} value={country.phone_code}>
                          {country.name} {country.phone_code}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide code")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={8} md={4} className="mb-3">
                  <Form.Group controlId="phoneNumber">
                    {/* <Form.Label>Phone Number</Form.Label> */}
                    <Form.Control
                      required
                      type="text"
                      name="phone_number"
                      value={formState.phone_number}
                      onChange={handleChange}
                      placeholder={t("Phone Number")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide phone number")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="email">
                    {/* <Form.Label>Email</Form.Label> */}
                    <Form.Control
                      required
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder={t("Email")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide email")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Group controlId="address">
                    {/* <Form.Label>Address</Form.Label> */}
                    <Form.Control
                      required
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formState.address}
                      onChange={handleChange}
                      placeholder={t("Address")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide address")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4 find-my-card-btn d-flex  justify-content-center">
                <Button
                  type="submit"
                  className="findBtn"
                  disabled={enquiry_loading}
                >
                  {enquiry_loading ? <Spinner /> : t("Enquire Now")}
                </Button>
              </div>
            </Form>
          </Container>
        </section>
      )}
      {/* </Helmet> */}{" "}
    </>
  );
};

export default OffersDetails;
