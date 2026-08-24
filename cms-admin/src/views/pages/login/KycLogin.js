import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Form, Spinner } from "react-bootstrap";
import CryptoJS from "crypto-js";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaLock,
  FaEnvelope,
  FaFileAlt,
  FaShieldAlt,
  FaUserCheck,
  FaSearch,
} from "react-icons/fa";
import { simplePostCall } from "../../../components/config.js/Setup";
import configWeb from "../../../components/config.js/ConfigWeb";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import logo from "../../../assets/images/admin_sidebar_logo.png";
import "./hr-login.css";

const ALLOWED_ROLES = ["kyc_officer"];

const KycLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const secretKey = process.env.REACT_APP_LOCAL_ENCRYPTION_KEY;

  useEffect(() => {
    setErrorMessage("");
  }, [email, password]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setValidated(true);
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }
    loginKyc();
  };

  const loginKyc = () => {
    setIsLoading(true);
    simplePostCall(
      configWeb.POST_LOGIN,
      JSON.stringify({ email, password })
    )
      .then((res) => {
        if (res?.error) {
          const msg = res.message || t("Invalid email or password");
          setErrorMessage(msg);
          notifyError(msg);
          return;
        }

        const userType = res?.type;
        if (!ALLOWED_ROLES.includes(userType)) {
          const msg = t("This portal is restricted to KYC officers only.");
          setErrorMessage(msg);
          notifyError(msg);
          return;
        }

        const now = new Date();
        const tokenItem = {
          access_token: res?.access_token,
          user_id: res?.user_id,
          expiry: now.getTime() + 2 * 60 * 60 * 1000,
        };
        localStorage.setItem("rf_admin_token", JSON.stringify(tokenItem));
        localStorage.setItem(
          "routefacile_user_role",
          CryptoJS.AES.encrypt(userType, secretKey).toString()
        );
        // KYC officers skip the change-password flow entirely
        localStorage.setItem("routefacile_must_reset_password", "0");
        localStorage.setItem("routefacile_login_portal", "kyc");

        notifySuccess(t("Welcome to the KYC Portal"));
        navigate("/admin/kyc/submissions", { replace: true });
      })
      .catch(() => {
        const msg = t("Something went wrong, please try again");
        setErrorMessage(msg);
        notifyError(msg);
      })
      .finally(() => setIsLoading(false));
  };

  const features = [
    { icon: <FaFileAlt />, title: t("Submissions"), desc: t("Review every KYC application") },
    { icon: <FaUserCheck />, title: t("Verification"), desc: t("Confirm phone & email status") },
    { icon: <FaShieldAlt />, title: t("Secure Documents"), desc: t("Encrypted attachment access") },
    { icon: <FaSearch />, title: t("Fast Search"), desc: t("Filter by status, email, mobile") },
  ];

  return (
    <div className="hr-login-page">
      <div className="hr-login-bg-orb orb-a" />
      <div className="hr-login-bg-orb orb-b" />
      <div className="hr-login-bg-grid" />

      <div className="hr-login-container">
        <motion.div
          className="hr-login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Left brand panel */}
          <div className="hr-login-brand">
            <div className="hr-login-brand-top">
              <img src={logo} alt="Route Facile" className="hr-login-logo" />
              <span className="hr-login-pill">
                <FaIdCard /> {t("KYC Portal")}
              </span>
            </div>

            <div className="hr-login-brand-hero">
              <h1>
                {t("Verify")} <span>{t("identities")}</span>.
                <br />
                {t("Approve with confidence.")}
              </h1>
              <p>
                {t("A focused workspace for KYC officers to review submissions, inspect supporting documents and confirm verification status.")}
              </p>
            </div>

            <div className="hr-login-feature-grid">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="hr-login-feature"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                >
                  <div className="hr-login-feature-icon">{f.icon}</div>
                  <div>
                    <div className="hr-login-feature-title">{f.title}</div>
                    <div className="hr-login-feature-desc">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="hr-login-brand-foot">
              <span>{t("Restricted access")}</span>
              <span>{t("KYC Officer")}</span>
            </div>
          </div>

          {/* Right form panel */}
          <div className="hr-login-form-side">
            <div className="hr-login-form-wrap">
              <div className="hr-login-mobile-logo">
                <img src={logo} alt="Route Facile" />
              </div>

              <div className="hr-login-form-header">
                <h2>{t("Welcome back")}</h2>
                <p>{t("Sign in to access the KYC Portal.")}</p>
              </div>

              <Form
                noValidate
                onSubmit={handleSubmit}
                className={`hr-login-form ${validated ? "was-validated" : ""}`}
              >
                <label className="hr-login-label" htmlFor="kyc-email">
                  {t("Work email")}
                </label>
                <div className="hr-login-input">
                  <FaEnvelope className="hr-login-input-icon" />
                  <input
                    id="kyc-email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@routefacile.ma"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <label className="hr-login-label mt-3" htmlFor="kyc-password">
                  {t("Password")}
                </label>
                <div className="hr-login-input">
                  <FaLock className="hr-login-input-icon" />
                  <input
                    id="kyc-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("Enter your password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="hr-login-eye"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                <div className="hr-login-row">
                  <label className="hr-login-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>{t("Remember me")}</span>
                  </label>
                </div>

                {errorMessage && (
                  <motion.div
                    className="hr-login-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errorMessage}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="hr-login-submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                >
                  {isLoading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    t("Sign in to KYC Portal")
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("kyc@routefacile.ma");
                    setPassword("KycOfficer@1234");
                  }}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px dashed #93c5fd",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t("Fill demo credentials")}
                </button>

                <div className="hr-login-help">
                  {t("Trouble signing in? Contact your IT Support.")}
                </div>
              </Form>
            </div>

            <div className="hr-login-footer">
              {t("© {{year}} Route Facile. All rights reserved.", { year: new Date().getFullYear() })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KycLogin;
