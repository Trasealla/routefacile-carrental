import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LuClipboardPen } from "react-icons/lu";
import { ImBin } from "react-icons/im";
import {
  TbDownload,
  TbUsers,
  TbCircleCheck,
  TbCircleX,
  TbListDetails,
  TbSearch,
  TbMail,
  TbKey,
  TbBuildingStore,
} from "react-icons/tb";
import CustomPagination from "../../../components/CustomPagination/CustomPagination";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
  simplePostCallAuth,
  simplePutCallAuth,
} from "../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import configWeb from "../../../components/config.js/ConfigWeb";
import "./Brokers.css";

const EMPTY_FORM = {
  id: null,
  name: "",
  username: "",
  password: "",
  contact_email: "",
  status: 1,
};

const Brokers = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [brokerListArray, setBrokerListArray] = useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [showDel, setShowDel] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [statsData, setStatsData] = useState({ active: 0, inactive: 0 });

  const isEdit = !!formData.id;

  const getBrokerStats = () => {
    Promise.all([
      simpleGetCallAuth(`${configWeb.GET_BROKER_LIST}?page=1&page_size=1&status=1`),
      simpleGetCallAuth(`${configWeb.GET_BROKER_LIST}?page=1&page_size=1&status=0`),
    ])
      .then(([activeRes, inactiveRes]) => {
        setStatsData({
          active: activeRes?.total_records || 0,
          inactive: inactiveRes?.total_records || 0,
        });
      })
      .catch(() => {});
  };

  const calculatePaginationMessage = () => {
    if (totalRecords === 0) return t("broker.noBrokersFound");
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);
    return `${t("common.showing")} ${startRecord} ${t("common.to")} ${endRecord} ${t("common.of")} ${totalRecords} ${t("common.entries")}`;
  };

  const getBrokerList = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("page_size", pageSize);
    if (search) params.append("search", search);

    const url = `${configWeb.GET_BROKER_LIST}?${params.toString()}`;
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setBrokerListArray(res?.data || []);
          setTotalRecords(res?.total_records || 0);
        } else {
          setBrokerListArray([]);
          setTotalRecords(0);
        }
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrong"));
        setBrokerListArray([]);
        setTotalRecords(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getBrokerList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    getBrokerStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    getBrokerList();
  };

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  const openEditModal = (broker) => {
    setFormData({
      id: broker.id,
      name: broker.name || "",
      username: broker.username || "",
      password: "",
      contact_email: broker.contact_email || "",
      status: broker.status ?? 1,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = t("broker.nameRequired");
    if (!formData.username.trim()) errors.username = t("broker.usernameRequired");
    if (!isEdit && formData.password.trim().length < 6) errors.password = t("broker.passwordMinLength");
    if (isEdit && formData.password && formData.password.trim().length < 6) errors.password = t("broker.passwordMinLength");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setSaving(true);

    const payload = isEdit
      ? {
          name: formData.name,
          contact_email: formData.contact_email || undefined,
          status: formData.status,
          ...(formData.password ? { password: formData.password } : {}),
        }
      : {
          name: formData.name,
          username: formData.username,
          password: formData.password,
          contact_email: formData.contact_email || undefined,
        };

    const call = isEdit
      ? simplePutCallAuth(configWeb.PUT_BROKER(formData.id), JSON.stringify(payload))
      : simplePostCallAuth(configWeb.POST_BROKER, JSON.stringify(payload));

    call
      .then((res) => {
        if (res?.error || res?.message) {
          notifyError(Array.isArray(res?.message) ? res.message[0] : (res?.message || t("common.somethingWentWrong")));
          return;
        }
        notifySuccess(isEdit ? t("broker.updatedSuccessfully") : t("broker.createdSuccessfully"));
        setShowForm(false);
        getBrokerList();
        getBrokerStats();
      })
      .catch(() => notifyError(t("common.somethingWentWrong")))
      .finally(() => setSaving(false));
  };

  const openDeleteModal = (id) => {
    setDeleteID(id);
    setShowDel(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDel(false);
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    simpleDeleteCallAuth(configWeb.DELETE_BROKER(deleteID))
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(t("common.deletedSuccessfully"));
          getBrokerList();
          getBrokerStats();
        } else {
          notifyError(t("common.somethingWentWrong"));
        }
      })
      .catch(() => notifyError(t("common.somethingWentWrong")))
      .finally(() => {
        setDeleteLoading(false);
        setShowDel(false);
      });
  };

  const [showReset, setShowReset] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  const openResetModal = (broker) => {
    setResetTarget(broker);
    setShowReset(true);
  };

  const closeResetModal = () => {
    if (resetLoading) return;
    setShowReset(false);
    setResetTarget(null);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    const bytes = new Uint32Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (n) => chars[n % chars.length]).join("");
  };

  const downloadCredentialsFile = (broker, password) => {
    const baseUrl = `${configWeb.BASE_URL}broker/v1/`;
    const lines = [
      "Route Facile - Broker API Credentials",
      "======================================",
      "",
      `Broker Name: ${broker.name}`,
      `Username: ${broker.username}`,
      `Password: ${password}`,
      "",
      `API Base URL: ${baseUrl}`,
      "",
      "Endpoints:",
      `  POST ${baseUrl}availability     - Check car availability`,
      `  POST ${baseUrl}bookings         - Create a booking`,
      `  POST ${baseUrl}bookings/edit    - Edit a booking`,
      `  POST ${baseUrl}bookings/cancel  - Cancel a booking`,
      "",
      "Authentication:",
      '  Include "username" and "password" in the body of every request.',
      "",
      "Format:",
      "  Set Content-Type: application/json or application/xml for the request body.",
      "  Set Accept: application/json or application/xml to choose the response format.",
      "",
      `Generated: ${new Date().toString()}`,
      "",
      "IMPORTANT: This password was just reset. Any previous password for this broker no longer works.",
      "Keep this file secure and share it with the broker over a trusted channel only.",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `broker-credentials-${broker.username}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetAndDownload = () => {
    if (!resetTarget) return;
    setResetLoading(true);
    const newPassword = generatePassword();

    simplePutCallAuth(configWeb.PUT_BROKER(resetTarget.id), JSON.stringify({ password: newPassword }))
      .then((res) => {
        if (res?.error || res?.message) {
          notifyError(Array.isArray(res?.message) ? res.message[0] : (res?.message || t("common.somethingWentWrong")));
          return;
        }
        downloadCredentialsFile(resetTarget, newPassword);
        notifySuccess(t("broker.resetSuccessful"));
        setShowReset(false);
        setResetTarget(null);
      })
      .catch(() => notifyError(t("common.somethingWentWrong")))
      .finally(() => setResetLoading(false));
  };

  return (
    <Container fluid className="rf-list-page brk-page">
      <div className="rf-page-header brk-header">
        <div className="rf-page-heading">
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {t("broker.title")}
          </h3>
          <p className="rf-page-sub">{t("broker.subtitle")}</p>
        </div>
        <Button className="rf-add-btn" onClick={openAddModal}>
          <span className="rf-add-plus">+</span> {t("broker.addButton")}
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="brk-summary-row">
        <div className="brk-stat-card">
          <div className="brk-stat-icon navy">
            <TbUsers size={22} />
          </div>
          <div>
            <div className="brk-stat-label">{t("broker.totalBrokers")}</div>
            <div className="brk-stat-value">{(statsData.active + statsData.inactive).toLocaleString()}</div>
          </div>
        </div>
        <div className="brk-stat-card">
          <div className="brk-stat-icon green">
            <TbCircleCheck size={22} />
          </div>
          <div>
            <div className="brk-stat-label">{t("common.active")}</div>
            <div className="brk-stat-value">{statsData.active.toLocaleString()}</div>
          </div>
        </div>
        <div className="brk-stat-card">
          <div className="brk-stat-icon red">
            <TbCircleX size={22} />
          </div>
          <div>
            <div className="brk-stat-label">{t("common.inactive")}</div>
            <div className="brk-stat-value">{statsData.inactive.toLocaleString()}</div>
          </div>
        </div>
        <div className="brk-stat-card">
          <div className="brk-stat-icon amber">
            <TbListDetails size={22} />
          </div>
          <div>
            <div className="brk-stat-label">{t("broker.showing")}</div>
            <div className="brk-stat-value">{calculatePaginationMessage()}</div>
          </div>
        </div>
      </div>

      <Form onSubmit={handleSearchSubmit} className="rf-filter-card brk-search-card mb-3">
        <Row className="align-items-end">
          <Col lg="6">
            <Form.Group>
              <Form.Label>{t("common.search")}</Form.Label>
              <div className="brk-search-input-wrap">
                <TbSearch className="brk-search-icon" size={18} />
                <Form.Control
                  type="text"
                  className="brk-search-input"
                  placeholder={t("broker.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Form.Group>
          </Col>
          <Col lg="2">
            <Button type="submit" className="rf-add-btn w-100">
              <TbSearch size={16} className="me-1" /> {t("common.search")}
            </Button>
          </Col>
        </Row>
      </Form>

      <Col>
        <div className="rf-table-wrap brk-table-wrap">
          <Table className="rf-table brk-table">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="28%">{t("common.name")}</th>
                <th width="15%">{t("broker.username")}</th>
                <th width="22%">{t("broker.contactEmail")}</th>
                <th width="13%">{t("common.status")}</th>
                <th width="17%" className="text-center">{t("common.action")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="text-center" colSpan={100}>
                    <Spinner />
                  </td>
                </tr>
              ) : (
                Array.isArray(brokerListArray) &&
                brokerListArray.length > 0 &&
                brokerListArray.map((broker) => (
                  <tr key={broker.id}>
                    <td className="text-muted">{broker.id}</td>
                    <td>
                      <div className="brk-name-cell">
                        <div className="brk-avatar">
                          <TbBuildingStore size={18} />
                        </div>
                        <div>
                          <div className="brk-name">{broker.name}</div>
                          <div className="brk-name-sub">#{broker.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="brk-username-pill">
                        <TbKey size={12} /> {broker.username}
                      </span>
                    </td>
                    <td>
                      {broker.contact_email ? (
                        <span className="brk-email-cell">
                          <TbMail size={13} /> {broker.contact_email}
                        </span>
                      ) : "-"}
                    </td>
                    <td>
                      <div className={`brk-status-pill px-4 py-2 font-size-14px ${broker.status ? "active_box" : "inactive_box"}`}>
                        {broker.status ? t("common.active") : t("common.inactive")}
                      </div>
                    </td>
                    <td>
                      <div className="brk-action-group">
                        <button
                          type="button"
                          className="brk-action-btn edit"
                          onClick={() => openEditModal(broker)}
                          title={t("common.edit")}
                        >
                          <LuClipboardPen size={16} />
                        </button>
                        <button
                          type="button"
                          className="brk-action-btn download"
                          onClick={() => openResetModal(broker)}
                          title={t("broker.downloadCredentials")}
                        >
                          <TbDownload size={17} />
                        </button>
                        <button
                          type="button"
                          className="brk-action-btn delete"
                          onClick={() => openDeleteModal(broker.id)}
                          title={t("common.delete")}
                        >
                          <ImBin size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && brokerListArray.length === 0 && (
                <tr className="text-center">
                  <td colSpan={100}>
                    <div className="brk-empty-state">
                      <TbBuildingStore size={36} />
                      <p>{t("common.noData")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <CustomPagination
            recordsPerPage={pageSize}
            totalRecords={totalRecords}
            onPageChange={setCurrentPage}
            currentPage={currentPage}
          />
          <Col lg="2">
            <Form.Group className="mb-3">
              <Form.Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </div>
      </Col>

      {/* Add / Edit modal */}
      <Modal show={showForm} onHide={closeForm} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <TbBuildingStore /> {isEdit ? t("broker.editTitle") : t("broker.addTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="rf-form-card">
          <Form.Group className="mb-3">
            <Form.Label>{t("common.name")}</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("broker.username")}</Form.Label>
            <Form.Control
              type="text"
              value={formData.username}
              disabled={isEdit}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              isInvalid={!!formErrors.username}
            />
            <Form.Control.Feedback type="invalid">{formErrors.username}</Form.Control.Feedback>
            {isEdit && <Form.Text className="text-muted">{t("broker.usernameImmutable")}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{isEdit ? t("broker.newPasswordOptional") : t("broker.password")}</Form.Label>
            <Form.Control
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              isInvalid={!!formErrors.password}
              placeholder={isEdit ? t("broker.leaveBlankToKeep") : ""}
            />
            <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("broker.contactEmail")}</Form.Label>
            <Form.Control
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />
          </Form.Group>

          {isEdit && (
            <Form.Group className="mb-3">
              <Form.Label>{t("common.status")}</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>{t("common.active")}</option>
                <option value={0}>{t("common.inactive")}</option>
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="rf-outline-btn" onClick={closeForm} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button className="rf-submit-btn" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : t("common.submit")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete confirm modal */}
      <Modal show={showDel} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("broker.deleteConfirmTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("broker.deleteConfirmBody")}</Modal.Body>
        <Modal.Footer>
          <Button className="rf-outline-btn" onClick={closeDeleteModal} disabled={deleteLoading}>
            {t("common.cancel")}
          </Button>
          <Button className="rf-submit-btn" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner size="sm" /> : t("common.delete")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset & download credentials confirm modal */}
      <Modal show={showReset} onHide={closeResetModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("broker.resetConfirmTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("broker.resetConfirmBody", { name: resetTarget?.name })}
        </Modal.Body>
        <Modal.Footer>
          <Button className="rf-outline-btn" onClick={closeResetModal} disabled={resetLoading}>
            {t("common.cancel")}
          </Button>
          <Button className="rf-submit-btn" onClick={handleResetAndDownload} disabled={resetLoading}>
            {resetLoading ? <Spinner size="sm" /> : t("broker.resetAndDownload")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Brokers;
