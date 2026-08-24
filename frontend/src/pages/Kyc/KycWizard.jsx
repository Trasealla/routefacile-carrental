import React, { useEffect, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import "../../styles/kyc.css";

import logoNew from "../../assets/new-logo/logo.png";
import heroBg from "../../assets/all-images/bg-uae.png";

import KycStepper from "./KycStepper";
import KycIdentityStep from "./KycIdentityStep";
import KycOtpStep from "./KycOtpStep";
import KycDetailsStep from "./KycDetailsStep";
import KycDocumentsStep from "./KycDocumentsStep";
import KycSignatureStep from "./KycSignatureStep";
import PrivacyNotice from "../../components/UI/PrivacyNotice/PrivacyNotice";
import KycReviewStep from "./KycReviewStep";
import KycDoneStep from "./KycDoneStep";

import {
  buildStatusUrl,
  clearKycSession,
  DEFAULT_KYC_CONFIG,
  KYC_STEPS,
  loadKycSession,
  saveKycSession,
  STEP_ORDER,
} from "./kycHelpers";
import { getKycConfig, getKycStatus } from "../../actions/kycApi";

const initialState = {
  step: KYC_STEPS.IDENTITY,
  referenceToken: "",
  identity: {
    contact_mobile_code: "+971",
    contact_mobile_number: "",
    email: "",
  },
  details: {
    residential_address: "",
    contact_landline_code: "",
    contact_landline_number: "",
    company_name: "",
    company_address: "",
    company_phone_code: "",
    company_phone_number: "",
  },
  documents: {
    cities_id_front: null,
    cities_id_back: null,
    uae_driving_license_front: null,
    uae_driving_license_back: null,
    passport_visa: null,
  },
  signature: {
    signature_image: "",
    signature_method: "",
    signature_typed_text: "",
  },
  phoneVerified: false,
  emailVerified: false,
  phoneOtpExpiresAt: null,
  config: DEFAULT_KYC_CONFIG,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "SET_CONFIG":
      return { ...state, config: action.payload };
    case "SET_IDENTITY":
      return { ...state, identity: action.payload };
    case "SET_DETAILS":
      return { ...state, details: action.payload };
    case "SET_DOCUMENTS":
      return { ...state, documents: action.payload };
    case "SET_SIGNATURE":
      return { ...state, signature: action.payload };
    case "STARTED":
      return {
        ...state,
        referenceToken: action.payload.referenceToken,
        phoneOtpExpiresAt: action.payload.phoneOtpExpiresAt || null,
        step: KYC_STEPS.OTP,
      };
    case "PHONE_OTP_RESENT":
      return { ...state, phoneOtpExpiresAt: action.payload || null };
    case "PHONE_VERIFIED":
      return { ...state, phoneVerified: true };
    case "EMAIL_VERIFIED":
      return { ...state, emailVerified: true };
    case "GOTO":
      return { ...state, step: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const KycWizard = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);

  // Load KYC config (required vs optional documents, consent text, etc.)
  useEffect(() => {
    let cancelled = false;
    getKycConfig().then((res) => {
      if (cancelled || !res || !res.ok || !res.data) return;
      // Accept either { ...config } or { config: {...} } shapes
      const cfg = res.data.config || res.data;
      const merged = {
        ...DEFAULT_KYC_CONFIG,
        ...cfg,
        // Preserve fallbacks if API omits arrays.
        required_documents:
          Array.isArray(cfg.required_documents) && cfg.required_documents.length
            ? cfg.required_documents
            : DEFAULT_KYC_CONFIG.required_documents,
        optional_documents: Array.isArray(cfg.optional_documents)
          ? cfg.optional_documents
          : DEFAULT_KYC_CONFIG.optional_documents,
      };
      dispatch({ type: "SET_CONFIG", payload: merged });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hydrate from sessionStorage exactly once and verify against backend.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = loadKycSession();
    if (!saved || typeof saved.referenceToken !== "string" || !saved.referenceToken) {
      // Clear any stale state from previous app versions where referenceToken was an object.
      if (saved) clearKycSession();
      return;
    }

    dispatch({
      type: "HYDRATE",
      payload: {
        ...saved,
        documents: initialState.documents,
        signature: initialState.signature, // signature too sensitive to persist; user re-signs
      },
    });

    getKycStatus(saved.referenceToken).then((res) => {
      if (!res.ok || !res.data) return;
      const data = res.data;
      const status = (data.status || "").toLowerCase();
      const phoneOk =
        !!data.phone_verified || !!data.mobile_verified ||
        ["phone_verified", "verified", "submitted", "under_review", "approved", "rejected"].includes(status);
      const emailOk =
        !!data.email_verified ||
        ["email_verified", "verified", "submitted", "under_review", "approved", "rejected"].includes(status);
      if (phoneOk) dispatch({ type: "PHONE_VERIFIED" });
      if (emailOk) dispatch({ type: "EMAIL_VERIFIED" });
      if (["submitted", "success", "pending", "under_review", "approved", "rejected"].includes(status)) {
        clearKycSession();
        navigate(buildStatusUrl(lang, saved.referenceToken));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist after meaningful change (files & signature stripped).
  useEffect(() => {
    if (state.step === KYC_STEPS.DONE) return;
    if (!state.referenceToken && state.step === KYC_STEPS.IDENTITY) return;
    saveKycSession({
      step: state.step,
      referenceToken: state.referenceToken,
      identity: state.identity,
      details: state.details,
      phoneVerified: state.phoneVerified,
      emailVerified: state.emailVerified,
    });
  }, [
    state.step,
    state.referenceToken,
    state.identity,
    state.details,
    state.phoneVerified,
    state.emailVerified,
  ]);

  const goto = (step) => dispatch({ type: "GOTO", payload: step });
  const stepIdx = STEP_ORDER.indexOf(state.step);
  const goPrev = () => {
    if (stepIdx > 0) goto(STEP_ORDER[stepIdx - 1]);
  };
  const goNext = () => {
    if (stepIdx < STEP_ORDER.length - 1) goto(STEP_ORDER[stepIdx + 1]);
  };

  const handleSubmitted = (token) => {
    clearKycSession();
    navigate(buildStatusUrl(lang, token || state.referenceToken, true));
  };

  const renderStep = () => {
    switch (state.step) {
      case KYC_STEPS.IDENTITY:
        return (
          <KycIdentityStep
            identity={state.identity}
            onChange={(v) => dispatch({ type: "SET_IDENTITY", payload: v })}
            onStarted={(token) => dispatch({ type: "STARTED", payload: token })}
          />
        );
      case KYC_STEPS.OTP:
        return (
          <KycOtpStep
            referenceToken={state.referenceToken}
            identity={state.identity}
            phoneVerified={state.phoneVerified}
            emailVerified={state.emailVerified}
            phoneOtpExpiresAt={state.phoneOtpExpiresAt}
            onPhoneVerified={() => dispatch({ type: "PHONE_VERIFIED" })}
            onEmailVerified={() => dispatch({ type: "EMAIL_VERIFIED" })}
            onPhoneOtpResent={(expiresAt) => dispatch({ type: "PHONE_OTP_RESENT", payload: expiresAt })}
            onBack={goPrev}
            onContinue={goNext}
          />
        );
      case KYC_STEPS.DETAILS:
        return (
          <KycDetailsStep
            identity={state.identity}
            details={state.details}
            onChange={(v) => dispatch({ type: "SET_DETAILS", payload: v })}
            onBack={goPrev}
            onContinue={goNext}
          />
        );
      case KYC_STEPS.DOCUMENTS:
        return (
          <KycDocumentsStep
            documents={state.documents}
            config={state.config}
            onChange={(v) => dispatch({ type: "SET_DOCUMENTS", payload: v })}
            onBack={goPrev}
            onContinue={goNext}
          />
        );
      case KYC_STEPS.SIGNATURE:
        return (
          <KycSignatureStep
            signature={state.signature}
            onChange={(v) => dispatch({ type: "SET_SIGNATURE", payload: v })}
            onBack={goPrev}
            onContinue={goNext}
          />
        );
      case KYC_STEPS.REVIEW:
        return (
          <KycReviewStep
            referenceToken={state.referenceToken}
            identity={state.identity}
            details={state.details}
            documents={state.documents}
            signature={state.signature}
            config={state.config}
            phoneVerified={state.phoneVerified}
            emailVerified={state.emailVerified}
            onBack={goPrev}
            onSubmitted={handleSubmitted}
            onAlreadySubmitted={(token) => {
              clearKycSession();
              navigate(buildStatusUrl(lang, token));
            }}
          />
        );
      case KYC_STEPS.DONE:
        return <KycDoneStep referenceToken={state.referenceToken} />;
      default:
        return null;
    }
  };

  return (
    <main className="kyc-page">
      <section
        className="kyc-hero"
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
                {t("KYC Verification")}
                <span>{t("Secure and fast customer verification")}</span>
              </h1>
              <p className="kyc-hero-subtitle">
                {t("Please complete your Know Your Customer (KYC) form. No login is required.")}
              </p>
            </div>
            <aside className="kyc-hero-card" aria-label={t("What you need")}>
              <img src={logoNew} alt="Route Facile" className="kyc-hero-logo" />
              <h4>{t("What you need")}</h4>
              <ul>
                <li>{t("Mobile OTP verification")}</li>
                <li>{t("Email address")}</li>
                <li>{t("Three mandatory documents")}</li>
                <li>{t("AECB consent confirmation")}</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <div className="kyc-container">
        <div className="kyc-heading-wrap">
          <h2 className="kyc-title" style={{ marginBottom: 4 }}>
            {t("KYC Verification")}
          </h2>
          <p className="kyc-subtitle">
            {t("Follow the steps below to submit your KYC details.")}
          </p>
        </div>
        <KycStepper current={state.step} />
        {renderStep()}
        <PrivacyNotice />
      </div>
    </main>
  );
};

export default KycWizard;
