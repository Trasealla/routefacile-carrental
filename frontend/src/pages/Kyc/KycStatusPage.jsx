import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import JSConfetti from "js-confetti";

import "../../styles/kyc.css";
import "../../styles/kyc-status.css";

import logoNew from "../../assets/new-logo/logo.png";
import heroBg from "../../assets/all-images/bg-uae.png";

import {
  buildAttachmentDownloadUrl,
  buildAttachmentPreviewUrl,
  buildSignatureUrl,
  getKycStatus,
} from "../../actions/kycApi";
import {
  copyToClipboard,
  DOCUMENT_TYPES,
  formatBytes,
  formatDateTime,
  getTimelineLabel,
  saveKycReferenceToken,
  STATUS_COLORS,
} from "./kycHelpers";
import { notifySuccess } from "../../SharedComponent/notify";
import PrivacyNotice from "../../components/UI/PrivacyNotice/PrivacyNotice";

const STATUS_HEADLINES = {
  draft: "Draft — Finish your application.",
  submitted: "Submitted — We've got everything we need.",
  success: "Submitted — We've got everything we need.",
  pending: "Submitted — We've got everything we need.",
  under_review: "Under Review — Our team is verifying your details.",
  approved: "Approved — You're all set! Our team will reach out shortly.",
  rejected: "Rejected — We need a few changes.",
};

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  success: "Submitted",
  pending: "Pending Review",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

const isImageMime = (mime, name) => {
  if (mime && mime.startsWith("image/")) return true;
  if (!name) return false;
  const n = name.toLowerCase();
  return (
    n.endsWith(".jpg") ||
    n.endsWith(".jpeg") ||
    n.endsWith(".png") ||
    n.endsWith(".heic") ||
    n.endsWith(".heif") ||
    n.endsWith(".webp")
  );
};

const isPdfMime = (mime, name) => {
  if (mime === "application/pdf") return true;
  return name && name.toLowerCase().endsWith(".pdf");
};

const SkeletonGallery = () => (
  <div className="kyc-gallery">
    {[0, 1, 2].map((i) => (
      <div key={i} className="kyc-doc-card kyc-skel" aria-hidden>
        <div className="kyc-skel-thumb" />
        <div className="kyc-skel-line" />
        <div className="kyc-skel-line short" />
      </div>
    ))}
  </div>
);

