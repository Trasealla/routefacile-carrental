import React, { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../context/CurrencyContext";
import { fixImageUrl } from "../../SharedComponent/reusableFunctions";
import "../../styles/stickyBookingSummary.css";

// The tax rate implied by the amounts, or "" when nothing is charged. Derived
// rather than hard-coded: the previous label said "(5%)" while the configured
// rate was 0, so the line claimed a tax that was not on the bill.
const vatLabelSuffix = (vat, subTotal) => {
  const v = Number(vat), s = Number(subTotal);
  if (!v || !s) return "";
  const pct = Math.round((v / s) * 100);
  return pct > 0 ? ` (${pct}%)` : "";
};

const CostTooltip = ({ selectedCar, addProtection, carExtraArray, babyDriver, subTotal, vat, total, requestBody_pickup, t }) => {
  const { format: fmt, formatAlt, isEur } = useCurrency();
  const isMonthly =
    selectedCar?.payment_method === "pay_monthly_now" ||
    selectedCar?.payment_method === "pay_monthly_later";

  const baseRate = isMonthly
    ? selectedCar?.car_rate_total
    : selectedCar?.payment_method === "pay_later"
    ? selectedCar?.pay_later
    : selectedCar?.pay_now;

  const extras = [];

  if (addProtection?.pai && Number(carExtraArray?.[0]?.pai) > 0) {
    extras.push({ label: t("PAI"), amount: Number(carExtraArray[0].pai) });
  }
  if (addProtection?.cdw && Number(carExtraArray?.[0]?.cdw) > 0) {
    extras.push({ label: t("CDW"), amount: Number(carExtraArray[0].cdw) });
  }
  if (addProtection?.scdw && Number(carExtraArray?.[0]?.scdw) > 0) {
    extras.push({ label: t("SCDW"), amount: Number(carExtraArray[0].scdw) });
  }
  if (addProtection?.baby_seat && Number(carExtraArray?.[0]?.baby_seat) > 0) {
    extras.push({
      label: `${t("Baby Seat")} x${babyDriver?.baby_seat || 1}`,
      amount: Number(carExtraArray[0].baby_seat) * Number(babyDriver?.baby_seat || 1),
    });
  }
  if (addProtection?.gps && Number(carExtraArray?.[0]?.gps) > 0) {
    extras.push({ label: t("GPS"), amount: Number(carExtraArray[0].gps) });
  }
  if (addProtection?.driver && Number(carExtraArray?.[0]?.driver) > 0) {
    extras.push({
      label: `${t("Driver")} x${babyDriver?.driver || 1}`,
      amount: Number(carExtraArray[0].driver) * Number(babyDriver?.driver || 1),
    });
  }
  if (addProtection?.activeKM) {
    extras.push({
      label: t("KM Allowance"),
      amount: Number(addProtection.activeKM) * Number(selectedCar?.booking_months || 1),
    });
  }

  const charges = [];
  if (Number(selectedCar?.delivery_charges) > 0)
    charges.push({ label: t("Delivery"), amount: Number(selectedCar.delivery_charges) });
  if (Number(selectedCar?.collection_charges) > 0)
    charges.push({ label: t("Collection"), amount: Number(selectedCar.collection_charges) });
  if (Number(selectedCar?.pickup_parking_charges) > 0)
    charges.push({ label: t("Pickup Parking"), amount: Number(selectedCar.pickup_parking_charges) });
  if (Number(selectedCar?.dropoff_parking_charges) > 0)
    charges.push({ label: t("Dropoff Parking"), amount: Number(selectedCar.dropoff_parking_charges) });
  if (Number(selectedCar?.inter_cities_charges) > 0)
    charges.push({ label: t("Inter Cities"), amount: Number(selectedCar.inter_cities_charges) });
  if (Number(selectedCar?.vmd_charges) > 0)
    charges.push({ label: t("VMD Charges"), amount: Number(selectedCar.vmd_charges) });

  return (
    <div className="cost-tooltip">
      <div className="cost-tooltip__header">{t("Cost Breakdown")}</div>
      <div className="cost-tooltip__body">
        <div className="cost-tooltip__row">
          <span>{t("Base Rate")}</span>
          <span>{fmt(baseRate || 0, { decimals: 2 })}</span>
        </div>

        {extras.length > 0 && (
          <>
            <div className="cost-tooltip__divider"></div>
            <div className="cost-tooltip__section-label">{t("Extras")}</div>
            {extras.map((item, i) => (
              <div className="cost-tooltip__row" key={i}>
                <span>{item.label}</span>
                <span>{fmt(item.amount, { decimals: 2 })}</span>
              </div>
            ))}
          </>
        )}

        {charges.length > 0 && (
          <>
            <div className="cost-tooltip__divider"></div>
            <div className="cost-tooltip__section-label">{t("Charges")}</div>
            {charges.map((item, i) => (
              <div className="cost-tooltip__row" key={i}>
                <span>{item.label}</span>
                <span>{fmt(item.amount, { decimals: 2 })}</span>
              </div>
            ))}
          </>
        )}

        <div className="cost-tooltip__divider"></div>
        <div className="cost-tooltip__row">
          <span>{t("Subtotal")}</span>
          <span>{fmt(subTotal, { decimals: 2 })}</span>
        </div>
        {Number(vat) > 0 && (
          <div className="cost-tooltip__row">
            <span>{t("VAT")}{vatLabelSuffix(vat, subTotal)}</span>
            <span>{fmt(vat, { decimals: 2 })}</span>
          </div>
        )}
        <div className="cost-tooltip__divider"></div>
        <div className="cost-tooltip__row cost-tooltip__row--total">
          <span>{t("Total")}</span>
          <span>{fmt(total, { decimals: 2 })}</span>
        </div>
        {/* The gateway only ever charges dirhams — say so while showing euros */}
        {isEur && (
          <div className="cost-tooltip__note">
            {t("Prices are charged in Moroccan dirhams. Euro amounts are indicative.")}
            <br />
            {t("Total")}: {formatAlt(total, { decimals: 2 })}
          </div>
        )}
      </div>
    </div>
  );
};

const StickyBookingSummary = ({
  total,
  subTotal,
  vat,
  handleBookingClick,
  loading_confirmBookin,
  babyDriver,
}) => {
  const { t } = useTranslation();
  const { format: fmt } = useCurrency();
  const selectedCar = useSelector((state) => state.selectedCar.selectedCar);
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const addProtection = useSelector(
    (state) => state.addProtection.addProtection
  );
  const carExtraArray = useSelector(
    (state) => state.carExtraArray.carExtraArray
  );
  const editUserBookingObject = useSelector(
    (state) => state.editUserBookingObject.editUserBookingObject
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px
      setVisible(window.scrollY > 400 && selectedCar?.car_name);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedCar]);

  const getButtonText = () => {
    if (loading_confirmBookin) return null;
    if (!localStorage.getItem("token")) return t("Login or continue as guest");
    if (
      requestBody_pickup?.booking_type === "daily" &&
      selectedCar?.payment_method === "pay_now"
    )
      return t("Continue to payment");
    if (
      requestBody_pickup?.booking_type === "monthly" &&
      selectedCar?.payment_method === "pay_monthly_now"
    )
      return t("Continue to pay 1st installment");
    if (
      selectedCar?.payment_method === "pay_later" ||
      selectedCar?.payment_method === "pay_monthly_later"
    )
      return t("Confirm booking");
    return t("Continue to payment");
  };

  if (!selectedCar?.car_name) return null;

  return (
    <div className={`sticky-summary ${visible ? "sticky-summary--visible" : ""}`}>
      <div className="sticky-summary__inner">
        {/* Car info */}
        <div className="sticky-summary__car">
          <img
            src={fixImageUrl(selectedCar?.image)}
            alt={selectedCar?.car_name}
            className="sticky-summary__car-img"
          />
          <div className="sticky-summary__car-info">
            <span className="sticky-summary__car-name">
              {selectedCar?.car_name}
            </span>
            <span className="sticky-summary__car-type">
              {requestBody_pickup?.booking_type === "monthly"
                ? `${selectedCar?.booking_months} ${
                    Number(selectedCar?.booking_months) === 1
                      ? t("month")
                      : t("months")
                  }`
                : `${selectedCar?.booking_days} ${
                    Number(selectedCar?.booking_days) === 1
                      ? t("day")
                      : t("days")
                  }`}
            </span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="sticky-summary__pricing">
          <div className="sticky-summary__price-row">
            <span className="sticky-summary__price-label">{t("Subtotal")}</span>
            <span className="sticky-summary__price-value">
              {fmt(subTotal, { decimals: 2 })}
            </span>
          </div>
          {Number(vat) > 0 && (
            <div className="sticky-summary__price-row">
              <span className="sticky-summary__price-label">
                {t("VAT")}{vatLabelSuffix(vat, subTotal)}
              </span>
              <span className="sticky-summary__price-value">
                {fmt(vat, { decimals: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Total with tooltip */}
        <div className="sticky-summary__total cost-tooltip__trigger">
          <span className="sticky-summary__total-label">
            {t("Total")}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px", opacity: 0.6 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          <span className="sticky-summary__total-value">
            {fmt(total, { decimals: 2 })}
          </span>
          <CostTooltip
            selectedCar={selectedCar}
            addProtection={addProtection}
            carExtraArray={carExtraArray}
            babyDriver={babyDriver}
            subTotal={subTotal}
            vat={vat}
            total={total}
            requestBody_pickup={requestBody_pickup}
            t={t}
          />
        </div>

        {/* CTA */}
        <Button
          className="sticky-summary__btn"
          onClick={handleBookingClick}
          disabled={loading_confirmBookin}
        >
          {loading_confirmBookin ? (
            <Spinner size="sm" animation="border" />
          ) : (
            getButtonText()
          )}
        </Button>
      </div>
    </div>
  );
};

export default StickyBookingSummary;
