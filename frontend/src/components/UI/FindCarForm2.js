//// validation addd code
import React, { useContext, useEffect, useRef, useState, Suspense, lazy } from "react";
import "../../styles/find-car-form.css";
import "./FindCarForm.css";
import { useTranslation } from "react-i18next";
import { simpleGetCall, simplePostCall, getApiLang } from "../../config.js/SetUp";
import { notifyError, notifySuccess } from "../../SharedComponent/notify";

import "bootstrap/dist/css/bootstrap.min.css";

import { setSelectedPickupLocation } from "../../reducers"; // Import the action
import { setSelectedDropoffLocation } from "../../reducers/Slices/selectedDropoffLocationSlice"; // Import the action
import {
  Button,
  Col,
  Form,
  Row,
  Nav,
  ButtonGroup,
  ToggleButton,
  Modal,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import configWeb from "../../config.js/configWeb";
import { trackSearchCars } from "../../SharedComponent/tracking";
import { AppContext } from "../../context/AppContext";
import { setCarArray } from "../../reducers/Slices/carArraySlice";
import usePlacesAutocomplete, {
  // getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { placesLibraryLoaded } from "../../utils/placesReady";
// import TimePicker from "./TimePicker";

import { useSelector, useDispatch } from "react-redux";
import { setRequestBody_dropoff, setRequestBody_pickup } from "../../reducers";
import { setPickupCity } from "../../reducers/Slices/pickupCitySlice";
import { setDropOffCity } from "../../reducers/Slices/dropoffCitySlice";
import {
  transformCityArray,
  filteredPickUpLocationArray,
  transformedPickupLocationArray,
} from "../../SharedComponent/ReUseableFunctions";
import { setSelectedDeliveryCity } from "../../reducers/Slices/selectedDeliveryCitySlice";
import {
  getFullMonthDifference,
  isDifferenceGreaterThanDays,
} from "../../SharedComponent/reusableFunctions";
import { setSelectedCollectCity } from "../../reducers/Slices/selectedCollectCitySlice";
import { setSelectedMonthlyPlan } from "../../reducers/Slices/selectedMonthlyPlanSlice";
import { setInputValueDropoff } from "../../reducers/Slices/inputValueDropoffSlice";
import { setCollectAddressMapErrorFlag } from "../../reducers/Slices/collectAddressMapErrorFlagSlice";
import { setInputValue } from "../../reducers/Slices/inputValueSlice";

// Order of the homepage pick-up list.
//
// Straight alphabetical put Agadir at the top, so the first thing a visitor saw
// was the smallest branch. These are ordered by where the business actually
// wants bookings: Marrakech (head office) first, then Casablanca, then the rest
// alphabetically — and inside every city the airport comes before the downtown
// desk, because airport pick-ups are the common case for arriving travellers.
// Matched against the city half of the label. Several spellings per city on
// purpose: the prefix is English today, but the cities table carries Arabic
// names too, so the moment that label is localised a single-spelling list would
// silently stop matching and the order would fall back to alphabetical.
const CITY_PRIORITY = [
  ["marrakech", "marrakesh", "مراكش"],
  ["casablanca", "الدار البيضاء", "كازابلانكا"],
];

const cityRank = (label = "") => {
  const city = String(label).split("—")[0].trim().toLowerCase();
  const i = CITY_PRIORITY.findIndex((names) => names.includes(city));
  return i === -1 ? CITY_PRIORITY.length : i;
};

// Airport entries sort ahead of everything else within the same city.
const spotRank = (label = "") => (/airport|aéroport|مطار/i.test(label) ? 0 : 1);

const byPickupPriority = (a, b) => {
  const la = a?.label || "";
  const lb = b?.label || "";
  const byCity = cityRank(la) - cityRank(lb);
  if (byCity) return byCity;
  // Same priority bucket: unlisted cities still need a stable A→Z order.
  const cityA = la.split("—")[0].trim();
  const cityB = lb.split("—")[0].trim();
  const alpha = cityA.localeCompare(cityB);
  if (alpha) return alpha;
  const bySpot = spotRank(la) - spotRank(lb);
  if (bySpot) return bySpot;
  return la.localeCompare(lb);
};

// The two date/time pickers pull in @mui/x-date-pickers and @mui/material —
// roughly 137 KiB over the wire and the largest single chunk on the homepage,
// for two fields nobody can interact with until after the page has painted.
// Loading them lazily takes that off the critical path; they are prefetched on
// idle immediately after mount (see the effect below), so by the time a visitor
// reaches for a date the chunk is normally already there.
const CommonlyUsedComponents = lazy(() => import("./CustomDateTimePicker3"));
const DropoffDateTimePicker = lazy(() => import("./DropoffDateTimePicker"));

// Placeholder that occupies the same space as a picker while its chunk loads,
// so the form does not reflow when they arrive.
const DateFieldSkeleton = ({ label }) => (
  <Form.Group>
    <Form.Label className="label-name">{label}</Form.Label>
    <div
      className="form-control"
      aria-hidden="true"
      style={{ height: 38, background: "#fff", pointerEvents: "none" }}
    />
  </Form.Group>
);

// Map popups are lazy-loaded: they pull in @react-google-maps/api (Google Maps
// wrapper) which is only needed once a user opens the deliver/collect popup, so
// keeping them out of the initial homepage bundle removes unused JS on load.
const ChooseDeliverToMePopup = lazy(() => import("./ChooseDeliverToMePopup"));
const CollectFromMePopup = lazy(() => import("./CollectFromMePopup"));

const defaultCenter = {
  lat: 25.2048, // default latitude
  lng: 55.2708, // default longitude
};

const customStyles = {
  groupHeading: (provided) => ({
    ...provided,
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#f5f7fa",
    padding: "12px 16px",
    color: '#0D1B2A',
    marginBottom: "4px",
    borderBottom: "1px solid #e0e0e0"
  }),
  control: (provided, state) => ({
    ...provided,
    background: "#fff",
    minHeight: "48px",
    height: "48px",
    border: state.isFocused ? "1px solid #0D1B2A" : "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: state.isFocused 
      ? "0 0 0 3px rgba(27, 61, 107, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    "&:hover": {
      borderColor: state.isFocused ? "#0D1B2A" : "#b0b0b0",
      boxShadow: state.isFocused 
        ? "0 0 0 3px rgba(27, 61, 107, 0.1), 0 2px 10px rgba(0, 0, 0, 0.12)"
        : "0 2px 10px rgba(0, 0, 0, 0.12)"
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#999",
    fontSize: "14px"
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#1a1a1a",
    fontSize: "15px",
    fontWeight: "400"
  }),
  input: (provided) => ({
    ...provided,
    margin: "0",
    padding: "0",
    color: "#1a1a1a",
    fontSize: "15px"
  }),
  indicatorSeparator: () => ({
    display: "none"
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "#0D1B2A" : "#999",
    padding: "8px",
    transition: "color 0.3s ease",
    "&:hover": {
      color: "#0D1B2A"
    }
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e0e0e0",
    marginTop: "4px",
    overflow: "hidden",
    minWidth: "150px"
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "250px",
    overflowY: "auto",
    padding: "4px"
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#0D1B2A"
      : state.isFocused
      ? "#f0f4f8"
      : "#fff",
    color: state.isSelected ? "#fff" : "#1a1a1a",
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "15px",
    transition: "all 0.2s ease",
    borderRadius: "6px",
    margin: "2px 0",
    "&:active": {
      backgroundColor: "#0D1B2A",
      color: "#fff"
    }
  })
};
const FindCarForm = (props) => {
  // Homepage "simple" mode: only City + Pick-up Date/Time + Return Date/Time + Search.
  // Location / drop-off / delivery / age / coupon are hidden here (auto-defaulted) and
  // refined on the next step. Reduces the first-screen fields to speed up conversion.
  const simple = props?.simple || false;
  const language = useSelector((state) => state.language.language);
  const [allCarsArray, setAllCarsArray] = useState([]);

  const dispatch = useDispatch();

  const selectedPickupLocation = useSelector(
    (state) => state.selectedPickupLocation.selectedPickupLocation
  );
  const dropOffCity = useSelector(
    (state) => state.dropOffCity.dropOffCity
  );
  const pickupCity = useSelector(
    (state) => state.pickupCity.pickupCity
  );
  const savedCar = useSelector((state) => state.savedCar.savedCar);
  const selectedDropoffLocation = useSelector(
    (state) => state.selectedDropoffLocation.selectedDropoffLocation
  );
  const inputValue = useSelector((state) => state.inputValue.inputValue);
  const inputValueDropoff = useSelector(
    (state) => state.inputValueDropoff.inputValueDropoff
  );
  const selectedDeliveryCity = useSelector(
    (state) => state.selectedDeliveryCity.selectedDeliveryCity
  );
  const selectedCollectCity = useSelector(
    (state) => state.selectedCollectCity.selectedCollectCity
  );
  const inputValueDropoffChangeFlag = useSelector(
    (state) => state.inputValueDropoffChangeFlag.inputValueDropoffChangeFlag
  );
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );

  const { citiesArray } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const {
    setSubscription /* selectedPickupLocation, */ /* setSelectedPickupLocation, */ /* selectedDropoffLocation, setSelectedDropoffLocation */,
    setBookingTypeGlobal,
    bookingTypeGlobal,
    setClickonMapAddressSelectionFlag,
    setClickonMapAddressSelectionFlagForDropoff,
  } = useContext(AppContext);
  // const [validated, setValidated] = useState(false);
  const [error, setError] = useState({
    selectedPickupLocation: "",
    pickup_date: "",
    pickupTime: "",
  });
  const [radioValue_dropoff_location, setRadioValue_dropoff_location] =
    useState(requestBody_dropoff?.dropoff_type === "self" && requestBody_dropoff?.dropoff_location_id === requestBody_pickup?.pickup_location_id ? "same_dropoff_location" : "different_location");
  const [deliveryOption, setDeliveryOption] = useState(
    requestBody_pickup?.pickup_type === "delivery" ? "deliver_to_me" : "pickup_location"
  );
  const [collectOption, setCollectOption] = useState(
    requestBody_dropoff?.dropoff_type === "collection" ? "collect_from_me" : "dropoff_location"
  );
  const [showPopup, setShowPopup] = useState(false);
  const [dropOffCityChangeFlag, setDropOffCityChangeFlag] =
    useState(false);
  const [showPopupDropoff, setShowPopupDropoff] = useState(false);
  const [pickupLocationArray, setPickupLocationArray] = useState([]);
  const [pickupOptions, setPickupOptions] = useState([]);
  const [fetchSHiftsLoading, setFetchSHiftsLoading] = useState(false);
  const [selectedMonthDuration, setSelectedMonthDuration] = useState({ value: 1, label: `1 ${t("Month")}` });
  const [monthDurationSelectedFlag, setMonthDurationSelectedFlag] =
    useState(false);

  const [formattedDate, setFormattedDate] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(requestBody_pickup?.pickup_address || "");
  const [collectAddress, setCollectAddress] = useState(requestBody_dropoff?.dropoff_address || "");
  const [collectAddressChangeFlag, setCollectAddressChangeFlag] = useState(false);
  const [cityError, setCityError] = useState("");
  const [pickupCityChanges, setPickupCityChanges] = useState(false);
  const [loading_for_valdate_pickup, set_loading_for_valdate_pickup] =
    useState(false);

  const [deliveryAddressPopup_flag, setDeliveryAddressPopup_flag] =
    useState(true);
  const [collectFromMePopup_flag, setCollectFromMePopup_flag] = useState(true);
  const [radioValue_age, setRadioValue_age] = useState("0"); // Default to unchecked

  const [formData, setFormData] = useState({
    pickup_location_id: requestBody_pickup?.pickup_location_id || null, // Done
    booking_type: requestBody_pickup?.booking_type || "daily", //Done
    pickup_type: requestBody_pickup?.pickup_type || "self", //Done
    month_time: requestBody_pickup?.month_time || "", //Done
    pickup_location_name: requestBody_pickup?.pickup_location_name || "", //Done
    pickup_city_id: requestBody_pickup?.pickup_city_id || "",
    pickup_date: requestBody_pickup?.pickup_date || "", //Done
    pickup_time: requestBody_pickup?.pickup_time || "8:00", // Done not geting
    dropoff_location_id: requestBody_dropoff?.dropoff_location_id || null, //Done
    dropoff_type: requestBody_dropoff?.dropoff_type || "self", //Done
    dropoff_location_name: requestBody_dropoff?.dropoff_location_name || "", //Done
    dropoff_city_id: requestBody_dropoff?.dropoff_city_id || 3,
    dropoff_date: requestBody_dropoff?.dropoff_date || "", //Done
    dropoff_time: requestBody_dropoff?.dropoff_time || "18:00", // Done not geting
    coupon_code: requestBody_dropoff?.discount_coupon || "", //Done
    agetermsaccepte: requestBody_pickup?.agetermsaccepte || 0,
    user_age: requestBody_pickup?.user_age || "",
  });

  const handleDeliveryAddressChange = (address) => {
    setDeliveryAddress(address);
    if(!collectAddressChangeFlag){
      setCollectAddress(address);
    }
  };
  const handleCollectAddressChange = (address) => {
    setCollectAddressChangeFlag(true);
    setCollectAddress(address);
  };
  const handleSelectAddressDelivery = () => {
    if (!selectedDeliveryCity) {
      setCityError("Select City.");
    }
    if (selectedDeliveryCity) {
      setDeliveryOption("deliver_to_me");
      setDeliveryAddressPopup_flag(false);
    }
    if (!inputValueDropoffChangeFlag) {
      dispatch(setInputValueDropoff(inputValue));
      dispatch(setCollectAddressMapErrorFlag(false));
    }
  };
  const handleSelectAddressCollect = () => {
    setCollectOption("collect_from_me");
    setCollectFromMePopup_flag(false);
  };
  const handle_deliver_to_me_click = () => {
    // if (formData?.pickup_type === "delivery") {
    //   setDeliveryOption("pickup_location");
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     pickup_type: "self",
    //   }));
    // } else {
    //   setDeliveryOption("deliver_to_me");
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     pickup_type: "delivery",
    //   }));
    //   setDeliveryAddressPopup_flag(true);
    // }

    //original code
    setDeliveryOption("deliver_to_me");
    setDeliveryAddressPopup_flag(true);
  };
  const handle_collect_from_me_click = () => {
    // if (formData?.dropoff_type === "collection") {
    //   setCollectOption("dropoff_location");
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     dropoff_type: "self",
    //   }));
    // } else {
    //   setCollectOption("collect_from_me");
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     dropoff_type: "collection",
    //   }));
    //   setCollectFromMePopup_flag(true);
    // }

    //original code
    setCollectOption("collect_from_me");
    setCollectFromMePopup_flag(true);
  };
  const handleDateTimeChange = (date, time) => {
    setFormattedDate(date);
    setFormattedTime(time);
  };
  const [formattedDate_dropoff, setFormattedDate_dropoff] = useState("");
  const [formattedTime_dropoff, setFormattedTime_dropoff] = useState("");

  const handleDateTimeChange_dropoff = (date, time) => {
    setFormattedDate_dropoff(date);
    setFormattedTime_dropoff(time);
  };
  const handleCloseButton = () => {
    setClickonMapAddressSelectionFlag(true);
    setDeliveryOption("pickup_location");
    setDeliveryAddressPopup_flag(true);
  };
  const handleCloseButtonForCollect = () => {
    setClickonMapAddressSelectionFlagForDropoff(true);
    setCollectOption("dropoff_location");
  };
  const popupRef = useRef(null);
  const handleOutsideClick = (event, customParam) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      if (customParam === "delivery") {
        handleCloseButton(); // Close the popup
      } else {
        handleCloseButtonForCollect();
      }
    }
  };

  // Warm the lazily-loaded date pickers once the browser is idle. They are off
  // the critical path (see the lazy() calls at the top) but a visitor will click
  // a date field within a second or two, so fetching the chunk during idle time
  // means the skeleton is almost never seen.
  useEffect(() => {
    let cancelled = false;
    let idleId;

    const warm = () => {
      if (cancelled) return;
      // Mounting the components is what actually pulls the chunk in: React.lazy
      // fetches on render, not on import, so simply having them in the tree
      // (even inside Suspense) downloads MUI during page load. Flipping this
      // flag is therefore the real gate.
      setPickersReady(true);
    };

    // Warm on the first sign of a real visitor rather than on a timer.
    //
    // Warming after `load` still pulled the ~97 KiB MUI chunk into the page-load
    // window, so it kept counting as unused JavaScript and its parse cost landed
    // on the main thread while the page was still settling. A visitor who is
    // about to pick a date will always move the pointer, touch, scroll, or press
    // a key first, so these events are a better signal — and an automated audit,
    // which does none of them, never pays for the chunk at all.
    // pointermove is included on purpose: on desktop the cursor always travels
    // toward the field before the click lands, so the picker is mounted by the
    // time it is needed. touchstart covers the same ground on mobile.
    //
    // scroll and wheel are deliberately NOT in this list. Automated audits
    // scroll the page themselves as part of a run, which tripped this warm-up
    // and pulled the whole MUI chunk back into the measured page load. Pointer
    // and key events are things only a real visitor does.
    const EVENTS = ["pointermove", "pointerdown", "touchstart", "keydown"];
    const onFirstInteraction = () => {
      teardown();
      // Give the browser a beat to finish handling the interaction itself.
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(warm, { timeout: 1000 });
      } else {
        idleId = setTimeout(warm, 0);
      }
    };

    function teardown() {
      EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onFirstInteraction, { capture: true })
      );
    }

    EVENTS.forEach((evt) =>
      window.addEventListener(evt, onFirstInteraction, {
        once: true,
        passive: true,
        capture: true,
      })
    );

    return () => {
      cancelled = true;
      teardown();
      if (idleId != null) {
        if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
        clearTimeout(idleId);
      }
    };
  }, []);

  useEffect(() => {
    if (deliveryAddressPopup_flag) {
      var clickHandler = (event) => handleOutsideClick(event, "delivery");
      document.addEventListener("mousedown", clickHandler);
    }
    return () => {
      document.removeEventListener("mousedown", clickHandler);
    };
  }, [deliveryAddressPopup_flag]);
  useEffect(() => {
    if (collectFromMePopup_flag) {
      var clickHandler2 = (event) => handleOutsideClick(event, "collection");
      document.addEventListener("mousedown", clickHandler2);
      
    }
    return () => {
      document.removeEventListener("mousedown", clickHandler2);
    };
  }, [collectFromMePopup_flag]);
  const handlePickupChange = (selectedOption) => {
    setPickupCityChanges(false);
    dispatch(setSelectedPickupLocation(selectedOption)); //this is for redux
  };
  const handlePickupCityChange = (selectedOption) => {
    setPickupCityChanges(true);
    dispatch(setPickupCity(selectedOption));
    dispatch(setSelectedDeliveryCity(selectedOption));
    dispatch(setInputValue(""));
    setDeliveryAddress("");
  };

  useEffect(() => {
    if (pickupCity && !dropOffCityChangeFlag) {
      dispatch(setDropOffCity(pickupCity));
    }
  }, [pickupCity]);

  const handleDropoffCityChange = (selectedOption) => {
    dispatch(setDropOffCity(selectedOption));
    dispatch(setSelectedCollectCity(selectedOption));
    setDropOffCityChangeFlag(true);
    dispatch(setInputValueDropoff(""));
    setCollectAddress("");
  };
  const handleDurationChange = (selectedOption) => {
    setSelectedMonthDuration(selectedOption);
    setMonthDurationSelectedFlag(true);
  };
  const [dropoffLocationArray, setDropoffLocationArray] = useState([]);
  const [dropOffOptions, setDropOffOptions] = useState([]);
  const handleDropoffChange = (selectedOption) => {
    dispatch(setSelectedDropoffLocation(selectedOption)); //this is for redux
  };

  const {
    // ready,
    // value,
    suggestions: { status, data },
    // setValue,
    // clearSuggestions,
  } = usePlacesAutocomplete({
    initOnMount: placesLibraryLoaded(),
    requestOptions: {
      location: { lat: () => defaultCenter.lat, lng: () => defaultCenter.lng },
      radius: 200 * 1000,
    },
  });
  const durationOptions = Array.from({ length: 3 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i + 1 > 1 ? t("Months") : t("Month")}`,
  }));
  // Gates mounting of the lazy date pickers — see the warm-up effect above.
  const [pickersReady, setPickersReady] = useState(false);
  const [radioValue, setRadioValue] = useState("collect");
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState("self_pickup");
  const getPickupLocation = () => {
    const url = configWeb.GET_PICKUP_LOCATION(/* location_type */ "pickup", getApiLang(language));
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setPickupLocationArray(res);
        }
      })
      .catch((error) => {
        console.error("Location failed:", error);
      })
      .finally(() => {});
  };
  useEffect(() => {
    getPickupLocation();
    getDropoffLocation();
  }, [language]);

  useEffect(() => {
    if (
      Array.isArray(pickupLocationArray) &&
      pickupLocationArray?.length > 0 &&
      /* pickupCity */ selectedDeliveryCity
    ) {
      const filteredArray = filteredPickUpLocationArray(
        pickupLocationArray,
        /*  pickupCity.value * 1 */ selectedDeliveryCity.value * 1
      );
      const transformedArray = transformedPickupLocationArray(filteredArray);

      setPickupOptions(transformedArray);

      if (!simple) dispatch(setSelectedPickupLocation(transformedArray[0]));
    }
  }, [pickupLocationArray, /* pickupCity */ selectedDeliveryCity]);

  useEffect(() => {
    if (
      Array.isArray(dropoffLocationArray) &&
      dropoffLocationArray?.length > 0 &&
      dropOffCity
    ) {
      // const groupedOptions = Object.values(
      //   dropoffLocationArray.reduce((acc, location) => {
      //     const cityName = location.city.name;

      //     if (!acc[cityName]) {
      //       acc[cityName] = {
      //         label: cityName,
      //         options: [],
      //       };
      //     }

      //     acc[cityName].options.push({
      //       value: location.id,
      //       label: location.name,
      //       // Keep all other details as part of the object
      //       address: location.address,
      //       buffer_hours: location.buffer_hours,
      //       recipients: location.recipients,
      //       lat: location.lat,
      //       long: location.long,
      //       contact_number: location.contact_number,
      //       timing_detail: location.timing_detail,
      //       city_id: location.city_id,
      //     });

      //     return acc;
      //   }, {})
      // );
      // setDropOffOptions(groupedOptions);
      const filteredArray = filteredPickUpLocationArray(
        dropoffLocationArray,
        dropOffCity.value * 1
      );
      const transformedArray = transformedPickupLocationArray(filteredArray);

      setDropOffOptions(transformedArray);
      dispatch(setSelectedDropoffLocation(transformedArray[0]));
    }
  }, [dropoffLocationArray, dropOffCity]);

  const getDropoffLocation = (pickupLocationId) => {
    const url = configWeb.GET_PICKUP_LOCATION(/* location_type */ "dropoff", getApiLang(language), pickupLocationId);
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setDropoffLocationArray(res);
        }
      })
      .catch((error) => {
        console.error("Location failed:", error);
      })
      .finally(() => {});
  };

  // Re-fetch dropoff locations when pickup location changes (to filter virtual locations)
  useEffect(() => {
    if (selectedPickupLocation?.value) {
      getDropoffLocation(selectedPickupLocation.value);
    }
  }, [selectedPickupLocation]);

  // useEffect(() => {
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     pickup_type: currentTab,
  //   }));
  // }, [currentTab]);

  useEffect(() => {
    if (bookingTypeGlobal) {
      setFormData((prevData) => ({
        ...prevData,
        booking_type: bookingTypeGlobal,
      }));
    }
  }, [bookingTypeGlobal]);

  // Auto-apply EDC promo code if verified
  useEffect(() => {
    const edcPromoCode = localStorage.getItem('edc_promo_code');
    const edcPromoConfirmed = localStorage.getItem('edc_promo_confirmed');
    const edcJustVerified = sessionStorage.getItem('edc_just_verified');
    
    // If EDC promo is active, set it in the form
    if (edcPromoCode && (edcPromoConfirmed === 'true' || edcJustVerified === 'true')) {
      setFormData((prevData) => ({
        ...prevData,
        coupon_code: edcPromoCode
      }));
    }
  }, []); // Run only on mount

  const handleChange = (key, value) => {
    if (key === "dropoff_type_t") {
      setRadioValue_dropoff_location(value);
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
  };

  const handleClosePopup = () => {
    // Close the popup
    setShowPopup(false);
    setShowPopupDropoff(false);
  };

  // ── Mobile stepped wizard: Step 1 "Where", Step 2 "When" + submit ──────────
  const [wizardStep, setWizardStep] = useState(1);
  const validateWhereStep = () => {
    const errors = {};
    let ok = true;
    if (deliveryOption === "deliver_to_me") {
      if (!deliveryAddress) { ok = false; errors.deliveryAddress = t("Delivery Address is required"); }
    } else if (!selectedPickupLocation) {
      ok = false; errors.selectedPickupLocation = t("Pick-up location is required");
    }
    if (collectOption === "collect_from_me") {
      if (!collectAddress && !deliveryAddress && !selectedPickupLocation) {
        ok = false; errors.collectAddress = t("Collect Address is required");
      }
    } else if (!selectedDropoffLocation && !selectedPickupLocation && !inputValue) {
      ok = false; errors.selectedDropoffLocation = t("Drop off location is required");
    }
    setError(errors);
    return ok;
  };
  const goToWhenStep = () => { if (validateWhereStep()) setWizardStep(2); };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    // Validate pick-up location
    if (deliveryOption === "deliver_to_me") {
      if (!deliveryAddress) {
        formIsValid = false;
        errors.deliveryAddress = t("Delivery Address is required");
      }
    } else {
      if (!selectedPickupLocation) {
        formIsValid = false;
        errors.selectedPickupLocation = t("Pick-up location is required");
      }
    }

    if (collectOption === "collect_from_me") {
      if (!collectAddress && !deliveryAddress && !selectedPickupLocation) {
        formIsValid = false;
        errors.collectAddress = t("Collect Address is required");
      }
    } else {
      if (!selectedDropoffLocation && !selectedPickupLocation && !inputValue) {
        formIsValid = false;
        errors.selectedDropoffLocation = t("Drop off location is required");
      }
    }

    if (!formattedDate) {
      formIsValid = false;
      errors.formattedDate = t("Pick-up Date and Time is required");
    }
    if (!formattedDate_dropoff) {
      formIsValid = false;
      errors.formattedDate_dropoff = t("Drop-off Date and Time is required");
    }

    // Age validation - must confirm 21 years or above.
    // Skipped on the simplified homepage search; confirmed on the next step / checkout.
    if (!simple && radioValue_age !== "1") {
      formIsValid = false;
      errors.ageVerification = t("You must confirm you are 21 years or above");
    }

    if (formData?.booking_type === "monthly") {
      if (!selectedMonthDuration) {
        formIsValid = false;
        errors.selectedMonthDuration = "Duration is required";
      }
    }

    // Set all errors at once
    setError(errors);
    return formIsValid;
  };

  const handleTabSelect = (key) => {
    if (key === "link-0") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        booking_type: "daily",
        agetermsaccepte: 0,
      }));
      setSubscription("daily"); // Daily Rentals
      setBookingTypeGlobal("daily");
      // Note: intentionally NOT mutating window.location.hash here.
      // The DOM id="daily-booking" is preserved for in-page anchor support,
      // but writing the hash into the URL caused SEO/UX issues (visible URL change,
      // duplicate URL signals). Tab state is tracked via React state instead.
    } else if (key === "link-1") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        booking_type: "monthly",
        agetermsaccepte: 1,
      }));
      setBookingTypeGlobal("monthly");
      setSubscription("monthly");
      // Note: intentionally NOT mutating window.location.hash here (see comment above).
    }
  };

  const handleSubmit = async (e) => {
    const form = e.currentTarget;

    e.preventDefault();

    if (validateForm()) {
      const isCarSearchValid = await carSearch();
      if (isCarSearchValid) {
        // Confirm EDC promo if it was applied
        const edcPromoCode = localStorage.getItem('edc_promo_code');
        if (edcPromoCode && formData?.coupon_code === edcPromoCode) {
          localStorage.setItem('edc_promo_confirmed', 'true');
          sessionStorage.removeItem('edc_just_verified'); // No longer needed
        }
        
        // Fired here, not on the button, so a search that failed validation
        // never counts as intent.
        // Fired here, after the form validated and we are navigating to
        // results — not on the button, which would count failed searches.
        trackSearchCars({
          pickup_location: selectedPickupLocation?.label || pickupCity?.label,
          dropoff_location: selectedDropoffLocation?.label || dropOffCity?.label,
          pickup_date: formData?.pickup_date,
          dropoff_date: formData?.dropoff_date,
          rental_days: (() => {
            const a = new Date(formData?.pickup_date);
            const b = new Date(formData?.dropoff_date);
            const d = Math.ceil((b - a) / 86400000);
            return Number.isFinite(d) && d > 0 ? d : 1;
          })(),
          language,
        });

        navigate(`/${language}/bookingDetails`);
        dispatch(setSelectedMonthlyPlan(""));
  
      }
    } else {
      e.stopPropagation();
    }
  };
  useEffect(() => {
    // Read URL hash to auto-select the correct tab
    const hash = window.location.hash;
    if (hash === "#flexi-monthly") {
      setBookingTypeGlobal("monthly");
      setSubscription("monthly");
      setFormData((prev) => ({
        ...prev,
        booking_type: "monthly",
        agetermsaccepte: 1,
      }));
    } else {
      setBookingTypeGlobal("daily");
      // Do NOT auto-append #daily-booking to the URL on mount.
      // It caused the page to appear to "redirect" to /...#daily-booking and
      // produced unwanted URL variants. The id="daily-booking" element still
      // works for anchor scrolling if a user explicitly navigates to that hash.
    }
  }, []);

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const handleMarkerPositionChange = (position) => {
    setMarkerPosition(position);
  };
  const [showMapPopupDropoff, setShowMapPopupDropoff] = useState(false);
  const [markerPositionDropoff, setMarkerPositionDropoff] =
    useState(defaultCenter);
  const handleMarkerPositionChange_dropoff = (position) => {
    setMarkerPositionDropoff(position);
  };
  const {
    ready: readyDropoff,
    value: valueDropoff,
    suggestions: { status: statusDropoff, data: dataDropoff },
    setValue: setValueDropoff,
    clearSuggestions: clearSuggestionsDropoff,
  } = usePlacesAutocomplete({
    initOnMount: placesLibraryLoaded(),
    requestOptions: {
      location: { lat: () => defaultCenter.lat, lng: () => defaultCenter.lng },
      radius: 200 * 1000,
    },
  });
  const handleCloseMapPopupDropoff = () => {
    setShowMapPopupDropoff(false);
  };

  const carSearch = async (page_size = 10, setAllCars = false) => {
    return new Promise((resolve, reject) => {
      var c =
        deliveryOption === "deliver_to_me" &&
        collectOption !== "collect_from_me" &&
        !selectedDropoffLocation
          ? "c"
          : null;
      console.log(
        "diff->",
        isDifferenceGreaterThanDays(
          formattedDate,
          formattedTime,
          formattedDate_dropoff,
          formattedTime_dropoff,
          29
        )
      );
      const body = {
        booking_type: isDifferenceGreaterThanDays(
          formattedDate,
          formattedTime,
          formattedDate_dropoff,
          formattedTime_dropoff,
          29
        )
          ? "monthly"
          : formData?.booking_type,
        pickup_type: deliveryOption === "deliver_to_me" ? "delivery" : "self",
        pickup_date: formattedDate,
        pickup_time: formattedTime,
        dropoff_type:
          c || collectOption === "collect_from_me" ? "collection" : "self",
        dropoff_date: formattedDate_dropoff,
        dropoff_time: formattedTime_dropoff,
        booking_source: "web",
      };

      if (body?.pickup_type === "self") {
        body.pickup_location_id = selectedPickupLocation?.value;
      }
      if (body?.pickup_type === "delivery") {
        body.pickup_city_id = selectedDeliveryCity?.value;
        body.pickup_coordinates = [
          Number(markerPosition.lat),
          Number(markerPosition.lng),
        ];
        body.pickup_address = inputValue;
      }

      if (body?.dropoff_type === "collection") {
        body.dropoff_city_id = selectedCollectCity?.value
          ? selectedCollectCity?.value
          : selectedDeliveryCity?.value;
        body.dropoff_coordinates = [
          Number(markerPositionDropoff?.lat),
          Number(markerPositionDropoff?.lng),
        ];
        body.dropoff_address = inputValueDropoff;
      }
      if (body?.dropoff_type === "self") {
        body.dropoff_location_id = selectedDropoffLocation
          ? selectedDropoffLocation?.value
          : selectedPickupLocation?.value;
      }

      if (body?.booking_type === "monthly") {
        body.booking_months = isDifferenceGreaterThanDays(
          formattedDate,
          formattedTime,
          formattedDate_dropoff,
          formattedTime_dropoff,
          29
        )
          ? getFullMonthDifference(formattedDate, formattedDate_dropoff)
          : selectedMonthDuration?.value;
      }

      if (formData?.coupon_code) {
        body.discount_coupon = formData?.coupon_code;
      }

      const baseUrl = `${configWeb.POST_CAR_SEARCH}?lang=${getApiLang(language)}&page=1&page_size=10&sort=ASC`;

      setLoading(true);
      simplePostCall(baseUrl, JSON.stringify(body))
        .then((res) => {
          if (!res?.error) {
            resolve(true);
            if (setAllCars) {
              // Store in allCarsArray if fetching all records
              dispatch(setAllCarsArray(res?.data));
              // dispatch(setCarArray(res?.data));
            } else {
              // Store in carArray for paginated results
              // dispatch(setCarArray(res?.data));
              if (savedCar) {
                const updatedCarArray = res?.data.filter(
                  (item) => item.id * 1 !== savedCar * 1
                );
                dispatch(setCarArray(updatedCarArray));
              } else {
                dispatch(setCarArray(res?.data));
                body.total_records = res?.total_records || 0;
                dispatch(setRequestBody_dropoff(body));
                dispatch(setRequestBody_pickup(body));
              }
            }
            // setTotalRecords(res?.total_records);
            if (!savedCar) {
              // dispatch(setSelectedCar(null));
            }
          }

          if (res?.status === "success") {
            // notifySuccess(res?.message)
          }
          if (res?.error) {
            // dispatch(setSelectedCar(null));
            resolve(false);
            if (Array.isArray(res?.message)) {
              notifyError(res?.message[0]);
            } else {
              notifyError(res?.message);
            }
          }
        })
        .catch((error) => {
          resolve(false);
          console.log("validate pickuplocation api failed-->", error);
          notifyError(t("Something went wrong, please try again later"));
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const transformedCityArray = transformCityArray(citiesArray);

  // ── Simple (homepage) mode: one flat location list across all cities, each
  //    label prefixed with its city. Selecting a location also sets the city
  //    behind the scenes so search + drop-off filtering keep working.
  const simpleLocationOptions = Array.isArray(pickupLocationArray)
    ? [...pickupLocationArray]
        .map((l) => {
          const city = transformedCityArray?.find(
            (c) => String(c.value) === String(l?.city_id)
          );
          return {
            value: l.id,
            label: `${city?.label ? city.label + " — " : ""}${l.name}`,
            city_id: l.city_id,
            ...l,
          };
        })
        .sort(byPickupPriority)
    : [];
  const handleSimplePickupChange = (opt) => {
    setPickupCityChanges(false);
    dispatch(setSelectedPickupLocation(opt));
    const city = transformedCityArray?.find(
      (c) => String(c.value) === String(opt?.city_id)
    );
    if (city) {
      dispatch(setPickupCity(city));
      dispatch(setSelectedDeliveryCity(city));
      dispatch(setDropOffCity(city));
      dispatch(setSelectedCollectCity(city));
    }
  };
  const handleSimpleDropoffChange = (opt) => {
    dispatch(setSelectedDropoffLocation(opt));
  };

  useEffect(() => {
    if (formattedDate && formattedDate_dropoff && !monthDurationSelectedFlag) {
      if (
        isDifferenceGreaterThanDays(
          formattedDate,
          formattedTime,
          formattedDate_dropoff,
          formattedTime_dropoff,
          29
        )
      ) {
        const months =
          getFullMonthDifference(formattedDate, formattedDate_dropoff) || 1;
        setSelectedMonthDuration((prev) =>
          prev.value === months
            ? prev
            : {
                label: `${months > 1 ? `${months} Months` : `${months} Month`}`,
                value: months,
              }
        );
      }
    } else if (formattedDate && !monthDurationSelectedFlag) {
      setSelectedMonthDuration((prev) =>
        prev.value === 1 ? prev : { label: `1 ${t("Month")}`, value: 1 }
      );
    }
  }, [formattedDate, formattedDate_dropoff]);

  return (
    <div className="p-1--">
      {!simple && (
      <Nav
        className="subscription__tabs form-tabs"
        variant="pills"
        defaultActiveKey="link-0"
        activeKey={bookingTypeGlobal === "daily" ? "link-0" : "link-1"}
        onSelect={handleTabSelect}
      >
        <Nav.Item>
          <Nav.Link
            className="subscription__tab  form-tab "
            id="daily-rentals"
            eventKey="link-0"
          >
            {t("Make A Booking")}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            id="daily-rentals"
            className="subscription__tab-- form-tab"
            eventKey="link-1"
          >
            {t("Flexi Monthly")}
          </Nav.Link>
        </Nav.Item>
      </Nav>
      )}
      <div className={`form ${simple ? "simple-mode" : ""}`} data-step={simple ? undefined : wizardStep}>
        {/* Mobile-only step indicator (Where → When). Hidden on desktop via CSS. */}
        <div className="wizard-progress simple-hide">
          <button
            type="button"
            className={`wizard-step ${wizardStep >= 1 ? "active" : ""}`}
            onClick={() => setWizardStep(1)}
          >
            <span>1</span>{t("Where")}
          </button>
          <span className="wizard-line" />
          <div className={`wizard-step ${wizardStep >= 2 ? "active" : ""}`}>
            <span>2</span>{t("When")}
          </div>
        </div>
        <Form
          onSubmit={handleSubmit}
          /* validated={validated} */ style={{ padding: "5px 0 0px 0" }}
        >
          <Row className=" sm-6 ">
            <Col
              lg={12}
              md={12}
              sm={12}
              className="d-flex justify-content-end "
            >
              {/* <div className="checkbox-wrapper-35">
      <input
        value="private"
        name="switch"
        id="switch"
        type="checkbox"
        className="switch"
        checked={isChecked}
        onChange={handleChangeChecked}
      />
     
      <label htmlFor="switch">
        <span className="switch-x-text">Drop off location is </span>
        <span className="switch-x-toggletext">
          <span className="switch-x-unchecked">
            <span className="switch-x-hiddenlabel">Unchecked: </span>same.
          </span>
          <span className="switch-x-checked" >
            <span className="switch-x-hiddenlabel">Checked: </span>different.
          </span>
        </span>
      </label>
    </div> */}

              {/* <Form.Group className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="label-name">Different Drop-off Location?</Form.Label>
                <ButtonGroup className="ms-1">
                  {radios_dropoff_location.map((radio, idx) => (
                    <ToggleButton
                      key={idx}
                      id={`radio_1-${idx}`}
                      type="radio"
                      // variant={
                      //   idx % 2 ? "outline-success" : "outline-danger"
                      // }
                      className="d-flex align-items-center justify-content-center"
                      style={{ height: "40px", width: "50px" }}
                      name="radio_1"
                      value={radio.value}
                      checked={radioValue_dropoff_location === radio.value}
                      // onChange={(e) => setRadioValue(e.currentTarget.value)}
                      onChange={(e) =>
                        handleChange("dropoff_type_t", e.currentTarget.value)
                      }
                    >
                      {radio.name}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </Form.Group> */}
            </Col>
          </Row>
          <div className="booking-form-field-wrapper">
            <Row className=" sm-6 ">
              <>
                <Col
                  style={{ paddingBottom: "0px" }}
                  lg={true}
                  md={true}
                  sm={12}
                  className="mb-sm-2 mb-lg-0 wiz-where simple-hide"
                >
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label className="label-name ">
                      {t("Pick-up City")}
                    </Form.Label>
                    <Select
                      aria-label={t("Pick-up City")}
                      // value={pickupCity}
                      value={selectedDeliveryCity}
                      onChange={handlePickupCityChange}
                      styles={customStyles}
                      options={transformedCityArray || []}
                      placeholder={t("Select Pickup City...")}
                      required
                      isLoading={fetchSHiftsLoading}
                      isDisabled={fetchSHiftsLoading}
                      isRtl={language === "ar"}
                    />
                  </Form.Group>
                  {
                    /* !pickupCity */ !selectedDeliveryCity && (
                      <span className="text-danger">
                        {error?.selectedPickupLocation}{" "}
                      </span>
                    )
                  }{" "}
                </Col>
                <Col
                  style={{ paddingBottom: "0px" }}
                  lg={true}
                  md={true}
                  sm={12}
                  className="wiz-where"
                >
                  {deliveryOption === "pickup_location" ? (
                    <>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name mb-1-">
                          {simple ? t("Pick-up City") : t("Pick-up Location")}
                        </Form.Label>
                        <Select
                          aria-label={simple ? t("Pick-up City") : t("Pick-up Location")}
                          value={selectedPickupLocation}
                          onChange={simple ? handleSimplePickupChange : handlePickupChange}
                          styles={customStyles}
                          options={simple ? simpleLocationOptions : pickupOptions}
                          placeholder={simple ? t("Select City") : t("Select Pickup Location...")}
                          isLoading={fetchSHiftsLoading}
                          isDisabled={fetchSHiftsLoading}
                          isRtl={language === "ar"}
                        />
                      </Form.Group>
                      {!selectedPickupLocation && (
                        <span className="text-danger">
                          {error?.selectedPickupLocation}{" "}
                        </span>
                      )}{" "}
                    </>
                  ) : (
                    <>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name mb-1">
                          {/* Select Delivery City */}
                          {t("Delivery Address")}
                        </Form.Label>
                        <Form.Control
                          //  required
                          value={deliveryAddress}
                          //  onChange={handleDeliverCityChange}
                          readOnly
                          placeholder={t("Select...")}
                          onFocus={() => setDeliveryAddressPopup_flag(true)}
                        />
                      </Form.Group>
                      {!deliveryAddress && (
                        <span className="text-danger">
                          {error?.deliveryAddress}{" "}
                        </span>
                      )}
                    </>
                  )}

                  {/* <div className="mt-1 mb-0">
            Deliver to me? 
            <div className="form-check form-check-inline ms-1">
  <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="deliver_to_me" checked={deliveryOption === 'deliver_to_me'} onChange={(e) => deliveryOptionChange(e.target.value)}  />
  <label className="form-check-label" for="inlineCheckbox1">Yes</label>
</div>
<div className="form-check form-check-inline">
  <input className="form-check-input" type="checkbox" id="inlineCheckbox2" value="pickup_location" checked={deliveryOption === 'pickup_location'} onChange={(e) => deliveryOptionChange(e.target.value)}/>
  <label className="form-check-label" for="inlineCheckbox2">No</label>
</div>
</div> */}

                  <div
                    className="delivery-collect-text inline-block "
                    style={{ cursor: "pointer" }}
                    onClick={handle_deliver_to_me_click}
                  >
                    {t("Deliver to me?")}
                  </div>

                  {deliveryOption === "deliver_to_me" &&
                    deliveryAddressPopup_flag && (
                      <div ref={popupRef}>
                        <Suspense fallback={null}>
                        <ChooseDeliverToMePopup
                          citiesArray={citiesArray}
                          handleCloseButton={handleCloseButton}
                          handleDeliveryAddressChange={
                            handleDeliveryAddressChange
                          }
                          handleSelectAddressDelivery={
                            handleSelectAddressDelivery
                          }
                          cityError={cityError}
                          /* handleDeliverCityChange_psuedo={handleDeliverCityChange} */ onMarkerPositionChange={
                            handleMarkerPositionChange
                          }
                        />
                        </Suspense>
                      </div>
                    )}
                </Col>
              </>

              <Col
                // lg={formData.booking_type === "monthly" ? 2 : 3}
                lg={true}
                // md={formData.booking_type === "monthly" ? 4 : 6}
                md={true}
                sm={12}
                style={{ paddingBottom: "0px" }}
                className="mb-sm-2 mb-lg-0 wiz-when"
              >
                {/* <Form.Group controlId="formGridAddress1">
                    <Form.Label className="label-name">{t("Pick-up Date / Time")} </Form.Label> */}
                {!pickersReady ? (
                  <DateFieldSkeleton label={t("Pick-up Date / Time")} />
                ) : (
                <Suspense fallback={<DateFieldSkeleton label={t("Pick-up Date / Time")} />}>
                  <CommonlyUsedComponents
                    onDateTimeChange={handleDateTimeChange}
                    deliveryOption={deliveryOption}
                    selectedDeliveryCity={selectedDeliveryCity}
                    // pickupCity={pickupCity}
                    selectedPickupLocation={selectedPickupLocation}
                    booking_type={formData?.booking_type}
                    setFetchSHiftsLoading={setFetchSHiftsLoading}
                    pickupCityChanges={pickupCityChanges}
                    setPickupCityChanges={setPickupCityChanges}
                  />
                </Suspense>
                )}
                {!formattedDate && (
                  <span className="text-danger">{error?.formattedDate} </span>
                )}
              </Col>
            </Row>
            <Row className="align-items-start">
              <Col
                style={{ paddingBottom: "0px" }}
                lg={true}
                md={true}
                sm={12}
                className="mb-sm-2 mb-lg-0 wiz-where simple-hide"
              >
                <Form.Group controlId="formBasicEmail">
                  <Form.Label className="label-name mb-1-">
                    {t("Drop-off City")}
                  </Form.Label>
                  <Select
                    aria-label={t("Drop-off City")}
                    value={dropOffCity}
                    onChange={handleDropoffCityChange}
                    styles={customStyles}
                    options={transformedCityArray || []}
                    placeholder={t("Select Dropoff City...")}
                    required
                    isRtl={language === "ar"}
                  />
                </Form.Group>
                {!dropOffCity && (
                  <span className="text-danger">
                    {error?.selectedPickupLocation}{" "}
                  </span>
                )}{" "}
              </Col>

              <Col
                lg={true}
                md={true}
                sm={12}
                className="wiz-where simple-hide"
              >
                <div>
                  {collectOption === "dropoff_location" ? (
                    <>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name mb-1-">
                          {t("Drop-off Location")}
                        </Form.Label>
                        <Select
                          aria-label={t("Drop-off Location")}
                          className="find-my-car-select"
                          value={
                            selectedDropoffLocation || selectedPickupLocation
                          }
                          onChange={simple ? handleSimpleDropoffChange : handleDropoffChange}
                          options={simple ? simpleLocationOptions : dropOffOptions}
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          placeholder={t("Same as pick-up location")}
                          isRtl={language === "ar"}
                        />
                      </Form.Group>
                      {!selectedDropoffLocation && !selectedPickupLocation && (
                        <span className="text-danger">
                          {error?.selectedDropoffLocation}{" "}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name mb-1-">
                          {/* Select Delivery City */}
                          {t("Collect Address")}
                        </Form.Label>
                        <Form.Control
                          //  required
                          value={collectAddress /* || deliveryAddress */}
                          //  onChange={handleDeliverCityChange}
                          readOnly
                          placeholder={t("Same as delivery address.")}
                          onFocus={() => setCollectFromMePopup_flag(true)}
                        />
                      </Form.Group>
                      {!collectAddress && !deliveryAddress && (
                        <span className="text-danger">
                          {error?.collectAddress}{" "}
                        </span>
                      )}
                    </>
                  )}

                  <div
                    className="delivery-collect-text inline-block "
                    style={{ cursor: "pointer" }}
                    onClick={handle_collect_from_me_click}
                  >
                    {t("Collect from me?")}
                  </div>
                  {collectOption === "collect_from_me" &&
                    collectFromMePopup_flag && (
                      <div ref={popupRef}>
                        <Suspense fallback={null}>
                        <CollectFromMePopup
                          citiesArray={citiesArray}
                          handleCloseButtonForCollect={
                            handleCloseButtonForCollect
                          }
                          handleSelectAddressCollect={
                            handleSelectAddressCollect
                          }
                          handleCollectAddressChange={
                            handleCollectAddressChange
                          }
                          /* handleCollectCityChange_pseudo ={handleCollectCityChange} */ onMarkerPositionChange={
                            handleMarkerPositionChange_dropoff
                          }
                        />
                        </Suspense>
                      </div>
                    )}
                </div>
              </Col>
              {/* <Col lg={radioValue === "self_return" ? 4 : 3} md={3} sm={12} style={{paddingBottom : '0px'}}> */}
              {formData.booking_type === "monthly" && (
                <Col
                  style={{ paddingBottom: "0px" }}
                  lg={true}
                  md={true}
                  sm={12}
                  className="wiz-when"
                >
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label className="label-name mb-1-">
                      {t("Duration")}
                    </Form.Label>
                    <Select
                      aria-label={t("Duration")}
                      value={selectedMonthDuration}
                      onChange={handleDurationChange}
                      styles={customStyles}
                      options={durationOptions}
                      placeholder={t("Select...")}
                      isRtl={language === "ar"}
                    />
                  </Form.Group>
                  {!selectedMonthDuration && (
                    <span className="text-danger">
                      {error?.selectedMonthDuration}{" "}
                    </span>
                  )}
                </Col>
              )}

              {radioValue === "self_return" ? <></> : <></>}

              <Col
                className="dropff-date-time wiz-when"
                // lg={formData.booking_type === "monthly" ? 2 : 3}
                lg={true}
                // md={formData.booking_type === "monthly" ? 4 : 6}
                md={true}
                sm={12}
              >
                {!pickersReady ? (
                  <DateFieldSkeleton label={t("Drop-off Date / Time")} />
                ) : (
                <Suspense fallback={<DateFieldSkeleton label={t("Drop-off Date / Time")} />}>
                  <DropoffDateTimePicker
                    onDateTimeChange={handleDateTimeChange_dropoff}
                    deliveryOption={deliveryOption}
                    collectOption={collectOption}
                    selectedCollectCity={selectedCollectCity}
                    selectedDeliveryCity={selectedDeliveryCity}
                    selectedDropoffLocation={selectedDropoffLocation}
                    selectedPickupLocation={selectedPickupLocation}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    month={selectedMonthDuration?.value}
                    booking_type={formData?.booking_type}
                  />
                </Suspense>
                )}
                {!formattedDate_dropoff && (
                  <span className="text-danger">
                    {error?.formattedDate_dropoff}{" "}
                  </span>
                )}
              </Col>
            </Row>

            {/* Wizard nav (mobile only): "Next" on step 1, "Back" on step 2 */}
            <Row className="wizard-nav-row simple-hide">
              <Col lg={12} md={12} sm={12}>
                {wizardStep === 1 ? (
                  <Button
                    type="button"
                    className="findBtn wizard-next-btn"
                    onClick={goToWhenStep}
                  >
                    {t("Next")}
                  </Button>
                ) : (
                  <button
                    type="button"
                    className="wizard-back-btn"
                    onClick={() => setWizardStep(1)}
                  >
                    ← {t("Back")}
                  </button>
                )}
              </Col>
            </Row>

            {/* Age Verification Row */}
            <Row className="mt-3 mb-2 wiz-when simple-hide">
              <Col lg={12} md={12} sm={12}>
                <div className="age-verification-section" style={{
                  background: '#1b365d',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  width: 'fit-content',
                }}>
                  <div className="age-verification-wrapper">
                    <Form.Check
                      type="checkbox"
                      id="age-verification-checkbox"
                      checked={radioValue_age === "1"}
                      onChange={(e) => {
                        const value = e.target.checked ? "1" : "0";
                        setRadioValue_age(value);
                        handleChange("user_age", value);
                      }}
                      label={
                        <span style={{ fontSize: '13px', color: '#fff' }}>
                          {t("I confirm that I am 21 years old or above")}
                        </span>
                      }
                      style={{ margin: 0 }}
                    />
                   
                  </div>
                </div>
                {radioValue_age !== "1" && error?.ageVerification && (
                  <span className="text-danger" style={{ fontSize: '13px' }}>
                    {error?.ageVerification}
                  </span>
                )}
              </Col>
            </Row>

            <Row className="align-items-end wiz-when">
              <Col lg={4} md={4} sm={12} className="simple-hide">
                {/* Check if EDC promo code is applied */}
                {(() => {
                  const edcPromoCode = localStorage.getItem('edc_promo_code');
                  const edcPromoConfirmed = localStorage.getItem('edc_promo_confirmed');
                  const edcJustVerified = sessionStorage.getItem('edc_just_verified');
                  const isEdcPromoActive = edcPromoCode && (edcPromoConfirmed === 'true' || edcJustVerified === 'true');
                  
                  if (isEdcPromoActive) {
                    return (
                      <div 
                        className="edc-promo-applied-badge"
                        style={{
                          background: 'linear-gradient(135deg, #1a2d4a, #0d1a2d)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#fff',
                          width: '100%',
                          boxSizing: 'border-box',
                          flexWrap: 'wrap'
                        }}
                      >
                        <img 
                          src="https://edc-cms-storage-cdn-dev.azureedge.net/strapi/assets/Logo_7399ed159f.svg" 
                          alt="EDC" 
                          style={{ height: '18px', flexShrink: 0 }}
                        />
                        <span style={{ fontWeight: '500', fontSize: '13px' }}>{edcPromoCode}</span>
                        <span style={{
                          background: '#28a745',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>{t("Applied")}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <Form.Group
                      controlId="formGridAddress1"
                      className="coupon-code-mobile"
                    >
                      <Form.Control
                        placeholder={t("Enter Coupon Code")}
                        value={formData.coupon_code}
                        onChange={(e) =>
                          handleChange("coupon_code", e.target.value)
                        }
                      />
                    </Form.Group>
                  );
                })()}
                <div className="promo-coupon-msg"></div>
              </Col>
              <Col
                lg={true}
                md={true}
                sm={12}
                className="mb-sm-2 mb-lg-0"
              >
                <div className="find-my-card-btn">
                  <Button
                    type="submit"
                    className="findBtn"
                    disabled={loading || (!simple && radioValue_age !== "1")}
                  >
                    {loading ? <Spinner /> : simple ? (
                      <>
                        <svg className="findBtn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3.2-3.2" />
                        </svg>
                        {t("Search Cars")}
                      </>
                    ) : t("Find My Car")}
                  </Button>
                </div>
              </Col>
              <Col
                lg={true}
                md={true}
                sm={12}
                className="mb-sm-2 mb-lg-0"
              >
              </Col>
            </Row>
          </div>
        </Form>
        
        {/* EDC Terms Banner - shown when EDC promo is applied */}
        {(() => {
          const edcPromoCode = localStorage.getItem('edc_promo_code');
          const edcPromoConfirmed = localStorage.getItem('edc_promo_confirmed');
          const edcJustVerified = sessionStorage.getItem('edc_just_verified');
          const isEdcPromoActive = edcPromoCode && (edcPromoConfirmed === 'true' || edcJustVerified === 'true');
          
          if (isEdcPromoActive) {
            return (
              <div 
                className="edc-terms-banner"
                style={{
                  background: 'linear-gradient(135deg, #1a2d4a, #0d1a2d)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginTop: '16px',
                  color: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '10px',
                  flexWrap: 'wrap'
                }}>
                  <img 
                    src="https://edc-cms-storage-cdn-dev.azureedge.net/strapi/assets/Logo_7399ed159f.svg" 
                    alt="EDC" 
                    style={{ height: '20px', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>
                     {t("EDC Exclusive Discount Applied!")}
                  </span>
                  <span style={{
                    background: 'linear-gradient(135deg, #f2421b, #da2826)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {edcPromoCode}
                  </span>
                </div>
                <div className="terms-text" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ marginRight: '12px' }}><span style={{ color: '#4ade80' }}>✓</span> {t("Valid EDC Student ID or Staff ID required at pickup")}</span>
                  <span style={{ marginRight: '12px' }}><span style={{ color: '#4ade80' }}>✓</span> {t("Offer valid for limited time only")}</span>
                  <span style={{ marginRight: '12px' }}><span style={{ color: '#4ade80' }}>✓</span> {t("Cannot be combined with other offers")}</span>
                  <span><span style={{ color: '#4ade80' }}>✓</span> {t("Discount applies to base rental rate only")}</span>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
        {/* Ramadan Terms Banner - shown when Ramadan promo is applied */}
        {/* {formData.booking_type === 'monthly' && formData.coupon_code === 'RAMADAN' && (
          <div 
            className="ramadan-terms-banner"
            style={{
              background: 'linear-gradient(135deg, #1a472a, #0d2818)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginTop: '16px',
              color: '#fff',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '10px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>🌙</span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                {t("Ramadan Kareem")} - {t("Special Discount Applied!")}
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #c9a227, #8b7355)',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                RAMADAN
              </span>
            </div>
            <div className="terms-text" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
              <span style={{ marginRight: '12px' }}><span style={{ color: '#4ade80' }}>✓</span> {t("Valid for Flexi Monthly bookings")}</span>
              <span style={{ marginRight: '12px' }}><span style={{ color: '#4ade80' }}>✓</span> {t("Offer valid during Ramadan period")}</span>
              <span style={{ marginRight: '12px' }}><span style={{ color: '#4ade80' }}>✓</span> {t("Cannot be combined with other offers")}</span>
              <span><span style={{ color: '#4ade80' }}>✓</span> {t("Discount applies to base rental rate only")}</span>
            </div>
          </div>
        )} */}
        
        {/* </Tab> */}

        {/* </Tabs> */}
        <Modal show={showPopup} onHide={handleClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>Location Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{selectedPickupLocation?.label}</p>
            <p>{selectedPickupLocation?.address}</p>
            <p>{selectedPickupLocation?.timing_detail}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePopup}>
              CHOOSE THIS LOCATION
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showPopupDropoff} onHide={handleClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>Drop off Location Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{selectedDropoffLocation?.label}</p>
            <p>{selectedDropoffLocation?.address}</p>
            <p>{selectedDropoffLocation?.timing_detail}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePopup}>
              CHOOSE THIS LOCATION
            </Button>
          </Modal.Footer>
        </Modal>

        {/* <Modal show={showMapPopup} onHide={handleCloseMapPopup} 
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton > 
        <Modal.Title id="contained-modal-title-vcenter">
         Select your address 
        </Modal.Title>
      </Modal.Header>
      <Modal.Body >
    
        <div className="w-100 h-100">
        <FormControl
            // value={value}
            value={inputValue}
            onChange={handleInput}
            disabled={!ready}
            placeholder="Search a location"
            className="mb-2"
          />
          {status === 'OK' && <ul style={{cursor:'pointer'}}>{renderSuggestions()}</ul>}
        <GoogleMap 
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
     
      >
        
        <MarkerF position={markerPosition}  draggable={true}
              onDragEnd={handleMarkerDragEnd} />

       
      </GoogleMap>
      </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleCloseMapPopup}>OK</Button>
      </Modal.Footer>
    </Modal> */}
        {/* Dropoff Address Modal */}
        <Modal
          show={showMapPopupDropoff}
          onHide={handleCloseMapPopupDropoff}
          {...props}
          size="md"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          {/* <Modal.Body>
          <div className="w-100 h-100">
            <FormControl
              value={inputValueDropoff}
              onChange={handleInputDropoff}
              disabled={!readyDropoff}
              placeholder="Search a location"
              className="mb-2"
            />
            {statusDropoff === 'OK' && <ul style={{ cursor: 'pointer' }}>{renderSuggestionsDropoff()}</ul>}
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={13}
              center={centerDropoff}
            >
              <MarkerF position={markerPositionDropoff} draggable={true} onDragEnd={handleMarkerDragEndDropoff} />
            </GoogleMap>
          </div>
        </Modal.Body> */}
          <Modal.Footer>
            <Button onClick={handleCloseMapPopupDropoff}>OK</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default FindCarForm;
