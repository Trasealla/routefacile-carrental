import React, { useState, useEffect, useRef } from "react";
import { Col, Dropdown, Form, Row, Spinner } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaFileExcel,
  FaDownload,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaTimes,
  FaInfoCircle,
  FaCarSide,
  FaRegCalendarCheck,
} from "react-icons/fa";
import { MdPriceChange } from "react-icons/md";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import configWeb from "../../../components/config.js/ConfigWeb";
import { multipartPostCall, simpleGetCallAuth } from "../../../components/config.js/Setup";
import Select from "react-select";
import * as XLSX from "xlsx";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import Monthly_Pricing_Master_Sample from "../../../assets/Files/Monthly_Pricing_Master_Sample.xlsx";

// Shared field styling so every control on the card lines up with the
// Upload Daily Pricing page.
const labelStyle = {
  fontWeight: 600,
  fontSize: "0.88rem",
  color: "#2d3748",
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 8,
};

const controlStyle = (hasValue) => ({
  height: 48,
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  fontSize: "0.9rem",
  paddingLeft: 16,
  color: hasValue ? "#1a202c" : "#a0aec0",
  background: "#fafbfc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  transition: "border-color .2s, box-shadow .2s",
});

const Uploadmonthlypricing = () => {
  const { t } = useTranslation();
  const [citiesArray, setCitiesArray] = useState([]);
  const handleCityChange = (selectedOptions) => {
    setCityError(!selectedOptions);
    setCity(selectedOptions);
  };

  const [formData, setFormData] = useState({
    year: "",
    vehicle_model_year: "",
    city: [],
    excel_file: "",
    start_date: "",
    end_date: "",
  });
  const [city, setCity] = useState([]);
  const [dateError, setDateError] = useState("");

  const vehicleModelYears = [
    { value: 2020, name: "2020" },
    { value: 2021, name: "2021" },
    { value: 2022, name: "2022" },
    { value: 2023, name: "2023" },
    { value: 2024, name: "2024" },
    { value: 2025, name: "2025" },
    { value: 2026, name: "2026" },
  ];

  const [cityError, setCityError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const fileInputRef = useRef(null);

  const years = [
    { value: 2021, name: "2021" },
    { value: 2022, name: "2022" },
    { value: 2023, name: "2023" },
    { value: 2024, name: "2024" },
    { value: 2025, name: "2025" },
    { value: 2026, name: "2026" },
    { value: 2027, name: "2027" },
    { value: 2028, name: "2028" },
    { value: 2029, name: "2029" },
    { value: 2030, name: "2030" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target || {};
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prevData) => ({ ...prevData, [name]: file }));
    }
  };

  const handleSampleDownload = (type) => {
    if (type === "simple") {
      // Must be a real .xlsx — the upload endpoint's fileFilter only accepts
      // Excel mime types, so a .csv template downloaded here was rejected on upload.
      const ws = XLSX.utils.aoa_to_sheet([["CAR GROUP", "AMOUNT"]]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, "Monthly_Pricing_Simple_Template.xlsx");
    } else {
      const file = Monthly_Pricing_Master_Sample;
      const link = document.createElement("a");
      link.href = file;
      link.download = "Monthly_Pricing_Master_Sample.xlsx";
      link.click();
    }
  };

  const validateDates = () => {
    const { start_date, end_date } = formData;
    if (start_date && !end_date) {
      return t("monthlyPricing.endDateRequired");
    }
    if (!start_date && end_date) {
      return t("monthlyPricing.startDateRequired");
    }
    if (start_date && end_date && end_date < start_date) {
      return t("monthlyPricing.endAfterStart");
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const dateValidationError = validateDates();
    setDateError(dateValidationError);

    if (form.checkValidity() === false || city.length === 0 || dateValidationError) {
      e.stopPropagation();
      setValidated(true);
      setCityError(city.length === 0);
    } else {
      setCityError(false);
      setDateError("");
      handleFormSubmit();
      setValidated(false);
    }
  };

  const citiesData = () => {
    const url = configWeb.GET_CITIES;
    simpleGetCallAuth(url)
      .then((res) => {
        setCitiesArray(res?.data || []);
      })
      .catch((errr) => {
        console.log("errr", errr);
      });
  };

  useEffect(() => {
    citiesData();
  }, []);

  const [mappedCitiesArray, setMappedCitiesArray] = useState([]);
  useEffect(() => {
    if (citiesArray?.length > 0) {
      const citiesArrayTemp = citiesArray?.map((c) => ({
        value: c.id,
        label: c.name_en,
      }));
      setMappedCitiesArray(citiesArrayTemp);
    }
  }, [citiesArray]);

  const handleFormSubmit = () => {
    return new Promise((resolve) => {
      const appendFormData = new FormData();
      appendFormData.append("year", formData?.year);
      // Backend RateMonthlyDto expects `model_year` — sending `vehicle_model_year`
      // meant the dropdown was silently ignored and the value only ever came from
      // the Excel "Model Year" column.
      if (formData?.vehicle_model_year) {
        appendFormData.append("model_year", formData.vehicle_model_year);
      }
      appendFormData.append("file", formData?.excel_file);
      appendFormData.append("city_ids", city?.map((item) => item.value));

      if (formData.start_date) {
        appendFormData.append("start_date", formData.start_date);
      }
      if (formData.end_date) {
        appendFormData.append("end_date", formData.end_date);
      }

      const url = configWeb.POST_MONTHLY_PRICE;
      setLoading(true);
      multipartPostCall(url, appendFormData)
        .then((res) => {
          if (res?.status === true) {
            notifySuccess(t("monthlyPricing.uploadSuccess"));
            resolve(true);
            setFormData({
              year: "",
              vehicle_model_year: "",
              city: [],
              excel_file: "",
              start_date: "",
              end_date: "",
            });
            setCity([]);
            setDateError("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else {
            if (Array.isArray(res?.message)) {
              notifyError(res?.message[0]);
            } else {
              notifyError(res?.message);
            }
            resolve(false);
          }
        })
        .catch((error) => {
          console.error("Monthly pricing upload failed:", error);
          notifyError("Something went wrong. Please try again later.");
          resolve(false);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  return (
    <div className="rf-list-page">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <MdPriceChange size={26} style={{ color: "var(--rf-orange)", marginRight: 8 }} />
            {t("monthlyPricing.title")}
          </h2>
          <p style={{ margin: "4px 0 0 14px", color: "#8492a6", fontSize: "0.85rem", fontWeight: 500 }}>
            {t("monthlyPricing.subtitle")}
          </p>
        </div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: "0.82rem" }}>
            <li className="breadcrumb-item">
              <Link to="/dashboard" style={{ color: "var(--rf-orange)", textDecoration: "none" }}>{t("nav.Dashboard")}</Link>
            </li>
            <li className="breadcrumb-item"><span style={{ color: "#8492a6" }}>{t("nav.Pricing")}</span></li>
            <li className="breadcrumb-item active" style={{ color: "#1a202c" }}>{t("monthlyPricing.title")}</li>
          </ol>
        </nav>
      </div>

      {/* ── Info Banner ───────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "linear-gradient(135deg, rgba(218,40,38,0.06) 0%, rgba(13,27,42,0.04) 100%)",
        border: "1px solid rgba(218,40,38,0.18)",
        borderRadius: 14, padding: "14px 20px", marginBottom: 24,
      }}>
        <FaInfoCircle size={18} style={{ color: "var(--rf-orange)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#2d3748", fontWeight: 600 }}>{t("monthlyPricing.howToTitle")}</p>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#718096", lineHeight: 1.6 }}>
            {t("monthlyPricing.howToBody")}
          </p>
        </div>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px rgba(13,27,42,0.07)" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg, var(--rf-orange) 0%, #da2826 100%)", borderRadius: "18px 18px 0 0" }} />

        <div style={{ padding: "clamp(20px, 4vw, 36px)" }}>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>

            {/* ── Row 1: Year + Model Year ────────────────────────── */}
            <Row className="mb-4">
              <Col xs={12} md={6} lg={5} xl={4} className="mb-4 mb-md-0">
                <Form.Group controlId="year">
                  <Form.Label style={labelStyle}>
                    <FaCalendarAlt size={14} style={{ color: "var(--rf-orange)" }} />
                    {t("monthlyPricing.year")} <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                  </Form.Label>
                  <Form.Select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    style={controlStyle(formData.year)}
                  >
                    <option value="">{t("monthlyPricing.selectYear")}</option>
                    {years?.map((year) => (
                      <option key={year.value} value={year.value}>{year.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{t("monthlyPricing.yearRequired")}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg={5} xl={4}>
                <Form.Group controlId="vehicle_model_year">
                  <Form.Label style={labelStyle}>
                    <FaCarSide size={14} style={{ color: "var(--rf-orange)" }} />
                    {t("monthlyPricing.modelYear")}
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#a0aec0", fontWeight: 400 }}>Optional</span>
                  </Form.Label>
                  <Form.Select
                    name="vehicle_model_year"
                    value={formData.vehicle_model_year}
                    onChange={handleChange}
                    style={controlStyle(formData.vehicle_model_year)}
                  >
                    <option value="">{t("monthlyPricing.selectModelYear")}</option>
                    {vehicleModelYears?.map((modelYear) => (
                      <option key={modelYear.value} value={modelYear.value}>{modelYear.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* ── Row 2: City ─────────────────────────────────────── */}
            <Row className="mb-4">
              <Col xs={12} md={10} lg={7} xl={6}>
                <Form.Group controlId="city">
                  <Form.Label style={labelStyle}>
                    <FaMapMarkerAlt size={14} style={{ color: "var(--rf-orange)" }} />
                    {t("monthlyPricing.city")} <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#a0aec0", fontWeight: 400 }}>{t("monthlyPricing.multiSelect")}</span>
                  </Form.Label>
                  <Select
                    value={city}
                    isMulti
                    name="city"
                    options={mappedCitiesArray}
                    isSearchable
                    className="basic-multi-select"
                    onChange={handleCityChange}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: 48, borderRadius: 12,
                        border: `1.5px solid ${cityError ? "#e53e3e" : state.isFocused ? "var(--rf-orange)" : "#e2e8f0"}`,
                        boxShadow: state.isFocused ? "0 0 0 3px rgba(218,40,38,.12)" : "0 1px 3px rgba(0,0,0,0.05)",
                        background: "#fafbfc", fontSize: "0.9rem",
                        "&:hover": { borderColor: "var(--rf-orange)" },
                      }),
                      multiValue: (base) => ({ ...base, borderRadius: 8, background: "rgba(218,40,38,0.08)", border: "1px solid rgba(218,40,38,0.2)" }),
                      multiValueLabel: (base) => ({ ...base, color: "#b81f1d", fontWeight: 600, fontSize: "0.8rem" }),
                      multiValueRemove: (base) => ({ ...base, color: "#b81f1d", "&:hover": { background: "rgba(218,40,38,0.2)", color: "#c53030", borderRadius: "0 8px 8px 0" } }),
                      option: (base, state) => ({ ...base, background: state.isSelected ? "var(--rf-orange)" : state.isFocused ? "rgba(218,40,38,0.07)" : "#fff", color: state.isSelected ? "#fff" : "#2d3748", borderRadius: 8, margin: "2px 4px", width: "calc(100% - 8px)" }),
                      menu: (base) => ({ ...base, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", zIndex: 9999 }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                  {cityError && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#e53e3e", fontSize: "0.8rem", marginTop: 5 }}>
                      <FaTimes size={11} /> {t("monthlyPricing.cityRequired")}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* ── Row 3: Date range (optional) ────────────────────── */}
            <Row className="mb-4">
              <Col xs={12} md={10} lg={7} xl={6}>
                <Form.Label style={labelStyle}>
                  <FaRegCalendarCheck size={14} style={{ color: "var(--rf-orange)" }} />
                  {t("monthlyPricing.validityPeriod")}
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#a0aec0", fontWeight: 400 }}>Optional</span>
                </Form.Label>

                <div style={{
                  border: `1.5px solid ${dateError ? "#e53e3e" : "#e2e8f0"}`,
                  borderRadius: 12, padding: 16, background: "#fafbfc",
                }}>
                  <Row>
                    <Col xs={12} sm={6} className="mb-3 mb-sm-0">
                      <Form.Group controlId="start_date">
                        <Form.Label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#718096", marginBottom: 6 }}>
                          {t("monthlyPricing.startDate")}
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          onMouseDown={(e) => e.target.showPicker?.()}
                          style={{ ...controlStyle(formData.start_date), background: "#fff" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group controlId="end_date">
                        <Form.Label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#718096", marginBottom: 6 }}>
                          {t("monthlyPricing.endDate")}
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          onMouseDown={(e) => e.target.showPicker?.()}
                          min={formData.start_date || undefined}
                          style={{ ...controlStyle(formData.end_date), background: "#fff" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <p style={{ margin: "12px 0 0", fontSize: "0.78rem", color: "#718096", lineHeight: 1.6 }}>
                    {t("monthlyPricing.datesHint")}
                  </p>
                </div>

                {dateError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#e53e3e", fontSize: "0.8rem", marginTop: 6 }}>
                    <FaTimes size={11} /> {dateError}
                  </div>
                )}
              </Col>
            </Row>

            {/* ── Row 4: File Upload ──────────────────────────────── */}
            <Row className="mb-4">
              <Col xs={12} lg={11} xl={9}>
                <Form.Label style={labelStyle}>
                  <FaFileExcel size={14} style={{ color: "#16a34a" }} />
                  {t("monthlyPricing.uploadExcel")} <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                </Form.Label>
                <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
                    <label htmlFor="excel_file_input" style={{
                      display: "flex", alignItems: "center", gap: 12,
                      border: `2px dashed ${formData.excel_file ? "#16a34a" : "#e2e8f0"}`,
                      borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                      background: formData.excel_file ? "rgba(22,163,74,0.04)" : "#fafbfc",
                      transition: "all .2s", minHeight: 52,
                    }}>
                      {formData.excel_file ? (
                        <>
                          <FaCheckCircle size={20} style={{ color: "#16a34a", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {formData.excel_file?.name || t("monthlyPricing.fileSelected")}
                          </span>
                        </>
                      ) : (
                        <>
                          <FaCloudUploadAlt size={22} style={{ color: "#a0aec0", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.85rem", color: "#a0aec0" }}>{t("monthlyPricing.chooseFile")}</span>
                        </>
                      )}
                    </label>
                    <Form.Control
                      id="excel_file_input"
                      ref={fileInputRef}
                      type="file"
                      name="excel_file"
                      onChange={handleFileChange}
                      required
                      accept=".xlsx,.xls"
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                    />
                    <Form.Control.Feedback type="invalid">{t("monthlyPricing.fileRequired")}</Form.Control.Feedback>
                  </div>

                  {/* Sample Download — two templates */}
                  <Dropdown>
                    <Dropdown.Toggle
                      as="button"
                      type="button"
                      className="monthly-sample-toggle"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "0 22px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                        background: "#fff", color: "#2d3748", fontWeight: 600, fontSize: "0.875rem",
                        cursor: "pointer", whiteSpace: "nowrap", height: 52,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        transition: "border-color .2s, color .2s",
                      }}
                    >
                      <FaDownload size={14} style={{ color: "#16a34a" }} />
                      {t("monthlyPricing.sampleDownload")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 6, minWidth: 260 }}>
                      <Dropdown.Item onClick={() => handleSampleDownload("simple")} style={{ borderRadius: 8, padding: "10px 12px", fontSize: "0.85rem" }}>
                        <strong style={{ display: "block", color: "#2d3748" }}>{t("monthlyPricing.simpleTemplate")}</strong>
                        <span style={{ fontSize: "0.76rem", color: "#a0aec0" }}>{t("monthlyPricing.simpleTemplateHint")}</span>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleSampleDownload("full")} style={{ borderRadius: 8, padding: "10px 12px", fontSize: "0.85rem" }}>
                        <strong style={{ display: "block", color: "#2d3748" }}>{t("monthlyPricing.fullTemplate")}</strong>
                        <span style={{ fontSize: "0.76rem", color: "#a0aec0" }}>{t("monthlyPricing.fullTemplateHint")}</span>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                {formData.excel_file && (
                  <p style={{ margin: "6px 0 0 4px", fontSize: "0.78rem", color: "#718096" }}>
                    {t("monthlyPricing.acceptedFormats")}
                  </p>
                )}
              </Col>
            </Row>

            {/* ── Divider ─────────────────────────────────────────── */}
            <div style={{ height: 1, background: "#f0f2f5", margin: "4px 0 28px" }} />

            {/* ── Submit ──────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "0 32px", height: 50, borderRadius: 12, border: "none",
                  background: loading ? "#e2e8f0" : "linear-gradient(135deg, var(--rf-orange) 0%, #b81f1d 100%)",
                  color: loading ? "#a0aec0" : "#fff", fontWeight: 700, fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 6px 18px rgba(218,40,38,0.35)",
                  transition: "all .2s",
                }}
              >
                {loading ? (
                  <><Spinner size="sm" animation="border" /> {t("monthlyPricing.uploading")}</>
                ) : (
                  <><FaCloudUploadAlt size={16} /> {t("monthlyPricing.uploadPricing")}</>
                )}
              </button>
              <span style={{ fontSize: "0.8rem", color: "#a0aec0" }}>
                {t("monthlyPricing.requiredNote")} <span style={{ color: "#e53e3e" }}>*</span>
              </span>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default Uploadmonthlypricing;
