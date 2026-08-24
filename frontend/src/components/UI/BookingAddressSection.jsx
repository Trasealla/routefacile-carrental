import React, { useContext } from "react";
import { Container, Badge } from "react-bootstrap";
import { AppContext } from "../../context/AppContext";
import { useSelector } from "react-redux";
import useMediaQuery from "../../SharedComponent/useMediaQueryHook";
import { useTranslation } from "react-i18next";

const BookingAddressSection = (props) => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const carArray = useSelector((state) => state.carArray.carArray);
  const selectedPickupLocation = useSelector(
    (state) => state.selectedPickupLocation.selectedPickupLocation
  );
  const selectedDropoffLocation = useSelector(
    (state) => state.selectedDropoffLocation.selectedDropoffLocation
  );
  const inputValue = useSelector((state) => state.inputValue.inputValue);
  const inputValueDropoff = useSelector(
    (state) => state.inputValueDropoff.inputValueDropoff
  );
  const {} = useContext(AppContext);
  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );

  // Morocco writes Arabic dates in Western digits, so ar-MA (not ar-AE, which
  // would render ١ ٢ ٣). The itinerary was hardcoded to en-US, which printed
  // "Tuesday, September 1, 2026" in the middle of an otherwise Arabic page.
  const LOCALES = { ar: "ar-MA", fr: "fr-MA", en: "en-GB" };
  const locale = LOCALES[language] || "en-GB";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    if (!isMobile) options.weekday = "long";
    return new Intl.DateTimeFormat(locale, options).format(date);
  };

  const convertTimeTo12Hour = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    if (isNaN(hour)) return "";
    const d = new Date(2000, 0, 1, hour, parseInt(minutes, 10) || 0);
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  const getDurationText = () => {
    const isMonthly = requestBody_pickup?.booking_type === "monthly";
    let count = isMonthly
      ? carArray?.[0]?.booking_months
      : carArray?.[0]?.booking_days;

    // Fallback so the pill never reads "undefined days" (e.g. while cars are still
    // loading, or a search returns none): derive the count from the itinerary itself.
    if (count === undefined || count === null || count === "") {
      if (isMonthly) {
        count = requestBody_pickup?.booking_months;
      } else {
        const pd = requestBody_dropoff?.pickup_date || requestBody_pickup?.pickup_date;
        const dd = requestBody_dropoff?.dropoff_date;
        if (pd && dd) {
          const diff = Math.round(
            (new Date(dd).setHours(0, 0, 0, 0) - new Date(pd).setHours(0, 0, 0, 0)) / 86400000
          );
          count = diff > 0 ? diff : 1;
        }
      }
    }
    if (count === undefined || count === null || count === "") return "";

    const unit = isMonthly
      ? Number(count) === 1
        ? t("month")
        : t("months")
      : Number(count) === 1
      ? t("day")
      : t("days");
    let text = `${count} ${unit}`;
    if (
      isMonthly &&
      Number(carArray?.[0]?.flexi_days) > 0
    ) {
      text += ` & ${carArray[0].flexi_days} ${
        Number(carArray[0].flexi_days) === 1 ? t("day") : t("days")
      }`;
    }
    return text;
  };

  const pickupAddress =
    requestBody_pickup?.pickup_type === "delivery"
      ? inputValue
      : isMobile
      ? selectedPickupLocation?.label
      : selectedPickupLocation?.address;

  const dropoffAddress =
    requestBody_dropoff?.dropoff_type === "collection"
      ? inputValueDropoff
        ? inputValueDropoff
        : inputValue
      : isMobile
      ? selectedDropoffLocation?.label
        ? selectedDropoffLocation?.label
        : selectedPickupLocation?.label
      : selectedDropoffLocation?.address
      ? selectedDropoffLocation?.address
      : selectedPickupLocation?.address;

  return (
    <div className="display-none-in-small-screen">
      <div className="bas-hero">
        <Container className="p-sm-0">
          <div className="bas-card">
            {/* Pickup */}
            <div className="bas-card__block bas-card__block--pickup">
              <div className="bas-card__icon-wrap">
                <div className="bas-card__icon bas-card__icon--pickup">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
              </div>
              <div className="bas-card__content">
                <span className="bas-card__label">{t("Pick Up Location")}</span>
                <h6 className="bas-card__address">{pickupAddress}</h6>
                <div className="bas-card__datetime">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{formatDate(requestBody_pickup?.pickup_date)}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "8px" }}>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{convertTimeTo12Hour(requestBody_pickup?.pickup_time)}</span>
                </div>
              </div>
            </div>

            {/* Duration Center */}
            <div className="bas-card__center">
              <div className="bas-card__duration-line">
                <div className="bas-card__dot bas-card__dot--start"></div>
                <div className="bas-card__line"></div>
                <div className="bas-card__duration-badge">
                  <span>{getDurationText()}</span>
                </div>
                <div className="bas-card__line"></div>
                <div className="bas-card__dot bas-card__dot--end"></div>
              </div>
            </div>

            {/* Dropoff */}
            <div className="bas-card__block bas-card__block--dropoff">
              <div className="bas-card__icon-wrap">
                <div className="bas-card__icon bas-card__icon--dropoff">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
              </div>
              <div className="bas-card__content">
                <span className="bas-card__label">{t("Drop Off Location")}</span>
                <h6 className="bas-card__address">{dropoffAddress}</h6>
                <div className="bas-card__datetime">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{formatDate(requestBody_dropoff?.dropoff_date)}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "8px" }}>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{convertTimeTo12Hour(requestBody_dropoff?.dropoff_time)}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default BookingAddressSection;
