import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { simplePostCall } from "../../../config.js/SetUp";
import configWeb from "../../../config.js/configWeb";
import { notifySuccess, notifyError } from "../../../SharedComponent/notify";
import "./NewsletterSection.css";
import { trackGenerateLead } from "../../../SharedComponent/tracking";

const NewsletterSection = () => {
  const { t } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterLoading(true);
    try {
      const response = await simplePostCall(
        configWeb.POST_NEWSLETTER,
        JSON.stringify({ email: newsletterEmail })
      );
      const messages = Array.isArray(response?.message)
        ? response.message
        : response?.message
        ? [response.message]
        : [];
      const isDuplicate = messages.some((m) =>
        /already\s+(exists|subscribed)/i.test(String(m))
      );

      if (response?.status === "success") {
        // A genuinely new subscription. The duplicate branch below is not a
        // lead — that address is already on the list.
        trackGenerateLead("newsletter");
        notifySuccess(t("Thank you for subscribing to our newsletter."));
        setNewsletterEmail("");
      } else if (isDuplicate) {
        notifyError(t("This email is already subscribed."));
      } else if (messages.length > 0) {
        notifyError(messages[0]);
      } else {
        notifyError(t("Something went wrong. Please try again later."));
      }
    } catch (error) {
      notifyError(t("Something went wrong. Please try again later."));
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <section className="newsletter-section-new">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="newsletter-content-col">
            <div className="newsletter-content-new">
              <div className="newsletter-icon">
                <i className="fa-solid fa-envelope-open-text"></i>
              </div>
              <h2>{t("Subscribe to Our Newsletter")}</h2>
              <p>{t("Get exclusive offers and updates on new car arrivals")}</p>
            </div>
          </Col>
          <Col lg={6} className="newsletter-form-col">
            <form className="newsletter-form-new" onSubmit={handleNewsletterSubmit}>
              <div className="newsletter-input-wrapper">
                <input
                  type="email"
                  placeholder={t("Enter your email")}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={newsletterLoading}>
                  {newsletterLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>{t("Subscribe")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default NewsletterSection;


