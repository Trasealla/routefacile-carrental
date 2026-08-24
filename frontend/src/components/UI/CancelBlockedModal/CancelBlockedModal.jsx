import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./CancelBlockedModal.css";

/**
 * Modal shown when user has reached the daily cancellation limit.
 * Offers Modify Booking and Pay Now as alternatives.
 *
 * Props:
 *   show          – boolean to control visibility
 *   onHide        – callback to close the modal
 *   onModify      – callback when "Modify Booking" is clicked
 *   onPayNow      – callback when "Pay Now" is clicked
 *   bookingNumber – optional, for display context
 */
const CancelBlockedModal = ({ show, onHide, onModify, onPayNow, bookingNumber }) => {
  const { t } = useTranslation();

  // Fire analytics event when modal becomes visible
  useEffect(() => {
    if (show) {
      window.gtag?.("event", "cancel_blocked_viewed", {
        booking_number: bookingNumber || "",
      });
    }
  }, [show, bookingNumber]);

  const handleModify = () => {
    window.gtag?.("event", "cancel_blocked_modify_clicked", {
      booking_number: bookingNumber || "",
    });
    onModify?.();
  };

  const handlePayNow = () => {
    window.gtag?.("event", "cancel_blocked_pay_now_clicked", {
      booking_number: bookingNumber || "",
    });
    onPayNow?.();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton dir="ltr">
        <Modal.Title>{t("Cancellation Limit Reached")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="cancel-blocked-body">
        <div className="cancel-blocked-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc3545"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="cancel-blocked-message">
          {t("You have reached the daily cancellation limit.")}
        </p>
        <p className="cancel-blocked-note">
          {t("Limit resets at 12:00 AM UAE time.")}
        </p>
      </Modal.Body>
      <Modal.Footer className="cancel-blocked-footer">
        <Button
          variant="outline-secondary"
          className="defButton cancel-blocked-btn"
          onClick={handleModify}
        >
          {t("Modify Booking")}
        </Button>
        <Button
          variant="secondary"
          className="defButton cancel-blocked-btn"
          onClick={handlePayNow}
        >
          {t("Pay Now")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancelBlockedModal;
