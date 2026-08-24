import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/account.css";
import Helmet from "../../components/Helmet/Helmet";
import { Link } from "react-router-dom";
import {
  Nav,
  NavItem,
  Tab,
  Accordion,
  Badge,
  Form,
  Button,
  Spinner,
  Col,
  Row,
} from "react-bootstrap";
import threedots from "../../assets/all-images/options3dots.svg";
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import { compose, nanoid } from "@reduxjs/toolkit";
import threedotsvertical from "../../assets/all-images/three-dots-vertical-svgrepo-com.svg";
import carImage from "../../assets/all-images/cars-img/tesla.jpg";
import { red } from "@mui/material/colors";
import dropdownshow from "../../assets/all-images/dropdown-arrow-svgrepo-com.svg";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";
import {
  multipartPostCall,
  simpleDeleteCallAuth,
  simpleGetCall,
  simpleGetCallAuth,
  simplePostCallAuth,
  simplePutCallAuth,
} from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { useSelector } from "react-redux";
import { Modal } from "reactstrap";
import { useTranslation } from "react-i18next";

const AdditionalDriver = (props) => {
  const { countries, citiesArray } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [show_cancel_modal, setShow_cancel_modal] = useState(false);
  const handleClose_cancel_modal = () => setShow_cancel_modal(false);
  const handleShow_cancel_modal = () => setShow_cancel_modal(true);
  const [displayData, setDispalyData] = useState(false);
  const [drlist, setDrlist] = useState([]);
  const [ShowlistID, setShowListID] = useState(null);
  const [edit_user_data, set_edit_user_data] = useState([]);
  const [driver_id, set_driver_id] = useState(null);
  const [delete_driver_loading, set_delete_driver_loading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [displayoptions, setdisplayOptions] = useState(false);
  const handleShowListByID = (xid) => {
    setdisplayOptions(!displayoptions);
    setShowListID((prevID) => (prevID === xid ? null : xid));
  };
  const [formdata, setFormdata] = useState({
    firstname: "",
    dremail: "",
    drPhoneNumber: "",
  });

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [initialDriverFormData, setInitialDriverFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    dateOfBirth: "",
    dremail: "",
    drPhoneNumber: "",
    gender: "",
    nationality: "",
    AltdrPhoneNumber: "",
    phoneCode: "",
    altPhoneCode: "",
    cities: null,
  });
  const [validated, setValidated] = useState(false);
  const language = useSelector((state) => state.language.language);

  const [errors, setErrors] = useState({});

  const handleDriverFormChange = (e) => {
    const { name, value } = e.target;
    setInitialDriverFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormdata((prevData) => ({ ...prevData, [name]: value }));
  };
  // const handleSaveChanges = () => {
  //   const newDriver = {
  //     id: nanoid(),
  //     name: formdata.firstname,
  //     email: formdata.dremail,
  //     mobile: formdata.drPhoneNumber,
  //   };
  //   setDrlist([...drlist, newDriver]);
  //   alert("user is added successfully");
  //   setFormdata({ firstname: "", dremail: "", drPhoneNumber: "" });
  // };
  const handleDelete = (xid) => {
    // setDrlist(drlist.filter((x) => x.id !== xid));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      const postAdditionalDriver_API = await postAdditionalDriver();
      if (!postAdditionalDriver_API) setValidated(true);
      else setValidated(false);
    }
    // setValidated(true);
  };

  const postAdditionalDriver = () => {
    return new Promise((resolve, reject) => {
      const body = {
        first_name: initialDriverFormData?.firstname,
        last_name: initialDriverFormData?.lastname,
        gender: initialDriverFormData?.gender,
        dob: initialDriverFormData?.dateOfBirth,
        phone_code: initialDriverFormData?.phoneCode,
        phone_number: initialDriverFormData?.drPhoneNumber,
        alt_phone_code: initialDriverFormData?.altPhoneCode,
        alt_phone_number: initialDriverFormData?.AltdrPhoneNumber,
        country_id: initialDriverFormData?.nationality,
        // city_id: initialDriverFormData?.cities,
        email: initialDriverFormData?.dremail,
      };
      if (initialDriverFormData?.nationality == "229") {
        body.city_id = initialDriverFormData?.cities;
      }

      const url = driver_id
        ? configWeb.PUT_USER_DRIVER(driver_id)
        : configWeb.POST_ADDITIONAL_DRIVER;
      setLoading(true);
      const apiCall = driver_id ? simplePutCallAuth : simplePostCallAuth;
      apiCall(url, JSON.stringify(body))
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Updated successfully"));
            set_driver_id(null);
            setDispalyData(false);
            getSpecialOffersDetails();
            setInitialDriverFormData({
              firstname: "",
              middlename: "",
              lastname: "",
              dateOfBirth: "",
              dremail: "",
              drPhoneNumber: "",
              gender: "",
              nationality: "",
              AltdrPhoneNumber: "",
              phoneCode: "",
              altPhoneCode: "",
              cities: null,
            });
            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const DeleteAdditionalDriver = () => {
    return new Promise((resolve, reject) => {
      const body = {
        id: driver_id,
      };
      set_delete_driver_loading(true);
      const url = configWeb.DELETE_USER_DRIVER(driver_id);
      simpleDeleteCallAuth(url, JSON.stringify(body))
        .then((res) => {
          if (res?.status === "success") {
            // setUserDetails(res);
            notifySuccess(t("Deleted successfully"));
            set_driver_id(null);
getSpecialOffersDetails();
            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_delete_driver_loading(false)
        });
    });
  };
  const [delete_flag, set_delete_flag] = useState(false);
  useEffect(() => {
    if (driver_id && delete_flag) {
      DeleteAdditionalDriver();
    }

    return () => {
      set_delete_flag(false);
    };
  }, [driver_id]);

  const getSpecialOffersDetails = () => {
    const url = configWeb.GET_USER_DRIVER;
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setDrlist(res || []); // Ensure it's always an array
        }
      })
      .catch((error) => {
        console.log("Special offers API failed-->", error);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  useEffect(() => {
    getSpecialOffersDetails();
  }, []);

  const handleEditDriver = (id) => {
    // const drlistTemp = drlist?.find((item) => item.id === id);
    // set_edit_user_data(drlistTemp);
    set_driver_id(id);
    setDispalyData(!displayData);
  };

  const getUserDriverDetails = (id) => {
    return new Promise((resolve, reject) => {
      const url = configWeb.GET_USER_DRIVER_DETAILS(id);
      simpleGetCallAuth(url)
        .then((res) => {
          if (!res?.error) {
            set_edit_user_data(res);
            resolve(true);
          }
          resolve(false);
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          resolve(false);
        })
        .finally(() => {});
    });
  };

  useEffect(() => {
    if (driver_id) {
      getUserDriverDetails(driver_id);
    }
  }, [driver_id]);

  useEffect(() => {
    if (edit_user_data) {
      setInitialDriverFormData({
        firstname: edit_user_data?.first_name || "",
        middlename: "",
        lastname: edit_user_data?.last_name || "",
        dateOfBirth: edit_user_data?.dob || "",
        dremail: edit_user_data?.email || "",
        drPhoneNumber: edit_user_data?.phone_number || "",
        gender: edit_user_data?.gender || "",
        nationality: edit_user_data?.country_id || "",
        AltdrPhoneNumber: edit_user_data?.alt_phone_number || "",
        phoneCode: edit_user_data?.phone_code || "",
        altPhoneCode: edit_user_data?.alt_phone_code || "",
        cities: edit_user_data?.city_id || "",
      });
    }
  }, [driver_id, edit_user_data]);

  const cancelAdditionalDriver = () => {
    setDispalyData(!displayData);
    setInitialDriverFormData({
      firstname: "",
      middlename: "",
      lastname: "",
      dateOfBirth: "",
      dremail: "",
      drPhoneNumber: "",
      gender: "",
      nationality: "",
      AltdrPhoneNumber: "",
      phoneCode: "",
      altPhoneCode: "",
      cities: null,
    });
  };

  const handleDeleteDriver = (id) => {
    set_driver_id(id);
    set_delete_flag(true);
    
    // handleShow_cancel_modal();
    // setShow_cancel_modal(true);
  };

const handleViewUploadDocuments =(id)=>{
  navigate(`/${language}/MyAccount/DiverDocuments/${id}`)
}

  
  return (
    <div className="row align-items-start border rounded-3 p-2  shadow">
      <div className="col-6">
        <h3 className="additional-driver text-nowrap">{t("ADDITIONAL DRIVER")}</h3>
      </div>
      <div className="col-6 d-flex justify-content-end align-items-center">
        <button
          className="defButtonAddnew"
          // onClick={() => setDispalyData(!displayData)}
          onClick={cancelAdditionalDriver}
        >
          {displayData ? t("Cancel") : t("Add New Driver")}
        </button>
      </div>
      <div className="col wastefull-text">
        <h5>
          {t("Would someone be assisting you with the driving? Enter their details below")}.
        </h5>
      </div>

      <div className="row mt-3">
        {displayData ? (
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col lg="4" md="6">
                <Form.Group controlId="firstname">
                  <Form.Label>{t("First Name")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstname"
                    placeholder={t("First Name")}
                    value={initialDriverFormData.firstname}
                    onChange={handleDriverFormChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please provide your first name")}.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* <Col lg="4" md="6">
                <Form.Group controlId="middlename">
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="middlename"
                    placeholder="Middle Name"
                    value={initialDriverFormData.middlename}
                    onChange={handleDriverFormChange}
                  />
                </Form.Group>
              </Col> */}

              <Col lg="4" md="6">
                <Form.Group controlId="lastname">
                  <Form.Label>{t("Last Name")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastname"
                    placeholder={t("Last Name")}
                    value={initialDriverFormData.lastname}
                    onChange={handleDriverFormChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please provide your last name")}.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col lg="4" md="6" >
                <Form.Group controlId="dateOfBirth">
                  <Form.Label>{t("Date Of Birth")}</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={initialDriverFormData.dateOfBirth}
                    onChange={handleDriverFormChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please provide your date of birth")}.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col lg="4" md="6" className="mt-3">
                <Form.Group controlId="dremail">
                  <Form.Label>{t("Email")}</Form.Label>
                  <Form.Control
                    type="email"
                    name="dremail"
                    placeholder={t("Email Id")}
                    value={initialDriverFormData.dremail}
                    onChange={handleDriverFormChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("Please provide a valid email address")}.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col lg="4" md="6" className="mt-3">
                <Form.Group controlId="drPhoneNumber">
                  <Form.Label>{t("Phone Number")}</Form.Label>
                  <Row>
                    <Col xs="4">
                      <Form.Control
                        as="select"
                        name="phoneCode"
                        onChange={handleDriverFormChange}
                        value={initialDriverFormData?.phoneCode}
                        required
                      >
                        <option value="">{t("Code")}</option>
                        {countries?.map((country) => (
                          <option key={country.id} value={country.phone_code}>
                            {country.code} {country.phone_code}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col xs="8">
                      <Form.Control
                        type="number"
                        name="drPhoneNumber"
                        value={initialDriverFormData.drPhoneNumber}
                        onChange={handleDriverFormChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {t("Please provide a phone number")}.
                      </Form.Control.Feedback>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col lg="4" md="6" className="mt-3">
                <Form.Group controlId="gender">
                  <Form.Label>{t("Select Gender")}</Form.Label>
                  <div className="d-flex">
                    <Form.Check
                      type="radio"
                      id="male"
                      name="gender"
                      label={t("Male")}
                      value="male"
                      onChange={handleDriverFormChange}
                      checked={initialDriverFormData?.gender === "male"}
                      required
                    />
                    <Form.Check
                      type="radio"
                      id="female"
                      name="gender"
                      label={t("Female")}
                      value="female"
                      onChange={handleDriverFormChange}
                      checked={initialDriverFormData?.gender === "female"}
                      required
                      className="ms-3"
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("Please select your gender")}.
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
              </Col>

              <Col lg="4" md="6" className="mt-3">
                <Form.Group controlId="nationality">
                  <Form.Label>{t("Nationality")}</Form.Label>
                  <Form.Control
                    as="select"
                    name="nationality"
                    onChange={handleDriverFormChange}
                    required
                    value={initialDriverFormData?.nationality}
                  >
                    <option value="">{t("Select your nationality")}</option>
                    <option value="">{t("Nationality")}</option>
                    {countries?.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {t("Please select your nationality")}.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {initialDriverFormData?.nationality == "229" && (
                <Col lg="4" md="6" className="mt-3">
                  <Form.Group controlId="cities">
                    <Form.Label>{t("Cities")}</Form.Label>
                    <Form.Select
                      name="cities"
                      value={initialDriverFormData.cities}
                      onChange={handleDriverFormChange}
                      required
                    >
                      <option value="">{t("Select Cities")}</option>
                      {citiesArray?.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {t("Please select an city")}.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}

              <Col lg="4" md="6" className="mt-3">
                <Form.Group controlId="AltdrPhoneNumber">
                  <Form.Label>{t("Alternate Phone Number")}</Form.Label>
                  <Row>
                    <Col xs="4">
                      <Form.Control
                        as="select"
                        name="altPhoneCode"
                        onChange={handleDriverFormChange}
                        value={initialDriverFormData?.altPhoneCode}
                      >
                        <option value="">{t("Code")}</option>
                        {countries?.map((country) => (
                          <option key={country.id} value={country.phone_code}>
                            {country.code} {country.phone_code}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col xs="8">
                      <Form.Control
                        type="number"
                        name="AltdrPhoneNumber"
                        value={initialDriverFormData.AltdrPhoneNumber}
                        onChange={handleDriverFormChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col lg="12" md="12" className="mt-3"></Col>

              <Col className="d-flex justify-content-center mt-3">
                <Button type="submit" className="defButton text-nowrap px-4">
                  {loading ? <Spinner /> : t("Save changes")}
                </Button>
              </Col>
            </Row>
          </Form>
        ) : drlist.length === 0 && false ? (
          <div>{t("No data found")}</div>
        ) : (
          <div className="row" style={{ margin: "auto" }}>
            <table className="table table-bordered table-responsive additional-table text-center ">
              <thead>
                <tr>
                  <td>{t("Name")}</td>
                  <td>{t("Email")}</td>
                  <td>{t("Mobile")}</td>
                  <td>{t("Action")}</td>
                </tr>
              </thead>
              <tbody>
                {drlist?.length > 0 &&
                  drlist?.map((item, index) => (
                    <tr key={item.id}>
                      <td>{`${item.first_name} ${item.last_name}`}</td>
                      <td>{item.email}</td>
                      <td>{`${item.phone_code} ${item.phone_number}`}</td>
                      <td>
                        <button
                          /* className="defButton" */ className="btn btn-outline-warning"
                          style={{ scale: "0.8" }}
                          onClick={() => handleEditDriver(item.id)}
                        >
                          {t("Edit")}
                        </button>
                        <button
                          className="defButton-- btn btn-outline-danger mx-2"
                          style={{ scale: "0.8" }}
                          onClick={() => handleDeleteDriver(item.id)}
                        > {delete_driver_loading && driver_id === item.id ? <Spinner/> : t('Delete')}
                          
                        </button>

                        <button
                          className="defButton-- btn btn-outline-info"
                          style={{ scale: "0.8" }}
                          onClick={()=>handleViewUploadDocuments(item.id)}
                        >
                          {t("View/upload documents")}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
     
    </div>
  );
};

export default AdditionalDriver;
