import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Card, CardBody } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import CKEditorComponent from "../../../../components/CKEditor/CKEditor";
import configWeb from "../../../../components/config.js/ConfigWeb";
import {
  simplePostCallAuth,
  simplePutCallAuth,
  simpleGetCallAuth,
} from "../../../../components/config.js/Setup";
import {
  notifyError,
  notifySuccess,
} from "../../../../components/notify/notify";
import { FaBriefcase, FaArrowLeft } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./career.css";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const CreateCareerJob = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [editLoading, setEditLoading] = useState(id ? true : false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: "",
    title_en: "",
    title_ar: "",
    description_en: "",
    description_ar: "",
    location_en: "",
    location_ar: "",
    experience_years: "",
    expiry_date: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleEditorChange = (name, content) => {
    setFormData((prevData) => ({ ...prevData, [name]: content }));
    if (content) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (
        (!formData[key] && formData[key] !== "0") ||
        (Array.isArray(formData[key]) && formData[key].length === 0)
      ) {
        newErrors[key] = t("This field is required");
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formSubmitFunction = () => {
    const body = JSON.stringify({
      title_en: formData.title_en,
      title_ar: formData.title_ar,
      description_en: formData.description_en,
      description_ar: formData.description_ar,
      location_en: formData.location_en,
      location_ar: formData.location_ar,
      experience_years: Number(formData.experience_years),
      expiry_date: formData.expiry_date,
      status: Number(formData.status),
    });

    const url = id
      ? configWeb.PUT_CAREER_JOB_UPDATE(id)
      : configWeb.POST_CAREER_JOB_CREATE;
    const apiCall = id ? simplePutCallAuth : simplePostCallAuth;

    setLoading(true);
    apiCall(url, body)
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(id ? t("Updated Successfully") : t("Created Successfully"));
          navigate("/career/jobs");
        } else {
          if (Array.isArray(res?.message)) {
            notifyError(res?.message[0]);
          } else {
            notifyError(res?.message || t("Something went wrong"));
          }
        }
      })
      .catch(() => {
        notifyError(t("Something went wrong. Please try again later."));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    formSubmitFunction();
  };

  const getDetails = () => {
    const url = configWeb.GET_CAREER_JOB_DETAILS(id);
    simpleGetCallAuth(url)
      .then((res) => {
        if (res && !res.error) {
          setFormData((prevData) => ({
            ...prevData,
            status: res?.status != null ? String(res.status) : "",
            title_en: res?.title_en || "",
            title_ar: res?.title_ar || "",
            description_en: res?.description_en || "",
            description_ar: res?.description_ar || "",
            location_en: res?.location_en || "",
            location_ar: res?.location_ar || "",
            experience_years:
              res?.experience_years != null
                ? String(res.experience_years)
                : "",
            expiry_date: res?.expiry_date || "",
          }));
        } else if (res?.error) {
          notifyError(res?.message?.[0] || t("Failed to load details"));
        }
      })
      .catch(() => {
        notifyError(t("Something went wrong. Please try again later."));
      })
      .finally(() => {
        setEditLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);

  return (
    <div className="career-module">
      {/* Header */}
      <motion.div
        className="career-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <div className="career-header-icon me-3">
                <FaBriefcase />
              </div>
              <div>
                <h4 className="career-header-title">
                  {id ? t("Edit Job Listing") : t("Create New Job")}
                </h4>
                <p className="career-header-subtitle">
                  {id
                    ? t("Update job details and save changes")
                    : t("Fill in the details below to publish a new career opening")}
                </p>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            <Link to="/career/jobs">
              <motion.button
                className="career-btn-primary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaArrowLeft size={13} /> {t("Back to Jobs")}
              </motion.button>
            </Link>
          </Col>
        </Row>
      </motion.div>

      {editLoading ? (
        <div className="career-loading">
          <Spinner animation="border" />
        </div>
      ) : (
        <motion.div
          className="px-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="career-form-card">
            <Form onSubmit={handleSubmit}>
              {/* Section: Basic Info */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <h6
                  className="fw-bold text-uppercase mb-3"
                  style={{ color: "#2563eb", fontSize: "0.75rem", letterSpacing: "1px" }}
                >
                  {t("Basic Information")}
                </h6>
                <Row>
                  <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Status")}</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData?.status}
                        onChange={handleChange}
                      >
                        <option value="">{t("Select Status")}</option>
                        <option value="1">{t("Active")}</option>
                        <option value="0">{t("Inactive")}</option>
                      </Form.Select>
                      {errors.status && (
                        <span className="custom_error">{errors.status}</span>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Experience (Years)")}</Form.Label>
                      <Form.Control
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleChange}
                        min="0"
                        placeholder={t("e.g. 3")}
                      />
                      {errors.experience_years && (
                        <span className="custom_error">{errors.experience_years}</span>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Expiry Date")}</Form.Label>
                      <Form.Control
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                        onMouseDown={(e) => e.target.showPicker()}
                      />
                      {errors.expiry_date && (
                        <span className="custom_error">{errors.expiry_date}</span>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </motion.div>

              <hr className="my-2" style={{ borderColor: "#e2e8f0" }} />

              {/* Section: Title & Location */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                <h6
                  className="fw-bold text-uppercase mb-3 mt-3"
                  style={{ color: "#2563eb", fontSize: "0.75rem", letterSpacing: "1px" }}
                >
                  {t("Title & Location")}
                </h6>
                <Row>
                  <Col sm={12} md={6} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Title (English)")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="title_en"
                        value={formData.title_en}
                        onChange={handleChange}
                        placeholder={t("Enter Job Title in English")}
                      />
                      {errors.title_en && (
                        <span className="custom_error">{errors.title_en}</span>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={6} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Title (Arabic)")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="title_ar"
                        value={formData.title_ar}
                        onChange={handleChange}
                        dir="rtl"
                        placeholder="العنوان بالعربية"
                      />
                      {errors.title_ar && (
                        <span className="custom_error">{errors.title_ar}</span>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={6} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Location (English)")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="location_en"
                        value={formData.location_en}
                        onChange={handleChange}
                        placeholder={t("e.g. Casablanca, Morocco")}
                      />
                      {errors.location_en && (
                        <span className="custom_error">{errors.location_en}</span>
                      )}
                    </Form.Group>
                  </Col>
                  <Col sm={12} md={6} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Location (Arabic)")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="location_ar"
                        value={formData.location_ar}
                        onChange={handleChange}
                        dir="rtl"
                        placeholder="الموقع بالعربية"
                      />
                      {errors.location_ar && (
                        <span className="custom_error">{errors.location_ar}</span>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </motion.div>

              <hr className="my-2" style={{ borderColor: "#e2e8f0" }} />

              {/* Section: Descriptions */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                <h6
                  className="fw-bold text-uppercase mb-3 mt-3"
                  style={{ color: "#2563eb", fontSize: "0.75rem", letterSpacing: "1px" }}
                >
                  {t("Job Description")}
                </h6>
                <Row>
                  <Col xs={12} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Description (English)")}</Form.Label>
                      <CKEditorComponent
                        language="en"
                        onContentChange={(content) =>
                          handleEditorChange("description_en", content)
                        }
                        contentW={formData?.description_en}
                      />
                      {errors.description_en && (
                        <span className="custom_error">{errors.description_en}</span>
                      )}
                    </Form.Group>
                  </Col>
                  <Col xs={12} className="mb-4">
                    <Form.Group>
                      <Form.Label>{t("Description (Arabic)")}</Form.Label>
                      <CKEditorComponent
                        language="en"
                        onContentChange={(content) =>
                          handleEditorChange("description_ar", content)
                        }
                        contentW={formData?.description_ar}
                      />
                      {errors.description_ar && (
                        <span className="custom_error">{errors.description_ar}</span>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <motion.button
                  type="submit"
                  className="career-btn-primary mt-2"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ padding: "0.75rem 2.5rem", fontSize: "0.95rem" }}
                >
                  {loading ? (
                    <Spinner size="sm" />
                  ) : id ? (
                    t("Update Job")
                  ) : (
                    t("Publish Job")
                  )}
                </motion.button>
              </motion.div>
            </Form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateCareerJob;
