import React, { useEffect, useState } from "react";
import "./PaymentSuccess.css"; // Import the CSS file for styles
import { Button, Col, Form, Row } from "react-bootstrap";
import MetaHelmet from "../Helmet/MetaHelmet";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

// import { persistor } from "../../store/store";
import { persistor } from "../../store/store";
import { resetState } from "../../reducers/Slices/resetSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  setRequestBody_dropoff,
  setRequestBody_pickup,
  setSelectedPickupLocation,
} from "../../reducers";
import { setStepperPage } from "../../reducers/Slices/stepperSlice";
import { setSelectedDropoffLocation } from "../../reducers/Slices/selectedDropoffLocationSlice";
import { setInputValue } from "../../reducers/Slices/inputValueSlice";
import { setInputValueDropoff } from "../../reducers/Slices/inputValueDropoffSlice";
import { setCarArray } from "../../reducers/Slices/carArraySlice";
import { setCarExtraArray } from "../../reducers/Slices/carExtraArray";
import { setFilterCarArray } from "../../reducers/Slices/filterCarArraySlice";
import { setSelectedCar } from "../../reducers/Slices/selectedCarSlice";
import { resetAddProtection } from "../../reducers/Slices/addProtectionSlice";
import { setSavedCar } from "../../reducers/Slices/savedCarSlice";
import configWeb from "../../config.js/configWeb";
import { multipartPostCall, simpleGetCallAuth, getApiLang, hasValidSession } from "../../config.js/SetUp";
import { trackPurchase } from "../../SharedComponent/tracking";
import car_booked from "../../assets/all-images/car_booked.png";
import { Spinner } from "reactstrap";
import { pixelPurchaseEvent } from "../../actions/facebookPixelEvents";
import { setSelectedDeliveryCity } from "../../reducers/Slices/selectedDeliveryCitySlice";
import { setIsValidAddressCollection } from "../../reducers/Slices/isValidAddressCollection";
import { setIsValidAddressDelivery } from "../../reducers/Slices/isValidAddressDeliverySlice";
import { setErrorAddressCollection } from "../../reducers/Slices/errorAddressCollection";
import { setErrorAddressDelivery } from "../../reducers/Slices/errorAddressDelivery";
import { setIsLoginFromRegister } from "../../reducers/Slices/isLoginFromRegisterSlice";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import { dateLocaleFor } from "../../SharedComponent/reusableFunctions";
import FileUpload from "../../SharedComponent/ImageUploadPopup/ImageUploadPopup";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchparams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Combine pathname and search so that query parameters are preserved.
  const currentUrl = location?.pathname + location?.search; // e.g. "/PaymentSuccess?id=882"

  const booking_id = searchparams.get("id");
  const isLoggedIn = hasValidSession();
  const language = useSelector((state) => state.language.language);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [selectedCarTemp, setSelectedCarTemp] = useState(null);
  const [requestBody_pickupTemp, set_requestBody_pickupTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseEventFlag, setPurchaseEventFlag] = useState(false);

  const selectedCar = useSelector((state) => state.selectedCar.selectedCar);
  const isLoginFromRegister = useSelector(
    (state) => state.isLoginFromRegister.isLoginFromRegister
  );
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );

  const handleClearStorage = () => {
    persistor.purge().then(() => {
      dispatch(setRequestBody_dropoff(null));
      dispatch(setRequestBody_pickup(null));
      dispatch(setSelectedPickupLocation(null));
      dispatch(setStepperPage(null));
      dispatch(setSelectedDropoffLocation(null));
      dispatch(setInputValue(""));
      dispatch(setInputValueDropoff(""));
      dispatch(setCarArray(null));
      dispatch(setCarExtraArray(null));
      dispatch(setFilterCarArray(null));
      dispatch(setSelectedCar(null));
      dispatch(resetAddProtection());
      dispatch(setSavedCar(null));
      dispatch(setIsValidAddressCollection(null));
      dispatch(setIsValidAddressDelivery(null));
      dispatch(setErrorAddressCollection(null));
      dispatch(setErrorAddressDelivery(null));

      // Clear EDC promo data after successful booking
      localStorage.removeItem('edc_promo_code');
      localStorage.removeItem('edc_verification');
      localStorage.removeItem('edc_promo_confirmed');
      sessionStorage.removeItem('edc_just_verified');

      // Optionally dispatch any actions to reset your Redux state
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(setSelectedPickupLocation(null));
    dispatch(setSelectedDeliveryCity(null));

    return () => {};
  }, []);

  useEffect(() => {
    const selectedCarTemp = selectedCar;
    setSelectedCarTemp(selectedCarTemp);
    const requestBody_pickupTemp = requestBody_pickup;
    set_requestBody_pickupTemp(requestBody_pickupTemp);

    return () => {
      // Don't clear storage when unmounting to preserve booking data
      // handleClearStorage();
    };
  }, []);

  // useEffect(()=>{
  //   if(selectedCarTemp && requestBody_pickupTemp){
  //     handleClearStorage();
  //   }
  // },[selectedCarTemp,requestBody_pickupTemp])

  // Analytics is optional — no measurement ID is configured, so window.gtag
  // does not exist. Every call here is optional-chained: an unguarded one
  // threw inside this effect and took the whole confirmation page down with
  // it, leaving a customer who had just booked staring at a blank screen.
  useEffect(() => {
    if (bookingDetails && purchaseEventFlag) {
      const formattedExtras = bookingDetails?.car_extras?.map((extra) => ({
        item_id: `extra_${extra.type}`,
        item_name: extra.type,
        price: extra.rate, // Use the rate as the price
        quantity: extra.quantity,
      }));

      const eventPayload = {
        transaction_id: bookingDetails?.booking_log_number,
        value: parseFloat(bookingDetails?.total_amount || 0).toFixed(2),
        tax: parseFloat(bookingDetails?.vat_amount || 0).toFixed(2),
        currency: "MAD",
        coupon: bookingDetails?.coupon_code,
        items: [
          {
            item_id: bookingDetails?.id,
            item_name: bookingDetails?.car?.name,
            affiliation: "Route Facile",
            coupon: bookingDetails?.coupon_code,
            discount: bookingDetails?.discount_total,
            index: 0,
            item_brand: selectedCarTemp?.brand,
            item_list_id: `${bookingDetails?.pickup_location_id
                ? bookingDetails?.pickup_location_id
                : `delivery_${bookingDetails?.pickup_city_id}`
              } + ${bookingDetails?.dropoff_location_id
                ? bookingDetails?.dropoff_location_id
                : `collection_${bookingDetails?.dropoff_city_id}`
              }`,
            item_variant: bookingDetails?.payment_type,
            location_id:
              bookingDetails?.pickup_location_id ||
              bookingDetails?.pickup_city_id,
            price:
              requestBody_pickup?.booking_type === "monthly"
                ? parseFloat(selectedCar?.car_rate_total || 0)
                : selectedCar?.payment_method === "pay_now"
                  ? parseFloat(selectedCar?.pay_now || 0)
                  : parseFloat(selectedCar?.pay_later || 0),
            quantity: 1,
          },
          ...formattedExtras,
        ],
      }

      // The conversion, and the only purchase event on the page.
      //
      // This page is reached only after the API stored the booking and returned
      // a real booking number, so it cannot fire for an abandoned or failed
      // attempt. trackPurchase de-duplicates on that number, so a refresh does
      // not send it again.
      //
      // The gtag("purchase") call that used to sit here is gone: GA4 now loads
      // through GTM, which means window.gtag exists again and that call would
      // have put a second purchase into GA4 for every booking.
      trackPurchase({
        booking_number: bookingDetails?.booking_number,
        final_total: bookingDetails?.total_amount,
        rental_days: bookingDetails?.booking_days,
        pickup_location:
          bookingDetails?.pickup_location?.name_en || bookingDetails?.pickup_city?.name_en || "",
        dropoff_location:
          bookingDetails?.dropoff_location?.name_en || bookingDetails?.dropoff_city?.name_en || "",
        language,
        car: {
          id: bookingDetails?.car?.id ?? bookingDetails?.car_id,
          name: bookingDetails?.car?.name_en || bookingDetails?.car?.name || "",
        },
      });


    }

    if (bookingDetails && purchaseEventFlag) {
      const formattedExtras = bookingDetails?.car_extras?.map((extra) => ({
        id: `extra_${extra.type}`,
        // item_name: extra.type,
        // price: extra.rate, // Use the rate as the price
        quantity: extra.quantity,
      }));

      const contentType = "Product";
      const contents = [
        {
          id: bookingDetails?.id,
          quantity: 1,
        },
        ...formattedExtras,
      ];
      const value = bookingDetails?.total_amount;
      const currency = "MAD";

      pixelPurchaseEvent(contentType, contents, value, currency);
    }
  }, [bookingDetails]);
  // Advolve Integration
  useEffect(() => {
    if(bookingDetails && bookingDetails.type == 'monthly'){
      const script = document.createElement("script");

      script.src = "https://conversions.smartyads.com/conversion?type=global&clid=[CLICK_ID]&uid=14278";
      script.async = true;
  
      document.body.appendChild(script);
    }
  }, [bookingDetails]);

  const getBookingDetails = () => {
    // const url1 = `${configWeb.GET_USER_BOOKING_DETAILS(user_id)}?language=${language}&page_number=${pageNumber}&page_size=${pageSize}`;

    const url = `${configWeb.GET_BOOKING_DETAILS(
      booking_id
    )}?lang=${getApiLang(language)}&page=1&page_size=10`;
    // setLoading(true);
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setBookingDetails(res?.data);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {
        setLoading(false);
        setPurchaseEventFlag(true);
      });
  };

  // A guest has no token, so the authenticated fetch above would fail and leave
  // the screen showing a confirmed booking with every field blank. Their detail
  // arrives in router state from the page that made the booking.
  const guestBookingDetail = location?.state?.guestBookingDetail;

  useEffect(() => {
    if (guestBookingDetail) {
      setBookingDetails(guestBookingDetail);
      setLoading(false);
      setPurchaseEventFlag(true);
      return;
    }
    if (booking_id) {
      getBookingDetails();
    }
    // language: car name / location come back localised from the API.
  }, [booking_id, guestBookingDetail, language]);

  function formatDate(dateString) {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      // Africa/Casablanca, not Asia/Dubai — a leftover from the UAE original
      // that showed every confirmed pick-up and drop-off three hours late.
      timeZone: "Africa/Casablanca",
    };

    return d.toLocaleString(dateLocaleFor(language), options)?.replace(",", "");
  }

  // Removed forced navigation to home - allow users to go back naturally

  return (
    <div className="parent ps-v2">
      <MetaHelmet title="Payment Successful" description="" noindex={true} />
      <div className="printer-top"></div>
      <div className="paper-container">
        <div className="printer-bottom"></div>
        <div className="paper">
          <div className="main-contents">
            {/* Success hero */}
            <div className="ps-hero">
              <div className="ps-hero-glow" aria-hidden="true" />
              <div className="ps-check" aria-hidden="true">
                <svg viewBox="0 0 52 52" width="56" height="56">
                  <circle className="ps-check-circle" cx="26" cy="26" r="24" fill="none" />
                  <path className="ps-check-mark" fill="none" d="M14 27 l8 8 l16 -18" />
                </svg>
              </div>
              <div className="ps-confetti" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className={`ps-confetti-bit ps-c-${i + 1}`} />
                ))}
              </div>
            </div>

            <div className="success-title">{t("Booking Completed")}</div>
            <div className="success-description">
              {t("Your booking is confirmed! Thank you for choosing Route Facile.")}
            </div>
            {/* The upload endpoint is authenticated, so for a guest this form
                could only ever fail. Guests bring their documents to the
                counter instead; showing them a dead control would be worse
                than showing them nothing. */}
            {isLoggedIn ? (
              <FileUpload pickup_type={bookingDetails?.pickup_type} />
            ) : (
              <p className="ps-guest-docs-note">
                {t("Please bring your driving licence and ID with you at pick-up.")}
              </p>
            )}
            {loading ? (
              <div className="h-100 w-100 text-center ">
                <Spinner />{" "}
              </div>
            ) : (
              <div className="order-details">
                <div className="ps-booking-pill">
                  <span className="ps-booking-pill-label">{t("Your Booking Number is")}</span>
                  <strong className="ps-booking-pill-value">{bookingDetails?.booking_number}</strong>
                </div>

                <div className="col-lg-12 col-12 position-relative ">
                  <div className="ps-reservation-card">
                    <div className="row reserved-row g-0">
                      <div className="col-lg-5 col-md-5 col-12 ps-car-image-wrap rf-car-stage">
                        <img
                          src={bookingDetails?.car?.image || car_booked}
                          onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + car_booked) {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = car_booked;
                            }
                          }}
                          className="img-fluid ps-car-image"
                          alt={bookingDetails?.car?.name || "Car"}
                        />
                      </div>
                      <div className="col-lg-7 col-md-7 col-12 ps-card-body text-under-small-screen">
                        {bookingDetails?.car?.name && (
                          <div className="ps-car-name">{bookingDetails?.car?.name}</div>
                        )}
                        <div className="ps-info-grid">
                          <div className="ps-info-row">
                            <span className="ps-info-label">{t("Reservation Number")}</span>
                            <span className="ps-info-value">{bookingDetails?.booking_number}</span>
                          </div>
                          <div className="ps-info-row">
                            <span className="ps-info-label">{t("Pick Up Location")}</span>
                            <span className="ps-info-value">
                              {bookingDetails?.pickup_location?.name || bookingDetails?.pickup_address || "—"}
                            </span>
                          </div>
                          <div className="ps-info-row">
                            <span className="ps-info-label">{t("Pick Up Date")}</span>
                            <span className="ps-info-value">{formatDate(bookingDetails?.pickup_date_time)}</span>
                          </div>
                          <div className="ps-info-divider" />
                          <div className="ps-info-row">
                            <span className="ps-info-label">{t("Drop Off Location")}</span>
                            <span className="ps-info-value">
                              {bookingDetails?.dropoff_location?.name || bookingDetails?.dropoff_address || "—"}
                            </span>
                          </div>
                          <div className="ps-info-row">
                            <span className="ps-info-label">{t("Drop Off Date")}</span>
                            <span className="ps-info-value">{formatDate(bookingDetails?.dropoff_date_time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ps-actions">
                  {!isLoginFromRegister && (
                    <Link to={`/${language}/myaccount`} state={{ tab_type: "bookings" }}>
                      <Button className="ps-btn ps-btn-primary">
                        {t("Go to booking details")}
                      </Button>
                    </Link>
                  )}
                  <Link to={`/`}>
                    <Button className="ps-btn ps-btn-ghost">
                      {t("Go to home")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="jagged-edge"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
