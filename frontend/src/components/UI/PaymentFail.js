import React from "react";
import "./PaymentSuccess.css"; // Import the CSS file for styles
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import MetaHelmet from "../Helmet/MetaHelmet";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");
  const language = useSelector((state) => state.language.language);
const { t } = useTranslation();

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);
  return (
    <div className="parent">
      <MetaHelmet title="Payment Failed" description="" noindex={true} />
      <div className="printer-top"></div>
      <div className="paper-container">
        <div className="printer-bottom"></div>
        <div className="paper">
          <div className="main-contents">
            <div className="failier-icon"> &#10006;</div>
            <div className="success-title">{t("Transaction Failed.")}</div>
            <div className="success-description">
              {/* Show reason why payment has been failed. */}
            </div>
            <div className="order-details">
              {/* <div className="order-number-label">Route Facile Booking Number</div> */}
              <div className="order-number">
                <h3>
                  {/* <strong>ARC20240801945431422</strong> */}
                  <strong>{t("Your")} {message}</strong>
                </h3>
              </div>
              <div className="complement">{t("Your booking could not be processed. Try again or contact support.")}</div>
              <Link to={`/${language}/bookingDetailsTwo`}>
                <Button className="button">{t("Try Again")}</Button>
              </Link>
            </div>
          </div>
          <div className="jagged-edge"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
