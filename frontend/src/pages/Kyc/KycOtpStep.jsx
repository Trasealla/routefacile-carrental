import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isValidOtp, mapKycError } from "./kycHelpers";
import { resendPhoneOtp, verifyPhoneOtp } from "../../actions/kycApi";

const OTP_TTL_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

function useCountdown(expiresAt, resendLockedUntil) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : 0;
  const resendLockMs = resendLockedUntil
    ? new Date(resendLockedUntil).getTime()
    : now + RESEND_COOLDOWN_SECONDS * 1000;

  const remaining = Math.max(0, Math.floor((expiresAtMs - now) / 1000));
  const cooldown = Math.max(0, Math.floor((resendLockMs - now) / 1000));

  return { remaining, cooldown };
}

const fmt = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

const KycOtpStep = ({
  referenceToken,
  identity,
  phoneVerified,
  phoneOtpExpiresAt,
  onPhoneVerified,
  onPhoneOtpResent,
  onBack,
  onContinue,
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expiresAt, setExpiresAt] = useState(
    phoneOtpExpiresAt || new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString()
  );
  const [resendLockedUntil, setResendLockedUntil] = useState(
    () => new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000).toISOString()
  );

  useEffect(() => {
    if (phoneOtpExpiresAt) {
      setExpiresAt(phoneOtpExpiresAt);
    }
  }, [phoneOtpExpiresAt]);

  const { remaining, cooldown } = useCountdown(expiresAt, resendLockedUntil);
  const isExpired = remaining === 0;
  const canResend = cooldown === 0 && !busy && !phoneVerified;

  const handleVerify = async () => {
    setError("");
    if (!isValidOtp(otp)) {
      setError(t("Enter the 6-digit OTP."));
      return;
    }
    if (isExpired) {
      setError(t("OTP has expired. Please request a new one."));
      return;
    }

    setBusy(true);
    const res = await verifyPhoneOtp(referenceToken, otp.trim());
    setBusy(false);

    if (!res.ok) {
      setError(mapKycError(res.errorMessage, t));
      return;
    }

    onPhoneVerified();
  };

  const handleResend = async () => {
    setError("");
    setBusy(true);
    const res = await resendPhoneOtp(referenceToken);
    setBusy(false);

    if (!res.ok) {
      setError(mapKycError(res.errorMessage, t));
      return;
    }

    const nextExpiry = res.data?.phone_otp_expires_at || res.data?.phoneOtpExpiresAt;
    setOtp("");
    setExpiresAt(nextExpiry || new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString());
    setResendLockedUntil(new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000).toISOString());
    if (onPhoneOtpResent) {
      onPhoneOtpResent(nextExpiry || null);
    }
  };

  return (
    <div className="kyc-card">
      <h2 className="kyc-title">{t("Verify Mobile OTP")}</h2>
      <p className="kyc-subtitle">{t("Enter the 6-digit code sent to your mobile number.")}</p>

      <div className={`kyc-otp-card kyc-otp-card-single${phoneVerified ? " is-verified" : ""}`}>
        <h4>
          {t("Mobile OTP")}
          {phoneVerified && <span className="kyc-verified-badge">✓ {t("Verified")}</span>}
        </h4>
        <div className="target">{`${identity.contact_mobile_code} ${identity.contact_mobile_number}`}</div>
        <div className="kyc-email-note">{`${t("Email")}: ${identity.email}`}</div>

        {!phoneVerified && (
          <>
            <input
              className="kyc-field-input kyc-otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="------"
              style={{
                width: "100%",
                border: "1px solid #d5d9e2",
                borderRadius: 8,
                padding: "10px 12px",
              }}
              disabled={busy}
              aria-label={t("OTP code")}
            />

            <div className="kyc-otp-meta">
              <span>{isExpired ? t("OTP expired") : `${t("Expires in")} ${fmt(remaining)}`}</span>
              <button
                type="button"
                className="kyc-btn kyc-btn-link"
                onClick={handleResend}
                disabled={!canResend}
              >
                {cooldown > 0 ? `${t("Resend in")} ${cooldown}s` : t("Resend OTP")}
              </button>
            </div>

            {error && <div className="err">{error}</div>}

            <div className="kyc-actions" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="kyc-btn kyc-btn-primary"
                onClick={handleVerify}
                disabled={busy || otp.length !== 6 || isExpired}
              >
                {busy ? t("Please wait...") : t("Verify")}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="kyc-actions">
        <button type="button" className="kyc-btn kyc-btn-secondary" onClick={onBack}>
          {t("Back")}
        </button>
        <button
          type="button"
          className="kyc-btn kyc-btn-primary"
          onClick={onContinue}
          disabled={!phoneVerified}
        >
          {t("Continue")}
        </button>
      </div>
    </div>
  );
};

export default KycOtpStep;
