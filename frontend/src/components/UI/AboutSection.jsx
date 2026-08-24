import React from "react";
import { Container, Row, Col } from "reactstrap";
import "../../styles/about-section.css";
import aboutImg from "../../assets/all-images/cars-img/bmw-offer.png";
import { useTranslation } from "react-i18next";

const AboutSection = ({ aboutClass }) => {
  const { t, i18n } = useTranslation();
  return (
    <section className="about__section mt-5">
      <Container>
        <Row>
          <Col lg="6" md="6">
            <div className="about__section-content">
              <h4 className="section__subtitle">Our Services</h4>
              <h2 className="section__title text-white">
                {t("WHY CHOOSE ROUTE FACILE RENT A CAR?")}
              </h2>
              <p className="section__description"> {t("Experience world class safety with our unique 4 Point Safety program.From daily rentals to long term rentals we offer a wide range of vehicles at the most competitive rates.Choose from a wide array of cars and enjoy a hassle-free and transparent booking experience from the comfort of your home!.")} </p>

              <div className="about__section-item d-flex align-items-center">
                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> Safe & Sanitized
                  Vehicles.
                </p>

                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> Pocket-friendly Cars.
                </p>
              </div>

              <div className="about__section-item d-flex align-items-center">
                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> Loyalty Benefits.
                </p>

                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> Hassle Free Bookings.
                </p>
              </div>
            </div>
          </Col>

          <Col lg="6" md="6">
            <div className="about__img">
              <img src={aboutImg} alt="" className="w-100" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutSection;
