import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { isValidMobileCode, isValidMobileNumber } from "./kycHelpers";

/**
 * Step 3 — Form details.
 * Mobile + email shown read-only with verified badge.
 * All other fields optional, but landline & company phone follow code/number regex when provided.
 */
const KycDetailsStep = ({ identity, details, onChange, onBack, onContinue }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  const update = (key, val) => {
    onChange({ ...details, [key]: val });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const validate = () => {
    const e = {};
    const validatePhonePair = (codeKey, numKey) => {
      const code = (details[codeKey] || "").trim();
      const num = (details[numKey] || "").trim();
      if (!code && !num) return;
      if (!isValidMobileCode(code)) e[codeKey] = t("Invalid country code.");
      if (!isValidMobileNumber(num)) e[numKey] = t("Enter a valid number.");
    };
    validatePhonePair("contact_landline_code", "contact_landline_number");
    validatePhonePair("company_phone_code", "company_phone_number");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onContinue();
  };

  return (
    <div className="kyc-card">
      <h2 className="kyc-title">{t("Your details")}</h2>
      <p className="kyc-subtitle">
        {t("Tell us about yourself. Fields marked * are required.")}
      </p>

      <div className="kyc-grid">
        <div className="kyc-field full">
          <label>{t("Complete residential address (incl. Flat #)")}</label>
          <textarea
            value={details.residential_address || ""}
            onChange={(e) => update("residential_address", e.target.value)}
            rows={3}
          />
        </div>

        <div className="kyc-field full">
          <label>
            {t("Contact Number — Mobile")} <span className="req">*</span>
            <span className="kyc-verified-badge">✓ {t("Verified")}</span>
          </label>
          <input
            type="text"
            readOnly
            className="kyc-readonly"
            value={`${identity.contact_mobile_code} ${identity.contact_mobile_number}`}
          />
        </div>

        <div className="kyc-field full">
          <label>{t("Contact Number — Landline")}</label>
          <div className="kyc-phone">
            <input
              type="tel"
              placeholder="+971"
              value={details.contact_landline_code || ""}
              onChange={(e) => update("contact_landline_code", e.target.value)}
              aria-label={t("Landline country code")}
            />
            <input
              type="tel"
              placeholder="0000000"
              value={details.contact_landline_number || ""}
              onChange={(e) => update("contact_landline_number", e.target.value)}
              aria-label={t("Landline number")}
            />
          </div>
          {errors.contact_landline_code && (
            <div className="err">{errors.contact_landline_code}</div>
          )}
          {errors.contact_landline_number && (
            <div className="err">{errors.contact_landline_number}</div>
          )}
        </div>

        <div className="kyc-field">
          <label>{t("Company Name")}</label>
          <input
            type="text"
            value={details.company_name || ""}
            onChange={(e) => update("company_name", e.target.value)}
          />
        </div>

        <div className="kyc-field">
          <label>{t("Company Phone Number")}</label>
          <div className="kyc-phone">
            <input
              type="tel"
              placeholder="+971"
              value={details.company_phone_code || ""}
              onChange={(e) => update("company_phone_code", e.target.value)}
              aria-label={t("Company phone country code")}
            />
            <input
              type="tel"
              placeholder="0000000"
              value={details.company_phone_number || ""}
              onChange={(e) => update("company_phone_number", e.target.value)}
              aria-label={t("Company phone number")}
            />
          </div>
          {errors.company_phone_code && (
            <div className="err">{errors.company_phone_code}</div>
          )}
          {errors.company_phone_number && (
            <div className="err">{errors.company_phone_number}</div>
          )}
        </div>

        <div className="kyc-field full">
          <label>{t("Company Complete Address")}</label>
          <textarea
            value={details.company_address || ""}
            onChange={(e) => update("company_address", e.target.value)}
            rows={3}
          />
        </div>

        <div className="kyc-field full">
          <label>
            {t("Email Address")} <span className="req">*</span>
          </label>
          <input type="email" readOnly className="kyc-readonly" value={identity.email} />
        </div>
      </div>

      <div className="kyc-actions">
        <button type="button" className="kyc-btn kyc-btn-secondary" onClick={onBack}>
          {t("Back")}
        </button>
        <button type="button" className="kyc-btn kyc-btn-primary" onClick={handleNext}>
          {t("Continue")}
        </button>
      </div>
    </div>
  );
};

export default KycDetailsStep;
