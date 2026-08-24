import React from "react";
import { useTranslation } from "react-i18next";
import "./PrivacyNotice.css";

const PrivacyNotice = () => {
  const { t } = useTranslation();
  return (
    <aside className="privacy-notice no-print" aria-label={t("Privacy notice")}>
      <div className="privacy-notice-inner">
        <span className="privacy-notice-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="m9 12 2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="privacy-notice-text">
          <strong>{t("We respect your privacy.")}</strong>{" "}
          {t(
            "The information and documents you provide will only be used for customer verification, compliance, and service processing, and will be securely protected by Route Facile."
          )}
        </p>
      </div>
    </aside>
  );
};

export default PrivacyNotice;
