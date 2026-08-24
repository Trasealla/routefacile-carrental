import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Helmet from "../Helmet/Helmet";
import MetaHelmet from "../Helmet/MetaHelmet";
import CommonSection from "./CommonSection";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const CarEnquiry = () => {
  const { t } = useTranslation();
  return (
    <Helmet title="Enquiry">
      <MetaHelmet title="Car Enquiry" description="" noindex={true} />
      <CommonSection title="Contact" />
      <section>
        <Container>
      
        <h5 className="fw-bold mb-4 text-center">{t("If you like to book on your own, please book directly now or put in your request for a quotation")}</h5>
          <Card className="w-75 mx-auto border  shadow-lg">
   

            {/* Adjust the width using Bootstrap utility classes */}
            <Card.Body className="p-4">
            <h6 className="fw-bold mb-4 ">{t("QUOTATION REQUEST")}</h6>
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridName">
                    <Form.Label>{t("First Name")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("Enter First Name")}
                      className="w-100" // Make the input width 100%
                    />
                  </Form.Group>

                  <Form.Group as={Col} >
                    <Form.Label>{t("Last Name")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("Last Name")}
                      className="w-100" // Make the input width 100%
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                  <Form.Label>{t("Email Address")}</Form.Label>
                  <Form.Control
                    placeholder={t("Email Address")}
                    className="w-100" // Make the input width 100%
                  />
                </Form.Group>

                <Form.Group as={Col}>
                  <Form.Label>{t("City")} </Form.Label>
                  <Form.Control
                    placeholder={t("City")}
                    className="w-100" // Make the input width 100%
                  />
                </Form.Group>
                </Row>
                <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridState">
                    <Form.Label>{t("Enquiry Type")}</Form.Label>
                    <Form.Select
                      defaultValue="Choose..."
                      className="w-100" // Make the select width 100%
                    >
                      <option>Choose...</option>
                      <option>...</option>
                    </Form.Select>
                  </Form.Group>
                  

                  <Form.Group as={Col} controlId="formGridState">
                    <Form.Label>{t("Duration")}</Form.Label>
                    <Form.Select
                      defaultValue="Duration..."
                      className="w-100" // Make the select width 100%
                    >
                      <option>Choose...</option>
                      <option>...</option>
                    </Form.Select>
                  </Form.Group>

               
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                  <Form.Label>Select the car that you want to enquire for (optional)</Form.Label>
                  <Form.Control
                
                    className="w-100" // Make the input width 100%
                  />
                </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                  <Form.Label>{t("Additional Comments")}</Form.Label>
                  <Form.Control
                
                    className="w-100" // Make the input width 100%
                  />
                </Form.Group>
                </Row>
                <Button variant="primary" type="submit" className="btn">
                  {t("Submit")}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </section>
    </Helmet>
  );
};

export default CarEnquiry;
