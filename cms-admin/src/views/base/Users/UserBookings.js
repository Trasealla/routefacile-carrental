import React, { useEffect, useState, useMemo } from "react";
import { Badge, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MdVisibility } from "react-icons/md";
import {
  FaFilePdf,
  FaFileExcel,
  FaUsers,
  FaVenusMars,
  FaEnvelope,
  FaSortAmountDownAlt,
  FaHashtag,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaGlobeAfrica,
  FaCalendarCheck,
  FaUserCheck,
} from "react-icons/fa";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import { simpleGetCallAuth } from "../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import configWeb from "../../../components/config.js/ConfigWeb";
import NamePhoto from "../../../components/NamePhoto/NamePhoto";
import logoImage from "../../../assets/images/logo_new.png";

// Conditional imports for PDF/Excel libraries
let jsPDF, autoTable, XLSX;

import("jspdf").then((m) => { jsPDF = m.default || m; }).catch((e) => console.warn("jsPDF not available:", e));
import("jspdf-autotable").then((m) => { autoTable = m.default || m; }).catch((e) => console.warn("jspdf-autotable not available:", e));
import("xlsx").then((m) => { XLSX = m.default || m; }).catch((e) => console.warn("XLSX not available:", e));

const bookingCountOf = (u) =>
  u.total_bookings !== undefined ? u.total_bookings
  : u.booking_count !== undefined ? u.booking_count
  : u.total_booking_count !== undefined ? u.total_booking_count
  : 0;

const filterLabel = {
  fontSize: "0.8rem", fontWeight: 600, color: "#4a5568",
  display: "flex", alignItems: "center", gap: 5, marginBottom: 6,
};
const filterControl = {
  height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0",
  fontSize: "0.875rem", background: "#fafbfc",
};

const STAT_CARDS = [
  { key: "totalUsers",        labelKey: "statTotalUsers",        accent: "#3182ce", icon: FaUsers },
  { key: "usersWithBookings", labelKey: "statUsersWithBookings", accent: "#38a169", icon: FaUserCheck },
  { key: "totalBookings",     labelKey: "statBookingsThisPage",  accent: "#d69e2e", icon: FaCalendarCheck },
  { key: "uniqueCountries",   labelKey: "statUniqueCountries",   accent: "#e53e3e", icon: FaGlobeAfrica },
];

