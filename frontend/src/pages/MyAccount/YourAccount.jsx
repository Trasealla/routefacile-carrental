import React, { useEffect, useState } from "react";
import "../../styles/account.css";
import Helmet from "../../components/Helmet/Helmet";
import MetaHelmet from "../../components/Helmet/MetaHelmet";
import {
  Nav,
  Tab,
  Accordion,
  Form,
  Button,
  Spinner,
  Card as BootstrapCard,
  Carousel,
} from "react-bootstrap";
import { nanoid } from "@reduxjs/toolkit";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import {
  multipartPostCall,
  simpleGetCall,
  simpleGetCallAuth,
  simplePutCallAuth,
  getApiLang,
} from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AdditionalDriver from "./AdditionaDriver";
import Booking from "./Booking";
import UserDocumentss from "./UserDocuments";
import { useTranslation } from "react-i18next";

const MyAccount = () => {
  const { type } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const { tab_type } = location.state || {};

  const language = useSelector((state) => state.language.language);
  const [drlist, setDrlist] = useState([]);
  const [displayoptions, setdisplayOptions] = useState(false);
  const [countries, setCountries] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [userAddress, setUserAddress] = useState([]);
  const [validated, setValidated] = useState(false);
  const [documentSetArray, setDocumentSetArray] = useState([]);
  const [validated_for_password, setValidated_for_password] = useState(false);
  const [validated_for_address, set_validated_for_address] = useState(false);
  const [loading_document, set_loading_document] = useState(false);

  const [loading_profile, set_loading_profile] = useState(false);
  const [loading_password, set_loading_password] = useState(false);
  const [loading_address, set_loading_address] = useState(false);
  const [documentSet, setDocumentSet] = useState("uae_resident");
  const [confirmPasswordError, setConfirmPasswordError] = useState(
    "Please confirm your new password."
  );

  const token = localStorage.getItem("token");
  const parse_token = token ? JSON.parse(token) : null;
  const user_id = parse_token ? parse_token.user_id : null;
  const [disable_personal_field, set_disable_personal_field] = useState(true);

  const [passwordState, setPasswordState] = useState({
    currentpass: "",
    newpass: "",
    confirmpass: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const [AddressState, setAddressState] = useState({
    housing: "",
    street: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });
  const handleChangeAddress = (e) => {
    const { name, value } = e.target;
    setAddressState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleDocumentSetChange = (event) => {
    setDocumentSet(event.target.value);
    setUserDocumentData({
      licenseno: "",
      issuedate: "",
      expiry: "",
      licenseFront: null,
      licenseBack: null,
      idno: "",
      idExpiry: "",
      gccIdFront: null,
      gccIdBack: null,
      passno: "",
      passIssueDate: "",
      passExpiry: "",
      passportFront: null,
      passportBack: null,
      entryStamp: null,
      intlicno: "",
      intIssueDate: "",
      intExpiry: "",
      permit: null,
      translation_dl_no: "",
      translation_dl: null,
      touristVisa: null,
    });
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState({
    personalfirstname: userDetails?.first_name || "",
    personallastname: userDetails?.last_name || "",
    phonenumberCode: userDetails?.phone_code || "212",
    phonenumber: userDetails?.phone_number || "",
    alterphoneCode: userDetails?.alt_phone_code || "212",
    alterphone: userDetails?.alt_phone_number || "",
    emailid: userDetails?.email || "",
    dob: userDetails?.dob || "",
    gender: userDetails?.gender || "",
    nationality: userDetails?.country_id || "",
    cities: userDetails?.city_id || "",
  });
  const [getUserDocumentsArray, setGetUserDocumentsArray] = useState([]);
  const [userDocumentData, setUserDocumentData] = useState({
    licenseno: "",
    issuedate: "",
    expiry: "",
    licenseFront: null,
    licenseBack: null,
    idno: "",
    idExpiry: "",
    gccIdFront: null,
    gccIdBack: null,
    passno: "",
    passIssueDate: "",
    passExpiry: "",
    passportFront: null,
    passportBack: null,
    entryStamp: null,
    intlicno: "",
    intIssueDate: "",
    intExpiry: "",
    permit: null,
    translation_dl_no: "",
    translation_dl: null,
    touristVisa: null,
  });

  const modifyUrlWithPlaceholders = (url, userId, docSetType, docType) => {
    // Using dynamic replacement for placeholders
    return url
      ?.replace("[user_id]", userId) // Replacing [user_id]
      ?.replace("[doc_set_type]", docSetType) // Replacing [doc_set_type]
      ?.replace("[doc_type]", docType); // Replacing [doc_type] (static or dynamic value)
  };

  const appendDocumentToFormData = async (
    formData,
    documentPath,
    fieldName
  ) => {
    // Check if documentPath is a string (likely a URL or base64)
    if (typeof documentPath === "string") {
      try {
        // Fetch the file from the URL
        const response = await fetch(documentPath);
        const blob = await response.blob(); // Convert response to Blob

        // Append the Blob (binary data) to formData
        formData.append(fieldName, blob, `${fieldName}.jpg`); // You can specify a filename here
      } catch (error) {
        console.error("Error converting URL to binary:", error);
      }
    } else if (documentPath instanceof Blob || documentPath instanceof File) {
      // If it's already binary, just append it
      formData.append(fieldName, documentPath);
    }
  };

  const displayUserDocumentsData = () => {
    if (getUserDocumentsArray && Array.isArray(getUserDocumentsArray)) {
      if (documentSet === "uae_resident") {
        //for license
        const license = getUserDocumentsArray?.find(
          (item) => item.doc_type === "driving_license"
        );
        const frontImage = modifyUrlWithPlaceholders(
          license?.front_image,
          user_id,
          "uae_resident",
          "driving_license"
        );
        const backImage = modifyUrlWithPlaceholders(
          license?.back_image,
          user_id,
          "uae_resident",
          "driving_license"
        );

        //for city ID
        const cityID = getUserDocumentsArray?.find(
          (item) => item.doc_type === "cities_id"
        );
        const frontImage_cityID = modifyUrlWithPlaceholders(
          cityID?.front_image,
          user_id,
          "uae_resident",
          "cities_id"
        );
        const backImage_cityID = modifyUrlWithPlaceholders(
          cityID?.back_image,
          user_id,
          "uae_resident",
          "cities_id"
        );

        setUserDocumentData((prevState) => ({
          ...prevState,
          licenseno: license?.doc_number,
          issuedate: license?.issue_date,
          expiry: license?.expiry_date,
          licenseFront: frontImage,
          licenseBack: backImage,
          idno: cityID?.doc_number,
          exp: cityID?.expiry_date,
          gccIdFront: frontImage_cityID,
        }));
      } else if (documentSet === "non_resident_gcc") {
        //for license
        const license_gcc = getUserDocumentsArray?.find(
          (item) => item.doc_type === "driving_license_gcc"
        );

        const frontImage = modifyUrlWithPlaceholders(
          license_gcc?.front_image,
          user_id,
          "non_resident_gcc",
          "driving_license_gcc"
        );
        const backImage = modifyUrlWithPlaceholders(
          license_gcc?.back_image,
          user_id,
          "non_resident_gcc",
          "driving_license_gcc"
        );
        //for gccId
        const gcc_id = getUserDocumentsArray?.find(
          (item) => item.doc_type === "gcc_id"
        );
        const gcc_id_front_img = modifyUrlWithPlaceholders(
          gcc_id?.front_image,
          user_id,
          "non_resident_gcc",
          "gcc_id"
        );

        //for passport
        const passport = getUserDocumentsArray?.find(
          (item) => item.doc_type === "passport"
        );
        const passport_front_img = modifyUrlWithPlaceholders(
          passport?.front_image,
          user_id,
          "non_resident_gcc",
          "passport"
        );

        //for international driving license/permit
        const int_permit = getUserDocumentsArray?.find(
          (item) => item.doc_type === "international_driving_license"
        );
        const permit_front_img = modifyUrlWithPlaceholders(
          int_permit?.front_image,
          user_id,
          "non_resident_gcc",
          "international_driving_license"
        );

        setUserDocumentData((prevState) => ({
          ...prevState,
          licenseno: license_gcc?.doc_number,
          issuedate: license_gcc?.issue_date,
          expiry: license_gcc?.expiry_date,
          licenseFront: frontImage,
          licenseBack: backImage,

          idno: gcc_id?.doc_number,
          exp: gcc_id?.expiry_date,
          gccIdFront: gcc_id_front_img,

          passno: passport?.doc_number,
          passIssueDate: passport?.issue_date,
          passExpiry: passport?.expiry_date,
          passportFront: passport_front_img,

          intlicno: int_permit?.doc_number,
          intIssueDate: int_permit?.issue_date,
          intExpiry: int_permit?.expiry_date,
          permit: permit_front_img,
        }));
      } else if (documentSet === "non_resident_other") {
        //for home country license
        const driving_license_home_country = getUserDocumentsArray?.find(
          (item) => item.doc_type === "driving_license_home_country"
        );

        const frontImage = modifyUrlWithPlaceholders(
          driving_license_home_country?.front_image,
          user_id,
          "non_resident_other",
          "driving_license_home_country"
        );
        const backImage = modifyUrlWithPlaceholders(
          driving_license_home_country?.back_image,
          user_id,
          "non_resident_other",
          "driving_license_home_country"
        );
        //for passport
        const passport = getUserDocumentsArray?.find(
          (item) => item.doc_type === "passport"
        );
        const passport_front_img = modifyUrlWithPlaceholders(
          passport?.front_image,
          user_id,
          "non_resident_other",
          "passport"
        );
        //for entry stamp
        const entery_stamp = getUserDocumentsArray?.find(
          (item) => item.doc_type === "entery_stamp"
        );
        const stamp_front_img = modifyUrlWithPlaceholders(
          entery_stamp?.front_image,
          user_id,
          "non_resident_other",
          "entery_stamp"
        );
        //for international driving license/permit
        const int_permit = getUserDocumentsArray?.find(
          (item) => item.doc_type === "international_driving_license"
        );
        const permit_front_img = modifyUrlWithPlaceholders(
          int_permit?.front_image,
          user_id,
          "non_resident_other",
          "international_driving_license"
        );
        //translation of DL
        const dl = getUserDocumentsArray?.find(
          (item) => item.doc_type === "translation_of_driving_license"
        );
        const dl_front_img = modifyUrlWithPlaceholders(
          int_permit?.front_image,
          user_id,
          "non_resident_other",
          "translation_of_driving_license"
        );
        //tourist visa
        const touristVisa = getUserDocumentsArray?.find(
          (item) => item.doc_type === "tourist_visa"
        );
        const touristVisa_front_img = modifyUrlWithPlaceholders(
          touristVisa?.front_image,
          user_id,
          "non_resident_other",
          "tourist_visa"
        );

        setUserDocumentData((prevState) => ({
          ...prevState,
          licenseno: driving_license_home_country?.doc_number,
          issuedate: driving_license_home_country?.issue_date,
          expiry: driving_license_home_country?.expiry_date,
          licenseFront: frontImage,
          licenseBack: backImage,

          passno: passport?.doc_number,
          passIssueDate: passport?.issue_date,
          passExpiry: passport?.expiry_date,
          passportFront: passport_front_img,

          entryStamp: stamp_front_img,

          intlicno: int_permit?.doc_number,
          intIssueDate: int_permit?.issue_date,
          intExpiry: int_permit?.expiry_date,
          permit: permit_front_img,

          translation_dl_no: dl?.doc_number,
          translation_dl: dl_front_img,

          touristVisa: touristVisa_front_img,
        }));
      }
    }
  };

  useEffect(() => {
    if (getUserDocumentsArray) {
      displayUserDocumentsData();
    }
  }, [getUserDocumentsArray]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const [formdata, setFormdata] = useState({
    firstname: "",
    dremail: "",
    drPhoneNumber: "",
  });

  const [ShowlistID, setShowListID] = useState(null);

  const getUserDetails = () => {
    const url = configWeb.GET_USER_DETAILS(user_id);

    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setUserDetails(res);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {});
  };
  const getDocumentsSetType = () => {
    const url = configWeb.GET_DOCUMENTS_SET_TYPE("set_type");

    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setDocumentSetArray(res);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    // getDocumentsSetType();
    // getUserDocuments();
    // getBookingList();
  }, [language, documentSet]);
  const getUserDocuments = () => {
    const url = configWeb.GET_USER_DOCUMENTS(
      documentSet,
      user_id
    ); /* ('uae_resident') */

    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setGetUserDocumentsArray(res);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {});
  };
  const formatDocumentSetName = (set) => {
    switch (set) {
      case "uae_resident":
        return "Resident-UAE";
      case "non_resident_gcc":
        return "Non Resident(GCC Nationals)";
      case "non_resident_other":
        return "Non Resident(Other Nationals)";
      default:
        return set;
    }
  };

  const putUserDetails = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        first_name: formData?.personalfirstname,
        last_name: formData?.personallastname,
        gender: formData?.gender,
        dob: formData?.dob,
        phone_code: formData?.phonenumberCode,
        phone_number: formData?.phonenumber,
        alt_phone_code: formData?.alterphoneCode,
        alt_phone_number: formData?.alterphone,
        country_id: formData?.nationality,
        city_id: formData.cities || null,
      });

      const url = configWeb.PUT_USER_DETAILS(user_id);
      set_loading_profile(true);
      simplePutCallAuth(url, body)
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Updated successfully"));
            resolve(true);
          } else if (res?.error) {
            if (Array.isArray(res?.message)) {
              notifyError(res?.message[0]);
            } else {
              notifyError(res?.message);
            }
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifySuccess(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_profile(false);
          // getUserDetails();
        });
    });
  };

  const getUserAddress = () => {
    const url = configWeb.GET_USER_ADDRESS(user_id);

    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setUserAddress(res);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    getUserDetails();
    getUserAddress();
  }, []);

  useEffect(() => {
    if (userDetails) {
      setFormData(() => ({
        personalfirstname: userDetails?.first_name || "",
        personallastname: userDetails?.last_name || "",
        phonenumberCode: userDetails?.phone_code || "212",
        phonenumber: userDetails?.phone_number || "",
        alterphoneCode: userDetails?.alt_phone_code || "212",
        alterphone: userDetails?.alt_phone_number || "",
        emailid: userDetails?.email || "",
        dob: userDetails?.dob || "",
        gender: userDetails?.gender || "",
        nationality: userDetails?.country_id || "",
        cities: userDetails?.city_id || "",
      }));
    }
  }, [userDetails]);

  useEffect(() => {
    if (userAddress) {
      setAddressState(() => ({
        housing: userAddress?.house_number || "",
        street: userAddress?.street_name || "",
        country:
          countries?.filter(
            (country) => country.id === userAddress?.country_id
          )?.[0]?.id || "",
        state: userAddress?.state || "",
        city: userAddress?.city || "",
        postalCode: userAddress?.zip_code || "",
        //city_id
      }));
    }
  }, [userAddress]);

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

  useEffect(() => {
    getCountriesData();
    citiesData();
  }, [language]);

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
  const handleResetPassword = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else if (passwordState.newpass !== passwordState.confirmpass) {
      setConfirmPasswordError(
        "New password and confirm password do not match!"
      );
      setValidated_for_password(true);
    } else {
      putPassword();
    }
    setValidated_for_password(true);
  };
  const handleAddressUpdate = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const isPutAddress = await putAddress();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      if (isPutAddress) {
        set_validated_for_address(false);
      }
      getUserAddress();
    }
    if (!isPutAddress) {
      set_validated_for_address(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading_profile) return;
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Handle form submission here, e.g., send data to the server
      // putUserDetails();

      const isPutUserDetails = await putUserDetails();

      getUserDetails();
      set_disable_personal_field(true);

      // passwordReset();
      // addressReset();
    }

    setValidated(true);
  };

  var c = countries?.filter((country) => country.id === AddressState.country);
  useEffect(() => {}, [countries, AddressState]);

  const handleEditProfile = () => {
    set_disable_personal_field(false);
  };
  const handleCancelEditProfile = () => {
    set_disable_personal_field(true);
    getUserDetails();
  };

  const putPassword = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        current_password: passwordState.currentpass,
        password: passwordState.newpass,
        confirm_password: passwordState.confirmpass,
      });

      const url = configWeb.PUT_RESET_PASSWORD(user_id);
      set_loading_password(true);
      simplePutCallAuth(url, body)
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Updated successfully"));

            resolve(true);
            setPasswordState({
              currentpass: "",
              newpass: "",
              confirmpass: "",
            });
            setValidated_for_password(false);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifySuccess(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_password(false);
          // getUserDetails();
        });
    });
  };

  const putAddress = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        house_number: AddressState.housing,
        street_name: AddressState.street,
        country_id: AddressState.country,
        // city_id: 0,
        state: AddressState.state,
        city: AddressState.city,
        zip_code: AddressState.postalCode,
      });

      const url = configWeb.PUT_USER_ADDRESS(user_id);
      set_loading_address(true);
      simplePutCallAuth(url, body)
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Updated successfully"));

            resolve(true);
            setPasswordState({
              currentpass: "",
              newpass: "",
              confirmpass: "",
            });
            setValidated_for_password(false);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifySuccess(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_address(false);
          // getUserDetails();
        });
    });
  };
  return (
    <>
      <MetaHelmet title="My Account" description="" noindex={true} />
      <Helmet title="My-Account">
        <div className="myAccountMainBox">
          {/* ── Profile hero card ── */}
          {userDetails?.first_name && (
            <div className="ma-profile-card">
              <div className="ma-avatar">
                {(userDetails.first_name?.[0] || "").toUpperCase()}
                {(userDetails.last_name?.[0] || "").toUpperCase()}
              </div>
              <div className="ma-user-info">
                <p className="ma-user-name">
                  {userDetails.first_name} {userDetails.last_name}
                </p>
                <p className="ma-user-email">{userDetails.email}</p>
                <span className="ma-user-badge"><i className="ri-shield-check-line"></i> {t("Verified Member")}</span>
              </div>
            </div>
          )}
          <div className="tabsSection">
            <Tab.Container defaultActiveKey={tab_type || "first"}>
              <>
                <div className="d-sm-none mx-auto carousel-at-mobile">
                  <Carousel interval={2000} controls>
                    <Carousel.Item>
                      <Nav.Link eventKey="first">{t("My Account")}</Nav.Link>
                    </Carousel.Item>
                    <Carousel.Item>
                      <Nav.Link eventKey="second">{t("Documents")}</Nav.Link>
                    </Carousel.Item>
                    <Carousel.Item>
                      <Nav.Link eventKey="third">
                        {t("Additional Driver")}
                      </Nav.Link>
                    </Carousel.Item>
                    <Carousel.Item>
                      <Nav.Link eventKey="bookings">{t("Bookings")}</Nav.Link>
                    </Carousel.Item>
                    {/* <Carousel.Item>
                      <Nav.Link
                        eventKey="fifth"
                        className="fifthinvoice position-relative"
                      >
                        Invoices
                        <span className="displaycomment badge">
                          coming soon
                        </span>
                      </Nav.Link>
                    </Carousel.Item>
                    <Carousel.Item>
                      <Nav.Link
                        eventKey="sixth"
                        className="sixthloyalty position-relative"
                      >
                        Route Facile Loyalty
                        <span className="displaycomment badge">
                          coming soon
                        </span>
                      </Nav.Link>
                    </Carousel.Item> */}
                  </Carousel>
                </div>

                <Nav variant="pills" className="d-none d-sm-flex">
                  <Nav.Item>
                    <Nav.Link eventKey="first">
                      <i className="ri-user-line"></i> {t("My Account")}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="second">
                      <i className="ri-file-text-line"></i> {t("Documents")}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="third">
                      <i className="ri-steering-2-line"></i> {t("Additional Driver")}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="bookings">
                      <i className="ri-calendar-check-line"></i> {t("Bookings")}
                    </Nav.Link>
                  </Nav.Item>
                  {/* <Nav.Item>
                    <Nav.Link
                      eventKey="fifth"
                      className="fifthinvoice position-relative"
                    >
                      Invoices
                      <span className="displaycomment badge">coming soon</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="sixth"
                      className="sixthloyalty position-relative"
                    >
                      Route Facile Loyalty
                      <span className="displaycomment badge">coming soon</span>
                    </Nav.Link>
                  </Nav.Item> */}
                </Nav>
              </>

              <Tab.Content>
                <Tab.Pane eventKey="first">
                  <div className="accordBox">
                    <Accordion defaultActiveKey="1">
                      <Accordion.Item eventKey="1" className="shadow">
                        <Accordion.Header>
                          <span className="ma-section-icon"><i className="ri-user-settings-line"></i></span>
                          {t("Personal Details")}
                        </Accordion.Header>
                        <Accordion.Body>
                          <Form
                            noValidate
                            validated={validated}
                            onSubmit={handleSubmit}
                          >
                            <div className="row justify-content-between">
                              <div className="col-lg-3 col-md-6">
                                <Form.Group controlId="personalfirstname">
                                  <Form.Label>{t("First Name")}</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="personalfirstname"
                                    value={formData.personalfirstname}
                                    onChange={handleChange}
                                    required
                                    disabled={disable_personal_field}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please provide a first name.")}
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>
                              <div className="col-lg-3 col-md-6 margin-small-screen">
                                <Form.Group controlId="personallastname">
                                  <Form.Label>{t("Last Name")}</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="personallastname"
                                    value={formData.personallastname}
                                    onChange={handleChange}
                                    required
                                    disabled={disable_personal_field}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please provide a last name.")}
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-3 col-md-6 col-sm-6 margin-small-screen">
                                <Form.Group controlId="phonenumberCode">
                                  <Form.Label>{t("Phone Number")}</Form.Label>
                                  <div className="row">
                                    <div className="col-5">
                                      <Form.Select
                                        name="phonenumberCode"
                                        value={formData.phonenumberCode}
                                        onChange={handleChange}
                                        required
                                        disabled={disable_personal_field}
                                        className="px-0 custom-fontsize"
                                      >
                                        <option value="">{t("Code")}</option>
                                        {countries?.map((country) => (
                                          <option
                                            key={country.id}
                                            value={country.phone_code}
                                          >
                                            {country.name} (+{country.phone_code})
                                          </option>
                                        ))}
                                      </Form.Select>
                                      {/* <Form.Control.Feedback type="invalid">
                                        Please select a phone code.
                                      </Form.Control.Feedback> */}
                                    </div>
                                    <div className="col-7">
                                      <Form.Control
                                        type="number"
                                        name="phonenumber"
                                        value={formData.phonenumber}
                                        onChange={handleChange}
                                        required
                                        disabled={disable_personal_field}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {t("Please provide a phone number.")}
                                      </Form.Control.Feedback>
                                    </div>
                                  </div>
                                </Form.Group>
                              </div>

                              <div className="col-lg-3 col-md-6 col-sm-6 margin-small-screen">
                                <Form.Group controlId="alterphoneCode">
                                  <Form.Label>
                                    {t("Alternate Phone Number")}
                                  </Form.Label>
                                  <div className="row">
                                    <div className="col-5">
                                      <Form.Select
                                        name="alterphoneCode"
                                        value={formData.alterphoneCode}
                                        onChange={handleChange}
                                        required
                                        disabled={disable_personal_field}
                                        className="px-0 custom-fontsize"
                                      >
                                        <option value="">{t("Code")}</option>
                                        {countries?.map((country) => (
                                          <option
                                            key={country.id}
                                            value={country.phone_code}
                                          >
                                            {country.name} (+{country.phone_code})
                                          </option>
                                        ))}
                                      </Form.Select>
                                      {/* <Form.Control.Feedback type="invalid">
                                        Please select a phone code.
                                      </Form.Control.Feedback> */}
                                    </div>
                                    <div className="col-7">
                                      <Form.Control
                                        type="number"
                                        name="alterphone"
                                        value={formData.alterphone}
                                        onChange={handleChange}
                                        required
                                        disabled={disable_personal_field}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        {t(
                                          "Please provide an alternate phone number"
                                        )}
                                        .
                                      </Form.Control.Feedback>
                                    </div>
                                  </div>
                                </Form.Group>
                              </div>
                            </div>

                            <div className="row justify-content-between">
                              <div className="col-lg-3 col-md-6 mt-3">
                                <Form.Group controlId="emailid">
                                  <Form.Label>{t("Email")}</Form.Label>
                                  <Form.Control
                                    type="email"
                                    name="emailid"
                                    value={formData.emailid}
                                    onChange={handleChange}
                                    required
                                    disabled={disable_personal_field}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please provide a valid email.")}
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-3 col-md-6 mt-3">
                                <Form.Group controlId="dob">
                                  <Form.Label>{t("Date Of Birth")}</Form.Label>
                                  <Form.Control
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                    disabled={disable_personal_field}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please provide your date of birth")}
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-3 col-md-6 mt-3">
                                <label className="form-label">
                                  {t("Select Gender")}
                                </label>
                                <div className="ma-gender-group">
                                  <label className={`ma-gender-btn${formData.gender === "male" ? " active" : ""}`}>
                                    <input
                                      type="radio"
                                      name="gender"
                                      value="male"
                                      checked={formData.gender === "male"}
                                      onChange={handleChange}
                                      disabled={disable_personal_field}
                                    />
                                    <i className="ri-men-line"></i> {t("Male")}
                                  </label>
                                  <label className={`ma-gender-btn${formData.gender === "female" ? " active" : ""}`}>
                                    <input
                                      type="radio"
                                      name="gender"
                                      value="female"
                                      checked={formData.gender === "female"}
                                      onChange={handleChange}
                                      disabled={disable_personal_field}
                                    />
                                    <i className="ri-women-line"></i> {t("Female")}
                                  </label>
                                </div>
                              </div>

                              <div className="col-lg-3 col-md-6 mt-3">
                                <Form.Group controlId="nationality">
                                  <Form.Label>{t("Nationality")}</Form.Label>
                                  <Form.Select
                                    name="nationality"
                                    value={formData.nationality}
                                    // value={AddressState.country?.[0]?.id}
                                    onChange={handleChange}
                                    required
                                    disabled={disable_personal_field}
                                  >
                                    <option value="">{t("Nationality")}</option>
                                    {countries?.map((country) => (
                                      <option
                                        key={country.id}
                                        value={country.id}
                                      >
                                        {country.name}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please select a nationality")}.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>
                            </div>

                            <div className="row justify-content-between">
                              {formData.nationality == "229" ? (
                                <div className="col-lg-3 col-md-6 mt-3">
                                  <Form.Group controlId="cities">
                                    <Form.Label>{t("City")}</Form.Label>
                                    <Form.Select
                                      name="cities"
                                      value={formData.cities}
                                      onChange={handleChange}
                                      required
                                      disabled={disable_personal_field}
                                    >
                                      <option value="">
                                        {t("Select Cities")}
                                      </option>
                                      {citiesArray?.map((city) => (
                                        <option
                                          key={city.id}
                                          value={city.id}
                                        >
                                          {city.name}
                                        </option>
                                      ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                      {t("Please select an city")}.
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </div>
                              ) : (
                                <div className="col-lg-3 col-md-6 mt-3"></div>
                              )}

                              <div className="col-lg-4 col-md-6 d-flex align-items-end justify-content-end mt-3">
                                {disable_personal_field ? (
                                  <Button
                                    type="button"
                                    className="defButton me-2 text-nowrap"
                                    onClick={(e) => {
                                      e.preventDefault(); // Prevent form submission if this is inside a form
                                      handleEditProfile();
                                    }}
                                  >
                                    {t("Edit profile")}
                                  </Button>
                                ) : (
                                  <Button
                                    type="submit"
                                    className="defButton me-2 text-nowrap"
                                    disabled={loading_profile}
                                  >
                                    {loading_profile ? (
                                      <Spinner />
                                    ) : (
                                      t("Save changes")
                                    )}
                                  </Button>
                                )}
                                {!disable_personal_field && (
                                  <Button
                                    type="button"
                                    className={`btn-cancel-edit text-nowrap ${
                                      language === "ar" ? "me-2" : ""
                                    }`}
                                    onClick={handleCancelEditProfile}
                                  >
                                    {t("Cancel edit profile")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>

                      <Accordion.Item eventKey="2" className="shadow">
                        <Accordion.Header>
                          <span className="ma-section-icon"><i className="ri-lock-password-line"></i></span>
                          {t("Password")}
                        </Accordion.Header>
                        <Accordion.Body>
                          <Form
                            noValidate
                            validated={validated_for_password}
                            onSubmit={handleResetPassword}
                          >
                            <div className="row justify-content-between">
                              <div className="col-lg-4 col-md-6 col-sm-12">
                                <Form.Group controlId="currentpass">
                                  <Form.Label>
                                    {t("Current Password")}
                                  </Form.Label>
                                  <Form.Control
                                    type="password"
                                    name="currentpass"
                                    value={passwordState.currentpass}
                                    onChange={handlePasswordChange}
                                    required
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please provide your current password")}.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-4 col-md-6 col-sm-12">
                                <Form.Group controlId="newpass">
                                  <Form.Label>{t("New Password")}</Form.Label>
                                  <Form.Control
                                    type="password"
                                    name="newpass"
                                    value={passwordState.newpass}
                                    onChange={handlePasswordChange}
                                    required
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please provide a new password")}.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-4 col-md-6 col-sm-12">
                                <Form.Group controlId="confirmpass">
                                  <Form.Label>
                                    {t("Confirm New Password")}
                                  </Form.Label>
                                  <Form.Control
                                    type="password"
                                    name="confirmpass"
                                    value={passwordState.confirmpass}
                                    onChange={handlePasswordChange}
                                    required
                                    isInvalid={
                                      passwordState.newpass !==
                                      passwordState.confirmpass
                                    }
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {/* {confirmPasswordError} */}
                                    {passwordState.confirmpass
                                      ? t(
                                          "New password and confirm password do not match!"
                                        )
                                      : t("Please confirm your new password")}
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>
                            </div>

                            <div className="row justify-content-end">
                              <div className="col-5 d-flex justify-content-end">
                                <Button
                                  type="submit"
                                  className="defButton me-3 mt-2 text-nowrap"
                                  disabled={loading_password}
                                >
                                  {loading_password ? (
                                    <Spinner />
                                  ) : (
                                    t("Save changes")
                                  )}
                                </Button>
                              </div>
                            </div>
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>

                      <Accordion.Item eventKey="3" className="shadow">
                        <Accordion.Header>
                          <span className="ma-section-icon"><i className="ri-map-pin-line"></i></span>
                          {t("Billing Address")}
                        </Accordion.Header>
                        <Accordion.Body>
                          <Form
                            noValidate
                            validated={validated_for_address}
                            onSubmit={handleAddressUpdate}
                          >
                            <div className="row">
                              <div className="col-12">
                                <Form.Group controlId="housing">
                                  <Form.Label>
                                    {t("House Number / Building Number")}
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="housing"
                                    value={AddressState.housing}
                                    onChange={handleChangeAddress}
                                    required
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t(
                                      "Please provide your house/building number"
                                    )}
                                    .
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-12 mt-3">
                                <Form.Group controlId="street">
                                  <Form.Label>
                                    {t("Street Name / Area")}
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="street"
                                    value={AddressState.street}
                                    onChange={handleChangeAddress}
                                    required
                                    isValid={false}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t(
                                      "Please provide your street name or area"
                                    )}
                                    .
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-lg-3 col-md-6">
                                <Form.Group controlId="country">
                                  <Form.Label>{t("Country")}</Form.Label>
                                  <Form.Select
                                    name="country"
                                    value={AddressState.country}
                                    onChange={handleChangeAddress}
                                    required
                                    isValid={false}
                                  >
                                    <option value="">
                                      {t("Select country")}
                                    </option>
                                    {countries?.map((country) => (
                                      <option
                                        key={country.id}
                                        value={country.id}
                                      >
                                        {country.name}
                                      </option>
                                    ))}
                                    {/* Add more countries as needed */}
                                  </Form.Select>

                                  <Form.Control.Feedback type="invalid">
                                    {t("Please select your country")}.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-3 col-md-6">
                                <Form.Group controlId="state">
                                  <Form.Label>{t("State")}</Form.Label>
                                  <Form.Control
                                    name="state"
                                    value={AddressState.state}
                                    onChange={handleChangeAddress}
                                    required
                                    isValid={false}
                                  ></Form.Control>
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please select your state")}.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-3 col-md-6">
                                <Form.Group controlId="city">
                                  <Form.Label>{t("Town/City")}</Form.Label>
                                  <Form.Control
                                    name="city"
                                    value={AddressState.city}
                                    onChange={handleChangeAddress}
                                    required
                                    isValid={false}
                                  ></Form.Control>
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please select your city")}.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>

                              <div className="col-lg-3 col-md-6">
                                <Form.Group controlId="postalCode">
                                  <Form.Label>
                                    {t("Zip/Postal Code")}
                                  </Form.Label>
                                  <Form.Control
                                    type="number"
                                    name="postalCode"
                                    value={AddressState.postalCode}
                                    onChange={handleChangeAddress}
                                    required
                                    isValid={false}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {t("Please provide your postal code")}.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </div>
                            </div>

                            <div className="row d-flex justify-content-end">
                              <div className="col-6 d-flex justify-content-end mt-3">
                                <Button
                                  type="submit"
                                  className="defButtonbilling text-nowrap px-3"
                                  disabled={loading_address}
                                >
                                  {loading_address ? (
                                    <Spinner />
                                  ) : (
                                    t("Update billing address")
                                  )}
                                </Button>
                              </div>
                            </div>
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="bookings">
                  <Booking user_id={user_id} />
                </Tab.Pane>
              </Tab.Content>

              <Tab.Content>
                <Tab.Pane eventKey="second">
                  <UserDocumentss user_id={user_id} />
                </Tab.Pane>
              </Tab.Content>

              <Tab.Content>
                <Tab.Pane eventKey="third">
                  <AdditionalDriver
                    countries={countries}
                    citiesArray={citiesArray}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </Helmet>
    </>
  );
};

export default MyAccount;
