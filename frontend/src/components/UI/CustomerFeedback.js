import React, { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Container, Row, Col } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, simplePostCall, getApiLang } from "../../config.js/SetUp";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import MetaHelmet from "../Helmet/MetaHelmet";
import contactBanner from "../../assets/all-images/banners/contact-us-header-banner.png";
import "../../styles/customer-feedback.css";

const Contact = () => {
  const [enquiryState, setEnquiryState] = useState({
    first_name: "",
    last_name: "",
    phone_code: "",
    phone_number: "",
    email: "",
    type: "",
    duration: "",
    car_id: null,
    city_id: null,
    detail: "",
    captcha: false,
    feedback_source: 1,
    user_feedback_service_id: 1,
    product_knowledge_rating_id: null,
    friendliness_rating_id: null,
    timely_response_rating_id: null,
    reliability_rating_id: null,
    professionalism_rating_id: null,
    cleanliness_rating_id: null,
    overall_rating_id: 1,
    revert_reason_id: 1,
  });
  const { t, i18n } = useTranslation();
  const language = useSelector((state) => state.language.language);
  const [validated, setValidated] = useState(false);
  const [countries, setCountries] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [captchaValue, setCaptchaValue] = useState([]);
  const [carListArray, setCarListArray] = useState([]);
  const [feedback_source, set_feedback_source] = useState([]);
  const [feedback_rating, set_feedback_rating] = useState([]);
  const [feedback_revert_reason, set_feedback_revert_reason] = useState([]);
  const [feedback_service_category, set_feedback_service_category] = useState(
    []
  );
  const [feedback_overall_rating, set_feedback_overall_rating] = useState([]);
  const [enquiry_loading, set_enquiry_loading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnquiryState((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    citiesData();
    getCountriesData();
  }, [language]);
  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const [error, setError] = useState({
    city: "",
    product_knowledge: "",

    professionalism: "",
    friendliness: "",
    timelyResponse: "",
    reliability: "",
    cleanliness: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enquiryState?.city_id) {
      setError((prevState) => ({
        ...prevState,
        city: "Please Select City" + ".",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        city: "",
      }));
    }

    if (!enquiryState.product_knowledge_rating_id) {
      setError((prevState) => ({
        ...prevState,
        product_knowledge: "Please Select.",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        product_knowledge: "",
      }));
    }
    if (!enquiryState.professionalism_rating_id) {
      setError((prevState) => ({
        ...prevState,
        professionalism: "Please Select.",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        professionalism: "",
      }));
    }
    if (!enquiryState.friendliness_rating_id) {
      setError((prevState) => ({
        ...prevState,
        friendliness: "Please Select.",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        friendliness: "",
      }));
    }
    if (!enquiryState.timely_response_rating_id) {
      setError((prevState) => ({
        ...prevState,
        timelyResponse: "Please Select.",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        timelyResponse: "",
      }));
    }
    if (!enquiryState.reliability_rating_id) {
      setError((prevState) => ({
        ...prevState,
        reliability: "Please Select.",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        reliability: "",
      }));
    }
    if (!enquiryState.cleanliness_rating_id) {
      setError((prevState) => ({
        ...prevState,
        cleanliness: "Please Select.",
      }));
    } else {
      setError((prevState) => ({
        ...prevState,
        cleanliness: "",
      }));
    }
    const form = e.currentTarget;
    if (
      form.checkValidity() === false ||
      !enquiryState.city_id ||
      !enquiryState?.cleanliness_rating_id ||
      !enquiryState.friendliness_rating_id ||
      !enquiryState.product_knowledge_rating_id ||
      !enquiryState.professionalism_rating_id ||
      !enquiryState.reliability_rating_id ||
      !enquiryState.timely_response_rating_id /* || !enquiryState.captcha */
    ) {
      e.stopPropagation();
      setValidated(true);
      setError((prevState) => ({
        ...prevState,
        city: "Please Select City",
        product_knowledge: "Please Select",

        professionalism: "Please Select",
        friendliness: "Please Select",
        timelyResponse: "Please Select",
        reliability: "Please Select",
        cleanliness: "Please Select",
      }));
    } else {
      // Process form data (e.g., send API request)
      const captcha = await postRecaptcha();
      if (captcha) {
        const enquire = await postEnquireMain();

        if (!enquire) {
          setValidated(true);
          setError((prevState) => ({
            ...prevState,
            city: "Please Select City",
            product_knowledge: "Please Select",

            professionalism: "Please Select",
            friendliness: "Please Select",
            timelyResponse: "Please Select",
            reliability: "Please Select",
            cleanliness: "Please Select",
          }));
        } else {
          setValidated(false);
          setError((prevState) => ({
            ...prevState,
            city: "",
            product_knowledge: "",

            professionalism: "",
            friendliness: "",
            timelyResponse: "",
            reliability: "",
            cleanliness: "",
          }));
        }
      }
    }
    // setValidated(true);
  };

  const token = "";
  const postEnquireMain = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        first_name: enquiryState?.first_name,
        last_name: enquiryState?.last_name,
        phone_code: enquiryState?.phone_code,
        phone_number: enquiryState?.phone_number,
        email: enquiryState?.email,
        city_id: enquiryState?.city_id,
        user_feedback_source_id: enquiryState?.feedback_source,
        /* extra */ user_feedback_service_id:
          enquiryState?.user_feedback_service_id,
        user_feedback_service_category_id:
          enquiryState?.user_feedback_service_id,
        product_knowledge_rating_id: enquiryState?.product_knowledge_rating_id,
        professionalism_rating_id: enquiryState?.professionalism_rating_id,
        friendliness_rating_id: enquiryState?.friendliness_rating_id,
        timely_response_rating_id: enquiryState?.timely_response_rating_id,
        reliability_rating_id: enquiryState?.reliability_rating_id,
        cleanliness_rating_id: enquiryState?.cleanliness_rating_id,
        overall_rating_id: enquiryState?.overall_rating_id,
        revert_reason_id: enquiryState?.revert_reason_id,
        detail: enquiryState?.detail,
      });

      const url = configWeb.POST_FEEDBACK;
      set_enquiry_loading(true);
      simplePostCall(url, body)
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Enquire Successfully"));

            resolve(true);
            setEnquiryState({
              first_name: "",
              last_name: "",
              phone_code: "",
              phone_number: "",
              email: "",
              type: "",
              duration: "",
              car_id: 0,
              city_id: 0,
              detail: "",
              captcha: false,
              feedback_source: 1,
              user_feedback_service_id: 1,
              product_knowledge_rating_id: null,
              friendliness_rating_id: null,
              timely_response_rating_id: null,
              reliability_rating_id: null,
              cleanliness_rating_id: null,
              overall_rating_id: 1,
              revert_reason_id: 1,
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
          setCaptchaValue([]);
          window.grecaptcha.reset();
        });
    });
  };
  const postRecaptcha = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        g_recaptcha_response: captchaValue,
      });

      const url = configWeb.POST_CAPTCHA_VERIFY;
      set_enquiry_loading(true);
      simplePostCall(url, body)
        .then((res) => {
          // setUserDetails(res);
          if(res?.success === true){
            resolve(true);
            }else{
              resolve(false);
              notifyError(t("Wrong Captcha"))
            }
          if (res?.error) {
            resolve(false);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          resolve(false);
        })
        .finally(() => {});
    });
  };
  // const onChangeRecaptcha = (value) => {
  //   // token = value;
  //   console.log("onChangeRecaptcha", JSON.stringify(value));
  // };

  function onChange(value) {
    setCaptchaValue(value);
  }
  const [selectedValue, setSelectedValue] = useState("");

  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const [ratings, setRatings] = useState({
    productKnowledge: "",
    professionalism: "",
    friendliness: "",
    timelyResponse: "",
  });

  // Handler to update ratings
  const handleRatingChange = (category, value) => {
    setRatings({ ...ratings, [category]: value });
  };
  const [ratingss, setRatingss] = useState({
    reliability: "",
    cleanliness: "",
  });

  // Handler to update ratings
  const handleRatingChangee = (category, value) => {
    setRatingss({ ...ratingss, [category]: value });
  };

  const getFeedbackSource = () => {
    const url = `${configWeb.GET_FEEDBACK_SOURCE}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_feedback_source(res?.data || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {});
  };
  const getFeedbackRating = () => {
    const url = `${configWeb.GET_FEEDBACK_RATING}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_feedback_rating(res?.data || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {});
  };
  const getFeedbackOverallRating = () => {
    const url = `${configWeb.GET_FEEDBACK_OVERALL_RATING}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_feedback_overall_rating(res?.data || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {});
  };
  const getFeebackRevertReason = () => {
    const url = `${configWeb.GET_FEEDBACK_REVERT_REASON}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_feedback_revert_reason(res?.data || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {});
  };
  const getFeebackServiceCategory = () => {
    const url = `${configWeb.GET_FEEDBACK_SERVICE_CATEGORY}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_feedback_service_category(res?.data || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    getFeedbackSource();
    getFeedbackRating();
    getFeedbackOverallRating();
    getFeebackRevertReason();
    getFeebackServiceCategory();
  }, [language]);

  /* ── helper: get colour class based on rating name ── */
  const ratingClass = (name, selectedId, ratingId) => {
    if (selectedId !== ratingId) return "cf-rating-chip";
    const n = (name || "").toLowerCase();
    if (n.includes("excel")) return "cf-rating-chip selected-excellent";
    if (n.includes("good"))  return "cf-rating-chip selected-good";
    if (n.includes("aver"))  return "cf-rating-chip selected-average";
    if (n.includes("fair"))  return "cf-rating-chip selected-fair";
    if (n.includes("poor"))  return "cf-rating-chip selected-poor";
    return "cf-rating-chip selected";
  };

  const isRTL = language === "ar";

  return (
    <div className="cf-page" dir={isRTL ? "rtl" : "ltr"}>
      <MetaHelmet
        title={language === "ar" ? "آراء العملاء — روت فاسيل" : language === "fr" ? "Avis Clients — Route Facile" : "Customer Feedback — Route Facile"}
        description="Share your experience with Route Facile. We value your feedback to help us improve our service."
        keywords="car rental feedback, Route Facile review, customer satisfaction Morocco"
        canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/customer-feedback`}
        hreflangs={[
          { hreflang: "en", href: `${configWeb.BASE_WEB_URL}/en/customer-feedback` },
          { hreflang: "ar", href: `${configWeb.BASE_WEB_URL}/ar/customer-feedback` },
          { hreflang: "fr", href: `${configWeb.BASE_WEB_URL}/fr/customer-feedback` },
        ]}
      />

      {/* ── Hero ── */}
      <div className="cf-hero" style={{ backgroundImage: `url(${contactBanner})` }}>
        <div className="cf-hero-inner">
          <div className="cf-hero-badge">
            <i className="fa-solid fa-star" />
            {t("Your Opinion Matters")}
          </div>
          <h1>{t("Customer")} <span>{t("Feedback")}</span></h1>
          <p>{t("Help us improve — share your experience with Route Facile in under 2 minutes.")}</p>
        </div>
      </div>

      {/* ── Form body ── */}
      <section className="cf-body">
        <Container>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col lg="8" className="mx-auto">

                {/* ── Card 1: Service Info ── */}
                <div className="cf-card">
                  <div className="cf-card-header">
                    <div className="cf-card-icon"><i className="fa-solid fa-clipboard-list" /></div>
                    <div>
                      <p className="cf-card-title">{t("Service Information")}</p>
                      <p className="cf-card-subtitle">{t("Tell us about your rental")}</p>
                    </div>
                  </div>

                  <Row>
                    <Col md={6}>
                      <div className="cf-field">
                        <label className="cf-label">{t("How did you know about Route Facile?")}<span className="cf-req">*</span></label>
                        <Form.Select
                          name="feedback_source"
                          value={enquiryState.feedback_source}
                          onChange={handleChange}
                          required
                          className="cf-select"
                        >
                          {feedback_source?.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="cf-field">
                        <label className="cf-label">{t("Please choose the category of the service")}.<span className="cf-req">*</span></label>
                        <Form.Select
                          name="user_feedback_service_id"
                          value={enquiryState.user_feedback_service_id}
                          onChange={handleChange}
                          required
                          className="cf-select"
                        >
                          {feedback_service_category?.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </Col>
                  </Row>

                  {/* City selection */}
                  <div className="cf-field">
                    <label className="cf-label">{t("Please tell us the location of your rental")}.<span className="cf-req">*</span></label>
                    <div className="cf-city-grid">
                      {citiesArray?.map((city) => (
                        <label
                          key={city.id}
                          className={`cf-city-chip${String(enquiryState.city_id) === String(city.id) ? " selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="city_id"
                            value={city.id}
                            onChange={handleChange}
                          />
                          <i className="fa-solid fa-location-dot" style={{ fontSize: ".7rem" }} />
                          {city.name}
                        </label>
                      ))}
                    </div>
                    {!enquiryState.city_id && validated && (
                      <span className="cf-invalid">{t("Please select a city")}</span>
                    )}
                  </div>
                </div>

                {/* ── Card 2: Staff Rating ── */}
                <div className="cf-card">
                  <div className="cf-card-header">
                    <div className="cf-card-icon"><i className="fa-solid fa-user-tie" /></div>
                    <div>
                      <p className="cf-card-title">{t("Staff Performance")}</p>
                      <p className="cf-card-subtitle">{t("What are your thoughts about the representative who attended you?")}</p>
                    </div>
                  </div>

                  <Row>
                    {[
                      { label: "Product Knowledge", icon: "fa-solid fa-book", field: "product_knowledge_rating_id", errKey: "product_knowledge" },
                      { label: "Professionalism",   icon: "fa-solid fa-briefcase", field: "professionalism_rating_id", errKey: "professionalism" },
                      { label: "Friendliness",      icon: "fa-solid fa-face-smile", field: "friendliness_rating_id", errKey: "friendliness" },
                      { label: "Timely Response",   icon: "fa-solid fa-clock", field: "timely_response_rating_id", errKey: "timelyResponse" },
                    ].map(({ label, icon, field, errKey }) => (
                      <Col md={6} key={field}>
                        <div className="cf-rating-group">
                          <div className="cf-rating-label">
                            <i className={icon} />
                            {t(label)}<span className="cf-req">*</span>
                          </div>
                          <div className="cf-rating-chips">
                            {feedback_rating?.map((r) => (
                              <label key={r.id} className={ratingClass(r.name, enquiryState[field], String(r.id))}>
                                <input type="radio" name={field} value={r.id} onChange={handleChange} />
                                {r.name}
                              </label>
                            ))}
                          </div>
                          {!enquiryState[field] && validated && (
                            <span className="cf-invalid">{t("Please select a rating")}</span>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* ── Card 3: Vehicle Rating ── */}
                <div className="cf-card">
                  <div className="cf-card-header">
                    <div className="cf-card-icon"><i className="fa-solid fa-car" /></div>
                    <div>
                      <p className="cf-card-title">{t("Vehicle Quality")}</p>
                      <p className="cf-card-subtitle">{t("How would you rate the vehicle provided by us?")}</p>
                    </div>
                  </div>

                  <Row>
                    {[
                      { label: "Vehicle Condition", icon: "fa-solid fa-wrench",   field: "reliability_rating_id",  errKey: "reliability" },
                      { label: "Cleanliness",        icon: "fa-solid fa-sparkles", field: "cleanliness_rating_id",  errKey: "cleanliness" },
                    ].map(({ label, icon, field, errKey }) => (
                      <Col md={6} key={field}>
                        <div className="cf-rating-group">
                          <div className="cf-rating-label">
                            <i className={icon} />
                            {t(label)}<span className="cf-req">*</span>
                          </div>
                          <div className="cf-rating-chips">
                            {feedback_rating?.map((r) => (
                              <label key={r.id} className={ratingClass(r.name, enquiryState[field], String(r.id))}>
                                <input type="radio" name={field} value={r.id} onChange={handleChange} />
                                {r.name}
                              </label>
                            ))}
                          </div>
                          {!enquiryState[field] && validated && (
                            <span className="cf-invalid">{t("Please select a rating")}</span>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* ── Card 4: Overall ── */}
                <div className="cf-card">
                  <div className="cf-card-header">
                    <div className="cf-card-icon"><i className="fa-solid fa-chart-bar" /></div>
                    <div>
                      <p className="cf-card-title">{t("Overall Experience")}</p>
                      <p className="cf-card-subtitle">{t("Compare and tell us how likely you'd return")}</p>
                    </div>
                  </div>

                  <Row>
                    <Col md={6}>
                      <div className="cf-field">
                        <label className="cf-label">{t("How would you rate Route Facile compared to other car rental companies?")}<span className="cf-req">*</span></label>
                        <Form.Select name="overall_rating_id" value={enquiryState.overall_rating_id} onChange={handleChange} required className="cf-select">
                          {feedback_overall_rating?.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="cf-field">
                        <label className="cf-label">{t("How likely you would rent again from Route Facile?")}<span className="cf-req">*</span></label>
                        <Form.Select name="revert_reason_id" value={enquiryState.revert_reason_id} onChange={handleChange} required className="cf-select">
                          {feedback_revert_reason?.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="cf-field">
                        <label className="cf-label">{t("Any suggestion on how could we improve your experience next time?")}<span className="cf-req">*</span></label>
                        <Form.Control
                          required as="textarea" name="detail"
                          value={enquiryState.detail} onChange={handleChange}
                          placeholder={t("Enter details")} rows={3} className="cf-textarea"
                        />
                        <Form.Control.Feedback type="invalid" className="cf-invalid">{t("Please provide some details")}.</Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* ── Card 5: Contact Details ── */}
                <div className="cf-card">
                  <div className="cf-card-header">
                    <div className="cf-card-icon"><i className="fa-solid fa-address-card" /></div>
                    <div>
                      <p className="cf-card-title">{t("Your Details")}</p>
                      <p className="cf-card-subtitle">{t("So we can follow up if needed")}</p>
                    </div>
                  </div>

                  <Row>
                    <Col md={6}>
                      <div className="cf-field">
                        <label className="cf-label">{t("First Name")}<span className="cf-req">*</span></label>
                        <Form.Control required type="text" name="first_name" value={enquiryState.first_name}
                          onChange={handleChange} placeholder={t("Enter your first name")} className="cf-input" />
                        <Form.Control.Feedback type="invalid" className="cf-invalid">{t("Please provide a first name.")}  </Form.Control.Feedback>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="cf-field">
                        <label className="cf-label">{t("Last Name")}<span className="cf-req">*</span></label>
                        <Form.Control required type="text" name="last_name" value={enquiryState.last_name}
                          onChange={handleChange} placeholder={t("Enter your last name")} className="cf-input" />
                        <Form.Control.Feedback type="invalid" className="cf-invalid">{t("Please enter your last name")}.</Form.Control.Feedback>
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="cf-field">
                        <label className="cf-label">{t("Phone Number")}<span className="cf-req">*</span></label>
                        <div className="cf-phone-row">
                          <Form.Select name="phone_code" value={enquiryState.phone_code} onChange={handleChange} required className="cf-select">
                            <option value="">{t("Code")}</option>
                            {countries?.map((c) => (
                              <option key={c.id} value={c.phone_code}>{c.code} +{c.phone_code}</option>
                            ))}
                          </Form.Select>
                          <Form.Control required type="tel" name="phone_number" value={enquiryState.phone_number}
                            onChange={handleChange} placeholder={t("Enter phone number")} className="cf-input" maxLength={15} />
                        </div>
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="cf-field">
                        <label className="cf-label">{t("Email")}<span className="cf-req">*</span></label>
                        <Form.Control required type="email" name="email" value={enquiryState.email}
                          onChange={handleChange} placeholder={t("Enter your email")} className="cf-input" />
                        <Form.Control.Feedback type="invalid" className="cf-invalid">{t("Please enter a valid email")}.</Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>

                  {/* reCAPTCHA */}
                  <div style={{ margin: "16px 0" }}>
                    <ReCAPTCHA onChange={onChange} sitekey="6Lfp_nwpAAAAAOR7LqsSxWWZtt3vrTfroNRFqxlp" />
                  </div>

                  <button type="submit" className="cf-submit-btn" disabled={enquiry_loading}>
                    {enquiry_loading
                      ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> {t("Submitting...")}</>
                      : <><i className="fa-solid fa-paper-plane" /> {t("Submit Feedback")}</>
                    }
                  </button>
                </div>

              </Col>
            </Row>
          </Form>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
