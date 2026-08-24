import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, Row, Col, Spinner, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaPercent,
  FaShieldAlt,
  FaUserShield,
  FaHeartbeat,
  FaMapMarkedAlt,
  FaBaby,
  FaUserFriends,
  FaPlus,
  FaTrashAlt,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";

import configWeb from "../../../../components/config.js/ConfigWeb";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
  simplePutCallAuth,
} from "../../../../components/config.js/Setup";
import {
  notifyError,
  notifySuccess,
} from "../../../../components/notify/notify";

/**
 * The six extras a range discount can apply to.
 *
 * `apiType` is what the backend stores and what daily.extras.query.ts keys off —
 * note the additional driver is "driver" there, not "additional_driver".
 */
const SECTIONS = [
  { key: "cdw",       apiType: "cdw",       labelKey: "cdw",       hintKey: "cdwHint",       Icon: FaShieldAlt },
  { key: "scdw",      apiType: "scdw",      labelKey: "scdw",      hintKey: "scdwHint",      Icon: FaUserShield },
  { key: "pai",       apiType: "pai",       labelKey: "pai",       hintKey: "paiHint",       Icon: FaHeartbeat },
  { key: "gps",       apiType: "gps",       labelKey: "gps",       hintKey: "gpsHint",       Icon: FaMapMarkedAlt },
  { key: "baby_seat", apiType: "baby_seat", labelKey: "babySeat",  hintKey: "babySeatHint",  Icon: FaBaby },
  { key: "driver",    apiType: "driver",    labelKey: "driver",    hintKey: "driverHint",    Icon: FaUserFriends },
];

const emptyRow = () => ({ fromDays: "", toDays: "", discount: "" });

const labelStyle = {
  fontSize: "0.78rem", fontWeight: 600, color: "#4a5568",
  marginBottom: 6, display: "block",
};
const controlStyle = (invalid) => ({
  height: 42, borderRadius: 10, fontSize: "0.875rem",
  border: `1.5px solid ${invalid ? "#e53e3e" : "#e2e8f0"}`,
  background: invalid ? "#fff5f5" : "#fafbfc",
});
const errorTextStyle = {
  color: "#e53e3e", fontSize: "0.72rem", marginTop: 4, display: "block",
};

