import React, { useEffect, useState } from "react";
import { Row, Col, Nav, Form, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./LoginModal.css";
import visa_card from "../../assets/all-images/visa_card.png";
import dubai_card from "../../assets/all-images/dubai_card.jpg";
import master_card from "../../assets/all-images/master_card.png";
import configWeb from "../../config.js/configWeb";
import { simplePostCall, simplePostCallAuth } from "../../config.js/SetUp";
import { notifyError } from "../../SharedComponent/notify";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

function CardDetailsModal({
  cardModalShow,
  setCardModalShow,
  confirmBookingData,
  confirmBookingPayment,
  closeButton,
  monthlyInstallmentArray,
  total,
  enabledExtras,
 
}) {
const { t } = useTranslation();
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );
  const selectedCar = useSelector((state) => state.selectedCar.selectedCar);
  const [validated, setValidated] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentApiFlag, setPaymentApiFlag] = useState(false);
  const [bookingPaymentData, setBookingPaymentData] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [payment_flag, set_payment_flag] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // validatePayment();
    // const form = event.currentTarget;
    // if (form.checkValidity() === false) {
    //   event.stopPropagation();
    // }

    const newErrors = {};
    // if (!cardNumber) newErrors.cardNumber = "Card number is required";
    // if (!cardName) newErrors.cardName = "Name on the card is required";
    // if (!expiryMonth) newErrors.expiryMonth = "Expiry month is required";
    // if (!expiryYear) newErrors.expiryYear = "Expiry year is required";
    // if (!cvv) newErrors.cvv = "CVV is required";

    // setErrors(newErrors);

    if (Object?.keys(newErrors).length === 0) {
     
      if (validatePayment()) {
        bookingPayment();
      }
    }
  };

  const bookingPayment = () => {
    const body = {
      booking_id: confirmBookingData?.id,
      payment_type: confirmBookingPayment,
      card_holder_name: cardName,
      card_number: cardNumber,
      expiry_date: `${expiryYear}${expiryMonth}`,
      card_security_code: cvv,
    };

    setLoadingPayment(true);
    simplePostCallAuth(configWeb.POST_BOOKING_PAYMENT, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          setBookingPaymentData(res);
          setPaymentApiFlag(true);
          // ReactGA.event({
          //   category: 'Booking',
          //   action: 'payment_attempted',
          //   label: 'user has attempted the payment',
          // });
        
        }

        if (res?.status === "success") {
          //  notifySuccess(res?.message)

          if(selectedCar?.payment_method !== "pay_later"){
            window.gtag?.("event", "add_payment_info", {
              currency: "MAD",
              value:
                requestBody_pickup?.booking_type === "daily"
                  ?  parseFloat(total || 0)
                  : parseFloat(monthlyInstallmentArray?.installments?.[0]?.total_amount || 0),

              coupon: selectedCar?.coupon,
              payment_type:
                requestBody_pickup?.booking_type === "daily"
                  ? selectedCar?.payment_method === "pay_now"
                    ? "Credit Card"
                    : "Cash On Delivery"
                  : selectedCar?.payment_method === "pay_monthly_now"
                  ? "Credit Card"
                  : "Cash On Delivery",
              items: [
                {
                  item_id: selectedCar?.id,
                  item_name: selectedCar?.car_name,
                  affiliation: "Route Facile",
                  coupon: selectedCar?.coupon,
                  discount: selectedCar?.discount,
                  index: 0,
                  item_brand: selectedCar?.brand,
                  item_category: selectedCar?.category,
                  // item_category2: "Adult",
                  // item_category3: "Shirts",
                  // item_category4: "Crew",
                  // item_category5: "Short sleeve",
                  item_list_id: `${requestBody_pickup?.pickup_location_id ? requestBody_pickup?.pickup_location_id  : `delivery_${requestBody_pickup?.pickup_city_id}` } + ${requestBody_dropoff?.dropoff_location_id ? requestBody_dropoff?.dropoff_location_id : `collection_${requestBody_dropoff?.dropoff_city_id}`}`,
                  // item_list_name: "Related Products",
                  item_variant: selectedCar?.payment_method,
                  location_id: selectedCar?.city_id,
                  price:
                    requestBody_pickup?.booking_type === "daily"
                      ? parseFloat(total || 0)
                      : parseFloat(monthlyInstallmentArray?.installments?.[0]
                          ?.total_amount || 0),
                  quantity: 1,
                },
                ...enabledExtras,
              ],
            });

            window.gtag?.("event", "begin_checkout", {
              currency: "MAD",
              value:
                requestBody_pickup?.booking_type === "daily"
                  ? parseFloat(total || 0)
                  : parseFloat(monthlyInstallmentArray?.installments?.[0]?.total_amount || 0),

              coupon: selectedCar?.coupon,
              items: [
                {
                  item_id: selectedCar?.id,
                  item_name: selectedCar?.car_name,
                  affiliation: "Route Facile",
                  coupon: selectedCar?.coupon,
                  discount: selectedCar?.discount,
                  index: 0,
                  item_brand: selectedCar?.brand,
                  item_category: selectedCar?.category,
                  // item_category2: "Adult",
                  // item_category3: "Shirts",
                  // item_category4: "Crew",
                  // item_category5: "Short sleeve",
                  item_list_id: `${requestBody_pickup?.pickup_location_id ? requestBody_pickup?.pickup_location_id  : `delivery_${requestBody_pickup?.pickup_city_id}` } + ${requestBody_dropoff?.dropoff_location_id ? requestBody_dropoff?.dropoff_location_id : `collection_${requestBody_dropoff?.dropoff_city_id}`}`,
                  // item_list_name: "Related Products",
                  item_variant: selectedCar?.payment_method,
                  location_id: selectedCar?.city_id,
                  price:
                    requestBody_pickup?.booking_type === "daily"
                      ? parseFloat(total || 0)
                      : parseFloat(monthlyInstallmentArray?.installments?.[0]
                          ?.total_amount || 0),
                  quantity: 1,
                },
                ...enabledExtras,
              ],
            });
          }

        }
        if (res?.error) {
          notifyError(res?.message[0]);
        }
      })
      .catch((error) => {
        console.log("validate pickuplocation api failed-->", error);
        // notifyError('Something went wwrong, please try again letter')
      })
      .finally(() => {
        setLoadingPayment(false);
      });
  };

  useEffect( () => {
    if (bookingPaymentData && paymentApiFlag) {
 
      gatewayRedirectionRequest();
    }

  }, [bookingPaymentData]);

  const gatewayRedirectionRequest = () => {
    const form = document.createElement("form");
    form.method = "post";
    form.action = bookingPaymentData.gateway_url;
    form.id = "gatewayForm";
    form.name = "gatewayForm";

    for (const [key, value] of Object.entries(
      bookingPaymentData?.request_data
    )) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  ///////////////////////////////////////////////Validation Method///////////////////////////////////////////////////////
  const bins = {
    mada: "446404|440795|440647|421141|474491|588845|968208|457997|457865|468540|468541|468542|468543|417633|446393|636120|968201|410621|409201|403024|458456|462220|968205|455708|484783|588848|455036|968203|486094|486095|486096|504300|440533|489318|489319|445564|968211|410685|406996|432328|428671|428672|428673|968206|446672|543357|434107|407197|407395|42689700|412565|431361|604906|521076|588850|968202|529415|535825|543085|524130|554180|549760|968209|524514|529741|537767|535989|536023|513213|442463|520058|558563|605141|968204|422817|422818|422819|410834|428331|483010|483011|483012|589206|968207|406136|419593|439954|407520|530060|531196|420132|242030|22402030",
    meeza:
      "507803[0-6][0-9]|507808[3-9][0-9]|507809[0-9][0-9]|507810[0-2][0-9]",
  };

  const apsPaymentErrors = {
    invalid_card: "Invalid Card",
    invalid_card_length: "Invalid Card Length",
    card_empty: "Card Number Empty",
    invalid_card_holder_name: "Invalid Card Holder Name",
    invalid_card_cvv: "Invalid Card CVV",
    invalid_expiry_date: "Invalid Expiry Date",
    invalid_expiry_year: "Invalid Expiry Year. Expected as MMYY",
    invalid_expiry_month: "Invalid Expiry Month. Expected as MMYY",
  };

  const APSValidation = {
    validateCard: function (card_number) {
      let card_type = "";
      let card_validity = true;
      let message = "";
      let card_length = 0;
      if (card_number) {
        card_number = card_number.replace(/ /g, "").replace(/-/g, "");
        let visa_regex = new RegExp("^4[0-9]{0,15}$");
        let mastercard_regex = new RegExp(
          "^5[0-5][0-9]{0,16}$|^2[2-7][0-9]{0,16}$"
        );
        let amex_regex = new RegExp("^3$|^3[47][0-9]{0,13}$");
        let mada_regex = new RegExp("^" + bins.mada);
        let meeza_regex = new RegExp(bins.meeza, "gm");

        if (card_number.match(mada_regex)) {
          card_type = "mada";
          card_length = 16;
        } else if (card_number.match(meeza_regex)) {
          card_type = "meeza";
          card_length = 19;
        } else if (card_number.match(visa_regex)) {
          card_type = "visa";
          card_length = 16;
        } else if (card_number.match(mastercard_regex)) {
          card_type = "mastercard";
          card_length = 16;
        } else if (card_number.match(amex_regex)) {
          card_type = "amex";
          card_length = 15;
        } else {
          card_validity = false;
          message = apsPaymentErrors.invalid_card;
        }

        if (card_number.length < 15) {
          card_validity = false;
          message = apsPaymentErrors.invalid_card_length;
        } else {
          let cardValidByAlgorithm =
            APSValidation.validateCardNumber(card_number);
          if (!cardValidByAlgorithm) {
            card_validity = false;
            message = apsPaymentErrors.invalid_card;
          }
        }
      } else {
        message = apsPaymentErrors.card_empty;
        card_validity = false;
      }
      return {
        card_type,
        validity: card_validity,
        msg: message,
        card_length,
      };
    },
    validateCardNumberByAlgorithm: function (card_number) {
      let checksum = 0;
      let j = 1;
      for (let i = card_number.length - 1; i >= 0; i--) {
        let calc = 0;
        calc = Number(card_number.charAt(i)) * j;
        if (calc > 9) {
          checksum = checksum + 1;
          calc = calc - 10;
        }
        checksum = checksum + calc;
        j = j === 1 ? 2 : 1;
      }
      return checksum % 10 === 0;
    },
    validateCardNumber: function (card_number) {
      const regex = new RegExp("^[0-9]{13,19}$");
      if (!regex.test(card_number)) {
        return false;
      }
      return APSValidation.validateCardNumberByAlgorithm(card_number);
    },
    validateHolderName: function (card_holder_name) {
      let validity = true;
      let message = "";
      card_holder_name = card_holder_name.trim();
      if (card_holder_name.length > 51 || card_holder_name.length === 0) {
        validity = false;
        message = apsPaymentErrors.invalid_card_holder_name;
      }
      const regex = new RegExp("^[a-zA-Z- '.]+$");
      if (!regex.test(card_holder_name)) {
        validity = false;
        message = apsPaymentErrors.invalid_card_holder_name;
      }
      return {
        validity,
        msg: message,
      };
    },
    validateCVV: function (card_cvv, card_type) {
      let validity = false;
      let message = apsPaymentErrors.invalid_card_cvv;
      // if (card_cvv.length > 0) {
      //   card_cvv = card_cvv.trim();
      //   if (!card_type.length || card_type.length === 0) {
      //     if (card_cvv.length === 3 && card_cvv !== "000") {
      //       validity = true;
      //       message = "";
      //     } else if (
      //       card_cvv.length === 4 &&
      //       card_type === "amex" &&
      //       card_cvv !== "0000"
      //     ) {
      //       validity = true;
      //       message = "";
      //     }
      //   }
      // }

      if (card_cvv.length > 0) {
        card_cvv = card_cvv.trim();

        // Handle specific card types explicitly
        if (card_type === "amex") {
          if (card_cvv.length === 4 && card_cvv !== "0000") {
            validity = true;
            message = "";
          }
        } else {
          // This handles Visa and other types
          if (card_cvv.length === 3 && card_cvv !== "000") {
            validity = true;
            message = "";
          }
        }
      }
      return {
        validity,
        msg: message,
      };
    },
    validateCardExpiry: function (card_expiry_month, card_expiry_year) {
      let validity = true;
      let message = "";
      if (card_expiry_month === "" || !card_expiry_month) {
        validity = false;
        message = apsPaymentErrors.invalid_expiry_month;
      } else if (card_expiry_year === "" || !card_expiry_year) {
        validity = false;
        message = apsPaymentErrors.invalid_expiry_year;
      } else if (
        parseInt(card_expiry_month) <= 0 ||
        parseInt(card_expiry_month) > 12 ||  (card_expiry_month.length === 1 && parseInt(card_expiry_month) < 10) 
      ) {
        validity = false;
        message = apsPaymentErrors.invalid_expiry_month;
      } else {
        let cur_date, exp_date;
        card_expiry_month = ("0" + parseInt(card_expiry_month - 1)).slice(-2);
        cur_date = new Date();
        exp_date = new Date(
          parseInt("20" + card_expiry_year),
          card_expiry_month,
          30
        );
        if (exp_date.getTime() < cur_date.getTime()) {
          message = apsPaymentErrors.invalid_expiry_date;
          validity = false;
        }
      }
      return {
        validity,
        msg: message,
      };
    },
  };

  const validatePayment = () => {
    let status = true;
    let message = {
      cardMessage: "",
      holderNameMessage: "",
      cvvMessage: "",
      expiryMessage: "",
    };

    const validateCard = APSValidation.validateCard(cardNumber);
    const validateHolderName = APSValidation.validateHolderName(cardName);
    const validateCardCVV = APSValidation.validateCVV(
      cvv,
      validateCard.card_type
    );
    const validateExpiry = APSValidation.validateCardExpiry(
      expiryMonth,
      expiryYear
    );

    if (!validateCard.validity) {
      message.cardMessage = validateCard.msg;
      status = false;
    }
    if (!validateHolderName.validity) {
      message.holderNameMessage = validateHolderName.msg;
      status = false;
    }
    if (!validateCardCVV.validity) {
      message.cvvMessage = validateCardCVV.msg;
      status = false;
    }
    if (!validateExpiry.validity) {
      message.expiryMessage = validateExpiry.msg;
      status = false;
    }

    // setErrors({ ...errors, payment: message });
    setErrorMessages(message);
    return status;
  };

  return (
    <>
      <Modal
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={cardModalShow}
        className="payment-modal-enhanced"
        onHide={()=>setCardModalShow(false)}
      >
        <div className="payment-modal-header">
          <div className="payment-modal-header-content">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span>{t("Payment Details")}</span>
          </div>
          <button className="payment-modal-close" onClick={() => setCardModalShow(false)} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <Modal.Body className="payment-modal-body">
          <div className="payment-cards-strip">
            <span className="payment-cards-label">{t("We Accept")}</span>
            <div className="payment-cards-icons">
              <img src={visa_card} alt="Visa" style={{ height: '22px', maxWidth: '50px', objectFit: 'contain' }} />
              <img src={dubai_card} alt="Dubai First" style={{ height: '22px', maxWidth: '50px', objectFit: 'contain' }} />
              <img src={master_card} alt="MasterCard" style={{ height: '22px', maxWidth: '50px', objectFit: 'contain' }} />
            </div>
          </div>

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="formCardNumber" className="payment-field">
              <Form.Label>{t("Card Number")}</Form.Label>
              <Form.Control
                type="text"
                placeholder="0123 XXXX XXXX XXXX"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                isInvalid={!!errorMessages.cardMessage}
                isValid={false}
                className="payment-input"
              />
              <Form.Control.Feedback type="invalid">
                {t(errorMessages.cardMessage)}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formCardName" className="payment-field">
              <Form.Label>{t("Name on the Card")}*</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                isInvalid={!!errorMessages?.holderNameMessage}
                isValid={false}
                className="payment-input"
              />
              <Form.Control.Feedback type="invalid">
                {t(errorMessages?.holderNameMessage)}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="payment-row-fields">
              <Form.Group controlId="formExpiryDate" className="payment-field payment-field-expiry">
                <Form.Label>{t("Expiry Date")}*</Form.Label>
                <div className="payment-expiry-inputs">
                  <Form.Control
                    type="text"
                    placeholder="MM"
                    value={expiryMonth}
                    maxLength={2}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    isInvalid={!!errorMessages.expiryMessage}
                    isValid={false}
                    className="payment-input"
                  />
                  <span className="payment-expiry-slash">/</span>
                  <Form.Control
                    type="text"
                    placeholder="YY"
                    value={expiryYear}
                    maxLength={2}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    isInvalid={!!errorMessages.expiryMessage}
                    isValid={false}
                    className="payment-input"
                  />
                </div>
                {errorMessages?.expiryMessage && (
                  <span className="text-danger" style={{ fontSize: ".8em" }}>
                    {t(errorMessages?.expiryMessage)}
                  </span>
                )}
              </Form.Group>

              <Form.Group controlId="formSecurityCode" className="payment-field payment-field-cvv">
                <Form.Label>{t("CVV")}*</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="***"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  isInvalid={!!errorMessages?.cvvMessage}
                  isValid={false}
                  className="payment-input"
                />
                <Form.Control.Feedback type="invalid">
                  {t(errorMessages?.cvvMessage)}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <Button
              type="submit"
              className="payment-submit-btn"
              disabled={loadingPayment || paymentApiFlag}
            >
              {loadingPayment ? <Spinner size="sm" /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  {t("Pay Now")}
                </>
              )}
            </Button>
          </Form>

          <div className="payment-secure-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7a8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>{t("Your payment is secured with 256-bit SSL encryption")}</span>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CardDetailsModal;
