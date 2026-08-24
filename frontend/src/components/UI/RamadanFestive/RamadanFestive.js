import React, { useState, useEffect } from "react";
import "./RamadanFestive.css";
import { useTranslation } from "react-i18next";
import eidAdhaImage from "../../../assets/all-images/Eid-adha-website.png";

const RamadanFestive = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("eid_adha_festive_dismissed");
    if (dismissed === "true") {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("eid_adha_festive_dismissed", "true");
    }, 500);
  };

  if (!visible) return null;

  return (
    <div className={`eid-overlay ${fadeOut ? "eid-overlay-out" : ""}`}>
      <div className="eid-backdrop" onClick={handleDismiss} />

      {/* Confetti */}
      <div className="eid-confetti">
        {[...Array(40)].map((_, i) => (
          <span key={i} className={`e-confetti e-confetti-${i + 1}`} />
        ))}
      </div>

      {/* Sparkles */}
      <div className="eid-sparkles">
        {[...Array(20)].map((_, i) => (
          <span key={i} className={`e-sparkle e-sparkle-${i + 1}`}>✦</span>
        ))}
      </div>

      {/* Card */}
      <div className="eid-card">
        <button className="eid-close" onClick={handleDismiss}>✕</button>

        {/* Decorative top arc */}
        <div className="eid-top-decoration">
          <span className="eid-deco-star">✦</span>
          <span className="eid-deco-crescent">☪</span>
          <span className="eid-deco-star">✦</span>
        </div>

        {/* Eid Al-Adha hero image */}
        <div className="eid-image-wrap">
          <img
            src={eidAdhaImage}
            alt={t("Eid Al-Adha Mubarak")}
            className="eid-image"
          />
        </div>

       
        <h2 className="eid-title">{t("Eid Al-Adha Mubarak")}</h2>

        <p className="eid-subtitle">
          {t("Wishing you and your loved ones a blessed Eid Al-Adha filled with joy, peace and prosperity.")}
        </p>

        <div className="eid-divider">
          <span />
          <span className="eid-divider-icon">☪</span>
          <span />
        </div>

        <div className="eid-promo">
          <span className="eid-promo-tag">{t("Celebrate & Save")}</span>
          {t("Exclusive Eid Al-Adha deals on car rentals — drive the joy home!")}
        </div>

 
      </div>
    </div>
  );
};

export default RamadanFestive;
