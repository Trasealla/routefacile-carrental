import React, { useEffect, useState } from "react";
import "../../styles/account.css";
import Helmet from "../../components/Helmet/Helmet";
import MetaHelmet from "../../components/Helmet/MetaHelmet";
import { Link } from "react-router-dom";
import {
  Nav,
  NavItem,
  Tab,
  Accordion,
  Badge,
  Form,
  Button,
  Spinner,
  Modal,
  CardText,
  Card as BootstrapCard,
  CardBody,
  CardTitle,
  Carousel,
} from "react-bootstrap";
import threedots from "../../assets/all-images/options3dots.svg";

import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import { compose, nanoid } from "@reduxjs/toolkit";
import threedotsvertical from "../../assets/all-images/three-dots-vertical-svgrepo-com.svg";
import carImage from "../../assets/all-images/cars-img/tesla.jpg";
import { red } from "@mui/material/colors";
import dropdownshow from "../../assets/all-images/dropdown-arrow-svgrepo-com.svg";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import {
  multipartPostCall,
  simpleGetCall,
  simpleGetCallAuth,
  simplePostCallAuth,
  simplePutCallAuth,
} from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { t } from "i18next";
const DriverDocuments = () => {
  const token = localStorage.getItem("token");
  const parse_token = token ? JSON.parse(token) : null;
  const user_id = parse_token ? parse_token.user_id : null;
  const language = useSelector((state) => state.language.language);
  const { id } = useParams();
  const [loading_document, set_loading_document] = useState(false);
  const [documentSetArray, setDocumentSetArray] = useState([]);
  const [documentSet, setDocumentSet] = useState("uae_resident");
  const [loading_profile, set_loading_profile] = useState(false);
  const [getUserDocumentsArray, setGetUserDocumentsArray] = useState([]);
  const [userDocumentValidated, setUserDocumentValidated] = useState(false);
  const [userDocumentValidated_1, setUserDocumentValidated_1] = useState(false);
  const [userDocumentValidated_2, setUserDocumentValidated_2] = useState(false);
  const [userDocumentValidated_3, setUserDocumentValidated_3] = useState(false);
  const [userDocumentValidated_4, setUserDocumentValidated_4] = useState(false);
  const [userDocumentValidated_5, setUserDocumentValidated_5] = useState(false);
  const [userDocumentValidated_6, setUserDocumentValidated_6] = useState(false);
  const [userDocumentValidated_7, setUserDocumentValidated_7] = useState(false);
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
  const modifyUrlWithPlaceholders = (url, userId, docSetType, docType) => {
    // Using dynamic replacement for placeholders
    return url
      ?.replace("[user_id]", userId) // Replacing [user_id]
      ?.replace("[doc_set_type]", docSetType) // Replacing [doc_set_type]
      ?.replace("[doc_type]", docType); // Replacing [doc_type] (static or dynamic value)
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

  const handleUserDocumentDataChange = (event) => {
    const { name, value, type, files } = event.target;
    if (type === "file") {
      setUserDocumentData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      setUserDocumentData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmitUserDocuments = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.

      if (documentSet !== "non_resident_other") {
        await postUserDocuments_id();
      }
      if (documentSet !== "uae_resident") {
        await postUserDocuments_passport();
        await postUserDocuments_entry_stamp();
      }

      await postUserDocuments_international_driving_license();
      if (documentSet === "non_resident_other") {
        await postUserDocuments_translation_dl();
        await postUserDocuments_tourist_visa();
      }
      await postUserDocuments_driving_license();
    }
    setUserDocumentValidated(true);
  };
  const handleSubmitUserDocuments_1 = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.

      await postUserDocuments_driving_license();
    }
    setUserDocumentValidated_1(true);
  };
  const handleSubmitUserDocuments_2 = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.

      if (documentSet !== "non_resident_other") {
        await postUserDocuments_id();
      }
    }
    setUserDocumentValidated_2(true);
  };
  const handleSubmitUserDocuments_3 = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.

      if (documentSet !== "uae_resident") {
        await postUserDocuments_passport();
      }
    }
    setUserDocumentValidated_3(true);
  };
  const handleSubmitUserDocuments_4 = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.

      if (documentSet !== "uae_resident") {
        await postUserDocuments_entry_stamp();
      }
    }
    setUserDocumentValidated_4(true);
  };
  const handleSubmitUserDocuments_5 = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.

      await postUserDocuments_international_driving_license();
    }
    setUserDocumentValidated_5(true);
  };
  const handleSubmitUserDocuments_6 = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.
      if (documentSet === "non_resident_other") {
        await postUserDocuments_translation_dl();
      }
    }
    setUserDocumentValidated_6(true);
  };
  const handleSubmitUserDocuments_7 = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // setUserDocumentValidated(true); this is wrong placement.
      if (documentSet === "non_resident_other") {
        await postUserDocuments_tourist_visa();
      }
    }
    setUserDocumentValidated_7(true);
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

  const postUserDocuments_driving_license = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("doc_number", userDocumentData?.licenseno);
      formData.append("issue_date", userDocumentData?.issuedate);
      formData.append("expiry_date", userDocumentData?.expiry);
      formData.append(
        "doc_type",
        documentSet === "non_resident_gcc"
          ? "driving_license_gcc"
          : documentSet === "uae_resident"
          ? "driving_license"
          : "driving_license_home_country"
      );
      formData.append(
        "doc_set_type",
        documentSet === "uae_resident"
          ? "uae_resident"
          : documentSet === "non_resident_gcc"
          ? "non_resident_gcc"
          : "non_resident_other"
      );
      formData.append("user_id", user_id);
      formData.append("user_driver_id", id);
      formData.append("front_image", userDocumentData?.licenseFront);
      formData.append("back_image", userDocumentData?.licenseBack);
      const url = configWeb.POST_USER_DRIVER_DOCUMENTS;
      set_loading_document(true);
      multipartPostCall(url, formData)
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
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_document(false);
          // getUserDetails();
        });
    });
  };
  const postUserDocuments_id = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("doc_number", userDocumentData?.idno);
      // formData.append("issue_date", "2023-09-12");
      formData.append("expiry_date", userDocumentData?.exp);
      formData.append(
        "doc_type",
        documentSet === "non_resident_gcc"
          ? "gcc_id"
          : documentSet === "uae_resident"
          ? "cities_id"
          : ""
      );
      formData.append(
        "doc_set_type",
        documentSet === "uae_resident"
          ? "uae_resident"
          : documentSet === "non_resident_gcc"
          ? "non_resident_gcc"
          : "non_resident_other"
      );

      formData.append("user_id", user_id);
      formData.append("front_image", userDocumentData?.gccIdFront);
      // formData.append("back_image", userDocumentData?.gccIdBack);
      const url = configWeb.POST_USER_DRIVER_DOCUMENTS;
      set_loading_profile(true);
      multipartPostCall(url, formData)
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
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_profile(false);
          // getUserDetails();
        });
    });
  };
  const postUserDocuments_passport = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("doc_number", userDocumentData?.passno);
      formData.append("issue_date", userDocumentData?.passIssueDate);
      formData.append("expiry_date", userDocumentData?.passExpiry);
      formData.append(
        "doc_type",
        /* documentSet === "non_resident_gcc" ? "passport" : "" */ "passport"
      );
      formData.append(
        "doc_set_type",
        documentSet === "uae_resident"
          ? "uae_resident"
          : documentSet === "non_resident_gcc"
          ? "non_resident_gcc"
          : "non_resident_other"
      );

      formData.append("user_id", user_id);
      formData.append("front_image", userDocumentData?.passportFront);
      // formData.append("back_image", userDocumentData?.passportBack);
      const url = configWeb.POST_USER_DRIVER_DOCUMENTS;
      set_loading_profile(true);
      multipartPostCall(url, formData)
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
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_profile(false);
          // getUserDetails();
        });
    });
  };
  const postUserDocuments_entry_stamp = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      // formData.append("doc_number", "12345");
      // formData.append("issue_date", userDocumentData?.passIssueDate);
      // formData.append("expiry_date", userDocumentData?.passExpiry);
      formData.append(
        "doc_type",
        /*  documentSet === "non_resident_gcc" ? "entery_stamp" : "" */ "entery_stamp"
      );
      formData.append(
        "doc_set_type",
        documentSet === "uae_resident"
          ? "uae_resident"
          : documentSet === "non_resident_gcc"
          ? "non_resident_gcc"
          : "non_resident_other"
      );

      formData.append("user_id", user_id);
      formData.append("front_image", userDocumentData?.entryStamp);
      // formData.append("back_image", userDocumentData?.passportBack);
      const url = configWeb.POST_USER_DRIVER_DOCUMENTS;
      set_loading_profile(true);
      multipartPostCall(url, formData)
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
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_profile(false);
          // getUserDetails();
        });
    });
  };
  const postUserDocuments_international_driving_license = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("doc_number", userDocumentData?.intlicno);
      formData.append("issue_date", userDocumentData?.intIssueDate);
      formData.append("expiry_date", userDocumentData?.intExpiry);
      formData.append(
        "doc_type",
        documentSet === "uae_resident"
          ? "driving_license_home_country"
          : "international_driving_license"
      );
      formData.append(
        "doc_set_type",
        documentSet === "uae_resident"
          ? "uae_resident"
          : documentSet === "non_resident_gcc"
          ? "non_resident_gcc"
          : "non_resident_other"
      );

      formData.append("user_id", user_id);
      formData.append("front_image", userDocumentData?.permit);
      if (documentSet === "uae_resident") {
        formData.append("back_image", userDocumentData?.entryStamp);
      }
      const url = configWeb.POST_USER_DRIVER_DOCUMENTS;
      set_loading_profile(true);
      multipartPostCall(url, formData)
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
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_profile(false);
          // getUserDetails();
        });
    });
  };

  const postUserDocuments_translation_dl = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("doc_number", userDocumentData?.translation_dl_no);
      // formData.append("issue_date", "2022-01-01");
      // formData.append("expiry_date", "2026-01-01");
      formData.append("doc_type", "translation_of_driving_license");
      formData.append(
        "doc_set_type",
        documentSet === "uae_resident"
          ? "uae_resident"
          : documentSet === "non_resident_gcc"
          ? "non_resident_gcc"
          : "non_resident_other"
      );

      formData.append("user_id", user_id);
      formData.append("front_image", userDocumentData?.translation_dl);
      // formData.append("back_image", userDocumentData?.passportBack);
      const url = configWeb.POST_USER_DRIVER_DOCUMENTS;
      set_loading_profile(true);
      multipartPostCall(url, formData)
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
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_profile(false);
          // getUserDetails();
        });
    });
  };
  const postUserDocuments_tourist_visa = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      // formData.append("doc_number", "12345");
      // formData.append("issue_date", "2022-01-01");
      // formData.append("expiry_date", "2026-01-01");
      formData.append("doc_type", "tourist_visa");
      formData.append(
        "doc_set_type",
        documentSet === "uae_resident"
          ? "uae_resident"
          : documentSet === "non_resident_gcc"
          ? "non_resident_gcc"
          : "non_resident_other"
      );

      formData.append("user_id", user_id);
      formData.append("front_image", userDocumentData?.touristVisa);
      // formData.append("back_image", userDocumentData?.passportBack);
      const url = configWeb.POST_USER_DRIVER_DOCUMENTS;
      set_loading_profile(true);
      multipartPostCall(url, formData)
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
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_loading_profile(false);
          // getUserDetails();
        });
    });
  };
  const getDocumentsSetType = () => {
    const url = configWeb.GET_DOCUMENTS_SET_TYPE("set_type", language);

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
  const getUserDocuments = () => {
    const url = configWeb.GET_USER_DRIVER_DOCUMENTS(
      documentSet,
      id,
      language
    ); /* ('uae_resident')*/

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
  useEffect(() => {
    getDocumentsSetType();
    getUserDocuments();
    // getBookingList();
  }, [language, documentSet]);

  return (
    <div className="row border rounded-3 p-3 shadow">
      <MetaHelmet title="Driver Documents" description="" noindex={true} />
      <h2>{t("DOCUMENTS")}</h2>
      <h4>{t("ONE PLACE TO MANAGE YOUR ACCOUNT")}</h4>
      <div className="col-lg-4 col-md-6 mb-6">
        <label htmlFor="docset">{t("Your Document Set")}</label>
        <select
          className="form-select"
          value={documentSet}
          onChange={handleDocumentSetChange}
        >
          {documentSetArray.length > 0 &&
            documentSetArray?.map((set, index) => (
              <option key={index} value={set}>
                {" "}
                {t(formatDocumentSetName(set))}
              </option>
            ))}
          {/* <option value="uae_resident">Resident-UAE</option>
        <option value="non_resident_gcc">
          Non Resident(GCC Nationals)
        </option>
        <option value="non_resident_other">
          Non Resident(Other Nationals)
        </option> */}
        </select>
      </div>
      {/* <hr className="my-3" /> */}
      <Accordion defaultActiveKey="1.1" className="mt-4">
        <Accordion.Item eventKey="1.1" className="shadow mb-2 ">
          <Accordion.Header>
            {" "}
            {documentSet === "uae_resident"
              ? t("UAE Driving License")
              : documentSet === "non_resident_gcc"
              ? t("GCC Driving License")
              : t("Home Country Driving License")}
          </Accordion.Header>
          <Accordion.Body>
            <Form
              noValidate
              validated={userDocumentValidated_1}
              onSubmit={handleSubmitUserDocuments_1}
            >
              <div className="row">
                <div className="col-lg-4 col-md-6">
                  <Form.Group controlId="licenseno">
                    <Form.Label
                      /* htmlFor="licenseno */ className="text-nowrap"
                    >
                      {/* {documentSet === "uae_resident"
                      ? "UAE Driving License - Front"
                      : documentSet === "non_resident_gcc"
                      ? "GCC Driving License - Front"
                      : "Home Country Driving License - Front"} */}
                      {t("License Number")}
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="licenseno"
                      placeholder={t("License Number")}
                      value={userDocumentData.licenseno}
                      onChange={handleUserDocumentDataChange}
                      required
                    />

                    <Form.Control.Feedback type="invalid">
                      {t("Please provide a license number")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-lg-4 col-md-6 margin-small-screen">
                  <Form.Group controlId="issuedate">
                    <Form.Label>{t("Issue Date")}</Form.Label>
                    <Form.Control
                      type="date"
                      name="issuedate"
                      value={userDocumentData.issuedate}
                      onChange={handleUserDocumentDataChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide the issue date")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-lg-4 col-md-6 margin-small-screen">
                  <Form.Group controlId="expiry">
                    <Form.Label>{t("Expiry Date")}</Form.Label>
                    <Form.Control
                      type="date"
                      name="expiry"
                      value={userDocumentData.expiry}
                      onChange={handleUserDocumentDataChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please provide the expiry date")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="w-100"></div>
                <div className="col-lg-4 col-md-6 mt-2">
                  <p className="text-nowrap">
                    {documentSet === "uae_resident"
                      ? t("UAE Driving License - Front")
                      : documentSet === "non_resident_gcc"
                      ? t("GCC Driving License - Front")
                      : t("Home Country Driving License - Front")}
                  </p>
                  <Form.Group controlId="license-front">
                    {/* <Form.Label className="defButton">
                    Choose Front Image
                  </Form.Label> */}
                    <Form.Control
                      type="file"
                      name="licenseFront"
                      onChange={handleUserDocumentDataChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please upload the front of your license")}.
                    </Form.Control.Feedback>

                    {userDocumentData?.licenseFront && (
                      <div className="mt-2-">
                        <a
                          href={
                            typeof userDocumentData.licenseFront === "string"
                              ? userDocumentData.licenseFront // Use server URL if it's a string
                              : URL?.createObjectURL(
                                  userDocumentData?.licenseFront
                                ) // Use createObjectURL for local file
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          {t("View Document")}
                        </a>
                      </div>
                    )}
                  </Form.Group>
                </div>
              </div>
              {/* <hr className="my-3" /> */}

              {/* <div className="row"> */}
              <div className="col-lg-4 col-md-6 my-3">
                <p className="text-nowrap">
                  {documentSet === "uae_resident"
                    ? t("UAE Driving License - Back")
                    : documentSet === "non_resident_gcc"
                    ? t("GCC Driving License - Back")
                    : t("Home Country Driving License - Back")}
                </p>
                <Form.Group controlId="license-back">
                  {/* <Form.Label className="defButton">
                    Choose Back Image
                  </Form.Label> */}
                  <Form.Control
                    type="file"
                    name="licenseBack"
                    onChange={handleUserDocumentDataChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please upload the back of your license")}.
                  </Form.Control.Feedback>
                  {userDocumentData?.licenseBack && (
                    <div className="mt-2-">
                      <a
                        href={
                          typeof userDocumentData?.licenseBack === "string"
                            ? userDocumentData?.licenseBack // Use server URL if it's a string
                            : URL?.createObjectURL(
                                userDocumentData?.licenseBack
                              ) // Use createObjectURL for local file
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {t("View Document")}
                      </a>
                    </div>
                  )}
                </Form.Group>
              </div>

              {/* </div> */}

              <div className="row justify-content-center">
                <div className="col-7 d-flex justify-content-center">
                  <button
                    type="submit"
                    className="defButton text-nowrap"
                    // onClick={handleSubmitUserDocuments}
                    disabled={loading_document}
                  >
                    {loading_document ? <Spinner /> : t("Save Documents")}
                  </button>
                </div>
              </div>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
        {documentSet !== "non_resident_other" && (
          <Accordion.Item eventKey="1.2" className="shadow mb-2">
            <Accordion.Header>
              {" "}
              {documentSet === "uae_resident"
                ? t("City ID")
                : documentSet === "non_resident_gcc"
                ? t("GCC ID")
                : ""}
            </Accordion.Header>
            <Accordion.Body>
              {/* <hr className="my-3" /> */}
              <Form
                noValidate
                validated={userDocumentValidated_2}
                onSubmit={handleSubmitUserDocuments_2}
              >
                {documentSet === "non_resident_other" ? (
                  <></>
                ) : (
                  <>
                    <div className="row">
                      <div className="col-lg-4 col-md-6 ">
                        <Form.Group controlId="idno">
                          <Form.Label className="text-nowrap">
                            {documentSet === "uae_resident"
                              ? t("City ID Number")
                              : documentSet === "non_resident_gcc"
                              ? t("GCC ID Number")
                              : ""}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="idno"
                            placeholder={t("ID Number")}
                            value={userDocumentData?.idno}
                            onChange={handleUserDocumentDataChange}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {t("Please provide a ID number")}.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div className="col-lg-4 col-md-6 margin-small-screen">
                        <Form.Group controlId="exp">
                          <Form.Label>{t("Expiry Date")}</Form.Label>
                          <Form.Control
                            type="date"
                            name="exp"
                            // placeholder="License Number"
                            value={userDocumentData?.exp}
                            onChange={handleUserDocumentDataChange}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {t("Please provide expiry date")}.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="row mt-2">
                        <div className="col-lg-4 col-md-6 my-3">
                          <Form.Group controlId="gcc-id-front">
                            {/* <Form.Label className="defButton">
                          Upload Now
                        </Form.Label> */}
                            <Form.Control
                              type="file"
                              name="gccIdFront"
                              onChange={handleUserDocumentDataChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Please upload front of GCC ID")}.
                            </Form.Control.Feedback>

                            {userDocumentData?.gccIdFront && (
                              <div className="mt-2-">
                                <a
                                  href={
                                    typeof userDocumentData.gccIdFront ===
                                    "string"
                                      ? userDocumentData.gccIdFront // Use server URL if it's a string
                                      : URL?.createObjectURL(
                                          userDocumentData?.gccIdFront
                                        ) // Use createObjectURL for local file
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary"
                                >
                                  {t("View Document")}
                                </a>
                              </div>
                            )}
                          </Form.Group>
                        </div>
                      </div>
                      {/* <hr className="my-3" /> */}
                    </div>
                  </>
                )}
                {documentSet === "non_resident_other" ? null : (
                  <div className="row justify-content-center">
                    <div className="col-7 d-flex justify-content-center">
                      <button
                        type="submit"
                        className="defButton text-nowrap"
                        // onClick={handleSubmitUserDocuments}
                        disabled={loading_document}
                      >
                        {loading_document ? <Spinner /> : t("Save Documents")}
                      </button>
                    </div>
                  </div>
                )}
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        )}
        {documentSet !== "uae_resident" && (
          <Accordion.Item eventKey="1.3" className="shadow mb-2">
            <Accordion.Header> {t("Passport")}</Accordion.Header>
            <Accordion.Body>
              {/* <hr className="my-3" /> */}

              <Form
                noValidate
                validated={userDocumentValidated_3}
                onSubmit={handleSubmitUserDocuments_3}
              >
                {documentSet === "uae_resident" ? (
                  <></>
                ) : (
                  <div className="row">
                    <div className="col-lg-4 col-md-6 ">
                      <Form.Group controlId="passno">
                        <Form.Label className="text-nowrap">
                          {t("Passport")}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="passno"
                          placeholder={t("Passport Number")}
                          value={userDocumentData?.passno}
                          onChange={handleUserDocumentDataChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please provide passport number")}.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                    <div className="col-lg-4 col-md-6 margin-small-screen">
                      <Form.Group controlId="passIssueDate">
                        <Form.Label>{t("Issue Date")}</Form.Label>
                        <Form.Control
                          type="date"
                          name="passIssueDate"
                          // placeholder="Issue Date"
                          value={userDocumentData?.passIssueDate}
                          onChange={handleUserDocumentDataChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please provide the issue date")}.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                    <div className="col-lg-4 col-md-6 margin-small-screen">
                      <Form.Group controlId="passExpiry">
                        <Form.Label>{t("Expiry Date")}</Form.Label>
                        <Form.Control
                          type="date"
                          name="passExpiry"
                          // placeholder="Issue Date"
                          value={userDocumentData?.passExpiry}
                          onChange={handleUserDocumentDataChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please provide the expiry date")}.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                    <div className="w-100"></div>
                    <div className="col-4 mt-2">
                      <Form.Group controlId="passport-front">
                        {/* <Form.Label className="defButton">
                        Upload Now
                      </Form.Label> */}
                        <Form.Control
                          type="file"
                          name="passportFront"
                          onChange={handleUserDocumentDataChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please upload front of passport")}.
                        </Form.Control.Feedback>

                        {userDocumentData?.passportFront && (
                          <div className="mt-2-">
                            <a
                              href={
                                typeof userDocumentData.passportFront ===
                                "string"
                                  ? userDocumentData.passportFront // Use server URL if it's a string
                                  : URL?.createObjectURL(
                                      userDocumentData?.passportFront
                                    ) // Use createObjectURL for local file
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              {t("View Document")}
                            </a>
                          </div>
                        )}
                      </Form.Group>
                    </div>

                    {/* <div className="row">
                    <div className="col-4">
                      <p className="text-nowrap">
                        Passport - Back Page
                      </p>

                      <Form.Group controlId="passport-back">
                        <Form.Label className="defButton">
                          Upload Now
                        </Form.Label>
                        <Form.Control
                          type="file"
                          name="passportBack"
                          onChange={
                            handleUserDocumentDataChange
                          }
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Please upload back of passport.
                        </Form.Control.Feedback>

                        {userDocumentData?.passportBack && (
                          <div className="mt-2-">
                            <a
                              href={URL.createObjectURL(
                                userDocumentData?.passportBack
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              {" "}
                              View Document
                            </a>
                          </div>
                        )}
                      </Form.Group>
                    </div>
                  </div> */}
                  </div>
                )}
                {documentSet === "uae_resident" ? null : (
                  <div className="row justify-content-center">
                    <div className="col-7 d-flex justify-content-center">
                      <button
                        type="submit"
                        className="defButton text-nowrap"
                        // onClick={handleSubmitUserDocuments}
                        disabled={loading_document}
                      >
                        {loading_document ? <Spinner /> : t("Save Documents")}
                      </button>
                    </div>
                  </div>
                )}
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        )}

        {/* <hr className="my-3" /> */}

        {documentSet !== "uae_resident" &&
          documentSet !== "non_resident_gcc" && (
            <Accordion.Item eventKey="1.4" className="shadow mb-2">
              <Accordion.Header>{t("Entry Stamp")}</Accordion.Header>
              <Accordion.Body>
                <Form
                  noValidate
                  validated={userDocumentValidated_4}
                  onSubmit={handleSubmitUserDocuments_4}
                >
                  {documentSet !== "uae_resident" && (
                    <div className="row">
                      <div className="col-4">
                        <p className="text-nowrap">{t("Entry Stamp")}</p>

                        <Form.Group controlId="entry-stamp">
                          {/* <Form.Label className="defButton">
                          Upload Now
                        </Form.Label> */}
                          <Form.Control
                            type="file"
                            name="entryStamp"
                            onChange={handleUserDocumentDataChange}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {t("Please upload entry stamp")}.
                          </Form.Control.Feedback>

                          {userDocumentData?.entryStamp && (
                            <div className="mt-2-">
                              <a
                                href={
                                  typeof userDocumentData.entryStamp ===
                                  "string"
                                    ? userDocumentData.entryStamp // Use server URL if it's a string
                                    : URL?.createObjectURL(
                                        userDocumentData?.entryStamp
                                      ) // Use createObjectURL for local file
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                              >
                                {t("View Document")}
                              </a>
                            </div>
                          )}
                        </Form.Group>
                      </div>
                    </div>
                  )}

                  {documentSet !== "uae_resident" && (
                    <div className="row justify-content-center">
                      <div className="col-7 d-flex justify-content-center">
                        <button
                          type="submit"
                          className="defButton text-nowrap"
                          // onClick={handleSubmitUserDocuments}
                          disabled={loading_document}
                        >
                          {loading_document ? <Spinner /> : t("Save Documents")}
                        </button>
                      </div>
                    </div>
                  )}
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          )}

        {/* <hr className="my-3" /> */}

        {documentSet !== "uae_resident" && (
          <Accordion.Item eventKey="1.5" className="shadow mb-2">
            <Accordion.Header>
              {" "}
              {documentSet === "uae_resident"
                ? t("Home Country Driving License - Front")
                : documentSet === "non_resident_gcc"
                ? t("International Driving License/Permit")
                : t("International Driving License/Permit")}
            </Accordion.Header>
            <Accordion.Body>
              <Form
                noValidate
                validated={userDocumentValidated_5}
                onSubmit={handleSubmitUserDocuments_5}
              >
                <div className="row">
                  <div className="col-lg-4 col-md-6">
                    <Form.Group controlId="idno">
                      <Form.Label className="text-nowrap">
                        {documentSet === "uae_resident"
                          ? t("Home Country Driving License - Front")
                          : documentSet === "non_resident_gcc"
                          ? t("International Driving License/Permit")
                          : t("International Driving License/Permit")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="intlicno"
                        placeholder={t("License Number")}
                        value={userDocumentData?.intlicno}
                        onChange={handleUserDocumentDataChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {t("Please provide number")}.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-lg-4 col-md-6 margin-small-screen">
                    <Form.Group controlId="idno">
                      <Form.Label>{t("Issue Date")}</Form.Label>
                      <Form.Control
                        type="date"
                        name="intIssueDate"
                        value={userDocumentData?.intIssueDate}
                        onChange={handleUserDocumentDataChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {t("Please provide the issue date")}.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="col-lg-4 col-md-6 margin-small-screen">
                    <Form.Group controlId="idno">
                      <Form.Label>{t("Expiry Date")}</Form.Label>
                      <Form.Control
                        type="date"
                        name="intExpiry"
                        value={userDocumentData?.intExpiry}
                        onChange={handleUserDocumentDataChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {t("Please provide the expiry date")}.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                  <div className="w-100"></div>
                  <div className="col-4 mt-2">
                    <Form.Group controlId="permit">
                      {/* <Form.Label className="defButton">
                      Upload Now
                    </Form.Label> */}
                      <Form.Control
                        type="file"
                        name="permit"
                        onChange={handleUserDocumentDataChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {t("Please upload permit")}.
                      </Form.Control.Feedback>

                      {userDocumentData?.permit && (
                        <div className="mt-2-">
                          <a
                            href={
                              typeof userDocumentData.permit === "string"
                                ? userDocumentData.permit // Use server URL if it's a string
                                : URL?.createObjectURL(userDocumentData?.permit) // Use createObjectURL for local file
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            {t("View Document")}
                          </a>
                        </div>
                      )}
                    </Form.Group>
                  </div>
                </div>

                {documentSet === "uae_resident" && (
                  <div className="row">
                    <div className="col-4">
                      <p className="text-nowrap">
                        {t("Home Country Driving License - Back")}
                      </p>

                      <Form.Group controlId="entry-stamp">
                        {/* <Form.Label className="defButton">
                        Upload Now
                      </Form.Label> */}
                        <Form.Control
                          type="file"
                          name="entryStamp"
                          onChange={handleUserDocumentDataChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {t("Please upload driving license")}.
                        </Form.Control.Feedback>

                        {userDocumentData?.entryStamp && (
                          <div className="mt-2-">
                            <a
                              href={URL.createObjectURL(
                                userDocumentData?.entryStamp
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              {" "}
                              {t("View Document")}
                            </a>
                          </div>
                        )}
                      </Form.Group>
                    </div>
                  </div>
                )}

                <div className="row justify-content-center">
                  <div className="col-7 d-flex justify-content-center">
                    <button
                      type="submit"
                      className="defButton text-nowrap"
                      // onClick={handleSubmitUserDocuments}
                      disabled={loading_document}
                    >
                      {loading_document ? <Spinner /> : t("Save Documents")}
                    </button>
                  </div>
                </div>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        )}
        {/* <hr className="my-3" /> */}

        {documentSet !== "uae_resident" &&
          documentSet !== "non_resident_gcc" && (
            <Accordion.Item eventKey="1.6" className="shadow mb-2">
              <Accordion.Header>
                {" "}
                {t("Translation of DL Number")}
              </Accordion.Header>
              <Accordion.Body>
                <Form
                  noValidate
                  validated={userDocumentValidated_6}
                  onSubmit={handleSubmitUserDocuments_6}
                >
                  {/* ////////////////////////////////////////////////////////////////////// */}
                  {documentSet === "non_resident_other" && (
                    <>
                      <div className="row">
                        <div className="col-lg-4 col-md-6">
                          <Form.Group controlId="translation_dl_no">
                            <Form.Label>{t("Translation of DL")}</Form.Label>
                            <Form.Control
                              type="text"
                              name="translation_dl_no"
                              placeholder={t("License Number")}
                              value={userDocumentData?.translation_dl_no}
                              onChange={handleUserDocumentDataChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Please provide a license number")}.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="w-100"></div>
                        <div className="col-4 mt-2">
                          <Form.Group controlId="translation_dl">
                            {/* <Form.Label className="defButton">
                            Upload Now
                          </Form.Label> */}
                            <Form.Control
                              type="file"
                              name="translation_dl"
                              onChange={handleUserDocumentDataChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Please upload translation of DL")}.
                            </Form.Control.Feedback>

                            {userDocumentData?.translation_dl && (
                              <div className="mt-2-">
                                <a
                                  href={
                                    typeof userDocumentData.translation_dl ===
                                    "string"
                                      ? userDocumentData.translation_dl // Use server URL if it's a string
                                      : URL?.createObjectURL(
                                          userDocumentData?.translation_dl
                                        ) // Use createObjectURL for local file
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary"
                                >
                                  {t("View Document")}
                                </a>
                              </div>
                            )}
                          </Form.Group>
                        </div>
                      </div>{" "}
                    </>
                  )}
                  {documentSet === "non_resident_other" && (
                    <div className="row justify-content-center">
                      <div className="col-7 d-flex justify-content-center">
                        <button
                          type="submit"
                          className="defButton text-nowrap"
                          // onClick={handleSubmitUserDocuments}
                          disabled={loading_document}
                        >
                          {loading_document ? <Spinner /> : t("Save Documents")}
                        </button>
                      </div>
                    </div>
                  )}
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          )}
        {/* <hr className="my-3" /> */}

        {documentSet !== "uae_resident" &&
          documentSet !== "non_resident_gcc" && (
            <Accordion.Item eventKey="1.7" className="shadow mb-2">
              <Accordion.Header> {t("Tourist Visa")}</Accordion.Header>
              <Accordion.Body>
                <Form
                  noValidate
                  validated={userDocumentValidated_7}
                  onSubmit={handleSubmitUserDocuments_7}
                >
                  {documentSet === "non_resident_other" && (
                    <>
                      <div className="row">
                        <div className="col-4">
                          <p>{t("Tourist Visa")}</p>

                          <Form.Group controlId="touristVisa">
                            {/* <Form.Label className="defButton">
                            Upload Now
                          </Form.Label> */}
                            <Form.Control
                              type="file"
                              name="touristVisa"
                              onChange={handleUserDocumentDataChange}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {t("Please upload tourist visa")}.
                            </Form.Control.Feedback>
                            {userDocumentData?.touristVisa && (
                              <div className="mt-2-">
                                <a
                                  href={
                                    typeof userDocumentData.touristVisa ===
                                    "string"
                                      ? userDocumentData.touristVisa // Use server URL if it's a string
                                      : URL?.createObjectURL(
                                          userDocumentData?.touristVisa
                                        ) // Use createObjectURL for local file
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary"
                                >
                                  {t("View Document")}
                                </a>
                              </div>
                            )}
                          </Form.Group>
                        </div>
                      </div>
                    </>
                  )}

                  {documentSet === "non_resident_other" && (
                    <div className="row justify-content-center">
                      <div className="col-7 d-flex justify-content-center">
                        <button
                          type="submit"
                          className="defButton text-nowrap"
                          // onClick={handleSubmitUserDocuments}
                          disabled={loading_document}
                        >
                          {loading_document ? <Spinner /> : t("Save Documents")}
                        </button>
                      </div>
                    </div>
                  )}
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          )}
      </Accordion>
      {/* <hr className="my-3" /> */}
      <Form>
        {/* //////////////////////////////////////////////////////////////////////////////////////// */}
      </Form>
    </div>
  );
};

export default DriverDocuments;
