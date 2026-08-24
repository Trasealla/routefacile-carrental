import React, { useState } from "react";
import Helmet from "../Helmet/Helmet";
import MetaHelmet from "../Helmet/MetaHelmet";
import CommonSection from "./CommonSection";
import { Card, Col, Container, Nav, Row } from "react-bootstrap";
import "../../styles/ourfleetlist.css";
import {carData} from "../../assets/data/carData";
import { Link } from "react-router-dom";

const ECarList = () => {
    const [activeItem, setActiveItem] = useState(null);

    const handleItemClick = (index) => {
      setActiveItem(index);
    };
  
    const listItems = [
      "All",
      "Compact Cars",
      "Economy Cars",
      "Mid-Size Cars",
      "Small SUVs",
      "Large SUVs",
      "Family Cars",
      "Premium Cars",
      "Refrigerated Vans and Trucks",
      "Pick up, Panel Vans and Trucks",
      "Mini Buses",
      "Buses",
      "Mid Size SUV",
      "Electric Vehicle",
    ];
    return (
        <Helmet title="Electric car">
        <MetaHelmet title="Electric Cars" description="" noindex={true} />
      <CommonSection title="Electric car" />

      <Container fluid className="fleet__section">
        <Row>
        <Col md={3} xs={12} className="mt-2 ps-md-5">
      <div className="list-container">
        <h6 className="list-title">Your Car List </h6>
        <ul className="list-group">
          {listItems.map((item, index) => (
            <li
              key={index}
              className={`list-group-item ${
                index === activeItem ? "active" : ""
              }`}
              onClick={() => handleItemClick(index)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Col>
          <Col md={9}>
            <div className="fleet-card mt-2">
              <Container>
                <Row>
                  {carData.slice(0, 6).map((item) => (
                    <Col md={4} sm={6} className="mb-4">
                      <div className="fleet-card-overView">
                        <div className="offer__img glassBox__imgBox">
                          <img
                            src={item.imgUrl}
                            alt=""
                            className="w-100 glassBox__imgBox"
                          />
                        </div>

                        <div className="offer__item-content mt-4">
                          <h4 className="fleet__card-title">{item.carName}</h4>
                          <hr />
                          <div className="offer__item-info d-flex align-items-center justify-content-between mt-3 mb-4">
                            <span className=" d-flex align-items-center gap-1 ">
                              <img src={item.icon1} alt="" />
                              {item.automatic}
                            </span>{" "}
                            |
                            <span className=" d-flex align-items-center gap-1">
                              <img src={item.icon2} alt="" />
                              {item.seater}
                            </span>{" "}
                            |
                            <span className=" d-flex align-items-center gap-1">
                              <img src={item.icon3} alt="" />
                              {item.pertol}
                            </span>{" "}
                            |
                            <span className=" d-flex align-items-center gap-1">
                              <img
                                src={item.icon05}
                                alt=""
                                height="20px"
                                width="20px"
                              />
                              4
                            </span>
                            |
                            <span className=" d-flex align-items-center gap-1">
                              <img src={item.icon4} alt="" />
                              {item.AC}
                            </span>
                          </div>
                          <hr />
                          <div className="offer__item-info d-flex align-items-center justify-content-between mt-3 mb-4">
                            <span className=" d-flex align-items-center gap-1">
                              MAD {item.price}{" "}
                              <span className="offer__plans">/Day</span>
                            </span>
                            <span className=" d-flex align-items-center gap-1">
                              MAD {item.price}
                              <span className="offer__plans">/week</span>
                            </span>
                            <span className=" d-flex align-items-center gap-1">
                              MAD {item.price}
                              <span className="offer__plans">/Month</span>
                            </span>
                          </div>
                          <div className="container text-center">
  <div className="row">
    <div className="col-12 col-md-6">
      <button className="w-100 btn btn-primary offer__item-btn offer__btn-rent g">
        <Link to={`/cars/${item.carName}`}>READ MORE </Link>
      </button>
    </div>
    
    <div className="col-12 col-md-6 mt-md-0 mt-2">
      <button className="w-100 btn btn-secondary offer__item-btn offer__btn-rent">
        <Link to='/CarEnquriry'>ENQUIRE</Link>
      </button>
    </div>
  </div>
</div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>
          </Col>
        </Row>
        
      </Container>
    </Helmet>
    );
};

export default ECarList;