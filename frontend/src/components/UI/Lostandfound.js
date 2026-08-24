import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../styles/lostfound.css";
import { Container, Form } from "react-bootstrap";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import configWeb from "../../config.js/configWeb";
import { simpleGetCall, simplePostCall, getApiLang } from "../../config.js/SetUp";
import { useSelector } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";
import { Helmet } from "react-helmet";
const Lostandfound = () => {
  const recaptchaRef = React.createRef();
  const [enquiryState, setEnquiryState] = useState({
    first_name: "",
    last_name: "",
    phone_code: "",
    phone_number: "",
    email: "",
    city_id: 0,
    detail: "",
    reference_number: "",
    captcha: false,
  });
  const { t, i18n } = useTranslation();

  const language = useSelector((state) => state.language.language);
  const isRTL = language === "ar";
  const [validated, setValidated] = useState(false);
  const [countries, setCountries] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [captchaValue, setCaptchaValue] = useState([]);
  const [enquiry_loading, set_enquiry_loading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEnquiryState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getCountriesData = useCallback(() => {
    const url = `${configWeb.GET_COUNTRY_LIST}?lang=${getApiLang(language)}&page_size=260`;
    simpleGetCall(url)
      .then((res) => { setCountries(Array.isArray(res?.data) ? res.data : []); })
      .catch((err) => { console.log("countries error", err); });
  }, [language]);

  const citiesData = useCallback(() => {
    const url = `${configWeb.GET_CITIES}?lang=${getApiLang(language)}`;
    simpleGetCall(url)
      .then((res) => {
        setCitiesArray(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
      })
      .catch((err) => { console.log("cities error", err); });
  }, [language]);

  useEffect(() => {
    getCountriesData();
    citiesData();
  }, [getCountriesData, citiesData]);

  useEffect(() => { window.scroll(0, 0); }, []);

  /* ── SEO structured data (memoised — only rebuilds when language changes) ── */
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://routefacilecarrental.com/${language}/lostandfound`,
    "name": language === "ar"
      ? "المفقودات والموجودات — روت فاسيل"
      : language === "fr"
        ? "Objets Perdus & Trouvés — Route Facile"
        : "Lost & Found — Route Facile",
    "description": language === "ar"
      ? "فقدت شيئًا في إحدى سيارات روت فاسيل؟ أكمل هذا النموذج وسيتواصل معك فريقنا في أقرب وقت."
      : language === "fr"
        ? "Vous avez perdu un objet dans un véhicule Route Facile ? Remplissez ce formulaire et notre équipe vous contactera rapidement."
        : "Lost an item in a Route Facile rental vehicle? Fill out the form and our team will contact you as soon as possible.",
    "url": `https://routefacilecarrental.com/${language}/lostandfound`,
    "inLanguage": language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://routefacilecarrental.com/${language}` },
        { "@type": "ListItem", "position": 2, "name": language === "ar" ? "المفقودات" : language === "fr" ? "Objets Perdus" : "Lost & Found", "item": `https://routefacilecarrental.com/${language}/lostandfound` }
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Route Facile",
      "url": "https://routefacilecarrental.com",
      "logo": { "@type": "ImageObject", "url": "https://routefacilecarrental.com/images/logo-header.png" }
    }
  }), [language]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false /* || !enquiryState.captcha */) {
      e.stopPropagation();
      setValidated(true);
    } else {
      // Process form data (e.g., send API request)
      const captcha = await postRecaptcha();
      if (captcha) {
        const enquire = await postEnquireMain();

        if (!enquire) setValidated(true);
        else setValidated(false);
      }
    }
    // setValidated(true);
  };

 


  const postEnquireMain = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        first_name: enquiryState?.first_name,
        last_name: enquiryState?.last_name,
        phone_code: enquiryState?.phone_code,
        phone_number: enquiryState?.phone_number,
        email: enquiryState?.email,
        reference_number : enquiryState?.reference_number,
        city_id: enquiryState?.city_id * 1,
        detail: enquiryState?.detail,
      });

      const url = configWeb.POST_LOST_AND_FOUND;
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
              city_id: 0,
              detail: "",
              reference_number: "",
             
              captcha: false,
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
    // setCaptchaValue(recaptchaRef.current.getValue());
  }
  return (
    <div className="lf-page" dir={isRTL ? "rtl" : "ltr"}>
      <MetaHelmet
        title={
          language === "ar"
            ? "المفقودات والموجودات — روت فاسيل"
            : language === "fr"
              ? "Objets Perdus & Trouvés — Route Facile"
              : "Lost & Found — Route Facile"
        }
        description={
          language === "ar"
            ? "فقدت شيئًا في إحدى سيارات روت فاسيل؟ أكمل النموذج وسيتواصل فريقنا معك في أقرب وقت."
            : language === "fr"
              ? "Vous avez perdu un objet dans un véhicule Route Facile ? Remplissez ce formulaire et notre équipe vous contactera rapidement."
              : "Lost something in a Route Facile vehicle? Fill out our form and our team will work swiftly to help recover your belongings."
        }
        keywords={
          language === "ar"
            ? "مفقودات تأجير سيارات المغرب, روت فاسيل مفقودات, استعادة غرض مفقود"
            : language === "fr"
              ? "objets perdus location voiture Maroc, Route Facile objet perdu, récupérer objet location"
              : "lost and found car rental Morocco, Route Facile lost item, lost belonging rental vehicle Maroc"
        }
        canonicalUrl={`https://routefacilecarrental.com/${language}/lostandfound`}
        hreflangs={[
          { hreflang: "en", href: "https://routefacilecarrental.com/en/lostandfound" },
          { hreflang: "ar", href: "https://routefacilecarrental.com/ar/lostandfound" },
          { hreflang: "fr", href: "https://routefacilecarrental.com/fr/lostandfound" },
          { hreflang: "x-default", href: "https://routefacilecarrental.com/en/lostandfound" },
        ]}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── Hero ── */}
      <div className="lf-hero">
        <div className="lf-hero-icon">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <h1>{t("Lost")} &amp; <span>{t("Found")}</span></h1>
        <p>{t("Lost something in one of our vehicles? We're here to help.")}</p>
      </div>

      {/* ── Content ── */}
      <section className="lf-section">
        <Container>
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-sm-12">

              {/* Notice */}
              <div className="lf-notice">
                <i className="fa-solid fa-circle-info"></i>
                <p>
                  {t("While renting from Route Facile, it is important to know that you are responsible for your belongings. However, we recognize that there would still be times that you or your family may accidentally lose your belongings in one of our rentals. In such cases, you can be rest assured, that our team will do their best in assisting you with their recovery!")}
                </p>
              </div>

              {/* Form card */}
              <div className="lf-card">
                <div className="lf-card-title">
                  <i className="fa-solid fa-file-lines"></i>
                  {t("Get started by filling this form")}:
                </div>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>

                  {/* City */}
                  <div className="lf-field">
                    <label className="lf-label">
                      {t("City")}<span className="lf-req">*</span>
                    </label>
                    <Form.Select
                      name="city_id"
                      value={enquiryState.city_id}
                      onChange={handleChange}
                      required
                      className="lf-select"
                    >
                      <option value="">{t("Select City")}</option>
                      {citiesArray?.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {t("Please Select an city ID")}.
                    </Form.Control.Feedback>
                  </div>

                  {/* Description */}
                  <div className="lf-field">
                    <label className="lf-label">
                      {t("Brief Description of the Lost or Forgotten Item")}<span className="lf-req">*</span>
                    </label>
                    <Form.Control
                      required
                      as="textarea"
                      name="detail"
                      value={enquiryState.detail}
                      onChange={handleChange}
                      placeholder={t("Enter details")}
                      rows={3}
                      className="lf-textarea"
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide some details")}.
                    </Form.Control.Feedback>
                  </div>

                  {/* Personal info */}
                  <p className="lf-group-label">{t("Your Information")}</p>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="lf-field">
                        <label className="lf-label">
                          {t("First Name")}<span className="lf-req">*</span>
                        </label>
                        <Form.Control
                          required
                          type="text"
                          name="first_name"
                          value={enquiryState.first_name}
                          onChange={handleChange}
                          placeholder={t("Enter your first name")}
                          className="lf-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please enter your first name")}.
                        </Form.Control.Feedback>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="lf-field">
                        <label className="lf-label">
                          {t("Last Name")}<span className="lf-req">*</span>
                        </label>
                        <Form.Control
                          required
                          type="text"
                          name="last_name"
                          value={enquiryState.last_name}
                          onChange={handleChange}
                          placeholder={t("Enter your last name")}
                          className="lf-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please enter your last name")}.
                        </Form.Control.Feedback>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="lf-field">
                        <label className="lf-label">
                          {t("Phone Code")}<span className="lf-req">*</span>
                        </label>
                        <Form.Select
                          name="phone_code"
                          value={enquiryState.phone_code}
                          onChange={handleChange}
                          required
                          className="lf-select"
                        >
                          <option value="">{t("Code")}</option>
                          {countries?.map((country) => (
                            <option key={country.id} value={country.phone_code}>
                              {country.code} {country.phone_code}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {t("Please enter your phone code")}.
                        </Form.Control.Feedback>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="lf-field">
                        <label className="lf-label">
                          {t("Phone Number")}<span className="lf-req">*</span>
                        </label>
                        <Form.Control
                          required
                          type="text"
                          name="phone_number"
                          value={enquiryState.phone_number}
                          onChange={handleChange}
                          placeholder={t("Enter phone number")}
                          maxLength={10}
                          className="lf-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please enter a valid 10-digit phone number")}.
                        </Form.Control.Feedback>
                      </div>
                    </div>
                  </div>

                  <div className="lf-field">
                    <label className="lf-label">
                      {t("Email")}<span className="lf-req">*</span>
                    </label>
                    <Form.Control
                      required
                      type="email"
                      name="email"
                      value={enquiryState.email}
                      onChange={handleChange}
                      placeholder={t("Enter your email")}
                      className="lf-input"
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please enter a valid email")}.
                    </Form.Control.Feedback>
                  </div>

                  <div className="lf-field">
                    <label className="lf-label">
                      {t("Rental Agreement Number/Vehicle Plate Number")}<span className="lf-req">*</span>
                    </label>
                    <Form.Control
                      required
                      type="text"
                      name="reference_number"
                      value={enquiryState.reference_number}
                      onChange={handleChange}
                      placeholder={t("Enter number")}
                      className="lf-input"
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please enter number")}.
                    </Form.Control.Feedback>
                  </div>

                  {/* reCAPTCHA */}
                  <div className="lf-field">
                    <ReCAPTCHA
                      onChange={onChange}
                      ref={recaptchaRef}
                      sitekey="6Lfp_nwpAAAAAOR7LqsSxWWZtt3vrTfroNRFqxlp"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="lf-submit-btn"
                    disabled={enquiry_loading}
                  >
                    {enquiry_loading
                      ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> {t("Submitting...")}</>
                      : <><i className="fa-solid fa-paper-plane"></i> {t("Submit")}</>
                    }
                  </button>

                </Form>
              </div>

            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Lostandfound;
