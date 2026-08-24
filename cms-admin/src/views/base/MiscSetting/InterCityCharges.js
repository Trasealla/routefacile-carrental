import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button, Spinner, Modal } from "react-bootstrap";
import { TbPlus, TbTrash, TbRoute } from "react-icons/tb";

import configWeb from "../../../components/config.js/ConfigWeb";
import {
  simpleDeleteCallAuth,
  simpleGetCallAuth,
  simplePutCallAuth,
} from "../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import { fetchData } from "../CustomHooks/reusableFunctions";
import "./MiscSetting.css";

const EMPTY_ROW = { pickup_city_id: "", dropoff_city_id: "", charges: "", type: "cdw" };

const InterCityCharges = () => {
  const { t } = useTranslation();
  const [editLoading, setEditLoading] = useState(true);

  const [pickupCitiesArray, setPickupCitiesArray] = useState(false);
  const [showdel, setShowdel] = useState(false);
  const handleShowDel = (id) => {
    setDeleteID(id);
    setShowdel(true);
  };
  const handleCloseDel = () => setShowdel(false);
  const [loadingStates, setLoadingStates] = useState({
    cdw: [],
  });

  const [formRows_cdw, setFormRows_cdw] = useState([EMPTY_ROW]);

  // Handle form field change for a specific row
  const handleChange = (e, index, type) => {
    const { name, value } = e.target;

    switch (type) {
      case "cdw":
        const updatedRows2 = [...formRows_cdw];
        updatedRows2[index][name] = value;
        setFormRows_cdw(updatedRows2);
        break;
    }
  };
  // Add a new row of inputs
  const handleAddRow = (type) => {
    switch (type) {
      case "cdw":
        setFormRows_cdw([
          ...formRows_cdw,
          { pickup_city_id: "", dropoff_city_id: "", charges: "" },
        ]);
        break;
    }
  };

  // Remove a row of inputs
  const handleRemoveRow = (index, type, id) => {
    if (id) {
      handleShowDel(id);
    } else {
      switch (type) {
        case "cdw":
          const updatedRows2 = formRows_cdw.filter((_, i) => i !== index);
          setFormRows_cdw(updatedRows2);
          break;
      }
    }
  };

  // Form submit handler (basic validation and logging for now)
  const handleSubmit = (e, index, type) => {
    e.preventDefault();

    formSubmitFunction(index, type);
  };
  const formSubmitFunction = (index, type) => {
    let body = {};
    // Dynamically set loading for the specific type and index
    setLoadingStates((prevState) => {
      // Clone the existing state and update the clicked index
      const updatedState = [...prevState[type]]; // Create a copy of the array for that type
      updatedState[index] = true; // Set the specific index to true (loading)

      return {
        ...prevState,
        [type]: updatedState, // Return updated state
      };
    });
    switch (type) {
      case "cdw":
        body = {
          pickup_city_id: formRows_cdw[index].pickup_city_id,
          dropoff_city_id: formRows_cdw[index].dropoff_city_id,
          charges: formRows_cdw[index].charges,
        };
        if (formRows_cdw[index].id) {
          body.id = formRows_cdw[index].id;
        }

        break;
    }

    const url = configWeb.PUT_INTER_CITY_CHARGES;
    const apiCall = simplePutCallAuth;
    apiCall(url, JSON.stringify(body))
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
          if (res.status === "error") {
            notifyError(res?.error?.driverError?.sqlMessage);
          }
        }
      })
      .catch((error) => {
        notifyError(t("Something went wrong. Please try again later."));
      })
      .finally(() => {
        // Reset all loading states to false after the request is complete
        getChargesList();
        setLoadingStates((prevState) => {
          const resetState = { ...prevState };
          resetState[type] = resetState[type]?.map(() => false); // Reset all indices for that type
          return resetState;
        });
      });
  };

  const [pageSize] = useState(9999999);
  const [currentPage] = useState(1);
  const [priceListArray, setPriceListArray] = useState([]);

  const getChargesList = () => {
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("page_size", pageSize);

    const url = `${configWeb.GET_INTER_CITY_CHARGES_LIST}?${params.toString()}`;

    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setPriceListArray(res?.data || []);
        } else {
          setPriceListArray([]);
        }
      })
      .catch((error) => {
        notifyError(t("Something went wrong, please try again later"));
        setPriceListArray([]);
      })
      .finally(() => {
        setEditLoading(false);
        handleCloseDel();
      });
  };

  useEffect(() => {
    getChargesList();
  }, [currentPage, pageSize]);

  const processData = (data) => {
    const cdwData = data.map(({ pickup_city_id, dropoff_city_id, charges, id }) => ({
      pickup_city_id,
      dropoff_city_id,
      charges,
      type: "cdw",
      id,
    }));

    setFormRows_cdw(cdwData.length ? cdwData : [EMPTY_ROW]);
  };

  useEffect(() => {
    if (Array.isArray(priceListArray)) {
      processData(priceListArray);
    }

    return () => {};
  }, [priceListArray]);
  const [deleteID, setDeleteID] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteCharges = (id) => {
    return new Promise((resolve, reject) => {
      setDeleteLoading(true);
      const url = configWeb.DELETE_INTER_CITY_CHARGES(id);
      simpleDeleteCallAuth(url)
        .then((res) => {
          if (res?.status === "success") {
            notifySuccess(t("Deleted Successfully"));

            getChargesList();
            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          notifyError(t("Something went wrong. Please try again later."));
          resolve(false);
        })
        .finally(() => {
          setDeleteLoading(false);
        });
    });
  };

  const handleDelete = () => {
    deleteCharges(deleteID);
  };

  useEffect(() => {
    fetchData({
      url: `${configWeb.GET_CITIES}?page_size=9999`,
      setter: setPickupCitiesArray,
    });
  }, []);

  return (
    <div className="rf-form-page">
      <div className="rf-page-header">
        <div>
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {t("Inter-City Charges")}
          </h3>
          <p className="rf-page-sub">
            {t("Extra fees for one-way rentals picked up in one city and dropped off in another.")}
          </p>
        </div>
      </div>

      {editLoading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="rf-form-card intercity-card">
          {Array.isArray(formRows_cdw) &&
            formRows_cdw?.map((row, index) => (
              <Form
                onSubmit={(e) => handleSubmit(e, index, "cdw")}
                key={index}
                className="intercity-row"
              >
                <Form.Group controlId={`pickup-${index}`}>
                  <Form.Label>{t("Pickup City")}</Form.Label>
                  <Form.Select
                    name="pickup_city_id"
                    value={row.pickup_city_id}
                    onChange={(e) => handleChange(e, index, "cdw")}
                  >
                    <option value="">{t("Select")}</option>
                    {pickupCitiesArray?.length > 0 &&
                      pickupCitiesArray?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name_en}{" "}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId={`dropoff-${index}`}>
                  <Form.Label>{t("Dropoff City")}</Form.Label>
                  <Form.Select
                    name="dropoff_city_id"
                    value={row.dropoff_city_id}
                    onChange={(e) => handleChange(e, index, "cdw")}
                  >
                    <option value="">{t("Select")}</option>
                    {pickupCitiesArray?.length > 0 &&
                      pickupCitiesArray?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name_en}{" "}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId={`charges-${index}`}>
                  <Form.Label>{t("Charges (MAD)")}</Form.Label>
                  <Form.Control
                    type="number"
                    name="charges"
                    value={row.charges}
                    onChange={(e) => handleChange(e, index, "cdw")}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="rf-submit-btn"
                  disabled={loadingStates.cdw[index]}
                >
                  {loadingStates.cdw[index] ? (
                    <Spinner size="sm" />
                  ) : row?.id ? (
                    t("Update")
                  ) : (
                    t("Add")
                  )}
                </Button>

                <button
                  type="button"
                  className="intercity-icon-btn remove"
                  onClick={() => handleRemoveRow(index, "cdw", row.id)}
                  disabled={formRows_cdw.length === 1 && !row.id}
                  title={t("Remove route")}
                >
                  <TbTrash size={18} />
                </button>
              </Form>
            ))}

          <div className="intercity-add-row">
            <button
              type="button"
              className="intercity-icon-btn add"
              onClick={() => handleAddRow("cdw")}
              title={t("Add another route")}
            >
              <TbPlus size={18} />
            </button>
          </div>
        </div>
      )}

      <Modal show={showdel} onHide={handleCloseDel} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("Delete Route")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("Are you sure you want to delete this inter-city charge?")}
        </Modal.Body>
        <Modal.Footer>
          <Button className="rf-outline-btn" onClick={handleCloseDel}>
            {t("Cancel")}
          </Button>
          <Button
            className="rf-submit-btn"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner size="sm" /> : t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InterCityCharges;