const CreateRangePricing = () => {
  const { t } = useTranslation();

  // rows[sectionKey] -> array of { fromDays, toDays, discount, id? }
  const [rows, setRows] = useState(
    () => Object.fromEntries(SECTIONS.map((s) => [s.key, [emptyRow()]]))
  );
  // errors[sectionKey][index] -> { fromDays?, toDays?, discount? }
  const [errors, setErrors] = useState({});
  const [savingKey, setSavingKey] = useState(null); // `${sectionKey}:${index}`
  const [loading, setLoading] = useState(false);

  const [showDel, setShowDel] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const closeDelete = () => setShowDel(false);

  /* ── Load existing rules ─────────────────────────────────────────── */

  const getPriceList = useCallback(() => {
    setLoading(true);
    simpleGetCallAuth(configWeb.GET_RANGE_PRICING_LIST)
      .then((res) => {
        const data = !res?.error && Array.isArray(res?.data) ? res.data : [];
        const grouped = Object.fromEntries(SECTIONS.map((s) => [s.key, []]));

        data.forEach((item) => {
          const section = SECTIONS.find((s) => s.apiType === item.type);
          if (!section) return; // unknown type — not shown by any section
          grouped[section.key].push({
            fromDays: item.from,
            toDays: item.to,
            discount: item.discount,
            id: item.id,
          });
        });

        // Keep one blank row per section so there is always something to fill in.
        SECTIONS.forEach((s) => {
          if (!grouped[s.key].length) grouped[s.key] = [emptyRow()];
        });

        setRows(grouped);
        setErrors({});
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrong"));
      })
      .finally(() => {
        setLoading(false);
        closeDelete();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getPriceList();
  }, [getPriceList]);

  /* ── Row editing ─────────────────────────────────────────────────── */

  const handleChange = (sectionKey, index, field, value) => {
    setRows((prev) => {
      const next = { ...prev, [sectionKey]: [...prev[sectionKey]] };
      next[sectionKey][index] = { ...next[sectionKey][index], [field]: value };
      return next;
    });
    // Clear the field's error as soon as the admin starts correcting it.
    setErrors((prev) => {
      if (!prev[sectionKey]?.[index]?.[field]) return prev;
      const nextSection = [...(prev[sectionKey] || [])];
      nextSection[index] = { ...nextSection[index], [field]: undefined };
      return { ...prev, [sectionKey]: nextSection };
    });
  };

  const handleAddRow = (sectionKey) => {
    setRows((prev) => ({ ...prev, [sectionKey]: [...prev[sectionKey], emptyRow()] }));
  };

  const handleRemoveRow = (sectionKey, index, id) => {
    if (id) {
      setDeleteID(id);
      setShowDel(true);
      return;
    }
    setRows((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] || []).filter((_, i) => i !== index),
    }));
  };

  /* ── Validation ──────────────────────────────────────────────────── */

  const validateRow = (sectionKey, index) => {
    const row = rows[sectionKey][index];
    const err = {};

    const from = row.fromDays === "" ? null : Number(row.fromDays);
    const to = row.toDays === "" ? null : Number(row.toDays);
    const discount = row.discount === "" ? null : Number(row.discount);

    if (from === null || Number.isNaN(from)) err.fromDays = t("rangeDiscount.errFromRequired");
    else if (from < 0) err.fromDays = t("rangeDiscount.errNegative");

    if (to === null || Number.isNaN(to)) err.toDays = t("rangeDiscount.errToRequired");
    else if (to < 0) err.toDays = t("rangeDiscount.errNegative");

    if (discount === null || Number.isNaN(discount)) {
      err.discount = t("rangeDiscount.errDiscountRequired");
    } else if (discount < 0 || discount > 100) {
      // Pricing applies this as `1 - discount/100`, so >100 would make the extra
      // subtract from the booking total.
      err.discount = t("rangeDiscount.errDiscountRange");
    }

    if (!err.fromDays && !err.toDays && from > to) {
      err.fromDays = t("rangeDiscount.errFromAfterTo");
    }

    // A day count can only sit in one tier per extra, so overlaps are ambiguous.
    if (!err.fromDays && !err.toDays) {
      const clash = rows[sectionKey].some((other, i) => {
        if (i === index) return false;
        const oFrom = Number(other.fromDays);
        const oTo = Number(other.toDays);
        if (other.fromDays === "" || other.toDays === "") return false;
        if (Number.isNaN(oFrom) || Number.isNaN(oTo)) return false;
        return from <= oTo && oFrom <= to;
      });
      if (clash) err.toDays = t("rangeDiscount.errOverlap");
    }

    setErrors((prev) => {
      const nextSection = [...(prev[sectionKey] || [])];
      nextSection[index] = err;
      return { ...prev, [sectionKey]: nextSection };
    });

    return Object.keys(err).length === 0;
  };

  /* ── Save ────────────────────────────────────────────────────────── */

  const handleSubmit = (e, sectionKey, index) => {
    e.preventDefault();
    if (!validateRow(sectionKey, index)) return;

    const section = SECTIONS.find((s) => s.key === sectionKey);
    const row = rows[sectionKey][index];
    const body = {
      type: section.apiType,
      from: Number(row.fromDays),
      to: Number(row.toDays),
      discount: Number(row.discount),
      status: 1,
    };
    if (row.id) body.id = row.id;

    setSavingKey(`${sectionKey}:${index}`);
    simplePutCallAuth(configWeb.PUT_RANGE_PRICING_CREATE, JSON.stringify(body))
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(
            row.id
              ? t("rangeDiscount.updatedSuccessfully")
              : t("rangeDiscount.createdSuccessfully")
          );
          getPriceList();
        } else {
          notifyError(
            Array.isArray(res?.message) ? res.message[0] : res?.message || t("common.somethingWentWrong")
          );
        }
      })
      .catch(() => notifyError(t("common.somethingWentWrongTryAgain")))
      .finally(() => setSavingKey(null));
  };

  /* ── Delete ──────────────────────────────────────────────────────── */

  const handleDelete = () => {
    if (!deleteID) return;
    setDeleteLoading(true);
    simpleDeleteCallAuth(configWeb.DELETE_RANGE_PRICING(deleteID))
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(t("common.deletedSuccessfully"));
          getPriceList();
        } else if (res?.error) {
          notifyError(Array.isArray(res?.message) ? res.message[0] : res?.message);
        }
      })
      .catch(() => notifyError(t("common.somethingWentWrongTryAgain")))
      .finally(() => setDeleteLoading(false));
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  const renderSection = (section) => {
    const { key, Icon } = section;
    const sectionRows = rows[key] || [];
    const savedCount = sectionRows.filter((r) => r.id).length;

    return (
      <div
        key={key}
        style={{
          background: "#fff", borderRadius: 16, marginBottom: 20,
          boxShadow: "0 2px 12px rgba(13,27,42,0.06)", overflow: "hidden",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 22px", borderBottom: "1px solid #f0f2f5",
            background: "linear-gradient(180deg,#fbfcfd 0%,#fff 100%)",
          }}
        >
          <span
            style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "rgba(218,40,38,0.10)", color: "var(--rf-orange)",
            }}
          >
            <Icon size={17} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1a202c" }}>
              {t(`rangeDiscount.${section.labelKey}`)}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#8492a6" }}>
              {t(`rangeDiscount.${section.hintKey}`)}
            </div>
          </div>
          {savedCount > 0 && (
            <span
              style={{
                fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px",
                borderRadius: 999, background: "#edf2f7", color: "#4a5568", whiteSpace: "nowrap",
              }}
            >
              {savedCount} {t("rangeDiscount.rulesActive")}
            </span>
          )}
        </div>

        {/* Rows */}
        <div style={{ padding: "18px 22px 20px" }}>
          {sectionRows.map((row, index) => {
            const rowErr = errors[key]?.[index] || {};
            const isSaving = savingKey === `${key}:${index}`;

            return (
              <Form
                key={row.id ?? `new-${index}`}
                onSubmit={(e) => handleSubmit(e, key, index)}
                // Native constraint validation would block submit with an
                // untranslated browser message; validateRow() reports in the
                // admin's own language instead.
                noValidate
                style={{
                  paddingTop: index === 0 ? 0 : 16,
                  marginTop: index === 0 ? 0 : 16,
                  borderTop: index === 0 ? "none" : "1px dashed #e6eaf0",
                }}
              >
                <Row className="g-3 align-items-start">
                  <Col xs={12} sm={6} md={3}>
                    <Form.Label htmlFor={`${key}-from-${index}`} style={labelStyle}>
                      {t("rangeDiscount.fromDays")}
                    </Form.Label>
                    <Form.Control
                      id={`${key}-from-${index}`}
                      type="number"
                      min={0}
                      value={row.fromDays}
                      onChange={(e) => handleChange(key, index, "fromDays", e.target.value)}
                      style={controlStyle(!!rowErr.fromDays)}
                    />
                    {rowErr.fromDays && <span style={errorTextStyle}>{rowErr.fromDays}</span>}
                  </Col>

                  <Col xs={12} sm={6} md={3}>
                    <Form.Label htmlFor={`${key}-to-${index}`} style={labelStyle}>
                      {t("rangeDiscount.toDays")}
                    </Form.Label>
                    <Form.Control
                      id={`${key}-to-${index}`}
                      type="number"
                      min={0}
                      value={row.toDays}
                      onChange={(e) => handleChange(key, index, "toDays", e.target.value)}
                      style={controlStyle(!!rowErr.toDays)}
                    />
                    {rowErr.toDays && <span style={errorTextStyle}>{rowErr.toDays}</span>}
                  </Col>

                  <Col xs={12} sm={6} md={3}>
                    <Form.Label htmlFor={`${key}-discount-${index}`} style={labelStyle}>
                      {t("rangeDiscount.discount")}
                    </Form.Label>
                    <div style={{ position: "relative" }}>
                      <Form.Control
                        id={`${key}-discount-${index}`}
                        type="number"
                        min={0}
                        max={100}
                        value={row.discount}
                        onChange={(e) => handleChange(key, index, "discount", e.target.value)}
                        style={{ ...controlStyle(!!rowErr.discount), paddingInlineEnd: 34 }}
                      />
                      <FaPercent
                        size={11}
                        style={{
                          position: "absolute", insetInlineEnd: 12, top: "50%",
                          transform: "translateY(-50%)", color: "#a0aec0", pointerEvents: "none",
                        }}
                      />
                    </div>
                    {rowErr.discount && <span style={errorTextStyle}>{rowErr.discount}</span>}
                  </Col>

                  <Col xs={12} sm={6} md={3}>
                    <Form.Label style={{ ...labelStyle, visibility: "hidden" }}>.</Form.Label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                          flex: 1, height: 42, borderRadius: 10, border: "none",
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                          background: "linear-gradient(135deg, var(--rf-orange) 0%, var(--rf-orange-dark) 100%)",
                          color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                          cursor: isSaving ? "not-allowed" : "pointer",
                          boxShadow: "0 4px 14px rgba(218,40,38,0.28)",
                          opacity: isSaving ? 0.7 : 1,
                        }}
                      >
                        {isSaving ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <>
                            <FaCheck size={11} />
                            {row.id ? t("rangeDiscount.update") : t("rangeDiscount.add")}
                          </>
                        )}
                      </button>

                      {(sectionRows.length > 1 || row.id) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(key, index, row.id)}
                          title={t("rangeDiscount.removeRow")}
                          aria-label={t("rangeDiscount.removeRow")}
                          style={{
                            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            border: "1.5px solid #fed7d7", background: "#fff5f5",
                            color: "#e53e3e", cursor: "pointer",
                          }}
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      )}
                    </div>
                  </Col>
                </Row>
              </Form>
            );
          })}

          <button
            type="button"
            onClick={() => handleAddRow(key)}
            style={{
              marginTop: 16, height: 38, padding: "0 14px", borderRadius: 9,
              display: "inline-flex", alignItems: "center", gap: 7,
              border: "1.5px dashed #cbd5e0", background: "#fff",
              color: "#4a5568", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <FaPlus size={10} /> {t("rangeDiscount.addRow")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="rf-list-page">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <FaPercent size={19} style={{ color: "var(--rf-orange)", marginRight: 8 }} />
            {t("rangeDiscount.title")}
          </h2>
          <p style={{ margin: "4px 0 0 14px", color: "#8492a6", fontSize: "0.85rem", fontWeight: 500 }}>
            {t("rangeDiscount.subtitle")}
          </p>
        </div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: "0.82rem" }}>
            <li className="breadcrumb-item">
              <Link to="/dashboard" style={{ color: "var(--rf-orange)", textDecoration: "none" }}>
                {t("nav.Dashboard")}
              </Link>
            </li>
            <li className="breadcrumb-item">
              <span style={{ color: "#8492a6" }}>{t("nav.Dynamic Pricing")}</span>
            </li>
            <li className="breadcrumb-item active" style={{ color: "#1a202c" }}>
              {t("rangeDiscount.title")}
            </li>
          </ol>
        </nav>
      </div>

      {/* ── How it works ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          background: "#f0f6ff", border: "1px solid #d8e6fb",
          borderRadius: 12, padding: "14px 18px", marginBottom: 22,
        }}
      >
        <FaInfoCircle size={16} style={{ color: "#3182ce", flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#2c5282" }}>
            {t("rangeDiscount.howToTitle")}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#4a6489", lineHeight: 1.6 }}>
            {t("rangeDiscount.howToBody")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: 60 }}>
          <Spinner />
        </div>
      ) : (
        SECTIONS.map(renderSection)
      )}

      {/* ── Delete confirmation ───────────────────────────────────── */}
      <Modal show={showDel} onHide={closeDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1.05rem" }}>
            {t("rangeDiscount.deleteTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("rangeDiscount.deleteConfirm")}</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeDelete}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner animation="border" size="sm" /> : t("common.delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRangePricing;
