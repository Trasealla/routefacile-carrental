import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/account.css";
import Helmet from "../../components/Helmet/Helmet";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Nav,
  NavItem,
  Tab,
  Accordion,
  Badge,
  Form,
  Button,
  Spinner,
  Modal,
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
  simpleGetCall,
  simpleGetCallAuth,
  simplePostCallAuth,
  simplePutCallAuth,
  getApiLang,
} from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { useSelector, useDispatch } from "react-redux";
import ExtendDropOffDateTimePicker from "./ExtendDropOffDateTimePicker";
import CardDetailsModal from "../../components/UI/CardDetails";
import { setEditUserBookingObject } from "../../reducers/Slices/editUserBookingSlice";
import CustomPagination from "../../components/UI/Pagination";
import { setLanguage } from "../../actions/action";
import { formatDate } from "../../SharedComponent/reusableFunctions";
import CancelBlockedModal from "../../components/UI/CancelBlockedModal/CancelBlockedModal";
import "../../components/UI/CancelBlockedModal/CancelBlockedModal.css";

const Booking = ({ user_id }) => {
  const language = useSelector((state) => state.language.language);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showCardButtons, setShowCardButtons] = useState(null);
  const [activeKey, setActiveKey] = useState("coming");
  const [bookingList, setBookingList] = useState([]);
  const [cancelation_reason, set_cancelation_reason] = useState("");
  const [booking_id, set_booking_id] = useState(null);
  const [booking_number, set_booking_number] = useState(null);
  const [dropoff_location_id, set_dropoff_location_id] = useState(null);
  const [dropoff_city_id, set_dropoff_city_id] = useState(null);
  const [dropoff_date_time, set_dropoff_date_time] = useState(null);
  const [extend_car_name, set_extend_car_name] = useState("");
  const [extend_pickup_date_time, set_extend_pickup_date_time] = useState(null);
  const [validated, setValidated] = useState(false);
  const [validated_extend, setValidated_extend] = useState(false);
  const [cardModalShow, setCardModalShow] = useState(false);
  const [disable_extend_booking_button , set_disable_extend_booking_button] = useState(true);
  const [extend_booking_message, set_extend_booking_message] = useState({
    id: null,
    booking_number: null,
    message: null,
  });

  const [payment_type, set_payment_type] = useState(null);
  const [cancel_booking_loading, set_cancel_booking_loading] = useState(false);
  const [booking_extend_loading, set_booking_extend_loading] = useState(false);
  const [booking_check_loading, set_booking_check_loading] = useState(false);
  const handleCancelReason = (event) => {
    set_cancelation_reason(event.target.value);
  };

  const [show_cancel_modal, setShow_cancel_modal] = useState(false);
  const [show_extend_modal, setShow_extend_modal] = useState(false);
  const [show_cancel_blocked_modal, setShow_cancel_blocked_modal] = useState(false);
  const [cancel_eligibility_loading, set_cancel_eligibility_loading] = useState(false);
  const [cancel_eligible, set_cancel_eligible] = useState(true);
  const [selected_booking_number_for_cancel, set_selected_booking_number_for_cancel] = useState(null);
  const [totalRecords, setTotalRecords] = useState(null);
  const [loading_for_booking, set_loading_for_booking] = useState(false);

  const handleClose_cancel_modal = () => setShow_cancel_modal(false);
  const handleClose_cancel_blocked_modal = () => setShow_cancel_blocked_modal(false);
  const handleClose_extend_modal = () =>{ 
    set_disable_extend_booking_button(true);
    set_extend_booking_message(null);
    setFormattedDate_dropoff("");
    setFormattedTime_dropoff("");
    setValidated_extend(false);
    setShow_extend_modal(false);
  }

  const handleShow_cancel_modal = () => setShow_cancel_modal(true);
  const [agreed, setAgreed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCheckboxChange = (event) => {
    setAgreed(event.target.checked);
  };

  const handleSelectKey = (key) => {
    setActiveKey(key);
    setCurrentPage(1);
  };

  const getBookingList = () => {
    // const url1 = `${configWeb.GET_USER_BOOKING_DETAILS(user_id)}?language=${language}&page_number=${pageNumber}&page_size=${pageSize}`;

    const url = `${configWeb.GET_BOOKING_LIST(
      activeKey
    )}?lang=${getApiLang(language)}&page=${currentPage}&page_size=${recordsPerPage}`;
    set_loading_for_booking(true);
    simpleGetCallAuth(url)
      .then((res) => {
        if (!res?.error) {
          setBookingList(res?.data);
          setTotalRecords(res?.total_records);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {
        set_loading_for_booking(false);
      });
  };
  useEffect(() => {
    getBookingList();
    // language: booking rows carry localised car and location names.
  }, [activeKey, currentPage, language]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Call the cancelBooking function only if the form is valid
      await cancelBooking();
      // const cancelBooking = await cancelBooking();
      getBookingList();
    }

    setValidated(true);
  };
  const handleSubmit_extend = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated_extend(true);
      return;
    }

    // Validate that a new date/time has been selected
    if (!formattedDate_dropoff || !formattedTime_dropoff) {
      notifyError(t("Please select a new drop-off date and time"));
      return;
    }

    // Validate new date is after current drop-off
    const newDropoff = new Date(`${formattedDate_dropoff}T${formattedTime_dropoff}`);
    const currentDropoff = new Date(dropoff_date_time);
    if (newDropoff <= currentDropoff) {
      notifyError(t("New drop-off date must be after the current drop-off date"));
      return;
    }

    // Validate that the price check has been done first
    if (!extend_booking_message?.message) {
      notifyError(t("Please select a date and wait for the price check"));
      return;
    }

    // Extend the booking on the backend, then open payment modal
    const result = await extendBooking("extend");
    if (result) {
      setCardModalShow(true);
      setShow_extend_modal(false);
    }

    setValidated_extend(true);
  };

  const extendBooking = (action_type) => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        booking_number: booking_number,
        dropoff_date: formattedDate_dropoff,
        dropoff_time: formattedTime_dropoff,
        action_type: action_type,
        booking_source : "web" ,
      });

      const url = configWeb.POST_EXTEND_BOOKING;
      if (action_type === "extend") {
        set_booking_extend_loading(true);
        set_disable_extend_booking_button(true);

      } else {
        set_booking_check_loading(true);
        set_disable_extend_booking_button(false);
      }

      simplePostCallAuth(url, body)
        .then((res) => {
          if (res?.status === "success") {
            set_extend_booking_message(res?.booking);
            set_payment_type(res?.payment_type);
            resolve(true);
           
          } else if (res?.error) {
            notifyError(res?.message);
            resolve(false);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_booking_extend_loading(false);
          set_booking_check_loading(false);
        });
    });
  };

  const cancelBooking = () => {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        booking_id: booking_id,
        cancellation_reason: cancelation_reason,
      });

      const url = configWeb.POST_CANCEL_BOOKING;
      set_cancel_booking_loading(true);
      simplePostCallAuth(url, body)
        .then((res) => {
          if (!res?.error) {
            // setUserDetails(res);
            notifySuccess(t("Cancelled successfully"));
            resolve(true);
          } else if (res?.error_code === "CANCEL_DAILY_LIMIT_REACHED" || res?.errorCode === "CANCEL_DAILY_LIMIT_REACHED") {
            // Daily limit reached — show blocked UI instead of generic error
            handleClose_cancel_modal();
            set_cancel_eligible(false);
            setShow_cancel_blocked_modal(true);
            resolve(false);
            return;
          } else if (res?.error) {
            notifyError(res?.message);
          }
          handleClose_cancel_modal();
        })
        .catch((error) => {
          console.error("Cancel booking failed:", error);
          notifyError(t("Something went wrong, please try again later"));
          resolve(false);
        })
        .finally(() => {
          set_cancel_booking_loading(false);
        });
    });
  };

  const checkCancelEligibility = () => {
    return new Promise((resolve) => {
      const url = configWeb.GET_CANCEL_BOOKING_ELIGIBILITY;
      set_cancel_eligibility_loading(true);
      simpleGetCallAuth(url)
        .then((res) => {
          if (res?.canCancel === false) {
            set_cancel_eligible(false);
            resolve(false);
          } else {
            set_cancel_eligible(true);
            resolve(true);
          }
        })
        .catch((error) => {
          // Network failure: degrade gracefully — let the user try cancel
          console.error("Cancel eligibility check failed:", error);
          set_cancel_eligible(true);
          resolve(true);
        })
        .finally(() => {
          set_cancel_eligibility_loading(false);
        });
    });
  };

  const handleCancelBooking = async (booking_id, booking_number) => {
    set_booking_id(booking_id);
    set_selected_booking_number_for_cancel(booking_number || null);
    const eligible = await checkCancelEligibility();
    if (eligible) {
      setShow_cancel_modal(true);
    } else {
      setShow_cancel_blocked_modal(true);
    }
  };

  const handleModifyFromBlocked = () => {
    handleClose_cancel_blocked_modal();
    if (selected_booking_number_for_cancel) {
      handleEditBooking(selected_booking_number_for_cancel);
    }
  };

  const handlePayNowFromBlocked = () => {
    handleClose_cancel_blocked_modal();
    if (selected_booking_number_for_cancel) {
      navigate(`/${language}/bookingDetails/${selected_booking_number_for_cancel}`);
    }
  };

  const handleEditBooking = async (booking_number) => {
    await getUserBookingDetailsLatest(booking_number);
    navigate(`/${language}/bookingDetails/${booking_number}`);
  };

  const handleExtendBooking = (
    booking_id,
    dropoff_location_id,
    dropoff_city_id,
    dropoff_date_time,
    booking_number,
    car_name,
    pickup_date_time
  ) => {
    setShow_extend_modal(true);
    set_booking_id(booking_id);
    set_dropoff_date_time(dropoff_date_time);
    set_booking_number(booking_number);
    set_extend_car_name(car_name || "");
    set_extend_pickup_date_time(pickup_date_time || null);
    if (dropoff_location_id) {
      set_dropoff_location_id(dropoff_location_id);
    } else {
      set_dropoff_city_id(dropoff_city_id);
    }
  };

  // function formatDate(dateString) {
  //   const options = {
  //     weekday: "long",
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   };

  //   return new Date(dateString)
  //     .toLocaleDateString("en-US", options)
  //     .replace(",", "");
  // }

 
  

  const handleExtendBookingPayment = () => {
    setCardModalShow(true);
  };

  const [loading_for_edit_booking, set_loading_for_edit_booking] = useState(false);
  const getUserBookingDetailsLatest = (booking_number) => {
    return new Promise((resolve, reject) => {
      const url = configWeb.GET_USER_LATEST_BOOKING_DETAILS(booking_number);
      set_loading_for_edit_booking(true);
      simpleGetCallAuth(url)
        .then((res) => {
          if (!res?.error) {
            dispatch(setEditUserBookingObject(res?.data));
            resolve(true);
          }
          resolve(false);
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          resolve(false);
        })
        .finally(() => {
          set_loading_for_edit_booking(false)
        });
    });
  };

  // ////////////////Dropoffdatetimepicker /////////////////////////////////////////
  const [formattedDate_dropoff, setFormattedDate_dropoff] = useState("");
  const [formattedTime_dropoff, setFormattedTime_dropoff] = useState("");
  const handleDateTimeChange_dropoff = (date, time) => {
    setFormattedDate_dropoff(date);
    setFormattedTime_dropoff(time);
  };
  return (
    <>
      {loading_for_edit_booking ? <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100vw" }}
        ><Spinner/></div> : 
    
    
  
    <div id="innerTabs">

    
      <Tab.Container defaultActiveKey="coming" onSelect={handleSelectKey}>
        <Nav variant="pills" className="">
          <Nav.Item>
            <Nav.Link eventKey="coming">{t("Upcoming Reservations")}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="current" className="h-100">
              {t("Current Reservations")}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="past" className="h-100">
              {t("Past Reservations")}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="cancelled">{t("Cancelled Reservations")}</Nav.Link>
          </Nav.Item>
        </Nav>
        {loading_for_booking ? (
          <div className="text-center h-100">
            {" "}
            <Spinner />{" "}
          </div>
        ) : (
          <>
            <Tab.Content>
              <Tab.Pane eventKey="coming">
                <div className="row justify-content-center mb-4">
                  {bookingList?.length > 0 &&
                    bookingList?.map((booking, index) => (
                      <div
                        key={booking?.id}
                        className="col-lg-6 col-12 position-relative "
                      >
                        <div className="p-2 shadow rounded-3">
                          <div className="row reserved-row">
                            <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                            <img
                                src={booking?.image}
                                className="img-fluid rounded-3"
                                alt={booking?.car_name}
                              />
                            </div>
                            <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                              <span
                                className="badge p-2 mt-1"
                                style={{
                                  backgroundColor: "#6C505E",
                                  fontFamily: "monospace",
                                  fontSize: "18px",
                                }}
                              >
                                {booking?.car_name}
                              </span>
                              <p className="mb-0">
                                <strong>{t("Reservation Number")}:</strong>{" "}
                                {booking?.booking_number}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Location")}:</strong>{" "}
                                {booking?.pickup_location ||
                                  booking?.pickup_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Date")}:</strong>{" "}
                                {/* Wednesday, Aug 14, 2024
                         07:00 PM */}{" "}
                                {formatDate(booking?.pickup_date_time)}
                              </p>
                              <hr className="my-1" />
                              <p className="mb-0">
                                <strong>{t("Drop Off Location")}:</strong>{" "}
                                {/* Al Jazah Street, Ras
                         Al Khaimah */}{" "}
                                {booking?.dropoff_location ||
                                  booking?.dropoff_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Drop Off Date")}:</strong>{" "}
                                {/* Wednesday, Aug 21, 2024
                         01:00 PM */}{" "}
                                {formatDate(booking?.dropoff_date_time)}
                              </p>
                            </div>
                            <div className="col-lg-1 col-md-1 move-it-right">
                              <img alt=""
                                src={threedotsvertical}
                                className="threedots"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setShowCardButtons(
                                    showCardButtons === index ? null : index
                                  )
                                }
                                alt="Menu"
                              />
                            </div>
                          </div>
                        </div>
                        {!cancel_eligible && (
                          <div className="cancel-unavailable-inline">
                            <span className="cancel-unavailable-text">
                              {t("Cancellation unavailable today")}
                            </span>
                            <div className="cancel-unavailable-links">
                              <span onClick={() => handleEditBooking(booking?.booking_number)}>
                                {t("Modify Booking")}
                              </span>
                              <span onClick={() => navigate(`/${language}/bookingDetails/${booking?.booking_number}`)}>
                                {t("Pay Now")}
                              </span>
                            </div>
                          </div>
                        )}
                        {showCardButtons === index && (
                          <ul className={`list-unstyled  ${language === 'ar' ? "make-position-absolute--arabic" : "make-position-absolute"}`}>
                            <li
                              className="text-nowrap"
                              onClick={() =>
                                handleEditBooking(booking?.booking_number)
                              }
                            >
                              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              {t("Edit Reservation")}
                            </li>
                            <li
                              className="text-nowrap"
                              onClick={() =>
                                handleExtendBooking(
                                  booking?.id,
                                  booking?.dropoff_location_id,
                                  booking?.dropoff_city_id,
                                  booking?.dropoff_date_time,
                                  booking?.booking_number,
                                  booking?.car_name,
                                  booking?.pickup_date_time
                                )
                              }
                            >
                              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14l4 4m-4-4v4m0-4H8"/></svg>
                              {t("Extend Reservation")}
                            </li>

                            {!cancel_eligibility_loading && (
                              <li
                                className={`text-nowrap menu-item-danger${!cancel_eligible ? ' text-muted' : ''}`}
                                onClick={() => handleCancelBooking(booking?.id, booking?.booking_number)}
                              >
                                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                {cancel_eligibility_loading ? t("Checking...") : t("Cancel Reservation")}
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    ))}
                  {/* <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative ">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div>
              <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div> */}
                </div>

                <CustomPagination
                  recordsPerPage={recordsPerPage}
                  totalRecords={totalRecords}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </Tab.Pane>
            </Tab.Content>

            <Tab.Content>
              <Tab.Pane eventKey="current">
                <div className="row justify-content-center mb-4">
                  {bookingList?.length > 0 &&
                    bookingList?.map((booking, index) => (
                      <div
                        key={booking?.id}
                        className="col-lg-6 col-12 position-relative "
                      >
                        <div className="p-2 shadow rounded-3">
                          <div className="row reserved-row">
                            <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                              <img
                                src={booking?.image}
                                className="img-fluid rounded-3"
                                alt={booking?.car_name}
                              />
                            </div>
                            <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                              <span
                                className="badge p-2 mt-1"
                                style={{
                                  backgroundColor: "#6C505E",
                                  fontFamily: "monospace",
                                  fontSize: "18px",
                                }}
                              >
                                {booking?.car_name}
                              </span>
                              <p className="mb-0">
                                <strong>{t("Reservation Number")}:</strong>{" "}
                                {booking?.booking_number}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Location")}:</strong>{" "}
                                {booking?.pickup_location ||
                                  booking?.pickup_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Date")}:</strong>{" "}
                                {/* Wednesday, Aug 14, 2024
                         07:00 PM */}{" "}
                                {formatDate(booking?.pickup_date_time)}
                              </p>
                              <hr className="my-1" />
                              <p className="mb-0">
                                <strong>{t("Drop Off Location")}:</strong>{" "}
                                {/* Al Jazah Street, Ras
                         Al Khaimah */}{" "}
                                  {booking?.dropoff_location ||
                                  booking?.dropoff_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Drop Off Date")}:</strong>{" "}
                                {/* Wednesday, Aug 21, 2024
                         01:00 PM */}{" "}
                                {formatDate(booking?.dropoff_date_time)}
                              </p>
                            </div>
                            <div className="col-lg-1 col-md-1 move-it-right">
                              <img alt=""
                                src={threedotsvertical}
                                className="threedots"
                                onClick={() =>
                                  setShowCardButtons(
                                    showCardButtons === index ? null : index
                                  )
                                }
                                alt="Menu"
                              />
                            </div>
                          </div>
                        </div>
                        {showCardButtons === index && (
                          <ul className={`list-unstyled ${language === 'ar' ? "make-position-absolute--arabic" : "make-position-absolute"}`}>
                            <li
                              className="text-nowrap"
                              onClick={() =>
                                handleExtendBooking(
                                  booking?.id,
                                  booking?.dropoff_location_id,
                                  booking?.dropoff_city_id,
                                  booking?.dropoff_date_time,
                                  booking?.booking_number,
                                  booking?.car_name,
                                  booking?.pickup_date_time
                                )
                              }
                            >
                              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14l4 4m-4-4v4m0-4H8"/></svg>
                              {t("Extend Reservation")}
                            </li>
                            {/* <li  className="text-nowrap" onClick={() => handleCancelBooking(booking?.id)}>
                          Cancel Reservation
                        </li> */}
                          </ul>
                        )}
                      </div>
                    ))}

                  {/* <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative ">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div>
              <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative ">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div> */}
                </div>
                <CustomPagination
                  recordsPerPage={recordsPerPage}
                  totalRecords={totalRecords}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </Tab.Pane>
            </Tab.Content>

            <Tab.Content>
              <Tab.Pane eventKey="past">
                <div className="row justify-content-center mb-4">
                  {bookingList?.length > 0 &&
                    bookingList?.map((booking, index) => (
                      <div
                        key={booking?.id}
                        className=" col-lg-6 col-12 position-relative "
                      >
                        <div className="p-2 shadow rounded-3">
                          <div className="row reserved-row">
                            <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                            <img
                                src={booking?.image}
                                className="img-fluid rounded-3"
                                alt={booking?.car_name}
                              />
                            </div>
                            <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                              <span
                                className="badge p-2 mt-1"
                                style={{
                                  backgroundColor: "#6C505E",
                                  fontFamily: "monospace",
                                  fontSize: "18px",
                                }}
                              >
                                {booking?.car?.name}
                              </span>
                              <p className="mb-0">
                                <strong>{t("Reservation Number")}:</strong>{" "}
                                {booking?.booking_number}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Location")}:</strong>{" "}
                                {booking?.pickup_location ||
                                  booking?.pickup_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Date")}:</strong>{" "}
                                {/* Wednesday, Aug 14, 2024
                         07:00 PM */}{" "}
                                {formatDate(booking?.pickup_date_time)}
                              </p>
                              <hr className="my-1" />
                              <p className="mb-0">
                                <strong>{t("Drop Off Location")}:</strong>{" "}
                                {/* Al Jazah Street, Ras
                         Al Khaimah */}{" "}
                                  {booking?.dropoff_location ||
                                  booking?.dropoff_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Drop Off Date")}:</strong>{" "}
                                {/* Wednesday, Aug 21, 2024
                         01:00 PM */}{" "}
                                {formatDate(booking?.dropoff_date_time)}
                              </p>
                            </div>
                            <div className="col-lg-1 col-md-1 move-it-right">
                              <img alt=""
                                src={threedotsvertical}
                                className="threedots"
                                onClick={() =>
                                  setShowCardButtons(
                                    showCardButtons === index ? null : index
                                  )
                                }
                                alt="Menu"
                              />
                            </div>
                          </div>
                        </div>
                        {/* {showCardButtons === index && (
                      <ul className="list-unstyled make-position-absolute">
                        <li>Edit Reservation</li>
                        <li onClick={() => handleCancelBooking(booking?.id)}>
                          Cancel Reservation
                        </li>
                      </ul>
                    )} */}
                      </div>
                    ))}

                  {/* <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative ">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div>
              <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative ">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div> */}
                </div>

                <CustomPagination
                  recordsPerPage={recordsPerPage}
                  totalRecords={totalRecords}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </Tab.Pane>
            </Tab.Content>

            <Tab.Content>
              <Tab.Pane eventKey="cancelled">
                <div className="row justify-content-center mb-4">
                  {bookingList?.length > 0 &&
                    bookingList?.map((booking, index) => (
                      <div
                        key={booking?.id}
                        className="col-lg-6 col-12 position-relative "
                      >
                        <div className="p-2 shadow rounded-3">
                          <div className="row reserved-row">
                            <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                            <img
                                src={booking?.image}
                                className="img-fluid rounded-3"
                                alt={booking?.car_name}
                              />
                            </div>
                            <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                              <span
                                className="badge p-2 mt-1"
                                style={{
                                  backgroundColor: "#6C505E",
                                  fontFamily: "monospace",
                                  fontSize: "18px",
                                }}
                              >
                                {booking?.car?.name}
                              </span>
                              <p className="mb-0">
                                <strong>{t("Reservation Number")}:</strong>{" "}
                                {booking?.booking_number}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Location")}:</strong>{" "}
                                {booking?.pickup_location ||
                                  booking?.pickup_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Pick Up Date")}:</strong>{" "}
                                {/* Wednesday, Aug 14, 2024
                         07:00 PM */}{" "}
                                {formatDate(booking?.pickup_date_time)}
                              </p>
                              <hr className="my-1" />
                              <p className="mb-0">
                                <strong>{t("Drop Off Location")}:</strong>{" "}
                                {/* Al Jazah Street, Ras
                         Al Khaimah */}{" "}
                                  {booking?.dropoff_location ||
                                  booking?.dropoff_address}
                              </p>
                              <p className="mb-0">
                                <strong>{t("Drop Off Date")}:</strong>{" "}
                                {/* Wednesday, Aug 21, 2024
                         01:00 PM */}{" "}
                                {formatDate(booking?.dropoff_date_time)}
                              </p>
                            </div>
                            <div className="col-lg-1 col-md-1 move-it-right">
                              <img alt=""
                                src={threedotsvertical}
                                className="threedots"
                                onClick={() =>
                                  setShowCardButtons(
                                    showCardButtons === index ? null : index
                                  )
                                }
                                alt="Menu"
                              />
                            </div>
                          </div>
                        </div>
                        {/* {showCardButtons === index && (
                      <ul className="list-unstyled make-position-absolute">
                        <li>Edit Reservation</li>
                        <li onClick={() => handleCancelBooking(booking?.id)}>
                          Cancel Reservation
                        </li>
                      </ul>
                    )} */}
                      </div>
                    ))}
                  {/* <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative ">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div>
              <div className="col-sm-6 col-md-6 col-lg-6 col-12 position-relative ">
                <div className="p-2 shadow rounded-3">
                  <div className="row reserved-row">
                    <div className="col-lg-5 col-md-5 col-xs-6 d-flex flex-column align-items-start">
                      <img
                        src={carImage}
                        className="img-fluid rounded-3"
                        alt="Car"
                      />
                    </div>
                    <div className="col-lg-5 col-md-5 col-xs-6 card-body my-auto text-under-small-screen">
                      <span
                        className="badge p-2 mt-1"
                        style={{
                          backgroundColor: "#6C505E",
                          fontFamily: "monospace",
                          fontSize: "18px",
                        }}
                      >
                        Mitsubishi Attrage
                      </span>
                      <p className="mb-0">
                        <strong>Reservation Number:</strong> ARC14497
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Location:</strong> Dubai International
                        Airport - Terminal 1 Arrival
                      </p>
                      <p className="mb-0">
                        <strong>Pick Up Date:</strong> Wednesday, Aug 14, 2024
                        07:00 PM
                      </p>
                      <hr className="my-1" />
                      <p className="mb-0">
                        <strong>Drop Off Location:</strong> Al Jazah Street, Ras
                        Al Khaimah
                      </p>
                      <p className="mb-0">
                        <strong>Drop Off Date:</strong> Wednesday, Aug 21, 2024
                        01:00 PM
                      </p>
                    </div>
                    <div className="col-lg-1 col-md-1 move-it-right">
                      <img alt=""
                        src={threedotsvertical}
                        className=""
                        onClick={() => setShowCardButtons(!showCardButtons)}
                        alt="Menu"
                      />
                    </div>
                  </div>
                </div>
                {showCardButtons && (
                  <ul className="list-unstyled make-position-absolute">
                    <li>Edit Reservation</li>
                    <li>Cancel Reservation</li>
                  </ul>
                )}
              </div> */}
                </div>

                <CustomPagination
                  recordsPerPage={recordsPerPage}
                  totalRecords={totalRecords}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </Tab.Pane>
            </Tab.Content>
          </>
        )}
      </Tab.Container>

      <Modal show={show_cancel_modal} onHide={handleClose_cancel_modal}>
        <Modal.Header closeButton dir="ltr">
          <Modal.Title>{t("CANCEL BOOKING?")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>{t("Cancellation Reason")}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={t("Enter cancellation reasons")}
                onChange={handleCancelReason}
                required
              />
              <Form.Control.Feedback type="invalid">
                {t("Please provide a cancellation reason")}.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="cancellationPolicyCheckbox">
              <Form.Check
                type="checkbox"
                label={t("I have read and agree to the Cancellation Policy")}
                checked={agreed}
                onChange={handleCheckboxChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                {t("You must agree before submitting")}.
              </Form.Control.Feedback>
            </Form.Group>
            <Modal.Footer>
              <Button
                variant="secondary"
                className="defButton"
                type="button"
                onClick={handleClose_cancel_modal}
              >
                {t("Close")}
              </Button>
              <Button
                className="defButton"
                variant="secondary"
                type="submit"
                /* onClick={handleSubmit} */ disabled={cancel_booking_loading}
              >
                {cancel_booking_loading ? <Spinner /> : t("Cancel Booking")}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={show_extend_modal} onHide={handleClose_extend_modal} centered className="extend-booking-modal" enforceFocus={false} style={{ zIndex: 1050 }} backdropClassName="extend-booking-backdrop">
        <div className="extend-modal-header-bar">
          <div className="extend-modal-header-content">
            <div className="extend-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14L16 18M12 14V18M12 14H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h5 className="extend-modal-title">{t("Extend Booking")}</h5>
              {booking_number && (
                <span className="extend-modal-booking-num">#{booking_number}</span>
              )}
            </div>
          </div>
          <button className="extend-modal-close-btn" onClick={handleClose_extend_modal} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <Modal.Body className="extend-modal-body">
          {extend_car_name && (
            <div className="extend-booking-summary">
              <div className="extend-summary-row">
                <span className="extend-summary-label">{t("Vehicle")}</span>
                <span className="extend-summary-value">{extend_car_name}</span>
              </div>
              {extend_pickup_date_time && (
                <div className="extend-summary-row">
                  <span className="extend-summary-label">{t("Pick Up Date")}</span>
                  <span className="extend-summary-value">{formatDate(extend_pickup_date_time)}</span>
                </div>
              )}
              <div className="extend-summary-row">
                <span className="extend-summary-label">{t("Current Drop Off")}</span>
                <span className="extend-summary-value extend-summary-highlight">{formatDate(dropoff_date_time)}</span>
              </div>
            </div>
          )}

          <Form
            noValidate
            validated={validated_extend}
            onSubmit={handleSubmit_extend}
          >
            <div className="extend-datepicker-section">
              <label className="extend-datepicker-label">{t("Select New Drop-off Date & Time")}</label>
              <ExtendDropOffDateTimePicker
                onDateTimeChange={handleDateTimeChange_dropoff}
                dropoff_location_id={dropoff_location_id}
                dropoff_city_id={dropoff_city_id}
                dropoff_date_time={dropoff_date_time}
                extendBooking={extendBooking}
              />
            </div>

            {(booking_check_loading || extend_booking_message?.message) && (
              <div className={`extend-price-box ${extend_booking_message?.message ? 'extend-price-box--visible' : ''}`}>
                {booking_check_loading ? (
                  <div className="extend-price-loading">
                    <Spinner size="sm" /> <span>{t("Checking availability...")}</span>
                  </div>
                ) : (
                  <div className="extend-price-message">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="extend-price-icon">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0D1B2A" strokeWidth="2"/>
                      <path d="M12 8V12M12 16H12.01" stroke="#0D1B2A" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>{extend_booking_message?.message}</span>
                  </div>
                )}
              </div>
            )}

            <div className="extend-modal-actions">
              <button
                className="extend-btn-cancel"
                type="button"
                onClick={handleClose_extend_modal}
              >
                {t("Close")}
              </button>
              <button
                className="extend-btn-confirm"
                type="submit"
                disabled={booking_extend_loading || disable_extend_booking_button}
              >
                {booking_extend_loading ? (
                  <><Spinner size="sm" className="me-2" /> {t("Extending...")}</>
                ) : (
                  <>{t("Extend Booking")}</>
                )}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <CardDetailsModal
        cardModalShow={cardModalShow}
        setCardModalShow={setCardModalShow}
        confirmBookingData={extend_booking_message}
        confirmBookingPayment={payment_type}
        closeButton={false}
      />

      <CancelBlockedModal
        show={show_cancel_blocked_modal}
        onHide={handleClose_cancel_blocked_modal}
        onModify={handleModifyFromBlocked}
        onPayNow={handlePayNowFromBlocked}
        bookingNumber={selected_booking_number_for_cancel}
      />
    </div>
}
    </>
  );
};

export default Booking;
