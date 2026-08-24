import React from "react";
import { Col } from "reactstrap";
import "../../styles/services-list.css";
import servicesData from "../../assets/data/serviceData";
import { Figure, Row } from "react-bootstrap";
import img from "../../assets/all-images/service-images/Group-img.png";
import slideImg1 from "../../assets/all-images/service-images/Link1.png";
import slideImg2 from "../../assets/all-images/service-images/Link2.png";
import slideImg3 from "../../assets/all-images/service-images/Link3.png";

const OurServices = (props) => {

    return (
       
        <div className="mx-4">
        <Row>
          <Col lg={6} md={6} sm={12}>
            <Figure>
              <Figure.Image width={650} height={180} alt="171x180" src={img} />
            </Figure>
          </Col>

          <Col lg={6} md={6} sm={12}>
            <h2 className="text-center service_heading">OUR SERVICES</h2>
            {servicesData.map((_, index) => {
              return (
                // < >
                  <div className="py-1 d-flex gap-4 justify-content-center" key={index}>
                    <div className="servicelist_icon">
                      <img src={_.icon} alt="this is image of an icon" />
                    </div>
                    <div className="servicelist_typo">
                      <h3>{_.title}</h3>
                      <p>{_.desc}</p>
                    </div>
                  </div>
                // </>
              );
            })}
          </Col>
        </Row>
      </div>
    )
}

export default OurServices;