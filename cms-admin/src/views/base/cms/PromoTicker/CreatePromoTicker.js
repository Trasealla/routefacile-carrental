import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Spinner,
  Card,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave, FaClock, FaPen, FaFileAlt, FaCog, FaTachometerAlt } from "react-icons/fa";
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
import { useTranslation } from "react-i18next";
import "./PromoTicker.css";

const CreatePromoTicker = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [editLoading, setEditLoading] = useState(!!id);
  const [loading, setLoading] = useState(false);

  const SPEED_OPTIONS = [
    { value: 45, label: t("Very Slow"), desc: t("Gentle, leisurely scroll") },
    { value: 30, label: t("Slow"), desc: t("Relaxed, easy to read") },
    { value: 20, label: t("Medium"), desc: t("Balanced pace") },
    { value: 12, label: t("Fast"), desc: t("Quick and attention-grabbing") },
    { value: 7, label: t("Very Fast"), desc: t("Rapid scrolling") },
  ];

  const [formData, setFormData] = useState({
    text_en: "",
    text_ar: "",
    description_en: "",
    description_ar: "",
    link: "",
    status: "1",
    sort_order: 1,
    scroll_speed: 20,
    start_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState({});

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setStatus = (val) =>
    setFormData((prev) => ({ ...prev, status: val }));

  /* ---------- validation ---------- */
  const validateForm = () => {
    const errs = {};

    if (!formData.text_en?.trim())
      errs.text_en = t("English text is required");
    else if (formData.text_en.length > 255)
      errs.text_en = t("Must be under 255 characters");

    if (!formData.text_ar?.trim())
      errs.text_ar = t("Arabic text is required");
    else if (formData.text_ar.length > 255)
      errs.text_ar = t("Must be under 255 characters");

    if (!formData.start_date) errs.start_date = t("Start date is required");
    if (!formData.end_date) errs.end_date = t("End date is required");

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date))
        errs.end_date = t("End date must be on or after start date");
    }

    if (!["0", "1", 0, 1].includes(formData.status))
      errs.status = t("Status is required");

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ---------- submit ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      text_en: formData.text_en,
      text_ar: formData.text_ar,
      description_en: formData.description_en || null,
      description_ar: formData.description_ar || null,
      link: formData.link || null,
      status: parseInt(formData.status),
      sort_order: parseInt(formData.sort_order) || 1,
      scroll_speed: parseInt(formData.scroll_speed) || 20,
      start_date: formData.start_date,
      end_date: formData.end_date,
    };

    const url = id
      ? configWeb.PUT_PROMO_TICKER_UPDATE(id)
      : configWeb.POST_PROMO_TICKER_CREATE;
    const apiCall = id ? simplePutCallAuth : simplePostCallAuth;

    setLoading(true);
    apiCall(url, JSON.stringify(payload))
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(id ? t("Ticker updated") : t("Ticker created"));
          navigate("/cms/promo-ticker");
        } else {
          notifyError(
            Array.isArray(res?.message)
              ? res.message[0]
              : res?.message || t("Something went wrong")
          );
        }
      })
      .catch(() => notifyError(t("Something went wrong. Please try again later.")))
      .finally(() => setLoading(false));
  };

  /* ---------- fetch details (edit) ---------- */
  useEffect(() => {
    if (!id) return;
    simpleGetCallAuth(configWeb.GET_PROMO_TICKER_DETAILS(id))
      .then((res) => {
        if (res && !res.error) {
          setFormData({
            text_en: res.text_en || "",
            text_ar: res.text_ar || "",
            description_en: res.description_en || "",
            description_ar: res.description_ar || "",
            link: res.link || "",
            status: String(res.status ?? 1),
            sort_order: res.sort_order || 1,
            scroll_speed: res.scroll_speed || 20,
            start_date: res.start_date || "",
            end_date: res.end_date || "",
          });
        } else {
          notifyError(res?.message?.[0] || t("Failed to load details"));
        }
      })
      .catch(() => notifyError(t("Something went wrong. Please try again later.")))
      .finally(() => setEditLoading(false));
  }, [id]);

  /* ---------- helpers ---------- */
  const charCountClass = (cur, max) => {
    const pct = (cur / max) * 100;
    if (pct >= 100) return "danger";
    if (pct >= 80) return "warning";
    return "";
  };

  const durationDays = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return null;
    const s = new Date(formData.start_date);
    const e = new Date(formData.end_date);
    if (e < s) return null;
    return Math.round((e - s) / 86400000) + 1;
  }, [formData.start_date, formData.end_date]);

  /* ======================= RENDER ======================= */
  return (
    <Container fluid className="px-lg-4 pb-5 promo-ticker-form">
      {/* -------- Page Header -------- */}
      <div className="promo-ticker-page-header d-flex flex-wrap align-items-center justify-content-between mt-3">
        <div>
          <h4>{id ? t("Edit") : t("Create")} {t("Promo Ticker")}</h4>
          <p>
            {id
              ? t("Update the promotional ticker details below")
              : t("Add a new promotional scrolling banner message")}
          </p>
        </div>
        <Link to="/cms/promo-ticker">
          <button className="btn-add-ticker">
            <FaArrowLeft /> {t("Back to List")}
          </button>
        </Link>
      </div>

      {editLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">{t("Loading ticker details…")}</p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          {/* ======== Promotional Text ======== */}
          <Card className="section-card">
            <Card.Header>
              <h6>
                <FaPen className="text-primary" /> {t("Promotional Text")}
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={12} md={6} className="mb-4">
                  <Form.Group>
                    <Form.Label className="required">{t("Text (English)")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="text_en"
                      placeholder={t("e.g., Premium Fleet Now Available — Book Today!")}
                      value={formData.text_en}
                      onChange={handleChange}
                      isInvalid={!!errors.text_en}
                      maxLength={255}
                    />
                    <div
                      className={`char-count ${charCountClass(
                        formData.text_en.length,
                        255
                      )}`}
                    >
                      {formData.text_en.length} / 255
                    </div>
                    {errors.text_en && (
                      <span className="validation-error">{errors.text_en}</span>
                    )}
                  </Form.Group>
                </Col>

                <Col sm={12} md={6} className="mb-4">
                  <Form.Group>
                    <Form.Label className="required">{t("Text (Arabic)")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="text_ar"
                      placeholder="أدخل النص العربي هنا"
                      value={formData.text_ar}
                      onChange={handleChange}
                      isInvalid={!!errors.text_ar}
                      maxLength={255}
                      className="arabic-input"
                      dir="rtl"
                    />
                    <div
                      className={`char-count ${charCountClass(
                        formData.text_ar.length,
                        255
                      )}`}
                    >
                      {formData.text_ar.length} / 255
                    </div>
                    {errors.text_ar && (
                      <span className="validation-error">{errors.text_ar}</span>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Live Preview */}
              {(formData.text_en || formData.text_ar) && (
                <div className="preview-section">
                  <div className="preview-header">
                    <span>{t("Live Preview (English)")}</span>
                    <span>
                      <FaTachometerAlt className="me-1" />
                      {SPEED_OPTIONS.find(s => s.value === Number(formData.scroll_speed))?.label || t("Medium")}
                    </span>
                  </div>
                  <div className="preview-track">
                    <span
                      className="ticker-preview"
                      style={{ animationDuration: `${formData.scroll_speed}s` }}
                    >
                      {formData.text_en || t("Enter English text above…")}
                    </span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ======== Description (Optional) ======== */}
          <Card className="section-card">
            <Card.Header>
              <h6>
                <FaFileAlt className="text-secondary" /> {t("Description")}{" "}
                <span
                  className="fw-normal text-muted"
                  style={{ fontSize: "0.8rem" }}
                >
                  ({t("Optional")})
                </span>
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={12} md={6} className="mb-4">
                  <Form.Group>
                    <Form.Label>{t("Description (English)")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description_en"
                      placeholder={t("Additional context or tooltip text")}
                      value={formData.description_en}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col sm={12} md={6} className="mb-4">
                  <Form.Group>
                    <Form.Label>{t("Description (Arabic)")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description_ar"
                      placeholder="اختياري: أضف المزيد من التفاصيل"
                      value={formData.description_ar}
                      onChange={handleChange}
                      className="arabic-input"
                      dir="rtl"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ======== Settings ======== */}
          <Card className="section-card">
            <Card.Header>
              <h6>
                <FaCog className="text-muted" /> {t("Settings")}
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Link */}
                <Col sm={12} md={6} lg={4} className="mb-4">
                  <Form.Group>
                    <Form.Label>{t("Link (Optional)")}</Form.Label>
                    <Form.Control
                      type="text"
                      name="link"
                      placeholder={t("e.g., /offers or https://...")}
                      value={formData.link}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      {t("URL the text links to when clicked")}
                    </Form.Text>
                  </Form.Group>
                </Col>

                {/* Start Date */}
                <Col sm={12} md={6} lg={4} className="mb-4">
                  <Form.Group>
                    <Form.Label className="required">{t("Start Date")}</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      onMouseDown={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                      isInvalid={!!errors.start_date}
                    />
                    {errors.start_date && (
                      <span className="validation-error">
                        {errors.start_date}
                      </span>
                    )}
                  </Form.Group>
                </Col>

                {/* End Date */}
                <Col sm={12} md={6} lg={4} className="mb-4">
                  <Form.Group>
                    <Form.Label className="required">{t("End Date")}</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      onMouseDown={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                      isInvalid={!!errors.end_date}
                      min={formData.start_date}
                    />
                    {errors.end_date && (
                      <span className="validation-error">
                        {errors.end_date}
                      </span>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Duration info */}
              {durationDays && (
                <div className="mb-4">
                  <span className="duration-info">
                    <FaClock size={12} />
                    {t("{{days}} day(s) duration", { days: durationDays })}
                  </span>
                </div>
              )}

              <Row>
                {/* Sort Order */}
                <Col sm={12} md={6} lg={4} className="mb-4">
                  <Form.Group>
                    <Form.Label>{t("Sort Order")}</Form.Label>
                    <Form.Control
                      type="number"
                      name="sort_order"
                      min={0}
                      value={formData.sort_order}
                      onChange={handleChange}
                      placeholder="1"
                    />
                    <Form.Text className="text-muted">
                      {t("Lower number appears first in the scrolling bar")}
                    </Form.Text>
                  </Form.Group>
                </Col>

                {/* Scroll Speed */}
                <Col sm={12} md={6} lg={4} className="mb-4">
                  <Form.Group>
                    <Form.Label>
                      <FaTachometerAlt className="me-1 text-primary" />
                      {t("Scroll Speed")}
                    </Form.Label>
                    <div className="speed-selector">
                      {SPEED_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          className={`speed-option ${
                            Number(formData.scroll_speed) === opt.value
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              scroll_speed: opt.value,
                            }))
                          }
                        >
                          <span className="speed-option-label">{opt.label}</span>
                          <span className="speed-option-desc">{opt.desc}</span>
                        </div>
                      ))}
                    </div>
                    <Form.Text className="text-muted">
                      {t("Controls how fast the text scrolls on the website")}
                    </Form.Text>
                  </Form.Group>
                </Col>

                {/* Status */}
                <Col sm={12} md={6} lg={8} className="mb-4">
                  <Form.Group>
                    <Form.Label className="required">{t("Status")}</Form.Label>
                    <div className="status-radio-group">
                      <div
                        className={`status-option ${
                          formData.status === "1" ? "active-selected" : ""
                        }`}
                        onClick={() => setStatus("1")}
                      >
                        <span className="status-dot green" />
                        <div>
                          <div className="status-label">{t("Active")}</div>
                          <div className="status-desc">
                            {t("Visible on the website")}
                          </div>
                        </div>
                        <Form.Check
                          type="radio"
                          name="status"
                          value="1"
                          checked={formData.status === "1"}
                          onChange={handleChange}
                          className="ms-auto"
                          style={{ pointerEvents: "none" }}
                        />
                      </div>
                      <div
                        className={`status-option ${
                          formData.status === "0" ? "inactive-selected" : ""
                        }`}
                        onClick={() => setStatus("0")}
                      >
                        <span className="status-dot red" />
                        <div>
                          <div className="status-label">{t("Inactive")}</div>
                          <div className="status-desc">
                            {t("Hidden from the website")}
                          </div>
                        </div>
                        <Form.Check
                          type="radio"
                          name="status"
                          value="0"
                          checked={formData.status === "0"}
                          onChange={handleChange}
                          className="ms-auto"
                          style={{ pointerEvents: "none" }}
                        />
                      </div>
                    </div>
                    {errors.status && (
                      <span className="validation-error">{errors.status}</span>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ======== Submit ======== */}
          <div className="submit-area">
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" />
                  {id ? t("Updating…") : t("Saving…")}
                </>
              ) : (
                <>
                  <FaSave />
                  {id ? t("Update Ticker") : t("Create Ticker")}
                </>
              )}
            </button>
            <Link to="/cms/promo-ticker">
              <Button variant="outline-secondary" className="btn-cancel">
                {t("Cancel")}
              </Button>
            </Link>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default CreatePromoTicker;