const UsersBookings = () => {
  const { t } = useTranslation();

  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minBookingCount, setMinBookingCount] = useState("");
  const [userBookingArray, setUserBookingArray] = useState([]);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [allUsersData, setAllUsersData] = useState([]);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const handlePageSizeChange = (n) => { setPageSize(n); setCurrentPage(1); };
  const handlePageChange = (n) => setCurrentPage(n);

  const paginationMessage = () => {
    if (!totalRecords) return `${t("common.showing")} 0 ${t("common.of")} 0 ${t("common.entries")}`;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalRecords);
    return `${t("common.showing")} ${start} ${t("common.to")} ${end} ${t("common.of")} ${totalRecords} ${t("common.entries")}`;
  };

  const summaryStats = useMemo(() => ({
    totalUsers: totalRecords,
    usersWithBookings: allUsersData.filter((u) => bookingCountOf(u) > 0).length,
    totalBookings: allUsersData.reduce((s, u) => s + bookingCountOf(u), 0),
    uniqueCountries: new Set(allUsersData.map((u) => u.country).filter(Boolean)).size,
  }), [allUsersData, totalRecords]);

  const buildParams = (o = {}) => {
    const p = new URLSearchParams();
    const g = o.gender ?? gender, e = o.email ?? email, s = o.sortBy ?? sortBy;
    const df = o.dateFrom ?? dateFrom, dt = o.dateTo ?? dateTo, mbc = o.minBookingCount ?? minBookingCount;
    if (g) p.append("gender", g);
    if (e) p.append("user_email", e);
    if (s) p.append("sort_by", s);
    if (df) p.append("registered_from", df);
    if (dt) p.append("registered_to", dt);
    if (mbc) p.append("min_booking_count", mbc);
    return p;
  };

  const getUsersList = (override = {}) => {
    setLoading(true);
    const p = buildParams(override);
    p.append("page", override.currentPage ?? currentPage);
    p.append("page_size", override.pageSize ?? pageSize);
    simpleGetCallAuth(`${configWeb.GET_USER_BOOKING_LIST}?${p.toString()}`)
      .then((res) => {
        if (!res?.error) {
          setUserBookingArray(res?.data || []);
          setTotalRecords(res?.total_records || 0);
          setAllUsersData(res?.all_data || res?.data || []);
        } else {
          setUserBookingArray([]); setTotalRecords(0); setAllUsersData([]);
        }
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrong"));
        setUserBookingArray([]); setTotalRecords(0); setAllUsersData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getUsersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (isInitialMount) { setIsInitialMount(false); return; }
    setCurrentPage(1);
    getUsersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const handleSearchClick = () => { setCurrentPage(1); getUsersList({ currentPage: 1 }); };

  const handleClearFilters = () => {
    setGender(""); setEmail(""); setSortBy(""); setDateFrom(""); setDateTo(""); setMinBookingCount(""); setCurrentPage(1);
    getUsersList({ gender: "", email: "", sortBy: "", dateFrom: "", dateTo: "", minBookingCount: "", currentPage: 1 });
  };

  const handleShowBookingDetails = (user) => {
    setSelectedUser(user);
    setShowBookingDetails(true);
    fetchUserBookings(user.user_email);
  };
  const handleCloseBookingDetails = () => {
    setShowBookingDetails(false); setSelectedUser(null); setUserBookings([]);
  };

  const fetchUserBookings = (userEmail) => {
    if (!userEmail) return;
    setLoadingBookings(true);
    const p = new URLSearchParams();
    p.append("user_email", userEmail);
    p.append("page", 1);
    p.append("page_size", 100);
    simpleGetCallAuth(`${configWeb.GET_BOOKINGS}?${p.toString()}`)
      .then((res) => setUserBookings(res?.error ? [] : res?.data || []))
      .catch(() => { notifyError(t("usersPage.detailsLoadFailed")); setUserBookings([]); })
      .finally(() => setLoadingBookings(false));
  };

  const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("en-GB") : "");

  // ── PDF export ──────────────────────────────────────────────────────
  // Exported report content stays in English (single-language report,
  // avoids RTL-in-PDF complexity); only user-facing toasts are translated.
  const handleDownloadPDF = async () => {
    if (!jsPDF || !autoTable) {
      try {
        const [a, b] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
        jsPDF = a.default || a; autoTable = b.default || b;
      } catch { notifyError(t("usersPage.exportFailed")); return; }
    }
    setLoading(true);
    try {
      const p = buildParams();
      p.append("page", 1); p.append("page_size", 10000);
      const res = await simpleGetCallAuth(`${configWeb.GET_USER_BOOKING_LIST}?${p.toString()}`);
      if (res?.error) { notifyError(t("usersPage.exportFailed")); setLoading(false); return; }
      const allUsers = res?.data || [];
      const totalUsers = res?.total_records || allUsers.length;

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginLeft = 20, marginRight = 20, marginTop = 20;
      const availableWidth = pageWidth - marginLeft - marginRight;
      const logoWidth = 75, logoHeight = 30, logoX = marginLeft, logoY = marginTop;
      try { doc.addImage(logoImage, "PNG", logoX, logoY, logoWidth, logoHeight, undefined, "FAST"); } catch {}
      const headerY = logoY + logoHeight / 2;
      doc.setFontSize(18); doc.setFont(undefined, "bold");
      const headerText = "Users Report";
      doc.text(headerText, (pageWidth - doc.getTextWidth(headerText)) / 2, headerY);
      doc.setFont(undefined, "normal");
      const ts = `Generated: ${new Date().toLocaleString()}`;
      doc.setFontSize(8); doc.setTextColor(100, 100, 100);
      doc.text(ts, pageWidth - marginRight - doc.getTextWidth(ts), headerY);
      doc.setTextColor(0, 0, 0);

      const startY = logoY + logoHeight + 25, cardSpacing = 15;
      const cardWidth = Math.floor((availableWidth - cardSpacing * 3) / 4), cardHeight = 65;
      let cardX = marginLeft;
      const cards = [
        { label: "TOTAL USERS", value: totalUsers, color: [49, 130, 206] },
        { label: "USERS WITH BOOKINGS", value: allUsers.filter((u) => bookingCountOf(u) > 0).length, color: [56, 161, 105] },
        { label: "TOTAL BOOKINGS", value: allUsers.reduce((s, u) => s + bookingCountOf(u), 0), color: [214, 158, 46] },
        { label: "UNIQUE COUNTRIES", value: new Set(allUsers.map((u) => u.country).filter(Boolean)).size, color: [229, 62, 62] },
      ];
      cards.forEach(({ label, value, color }) => {
        doc.setFillColor(245, 245, 245); doc.setDrawColor(220, 220, 220);
        doc.roundedRect(cardX, startY, cardWidth, cardHeight, 3, 3, "FD");
        doc.setFillColor(...color); doc.rect(cardX, startY, 4, cardHeight, "F");
        doc.setTextColor(100, 100, 100); doc.setFontSize(7); doc.setFont(undefined, "normal");
        doc.text(doc.splitTextToSize(label, cardWidth - 20), cardX + 12, startY + 15);
        doc.setTextColor(...color); doc.setFontSize(20); doc.setFont(undefined, "bold");
        const vt = String(value);
        doc.text(vt, cardX + (cardWidth - doc.getTextWidth(vt)) / 2, startY + 45);
        doc.setTextColor(0, 0, 0); doc.setFont(undefined, "normal");
        cardX += cardWidth + cardSpacing;
      });

      const tableData = allUsers.map((u) => [
        u.id || "-", u.user_name || "-", u.gender || "-",
        u.dob ? new Date(u.dob).toLocaleDateString("en-GB") : "-",
        u.country || "-", String(bookingCountOf(u)),
        u.booking_date ? new Date(u.booking_date).toLocaleDateString("en-GB") : "-",
        u.registered_at ? new Date(u.registered_at).toLocaleDateString("en-GB") : "-",
      ]);
      autoTable(doc, {
        startY: startY + cardHeight + 20,
        head: [["ID", "User", "Gender", "DOB", "Country", "Total Bookings", "Booked At", "Registered At"]],
        body: tableData, theme: "striped",
        headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold", halign: "center", valign: "middle", cellPadding: 4 },
        bodyStyles: { fontSize: 7, cellPadding: 3, textColor: [51, 51, 51], halign: "left", valign: "middle" },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: marginLeft, right: marginRight, top: 10 },
        styles: { overflow: "linebreak", cellWidth: "wrap", lineColor: [200, 200, 200], lineWidth: 0.3 },
      });
      doc.save(`Users_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      notifySuccess(t("usersPage.exportPdfOk"));
    } catch (e) {
      console.error("PDF error:", e); notifyError(t("usersPage.exportFailed"));
    } finally { setLoading(false); }
  };

  // ── Excel export ────────────────────────────────────────────────────
  const handleDownloadExcel = async () => {
    if (!XLSX) {
      try { const m = await import("xlsx"); XLSX = m.default || m; }
      catch { notifyError(t("usersPage.exportFailed")); return; }
    }
    setLoading(true);
    try {
      const p = buildParams();
      p.append("page", 1); p.append("page_size", 10000);
      const res = await simpleGetCallAuth(`${configWeb.GET_USER_BOOKING_LIST}?${p.toString()}`);
      if (res?.error) { notifyError(t("usersPage.exportFailed")); setLoading(false); return; }
      const allUsers = res?.data || [];
      const totalUsers = res?.total_records || allUsers.length;
      const wb = XLSX.utils.book_new();
      const summary = [
        ["Users Report Summary"],
        ["Generated at:", new Date().toLocaleString()],
        [""],
        ["Metric", "Value"],
        ["Total Users", totalUsers],
        ["Users with Bookings", allUsers.filter((u) => bookingCountOf(u) > 0).length],
        ["Total Bookings", allUsers.reduce((s, u) => s + bookingCountOf(u), 0)],
        ["Unique Countries", new Set(allUsers.map((u) => u.country).filter(Boolean)).size],
      ];
      const sws = XLSX.utils.aoa_to_sheet(summary);
      sws["!cols"] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, sws, "Summary");
      const rows = allUsers.map((u, i) => ({
        "Sr. No": i + 1, ID: u.id || "-", "User Name": u.user_name || "-",
        Email: u.user_email || "-", Phone: u.user_phone || "-", Gender: u.gender || "-",
        DOB: u.dob ? new Date(u.dob).toLocaleDateString("en-GB") : "-",
        Country: u.country || "-", "Total Bookings": bookingCountOf(u),
        "Booked At": u.booking_date ? new Date(u.booking_date).toLocaleDateString("en-GB") : "-",
        "Registered At": u.registered_at ? new Date(u.registered_at).toLocaleDateString("en-GB") : "-",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch: 8 }, { wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, `Users_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
      notifySuccess(t("usersPage.exportExcelOk"));
    } catch (e) {
      console.error("Excel error:", e); notifyError(t("usersPage.exportFailed"));
    } finally { setLoading(false); }
  };

  const exportBtn = (variant, onClick, Icon, label) => (
    <button
      type="button" onClick={onClick} disabled={loading || userBookingArray.length === 0}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px",
        borderRadius: 10, border: "none", color: "#fff", fontWeight: 600, fontSize: "0.85rem",
        background: variant === "excel" ? "#1e7e46" : "#c53030",
        cursor: loading || userBookingArray.length === 0 ? "not-allowed" : "pointer",
        opacity: loading || userBookingArray.length === 0 ? 0.55 : 1,
      }}
    >
      <Icon /> {label}
    </button>
  );

  return (
    <div className="rf-list-page">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <FaUsers size={20} style={{ color: "var(--rf-orange)", marginRight: 8 }} />
            {t("usersPage.title")}
          </h2>
          <p style={{ margin: "4px 0 0 14px", color: "#8492a6", fontSize: "0.85rem", fontWeight: 500 }}>
            {t("usersPage.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {exportBtn("excel", handleDownloadExcel, FaFileExcel, t("usersPage.exportExcel"))}
          {exportBtn("pdf", handleDownloadPDF, FaFilePdf, t("usersPage.exportPdf"))}
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {STAT_CARDS.map(({ key, labelKey, accent, icon: Icon }) => (
          <div key={key} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(13,27,42,0.06)", padding: "18px 20px", borderTop: `3px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "#8492a6" }}>
                {t(`usersPage.${labelKey}`)}
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: accent, marginTop: 4, lineHeight: 1 }}>
                {summaryStats[key].toLocaleString()}
              </div>
            </div>
            <span style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${accent}18`, color: accent }}>
              <Icon size={18} />
            </span>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(13,27,42,0.06)", padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, alignItems: "end" }}>
          <div>
            <Form.Label style={filterLabel}><FaVenusMars size={11} style={{ color: "var(--rf-orange)" }} /> {t("usersPage.gender")}</Form.Label>
            <Form.Select value={gender} onChange={(e) => setGender(e.target.value)} style={filterControl}>
              <option value="">{t("usersPage.genderAll")}</option>
              <option value="male">{t("usersPage.male")}</option>
              <option value="female">{t("usersPage.female")}</option>
            </Form.Select>
          </div>
          <div>
            <Form.Label style={filterLabel}><FaEnvelope size={11} style={{ color: "var(--rf-orange)" }} /> {t("usersPage.email")}</Form.Label>
            <Form.Control
              type="text" value={email} placeholder={t("usersPage.emailPlaceholder")}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
              style={filterControl}
            />
          </div>
          <div>
            <Form.Label style={filterLabel}><FaSortAmountDownAlt size={11} style={{ color: "var(--rf-orange)" }} /> {t("usersPage.sortByBookingCount")}</Form.Label>
            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={filterControl}>
              <option value="">{t("usersPage.sortDefault")}</option>
              <option value="total_bookings_desc">{t("usersPage.sortHighToLow")}</option>
              <option value="total_bookings_asc">{t("usersPage.sortLowToHigh")}</option>
            </Form.Select>
          </div>
          <div>
            <Form.Label style={filterLabel}><FaHashtag size={11} style={{ color: "var(--rf-orange)" }} /> {t("usersPage.bookingCountFilter")}</Form.Label>
            <Form.Select value={minBookingCount} onChange={(e) => setMinBookingCount(e.target.value)} style={filterControl}>
              <option value="">{t("usersPage.allUsers")}</option>
              {[2, 5, 10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{t("usersPage.above", { n })}</option>
              ))}
            </Form.Select>
          </div>
          <div>
            <Form.Label style={filterLabel}><FaCalendarAlt size={11} style={{ color: "var(--rf-orange)" }} /> {t("usersPage.registrationDateFrom")}</Form.Label>
            <Form.Control type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={filterControl} />
          </div>
          <div>
            <Form.Label style={filterLabel}><FaCalendarAlt size={11} style={{ color: "var(--rf-orange)" }} /> {t("usersPage.registrationDateTo")}</Form.Label>
            <Form.Control type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} style={filterControl} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button" onClick={handleSearchClick} disabled={loading}
              style={{ flex: 1, height: 42, borderRadius: 10, border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "linear-gradient(135deg, var(--rf-orange) 0%, var(--rf-orange-dark) 100%)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(218,40,38,0.30)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch size={12} /> {t("usersPage.search")}</>}
            </button>
            <button
              type="button" onClick={handleClearFilters}
              title={t("usersPage.clearFilters")} aria-label={t("usersPage.clearFilters")}
              style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e2e8f0", background: "#fff", color: "#718096", cursor: "pointer" }}
            >
              <FaTimes size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(13,27,42,0.06)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f2f5", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: "0.85rem", color: "#718096", fontWeight: 500 }}>{paginationMessage()}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", color: "#8492a6" }}>{t("usersPage.rowsPerPage")}</span>
            <Form.Select value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))} style={{ height: 36, width: 90, borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: "0.83rem" }}>
              {[10, 25, 50, 100, 500, 1000].map((n) => <option key={n} value={n}>{n}</option>)}
            </Form.Select>
          </div>
        </div>

        <div className="rf-table-wrap name-photo-table-wrapper" style={{ borderRadius: 0, boxShadow: "none" }}>
          <Table className="rf-table" responsive style={{ whiteSpace: "nowrap" }}>
            <thead>
              <tr>
                <th>{t("usersPage.colUser")}</th>
                <th>{t("usersPage.colGender")}</th>
                <th>{t("usersPage.colDob")}</th>
                <th>{t("usersPage.colCountry")}</th>
                <th style={{ textAlign: "center" }}>{t("usersPage.colTotalBookings")}</th>
                <th>{t("usersPage.colBookedAt")}</th>
                <th>{t("usersPage.colRegisteredAt")}</th>
                <th style={{ textAlign: "center" }}>{t("usersPage.colViewDetails")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="text-center" colSpan={8}><Spinner /></td></tr>
              ) : userBookingArray.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <FaUsers size={28} style={{ color: "#cbd5e0", marginBottom: 10 }} />
                    <div style={{ fontWeight: 600, color: "#4a5568", fontSize: "0.92rem" }}>{t("usersPage.noUsers")}</div>
                    <div style={{ color: "#a0aec0", fontSize: "0.82rem", marginTop: 3 }}>{t("usersPage.noUsersHint")}</div>
                  </td>
                </tr>
              ) : (
                userBookingArray.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <NamePhoto name={user.user_name || ""} email={user.user_email || ""} phone={user.user_phone || ""} gender={user.gender || ""} />
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{user.gender}</td>
                    <td>{fmtDate(user.dob)}</td>
                    <td>{user.country}</td>
                    <td style={{ textAlign: "center" }}>
                      <Badge pill style={{ backgroundColor: "#3182ce", color: "#fff", border: "none", fontSize: "0.78rem" }}>
                        {bookingCountOf(user)}
                      </Badge>
                    </td>
                    <td>{fmtDate(user.booking_date)}</td>
                    <td>{fmtDate(user.registered_at)}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button" onClick={() => handleShowBookingDetails(user)}
                        title={t("usersPage.viewDetails")} aria-label={t("usersPage.viewDetails")}
                        style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "var(--rf-orange)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <MdVisibility style={{ fontSize: 17 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center" style={{ padding: "14px 20px", borderTop: "1px solid #f0f2f5" }}>
          <CustomPagination recordsPerPage={pageSize} totalRecords={totalRecords} onPageChange={handlePageChange} currentPage={currentPage} />
        </div>
      </div>

      {/* ── Details modal ──────────────────────────────────────────── */}
      <Modal show={showBookingDetails} onHide={handleCloseBookingDetails} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1.05rem" }}>
            {t("usersPage.detailsTitle")} — {selectedUser?.user_name || t("usersPage.colUser")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px 24px", marginBottom: 18 }}>
                <div><strong>{t("usersPage.name")}:</strong> {selectedUser.user_name}</div>
                <div><strong>{t("usersPage.email")}:</strong> {selectedUser.user_email}</div>
                <div dir="ltr"><strong>{t("usersPage.phone")}:</strong> {selectedUser.user_phone}</div>
                <div style={{ textTransform: "capitalize" }}><strong>{t("usersPage.gender")}:</strong> {selectedUser.gender}</div>
                <div><strong>{t("usersPage.colDob")}:</strong> {selectedUser.dob ? fmtDate(selectedUser.dob) : t("usersPage.notAvailable")}</div>
                <div><strong>{t("usersPage.country")}:</strong> {selectedUser.country || t("usersPage.notAvailable")}</div>
                <div><strong>{t("usersPage.registeredAt")}:</strong> {fmtDate(selectedUser.registered_at)}</div>
                <div>
                  <strong>{t("usersPage.totalBookings")}:</strong>{" "}
                  <Badge pill style={{ backgroundColor: "#3182ce", color: "#fff", border: "none" }}>
                    {bookingCountOf(selectedUser)}
                  </Badge>
                </div>
              </div>
              <hr />
              <h6 className="mb-3">{t("usersPage.userBookings")}</h6>
              {loadingBookings ? (
                <div className="text-center"><Spinner /></div>
              ) : userBookings.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: 400, overflowY: "auto" }}>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>{t("usersPage.bookingNo")}</th>
                        <th>{t("usersPage.bookingId")}</th>
                        <th>{t("usersPage.date")}</th>
                        <th>{t("usersPage.status")}</th>
                        <th>{t("usersPage.type")}</th>
                        <th>{t("usersPage.car")}</th>
                        <th>{t("usersPage.totalAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBookings.map((b) => (
                        <tr key={b.id}>
                          <td>{b.booking_number}</td>
                          <td>{b.booking_log_number}</td>
                          <td>{b.booking_date}</td>
                          <td><span className={`${b.status}_box`}>{b.status}</span></td>
                          <td>{b.type}</td>
                          <td>{b.car_name}</td>
                          <td>{b.total_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted">{t("usersPage.noBookingsForUser")}</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={handleCloseBookingDetails}>{t("usersPage.close")}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersBookings;
