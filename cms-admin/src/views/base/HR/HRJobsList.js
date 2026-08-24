import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, Modal, Badge } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  FaBriefcase,
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaShareAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaFilter,
} from "react-icons/fa";
import {
  simpleGetCallAuth,
  simplePutCallAuth,
  simplePatchCallAuth,
  simpleDeleteCallAuth,
} from "../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import configWeb from "../../../components/config.js/ConfigWeb";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import { JOB_STATUS, formatDate } from "./hrConstants";
import HRExportButtons from "./HRExportButtons";
import JobShareButtons from "./JobShareButtons";
import { useTranslation } from "react-i18next";
import "./hr.css";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const HRJobsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [shareJob, setShareJob] = useState(null);
  const [shareOpen, { open: openShare, close: closeShare }] = useDisclosure(false);

  const loadJobs = () => {
    setLoading(true);
    simpleGetCallAuth(`${configWeb.GET_CAREER_JOB_LIST}?page=1&page_size=9999`)
      .then((res) => {
        setJobs(res?.data || []);
      })
      .catch(() => notifyError(t("Failed to load jobs")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadJobs(); }, []);

  const isExpired = (job) => job.expiry_date && new Date(job.expiry_date) < new Date();
  const getDaysLeft = (job) => {
    if (!job?.expiry_date) return null;
    return Math.ceil((new Date(job.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
  };

  // Stats
  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((j) => j.status === 1 && !isExpired(j)).length;
    const inactive = jobs.filter((j) => j.status === 0).length;
    const expired = jobs.filter((j) => isExpired(j)).length;
    const closingSoon = jobs.filter((j) => !isExpired(j) && getDaysLeft(j) != null && getDaysLeft(j) <= 7).length;
    const avgExperience = total
      ? Math.round(jobs.reduce((sum, job) => sum + Number(job.experience_years || 0), 0) / total)
      : 0;
    return { total, active, inactive, expired, closingSoon, avgExperience };
  }, [jobs]);

  const filtered = useMemo(() => {
    let list = jobs;
    if (statusFilter === "active") list = list.filter((j) => j.status === 1 && !isExpired(j));
    else if (statusFilter === "inactive") list = list.filter((j) => j.status === 0);
    else if (statusFilter === "expired") list = list.filter((j) => isExpired(j));
    else if (statusFilter === "closing") list = list.filter((j) => !isExpired(j) && getDaysLeft(j) != null && getDaysLeft(j) <= 7);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (j) =>
          (j.title_en && j.title_en.toLowerCase().includes(term)) ||
          (j.location_en && j.location_en.toLowerCase().includes(term)) ||
          (j.id && String(j.id).includes(searchTerm))
      );
    }
    return list;
  }, [jobs, searchTerm, statusFilter]);

  const closingSoonJobs = useMemo(
    () => jobs.filter((j) => !isExpired(j) && getDaysLeft(j) != null && getDaysLeft(j) <= 7).sort((a, b) => getDaysLeft(a) - getDaysLeft(b)).slice(0, 4),
    [jobs]
  );

  const activeRatio = stats.total ? Math.round((stats.active / stats.total) * 100) : 0;

  const totalRecords = filtered.length;
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const toggleStatus = (job) => {
    const newStatus = job.status === 1 ? 0 : 1;
    const url = configWeb.PATCH_CAREER_JOB_STATUS(job.id);
    simplePatchCallAuth(url, JSON.stringify({ status: newStatus }))
      .then((res) => {
        if (res && !res.error) {
          notifySuccess(newStatus === 1 ? t("Job activated") : t("Job deactivated"));
          loadJobs();
        } else {
          notifyError(
            Array.isArray(res?.message) ? res.message[0] : res?.message || t("Failed to update status")
          );
        }
      })
      .catch(() => notifyError(t("Something went wrong")));
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    simpleDeleteCallAuth(configWeb.DELETE_CAREER_JOB(deleteId))
      .then((res) => {
        if (res && !res.error) {
          notifySuccess(t("Job deleted successfully"));
          loadJobs();
        } else {
          notifyError(t("Failed to delete job"));
        }
      })
      .catch(() => notifyError(t("Something went wrong")))
      .finally(() => { setDeleteId(null); closeDelete(); });
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const statCards = [
    {
      label: "Total Jobs",
      value: stats.total,
      icon: <FaBriefcase />,
      className: "blue",
      hint: t("{{count}} live now", { count: stats.active }),
    },
    {
      label: "Active Roles",
      value: stats.active,
      icon: <FaCheckCircle />,
      className: "green",
      hint: t("{{percent}}% live coverage", { percent: activeRatio }),
    },
    {
      label: "Paused Roles",
      value: stats.inactive,
      icon: <FaTimesCircle />,
      className: "violet",
      hint: stats.inactive ? t("Temporarily not visible") : t("Everything is active"),
    },
    {
      label: "Closing Soon",
      value: stats.closingSoon,
      icon: <FaExclamationTriangle />,
      className: "orange",
      hint: stats.closingSoon ? t("Expiring within 7 days") : t("No urgent expiries"),
    },
    {
      label: "Expired",
      value: stats.expired,
      icon: <FaExclamationTriangle />,
      className: "rose",
      hint: stats.expired ? t("Needs renewal or archive") : t("All roles are fresh"),
    },
  ];

  return (
    <div className="hr-module">
      {/* Header */}
      <motion.div className="hr-page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <div className="hr-header-icon me-3"><FaBriefcase /></div>
              <div>
                <h4>{t("Job Postings")}</h4>
                <p>{t("Manage all open positions and career opportunities")}</p>
              </div>
            </div>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-2 flex-wrap">
            <HRExportButtons
              rows={filtered}
              filename="hr-jobs"
              title={t("HR Job Postings")}
              sheetName="Jobs"
              columns={[
                { header: t("ID"), accessor: (r) => r.id },
                { header: t("Title (EN)"), accessor: (r) => r.title_en || "" },
                { header: t("Title (AR)"), accessor: (r) => r.title_ar || "" },
                { header: t("Location"), accessor: (r) => r.location_en || "" },
                { header: t("Experience (yrs)"), accessor: (r) => r.experience_years ?? "" },
                { header: t("Expiry"), accessor: (r) => formatDate(r.expiry_date) },
                { header: t("Status"), accessor: (r) => (isExpired(r) ? t("Expired") : (JOB_STATUS[r.status]?.label || "")) },
                { header: t("Created"), accessor: (r) => formatDate(r.created_at) },
              ]}
            />
            <motion.button
              className="btn"
              style={{ background: "#228be6", color: "#fff", borderRadius: 12, padding: "10px 20px", fontWeight: 600, fontSize: "0.85rem", border: "none", display: "flex", alignItems: "center", gap: 8 }}
              onClick={() => navigate("/hr/jobs/create")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaPlus size={12} /> {t("Add New Job")}
            </motion.button>
          </Col>
        </Row>
      </motion.div>

      {/* Stat Cards */}
      <Row className="mx-1 mt-3 g-3 hr-stat-grid">
        {statCards.map((card, idx) => (
          <Col xl={true} lg={4} md={6} key={card.label}>
            <motion.div
              className={`hr-dash-stat ${card.className}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.07, duration: 0.4 }}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (card.label === "Total Jobs") setStatusFilter("");
                else if (card.label === "Active Roles") setStatusFilter("active");
                else if (card.label === "Paused Roles") setStatusFilter("inactive");
                else if (card.label === "Closing Soon") setStatusFilter("closing");
                else if (card.label === "Expired") setStatusFilter("expired");
              }}
            >
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <div className="stat-label">{t(card.label)}</div>
                  <div className="stat-value">{loading ? "—" : card.value}</div>
                </div>
                <div className="stat-icon">{card.icon}</div>
              </div>
              <div className="stat-change up">{card.hint}</div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="mx-1 mt-2 g-3">
        <Col lg={8}>
          <motion.div className="hr-dash-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.4 }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div className="card-title mb-0">
                <FaFilter /> {t("Hiring Overview")}
              </div>
              <div className="hr-chip-group">
                {[
                  { label: "All", value: "" },
                  { label: "Active", value: "active" },
                  { label: "Closing Soon", value: "closing" },
                  { label: "Expired", value: "expired" },
                ].map((item) => (
                  <button key={item.label} className={`hr-chip ${statusFilter === item.value ? "active" : ""}`} onClick={() => setStatusFilter(item.value)}>
                    {t(item.label)}
                  </button>
                ))}
              </div>
            </div>

            <Row className="g-3">
              <Col md={4}>
                <div className="hr-mini-metric">
                  <div className="label">{t("Active coverage")}</div>
                  <div className="value">{activeRatio}%</div>
                  <div className="sub">{t("Of all roles are currently live")}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="hr-mini-metric">
                  <div className="label">{t("Closing soon")}</div>
                  <div className="value">{stats.closingSoon}</div>
                  <div className="sub">{t("Jobs that expire within 7 days")}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="hr-mini-metric">
                  <div className="label">{t("Avg. experience")}</div>
                  <div className="value">{t("{{years}} yrs", { years: stats.avgExperience })}</div>
                  <div className="sub">{t("Typical experience level requested")}</div>
                </div>
              </Col>
            </Row>
          </motion.div>
        </Col>

        <Col lg={4}>
          <motion.div className="hr-dash-card h-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.4 }}>
            <div className="card-title mb-3">
              <FaExclamationTriangle /> {t("Roles needing attention")}
            </div>
            {closingSoonJobs.length === 0 ? (
              <div className="hr-empty-state" style={{ minHeight: 100, padding: "24px 10px" }}>
                <FaCheckCircle size={22} />
                <p style={{ marginBottom: 0 }}>{t("No urgent expirations right now")}</p>
              </div>
            ) : (
              <div className="hr-insight-list">
                {closingSoonJobs.map((job) => (
                  <div key={job.id} className="hr-insight-item" style={{ cursor: "pointer" }} onClick={() => navigate(`/hr/jobs/${job.id}/edit`)}>
                    <div>
                      <div className="title">{job.title_en || t("Job #{{id}}", { id: job.id })}</div>
                      <div className="sub">{job.location_en || t("No location")}</div>
                    </div>
                    <span className="hr-badge" style={{ background: "#fff7ed", color: "#ea580c" }}>
                      {t("{{days}}d left", { days: Math.max(getDaysLeft(job), 0) })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </Col>
      </Row>

      {/* Search & Filters */}
      <motion.div className="hr-filter-bar mx-1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <Row className="align-items-end g-3">
          <Col lg={4} md={6}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", zIndex: 2 }} />
              <Form.Control
                type="text"
                placeholder={t("Search by title, location or ID...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 10 }}
              />
            </div>
          </Col>
          <Col lg={2} md={3}>
            <label className="form-label fw-semibold" style={{ fontSize: "0.78rem", color: "#64748b" }}>
              <FaFilter size={10} className="me-1" /> {t("Status")}
            </label>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ borderRadius: 10 }}>
              <option value="">{t("All Statuses")}</option>
              <option value="active">{t("Active")}</option>
              <option value="inactive">{t("Inactive")}</option>
              <option value="closing">{t("Closing Soon")}</option>
              <option value="expired">{t("Expired")}</option>
            </Form.Select>
          </Col>
          <Col lg={2} md={3}>
            <Form.Select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={{ borderRadius: 10 }}>
              <option value={10}>{t("{{count}} per page", { count: 10 })}</option>
              <option value={25}>{t("{{count}} per page", { count: 25 })}</option>
              <option value={50}>{t("{{count}} per page", { count: 50 })}</option>
            </Form.Select>
          </Col>
          <Col className="text-end">
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>{t("{{count}} job(s) found", { count: totalRecords })}</span>
          </Col>
        </Row>
      </motion.div>

      {/* Table */}
      <motion.div className="hr-table-wrapper mx-1 mt-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45 }}>
        <div className="table-responsive">
          <table className="hr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("Job Title")}</th>
                <th>{t("Location")}</th>
                <th>{t("Experience")}</th>
                <th>{t("Expiry Date")}</th>
                <th>{t("Status")}</th>
                <th style={{ textAlign: "center" }}>{t("Actions")}</th>
              </tr>
            </thead>
            <AnimatePresence mode="popLayout">
              <tbody>
                {loading ? (
                  <tr><td colSpan={7}><div className="hr-loading"><Spinner animation="border" /></div></td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7}><div className="hr-empty-state"><FaBriefcase size={40} /><p>{t("No jobs found")}</p></div></td></tr>
                ) : (
                  paginated.map((job, idx) => {
                    const expired = isExpired(job);
                    const daysLeft = getDaysLeft(job);
                    return (
                      <motion.tr key={job.id} variants={fadeUp} custom={idx} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }} layout>
                        <td><span style={{ fontWeight: 700, color: "#228be6", fontSize: "0.82rem" }}>#{job.id}</span></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{job.title_en || "—"}</div>
                          {job.title_ar && job.title_ar !== job.title_en && (
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", direction: "rtl" }}>{job.title_ar}</div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1" style={{ color: "#64748b", fontSize: "0.85rem" }}>
                            <FaMapMarkerAlt size={11} /> {job.location_en || "—"}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1" style={{ color: "#64748b", fontSize: "0.85rem" }}>
                            <FaClock size={11} /> {job.experience_years != null ? t("{{years}} yrs", { years: job.experience_years }) : "—"}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.85rem", color: expired ? "#ef4444" : daysLeft != null && daysLeft <= 7 ? "#ea580c" : "#64748b" }}>
                            <FaCalendarAlt size={11} /> {formatDate(job.expiry_date)}
                          </div>
                          {expired && <Badge size="xs" color="red" variant="light" mt={2}>{t("Expired")}</Badge>}
                          {!expired && daysLeft != null && daysLeft <= 7 && <Badge size="xs" color="orange" variant="light" mt={2}>{t("Closing Soon")}</Badge>}
                        </td>
                        <td>
                          <Tooltip label={job.status === 1 ? t("Click to deactivate") : t("Click to activate")} withArrow>
                            <motion.button
                              onClick={() => toggleStatus(job)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: job.status === 1 ? "#22c55e" : "#cbd5e1" }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {job.status === 1 ? <FaToggleOn /> : <FaToggleOff />}
                            </motion.button>
                          </Tooltip>
                          <div style={{ fontSize: "0.7rem", color: job.status === 1 ? "#22c55e" : "#94a3b8", fontWeight: 600 }}>
                            {JOB_STATUS[job.status]?.label || "—"}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="d-flex justify-content-center gap-2">
                            <Tooltip label={t("View")} withArrow>
                              <motion.button className="hr-action-btn view" onClick={() => navigate(`/hr/jobs/${job.id}`)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                                <FaEye />
                              </motion.button>
                            </Tooltip>
                            <Tooltip label={t("Share")} withArrow>
                              <motion.button
                                className="hr-action-btn"
                                style={{ background: "#dbeafe", color: "#1d4ed8" }}
                                onClick={() => { setShareJob(job); openShare(); }}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FaShareAlt />
                              </motion.button>
                            </Tooltip>
                            <Tooltip label={t("Edit")} withArrow>
                              <motion.button className="hr-action-btn edit" onClick={() => navigate(`/hr/jobs/${job.id}/edit`)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                                <FaEdit />
                              </motion.button>
                            </Tooltip>
                            <Tooltip label={t("Delete")} withArrow>
                              <motion.button className="hr-action-btn delete" onClick={() => { setDeleteId(job.id); openDelete(); }} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                                <FaTrash />
                              </motion.button>
                            </Tooltip>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
        {!loading && totalRecords > 0 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-3">
            <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              {t("Showing {{from}} – {{to}} of {{total}}", { from: start + 1, to: Math.min(start + pageSize, totalRecords), total: totalRecords })}
            </span>
            <CustomPagination recordsPerPage={pageSize} totalRecords={totalRecords} onPageChange={setCurrentPage} currentPage={currentPage} />
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteOpen} onClose={closeDelete} title={t("Delete Job")} centered size="sm" radius="lg">
        <p style={{ color: "#475569", fontSize: "0.9rem" }}>{t("Are you sure you want to delete this job posting? This action cannot be undone.")}</p>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <motion.button className="btn btn-sm" style={{ borderRadius: 10, padding: "8px 20px" }} onClick={closeDelete} whileTap={{ scale: 0.97 }}>{t("Cancel")}</motion.button>
          <motion.button className="btn btn-sm" style={{ borderRadius: 10, padding: "8px 20px", background: "#ef4444", color: "#fff", border: "none" }} onClick={confirmDelete} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{t("Delete")}</motion.button>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        opened={shareOpen}
        onClose={() => { closeShare(); setShareJob(null); }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
            <FaShareAlt style={{ color: "#228be6" }} /> {t("Share Job")}
          </div>
        }
        centered
        size="lg"
        radius="lg"
      >
        {shareJob && (
          <>
            <div style={{ fontSize: "0.88rem", color: "#0f172a", fontWeight: 600, marginBottom: 4 }}>
              {shareJob.title_en || t("Job #{{id}}", { id: shareJob.id })}
            </div>
            <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: 16 }}>
              {t("Share this opening across your channels to reach more candidates.")}
            </p>
            <JobShareButtons jobId={shareJob.id} title={shareJob.title_en} />
          </>
        )}
      </Modal>
    </div>
  );
};

export default HRJobsList;
