import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { simplePostCall } from "../../../components/config.js/Setup";
import configWeb from "../../../components/config.js/ConfigWeb";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import { Form, Spinner } from "react-bootstrap";
import CryptoJS from "crypto-js";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaShieldAlt, FaCar, FaChartBar } from "react-icons/fa";
import logo from "../../../assets/images/logo_new.png";
import logoWhite from "../../../assets/images/routefacile-logo-white.png";
import carImg from "../../../assets/images/bakcar1.jpg";
import { useTranslation } from "react-i18next";
import LangSwitcher from "../../../components/LangSwitcher/LangSwitcher";

const Login = () => {
  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [rememberMe,   setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading,    setIsLoading]    = useState(false);
  const [validated,    setValidated]    = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { setErrorMessage(""); }, [username, password]);

  const togglePassword    = () => setShowPassword((p) => !p);
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRememberMeChange = (e) => setRememberMe(e.target.checked);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) { event.stopPropagation(); }
    else { LoginUser(); }
    setValidated(true);
  };

  const secretKey = process.env.REACT_APP_LOCAL_ENCRYPTION_KEY;

  const LoginUser = () => {
    setIsLoading(true);
    simplePostCall(configWeb.POST_LOGIN, JSON.stringify({ email: username, password }))
      .then((res) => {
        if (!res?.error) {
          const now = new Date();
          localStorage.setItem("rf_admin_token", JSON.stringify({
            access_token: res?.access_token,
            user_id: res?.user_id,
            expiry: now.getTime() + 2 * 60 * 60 * 1000,
          }));
          localStorage.setItem("routefacile_user_role", CryptoJS.AES.encrypt(res?.type, secretKey).toString());
          localStorage.setItem("routefacile_must_reset_password", res?.must_reset_password ? "1" : "0");
          localStorage.setItem("routefacile_login_portal", "admin");
          notifySuccess("Login Successful.");
          const userType = res?.type;
          if (res?.must_reset_password && userType !== "kyc_officer") {
            navigate("/admin/change-password", { replace: true });
          } else {
            let redirectTo = "/";
            if      (userType === "hr_manager")     redirectTo = "/hr/dashboard/manager";
            else if (userType === "hr_recruitment") redirectTo = "/hr/dashboard/staff";
            else if (userType === "kyc_officer")    redirectTo = "/admin/kyc/submissions";
            navigate(redirectTo, { replace: true });
          }
        } else {
          const msg = res.message || "Invalid email or password";
          setErrorMessage(msg);
          notifyError(msg);
        }
      })
      .catch(() => {
        const msg = "Something went wrong, please try again";
        setErrorMessage(msg);
        notifyError(msg);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-row">

          {/* ── LEFT PANEL ──────────────────────────────────────────── */}
          <div className="login-left-panel">
            {/* Animated orbs */}
            <div className="lp-orb lp-orb-1" />
            <div className="lp-orb lp-orb-2" />
            <div className="lp-orb lp-orb-3" />
            {/* Grid overlay */}
            <div className="lp-grid" />

            {/* Car image */}
            <div className="lp-car-wrap">
              <img src={carImg} alt="" className="lp-car-img" />
            </div>

            <div className="lp-content">
              {/* Logo */}
              <div className="lp-logo-wrap">
                <img src={logoWhite} alt="Route Facile" onError={(e) => { e.target.src = logo; e.target.style.filter = "brightness(10)"; }} />
              </div>

              <h2 className="lp-headline">
                {t('login.headline')}<br /><span>{t('login.headlineAccent')}</span>
              </h2>
              <p className="lp-sub">{t('login.subheadline')}</p>

              {/* Features */}
              <div className="lp-features">
                <div className="lp-feature">
                  <div className="lp-feature-icon lp-feature-icon--svg"><FaCar size={20} /></div>
                  <div className="lp-feature-text"><h6>{t('login.feature1Title')}</h6><p>{t('login.feature1Desc')}</p></div>
                </div>
                <div className="lp-feature">
                  <div className="lp-feature-icon lp-feature-icon--svg"><FaChartBar size={20} /></div>
                  <div className="lp-feature-text"><h6>{t('login.feature2Title')}</h6><p>{t('login.feature2Desc')}</p></div>
                </div>
                <div className="lp-feature">
                  <div className="lp-feature-icon lp-feature-icon--svg"><FaShieldAlt size={20} /></div>
                  <div className="lp-feature-text"><h6>{t('login.feature3Title')}</h6><p>{t('login.feature3Desc')}</p></div>
                </div>
              </div>
            </div>

            {/* System status badge */}
            <div className="lp-badge">
              <span className="lp-dot" />
              <span>{t('login.systemStatus')}</span>
            </div>
          </div>

          {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
          <div className="login-right-panel">
            <div className="login-form-container">

              {/* Logo */}
              <div className="login-logo">
                <img src={logo} alt="Route Facile" />
              </div>

              {/* Language switcher on login page */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <LangSwitcher />
              </div>

              {/* Admin badge */}
              <div className="login-admin-badge">
                <span className="badge-inner">
                  <FaShieldAlt size={11} /> {t('login.adminPortal')}
                </span>
              </div>

              {/* Header */}
              <div className="login-header">
                <h4>{t('login.welcome')} <span>{t('login.admin')}</span></h4>
                <p>{t('login.subtitle')}</p>
              </div>

              {/* Divider */}
              <div className="login-divider">
                <span /><em>{t('login.credentialsLabel')}</em><span />
              </div>

              {/* Form */}
              <Form noValidate onSubmit={handleSubmit} className={validated ? "was-validated" : ""}>

                {/* Email */}
                <div className="lf-input-group">
                  <label htmlFor="email-input">{t('login.emailLabel')}</label>
                  <div className="lf-input-wrap">
                    <span className="lf-input-icon"><FaEnvelope /></span>
                    <input
                      type="email"
                      className="form-control"
                      id="email-input"
                      placeholder={t('login.emailPlaceholder')}
                      value={username}
                      onChange={handleUsernameChange}
                      autoComplete="email"
                      required
                    />
                    <div className="invalid-feedback">{t('login.emailError')}</div>
                  </div>
                </div>

                {/* Password */}
                <div className="lf-input-group">
                  <label htmlFor="password-input">{t('login.passwordLabel')}</label>
                  <div className="lf-input-wrap">
                    <span className="lf-input-icon"><FaLock /></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control password-input"
                      id="password-input"
                      placeholder={t('login.passwordPlaceholder')}
                      value={password}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      required
                    />
                    <button type="button" className="password-toggle-btn" onClick={togglePassword} tabIndex={-1}>
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    <div className="invalid-feedback">{t('login.passwordError')}</div>
                  </div>
                </div>

                {/* Remember me */}
                <div className="lf-remember">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <label htmlFor="rememberMe">{t('login.rememberMe')}</label>
                </div>

                {/* Submit */}
                <button className="btn-login" type="submit" disabled={isLoading}>
                  {isLoading
                    ? <><Spinner size="sm" /> {t('login.signingIn')}</>
                    : <><FaCar size={14} /> {t('login.signIn')}</>
                  }
                </button>

                {/* Error */}
                {errorMessage && (
                  <div className="login-error">
                    <span>⚠</span> {errorMessage}
                  </div>
                )}
              </Form>

              {/* Footer */}
              <p className="login-footer-note">
                © {new Date().getFullYear()} {t('login.copyright')}
              </p>
              <p className="login-version-note">v2.1.0</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
