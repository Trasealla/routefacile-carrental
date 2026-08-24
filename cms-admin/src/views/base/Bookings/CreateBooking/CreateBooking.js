import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TbUser,
  TbUserPlus,
  TbSearch,
  TbCalendarEvent,
  TbCar,
  TbCheck,
  TbCircleCheck,
  TbArrowLeft,
  TbArrowRight,
  TbMapPin,
} from "react-icons/tb";

import {
  simpleGetCallAuth,
  simplePostCallAuth,
} from "../../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../../components/notify/notify";
import configWeb from "../../../../components/config.js/ConfigWeb";
import { fetchData, filterArrayByProperty } from "../../CustomHooks/reusableFunctions";
import "./CreateBooking.css";

const STEPS = ["customer", "trip", "car", "confirm"];

const EMPTY_NEW_CUSTOMER = {
  first_name: "",
  last_name: "",
  email: "",
  phone_code: "212",
  phone_number: "",
};

const EMPTY_TRIP = {
  booking_type: "daily",
  pickup_city_id: "",
  pickup_location_id: "",
  pickup_date: "",
  pickup_time: "10:00",
  dropoff_city_id: "",
  dropoff_location_id: "",
  dropoff_date: "",
  dropoff_time: "10:00",
  booking_months: 1,
  monthly_mileage: 3000,
};

const CreateBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  // ---- customer ----
  const [customerMode, setCustomerMode] = useState("existing");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState(EMPTY_NEW_CUSTOMER);

  // ---- trip ----
  const [trip, setTrip] = useState(EMPTY_TRIP);
  const [citiesArray, setCitiesArray] = useState([]);
  const [locationArray, setLocationArray] = useState([]);

  // ---- cars ----
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // ---- confirm ----
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    fetchData({ url: `${configWeb.GET_CITIES}?page_size=9999`, setter: setCitiesArray });
    fetchData({ url: configWeb.GET_LOCATIONS, setter: setLocationArray });
  }, []);

  const pickupLocations = useMemo(
    () => (trip.pickup_city_id ? filterArrayByProperty(locationArray, trip.pickup_city_id, "city_id") : []),
    [locationArray, trip.pickup_city_id]
  );
  const dropoffLocations = useMemo(
    () => (trip.dropoff_city_id ? filterArrayByProperty(locationArray, trip.dropoff_city_id, "city_id") : []),
    [locationArray, trip.dropoff_city_id]
  );

  const searchCustomers = (e) => {
    e?.preventDefault();
    setCustomerLoading(true);
    const params = new URLSearchParams({ page: 1, page_size: 10 });
    if (customerSearch) params.append("search", customerSearch);

    simpleGetCallAuth(`${configWeb.ADMIN_BOOKING_CUSTOMERS}?${params.toString()}`)
      .then((res) => setCustomerResults(res?.data || []))
      .catch(() => notifyError(t("common.somethingWentWrong")))
      .finally(() => setCustomerLoading(false));
  };

  useEffect(() => {
    searchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Returns a per-field error map so the form can point at exactly what's wrong,
  // rather than showing one generic "select a customer" toast for every failure.
  const validateCustomer = () => {
    if (customerMode === "existing") {
      return selectedCustomer ? {} : { _form: t("createBooking.selectCustomerFirst") };
    }

    const errors = {};
    if (!newCustomer.first_name.trim()) errors.first_name = t("createBooking.firstNameRequired");
    if (!newCustomer.last_name.trim()) errors.last_name = t("createBooking.lastNameRequired");
    if (!newCustomer.email.trim()) {
      errors.email = t("createBooking.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newCustomer.email.trim())) {
      errors.email = t("createBooking.emailInvalid");
    }
    if (!newCustomer.phone_code.trim()) errors.phone_code = t("createBooking.phoneCodeRequired");
    if (!newCustomer.phone_number.trim()) errors.phone_number = t("createBooking.phoneNumberRequired");
    return errors;
  };

  const validateTrip = () => {
    const errors = {};
    if (!trip.pickup_city_id) errors.pickup_city_id = t("createBooking.fieldRequired");
    if (!trip.pickup_location_id) errors.pickup_location_id = t("createBooking.fieldRequired");
    if (!trip.pickup_date) errors.pickup_date = t("createBooking.fieldRequired");
    if (!trip.pickup_time) errors.pickup_time = t("createBooking.fieldRequired");
    if (!trip.dropoff_city_id) errors.dropoff_city_id = t("createBooking.fieldRequired");
    if (!trip.dropoff_location_id) errors.dropoff_location_id = t("createBooking.fieldRequired");
    if (!trip.dropoff_date) errors.dropoff_date = t("createBooking.fieldRequired");
    if (!trip.dropoff_time) errors.dropoff_time = t("createBooking.fieldRequired");

    if (Object.keys(errors).length === 0) {
      const start = new Date(`${trip.pickup_date}T${trip.pickup_time}`);
      const end = new Date(`${trip.dropoff_date}T${trip.dropoff_time}`);
      if (end <= start) errors.dropoff_date = t("createBooking.dropoffAfterPickup");
    }
    return errors;
  };

  const searchCars = () => {
    setCarsLoading(true);
    setCars([]);
    setSelectedCar(null);

    // Uses the admin availability endpoint rather than the public car search, because
    // the retail one enforces per-location buffer hours / opening hours — rules that
    // would stop counter staff from serving a walk-in wanting a car right now.
    const body = {
      booking_type: trip.booking_type,
      pickup_type: "self",
      pickup_date: trip.pickup_date,
      pickup_time: trip.pickup_time,
      pickup_location_id: Number(trip.pickup_location_id),
      dropoff_type: "self",
      dropoff_date: trip.dropoff_date,
      dropoff_time: trip.dropoff_time,
      dropoff_location_id: Number(trip.dropoff_location_id),
    };
    if (trip.booking_type === "monthly") {
      body.booking_months = Number(trip.booking_months);
      body.monthly_mileage = Number(trip.monthly_mileage);
    }

    simplePostCallAuth(configWeb.ADMIN_BOOKING_AVAILABILITY, JSON.stringify(body))
      .then((res) => {
        if (res?.data) {
          setCars(res.data);
          if (res.data.length === 0) notifyError(t("createBooking.noCarsAvailable"));
        } else {
          const msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
          notifyError(msg || t("createBooking.noCarsAvailable"));
        }
      })
      .catch(() => notifyError(t("common.somethingWentWrong")))
      .finally(() => setCarsLoading(false));
  };

  const goNext = () => {
    if (step === 0) {
      const errors = validateCustomer();
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) {
        notifyError(errors._form || Object.values(errors)[0]);
        return;
      }
    }
    if (step === 1) {
      const errors = validateTrip();
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) {
        notifyError(Object.values(errors)[0]);
        return;
      }
      setFieldErrors({});
      setStep(2);
      searchCars();
      return;
    }
    if (step === 2 && !selectedCar) {
      notifyError(t("createBooking.selectCarFirst"));
      return;
    }
    setFieldErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      customer: customerMode === "existing"
        ? { user_id: selectedCustomer.id }
        : { ...newCustomer },
      booking_type: trip.booking_type,
      car_id: selectedCar.id,
      pickup_type: "self",
      pickup_date: trip.pickup_date,
      pickup_time: trip.pickup_time,
      pickup_location_id: Number(trip.pickup_location_id),
      dropoff_type: "self",
      dropoff_date: trip.dropoff_date,
      dropoff_time: trip.dropoff_time,
      dropoff_location_id: Number(trip.dropoff_location_id),
      mark_as_paid: markAsPaid,
    };
    if (comments.trim()) payload.comments = comments.trim();
    if (trip.booking_type === "monthly") {
      payload.booking_months = Number(trip.booking_months);
      payload.monthly_mileage = Number(trip.monthly_mileage);
    }

    simplePostCallAuth(configWeb.ADMIN_BOOKING_CREATE, JSON.stringify(payload))
      .then((res) => {
        if (res?.success && res?.data) {
          setCreatedBooking(res.data);
          notifySuccess(t("createBooking.bookingCreated"));
        } else {
          const msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
          notifyError(msg || t("common.somethingWentWrong"));
        }
      })
      .catch(() => notifyError(t("common.somethingWentWrong")))
      .finally(() => setSubmitting(false));
  };

  const resetAll = () => {
    setStep(0);
    setCustomerMode("existing");
    setSelectedCustomer(null);
    setNewCustomer(EMPTY_NEW_CUSTOMER);
    setTrip(EMPTY_TRIP);
    setCars([]);
    setSelectedCar(null);
    setMarkAsPaid(false);
    setComments("");
    setCreatedBooking(null);
  };

  const customerLabel = customerMode === "existing" && selectedCustomer
    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
    : `${newCustomer.first_name} ${newCustomer.last_name}`;
  const customerEmail = customerMode === "existing" && selectedCustomer
    ? selectedCustomer.email
    : newCustomer.email;

  const locationName = (id, list) => list.find((l) => String(l.id) === String(id))?.name_en || "-";

  // ---------------- success screen ----------------
  if (createdBooking) {
    return (
      <Container fluid className="rf-list-page cb-page">
        <div className="cb-success-card">
          <div className="cb-success-icon"><TbCircleCheck size={44} /></div>
          <h3>{t("createBooking.bookingCreated")}</h3>
          <div className="cb-success-number">{createdBooking.booking_number}</div>
          <div className="cb-success-meta">
            <div><span>{t("createBooking.customer")}</span><strong>{createdBooking.customer?.name}</strong></div>
            <div><span>{t("common.email")}</span><strong>{createdBooking.customer?.email}</strong></div>
            <div><span>{t("createBooking.totalAmount")}</span><strong>MAD {Number(createdBooking.total_amount || 0).toFixed(2)}</strong></div>
            <div>
              <span>{t("createBooking.paymentStatus")}</span>
              <strong className={createdBooking.payment_status ? "cb-paid" : "cb-unpaid"}>
                {createdBooking.payment_status ? t("createBooking.paid") : t("createBooking.unpaid")}
              </strong>
            </div>
          </div>
          <div className="cb-success-actions">
            <Button className="rf-outline-btn" onClick={resetAll}>
              <TbUserPlus size={16} className="me-1" /> {t("createBooking.createAnother")}
            </Button>
            <Button className="rf-submit-btn" onClick={() => navigate("/bookings")}>
              {t("createBooking.goToBookings")}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="rf-list-page cb-page">
      <div className="rf-page-header">
        <div className="rf-page-heading">
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {t("createBooking.title")}
          </h3>
          <p className="rf-page-sub">{t("createBooking.subtitle")}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="cb-stepper">
        {[
          { icon: <TbUser size={18} />, label: t("createBooking.stepCustomer") },
          { icon: <TbCalendarEvent size={18} />, label: t("createBooking.stepTrip") },
          { icon: <TbCar size={18} />, label: t("createBooking.stepCar") },
          { icon: <TbCheck size={18} />, label: t("createBooking.stepConfirm") },
        ].map((s, i) => (
          <div key={i} className={`cb-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
            <div className="cb-step-icon">{i < step ? <TbCheck size={18} /> : s.icon}</div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1 — CUSTOMER */}
      {step === 0 && (
        <div className="rf-form-card cb-card">
          <div className="cb-mode-toggle">
            <button
              type="button"
              className={customerMode === "existing" ? "active" : ""}
              onClick={() => setCustomerMode("existing")}
            >
              <TbUser size={16} /> {t("createBooking.existingCustomer")}
            </button>
            <button
              type="button"
              className={customerMode === "new" ? "active" : ""}
              onClick={() => setCustomerMode("new")}
            >
              <TbUserPlus size={16} /> {t("createBooking.newCustomer")}
            </button>
          </div>

          {customerMode === "existing" ? (
            <>
              <Form onSubmit={searchCustomers}>
                <Row className="align-items-end mb-3">
                  <Col lg="6">
                    <Form.Group>
                      <Form.Label>{t("createBooking.searchCustomer")}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t("createBooking.searchCustomerPlaceholder")}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="2">
                    <Button type="submit" className="rf-add-btn w-100">
                      <TbSearch size={16} className="me-1" /> {t("common.search")}
                    </Button>
                  </Col>
                </Row>
              </Form>

              <div className="cb-customer-list">
                {customerLoading ? (
                  <div className="text-center py-4"><Spinner /></div>
                ) : customerResults.length === 0 ? (
                  <div className="cb-empty">{t("createBooking.noCustomersFound")}</div>
                ) : (
                  customerResults.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className={`cb-customer-row ${selectedCustomer?.id === c.id ? "selected" : ""}`}
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <div className="cb-customer-avatar">{(c.first_name?.[0] || "?").toUpperCase()}</div>
                      <div className="cb-customer-info">
                        <div className="cb-customer-name">{c.first_name} {c.last_name}</div>
                        <div className="cb-customer-sub">{c.email} · +{c.phone_code} {c.phone_number}</div>
                      </div>
                      {selectedCustomer?.id === c.id && <TbCircleCheck size={20} className="cb-customer-check" />}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>{t("createBooking.firstName")}</Form.Label>
                  <Form.Control
                    value={newCustomer.first_name}
                    isInvalid={!!fieldErrors.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.first_name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>{t("createBooking.lastName")}</Form.Label>
                  <Form.Control
                    value={newCustomer.last_name}
                    isInvalid={!!fieldErrors.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.last_name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>{t("common.email")}</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={newCustomer.email}
                    isInvalid={!!fieldErrors.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                  <Form.Text className="text-muted">{t("createBooking.emailMatchHint")}</Form.Text>
                </Form.Group>
              </Col>
              <Col md="2">
                <Form.Group className="mb-3">
                  <Form.Label>{t("createBooking.phoneCode")}</Form.Label>
                  <Form.Control
                    value={newCustomer.phone_code}
                    isInvalid={!!fieldErrors.phone_code}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone_code: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.phone_code}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>{t("createBooking.phoneNumber")}</Form.Label>
                  <Form.Control
                    value={newCustomer.phone_number}
                    isInvalid={!!fieldErrors.phone_number}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.phone_number}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}
        </div>
      )}

      {/* STEP 2 — TRIP */}
      {step === 1 && (
        <div className="rf-form-card cb-card">
          <Row>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>{t("createBooking.bookingType")}</Form.Label>
                <Form.Select
                  value={trip.booking_type}
                  onChange={(e) => setTrip({ ...trip, booking_type: e.target.value })}
                >
                  <option value="daily">{t("createBooking.daily")}</option>
                  <option value="monthly">{t("createBooking.monthly")}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {trip.booking_type === "monthly" && (
              <>
                <Col md="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("createBooking.months")}</Form.Label>
                    <Form.Select
                      value={trip.booking_months}
                      onChange={(e) => setTrip({ ...trip, booking_months: e.target.value })}
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("createBooking.monthlyMileage")}</Form.Label>
                    <Form.Select
                      value={trip.monthly_mileage}
                      onChange={(e) => setTrip({ ...trip, monthly_mileage: e.target.value })}
                    >
                      {[3000, 4000, 5000, 6000].map((m) => (
                        <option key={m} value={m}>{m} km</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>

          <div className="cb-section-label"><TbMapPin size={16} /> {t("createBooking.pickup")}</div>
          <Row>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("common.city")}</Form.Label>
                <Form.Select
                  value={trip.pickup_city_id}
                  isInvalid={!!fieldErrors.pickup_city_id}
                  onChange={(e) => setTrip({ ...trip, pickup_city_id: e.target.value, pickup_location_id: "" })}
                >
                  <option value="">{t("common.select")}</option>
                  {citiesArray.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{fieldErrors.pickup_city_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("createBooking.location")}</Form.Label>
                <Form.Select
                  value={trip.pickup_location_id}
                  isInvalid={!!fieldErrors.pickup_location_id}
                  disabled={!trip.pickup_city_id}
                  onChange={(e) => setTrip({ ...trip, pickup_location_id: e.target.value })}
                >
                  <option value="">{t("common.select")}</option>
                  {pickupLocations.map((l) => <option key={l.id} value={l.id}>{l.name_en}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{fieldErrors.pickup_location_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("createBooking.date")}</Form.Label>
                <Form.Control
                  type="date"
                  value={trip.pickup_date}
                  isInvalid={!!fieldErrors.pickup_date}
                  onChange={(e) => setTrip({ ...trip, pickup_date: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.pickup_date}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("createBooking.time")}</Form.Label>
                <Form.Control
                  type="time"
                  value={trip.pickup_time}
                  isInvalid={!!fieldErrors.pickup_time}
                  onChange={(e) => setTrip({ ...trip, pickup_time: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.pickup_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="cb-section-label"><TbMapPin size={16} /> {t("createBooking.dropoff")}</div>
          <Row>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("common.city")}</Form.Label>
                <Form.Select
                  value={trip.dropoff_city_id}
                  isInvalid={!!fieldErrors.dropoff_city_id}
                  onChange={(e) => setTrip({ ...trip, dropoff_city_id: e.target.value, dropoff_location_id: "" })}
                >
                  <option value="">{t("common.select")}</option>
                  {citiesArray.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{fieldErrors.dropoff_city_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("createBooking.location")}</Form.Label>
                <Form.Select
                  value={trip.dropoff_location_id}
                  isInvalid={!!fieldErrors.dropoff_location_id}
                  disabled={!trip.dropoff_city_id}
                  onChange={(e) => setTrip({ ...trip, dropoff_location_id: e.target.value })}
                >
                  <option value="">{t("common.select")}</option>
                  {dropoffLocations.map((l) => <option key={l.id} value={l.id}>{l.name_en}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{fieldErrors.dropoff_location_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("createBooking.date")}</Form.Label>
                <Form.Control
                  type="date"
                  value={trip.dropoff_date}
                  isInvalid={!!fieldErrors.dropoff_date}
                  onChange={(e) => setTrip({ ...trip, dropoff_date: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.dropoff_date}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="3">
              <Form.Group className="mb-3">
                <Form.Label>{t("createBooking.time")}</Form.Label>
                <Form.Control
                  type="time"
                  value={trip.dropoff_time}
                  isInvalid={!!fieldErrors.dropoff_time}
                  onChange={(e) => setTrip({ ...trip, dropoff_time: e.target.value })}
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.dropoff_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {/* STEP 3 — CAR */}
      {step === 2 && (
        <div className="rf-form-card cb-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="cb-section-label mb-0"><TbCar size={16} /> {t("createBooking.availableCars")}</div>
            <Button className="rf-outline-btn" onClick={searchCars} disabled={carsLoading}>
              {carsLoading ? <Spinner size="sm" /> : t("createBooking.refreshCars")}
            </Button>
          </div>

          {carsLoading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : cars.length === 0 ? (
            <div className="cb-empty">{t("createBooking.noCarsAvailable")}</div>
          ) : (
            <div className="cb-car-grid">
              {cars.map((car) => (
                <button
                  type="button"
                  key={car.id}
                  className={`cb-car-card ${selectedCar?.id === car.id ? "selected" : ""}`}
                  onClick={() => setSelectedCar(car)}
                >
                  {car.image && <img src={car.image} alt={car.car_name} className="cb-car-img" />}
                  <div className="cb-car-body">
                    <div className="cb-car-name">{car.car_name}</div>
                    <div className="cb-car-cat">{car.category} · {car.transmission}</div>
                    <div className="cb-car-price">
                      MAD {Number(car.pay_later ?? car.car_rate_total ?? 0).toFixed(2)}
                    </div>
                  </div>
                  {selectedCar?.id === car.id && <TbCircleCheck size={22} className="cb-car-check" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 4 — CONFIRM */}
      {step === 3 && (
        <div className="rf-form-card cb-card">
          <div className="cb-section-label"><TbCheck size={16} /> {t("createBooking.reviewBooking")}</div>

          <Table className="cb-review-table">
            <tbody>
              <tr>
                <td>{t("createBooking.customer")}</td>
                <td><strong>{customerLabel}</strong><div className="text-muted small">{customerEmail}</div></td>
              </tr>
              <tr>
                <td>{t("createBooking.bookingType")}</td>
                <td>{trip.booking_type === "daily" ? t("createBooking.daily") : `${t("createBooking.monthly")} (${trip.booking_months})`}</td>
              </tr>
              <tr>
                <td>{t("createBooking.pickup")}</td>
                <td>{locationName(trip.pickup_location_id, locationArray)} — {trip.pickup_date} {trip.pickup_time}</td>
              </tr>
              <tr>
                <td>{t("createBooking.dropoff")}</td>
                <td>{locationName(trip.dropoff_location_id, locationArray)} — {trip.dropoff_date} {trip.dropoff_time}</td>
              </tr>
              <tr>
                <td>{t("createBooking.car")}</td>
                <td><strong>{selectedCar?.car_name}</strong></td>
              </tr>
              <tr className="cb-review-total">
                <td>{t("createBooking.estimatedTotal")}</td>
                <td><strong>MAD {Number(selectedCar?.pay_later ?? selectedCar?.car_rate_total ?? 0).toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </Table>

          <Form.Group className="mb-3">
            <Form.Label>{t("createBooking.comments")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t("createBooking.commentsPlaceholder")}
            />
          </Form.Group>

          <div className="cb-paid-toggle">
            <Form.Check
              type="switch"
              id="cb-mark-paid"
              checked={markAsPaid}
              onChange={(e) => setMarkAsPaid(e.target.checked)}
              label={t("createBooking.markAsPaid")}
            />
            <div className="cb-paid-hint">{t("createBooking.markAsPaidHint")}</div>
          </div>
        </div>
      )}

      {/* Footer nav */}
      <div className="cb-footer">
        <Button className="rf-outline-btn" onClick={goBack} disabled={step === 0 || submitting}>
          <TbArrowLeft size={16} className="me-1" /> {t("createBooking.back")}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button className="rf-submit-btn" onClick={goNext}>
            {t("createBooking.next")} <TbArrowRight size={16} className="ms-1" />
          </Button>
        ) : (
          <Button className="rf-submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : <><TbCheck size={16} className="me-1" /> {t("createBooking.createBooking")}</>}
          </Button>
        )}
      </div>
    </Container>
  );
};

export default CreateBooking;
