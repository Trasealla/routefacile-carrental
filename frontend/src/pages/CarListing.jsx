import React from "react";
import { Container, Row, Col } from "reactstrap";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import CarItem from "../components/UI/CarItem";
import { carData } from "../assets/data/carData";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import { useSelector } from "react-redux";

const CarListing = () => {
  const language = useSelector((state) => state.language.language);
  return (
    <Helmet title="Cars">
      <MetaHelmet
        title="Browse Our Car Fleet"
        description="Browse Route Facile's full fleet of rental cars in Morocco. Economy, SUV, and premium vehicles available in Casablanca, Marrakech, Rabat and more."
        keywords="car rental Morocco, rent a car Casablanca, car fleet Route Facile, location voiture Maroc"
        canonicalUrl={`/${language}/ourfleetlist`}
      />
      <CommonSection title="Car Listing" />

      <section className="page-section">
        <Container>
          <Row>
            <Col lg="12">
              <div className=" d-flex align-items-center gap-3 mb-4">
                <span className=" d-flex align-items-center gap-2">
                  <i class="ri-sort-asc"></i> Sort By
                </span>

                <select>
                  <option>Select</option>
                  <option value="low">Low to High</option>
                  <option value="high">High to Low</option>
                </select>
              </div>
            </Col>

            {carData.map((item) => (
              <CarItem item={item} key={item.id} />
            ))}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default CarListing;
