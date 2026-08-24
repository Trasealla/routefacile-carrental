import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from "./components/context/AppContext"; // Adjust path as needed

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // One-time migration: copy localStorage keys written under either previous
    // brand to the current `routefacile_*` names, so admins who were logged in
    // before a rebrand are not silently signed out. Earlier prefixes are tried
    // newest-first — an account that survived both renames has keys under
    // `trasealla_*`, and those are the current ones.
    const legacyPrefixes = ["trasealla_", "autostrad_"];
    const migratedKeys = [
      "user_role",
      "must_reset_password",
      "login_portal",
      "user_id",
      "user_name",
      "user_email",
    ];
    migratedKeys.forEach((suffix) => {
      const newKey = `routefacile_${suffix}`;
      legacyPrefixes.forEach((prefix) => {
        const oldKey = `${prefix}${suffix}`;
        const oldVal = localStorage.getItem(oldKey);
        if (oldVal === null) return;
        if (localStorage.getItem(newKey) === null) {
          localStorage.setItem(newKey, oldVal);
        }
        localStorage.removeItem(oldKey);
      });
    });

    // Check authentication whenever the location changes
    const checkAuth = () => {
      // "rf_admin_token", not "token": the customer site and this admin panel
      // are served from the same origin, so they share one localStorage. Both
      // used the key "token", so signing into the CMS overwrote the customer
      // token — and the public site then sent an ADMIN JWT to the booking API.
      // Admin tokens are signed with ADMIN_JWT_SECRET and the booking endpoint
      // verifies with JWT_SECRET, so every booking confirmed in that browser
      // failed with 401. Keep these two key names distinct.
      const token = localStorage.getItem("rf_admin_token");
      if (token) {
        try {
          const tokenItem = JSON.parse(token);
          const now = new Date();
          // Check if token is expired
          if (now.getTime() > tokenItem?.expiry) {
            localStorage.removeItem("rf_admin_token");
            localStorage.removeItem("routefacile_user_role");
            localStorage.removeItem("routefacile_must_reset_password");
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          localStorage.removeItem("rf_admin_token");
          localStorage.removeItem("routefacile_user_role");
          localStorage.removeItem("routefacile_must_reset_password");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [location]);

  if (isChecking) {
    return null; // or a loading spinner
  }

  // Read mustResetPassword directly from localStorage on every render to avoid
  // stale-state race condition when ChangePassword sets it to "0" then calls navigate()
  const mustResetPassword = localStorage.getItem("routefacile_must_reset_password") === "1";
  const loginPortal = localStorage.getItem("routefacile_login_portal");

  // KYC officers never go through the change-password flow.
  if (isAuthenticated && mustResetPassword && loginPortal !== "kyc") {
    const isResetPath =
      location.pathname === "/change-password" ||
      location.pathname === "/admin/change-password";
    if (!isResetPath) {
      return <Navigate to="/admin/change-password" replace />;
    }
  }

  const loginRedirect =
    location.pathname?.startsWith("/admin/kyc") || loginPortal === "kyc"
      ? "/admin/kyc/login"
      : location.pathname?.startsWith("/hr") || loginPortal === "hr"
      ? "/hr/login"
      : "/login";

  return isAuthenticated ? element : <Navigate to={loginRedirect} replace />;
};

export default ProtectedRoute;
