import React, { useEffect, useState, useCallback } from "react";
import { Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaUndoAlt, FaHashtag, FaEnvelope, FaSearch } from "react-icons/fa";

import { simpleGetCallAuth } from "../../../components/config.js/Setup";
import { notifyError } from "../../../components/notify/notify";
import configWeb from "../../../components/config.js/ConfigWeb";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import { formatDateTimeUAE } from "../CustomHooks/reusableFunctions";

const filterLabel = {
  fontSize: "0.8rem", fontWeight: 600, color: "#4a5568",
  display: "flex", alignItems: "center", gap: 5, marginBottom: 6,
};
const filterControl = {
  height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0",
  fontSize: "0.875rem", background: "#fafbfc",
};

/**
 * The API returns a display-ready action of either 'Edited' or 'Cancelled'
 * (see the CASE in refund.controller.ts). Map it to a translation key and a
 * badge tone — the old `${item.action}_box` produced class names like
 * "Cancelled_box" that no stylesheet defined, so the badge rendered unstyled.
 */
const ACTION_STYLES = {
  Edited: { labelKey: "actionEdited", bg: "#fffaf0", fg: "#b7791f", border: "#fbd38d" },
  Cancelled: { labelKey: "actionCancelled", bg: "#fff5f5", fg: "#c53030", border: "#feb2b2" },
};

