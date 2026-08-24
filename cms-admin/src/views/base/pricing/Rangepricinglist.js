import React, { useEffect, useState } from "react";
import { Col, Form, Row, Spinner, Table } from "react-bootstrap";
import {
  FaTable,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaBuilding,
  FaSearch,
  FaCloudUploadAlt,
  FaRegCalendarCheck,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

const Rangepricinglist = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [citiesArray, setCitiesArray] = useState([]);
  const [carGroupArray, setCarGroupArray] = useState([]);
  const [locationArray, setLocationArray] = useState([]);
  const [priceListArray, setPriceListArray] = useState([]);
  const [cityID, setCityID] = useState("");
  const [carGroup, setCarGroup] = useState("");
  const [location, setLocation] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateData, setDateData] = useState({ start_date: "", end_date: "" });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateData((prevData) => ({ ...prevData, [name]: value }));
  };
  const clearDate = (name) => setDateData((prevData) => ({ ...prevData, [name]: "" }));

  const citiesData = () => {
    simpleGetCallAuth(`${configWeb.GET_CITIES}?page_size=9999`)
      .then((res) => setCitiesArray(res?.data || []))
      .catch((err) => console.log("cities fetch failed", err));
  };
  const locationData = () => {
    simpleGetCallAuth(`${configWeb.GET_LOCATIONS}?page_size=9999`)
      .then((res) => setLocationArray(res?.data || []))
      .catch((err) => console.log("locations fetch failed", err));
  };
  const carGroupData = () => {
    simpleGetCallAuth(`${configWeb.GET_CAR_GROUPS}?page_size=9999`)
      .then((res) => setCarGroupArray(res?.data || []))
      .catch((err) => console.log("car groups fetch failed", err));
  };

  useEffect(() => {
    citiesData();
    carGroupData();
    locationData();
  }, []);

  const getPriceList = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (carGroup) params.append("group_id", carGroup);
    if (cityID) params.append("city_id", cityID);
    if (location) params.append("location_id", location);
    if (dateData.start_date) params.append("start_date", dateData.start_date);
    if (dateData.end_date) params.append("end_date", dateData.end_date);
    params.append("page", currentPage);
    params.append("page_size", pageSize);

    simpleGetCallAuth(`${configWeb.GET_RANGE_PRICE}?${params.toString()}`)
      .then((res) => {
        if (!res?.error) {
          setPriceListArray(res?.data || []);
          setTotalRecords(res?.total_records || 0);
        } else {
          setPriceListArray([]);
          setTotalRecords(0);
        }
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrong"));
        setPriceListArray([]);
        setTotalRecords(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getPriceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleSearchList = () => {
    setCurrentPage(1);
    getPriceList();
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handlePageSizeChange = (newPageSize) => setPageSize(newPageSize);

  // Locations are city-scoped, so narrow the dropdown once a city is picked.
  const visibleLocations = cityID
    ? locationArray.filter((l) => String(l.city_id) === String(cityID))
    : locationArray;

  const calculatePaginationMessage = () => {
    if (!totalRecords) return `${t("pricingList.showing")} 0 ${t("pricingList.of")} 0 ${t("pricingList.entries")}`;
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);
    return `${t("pricingList.showing")} ${startRecord} ${t("pricingList.to")} ${endRecord} ${t("pricingList.of")} ${totalRecords} ${t("pricingList.entries")}`;
  };

  const clearBtnStyle = {
    display: "inline-flex", alignItems: "center", gap: 4,
    marginTop: 5, padding: "2px 8px", borderRadius: 6,
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#718096", fontSize: "0.72rem", cursor: "pointer",
  };

  return (
    <div className="rf-list-page">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <FaTable size={22} style={{ color: "var(--rf-orange)", marginRight: 8 }} />
            {t("pricingList.rangePageTitle")}
          </h2>
          <p style={{ margin: "4px 0 0 14px", color: "#8492a6", fontSize: "0.85rem", fontWeight: 500 }}>
            {t("pricingList.rangePageSubtitle")}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: "0.82rem" }}>
              <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: "var(--rf-orange)", textDecoration: "none" }}>{t("nav.Dashboard")}</Link></li>
              <li className="breadcrumb-item"><span style={{ color: "#8492a6" }}>{t("nav.Pricing")}</span></li>
              <li className="breadcrumb-item active" style={{ color: "#1a202c" }}>{t("pricingList.rangePageTitle")}</li>
            </ol>
          </nav>
          {/* Was pointing at the daily upload page */}
          <Link to="/pricing/upload-range-pricing">
            <button className="rf-add-btn" style={{ borderRadius: 10, height: 40, padding: "0 18px", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <FaCloudUploadAlt size={15} /> {t("pricingList.uploadPrice")}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Filter Card ─────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(13,27,42,0.06)", padding: "20px 24px", marginBottom: 24 }}>
        <Row className="g-3 align-items-start">
          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={filterLabel}>
              <FaMapMarkerAlt size={12} style={{ color: "var(--rf-orange)" }} /> {t("common.city")}
            </Form.Label>
            <Form.Select
              value={cityID}
              onChange={(e) => { setCityID(e.target.value); setLocation(""); }}
              style={filterControl}
            >
              <option value="">{t("pricingList.selectCity")}</option>
              {citiesArray?.map((item) => <option key={item.id} value={item.id}>{item.name_en}</option>)}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={filterLabel}>
              <FaLayerGroup size={12} style={{ color: "var(--rf-orange)" }} /> {t("pricingList.group")}
            </Form.Label>
            <Form.Select value={carGroup} onChange={(e) => setCarGroup(e.target.value)} style={filterControl}>
              <option value="">{t("pricingList.selectGroup")}</option>
              {carGroupArray?.map((item) => <option key={item.id} value={item.id}>{item.name_en}</option>)}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={filterLabel}>
              <FaBuilding size={12} style={{ color: "var(--rf-orange)" }} /> {t("pricingList.location")}
            </Form.Label>
            <Form.Select value={location} onChange={(e) => setLocation(e.target.value)} style={filterControl}>
              <option value="">{t("pricingList.selectLocation")}</option>
              {visibleLocations?.map((item) => <option key={item.id} value={item.id}>{item.name_en}</option>)}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={filterLabel}>
              <FaRegCalendarCheck size={12} style={{ color: "var(--rf-orange)" }} /> {t("pricingList.colStartDate")}
            </Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={dateData.start_date}
              onChange={handleDateChange}
              onMouseDown={(e) => e.target.showPicker?.()}
              style={filterControl}
            />
            {dateData.start_date && (
              <button type="button" style={clearBtnStyle} onClick={() => clearDate("start_date")}>
                <FaTimes size={9} /> {t("common.reset")}
              </button>
            )}
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={filterLabel}>
              <FaRegCalendarCheck size={12} style={{ color: "var(--rf-orange)" }} /> {t("pricingList.colEndDate")}
            </Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={dateData.end_date}
              onChange={handleDateChange}
              onMouseDown={(e) => e.target.showPicker?.()}
              min={dateData.start_date || undefined}
              style={filterControl}
            />
            {dateData.end_date && (
              <button type="button" style={clearBtnStyle} onClick={() => clearDate("end_date")}>
                <FaTimes size={9} /> {t("common.reset")}
              </button>
            )}
          </Col>

          <Col xs={12} sm={6} md={3} lg={2}>
            <Form.Label style={{ ...filterLabel, visibility: "hidden" }}>.</Form.Label>
            <button
              type="button"
              onClick={handleSearchList}
              disabled={loading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                height: 42, padding: "0 22px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, var(--rf-orange) 0%, var(--rf-orange-dark) 100%)",
                color: "#fff", fontWeight: 600, fontSize: "0.875rem",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(218,40,38,0.30)",
                transition: "all .2s", opacity: loading ? 0.7 : 1, width: "100%", justifyContent: "center",
              }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch size={13} /> {t("common.search")}</>}
            </button>
          </Col>
        </Row>
      </div>

      {/* ── Table Card ──────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(13,27,42,0.06)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f2f5", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: "0.85rem", color: "#718096", fontWeight: 500 }}>
            {calculatePaginationMessage()}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", color: "#8492a6" }}>{t("pricingList.rowsPerPage")}</span>
            <Form.Select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{ height: 36, width: 90, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: "0.83rem" }}
            >
              {[10, 25, 50, 100, 500, 1000].map((n) => <option key={n} value={n}>{n}</option>)}
            </Form.Select>
          </div>
        </div>

        <div className="rf-table-wrap" style={{ borderRadius: 0, boxShadow: "none" }}>
          <Table className="rf-table" responsive>
            <thead>
              <tr>
                <th scope="col">{t("pricingList.colGroup")}</th>
                <th scope="col">{t("pricingList.colLocation")}</th>
                <th scope="col">{t("pricingList.colCity")}</th>
                <th scope="col">{t("pricingList.colStartDate")}</th>
                <th scope="col">{t("pricingList.colEndDate")}</th>
                <th scope="col">{t("pricingList.colStartDay")}</th>
                <th scope="col">{t("pricingList.colEndDay")}</th>
                <th scope="col">{t("pricingList.colRate")}</th>
                <th scope="col">{t("pricingList.colCreatedBy")}</th>
                <th scope="col">{t("pricingList.colCreatedAt")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="text-center" colSpan={100}><Spinner /></td></tr>
              ) : (
                Array.isArray(priceListArray) && priceListArray.length > 0 &&
                priceListArray.map((item) => (
                  <tr key={item.id}>
                    <td>{item.car_group?.name_en}</td>
                    {/* Resolve the id to a readable branch name */}
                    <td>{locationArray.find((l) => l.id === item.location_id)?.name_en || "-"}</td>
                    <td>{item.city?.name_en}</td>
                    <td>{item.start_date}</td>
                    <td>{item.end_date}</td>
                    <td>{item.from}</td>
                    <td>{item.to}</td>
                    <td>{item.rate}</td>
                    <td>{item?.created_by_admin?.first_name}</td>
                    <td>{formatDateTimeUAE(item?.created_at)}</td>
                  </tr>
                ))
              )}
              {priceListArray?.length === 0 && !loading && (
                <tr className="text-center"><td colSpan={100}>{t("pricingList.noData")}</td></tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center" style={{ padding: "14px 20px", borderTop: "1px solid #f0f2f5" }}>
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

export default Rangepricinglist;
