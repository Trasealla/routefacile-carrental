import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaKey } from "react-icons/fa";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
  simplePostCallAuth,
  simplePutCallAuth,
} from "../../../components/config.js/Setup";
import configWeb from "../../../components/config.js/ConfigWeb";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import "./hr.css";
import HRExportButtons from "./HRExportButtons";

const KEYWORD_TYPES = [
  { value: "must_have", label: "Must Have" },
  { value: "optional", label: "Optional" },
  { value: "exclude", label: "Exclude" },
];

const INITIAL_FORM = {
  career_job_id: "",
  keyword: "",
  keyword_type: "must_have",
  weight: 1,
  status: 1,
};

const HRKeywords = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [openForm, formHandlers] = useDisclosure(false);
  const [openDelete, deleteHandlers] = useDisclosure(false);

  const loadJobs = () => {
    simpleGetCallAuth(`${configWeb.GET_CAREER_JOB_LIST}?page=1&page_size=9999`)
      .then((res) => setJobs(res?.data || []))
      .catch(() => setJobs([]));
  };

  const loadItems = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("page_size", "9999");
    if (selectedJob) params.append("career_job_id", selectedJob);

    simpleGetCallAuth(`${configWeb.GET_RECRUITING_KEYWORD_LIST}?${params.toString()}`)
      .then((res) => setItems(res?.data || []))
      .catch(() => {
        notifyError(t("Failed to load keywords"));
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedJob]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (selectedType) list = list.filter((item) => item.keyword_type === selectedType);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          (item.keyword || "").toLowerCase().includes(term) ||
          (item.career_job?.title_en || "").toLowerCase().includes(term)
      );
    }
    return list;
  }, [items, selectedType, searchTerm]);

  const totalRecords = filtered.length;
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const onCreateClick = () => {
    setEditId(null);
    setForm({ ...INITIAL_FORM, career_job_id: selectedJob || "" });
    formHandlers.open();
  };

  const onEditClick = (row) => {
    setEditId(row.id);
    setForm({
      career_job_id: row.career_job_id ? String(row.career_job_id) : "",
      keyword: row.keyword || "",
      keyword_type: row.keyword_type || "must_have",
      weight: row.weight ?? 1,
      status: row.status ?? 1,
    });
    formHandlers.open();
  };

  const onSave = () => {
    if (!form.career_job_id || !form.keyword) {
      notifyError(t("Job and keyword are required"));
      return;
    }

    setSaving(true);

    if (!editId) {
      const payload = {
        career_job_id: Number(form.career_job_id),
        keyword: form.keyword,
        keyword_type: form.keyword_type,
        weight: Number(form.weight) || 1,
        status: Number(form.status),
      };
      simplePostCallAuth(configWeb.POST_RECRUITING_KEYWORD_CREATE, JSON.stringify(payload))
        .then((res) => {
          if (!res?.error) {
            notifySuccess(t("Keyword created"));
            formHandlers.close();
            loadItems();
          } else {
            notifyError(res?.message || t("Failed to create keyword"));
          }
        })
        .catch(() => notifyError(t("Failed to create keyword")))
        .finally(() => setSaving(false));
      return;
    }

    const payload = {};
    const original = items.find((i) => i.id === editId) || {};

    if (Number(form.career_job_id) !== Number(original.career_job_id)) payload.career_job_id = Number(form.career_job_id);
    if (form.keyword !== (original.keyword || "")) payload.keyword = form.keyword;
    if (form.keyword_type !== (original.keyword_type || "")) payload.keyword_type = form.keyword_type;
    if (Number(form.weight) !== Number(original.weight || 0)) payload.weight = Number(form.weight);
    if (Number(form.status) !== Number(original.status || 0)) payload.status = Number(form.status);

    simplePutCallAuth(configWeb.PUT_RECRUITING_KEYWORD_UPDATE(editId), JSON.stringify(payload))
      .then((res) => {
        if (!res?.error) {
          notifySuccess(t("Keyword updated"));
          formHandlers.close();
          loadItems();
        } else {
          notifyError(res?.message || t("Failed to update keyword"));
        }
      })
      .catch(() => notifyError(t("Failed to update keyword")))
      .finally(() => setSaving(false));
  };

  const onDelete = () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    simpleDeleteCallAuth(configWeb.DELETE_RECRUITING_KEYWORD(deleteId))
      .then((res) => {
        if (!res?.error) {
          notifySuccess(t("Keyword deleted"));
          deleteHandlers.close();
          setDeleteId(null);
          loadItems();
        } else {
          notifyError(res?.message || t("Failed to delete keyword"));
        }
      })
      .catch(() => notifyError(t("Failed to delete keyword")))
      .finally(() => setDeleteLoading(false));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedJob, pageSize]);

  return (
    <div className="hr-module">
      <div className="hr-page-header">
        <Row className="align-items-center g-3">
          <Col>
            <div className="d-flex align-items-center">
              <div className="hr-header-icon me-3"><FaKey /></div>
              <div>
                <h4>{t("AI Keywords")}</h4>
                <p>{t("Manage weighted keywords for application scoring")}</p>
              </div>
            </div>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-2 flex-wrap">
            <HRExportButtons
              rows={filtered}
              filename="hr-keywords"
              title="HR AI Keywords"
              sheetName="Keywords"
              columns={[
                { header: "ID", accessor: (r) => r.id },
                { header: "Job", accessor: (r) => r.career_job?.title_en || "" },
                { header: "Keyword", accessor: (r) => r.keyword || "" },
                { header: "Type", accessor: (r) => r.keyword_type || "" },
                { header: "Weight", accessor: (r) => r.weight ?? "" },
                { header: "Status", accessor: (r) => (r.status === 1 ? "Active" : "Inactive") },
              ]}
            />
            <button className="hr-pill-button primary" onClick={onCreateClick}>
              <FaPlus size={12} /> {t("Add Keyword")}
            </button>
          </Col>
        </Row>
      </div>

      <div className="hr-filter-bar mx-1 mt-3">
        <Row className="align-items-end g-3">
          <Col lg={4} md={6}>
            <label className="form-label fw-semibold" style={{ fontSize: "0.78rem", color: "#64748b" }}>
              <FaFilter size={10} className="me-1" /> {t("Job")}
            </label>
            <Form.Select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} style={{ borderRadius: 10 }}>
              <option value="">{t("All jobs")}</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title_en || `Job #${job.id}`}</option>
              ))}
            </Form.Select>
          </Col>
          <Col lg={2} md={6}>
            <label className="form-label fw-semibold" style={{ fontSize: "0.78rem", color: "#64748b" }}>
              <FaFilter size={10} className="me-1" /> {t("Type")}
            </label>
            <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ borderRadius: 10 }}>
              <option value="">{t("All")}</option>
              {KEYWORD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{t(type.label)}</option>
              ))}
            </Form.Select>
          </Col>
          <Col lg={4} md={8}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", zIndex: 2 }} />
              <Form.Control
                type="text"
                placeholder={t("Search by keyword or job...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 40, borderRadius: 10 }}
              />
            </div>
          </Col>
          <Col lg={2} md={4}>
            <Form.Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ borderRadius: 10 }}>
              <option value={10}>{t("{{n}} / page", { n: 10 })}</option>
              <option value={25}>{t("{{n}} / page", { n: 25 })}</option>
              <option value={50}>{t("{{n}} / page", { n: 50 })}</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      <div className="hr-table-wrapper mx-1 mt-3">
        <div className="table-responsive">
          <table className="hr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("Job")}</th>
                <th>{t("Keyword")}</th>
                <th>{t("Type")}</th>
                <th>{t("Weight")}</th>
                <th>{t("Status")}</th>
                <th style={{ textAlign: "center" }}>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="hr-loading"><Spinner animation="border" /></div></td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7}><div className="hr-empty-state"><FaKey size={34} /><p>{t("No keywords found")}</p></div></td></tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id}>
                    <td>#{row.id}</td>
                    <td>{row.career_job?.title_en || "-"}</td>
                    <td>{row.keyword || "-"}</td>
                    <td>{row.keyword_type || "-"}</td>
                    <td>{row.weight ?? "-"}</td>
                    <td>
                      <span className="hr-badge" style={{ background: Number(row.status) ? "#dcfce7" : "#f1f5f9", color: Number(row.status) ? "#166534" : "#475569" }}>
                        {Number(row.status) ? t("Active") : t("Inactive")}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="d-flex justify-content-center gap-2">
                        <button className="hr-action-btn edit" onClick={() => onEditClick(row)} title={t("Edit")}><FaEdit /></button>
                        <button
                          className="hr-action-btn delete"
                          onClick={() => {
                            setDeleteId(row.id);
                            deleteHandlers.open();
                          }}
                          title={t("Delete")}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalRecords > 0 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-3">
            <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              {t("Showing {{start}} - {{end}} of {{total}}", {
                start: start + 1,
                end: Math.min(start + pageSize, totalRecords),
                total: totalRecords,
              })}
            </span>
            <CustomPagination
              recordsPerPage={pageSize}
              totalRecords={totalRecords}
              onPageChange={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>

      <Modal opened={openForm} onClose={formHandlers.close} title={editId ? t("Edit Keyword") : t("Create Keyword")} centered radius="lg" size="lg">
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>{t("Job *")}</Form.Label>
            <Form.Select value={form.career_job_id} onChange={(e) => setForm({ ...form, career_job_id: e.target.value })}>
              <option value="">{t("Select job")}</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title_en || `Job #${job.id}`}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>{t("Keyword Type *")}</Form.Label>
            <Form.Select value={form.keyword_type} onChange={(e) => setForm({ ...form, keyword_type: e.target.value })}>
              {KEYWORD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{t(type.label)}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={12}>
            <Form.Label>{t("Keyword *")}</Form.Label>
            <Form.Control value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
          </Col>
          <Col md={6}>
            <Form.Label>{t("Weight")}</Form.Label>
            <Form.Control type="number" min="1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </Col>
          <Col md={6}>
            <Form.Label>{t("Status")}</Form.Label>
            <Form.Select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
              <option value={1}>{t("Active")}</option>
              <option value={0}>{t("Inactive")}</option>
            </Form.Select>
          </Col>
        </Row>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-sm" onClick={formHandlers.close}>{t("Cancel")}</button>
          <button className="btn btn-sm btn-primary" onClick={onSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : editId ? t("Save Changes") : t("Create")}
          </button>
        </div>
      </Modal>

      <Modal opened={openDelete} onClose={deleteHandlers.close} title={t("Delete Keyword")} centered size="sm" radius="lg">
        <p style={{ color: "#475569", fontSize: "0.9rem" }}>{t("Are you sure you want to delete this keyword?")}</p>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-sm" onClick={deleteHandlers.close}>{t("Cancel")}</button>
          <button className="btn btn-sm btn-danger" onClick={onDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner size="sm" /> : t("Delete")}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default HRKeywords;
