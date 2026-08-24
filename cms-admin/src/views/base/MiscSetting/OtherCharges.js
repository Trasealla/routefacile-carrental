import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  TbPercentage,
  TbDiscount,
  TbTruckDelivery,
  TbPackageImport,
  TbCalendarDollar,
} from "react-icons/tb";

import configWeb from "../../../components/config.js/ConfigWeb";
import { simplePutCallAuth } from "../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import { fetchData } from "../CustomHooks/reusableFunctions";
import { useTranslation } from "react-i18next";
import "./MiscSetting.css";

const CHARGE_FIELDS = [
  {
    key: "vat",
    label: "VAT Percentage",
    helper: "Value-added tax applied to every booking total.",
    icon: TbPercentage,
    unit: "%",
    placeholder: "Enter VAT percentage",
    error: "Please enter VAT charges.",
  },
  {
    key: "pay_now",
    label: "Pay Now Discount",
    helper: "Discount applied when a customer chooses Pay Now at checkout.",
    icon: TbDiscount,
    unit: "%",
    placeholder: "Enter Pay Now discount",
    error: "Please enter Pay Now discount.",
  },
  {
    key: "delivery_charges",
    label: "Delivery Charges",
    helper: "Flat fee for delivering the car to the customer's address.",
    icon: TbTruckDelivery,
    unit: "MAD",
    placeholder: "Enter delivery charges",
    error: "Please enter delivery charges.",
  },
  {
    key: "collection_charges",
    label: "Collection Charges",
    helper: "Flat fee for collecting the car back from the customer.",
    icon: TbPackageImport,
    unit: "MAD",
    placeholder: "Enter collection charges",
    error: "Please enter collection charges.",
  },
  {
    key: "monthly_pay_now_discount",
    label: "Monthly Pay Now Discount",
    helper: "Pay Now discount applied specifically to monthly rentals.",
    icon: TbCalendarDollar,
    unit: "%",
    placeholder: "Enter monthly discount",
    error: "Please enter monthly Pay Now discount.",
  },
];

const OtherCharges = () => {
  const { t } = useTranslation();
  const [editLoading, setEditLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    vat: false,
    delivery_charges: false,
    pay_now: false,
    collection_charges: false,
    monthly_pay_now_discount: false,
  });
  const [formData, setFormData] = useState({
    vat: "",
    delivery_charges: "",
    pay_now: "",
    collection_charges: "",
    monthly_pay_now_discount: "",
  });
  const [otherChargesList, setOtherChargesList] = useState([]);
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (fieldName) => {
    if (formData[fieldName] === "") {
      setValidated(true);
      return;
    }
  };

  const handleSubmit = (e, type) => {
    e.preventDefault();
    if (formData[type] || formData[type] === 0) formSubmitFunction(type);
  };

  const formSubmitFunction = (type) => {
    const array = otherChargesList?.filter((item) => item.key === type);
    const id = array[0]?.id;
    const body = { key: type, rate: formData[type], id };

    setLoadingStates((prevState) => ({
      ...prevState,
      [type]: true,
    }));
    const url = configWeb.PUT_OTHER_CHARGES;
    simplePutCallAuth(url, JSON.stringify(body))
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(
            body.id ? t("Updated Successfully") : t("Created Successfully")
          );
        } else {
          if (Array.isArray(res?.message)) {
            notifyError(res?.message[0]);
          } else {
            notifyError(res?.message);
          }
        }
      })
      .catch((error) => {
        notifyError(t("Something went wrong. Please try again later."));
      })
      .finally(() => {
        fetchData({
          url: configWeb.GET_OTHER_CHARGES_LIST,
          setter: setOtherChargesList,
        });
        setLoadingStates((prevState) => ({
          ...prevState,
          [type]: false,
        }));
      });
  };

  useEffect(() => {
    fetchData({
      url: configWeb.GET_OTHER_CHARGES_LIST,
      setter: setOtherChargesList,
      onFinally: () => setEditLoading(false),
    });
  }, []);

  useEffect(() => {
    if (otherChargesList) {
      const allowedKeys = CHARGE_FIELDS.map((f) => f.key);
      const updatedFormData = {};

      otherChargesList.forEach((item) => {
        if (allowedKeys.includes(item.key)) {
          updatedFormData[item.key] = item.rate;
        }
      });

      setFormData(updatedFormData);
    }

    return () => {};
  }, [otherChargesList]);

  return (
    <div className="rf-form-page misc-charges-page">
      <div className="rf-page-header">
        <div>
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {t("Other Charges")}
          </h3>
          <p className="rf-page-sub">
            {t("Configure the VAT, discounts, and delivery/collection fees applied across all bookings.")}
          </p>
        </div>
      </div>

      {editLoading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="misc-charges-grid">
          {CHARGE_FIELDS.map(({ key, label, helper, icon: Icon, unit, placeholder, error }) => (
            <Form
              key={key}
              noValidate
              validated={validated}
              onSubmit={(e) => handleSubmit(e, key)}
              className="rf-form-card misc-charge-card"
            >
              <div className="misc-charge-icon">
                <Icon size={22} />
              </div>
              <Form.Label>{t(label)}</Form.Label>
              <p className="misc-charge-helper">{t(helper)}</p>
              <div className="misc-charge-input-row">
                <div className="misc-charge-input-wrap">
                  <Form.Control
                    type="number"
                    placeholder={t(placeholder)}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required
                  />
                  <span className="misc-charge-unit">{unit}</span>
                </div>
                <Button
                  type="submit"
                  className="rf-submit-btn"
                  onClick={() => handleUpdate(key)}
                  disabled={loadingStates[key]}
                >
                  {loadingStates[key] ? <Spinner size="sm" /> : t("Update")}
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">
                {t(error)}
              </Form.Control.Feedback>
            </Form>
          ))}
        </div>
      )}
    </div>
  );
};

export default OtherCharges;
