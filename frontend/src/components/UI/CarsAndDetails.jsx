import React, { useEffect, useState } from "react";
import { Button, Card, Col, Modal } from "react-bootstrap";
import { useParams } from "react-router-dom";
import "../../styles/car_and_details.css";
import arrowIcon from "../../assets/all-images/cars-img/cardArrow.svg";
import { carData } from "../../assets/data/carData";
import { useSelector, useDispatch } from "react-redux";
import { trackBeginCheckout, trackSelectItem } from "../../SharedComponent/tracking";
import "./CarsAndDetails.css";
import CarDetails from "../../pages/CarDetails";
import { useTranslation } from "react-i18next";
import usePublicSettings from "../../hooks/usePublicSettings";
import { useCurrency } from "../../context/CurrencyContext";
function CarsAndDetails({
  item,
  isChecked,
  onCheckboxChange,
  isSelected,
  saved_car_flag,
  setSelectedPaymentOption,
  goToBooking,
}) {
  const values = [true, "sm-down", "md-down", "lg-down", "xl-down", "xxl-down"];
  const { t } = useTranslation();
  // "Pay Now" is hidden until the CMI gateway is live — toggled from the admin
  // portal (Settings → pay_now_enabled). Defaults to hidden if the call fails.
  const { payNowEnabled } = usePublicSettings();
  // headline price in whatever currency the visitor picked, the other one below
  const { format: fmt, formatAlt } = useCurrency();
  const [fullscreen, setFullscreen] = useState(true);
  function handleShow(breakpoint) {
    setFullscreen(breakpoint);
    setModalShow(true);
  }
  const { booking_number } = useParams();
  const [payButtonSelected, setPayButtonSelected] = useState(null);
  const [modalShow, setModalShow] = React.useState(false);
  const editUserBookingObject = useSelector(
    (state) => state.editUserBookingObject.editUserBookingObject
  );

  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );

  const selectedPickupLocation = useSelector(
    (state) => state.selectedPickupLocation.selectedPickupLocation
  );

  // Check if virtual location is selected
  const isVirtualLocation = selectedPickupLocation?.is_virtual === true || selectedPickupLocation?.is_virtual === 1;

  const isMonthly = requestBody_pickup?.booking_type !== "daily";

  // The payment tiles this card actually renders. "Pay Now" stays hidden while
  // the CMI gateway is off and "Pay Later" is hidden at virtual (delivery-only)
  // locations, so in practice this is usually a single entry — and a single
  // option is not a choice. Knowing the list lets the CTA book straight away in
  // that case instead of demanding a click on a price that looks like a label.
  const availableOptions = booking_number
    ? [
        editUserBookingObject?.payment_type === "now"
          ? isMonthly
            ? "pay_monthly_now"
            : "pay_now"
          : isMonthly
          ? "pay_monthly_later"
          : "pay_later",
      ]
    : [
        ...(payNowEnabled ? [isMonthly ? "pay_monthly_now" : "pay_now"] : []),
        ...(isVirtualLocation ? [] : [isMonthly ? "pay_monthly_later" : "pay_later"]),
      ];

  const [needsChoice, setNeedsChoice] = useState(false);

  const selectCar = (option) => {
    setNeedsChoice(false);
    setSelectedPaymentOption(option);
    setPayButtonSelected(option);
    onCheckboxChange(item.id);
  };

  // Select and continue in one gesture. goToBooking is given the option and the
  // car explicitly because neither the Redux dispatch above nor the parent's
  // setState has been applied by the time it runs.
  const proceed = () => {
    const option =
      payButtonSelected ||
      (availableOptions.length === 1 ? availableOptions[0] : null);
    if (!option) {
      setNeedsChoice(true);
      return;
    }
    // The customer picked this car and is moving to enter their details, so
    // both events belong here: the choice, then the start of checkout.
    const total = item?.pay_later ?? item?.pay_now ?? item?.car_rate_total ?? 0;
    const car = { id: item?.id, name: item?.car_name };
    trackSelectItem({ car, car_total: total });
    trackBeginCheckout({
      final_total: total,
      rental_days: item?.booking_days,
      car,
    });
    selectCar(option);
    goToBooking(option, item);
  };

  // With two options the tiles are a genuine choice, so a click only selects and
  // the CTA continues. With one option there is nothing to choose, so a click on
  // the price means the same thing as a click on the card.
  const handlePaymentOptionChange = (option) => {
    selectCar(option);
    if (availableOptions.length === 1) {
      goToBooking(option, item);
    }
  };

  const [car_id, set_car_id] = useState(null);
  const handleCarDetailsModal = (id) => {
    set_car_id(id);
    setModalShow(true);
  };
  return (
    <>
      {/* The whole card is the target: customers click the photo or the name far
          more often than a price tile, and until this was wired up those clicks
          did nothing at all. Keyboard users get the same action via Enter/Space. */}
      <div
        className="cardetails__card-wrapper cardetails__card-wrapper--clickable"
        role="button"
        tabIndex={0}
        aria-label={`${t("Select Car")} — ${item?.car_name || ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          proceed();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            proceed();
          }
        }}
      >
        <label
          className={`w-100 ${
            saved_car_flag === "yes" ? "saved_car_highlighter" : ""
          }`}
        >
          <div
            className={`cardetails__item cardetails__item-enhanced ${
              isSelected ? "selected" : ""
            }`}
          >
            {/* Category Badge */}
            <div className="cardetails__category-badge">
              <span>{item?.category ? t(item.category) : ""}</span>
            </div>

            {/* Car Image Section */}
            <div className="cardetails__image-wrapper">
              <img
                src={item?.image}
                alt={item?.car_name}
                className="cardetails__car-img"
              />
            </div>

            {/* Car Info Section */}
            <div className="cardetails__info-section">
              <h4 className="cardetails__car-name">{item?.car_name}</h4>
              <p className={`cardetails__similar-text ${item.featured === 1 ? "hide-car-features" : ""}`}>
                {/* The separator only earns its place when both sides exist —
                    a missing category used to leave a dangling "or Similar |". */}
                {t("or Similar")}
                {item?.category ? ` | ${t(item.category)}` : ""}
              </p>

              {/* Specs Grid */}
              <div className="cardetails__specs-grid">
                <div className="cardetails__spec-chip">
                  <img src={carData?.[0]?.icon1} alt="" className="cardetails__spec-icon" />
                  <span>{item?.transmission ? t(item.transmission) : ""}</span>
                </div>
                <div className="cardetails__spec-chip">
                  <img src={carData?.[0]?.icon2} alt="" className="cardetails__spec-icon" />
                  <span>{item?.passengers}</span>
                </div>
                <div className="cardetails__spec-chip">
                  <img src={carData?.[0]?.icon3} alt="" className="cardetails__spec-icon" />
                  <span>{item?.fuel_type ? t(item.fuel_type) : ""}</span>
                </div>
                <div className="cardetails__spec-chip">
                  <img src={carData?.[0]?.icon05} alt="" className="cardetails__spec-icon" height="18px" width="18px" />
                  <span>4</span>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="cardetails__pricing-section">
              <div className="cardetails__pricing-buttons">
                {!booking_number &&
                  (requestBody_pickup?.booking_type === "daily" ? (
                    <>
                      {payNowEnabled && (
                      <div
                        className={`cardetails__price-btn ${
                          payButtonSelected === "pay_now" && isChecked
                            ? "cardetails__price-btn--active"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePaymentOptionChange("pay_now");
                        }}
                      >
                        <span className="cardetails__price-amount">{fmt(item?.pay_now)}<small className="cardetails__price-eur">{formatAlt(item?.pay_now)}</small></span>
                        <span className="cardetails__price-label">/{t("Pay Now")}</span>
                      </div>
                      )}
                      {!isVirtualLocation && (
                        <div
                          className={`cardetails__price-btn ${
                            payButtonSelected === "pay_later" && isChecked
                              ? "cardetails__price-btn--active"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePaymentOptionChange("pay_later");
                          }}
                        >
                          <span className="cardetails__price-amount">{fmt(item?.pay_later, { decimals: 2 })}<small className="cardetails__price-eur">{formatAlt(item?.pay_later, { decimals: 2 })}</small></span>
                          <span className="cardetails__price-label">/{t("Pay Later")}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {payNowEnabled && (
                      <div
                        className={`cardetails__price-btn ${
                          payButtonSelected === "pay_monthly_now" && isChecked
                            ? "cardetails__price-btn--active"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePaymentOptionChange("pay_monthly_now");
                        }}
                      >
                        <span className="cardetails__price-amount">{fmt(item?.pay_now)}<small className="cardetails__price-eur">{formatAlt(item?.pay_now)}</small></span>
                        <span className="cardetails__price-label">/{t("Pay Now")}</span>
                      </div>
                      )}
                      {!isVirtualLocation && (
                        <div
                          className={`cardetails__price-btn ${
                            payButtonSelected === "pay_monthly_later" && isChecked
                              ? "cardetails__price-btn--active"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePaymentOptionChange("pay_monthly_later");
                          }}
                        >
                          <span className="cardetails__price-amount">{fmt(item?.pay_later, { decimals: 2 })}<small className="cardetails__price-eur">{formatAlt(item?.pay_later, { decimals: 2 })}</small></span>
                          <span className="cardetails__price-label">/{t("Pay Later")}</span>
                        </div>
                      )}
                    </>
                  ))}
                {booking_number &&
                  (requestBody_pickup?.booking_type === "daily" ? (
                    editUserBookingObject?.payment_type === "now" ? (
                      <div
                        className={`cardetails__price-btn ${
                          payButtonSelected === "pay_now" && isChecked
                            ? "cardetails__price-btn--active"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePaymentOptionChange("pay_now");
                        }}
                      >
                        <span className="cardetails__price-amount">{fmt(item?.pay_now)}<small className="cardetails__price-eur">{formatAlt(item?.pay_now)}</small></span>
                        <span className="cardetails__price-label">/ {t("Pay Now")}</span>
                      </div>
                    ) : (
                      editUserBookingObject?.payment_type === "later" && (
                        <div
                          className={`cardetails__price-btn ${
                            payButtonSelected === "pay_later" && isChecked
                              ? "cardetails__price-btn--active"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePaymentOptionChange("pay_later");
                          }}
                        >
                          <span className="cardetails__price-amount">{fmt(item?.pay_later, { decimals: 2 })}<small className="cardetails__price-eur">{formatAlt(item?.pay_later, { decimals: 2 })}</small></span>
                          <span className="cardetails__price-label">/ {t("Pay Later")}</span>
                        </div>
                      )
                    )
                  ) : editUserBookingObject?.payment_type === "now" ? (
                    <div
                      className={`cardetails__price-btn ${
                        payButtonSelected === "pay_monthly_now" && isChecked
                          ? "cardetails__price-btn--active"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePaymentOptionChange("pay_monthly_now");
                      }}
                    >
                      <span className="cardetails__price-amount">{fmt(item?.pay_now)}<small className="cardetails__price-eur">{formatAlt(item?.pay_now)}</small></span>
                      <span className="cardetails__price-label">/{t("Pay Now")}</span>
                    </div>
                  ) : (
                    <div
                      className={`cardetails__price-btn ${
                        payButtonSelected === "pay_monthly_later" && isChecked
                          ? "cardetails__price-btn--active"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePaymentOptionChange("pay_monthly_later");
                      }}
                    >
                      <span className="cardetails__price-amount">{fmt(item?.pay_later, { decimals: 2 })}<small className="cardetails__price-eur">{formatAlt(item?.pay_later, { decimals: 2 })}</small></span>
                      <span className="cardetails__price-label">/{t("Pay Later")}</span>
                    </div>
                  ))}
              </div>

              {/* CTA — always visible. It used to appear only after a payment
                  tile had been clicked, which left every card with no call to
                  action at all whenever a single payment option was on offer. */}
              <button
                type="button"
                className="cardetails__cta-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  proceed();
                }}
              >
                {isMonthly ? t("View More Options") : t("Select Car")}
              </button>
              {needsChoice && (
                <p className="cardetails__choice-hint" role="alert">
                  {t("Please choose Pay Now or Pay Later")}
                </p>
              )}
            </div>
            <img className="card__arrow" src={arrowIcon} alt="" />
          </div>
        </label>
      </div>

      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header
          closeButton
          className="car__details__section car__details__header"
        >
          <Modal.Title className="fw-semibold">Car Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CarDetails car_id_modal={car_id} fromModal={true} />
        </Modal.Body>
        {/* <Modal.Footer>
                  <Button onClick={()=>setModalShow(false)}>Close</Button>
                </Modal.Footer> */}
      </Modal>
    </>
  );
}

export default CarsAndDetails;
