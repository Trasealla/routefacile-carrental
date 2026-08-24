import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  DEFAULT_KYC_CONFIG,
  DOCUMENT_TYPES,
  formatBytes,
  isAlreadySubmittedError,
  isDocRequired,
  mapKycError,
} from "./kycHelpers";
import { submitKyc } from "../../actions/kycApi";

const Row = ({ label, value, valueChip }) => {
  if (!value && value !== 0 && !valueChip) return null;
  return (
    <div className="kyc-review-row">
      <div className="label">{label}</div>
      <div className="value">
        {value || ""}
        {valueChip && <span className="kyc-chip-soft">{valueChip}</span>}
      </div>
    </div>
  );
};

/**
 * Step 6 — Review + consent + submit (signature already captured in step 5).
 */
const KycReviewStep = ({
  referenceToken,
  identity,
  details,
  documents,
  signature,
  config,
  phoneVerified,
  emailVerified,
  onBack,
  onSubmitted,
  onAlreadySubmitted,
}) => {
  const { t } = useTranslation();
  const cfg = config || DEFAULT_KYC_CONFIG;
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const requiredDocs = DOCUMENT_TYPES.filter((d) => isDocRequired(d.key, cfg));
  const allRequiredFilled = requiredDocs.every((d) => documents[d.key]);
  const hasSignature = !!(signature && signature.signature_image);

  const canSubmit =
    consent &&
    allRequiredFilled &&
    phoneVerified &&
    hasSignature &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setServerError("");
    setSubmitting(true);
    const res = await submitKyc({
      reference_token: referenceToken,
      residential_address: details.residential_address,
      contact_landline_code: details.contact_landline_code,
      contact_landline_number: details.contact_landline_number,
      company_name: details.company_name,
      company_address: details.company_address,
      company_phone_code: details.company_phone_code,
      company_phone_number: details.company_phone_number,
      consent_given: true,
      signature_image: signature.signature_image,
      signature_method: signature.signature_method,
      signature_typed_text: signature.signature_typed_text,
      cities_id_front: documents.cities_id_front,
      cities_id_back: documents.cities_id_back,
      uae_driving_license_front: documents.uae_driving_license_front,
      uae_driving_license_back: documents.uae_driving_license_back,
      passport_visa: documents.passport_visa,
    });
    setSubmitting(false);

    if (!res.ok) {
      if (isAlreadySubmittedError(res.errorMessage)) {
        toast.info(t("This KYC was already submitted."));
        if (onAlreadySubmitted) onAlreadySubmitted(referenceToken);
        return;
      }
      const normalized = mapKycError(res.errorMessage, t);
      setServerError(normalized);
      toast.error(normalized);
      return;
    }
    toast.success(t("KYC submitted successfully."));
    onSubmitted(referenceToken);
  };

  return (
    <div className="kyc-card">
      <h2 className="kyc-title">{t("Review and submit")}</h2>
      <p className="kyc-subtitle">
        {t("Please review the information below before submitting.")}
      </p>

      <div className="kyc-review-section">
        <h4>{t("Identity")}</h4>
        <Row
          label={t("Mobile Number")}
          value={`${identity.contact_mobile_code} ${identity.contact_mobile_number}`}
        />
        <Row label={t("Email")} value={identity.email} />
      </div>

      <div className="kyc-review-section">
        <h4>{t("Details")}</h4>
        <Row label={t("Residential Address")} value={details.residential_address} />
        <Row
          label={t("Landline")}
          value={
            details.contact_landline_code || details.contact_landline_number
              ? `${details.contact_landline_code || ""} ${details.contact_landline_number || ""}`.trim()
              : ""
          }
        />
        <Row label={t("Company Name")} value={details.company_name} />
        <Row label={t("Company Address")} value={details.company_address} />
        <Row
          label={t("Company Phone")}
          value={
            details.company_phone_code || details.company_phone_number
              ? `${details.company_phone_code || ""} ${details.company_phone_number || ""}`.trim()
              : ""
          }
        />
      </div>

      <div className="kyc-review-section">
        <h4>{t("Documents")}</h4>
        {DOCUMENT_TYPES.map((d) => {
          const f = documents[d.key];
          const required = isDocRequired(d.key, cfg);
          if (f) {
            return (
              <Row
                key={d.key}
                label={t(d.labelKey)}
                value={`${f.name} (${formatBytes(f.size)})`}
              />
            );
          }
          return (
            <Row
              key={d.key}
              label={t(d.labelKey)}
              value=""
              valueChip={required ? t("Missing") : t("Skipped")}
            />
          );
        })}
      </div>

      <div className="kyc-review-section">
        <h4>{t("Signature")}</h4>
        {hasSignature ? (
          <div className="kyc-review-sig">
            <img
              src={signature.signature_image}
              alt={t("Your signature")}
              className="kyc-review-sig-img"
            />
            <div>
              <div className="hint">
                {t("Method")}:{" "}
                {signature.signature_method === "typed" ? t("Typed") : t("Drawn")}
              </div>
              {signature.signature_typed_text && (
                <div className="hint">{signature.signature_typed_text}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="hint">{t("Signature missing — please go back and sign.")}</div>
        )}
      </div>

      <label className="kyc-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          aria-label={t("AECB consent")}
        />
        <span>{cfg.consent_text || DEFAULT_KYC_CONFIG.consent_text}</span>
      </label>

      {serverError && <div className="err" style={{ marginTop: 14 }}>{serverError}</div>}

      <div className="kyc-actions">
        <button
          type="button"
          className="kyc-btn kyc-btn-secondary"
          onClick={onBack}
          disabled={submitting}
        >
          {t("Back")}
        </button>
        <button
          type="button"
          className="kyc-btn kyc-btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? t("Submitting...") : t("Submit")}
        </button>
      </div>
    </div>
  );
};

export default KycReviewStep;
