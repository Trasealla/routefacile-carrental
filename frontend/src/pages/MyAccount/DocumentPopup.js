import React, { useState, useEffect } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import { multipartPostCall } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { useTranslation } from "react-i18next";

const DocumentPopup = ({
  show,
  handleClose,
  docType,
  user_id,
  newDocFlag,
  getUserDocumentsList,
}) => {
  const [formData, setFormData] = useState({
    doc_type: "",
    idNumber: "",
    issueDate: "",
    expiryDate: "",
    frontImage: null,
    // backImage: null,
  });
  const { t } = useTranslation();

  // Reset validation and form when modal opens/closes
  useEffect(() => {
    if (show) {
      // Reset validation when modal opens
      setValidated(false);
      // Reset form data
      setFormData({
        doc_type: "",
        idNumber: "",
        issueDate: "",
        expiryDate: "",
        frontImage: null,
      });
    }
  }, [show]);
  const documentsTypes = [
    { value: "cities_id", label: "City ID" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
    { value: "entery_stamp", label: "Entery Stamp" },
    { value: "gcc_id", label: "GCC ID" },
    {
      value: "driving_license_home_country",
      label: "Home Country Driving License",
    },
    { value: "driving_license_gcc", label: "GCC Driving License" },
    {
      value: "international_driving_license",
      label: "International Driving License",
    },
    {
      value: "translation_of_driving_license",
      label: "Translation Of Driving License",
    },
    { value: "tourist_visa", label: "Tourist Visa" },
    { value: "other", label: "Other" },
  ];

  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handles both text and file inputs dynamically
  const handleChange = (e) => {
    const { name, type } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: e.target.value });
    }
  };
  const postUserDocuments = () => {
    return new Promise((resolve, reject) => {
      const formDataAPI = new FormData();
      formDataAPI.append("doc_type", newDocFlag ? formData.doc_type : docType);
      // formData.append("user_id", formData?.idNumber);
      // formData.append("expiry_date", userDocumentData?.expiry);
      formDataAPI.append("user_id", user_id);
      formDataAPI.append("front_image", formData?.frontImage);
      // formDataAPI.append("back_image", formData?.backImage);
      const url = configWeb.POST_USER_DOCUMENTS;
      setLoading(true);
      multipartPostCall(url, formDataAPI)
        .then((res) => {
          if (res?.status === "success") {
            getUserDocumentsList();
            notifySuccess(t("Updated successfully"));
            resolve(true);
            handleClose();
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
          setLoading(false);
        });
    });
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();

      // Handle API submission here
      postUserDocuments();
      // Close modal after successful submission
    }
    setValidated(true);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton dir="ltr">
        <Modal.Title>{t("Upload Document")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {newDocFlag && (
            <Form.Group className="mb-3">
              <Form.Label>{t("Document Type")}</Form.Label>
              <Form.Select
                required
                value={formData.doc_type}
                onChange={handleChange}
                name="doc_type"
              >
                <option value=""> {t("Select...")}</option>
                {documentsTypes?.map((item) => (
                  <option key={item.value} value={item.value}>
                    {" "}
                    {t(item.label)}{" "}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t("Please select a type")}.
              </Form.Control.Feedback>
            </Form.Group>
          )}
          {/* ID Number */}
          {/* <Form.Group className="mb-3">
            <Form.Label>ID Number</Form.Label>
            <Form.Control
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              required
              minLength="5"
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid ID number.
            </Form.Control.Feedback>
          </Form.Group> */}

          {/* Issue Date */}
          {/* <Form.Group className="mb-3">
            <Form.Label>Issue Date</Form.Label>
            <Form.Control
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please select an issue date.
            </Form.Control.Feedback>
          </Form.Group> */}

          {/* Expiry Date */}
          {/* <Form.Group className="mb-3">
            <Form.Label>Expiry Date</Form.Label>
            <Form.Control
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please select an expiry date.
            </Form.Control.Feedback>
          </Form.Group> */}

          {/* Front Image */}
          <Form.Group className="mb-3">
            <Form.Label>
              {t("Upload Document (upload jpg, png or pdf)")}
            </Form.Label>
            <Form.Control
              type="file"
              name="frontImage"
              accept=".pdf,image/*"
              onChange={handleChange}
              required
            />

            <Form.Control.Feedback type="invalid">
              {t("Please upload document")}.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Back Image */}
          {/* <Form.Group className="mb-3">
            <Form.Label>Back Image</Form.Label>
            <Form.Control
              type="file"
              name="backImage"
                accept=".pdf,image/*"
              onChange={handleChange}
              
            />
            <Form.Control.Feedback type="invalid">
              Please upload the back image.
            </Form.Control.Feedback>
          </Form.Group> */}

          <button
            type="submit"
            className="enquire-btn-chauffeur margin-bottom"
            disabled={loading}
          >
            {" "}
            {loading ? <Spinner /> : t("Submit")}
          </button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DocumentPopup;
