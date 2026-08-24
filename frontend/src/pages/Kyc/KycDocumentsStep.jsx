import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_KYC_CONFIG,
  DOCUMENT_TYPES,
  formatBytes,
  isDocRequired,
  validateFile,
} from "./kycHelpers";

const Dropzone = ({ docKey, label, required, file, onPick, onClear }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = (fileList) => {
    setError("");
    const f = fileList && fileList[0];
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setError(t(err));
      return;
    }
    onPick(f);
  };

  const onDrop = (ev) => {
    ev.preventDefault();
    setActive(false);
    handleFiles(ev.dataTransfer.files);
  };

  const onDragOver = (ev) => {
    ev.preventDefault();
    setActive(true);
  };

  const dropzoneClass =
    "kyc-dropzone" +
    (active ? " is-active" : "") +
    (file ? " has-file" : "") +
    (!required ? " is-optional" : "");

  return (
    <div
      className={dropzoneClass}
      onDragOver={onDragOver}
      onDragLeave={() => setActive(false)}
      onDrop={onDrop}
      onClick={() => !file && inputRef.current && inputRef.current.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic,image/heif"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <h5>
        {t(label)}{" "}
        {required ? (
          <span className="req">*</span>
        ) : (
          <span className="kyc-chip-soft">{t("Optional")}</span>
        )}
      </h5>
      <div className="hint">
        {required
          ? t("PDF, JPG, PNG, HEIC — max 10 MB.")
          : t("Optional — upload only if available.")}
      </div>

      {!file && (
        <div className="hint">{t("Click or drop a file here to upload.")}</div>
      )}

      {file && (
        <div className="kyc-doc-preview">
          <div className="thumb">
            {previewUrl ? (
              <img src={previewUrl} alt="" />
            ) : (
              <span>{file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "FILE"}</span>
            )}
          </div>
          <div className="meta">
            <div className="fname">{file.name}</div>
            <div className="fsize">
              {formatBytes(file.size)} · {file.type || t("unknown")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="kyc-btn kyc-btn-link"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current && inputRef.current.click();
              }}
            >
              {t("Replace")}
            </button>
            <button
              type="button"
              className="kyc-btn kyc-btn-link"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              {t("Remove")}
            </button>
          </div>
        </div>
      )}

      {error && <div className="err">{error}</div>}
    </div>
  );
};

/**
 * Step 4 — Document dropzones. Required vs optional driven by GET /kyc/config.
 */
const KycDocumentsStep = ({ documents, config, onChange, onBack, onContinue }) => {
  const { t } = useTranslation();
  const cfg = config || DEFAULT_KYC_CONFIG;
  const requiredDocs = DOCUMENT_TYPES.filter((d) => isDocRequired(d.key, cfg));
  const allRequiredFilled = requiredDocs.every((d) => documents[d.key]);

  const update = (key, file) => onChange({ ...documents, [key]: file });

  return (
    <div className="kyc-card">
      <h2 className="kyc-title">{t("Upload your documents")}</h2>
      <p className="kyc-subtitle">
        {t("One file per document. Optional items can be skipped.")}
      </p>

      <div className="kyc-doc-list">
        {DOCUMENT_TYPES.map((d) => (
          <Dropzone
            key={d.key}
            docKey={d.key}
            label={d.labelKey}
            required={isDocRequired(d.key, cfg)}
            file={documents[d.key]}
            onPick={(file) => update(d.key, file)}
            onClear={() => update(d.key, null)}
          />
        ))}
      </div>

      <div className="kyc-actions">
        <button type="button" className="kyc-btn kyc-btn-secondary" onClick={onBack}>
          {t("Back")}
        </button>
        <button
          type="button"
          className="kyc-btn kyc-btn-primary"
          onClick={onContinue}
          disabled={!allRequiredFilled}
        >
          {t("Continue")}
        </button>
      </div>
    </div>
  );
};

export default KycDocumentsStep;
