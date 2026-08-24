import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  isValidEmail,
  isValidMobileCode,
  isValidMobileNumber,
  mapKycError,
} from "./kycHelpers";
import { startKyc } from "../../actions/kycApi";

/**
 * Step 1 — Identity (mobile + email).
 * Calls POST /kyc/start, then advances the wizard with the returned reference_token.
 */
const KycIdentityStep = ({ identity, onChange, onStarted }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const update = (key, val) => {
    onChange({ ...identity, [key]: val });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const validate = () => {
    const e = {};
    if (!isValidMobileCode(identity.contact_mobile_code)) {
      e.contact_mobile_code = t("Invalid country code.");
    }
    if (!isValidMobileNumber(identity.contact_mobile_number)) {
      e.contact_mobile_number = t("Enter a valid mobile number.");
    }
    if (!isValidEmail(identity.email)) {
      e.email = t("Enter a valid email address.");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    const res = await startKyc({
      contact_mobile_code: identity.contact_mobile_code.trim(),
      contact_mobile_number: identity.contact_mobile_number.trim(),
      email: identity.email.trim(),
    });
    setSubmitting(false);
    if (!res.ok) {
      setServerError(mapKycError(res.errorMessage, t));
      return;
    }
    const referenceToken =
      (res.data && (res.data.reference_token || res.data.referenceToken)) || "";
    const phoneOtpExpiresAt =
      (res.data && (res.data.phone_otp_expires_at || res.data.phoneOtpExpiresAt)) || null;
    if (!referenceToken) {
      setServerError(t("Something went wrong. Please try again."));
      return;
    }
    onStarted({ referenceToken, phoneOtpExpiresAt });
  };

  return (
    <form className="kyc-card" onSubmit={handleSubmit} noValidate>
      <h2 className="kyc-title">{t("Start your KYC")}</h2>
      <p className="kyc-subtitle">
        {t("Enter your mobile and email, then verify your mobile OTP before continuing.")}
      </p>

      <div className="kyc-grid">
        <div className="kyc-field full">
          <label htmlFor="kyc-mobile-number">
            {t("Mobile Number")} <span className="req">*</span>
          </label>
          <div className="kyc-phone">
            <input
              type="tel"
              value={identity.contact_mobile_code}
              onChange={(e) => update("contact_mobile_code", e.target.value)}
              placeholder="+971"
              autoComplete="tel-country-code"
              aria-label={t("Country code")}
              id="kyc-mobile-code"
            />
            <input
              type="tel"
              value={identity.contact_mobile_number}
              onChange={(e) => update("contact_mobile_number", e.target.value)}
              placeholder="501234567"
              autoComplete="tel-national"
              aria-label={t("Mobile Number")}
              id="kyc-mobile-number"
            />
          </div>
          {errors.contact_mobile_code && (
            <div className="err">{errors.contact_mobile_code}</div>
          )}
          {errors.contact_mobile_number && (
            <div className="err">{errors.contact_mobile_number}</div>
          )}
        </div>

        <div className="kyc-field full">
          <label htmlFor="kyc-email">
            {t("Email")} <span className="req">*</span>
          </label>
          <input
            type="email"
            value={identity.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            id="kyc-email"
          />
          {errors.email && <div className="err">{errors.email}</div>}
        </div>
      </div>

      {serverError && <div className="err" style={{ marginTop: 14 }}>{serverError}</div>}

      <div className="kyc-actions">
        <button type="submit" className="kyc-btn kyc-btn-primary" disabled={submitting}>
          {submitting ? t("Please wait...") : t("Send OTP")}
        </button>
      </div>
    </form>
  );
};

export default KycIdentityStep;
