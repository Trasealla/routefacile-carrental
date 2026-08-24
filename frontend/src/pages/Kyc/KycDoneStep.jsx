import React from "react";
import { useTranslation } from "react-i18next";

const KycDoneStep = () => {
  const { t } = useTranslation();

  return (
    <div className="kyc-card kyc-done">
      <div className="check" aria-hidden>✓</div>
      <h2 className="kyc-title">{t("Thank you")}</h2>
      <p className="kyc-subtitle">
        {t(
          "Your KYC submission has been received. Our team will review and contact you shortly."
        )}
      </p>
    </div>
  );
};

export default KycDoneStep;
