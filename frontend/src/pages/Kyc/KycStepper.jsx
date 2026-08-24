import React from "react";
import { useTranslation } from "react-i18next";
import { KYC_STEPS, STEP_ORDER } from "./kycHelpers";

const LABELS = {
  [KYC_STEPS.IDENTITY]: "Identity",
  [KYC_STEPS.OTP]: "Verify Mobile OTP",
  [KYC_STEPS.DETAILS]: "Details",
  [KYC_STEPS.DOCUMENTS]: "Documents",  [KYC_STEPS.SIGNATURE]: "Sign",  [KYC_STEPS.REVIEW]: "Review",
  [KYC_STEPS.DONE]: "Done",
};

const KycStepper = ({ current }) => {
  const { t } = useTranslation();
  const currentIdx = STEP_ORDER.indexOf(current);
  return (
    <div className="kyc-stepper" aria-label="KYC progress">
      {STEP_ORDER.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isDone = idx < currentIdx;
        const cls = ["step", isActive ? "is-active" : "", isDone ? "is-done" : ""]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={step} className={cls}>
            {idx + 1}. {t(LABELS[step])}
          </div>
        );
      })}
    </div>
  );
};

export default KycStepper;
