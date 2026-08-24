import React from "react";
import "./couponApplied.css"
const CouponSuccess = ({ couponCode, message }) => {
  return (
    <div className="coupon-success">
      <div className="icon-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon-checkmark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div className="coupon-message">
        <span>
          {message} <strong>{couponCode}</strong> applied successfully!
        </span>
      </div>
    </div>
  );
};

export default CouponSuccess;