const RefundList = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [refundList, setRefundList] = useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Inputs the admin is typing into.
  const [email, setEmail] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  // The filters actually applied to the request. Keeping these separate means
  // Search drives the fetch through one effect instead of firing a second,
  // racing request with a stale page number.
  const [applied, setApplied] = useState({ email: "", bookingNumber: "" });

  const getRefundList = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (applied.email) params.append("email", applied.email);
    if (applied.bookingNumber) params.append("booking_number", applied.bookingNumber);
    params.append("page", currentPage);
    params.append("page_size", pageSize);

    simpleGetCallAuth(`${configWeb.GET_REFUNDS}?${params.toString()}`)
      .then((res) => {
        if (!res?.error) {
          setRefundList(res?.data || []);
          setTotalRecords(res?.total_records || 0);
        } else {
          setRefundList([]);
          setTotalRecords(0);
        }
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrong"));
        setRefundList([]);
        setTotalRecords(0);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, applied]);

  useEffect(() => {
    getRefundList();
  }, [getRefundList]);

  const handleSearch = () => {
    setCurrentPage(1);
    setApplied({ email, bookingNumber });
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const paginationMessage = () => {
    if (!totalRecords) {
      return `${t("common.showing")} 0 ${t("common.of")} 0 ${t("common.entries")}`;
    }
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalRecords);
    return `${t("common.showing")} ${start} ${t("common.to")} ${end} ${t("common.of")} ${totalRecords} ${t("common.entries")}`;
  };

  const money = (v) =>
    v === null || v === undefined || v === "" ? "-" : `MAD ${Number(v).toFixed(2)}`;

  // The API returns the raw enum ('daily' / 'monthly'); show it in the admin's language.
  const bookingType = (type) => {
    const key = { daily: "typeDaily", monthly: "typeMonthly" }[type];
    return key ? t(`refundList.${key}`) : type || "-";
  };

  const renderActionBadge = (action) => {
    const style = ACTION_STYLES[action];
    if (!style) return action || "-";
    return (
      <span
        style={{
          display: "inline-block", padding: "4px 12px", borderRadius: 999,
          fontSize: "0.74rem", fontWeight: 700, whiteSpace: "nowrap",
          background: style.bg, color: style.fg, border: `1px solid ${style.border}`,
        }}
      >
        {t(`refundList.${style.labelKey}`)}
      </span>
    );
  };

  return (
    <div className="rf-list-page">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <FaUndoAlt size={18} style={{ color: "var(--rf-orange)", marginRight: 8 }} />
            {t("refundList.title")}
          </h2>
          <p style={{ margin: "4px 0 0 14px", color: "#8492a6", fontSize: "0.85rem", fontWeight: 500 }}>
            {t("refundList.subtitle")}
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
              <span style={{ color: "#8492a6" }}>{t("nav.Bookings")}</span>
            </li>
            <li className="breadcrumb-item active" style={{ color: "#1a202c" }}>
              {t("refundList.title")}
            </li>
          </ol>
        </nav>
      </div>

      {/* ── Filter card ───────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(13,27,42,0.06)",
          padding: "20px 24px", marginBottom: 24,
        }}
      >
        <Row className="g-3 align-items-end">
          <Col xs={12} sm={6} md={4} lg={3}>
            <Form.Label htmlFor="refund-booking-number" style={filterLabel}>
              <FaHashtag size={11} style={{ color: "var(--rf-orange)" }} /> {t("refundList.bookingNumber")}
            </Form.Label>
            <Form.Control
              id="refund-booking-number"
              type="text"
              value={bookingNumber}
              placeholder={t("refundList.bookingNumberPlaceholder")}
              onChange={(e) => setBookingNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={filterControl}
            />
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Form.Label htmlFor="refund-email" style={filterLabel}>
              <FaEnvelope size={11} style={{ color: "var(--rf-orange)" }} /> {t("refundList.email")}
            </Form.Label>
            <Form.Control
              id="refund-email"
              type="text"
              value={email}
              placeholder={t("refundList.emailPlaceholder")}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={filterControl}
            />
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                height: 42, padding: "0 22px", borderRadius: 10, border: "none", width: "100%",
                background: "linear-gradient(135deg, var(--rf-orange) 0%, var(--rf-orange-dark) 100%)",
                color: "#fff", fontWeight: 600, fontSize: "0.875rem",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(218,40,38,0.30)", opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch size={13} /> {t("common.search")}</>}
            </button>
          </Col>
        </Row>
      </div>

      {/* ── Table card ────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(13,27,42,0.06)", overflow: "hidden" }}>
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid #f0f2f5", flexWrap: "wrap", gap: 10,
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#718096", fontWeight: 500 }}>
            {paginationMessage()}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", color: "#8492a6" }}>{t("refundList.rowsPerPage")}</span>
            <Form.Select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{ height: 36, width: 90, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: "0.83rem" }}
            >
              {[10, 25, 50, 100, 500, 1000].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Form.Select>
          </div>
        </div>

        <div className="rf-table-wrap" style={{ borderRadius: 0, boxShadow: "none" }}>
          <Table className="rf-table" responsive>
            <thead>
              <tr>
                <th scope="col">{t("refundList.colIndex")}</th>
                <th scope="col">{t("refundList.colArc")}</th>
                <th scope="col">{t("refundList.colLog")}</th>
                <th scope="col">{t("refundList.colType")}</th>
                <th scope="col">{t("refundList.colName")}</th>
                <th scope="col">{t("refundList.colPhone")}</th>
                <th scope="col">{t("refundList.colEmail")}</th>
                <th scope="col">{t("refundList.colTotalAmount")}</th>
                <th scope="col">{t("refundList.colPreviousTotal")}</th>
                <th scope="col">{t("refundList.colTime")}</th>
                <th scope="col">{t("refundList.colAction")}</th>
                <th scope="col">{t("refundList.colReason")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="text-center" colSpan={100}><Spinner /></td>
                </tr>
              ) : refundList.length === 0 ? (
                <tr>
                  <td colSpan={100} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <FaUndoAlt size={28} style={{ color: "#cbd5e0", marginBottom: 10 }} />
                    <div style={{ fontWeight: 600, color: "#4a5568", fontSize: "0.92rem" }}>
                      {t("refundList.noRefunds")}
                    </div>
                    <div style={{ color: "#a0aec0", fontSize: "0.82rem", marginTop: 3 }}>
                      {t("refundList.noRefundsHint")}
                    </div>
                  </td>
                </tr>
              ) : (
                refundList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ fontWeight: 600 }}>{item.booking_number}</td>
                    <td>{item.booking_log_number || "-"}</td>
                    <td>{bookingType(item.type)}</td>
                    <td>{item.user_name}</td>
                    <td dir="ltr">{item.user_phone}</td>
                    <td>{item.user_email}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{money(item.total_amount)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{money(item.previous_total_amount)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTimeUAE(item.time)}</td>
                    <td>{renderActionBadge(item.action)}</td>
                    <td>{item.cancellation_reason || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <div
          className="d-flex justify-content-between align-items-center"
          style={{ padding: "14px 20px", borderTop: "1px solid #f0f2f5" }}
        >
          <CustomPagination
            recordsPerPage={pageSize}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default RefundList;
