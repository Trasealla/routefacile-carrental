import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import configWeb from "../../../config.js/configWeb";
import "./PromoTicker.css";

const PromoTicker = () => {
  // The promo_tickers table only stores EN + AR — there is no French column, so
  // the API hands back English on /fr. Run the text through i18n as a stopgap:
  // known strings get their French copy, anything new falls back to English.
  const { t } = useTranslation();
  const [tickers, setTickers] = useState([]);
  const [scrollSpeed, setScrollSpeed] = useState(30); // default 30 seconds
  const language = useSelector((state) => state.language.language);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const lang = language === "ar" ? "ar" : "en";
        const url = `${configWeb.GET_PROMO_TICKER}?lang=${lang}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Accept-Language": lang,
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
        });
        const res = await response.json();
        // Handle both direct array and wrapped { data: [...] } responses
        const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setTickers(data);
        // Read scroll_speed from API response (seconds). Supports:
        // - Top-level: { scroll_speed: 25, data: [...] }
        // - Per-ticker: [{ scroll_speed: 25, text: "..." }]
        const speed = res?.scroll_speed || data?.[0]?.scroll_speed;
        if (speed && Number(speed) > 0) {
          setScrollSpeed(Number(speed));
        }
      } catch (err) {
        console.error("Failed to fetch promo ticker:", err);
        setTickers([]);
      }
    };

    fetchTickers();
  }, [language]);

  if (tickers.length === 0) return null;

  // Bulletproof external link handler — prevents any default browser/router
  // navigation and uses window.open to guarantee the full external URL opens
  const handleExternalLink = (e, url) => {
    e.preventDefault();
    e.stopPropagation();
    // Ensure the URL has a protocol prefix
    const finalUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  // Convert URLs in text to clickable <span> elements (NOT <a> tags)
  // Using <span> avoids any browser href-based navigation entirely
  const renderTextWithLinks = (text) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <span
          key={i}
          role="link"
          tabIndex={0}
          className="promo-ticker-link"
          style={{ cursor: "pointer" }}
          onClick={(e) => handleExternalLink(e, part)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleExternalLink(e, part);
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="promo-ticker-bar">
      <div className="promo-ticker-content">
        <div
          className="promo-ticker-scroll"
          style={{ animationDuration: `${scrollSpeed}s` }}
        >
          {tickers.map((ticker, index) => (
            <span key={ticker.id} className="promo-ticker-item">
              {ticker.link ? (
                <span
                  role="link"
                  tabIndex={0}
                  className="promo-ticker-link"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handleExternalLink(e, ticker.link)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExternalLink(e, ticker.link);
                  }}
                >
                  {t(ticker.text)}
                </span>
              ) : (
                renderTextWithLinks(t(ticker.text))
              )}
              {tickers.length > 1 && index < tickers.length - 1 && (
                <span className="promo-ticker-separator">|</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoTicker;