const Lightbox = ({ items, index, onClose, onPrev, onNext, referenceToken }) => {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [index]);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  if (index < 0 || index >= items.length) return null;
  const item = items[index];
  const url = buildAttachmentPreviewUrl(item.id, referenceToken);
  const isImg = isImageMime(item.file_type, item.original_name);
  const isPdf = isPdfMime(item.file_type, item.original_name);

  return (
    <div className="kyc-lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button
        type="button"
        className="kyc-lightbox-close"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
      {items.length > 1 && (
        <>
          <button
            type="button"
            className="kyc-lightbox-nav prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="kyc-lightbox-nav next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            ›
          </button>
        </>
      )}
      <div className="kyc-lightbox-stage" onClick={(e) => e.stopPropagation()}>
        {isImg && !imgFailed && (
          <img
            src={url}
            alt=""
            className="kyc-lightbox-img"
            onError={() => setImgFailed(true)}
          />
        )}
        {isPdf && (
          <iframe src={url} title={item.original_name} className="kyc-lightbox-pdf" />
        )}
        {((!isImg && !isPdf) || (isImg && imgFailed)) && (
          <div className="kyc-lightbox-fallback">
            <div className="kyc-lightbox-fallback-icon" aria-hidden>📄</div>
            <p>{item.original_name}</p>
            <p className="kyc-lightbox-fallback-hint">
              Preview is unavailable. You can download the original file below.
            </p>
            <a
              className="kyc-btn kyc-btn-primary"
              href={url}
              target="_blank"
              rel="noreferrer"
              download={item.original_name}
            >
              ⤓ Download
            </a>
          </div>
        )}
        <div className="kyc-lightbox-meta">
          <strong>{item.original_name}</strong>
          <span>
            {formatBytes(item.file_size)} · {formatDateTime(item.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

const EXT_COLORS = {
  pdf: { bg: "#fde7e9", fg: "#b3261e" },
  png: { bg: "#e8f1ff", fg: "#1565c0" },
  jpg: { bg: "#e8f1ff", fg: "#1565c0" },
  jpeg: { bg: "#e8f1ff", fg: "#1565c0" },
  heic: { bg: "#fff3ea", fg: "#ad4d13" },
  heif: { bg: "#fff3ea", fg: "#ad4d13" },
  default: { bg: "#eef1f7", fg: "#5d6477" },
};

const DocumentCard = ({ attachment, referenceToken, onOpen, t }) => {
  const url = buildAttachmentPreviewUrl(attachment.id, referenceToken);
  const isImg = isImageMime(attachment.file_type, attachment.original_name);
  const [imgFailed, setImgFailed] = useState(false);
  const docTypeLabel = DOCUMENT_TYPES.find(
    (d) => d.key === attachment.document_type
  );
  const ext = (attachment.original_name || "FILE").split(".").pop().toUpperCase();
  const extColor = EXT_COLORS[ext.toLowerCase()] || EXT_COLORS.default;

  const showImage = isImg && !imgFailed;

  return (
    <div
      className="kyc-doc-card"
      tabIndex={0}
      role="button"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="kyc-doc-thumb">
        {showImage ? (
          <img
            src={url}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="kyc-doc-thumb-fallback"
            style={{ background: extColor.bg }}
          >
            <span className="ext-icon" aria-hidden style={{ color: extColor.fg }}>
              {ext === "PDF" ? "📕" : "🖼"}
            </span>
            <span
              className="ext"
              style={{ background: extColor.fg, color: "#fff" }}
            >
              {ext}
            </span>
          </div>
        )}
      </div>
      <div className="kyc-doc-body">
        <div className="kyc-doc-type">
          {t(docTypeLabel ? docTypeLabel.labelKey : attachment.document_type)}
        </div>
        <div className="kyc-doc-name" title={attachment.original_name}>
          {attachment.original_name}
        </div>
        <div className="kyc-doc-sub">
          {formatBytes(attachment.file_size)} · {formatDateTime(attachment.created_at)}
        </div>
      </div>
      <a
        className="kyc-doc-download"
        href={buildAttachmentDownloadUrl(attachment.id, referenceToken)}
        download
        onClick={(e) => e.stopPropagation()}
        aria-label={t("Download")}
        title={t("Download")}
      >
        ⤓
      </a>
    </div>
  );
};

/* ---------- Applicant info ---------- */
const fmtPhone = (code, num) => {
  const c = (code || "").toString().trim();
  const n = (num || "").toString().trim();
  if (!c && !n) return "";
  return `${c ? `+${c.replace(/^\+/, "")}` : ""} ${n}`.trim();
};

const InfoRow = ({ label, value }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="kyc-info-row">
      <div className="kyc-info-label">{label}</div>
      <div className="kyc-info-value">{value}</div>
    </div>
  );
};

const ApplicantInfo = ({ data, t }) => {
  // Backend may return fields at top level, under .identity, .details, or .customer.
  const id = data.identity || {};
  const det = data.details || {};
  const cust = data.customer || {};
  const pick = (...keys) => {
    for (const k of keys) {
      const v =
        (data && data[k]) ??
        (cust && cust[k]) ??
        (id && id[k]) ??
        (det && det[k]);
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return "";
  };

  const fullName = pick("full_name", "name", "customer_name");
  const firstName = pick("first_name", "given_name");
  const lastName = pick("last_name", "family_name", "surname");
  const displayName =
    fullName || [firstName, lastName].filter(Boolean).join(" ");
  const dob = pick("date_of_birth", "dob", "birth_date");
  const gender = pick("gender", "sex");
  const nationality = pick("nationality", "country");
  const eid = pick("cities_id_number", "cities_id_no", "eid");
  const passport = pick("passport_number", "passport_no");
  const email = pick("email", "email_address");
  const mobile = fmtPhone(
    pick("contact_mobile_code", "mobile_code", "phone_code"),
    pick("contact_mobile_number", "mobile_number", "phone_number", "phone")
  );
  const landline = fmtPhone(
    pick("contact_landline_code", "landline_code"),
    pick("contact_landline_number", "landline_number")
  );
  const residential = pick("residential_address", "address");
  const company = pick("company_name", "employer");
  const companyAddress = pick("company_address", "employer_address");
  const companyPhone = fmtPhone(
    pick("company_phone_code"),
    pick("company_phone_number")
  );

  const personalAny = displayName || dob || gender || nationality || eid || passport;
  const contactAny = email || mobile || landline || residential;
  const companyAny = company || companyAddress || companyPhone;

  if (!personalAny && !contactAny && !companyAny) return null;

  return (
    <>
      {personalAny && (
        <section className="kyc-paper-section">
          <div className="kyc-info-grid">
            <InfoRow label={t("Full Name")} value={displayName} />
            <InfoRow label={t("Date of Birth")} value={dob} />
            <InfoRow label={t("Gender")} value={gender} />
            <InfoRow label={t("Nationality")} value={nationality} />
            <InfoRow label={t("National ID")} value={eid} />
            <InfoRow label={t("Passport No.")} value={passport} />
          </div>
        </section>
      )}
      {contactAny && (
        <section className="kyc-paper-section">
          <div className="kyc-info-grid">
            <InfoRow label={t("Email")} value={email} />
            <InfoRow label={t("Mobile")} value={mobile} />
            <InfoRow label={t("Landline")} value={landline} />
            <InfoRow
              label={t("Residential Address")}
              value={residential}
            />
          </div>
        </section>
      )}
      {companyAny && (
        <section className="kyc-paper-section">
          <div className="kyc-info-grid">
            <InfoRow label={t("Company")} value={company} />
            <InfoRow label={t("Company Address")} value={companyAddress} />
            <InfoRow label={t("Company Phone")} value={companyPhone} />
          </div>
        </section>
      )}
    </>
  );
};

const GhostCard = ({ docKey, required, t }) => {
  const docTypeLabel = DOCUMENT_TYPES.find((d) => d.key === docKey);
  return (
    <div className="kyc-doc-card kyc-doc-ghost" aria-disabled="true">
      <div className="kyc-doc-thumb is-ghost">
        <span>—</span>
      </div>
      <div className="kyc-doc-body">
        <div className="kyc-doc-type">
          {t(docTypeLabel ? docTypeLabel.labelKey : docKey)}
        </div>
        <div className="kyc-doc-name">{t("Not provided")}</div>
        <div className="kyc-doc-sub">{required ? t("Required") : t("Optional")}</div>
      </div>
    </div>
  );
};

const Timeline = ({ events, status, t }) => {
  const items = (events && events.length ? events : []).map((e) => ({
    event: e.event,
    at: e.at,
    label: e.label || t(getTimelineLabel(e.event)),
  }));
  if (
    ["approved", "rejected"].includes(status) &&
    !items.find((i) => i.event === status)
  ) {
    items.push({ event: status, at: null, label: t(getTimelineLabel(status)) });
  }
  if (items.length === 0) {
    items.push({
      event: "submitted",
      at: null,
      label: t(getTimelineLabel("submitted")),
    });
  }
  return (
    <div className="kyc-timeline" role="list">
      {items.map((it, idx) => {
        const completed = !!it.at;
        const isLast = idx === items.length - 1;
        return (
          <div
            key={`${it.event}-${idx}`}
            className={`kyc-timeline-step${completed ? " is-done" : " is-pending"}`}
            role="listitem"
            aria-current={completed && isLast ? "step" : undefined}
          >
            <div className="kyc-timeline-dot" aria-hidden>
              {completed ? "✓" : "•"}
            </div>
            <div className="kyc-timeline-text">
              <div className="lbl">{it.label}</div>
              <div className="at">{it.at ? formatDateTime(it.at) : t("Pending")}</div>
            </div>
            {!isLast && (
              <div className={`kyc-timeline-bar${completed ? " is-done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Print-only A4 summary ----------
   The print stylesheet (kyc-status.css `.kyc-print-only`) hides everything
   except this block when the user clicks "Print summary". Without this
   markup the printed PDF is blank. */
const PrintSummary = ({
  data,
  attachments,
  ghostDocs,
  signatureMeta,
  hasSignature,
  status,
  referenceToken,
  rejectionReason,
  t,
}) => {
  const id = data.identity || {};
  const det = data.details || {};
  const cust = data.customer || {};
  const pick = (...keys) => {
    for (const k of keys) {
      const v =
        (data && data[k]) ??
        (cust && cust[k]) ??
        (id && id[k]) ??
        (det && det[k]);
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return "";
  };
  const fmtPhoneLocal = (code, num) => {
    const c = (code || "").toString().trim();
    const n = (num || "").toString().trim();
    if (!c && !n) return "";
    return `${c ? `+${c.replace(/^\+/, "")}` : ""} ${n}`.trim();
  };

  const fullName = pick("full_name", "name", "customer_name");
  const firstName = pick("first_name", "given_name");
  const lastName = pick("last_name", "family_name", "surname");
  const displayName =
    fullName || [firstName, lastName].filter(Boolean).join(" ");
  const dob = pick("date_of_birth", "dob", "birth_date");
  const gender = pick("gender", "sex");
  const nationality = pick("nationality", "country");
  const eid = pick("cities_id_number", "cities_id_no", "eid");
  const passport = pick("passport_number", "passport_no");
  const email = pick("email", "email_address");
  const mobile = fmtPhoneLocal(
    pick("contact_mobile_code", "mobile_code", "phone_code"),
    pick("contact_mobile_number", "mobile_number", "phone_number", "phone")
  );
  const landline = fmtPhoneLocal(
    pick("contact_landline_code", "landline_code"),
    pick("contact_landline_number", "landline_number")
  );
  const residential = pick("residential_address", "address");
  const company = pick("company_name", "employer");
  const companyAddress = pick("company_address", "employer_address");
  const companyPhone = fmtPhoneLocal(
    pick("company_phone_code"),
    pick("company_phone_number")
  );

  const submittedAt = data.submitted_at ? formatDateTime(data.submitted_at) : "—";
  const generatedAt = formatDateTime(new Date());
  const statusLabel = t(STATUS_LABELS[status] || status);
  const statusClass = `kyc-print-status-${status}`;

  const Row = ({ label, value, mono }) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <tr>
        <th>{label}</th>
        <td className={mono ? "mono" : undefined}>{value}</td>
      </tr>
    );
  };

  const personalRows = (
    <>
      <Row label={t("Full Name")} value={displayName} />
      <Row label={t("Date of Birth")} value={dob} />
      <Row label={t("Gender")} value={gender} />
      <Row label={t("Nationality")} value={nationality} />
      <Row label={t("National ID")} value={eid} mono />
      <Row label={t("Passport No.")} value={passport} mono />
    </>
  );
  const contactRows = (
    <>
      <Row label={t("Email")} value={email} />
      <Row label={t("Mobile")} value={mobile} mono />
      <Row label={t("Landline")} value={landline} mono />
      <Row label={t("Residential Address")} value={residential} />
    </>
  );
  const companyRows = (
    <>
      <Row label={t("Company")} value={company} />
      <Row label={t("Company Address")} value={companyAddress} />
      <Row label={t("Company Phone")} value={companyPhone} mono />
    </>
  );

  const hasPersonal = !!(displayName || dob || gender || nationality || eid || passport);
  const hasContact = !!(email || mobile || landline || residential);
  const hasCompany = !!(company || companyAddress || companyPhone);

  return (
    <div className="kyc-print-only" aria-hidden="true">
      <div className="kyc-print-bar" />

      <div className="kyc-print-head">
        <div className="kyc-print-brand">
          <span className="kyc-print-brand-sub">{t("AECB Compliance")}</span>
          <span className="kyc-print-brand-name">Route Facile</span>
        </div>
        <div className="kyc-print-head-right">
          <span className={`kyc-print-status ${statusClass}`}>
            <span className="dot" />
            {statusLabel}
          </span>
          <span className="kyc-print-confidential">{t("Confidential")}</span>
        </div>
      </div>

      <div className="kyc-print-title">
        <div className="kyc-print-title-eyebrow">{t("KYC Application Record")}</div>
        <h1 className="kyc-print-title-h1">{t("Your KYC Application Summary")}</h1>
        <div className="kyc-print-title-sub">
          {t("Below is the official record of your submission. Keep this page for your reference.")}
        </div>
      </div>

      <div className="kyc-print-strip">
        <div>
          <span className="lbl">{t("Reference")}</span>
          <span className="val mono">{referenceToken}</span>
        </div>
        <div>
          <span className="lbl">{t("Status")}</span>
          <span className="val">{statusLabel}</span>
        </div>
        <div>
          <span className="lbl">{t("Submitted")}</span>
          <span className="val">{submittedAt}</span>
        </div>
        <div>
          <span className="lbl">{t("Generated")}</span>
          <span className="val">{generatedAt}</span>
        </div>
      </div>

      {status === "rejected" && (
        <section className="kyc-print-section kyc-print-rejection">
          <h3>{t("Why was this rejected?")}</h3>
          <p>{rejectionReason || t("Please contact our team for details.")}</p>
        </section>
      )}

      {hasPersonal && (
        <section className="kyc-print-section">
          <h3>{t("Personal Information")}</h3>
          <table className="kyc-print-table">
            <tbody>{personalRows}</tbody>
          </table>
        </section>
      )}

      {(hasContact || hasCompany) && (
        <div className="kyc-print-row">
          {hasContact && (
            <section className="kyc-print-section">
              <h3>{t("Contact")}</h3>
              <table className="kyc-print-table">
                <tbody>{contactRows}</tbody>
              </table>
            </section>
          )}
          {hasCompany && (
            <section className="kyc-print-section">
              <h3>{t("Employment")}</h3>
              <table className="kyc-print-table">
                <tbody>{companyRows}</tbody>
              </table>
            </section>
          )}
        </div>
      )}

      <section className="kyc-print-section">
        <h3>
          {t("Documents Submitted")}
          <span className="kyc-print-h3-meta">
            {attachments.length} {t("of")} {attachments.length + ghostDocs.length}
          </span>
        </h3>
        <table className="kyc-print-table">
          <tbody>
            {attachments.map((a) => {
              const docTypeLabel = DOCUMENT_TYPES.find(
                (d) => d.key === a.document_type
              );
              return (
                <tr key={`atc-${a.id}`}>
                  <th>
                    {t(docTypeLabel ? docTypeLabel.labelKey : a.document_type || t("Document"))}
                  </th>
                  <td>
                    <span className="kyc-print-mark ok">{t("Provided")}</span>
                  </td>
                </tr>
              );
            })}
            {ghostDocs.map((d) => {
              const required = d.key !== "passport_visa";
              return (
                <tr key={`ghost-${d.key}`}>
                  <th>{t(d.labelKey)}</th>
                  <td>
                    <span className="kyc-print-mark no">
                      {required ? t("Missing") : t("Not provided")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {hasSignature && (
        <section className="kyc-print-section">
          <h3>
            {t("Signature")}
            {signatureMeta && signatureMeta.signed_at && (
              <span className="kyc-print-h3-meta">
                {t("Signed at")} {formatDateTime(signatureMeta.signed_at)}
              </span>
            )}
          </h3>
          <table className="kyc-print-table">
            <tbody>
              <Row
                label={t("Method")}
                value={
                  signatureMeta && signatureMeta.method === "typed"
                    ? t("Typed")
                    : t("Drawn")
                }
              />
              <Row label={t("Status")} value={t("Signed")} />
            </tbody>
          </table>
        </section>
      )}

      <p className="kyc-print-attest">
        {t("This document is an electronically generated summary of the applicant's KYC submission to Route Facile. It is provided for the applicant's records and is subject to verification.")}
      </p>

      <div className="kyc-print-foot">
        <div className="kyc-print-foot-note">
          {t("Generated by Route Facile KYC")} · routefacilerental@gmail.com
        </div>
        <div className="kyc-print-foot-meta">
          <span>{t("Reference")}: {referenceToken}</span>
          <span>{generatedAt}</span>
        </div>
      </div>
    </div>
  );
};

const KycStatusPage = () => {
  const { t } = useTranslation();
  const { lang, token: tokenParam, reference_token: referenceParam } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fresh = searchParams.get("fresh") === "1";

  const referenceToken = tokenParam || referenceParam || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const confettiFiredRef = useRef(false);

  const fetchStatus = async () => {
    if (!referenceToken) return;
    setLoading(true);
    setErrorMsg("");
    const res = await getKycStatus(referenceToken);
    setLoading(false);
    if (!res.ok || !res.data) {
      setData(null);
      setErrorMsg(res.errorMessage || t("Application not found"));
      return;
    }
    setData(res.data);
    saveKycReferenceToken(referenceToken);
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceToken]);

  useEffect(() => {
    if (!data) return;
    const status = (data.status || "").toLowerCase();
    if (confettiFiredRef.current) return;
    if (fresh || status === "approved") {
      try {
        const c = new JSConfetti();
        c.addConfetti({
          confettiColors: ["#1565c0", "#1f8a4c", "#f4b400", "#e91e63", "#9b59b6"],
          confettiNumber: 160,
        });
      } catch {
        /* non-critical */
      }
      confettiFiredRef.current = true;
      if (fresh) {
        const next = new URLSearchParams(searchParams);
        next.delete("fresh");
        setSearchParams(next, { replace: true });
      }
    }
  }, [data, fresh, searchParams, setSearchParams]);

  const handleCopyToken = () => {
    copyToClipboard(referenceToken).then((ok) => {
      if (ok) notifySuccess(t("Reference token copied to clipboard"));
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${
      lang || "en"
    }/kyc/status/${encodeURIComponent(referenceToken)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: t("My KYC Application"), url });
        return;
      } catch {
        /* fall through */
      }
    }
    const ok = await copyToClipboard(url);
    if (ok) notifySuccess(t("Link copied to clipboard"));
  };

  const handlePrint = () => {
    // The browser's print header shows document.title. Override it to the
    // company name so the PDF header reads "Route Facile" instead
    // of the marketing site title.
    const originalTitle = document.title;
    const printTitle = `Route Facile — KYC ${referenceToken || ""}`.trim();
    document.title = printTitle;
    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
    // Safety net for browsers that don't fire afterprint reliably.
    setTimeout(restore, 1000);
  };

  const handleDownloadAll = () => {
    if (!data || !data.attachments) return;
    data.attachments.forEach((a, i) => {
      setTimeout(() => {
        const url = buildAttachmentDownloadUrl(a.id, referenceToken);
        const link = document.createElement("a");
        link.href = url;
        link.download = a.original_name || `attachment-${a.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, i * 250);
    });
  };

  if (loading && !data) {
    return (
      <main className="kyc-status-page">
        <div className="kyc-container">
          <div className="kyc-card kyc-skel-card">
            <div className="kyc-skel-line lg" />
            <div className="kyc-skel-line short" />
          </div>
          <SkeletonGallery />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="kyc-status-page">
        <div className="kyc-container">
          <div className="kyc-card kyc-empty">
            <div className="kyc-empty-icon" aria-hidden>🔍</div>
            <h2 className="kyc-title">{t("Application not found")}</h2>
            <p className="kyc-subtitle">
              {errorMsg || t("We couldn't find an application with that reference.")}
            </p>
            <div className="kyc-actions" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="kyc-btn kyc-btn-primary"
                onClick={() => navigate(`/${lang || "en"}/kyc`)}
              >
                {t("Start a new application")}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const status = (data.status || "submitted").toLowerCase();
  const colors = STATUS_COLORS[status] || STATUS_COLORS.submitted;
  const headline = t(STATUS_HEADLINES[status] || STATUS_HEADLINES.submitted);
  const review = data.review || {};
  const rejectionReason =
    status === "rejected"
      ? review.rejection_reason || data.rejection_reason || ""
      : "";

  // The backend may return attachments under any of these keys; normalize.
  const rawAttachments =
    (Array.isArray(data.attachments) && data.attachments) ||
    (Array.isArray(data.documents) && data.documents) ||
    (Array.isArray(data.files) && data.files) ||
    (data.data && Array.isArray(data.data.attachments) && data.data.attachments) ||
    [];
  const attachments = rawAttachments.map((a, idx) => ({
    id: a.id || a.attachment_id || a._id || idx,
    document_type: a.document_type || a.type || a.category || a.kind || "",
    original_name: a.original_name || a.filename || a.name || a.file_name || `document-${idx + 1}`,
    file_type: a.file_type || a.mime_type || a.mime || a.content_type || "",
    file_size: a.file_size || a.size || a.bytes || 0,
    created_at: a.created_at || a.uploaded_at || a.createdAt || null,
  }));
  const attachedTypes = new Set(attachments.map((a) => a.document_type));
  const ghostDocs = DOCUMENT_TYPES.filter((d) => !attachedTypes.has(d.key));

  const signatureMeta = data.signature || data.signature_meta || null;
  const hasSignature = !!(
    signatureMeta && (signatureMeta.signed || signatureMeta.has_image)
  );

  return (
    <main className={`kyc-status-page status-${status}`}>
      {/* Hero banner — matches the wizard branding */}
      <section
        className="kyc-hero kyc-hero-status no-print"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(27,54,93,0.92) 0%, rgba(27,54,93,0.72) 45%, rgba(27,54,93,0.55) 100%), url(${heroBg})`,
        }}
      >
        <div className="kyc-hero-overlay" />
        <div className="kyc-container">
          <div className="kyc-hero-inner">
            <div className="kyc-hero-content">
              <span className="kyc-hero-badge">{t("AECB Compliance")}</span>
              <h1 className="kyc-hero-title">
                {t("Your KYC Application")}
                <span>{t(STATUS_HEADLINES[status] || STATUS_HEADLINES.submitted)}</span>
              </h1>
              <p className="kyc-hero-subtitle">
                {t("Below is the official record of your submission. Keep this page for your reference.")}
              </p>
            </div>
            <aside className="kyc-hero-card kyc-hero-card-status">
              <img src={logoNew} alt="Route Facile" className="kyc-hero-logo" />
              <span
                className={`kyc-status-chip status-${status}${
                  status === "under_review" ? " is-pulsing" : ""
                }`}
                style={{ background: colors.bg, color: colors.fg }}
              >
                <span className="kyc-status-dot" style={{ background: colors.fg }} />
                {t(STATUS_LABELS[status] || status)}
              </span>
              <button
                type="button"
                className="kyc-token-pill"
                onClick={handleCopyToken}
                title={t("Tap to copy")}
              >
                <span className="lbl">{t("Reference")}</span>
                <span className="val">{referenceToken}</span>
                <span className="copy-ic" aria-hidden>⧉</span>
              </button>
            </aside>
          </div>
        </div>
      </section>

      <div className="kyc-container kyc-status-container">
        {/* Action bar */}
        <div className="kyc-paper-actions no-print">
          <button
            type="button"
            className="kyc-btn kyc-btn-secondary"
            onClick={fetchStatus}
          >
            ⟳ {t("Refresh")}
          </button>
          <button
            type="button"
            className="kyc-btn kyc-btn-secondary"
            onClick={handlePrint}
          >
            🖨 {t("Print summary")}
          </button>
          <button
            type="button"
            className="kyc-btn kyc-btn-secondary"
            onClick={handleShare}
          >
            ⇪ {t("Share")}
          </button>
          {attachments.length > 0 && (
            <button
              type="button"
              className="kyc-btn kyc-btn-primary"
              onClick={handleDownloadAll}
            >
              ⤓ {t("Download all")}
            </button>
          )}
        </div>

        {/* The "paper" — looks like a printed A4 application */}
        <article className="kyc-paper" aria-label={t("KYC application document")}>
          <header className="kyc-paper-header">
            <img src={logoNew} alt="Route Facile" className="kyc-paper-logo" />
            <div className="kyc-paper-headline">
              <div className="kyc-paper-eyebrow">{t("AECB Compliance")}</div>
              <h2 className="kyc-paper-title">{t("KYC Application Record")}</h2>
              <div className="kyc-paper-meta">
                <span>
                  <strong>{t("Reference")}:</strong> {referenceToken}
                </span>
                <span>
                  <strong>{t("Status")}:</strong>{" "}
                  {t(STATUS_LABELS[status] || status)}
                </span>
                {data.submitted_at && (
                  <span>
                    <strong>{t("Submitted")}:</strong>{" "}
                    {formatDateTime(data.submitted_at)}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Rejection callout */}
          {status === "rejected" && (
            <section className="kyc-callout kyc-callout-danger">
              <h3>{t("Why was this rejected?")}</h3>
              <p>{rejectionReason || t("Please contact our team for details.")}</p>
              <div className="kyc-actions no-print" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="kyc-btn kyc-btn-primary"
                  onClick={() => navigate(`/${lang || "en"}/kyc`)}
                >
                  {t("Re-submit")}
                </button>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section className="kyc-paper-section">
            <Timeline events={data.timeline} status={status} t={t} />
          </section>

          {/* Applicant info */}
          <ApplicantInfo data={data} t={t} />

          {/* Documents */}
          <section className="kyc-paper-section">
            {attachments.length === 0 && ghostDocs.length === 0 ? (
              <p className="hint">{t("No documents on file.")}</p>
            ) : (
              <div className="kyc-gallery">
                {attachments.map((a, idx) => (
                  <DocumentCard
                    key={a.id}
                    attachment={a}
                    referenceToken={referenceToken}
                    onOpen={() => setLightboxIdx(idx)}
                    t={t}
                  />
                ))}
                {ghostDocs.map((d) => (
                  <GhostCard
                    key={d.key}
                    docKey={d.key}
                    required={d.key !== "passport_visa"}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Signature */}
          {hasSignature && (
            <section className="kyc-paper-section">
              <div className="kyc-sig-card">
                <div className="kyc-sig-frame">
                  <img
                    src={buildSignatureUrl(referenceToken, signatureMeta.signed_at)}
                    alt={t("Customer signature")}
                  />
                </div>
                <div className="kyc-sig-info">
                  <div>
                    <span className="lbl">{t("Method")}: </span>
                    {signatureMeta.method === "typed" ? t("Typed") : t("Drawn")}
                  </div>
                  {signatureMeta.signed_at && (
                    <div className="mono">
                      {t("Signed at")} {formatDateTime(signatureMeta.signed_at)}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <div className="kyc-paper-footer">
            <span>{t("Generated by Route Facile KYC")}</span>
            <span>{formatDateTime(new Date())}</span>
          </div>
        </article>

        {/* Help */}
        <section className="kyc-card kyc-help no-print">
          <p>
            {t("Call our team or email")}{" "}
            <a href="mailto:routefacilerental@gmail.com">
              routefacilerental@gmail.com
            </a>.
          </p>
        </section>
        <PrivacyNotice />
      </div>

      {/* Print-only professional summary (hidden on screen via CSS).
          Required so window.print() produces a populated PDF — the print
          stylesheet hides everything except `.kyc-print-only`. */}
      <PrintSummary
        data={data}
        attachments={attachments}
        ghostDocs={ghostDocs}
        signatureMeta={signatureMeta}
        hasSignature={hasSignature}
        status={status}
        referenceToken={referenceToken}
        rejectionReason={rejectionReason}
        t={t}
      />

      {lightboxIdx >= 0 && (
        <Lightbox
          items={attachments}
          index={lightboxIdx}
          referenceToken={referenceToken}
          onClose={() => setLightboxIdx(-1)}
          onPrev={() =>
            setLightboxIdx((i) => (i <= 0 ? attachments.length - 1 : i - 1))
          }
          onNext={() => setLightboxIdx((i) => (i + 1) % attachments.length)}
        />
      )}
    </main>
  );
};

export default KycStatusPage;
