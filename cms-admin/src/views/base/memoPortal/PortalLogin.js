// Email + PIN login page for the Memo Portal.
//   Stage A: email input -> POST /memo-portal/auth/request-pin
//   Stage B: 6-digit PIN -> POST /memo-portal/auth/verify-pin
// Token is persisted via portalApi (localStorage under the active scope key).

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaShieldAlt,
  FaFileAlt,
  FaSearch,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";
import portalApi from "./portalApi";
import { notifySuccess } from "../../../components/notify/notify";
import portalLogo from "../../../assets/images/admin_sidebar_logo.png";
import "./memoPortal.css";

const EMAIL_RE = /^[^\s@]+@routefacilecarrental\.com$/i;
const ALLOWED_DOMAINS = "@routefacilecarrental.com";

const FEATURES = [
  { icon: <FaFileAlt />,   title: "Memos",          desc: "Read company memos & policies" },
  { icon: <FaShieldAlt />, title: "Secure Access",  desc: "Authenticated previews & downloads" },
  { icon: <FaLock />,      title: "One-time Code",  desc: "Sign in with a 6-digit email PIN" },
  { icon: <FaSearch />,    title: "Find Fast",      desc: "Filter by category & search title" },
];

const PortalLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stage, setStage] = useState("email"); // "email" | "pin"
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState({});
  const inputs = useRef([]);

  useEffect(() => {
    if (!portalApi.getToken()) return;
    portalApi.me().then(() => navigate("/memo-portal", { replace: true })).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const requestPin = async () => {
    const e = email.trim();
    if (!EMAIL_RE.test(e)) {
      setErrors({ email: t("Please use a valid work email ({{domains}})", { domains: ALLOWED_DOMAINS }) });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const resp = await portalApi.requestPin(e);
      const data = portalApi.unwrap(resp) || resp;
      // Backend may sign the user in directly (no OTP). If a token is returned,
      // store it and go straight to the portal.
      const token = data?.access_token || data?.token || resp?.access_token;
      if (token) {
        portalApi.setToken(token);
        const user = data?.user || resp?.user;
        portalApi.setEmail(user?.email || e);
        notifySuccess(t("Welcome"));
        navigate("/memo-portal", { replace: true });
        return;
      }
    } catch (err) {
      setBusy(false);
      setErrors({ email: err?.message || t("Unable to sign in. Please try again.") });
      return;
    }
    setBusy(false);
    // Fallback: backend still requires a PIN — advance to the code screen.
    setStage("pin");
    setResendCooldown(30);
    notifySuccess(t("We sent a 6-digit code to {{email}}. Check your inbox.", { email: e }));
    setTimeout(() => inputs.current[0]?.focus(), 50);
  };

  const onPinChange = (idx, raw) => {
    const v = raw.replace(/\D/g, "").slice(0, 1);
    setPin((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
    if (v && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const onPinKeyDown = (idx, ev) => {
    if (ev.key === "Backspace" && !pin[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const onPinPaste = (ev) => {
    const txt = (ev.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!txt) return;
    ev.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < txt.length; i++) next[i] = txt[i];
    setPin(next);
    inputs.current[Math.min(txt.length, 5)]?.focus();
  };

  const verifyPin = async () => {
    const code = pin.join("");
    if (code.length !== 6) {
      setErrors({ pin: t("Enter the 6-digit code") });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const resp = await portalApi.verifyPin(email.trim(), code);
      const data = portalApi.unwrap(resp) || resp;
      const token = data?.access_token || data?.token || resp?.access_token;
      if (!token) throw new Error(t("No token in response"));
      portalApi.setToken(token);
      const user = data?.user || resp?.user;
      portalApi.setEmail(user?.email || email.trim());
      notifySuccess(t("Welcome back"));
      navigate("/memo-portal", { replace: true });
    } catch (err) {
      setErrors({ pin: err?.message || t("Invalid or expired code. Please request a new one.") });
    } finally {
      setBusy(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setPin(["", "", "", "", "", ""]);
    requestPin();
  };

  return (
    <div className="mp-auth">
      <div className="mp-auth__glow mp-auth__glow--a" />
      <div className="mp-auth__glow mp-auth__glow--b" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mp-auth__card"
      >
        {/* LEFT — brand panel */}
        <aside className="mp-auth__left">
          <div className="mp-auth__brandRow">
            <img
              src={portalLogo}
              alt="Route Facile"
              className="mp-auth__brandLogo"
            />
            <div className="mp-auth__brandText">
              <div className="mp-auth__brandSub">{t("Memo Portal")}</div>
            </div>
            <span className="mp-auth__pill">{t("Internal")}</span>
          </div>

          <div className="mp-auth__hero">
            <h2>
              {t("Stay aligned.")} <span>{t("Read every memo.")}</span>
            </h2>
            <p>
              {t("A focused workspace for accessing company memos, circulars and policies. Sign in with your Route Facile work email to get started.")}
            </p>
          </div>

          <div className="mp-auth__features">
            {FEATURES.map((f) => (
              <div key={f.title} className="mp-auth__feature">
                <div className="mp-auth__featureIcon">{f.icon}</div>
                <div>
                  <div className="mp-auth__featureTitle">{t(f.title)}</div>
                  <div className="mp-auth__featureDesc">{t(f.desc)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mp-auth__leftFoot">
            <span>{t("Restricted access")}</span>
            <span>{t("Route Facile Staff")}</span>
          </div>
        </aside>

        {/* RIGHT — form panel */}
        <section className="mp-auth__right">
          {stage === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="mp-auth__form"
            >
              <div className="mp-auth__welcome">{t("Welcome")}</div>
              <h1 className="mp-auth__title">{t("Sign in to Memo Portal")}</h1>
              <p className="mp-auth__sub">
                {t("Use your work email (@routefacilecarrental.com) to sign in.")}
              </p>

              <label className="mp-auth__label">{t("Work email")}</label>
              <div className="mp-auth__inputWrap">
                <FaEnvelope className="mp-auth__inputIcon" />
                <input
                  type="email"
                  className="mp-auth__input"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@routefacile.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && requestPin()}
                  disabled={busy}
                />
              </div>
              {errors.email && <div className="mp-auth__error">{errors.email}</div>}

              <button
                className="mp-auth__primary"
                disabled={busy}
                onClick={requestPin}
              >
                {busy ? t("Signing in…") : t("Sign in")}
              </button>

              <div className="mp-auth__help">
                {t("Trouble signing in? Contact")} <strong>{t("Mwasalat IT Support")}</strong>.
              </div>

              <div className="mp-auth__rightFoot">
                © {new Date().getFullYear()} {t("Route Facile. All rights reserved.")}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="mp-auth__form"
            >
              <button
                className="mp-auth__back"
                onClick={() => {
                  setStage("email");
                  setPin(["", "", "", "", "", ""]);
                  setErrors({});
                }}
                disabled={busy}
                type="button"
              >
                <FaArrowLeft size={11} /> {t("Use a different email")}
              </button>

              <div className="mp-auth__welcome">{t("Verify")}</div>
              <h1 className="mp-auth__title">{t("Enter your code")}</h1>
              <p className="mp-auth__sub">
                {t("We sent a 6-digit code to")} <strong>{email}</strong>. {t("It's valid for a few minutes.")}
              </p>

              <div className="mp-pin-row" onPaste={onPinPaste}>
                {pin.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => onPinChange(i, e.target.value)}
                    onKeyDown={(e) => onPinKeyDown(i, e)}
                    disabled={busy}
                  />
                ))}
              </div>
              {errors.pin && <div className="mp-auth__error">{errors.pin}</div>}

              <button
                className="mp-auth__primary"
                disabled={busy}
                onClick={verifyPin}
              >
                {busy ? t("Verifying…") : t("Verify code")}
              </button>

              <div className="mp-auth__resendRow">
                <span className="mp-auth__sub" style={{ margin: 0 }}>
                  {t("Didn't get the code?")}
                </span>
                <button
                  type="button"
                  className="mp-auth__linkBtn"
                  disabled={busy || resendCooldown > 0}
                  onClick={handleResend}
                >
                  {resendCooldown > 0 ? t("Resend in {{seconds}}s", { seconds: resendCooldown }) : t("Resend code")}
                </button>
              </div>

              <div className="mp-auth__rightFoot">
                © {new Date().getFullYear()} {t("Route Facile. All rights reserved.")}
              </div>
            </motion.div>
          )}
        </section>
      </motion.div>
    </div>
  );
};

export default PortalLogin;
