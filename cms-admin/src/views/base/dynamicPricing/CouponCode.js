import React, { useEffect, useState, useMemo } from "react";
import { Button, Col, Form, Modal, Spinner, Table, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuClipboardPen } from "react-icons/lu";
import { ImBin } from "react-icons/im";
import { FaTicketAlt, FaSearch, FaPlus } from "react-icons/fa";

import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
} from "../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import configWeb from "../../../components/config.js/ConfigWeb";
import { formatDateTimeUAE } from "../CustomHooks/reusableFunctions";

const CouponCode = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [couponListArray, setCouponListArray] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showdel, setShowdel] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleCloseDel = () => setShowdel(false);
  const handleShowDel = (id) => {
    setDeleteID(id);
    setShowdel(true);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getCouponList = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("page_size", pageSize);

    simpleGetCallAuth(`${configWeb.GET_DISCOUNT_COUPON}?${params.toString()}`)
      .then((res) => {
        if (!res?.error) {
          setCouponListArray(res?.data || []);
          setTotalRecords(res?.total_records || 0);
        } else {
          setCouponListArray([]);
          setTotalRecords(0);
        }
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrong"));
        setCouponListArray([]);
        setTotalRecords(0);
      })
      .finally(() => {
        setLoading(false);
        handleCloseDel();
      });
  };

  useEffect(() => {
    getCouponList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const deleteDiscountCoupon = (id) => {
    setDeleteLoading(true);
    simpleDeleteCallAuth(configWeb.DELETE_DISCOUNT_COUPON(id))
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(t("common.deletedSuccessfully"));
          getCouponList();
        } else if (res?.error) {
          notifyError(Array.isArray(res?.message) ? res.message[0] : res?.message);
        }
      })
      .catch(() => notifyError(t("common.somethingWentWrongTryAgain")))
      .finally(() => setDeleteLoading(false));
  };

  const handleDelete = () => {
    if (deleteID) deleteDiscountCoupon(deleteID);
  };

  const handleEdit = (id) => navigate(`/dynamic-pricing/edit-discount-coupon/${id}`);

  // Filters only the current page — the backend owns paging.
  const visibleCoupons = useMemo(() => {
    if (!Array.isArray(couponListArray)) return [];
    if (!searchTerm) return couponListArray;
    const q = searchTerm.toLowerCase();
    return couponListArray.filter((c) => (c.code || "").toLowerCase().includes(q));
  }, [couponListArray, searchTerm]);

  const paginationMessage = () => {
    if (!totalRecords) {
      return `${t("common.showing")} 0 ${t("common.of")} 0 ${t("common.entries")}`;
    }
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalRecords);
    return `${t("common.showing")} ${start} ${t("common.to")} ${end} ${t("common.of")} ${totalRecords} ${t("common.entries")}`;
  };

  const numericCols = [
    { key: "cdw", labelKey: "colCdw" },
    { key: "scdw", labelKey: "colScdw" },
    { key: "pai", labelKey: "colPai" },
    { key: "gps", labelKey: "colGps" },
    { key: "baby_seat", labelKey: "colBabySeat" },
    { key: "driver", labelKey: "colDriver" },
    { key: "rate", labelKey: "colRate" },
  ];

  return (
    <div className="rf-list-page">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <FaTicketAlt size={20} style={{ color: "var(--rf-orange)", marginRight: 8 }} />
            {t("couponList.title")}
          </h2>
          <p style={{ margin: "4px 0 0 14px", color: "#8492a6", fontSize: "0.85rem", fontWeight: 500 }}>
            {t("couponList.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                {t("couponList.title")}
              </li>
            </ol>
          </nav>
          <Link to="/dynamic-pricing/create-discount-coupon">
            <button
              className="rf-add-btn"
              style={{
                borderRadius: 10, height: 40, padding: "0 18px", fontSize: "0.875rem",
                display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
              }}
            >
              <FaPlus size={12} /> {t("couponList.addCoupon")}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Table card ────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(13,27,42,0.06)", overflow: "hidden" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid #f0f2f5", flexWrap: "wrap", gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <InputGroup style={{ width: 260 }}>
              <InputGroup.Text style={{ background: "#fafbfc", border: "1.5px solid #e2e8f0", borderInlineEnd: "none" }}>
                <FaSearch size={12} style={{ color: "#a0aec0" }} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={t("couponList.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: 38, border: "1.5px solid #e2e8f0", borderInlineStart: "none", fontSize: "0.85rem", background: "#fafbfc" }}
              />
            </InputGroup>
            <span style={{ fontSize: "0.85rem", color: "#718096", fontWeight: 500 }}>
              {paginationMessage()}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", color: "#8492a6" }}>{t("couponList.rowsPerPage")}</span>
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
                <th scope="col">{t("couponList.colCode")}</th>
                <th scope="col">{t("couponList.colFromDate")}</th>
                <th scope="col">{t("couponList.colToDate")}</th>
                <th scope="col">{t("couponList.colStatus")}</th>
                {numericCols.map((c) => (
                  <th scope="col" key={c.key}>{t(`couponList.${c.labelKey}`)}</th>
                ))}
                <th scope="col">{t("couponList.colCreatedBy")}</th>
                <th scope="col">{t("couponList.colCreatedAt")}</th>
                <th scope="col">{t("couponList.colAction")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="text-center" colSpan={100}><Spinner /></td>
                </tr>
              ) : visibleCoupons.length === 0 ? (
                <tr>
                  <td colSpan={100} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <FaTicketAlt size={30} style={{ color: "#cbd5e0", marginBottom: 10 }} />
                    <div style={{ fontWeight: 600, color: "#4a5568", fontSize: "0.92rem" }}>
                      {t("couponList.noCoupons")}
                    </div>
                    <div style={{ color: "#a0aec0", fontSize: "0.82rem", marginTop: 3 }}>
                      {t("couponList.noCouponsHint")}
                    </div>
                  </td>
                </tr>
              ) : (
                visibleCoupons.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.code}</td>
                    <td>{item.start_date}</td>
                    <td>{item.end_date}</td>
                    <td>
                      <div className={item.status ? "active_box" : "inactive_box"}>
                        {item.status ? t("common.active") : t("common.inactive")}
                      </div>
                    </td>
                    {numericCols.map((c) => (
                      <td key={c.key}>{item[c.key]}</td>
                    ))}
                    {/* Resolve the creator id to a name */}
                    <td>{item?.created_by_admin?.first_name || "-"}</td>
                    <td>{formatDateTimeUAE(item?.created_at)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <LuClipboardPen
                        onClick={() => handleEdit(item.id)}
                        title={t("common.edit")}
                        className="me-2"
                        style={{ cursor: "pointer", height: "1.15em", width: "1.15em", stroke: "orange" }}
                      />
                      <ImBin
                        onClick={() => handleShowDel(item.id)}
                        title={t("common.delete")}
                        style={{ cursor: "pointer", height: "1.05em", width: "1.05em", fill: "#ff6b6b" }}
                      />
                    </td>
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

      {/* ── Delete confirmation ───────────────────────────────────── */}
      <Modal show={showdel} onHide={handleCloseDel} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1.05rem" }}>{t("couponList.deleteTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("couponList.deleteConfirm")}</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={handleCloseDel}>
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

export default CouponCode;
