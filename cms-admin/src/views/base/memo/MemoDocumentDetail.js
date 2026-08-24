import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader, Menu, Modal, Button, Group, Tooltip, TagsInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  FaArrowLeft,
  FaEllipsisH,
  FaCheck,
  FaArchive,
  FaTrash,
  FaUpload,
  FaUserShield,
  FaHistory,
  FaEye,
  FaTags,
  FaUser,
  FaCalendarAlt,
  FaCircle,
  FaPlus,
  FaTimes,
  FaDownload,
  FaExclamationTriangle,
} from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import {
  useDocument,
  publishDocument,
  archiveDocument,
  deleteDocument as deleteDoc,
  updateDocument,
  uploadDocumentFile,
  fetchVersions,
} from "./memoStore";
import memoApi from "./memoApi";
import { ACTION_LABELS, formatDate, timeAgo } from "./memoMockData";
import { notifySuccess, notifyError } from "../../../components/notify/notify";
import "./memo.css";

const TABS = [
  { key: "overview", label: "Overview", icon: <FaUser size={11} /> },
  { key: "access",   label: "Access",   icon: <FaUserShield size={11} /> },
];

// Mock per-document data has been removed; everything now comes from
// memoApi (versions, audit). When the backend isn't available the related
// section shows an empty / error state instead of seeded values.

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ConfirmDialog = ({ opened, onConfirm, onClose, title, body, color = "red", confirmLabel, loading = false }) => {
  const { t } = useTranslation();
  return (
    <Modal opened={opened} onClose={onClose} centered size="sm" title={title}>
      <p className="text-muted mb-3">{body}</p>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>{t("Cancel")}</Button>
        <Button color={color} onClick={onConfirm} loading={loading}>{confirmLabel || t("Confirm")}</Button>
      </Group>
    </Modal>
  );
};

const MemoDocumentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { document: doc, loading, error, reload } = useDocument(id);
  const [tab, setTab] = useState("overview");
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [accessOpened, accessHandlers] = useDisclosure(false);
  const [uploadOpened, uploadHandlers] = useDisclosure(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);

  const openUpload = () => {
    setUploadFile(null);
    setUploadNotes("");
    uploadHandlers.open();
  };

  const submitUpload = async () => {
    if (!uploadFile) {
      notifyError(t("Please choose a file first"));
      return;
    }
    setUploadBusy(true);
    try {
      await uploadDocumentFile(id, uploadFile, uploadNotes);
      notifySuccess(t("File uploaded"));
      uploadHandlers.close();
      await reload();
      if (tab === "versions") {
        const v = await fetchVersions(id).catch(() => []);
        setVersions(v);
      }
    } catch (_) { /* toast already raised */ }
    finally { setUploadBusy(false); }
  };

  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  // Inline file preview - the /view endpoint requires Authorization, so we
  // fetch the file as a blob and feed an object URL to the iframe / image.
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewMime, setPreviewMime] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    if (!id || !doc) return undefined;
    let cancelled = false;
    let urlToRevoke = null;
    setPreviewLoading(true);
    setPreviewError(null);
    memoApi
      .fetchDocumentBlob(id)
      .then(({ url, mimeType }) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        urlToRevoke = url;
        setPreviewUrl(url);
        setPreviewMime(mimeType);
      })
      .catch((e) => {
        if (!cancelled) {
          setPreviewUrl(null);
          setPreviewError(e?.message || "Could not load file");
        }
      })
      .finally(() => { if (!cancelled) setPreviewLoading(false); });
    return () => {
      cancelled = true;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [id, doc?.version, doc?.updatedAt]);

  const access = doc?.access || [];
  const views = doc?.views_log || doc?.recentViews || [];

  // Live view count: backend returns the latest `view_count` from the
  // /view-event POST. Fall back to whatever the document load gave us.
  const [liveViewCount, setLiveViewCount] = useState(null);
  useEffect(() => { setLiveViewCount(null); }, [id]);
  useEffect(() => {
    if (!id || !doc) return;
    let cancelled = false;
    memoApi
      .recordView(id)
      .then((r) => {
        if (cancelled) return;
        const payload = r?.data ?? r;
        const next = payload?.view_count ?? payload?.viewCount;
        if (next != null) setLiveViewCount(next);
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // Run once per document mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, doc?.id]);

  const displayedViews =
    liveViewCount ?? doc?.view_count ?? doc?.views ?? 0;

  useEffect(() => {
    if (!id || tab !== "versions") return;
    setVersionsLoading(true);
    fetchVersions(id)
      .then(setVersions)
      .catch(() => setVersions([]))
      .finally(() => setVersionsLoading(false));
  }, [id, tab]);

  if (loading) {
    return (
      <div className="memo-page">
        <div className="memo-card text-center py-5">
          <Loader color="indigo" />
          <p className="text-muted small mt-2 mb-0">{t("Loading memo…")}</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="memo-page">
        <div className="memo-card memo-empty">
          <div className="memo-empty__icon" style={{ color: "var(--memo-danger)" }}>
            <FaExclamationTriangle />
          </div>
          <h5>{error ? t("Could not load memo") : t("Memo not found")}</h5>
          {error && <p className="mb-3">{error.message || t("Please try again.")}</p>}
          <div className="d-flex gap-2 justify-content-center">
            {error && (
              <button className="memo-pillbtn memo-pillbtn--primary" onClick={reload}>{t("Retry")}</button>
            )}
            <Link to="/memo/documents" className="memo-pillbtn">
              <FaArrowLeft size={11} /> {t("Back to Documents")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setDraft({
      title: doc.title || "",
      description: doc.description || "",
      category: doc.category || "",
      tags: Array.isArray(doc.tags) ? doc.tags : [],
    });
    setEditMode(true);
  };
  const saveEdit = async () => {
    setEditBusy(true);
    try {
      const tagsStr = (draft.tags || []).join(",");
      if (tagsStr.length > 500) {
        notifyError(t("Tags must be 500 characters or fewer in total"));
        setEditBusy(false);
        return;
      }
      const payload = {
        title: (draft.title || "").trim(),
        description: (draft.description || "").trim(),
        tags: tagsStr,
      };
      await updateDocument(id, payload);
      await reload();
      setEditMode(false);
      notifySuccess(t("Memo updated"));
    } catch (_) { /* toast already shown */ }
    finally { setEditBusy(false); }
  };

  const setCurrentVersion = async (v) => {
    try {
      await memoApi.setCurrentVersion(id, v.id || v.versionId);
      const next = await fetchVersions(id);
      setVersions(next);
      reload();
      notifySuccess(t("v{{version}} is now the current version", { version: v.version }));
    } catch (_) { /* toast already shown */ }
  };

  const revokeAccess = async (entry) => {
    try {
      await memoApi.revokeAccess(id, entry.id || entry.entryId);
      await reload();
      notifySuccess(t("Access revoked"));
    } catch (_) { /* toast already shown */ }
  };

  const onAction = (key) => {
    if (key === "publish") {
      setConfirm({
        title: t("Publish memo"),
        body: t('"{{title}}" will become visible to all assigned users.', { title: doc.title }),
        color: "indigo",
        confirmLabel: t("Publish"),
        action: async () => {
          await publishDocument(id);
          await reload();
          notifySuccess(t("Published"));
        },
      });
    }
    if (key === "archive") {
      setConfirm({
        title: t("Archive memo"),
        body: t('"{{title}}" will be hidden from end users but kept for record.', { title: doc.title }),
        color: "orange",
        confirmLabel: t("Archive"),
        action: async () => {
          await archiveDocument(id);
          await reload();
          notifySuccess(t("Archived"));
        },
      });
    }
    if (key === "delete") {
      setConfirm({
        title: t("Delete memo"),
        body: t('"{{title}}" will be permanently removed. This cannot be undone.', { title: doc.title }),
        color: "red",
        confirmLabel: t("Delete"),
        action: async () => {
          await deleteDoc(id);
          notifySuccess(t("Deleted"));
          navigate("/memo/documents");
        },
      });
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmBusy(true);
    try { await confirm.action?.(); }
    catch { /* toast already shown */ }
    finally {
      setConfirmBusy(false);
      setConfirm(null);
    }
  };

  return (
    <div className="memo-page">
      {/* Header */}
      <button
        className="memo-pillbtn mb-3"
        onClick={() => navigate("/memo/documents")}
      >
        <FaArrowLeft size={11} /> {t("All documents")}
      </button>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="memo-hero">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="memo-hero__eyebrow">
              <span className={`memo-hero__status memo-hero__status--${doc.status || "draft"}`}>
                {(doc.status || "draft").toUpperCase()}
              </span>
              {doc.category && (
                <span className="memo-hero__chip">
                  <FaTags size={10} /> {doc.category}
                </span>
              )}
            </div>
            <h1>{doc.title}</h1>
            <div className="memo-hero__meta">
              <span><FaCalendarAlt size={11} style={{ marginRight: 6 }} />{doc.publishedAt ? t("Published {{date}}", { date: formatDate(doc.publishedAt) }) : t("Not published")}</span>
              <span><FaUser size={11} style={{ marginRight: 6 }} />{t("Admin")}</span>
              <span><FaEye size={11} style={{ marginRight: 6 }} />{displayedViews} {displayedViews === 1 ? t("view") : t("views")}</span>
            </div>
          </div>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <button
                className="memo-iconbtn"
                style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}
              >
                <FaEllipsisH size={14} />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              {doc.status !== "published" && (
                <Menu.Item leftSection={<FaCheck size={12} />} onClick={() => onAction("publish")}>{t("Publish")}</Menu.Item>
              )}
              {doc.status === "published" && (
                <Menu.Item leftSection={<FaArchive size={12} />} onClick={() => onAction("archive")}>{t("Archive")}</Menu.Item>
              )}
              <Menu.Item leftSection={<FaUpload size={12} />} onClick={openUpload}>{t("Upload Version")}</Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<FaTrash size={12} />} color="red" onClick={() => onAction("delete")}>{t("Delete")}</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="memo-tabs">
        {TABS.map((tabItem) => {
          const count =
            tabItem.key === "versions" ? versions.length :
            tabItem.key === "access"   ? access.length   : null;
          return (
            <button
              key={tabItem.key}
              className={`memo-tab ${tab === tabItem.key ? "memo-tab--active" : ""}`}
              onClick={() => setTab(tabItem.key)}
            >
              <span style={{ marginRight: 6 }}>{tabItem.icon}</span>
              {t(tabItem.label)}
              {count != null && <span className="memo-tab__count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "overview" && (
            <div className="row g-3">
              <div className="col-12 col-lg-7">
                <div className="memo-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="memo-card__title mb-0">{t("File Preview")}</h3>
                    {previewUrl ? (
                      <Tooltip label={t("Open in new tab")}>
                        <a
                          className="memo-iconbtn"
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FaDownload size={11} />
                        </a>
                      </Tooltip>
                    ) : (
                      <Tooltip label={t("No file uploaded yet")}>
                        <button className="memo-iconbtn" disabled style={{ opacity: 0.5 }}>
                          <FaDownload size={11} />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                  {previewLoading ? (
                    <div className="memo-pdf-frame" style={{ minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Loader color="indigo" />
                    </div>
                  ) : previewUrl ? (
                    previewMime.startsWith("image/") ? (
                      <div className="memo-pdf-frame" style={{ padding: 0, textAlign: "center", background: "#f6f7fb" }}>
                        <img
                          src={previewUrl}
                          alt={doc.title || t("Memo file")}
                          style={{ maxWidth: "100%", maxHeight: 720, display: "block", margin: "0 auto" }}
                        />
                      </div>
                    ) : (
                      <div className="memo-pdf-frame" style={{ padding: 0, height: 720, overflow: "hidden" }}>
                        <iframe
                          title={doc.title || t("File preview")}
                          src={`${previewUrl}#toolbar=1&view=FitH`}
                          style={{ width: "100%", height: "100%", border: 0, background: "#fff" }}
                        />
                      </div>
                    )
                  ) : (
                    <div className="memo-pdf-frame">
                      <div
                        className="memo-pdf-page"
                        data-watermark={`admin@routefacilecarrental.com · ${new Date().toISOString().slice(0, 19)}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--memo-text-soft)",
                          fontSize: 13,
                          textAlign: "center",
                          padding: 32,
                        }}
                      >
                        {previewError || t("No file has been uploaded for this memo yet.")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 col-lg-5">
                <div className="memo-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="memo-card__title mb-0">{t("Metadata")}</h3>
                    {!editMode ? (
                      <button className="memo-pillbtn" onClick={startEdit}>{t("Edit")}</button>
                    ) : (
                      <div className="d-flex gap-2">
                      <button className="memo-pillbtn" onClick={() => setEditMode(false)} disabled={editBusy}>{t("Cancel")}</button>
                      <button className="memo-pillbtn memo-pillbtn--primary" onClick={saveEdit} disabled={editBusy}>
                        {editBusy ? t("Saving…") : t("Save")}
                      </button>
                      </div>
                    )}
                  </div>

                  {!editMode ? (
                    <dl className="row mb-0 small">
                      <dt className="col-4 text-muted">{t("Status")}</dt>
                      <dd className="col-8"><StatusBadge status={doc.status} /></dd>
                      <dt className="col-4 text-muted">{t("Category")}</dt>
                      <dd className="col-8">{doc.category}</dd>
                      <dt className="col-4 text-muted">{t("Description")}</dt>
                      <dd className="col-8">{doc.description || "—"}</dd>
                      <dt className="col-4 text-muted">{t("Tags")}</dt>
                      <dd className="col-8">
                        {(doc.tags || []).length === 0
                          ? "—"
                          : (doc.tags || []).map((tag) => <span key={tag} className="memo-chip">#{tag}</span>)}
                      </dd>
                      <dt className="col-4 text-muted">{t("Uploaded by")}</dt>
                      <dd className="col-8">{t("Admin")}</dd>
                      <dt className="col-4 text-muted">{t("Published")}</dt>
                      <dd className="col-8">{formatDate(doc.publishedAt)}</dd>
                    </dl>
                  ) : (
                    <div>
                      <label className="form-label small text-muted">{t("Title")}</label>
                      <input
                        className="form-control mb-2"
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      />
                      <label className="form-label small text-muted">{t("Description")}</label>
                      <textarea
                        className="form-control mb-2"
                        rows={3}
                        value={draft.description || ""}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      />
                      <TagsInput
                        label={t("Tags")}
                        placeholder={t("Press enter to add")}
                        value={draft.tags || []}
                        onChange={(tags) => setDraft({ ...draft, tags })}
                        clearable
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "access" && (
            <div className="memo-card">
              <div className="mb-3">
                <h3 className="memo-card__title mb-0">{t("Access entries")}</h3>
                <p className="memo-card__subtitle mb-0">{t("Who can view this memo")}</p>
              </div>
              <ul className="list-unstyled m-0">
                {access.length === 0 && (
                  <li className="text-muted small py-3">{t("No access entries yet.")}</li>
                )}
                {access.map((a) => (
                  <li
                    key={a.id}
                    className="d-flex align-items-center gap-3 py-2"
                    style={{ borderBottom: "1px dashed var(--memo-border)" }}
                  >
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "var(--memo-primary-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem",
                      }}
                    >
                      {a.icon || "🔑"}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{a.value}</div>
                      <small className="text-muted">{a.type}</small>
                    </div>
                    <button
                      className="memo-iconbtn memo-iconbtn--danger"
                      onClick={() => revokeAccess(a)}
                    >
                      <FaTimes size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmDialog
        opened={!!confirm}
        onClose={() => !confirmBusy && setConfirm(null)}
        title={confirm?.title}
        body={confirm?.body}
        color={confirm?.color}
        confirmLabel={confirm?.confirmLabel}
        loading={confirmBusy}
        onConfirm={runConfirm}
      />

      <Modal
        opened={uploadOpened}
        onClose={() => !uploadBusy && uploadHandlers.close()}
        centered
        title={t("Upload new version")}
        size="md"
      >
        <div>
          <label className="form-label small text-muted">{t("File")}</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/png,image/jpeg"
            className="form-control mb-3"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            disabled={uploadBusy}
          />
          {uploadFile && (
            <div className="text-muted small mb-2">
              {t("Selected:")} <strong>{uploadFile.name}</strong>{" "}
              ({t("{{size}} KB", { size: Math.round(uploadFile.size / 1024) })})
            </div>
          )}
          <div className="text-muted small mb-3" style={{ fontSize: 11 }}>
            {t("Allowed: PDF, Word, Excel, PowerPoint, PNG, JPG. Max 25 MB.")}
          </div>
          <label className="form-label small text-muted">{t("Change notes (optional)")}</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder={t("What changed in this version?")}
            value={uploadNotes}
            onChange={(e) => setUploadNotes(e.target.value)}
            disabled={uploadBusy}
          />
        </div>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={uploadHandlers.close} disabled={uploadBusy}>
            {t("Cancel")}
          </Button>
          <Button
            color="indigo"
            loading={uploadBusy}
            onClick={submitUpload}
            disabled={!uploadFile}
          >
            {t("Upload")}
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default MemoDocumentDetail;
