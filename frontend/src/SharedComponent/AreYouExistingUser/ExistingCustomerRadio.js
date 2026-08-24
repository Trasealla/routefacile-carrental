import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import "./existingCustomer.css"
import { useTranslation } from "react-i18next";
const ExistingCustomerRadio = ({ value, onSelectionChange }) => {
  const { t } = useTranslation();
  
  return (
    <Form className="existing-customer-radio-form">
      <Form.Group>
        <div className="exisiting-cutomer-container" /* style={{ display: "flex", alignItems: "center", gap: "10px" }} */>
          <Form.Label style={{ marginBottom: 0 }}>
            {t("Are you an existing customer ?")}
          </Form.Label>
          <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
            <Form.Check
              type="radio"
              id="existing-customer-yes"
              name="existingCustomer"
              value="yes"
              label={t("Yes")}
              checked={value === "yes"}
              onChange={(e) => onSelectionChange(e.target.value)}
              inline
            />
            <Form.Check
              type="radio"
              id="existing-customer-no"
              name="existingCustomer"
              value="no"
              label={t("No")}
              checked={value === "no"}
              onChange={(e) => onSelectionChange(e.target.value)}
              inline
            />
          </div>
        </div>
      </Form.Group>
    </Form>
  );

};

export default ExistingCustomerRadio;
