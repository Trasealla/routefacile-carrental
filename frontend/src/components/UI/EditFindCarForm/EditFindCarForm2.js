//// validation addd code
import React, { useContext, useEffect, useRef, useState } from "react";
import "../../../styles/find-car-form.css";
import "../FindCarForm.css";
import { useTranslation } from "react-i18next";
import { simpleGetCall, simplePostCall, getApiLang } from "../../../config.js/SetUp";
import { notifyError, notifySuccess } from "../../../SharedComponent/notify";
import { setSelectedPickupLocation } from "../../../reducers"; // Import the action
import { setSelectedDropoffLocation } from "../../../reducers/Slices/selectedDropoffLocationSlice"; // Import the action
import {
  Button,
  Col,
  Form,
  Row,
  Nav,
  ButtonGroup,
  ToggleButton,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import configWeb from "../../../config.js/configWeb";
import { AppContext } from "../../../context/AppContext";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { placesLibraryLoaded } from "../../../utils/placesReady";
import { useSelector, useDispatch } from "react-redux";
import {
  setRequestBody_dropoff,
  setRequestBody_pickup,
} from "../../../reducers";
import EditCommonlyUsedComponents from "./EditCustomDateTimePicker3";
import EditDropoffDateTimePicker from "./EditDropoffDateTimePicker";
import EditChooseDeliverToMePopup from "./EditChooseDeliverToMePopup";
import { setInputValue } from "../../../reducers/Slices/inputValueSlice"; //importing action
import { setInputValueDropoff } from "../../../reducers/Slices/inputValueDropoffSlice"; //importing action
import EditCollectFromMePopup from "./EditCollectFromMePopup";
import {
  reset_got_to_edit,
  toggle_got_to_edit,
} from "../../../reducers/Slices/goToEditSlice"; //import action
import { setCarArray } from "../../../reducers/Slices/carArraySlice";
import { setPickupCity } from "../../../reducers/Slices/pickupCitySlice";
import { setDropOffCity } from "../../../reducers/Slices/dropoffCitySlice";
import {
  filteredPickUpLocationArray,
  transformCityArray,
  transformedPickupLocationArray,
} from "../../../SharedComponent/ReUseableFunctions";
import {
  getFullMonthDifference,
  isDifferenceGreaterThanDays,
} from "../../../SharedComponent/reusableFunctions";
import { setSelectedDeliveryCity } from "../../../reducers/Slices/selectedDeliveryCitySlice";
import { setSelectedCollectCity } from "../../../reducers/Slices/selectedCollectCitySlice";
import { setSelectedMonthlyPlan } from "../../../reducers/Slices/selectedMonthlyPlanSlice";

const libraries = ["places"];
const defaultCenter = {
  lat: 25.2048, // default latitude
  lng: 55.2708, // default longitude
};

const customStyles = {
  groupHeading: (provided) => ({
    ...provided,
    fontSize: "15px", // Adjust font size
    fontWeight: "600", // Make the text bold
    backgroundColor: "#f0f0f0", // Add a background color
    padding: "10px", // Add some padding
    color: '#174371'
  }),
  control: (provided, state) => ({
    ...provided,
    background: "#fff",
    // borderColor: '#9e9e9e',
    minHeight: "30px",
    height: "45px",
    boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.25)",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "200px", // Adjust the max height as needed
    overflowY: "auto",
  }),
};
const EditFindCarForm = (props) => {
  const {
    booking_number,
    set_booking_number_flag,
    set_edit_edit_form,
    setIsFormValidated,
  } = props;
  const dispatch = useDispatch();
  const [hasMonthChange, setHasMonthChange] = useState(false);
  const editUserBookingObject = useSelector(
    (state) => state.editUserBookingObject.editUserBookingObject
  );
  const selectedPickupLocation = useSelector(
    (state) => state.selectedPickupLocation.selectedPickupLocation
  );
  const selectedDeliveryCity = useSelector(
    (state) => state.selectedDeliveryCity.selectedDeliveryCity
  );
  const selectedCollectCity = useSelector(
    (state) => state.selectedCollectCity.selectedCollectCity
  );
  const savedCar = useSelector((state) => state.savedCar.savedCar);
  const selectedDropoffLocation = useSelector(
    (state) => state.selectedDropoffLocation.selectedDropoffLocation
  );
  const language = useSelector((state) => state.language.language);
  const inputValue = useSelector((state) => state.inputValue.inputValue);
  const inputValueDropoff = useSelector(
    (state) => state.inputValueDropoff.inputValueDropoff
  );

  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const citiesArray = useSelector(
    (state) => state.citiesArray.citiesArray
  );
  const pickupCity = useSelector(
    (state) => state.pickupCity.pickupCity
  );
  const dropOffCity = useSelector(
    (state) => state.dropOffCity.dropOffCity
  );

  const { t, i18n } = useTranslation();
  const [allCarsArray, setAllCarsArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickup_location_id: null,
    booking_type: booking_number
      ? editUserBookingObject?.type
      : requestBody_pickup?.booking_type,
    pickup_type: booking_number
      ? editUserBookingObject?.pickup_type
      : requestBody_pickup?.pickup_type,
    month_time: "",
    pickup_location_name: "",
    pickup_city_id: "",
    pickup_date: "",
    pickup_time: "",
    dropoff_location_id: null,
    dropoff_type: booking_number
      ? editUserBookingObject?.dropoff_type
      : requestBody_dropoff?.dropoff_type,
    dropoff_location_name: "",
    dropoff_city_id: '',
    dropoff_date: "",
    dropoff_time: "",
    coupon_code:
      editUserBookingObject?.coupon_code ||
      requestBody_dropoff?.discount_coupon ||
      "",
    agetermsaccepte: 0,
    user_age: "",
  });

  const {
    setSubscription,
    setEditClickonMapAddressSelectionFlag,
    setEditClickonMapAddressSelectionFlagForDropoff,
  } = useContext(AppContext);
  const [error, setError] = useState({
    selectedPickupLocation: "",
    pickup_date: "",
    pickupTime: "",
  });
  const [deliveryOption, setDeliveryOption] = useState(formData?.pickup_type);
  const [collectOption, setCollectOption] = useState(formData?.dropoff_type);
  const [pickupLocationArray, setPickupLocationArray] = useState([]);
  const [pickupOptions, setPickupOptions] = useState([]);
  // const [selectedDeliveryCity, setSelectedDeliveryCity] = useState(null);
  // const [selectedCollectCity, setSelectedCollectCity] = useState(null);
  const [dropOffCityChangeFlag, setDropOffCityChangeFlag] =
    useState(false);
  const [shifts_dropoff, setShifts_dropoff] = useState([]);
  // const[ selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [selectedMonthDuration, setSelectedMonthDuration] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [collectAddress, setCollectAddress] = useState("");

  const [deliveryAddressPopup_flag, setDeliveryAddressPopup_flag] =
    useState(false);
  const [collectFromMePopup_flag, setCollectFromMePopup_flag] = useState(false);
  const [radioValue_age, setRadioValue_age] = useState(null);
  const radios_age = [
    { name: "Yes", value: "1" },
    { name: "No", value: "2" },
  ];
  const handleDeliveryAddressChange = (address) => {
    setDeliveryAddress(address);
  };

  const handleCollectAddressChange = (address) => {
    setCollectAddress(address);
  };

  const handleSelectAddressDelivery = () => {
    // setEditClickonMapAddressSelectionFlag(true);
    if (!selectedDeliveryCity) {
      setCityError("Select City.");
    }
    if (selectedDeliveryCity) {
      setDeliveryOption("delivery");
      setDeliveryAddressPopup_flag(false);
    }
  };
  const handleSelectAddressCollect = () => {
    // setEditClickonMapAddressSelectionFlagForDropoff(true);

    if (!selectedCollectCity) {
      setCityErrorCollection("Select City.");
    } else {
      setCollectOption("collection");
      setCollectFromMePopup_flag(false);
    }
  };
  const handle_delivery_click = () => {
    setEditClickonMapAddressSelectionFlag(true);
    if (formData?.pickup_type === "delivery") {
      setDeliveryOption("self");
      setFormData((prevData) => ({
        ...prevData,
        pickup_type: "self",
      }));
    } else {
      setDeliveryOption("delivery");
      setFormData((prevData) => ({
        ...prevData,
        pickup_type: "delivery",
      }));
      setDeliveryAddressPopup_flag(true);
    }
  };
  const handle_collect_from_me_click = () => {
    setEditClickonMapAddressSelectionFlagForDropoff(true);
    if (formData?.dropoff_type === "collection") {
      setCollectOption("self");
      setFormData((prevData) => ({
        ...prevData,
        dropoff_type: "self",
      }));
    } else {
      setCollectOption("collection");
      setFormData((prevData) => ({
        ...prevData,
        dropoff_type: "collection",
      }));
      setCollectFromMePopup_flag(true);
    }
  };
  const handleDateTimeChange = (date, time) => {
    setFormattedDate(date);
    setFormattedTime(time);
  };
  const [formattedDate_dropoff, setFormattedDate_dropoff] = useState("");
  const [formattedTime_dropoff, setFormattedTime_dropoff] = useState("");
  console.log("formattedDate_dropoff-->",formattedDate_dropoff)

  const handleDateTimeChange_dropoff = (date, time) => {
    setFormattedDate_dropoff(date);
    setFormattedTime_dropoff(time);
  };
  const handleCloseButton = () => {
    // setEditClickonMapAddressSelectionFlag(true);
    if (formData?.pickup_type === "delivery") {
      setDeliveryAddressPopup_flag(false);
    } else {
      setDeliveryOption("self");
    }
    handle_delivery_click();
  };
  const handleCloseButtonForCollect = () => {
    // setEditClickonMapAddressSelectionFlagForDropoff(true);
    if (formData?.dropoff_type === "collection") {
      setCollectFromMePopup_flag(false);
    } else {
      setCollectOption("self");
    }
    handle_collect_from_me_click();
  };

  const popupRef = useRef(null);
  const popupRefCollection = useRef(null);

  const handleOutsideClick = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      handleCloseButton(); // Close the popup
    }
    if (
      popupRefCollection.current &&
      !popupRefCollection.current.contains(event.target)
    ) {
      handleCloseButtonForCollect(); // Close the popup
    }
  };

  useEffect(() => {
    if (deliveryAddressPopup_flag || collectFromMePopup_flag) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [deliveryAddressPopup_flag, collectFromMePopup_flag]);

  const handlePickupChange = (selectedOption) => {
    dispatch(setSelectedPickupLocation(selectedOption)); //this is for redux
  };

  const handlePickupCityChange = (selectedOption) => {
    setFirstRender(true);
    dispatch(setPickupCity(selectedOption));
    dispatch(setSelectedDeliveryCity(selectedOption));
    dispatch(setInputValue(""));
    setDeliveryAddress("");
  };

  const handleDropoffCityChange = (selectedOption) => {
    setFirstRender(true);
    dispatch(setDropOffCity(selectedOption));
    dispatch(setSelectedCollectCity(selectedOption));
    setDropOffCityChangeFlag(true);
    setCollectAddress('');
    dispatch(setInputValueDropoff(''));
    setDeliveryAddress('');
  };

  const handleDurationChange = (selectedOption) => {
    setSelectedMonthDuration(selectedOption);
    setHasMonthChange(true);
  };

  useEffect(() => {
    if (requestBody_pickup?.booking_months) {
      const duration = {
        value: requestBody_pickup?.booking_months,
        label: `${requestBody_pickup?.booking_months} Months`,
      };
      setSelectedMonthDuration(duration);
    }
  }, [requestBody_pickup]);
  const handleDeliverCityChange = (selectedOption) => {
    dispatch(setSelectedDeliveryCity(selectedOption));
  };
  const handleCollectCityChange = (selectedOption) => {
    dispatch(setSelectedCollectCity(selectedOption));
  };

  const [dropoffLocationArray, setDropoffLocationArray] = useState([]);
  const [dropOffOptions, setDropOffOptions] = useState([]);
  const handleDropoffChange = (selectedOption) => {
    dispatch(setSelectedDropoffLocation(selectedOption)); //this is for redux
  };

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    initOnMount: placesLibraryLoaded(),
    requestOptions: {
      location: { lat: () => defaultCenter.lat, lng: () => defaultCenter.lng },
      radius: 200 * 1000,
    },
  });
  const durationOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i + 1 > 1 ? t("Months") : t("Month")}`,
  }));
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY,
    libraries,
  });
  const [radioValue, setRadioValue] = useState("collect");
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("self_pickup");

  // State for form validation
  const [formErrors, setFormErrors] = useState({
    from_address: "",
    to_address: "",
    delivery_location: "",
    pickup_datetime: "",
    dropoff_datetime: "",
  });

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

  const [firstRender, setFirstRender] = useState(false);

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
      if (firstRender) {
        dispatch(setSelectedPickupLocation(transformedArray[0]));
      
      }
    }
    setFirstRender(false);
  }, [pickupLocationArray, /* pickupCity */ selectedDeliveryCity]);
  useEffect(() => {
    if (
      Array.isArray(dropoffLocationArray) &&
      dropoffLocationArray?.length > 0 &&
      /* dropOffCity */ selectedCollectCity
    ) {
      const filteredArray = filteredPickUpLocationArray(
        dropoffLocationArray,
        /* dropOffCity.value * 1 */ selectedCollectCity.value * 1
      );
      const transformedArray = transformedPickupLocationArray(filteredArray);

      setDropOffOptions(transformedArray);
      if (firstRender) {
        dispatch(setSelectedDropoffLocation(transformedArray[0]));
      }
    }
    setFirstRender(false);
  }, [dropoffLocationArray, /* dropOffCity */ selectedCollectCity]);

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

  const [dayOfWeek, setDayOfWeek] = useState(null);
  const [dayOfWeek_dropoff, setDayOfWeek_dropoff] = useState(null);
  const [cityError, setCityError] = useState("");
  const [cityErrorCollection, setCityErrorCollection] = useState("");

  const handleChange = (key, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return /* date.getDay() === 0 ? 7 : */ date.getDay(); // Adjusting Sunday (0) to 7
  };

  useEffect(() => {
    if (formData?.pickup_date) {
      const dayOfWeek = getDayOfWeek(formData?.pickup_date);
      setDayOfWeek(dayOfWeek);
    }
  }, [formData?.pickup_date]);
  useEffect(() => {
    if (formData.dropoff_date) {
      const dayOfWeek = getDayOfWeek(formData.dropoff_date);
      setDayOfWeek_dropoff(dayOfWeek);
    }
  }, [formData.dropoff_date]);
  useEffect(() => {
    const getDropoffLocationHours = () => {
      const url = configWeb.GET_PICKUP_LOCATION_HOURS(
        deliveryOption === "delivery"
          ? selectedCollectCity.value
          : selectedDropoffLocation
          ? selectedDropoffLocation?.value
          : selectedPickupLocation?.value,
        Number(dayOfWeek_dropoff) + 1
      );
      simpleGetCall(url)
        .then((res) => {
          if (!res?.error) {
            setShifts_dropoff(res);
          }
        })
        .catch((error) => {
          console.error("Location failed:", error);
        })
        .finally(() => {});
    };

    if (formData.dropoff_date) {
      getDropoffLocationHours();
    }
  }, [dayOfWeek_dropoff, selectedDropoffLocation, selectedCollectCity]);

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    if (deliveryOption === "delivery") {
      if (!deliveryAddress && !inputValue) {
        formIsValid = false;

        errors.deliveryAddress = "Delivery Address is required";
      }
    } else {
      if (!selectedPickupLocation) {
        formIsValid = false;

        errors.selectedPickupLocation = "Pick-up location is required";
      }
    }

    if (collectOption === "collection") {
      if (
        !collectAddress &&
        /* !deliveryAddress && */
        /* !selectedPickupLocation && */
        !inputValueDropoff
      ) {
        formIsValid = false;
        errors.collectAddress = "Collect Address is required";
      }
    } else {
      if (!selectedDropoffLocation && !selectedPickupLocation) {
        formIsValid = false;
        errors.selectedDropoffLocation = "Drop off location is required";
      }
    }

    if (
      !formattedDate &&
      !requestBody_pickup?.pickup_date &&
      !editUserBookingObject?.pickup_date_time
    ) {
      formIsValid = false;
      errors.formattedDate = "Pick-up Date and Time is required";
    }
    if (!formattedDate_dropoff) {
      formIsValid = false;
      errors.formattedDate_dropoff = "Drop-off Date and Time is required";
    }
    if (!radioValue_age) {
      formIsValid = false;
      errors.age = t("Age is required");
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
    } else if (key === "link-1") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        booking_type: "monthly",
        agetermsaccepte: 1,
      }));

      setSubscription("monthly");
    }
  };

  function convertToUAETimestamp(utcDateString) {
    // Create a Date object from the UTC string
    const utcDate = new Date(utcDateString);
  
    // Adjust the time by adding 4 hours (UAE Timezone)
    utcDate.setHours(utcDate.getHours() + 4);
  
    // Convert back to the same ISO string format
    return utcDate.toISOString();
  }

  useEffect(() => {
    if (booking_number && editUserBookingObject) {
      const pickupDateTimeUTC = convertToUAETimestamp(editUserBookingObject?.pickup_date_time);
           const pickupDateLocal = new Date(pickupDateTimeUTC)

      // Guard against invalid dates
      if (isNaN(pickupDateLocal.getTime())) return;

      // Format the local date and time

      const pickup_date = pickupDateLocal.toISOString().split("T")[0]; // Local date in 'YYYY-MM-DD'

      // Format the local date and time
     

      const pickup_time = pickupDateLocal.toLocaleTimeString([], {
        // Africa/Casablanca — Asia/Dubai came from the UAE original and shifted
        // every edited booking's pick-up time three hours forward.
        timeZone: "Africa/Casablanca",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }); // Local time in 'HH:MM' (24-hour format)
      setFormattedDate(pickup_date);
      setFormattedTime(pickup_time);
    }
  }, [booking_number]);
  const handleSubmit = async (e) => {
    const form = e.currentTarget;

    e.preventDefault();

    if (validateForm()) {
      const isCarSearchValid = await carSearch();

      if (isCarSearchValid) {
        // dispatch(toggle_got_to_edit());
        dispatch(reset_got_to_edit());
        setIsFormValidated(true);
        dispatch(setSelectedMonthlyPlan(""));
        // set_edit_edit_form(false);
        set_edit_edit_form((prevState) => !prevState);
        if (booking_number) {
          set_booking_number_flag(true);
          navigate(`/${language}/bookingDetails/${booking_number}`);
        } else {
          navigate(`/${language}/bookingDetails`);
        }
      }
    } else {
      e.stopPropagation();
      setIsFormValidated(false);
    }
  };

  ////////////////////////////// 3-1-24
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const handleMarkerPositionChange = (position) => {
    setMarkerPosition(position);
  };

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

  useEffect(() => {
    if (booking_number && editUserBookingObject) {
      if (editUserBookingObject?.pickup_city) {
        const pickup_city = transformedCityArray?.find(
          (item) => item.value === editUserBookingObject.pickup_city?.id
        );

        // dispatch(setPickupCity(pickup_city));
        dispatch(setSelectedDeliveryCity(pickup_city));
      }
      if (editUserBookingObject?.pickup_location_id) {
        const pickupLocation = pickupLocationArray?.find(
          (item) => item.id === editUserBookingObject.pickup_location?.id
        );

        if (pickupLocation) {
          const transformedPickupLocation = {
            value: pickupLocation.id,
            label: pickupLocation.name,
            ...pickupLocation, // Spread the rest of the properties (like address, timing_detail)
          };
          console.log("yyyyyyyyy-->", pickupLocation);
          dispatch(setSelectedPickupLocation(transformedPickupLocation));
        }
      } else {
        dispatch(setInputValue(editUserBookingObject?.pickup_address));
        setMarkerPosition({
          lat: editUserBookingObject?.pickup_coordinates[0],
          lng: editUserBookingObject?.pickup_coordinates[1],
        });

        dispatch(
          setSelectedDeliveryCity({
            value: editUserBookingObject?.pickup_city?.id,
            label: editUserBookingObject?.pickup_city?.name,
          })
        );
      }

      if (editUserBookingObject?.dropoff_location_id) {
        const dropoffLocation = dropoffLocationArray?.find(
          (item) => item.id === editUserBookingObject.dropoff_location?.id
        );

        if (editUserBookingObject?.dropoff_city) {
          const dropoff_city = transformedCityArray?.find(
            (item) => item.value === editUserBookingObject.dropoff_city?.id
          );

          // dispatch(setDropOffCity(dropoff_city));
          dispatch(setSelectedCollectCity(dropoff_city));
        }
        if (dropoffLocation) {
          const transformedDropoffLocation = {
            value: dropoffLocation.id,
            label: dropoffLocation.name,
            ...dropoffLocation, // Spread the rest of the properties (like address, timing_detail)
          };

          dispatch(setSelectedDropoffLocation(transformedDropoffLocation));
        }
      } else {
        dispatch(setInputValueDropoff(editUserBookingObject?.dropoff_address));
        setMarkerPositionDropoff({
          lat: editUserBookingObject?.dropoff_coordinates[0],
          lng: editUserBookingObject?.dropoff_coordinates[1],
        });
        dispatch(
          setSelectedCollectCity({
            value: editUserBookingObject?.dropoff_city?.id,
            label: editUserBookingObject?.dropoff_city?.name,
          })
        );
      }

      if (editUserBookingObject?.type === "monthly") {
        const duration = {
          value: editUserBookingObject?.booking_months,
          label: `${editUserBookingObject?.booking_months} Months`,
        };
        setSelectedMonthDuration(duration);
      }
    }
  }, [
    booking_number,
    editUserBookingObject,
    dropoffLocationArray,
    pickupLocationArray,
    citiesArray,
  ]);

  useEffect(() => {
    if (booking_number && editUserBookingObject) {
    }
  }, [booking_number, editUserBookingObject]);

  console.log('formattedTime-->',formattedTime)
  const carSearch = async (page_size = 10, setAllCars = false) => {
    return new Promise((resolve, reject) => {
      var c =
        deliveryOption === "deliver_to_me" &&
        collectOption !== "collect_from_me" &&
        !selectedDropoffLocation
          ? "c"
          : null;

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
        pickup_type:
          deliveryOption === "deliver_to_me" || deliveryOption === "delivery"
            ? "delivery"
            : "self",
        pickup_date: formattedDate,
        pickup_time: formattedTime,
        dropoff_type:
          c ||
          collectOption === "collect_from_me" ||
          collectOption === "collection"
            ? "collection"
            : "self",
        dropoff_date: formattedDate_dropoff,
        dropoff_time: formattedTime_dropoff,
        booking_source: "web",
      };

      if (body?.pickup_type === "self") {
        body.pickup_location_id = selectedPickupLocation?.value;
      }
      if (body?.pickup_type === "delivery") {
        body.pickup_city_id =
          selectedDeliveryCity?.value ||
          requestBody_pickup?.pickup_city_id;
        body.pickup_coordinates = [
          Number(markerPosition.lat),
          Number(markerPosition.lng),
        ];
        body.pickup_address = inputValue;
      }

      if (body?.dropoff_type === "collection") {
        body.dropoff_city_id = selectedCollectCity?.value
          ? selectedCollectCity?.value ||
            requestBody_dropoff?.dropoff_city_id
          : selectedDeliveryCity?.value ||
            requestBody_pickup?.pickup_city_id;
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
            if (!savedCar) {
            }
          }

          if (res?.status === "success") {
          }
          if (res?.error) {
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

  return (
    <div className="p-1">
      <Nav
        className="subscription__tabs-- form-tabs"
        variant="pills"
        defaultActiveKey={
          booking_number
            ? editUserBookingObject?.type === "daily"
              ? "link-0"
              : "link-1"
            : formData?.booking_type === "monthly"
            ? "link-1"
            : "link-0"
        }
        onSelect={handleTabSelect}
      >
        <Nav.Item>
          <Nav.Link
            className="subscription__tab--- form-tab"
            id="daily-rentals"
            eventKey="link-0"
            style={{ borderRadius: "10px 10px 0px 0px" }}
            disabled={booking_number && editUserBookingObject?.type !== "daily"}
          >
            {t("Make A Booking")}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            id="daily-rentals"
            className="subscription__tab--- form-tab ms-1"
            eventKey="link-1"
            style={{ borderRadius: "10px 10px 0px 0px" }}
            disabled={booking_number && editUserBookingObject?.type === "daily"}
          >
            {t("Flexi Monthly")}
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="form">
        <Form onSubmit={handleSubmit} style={{ padding: "5px 0 0px 0" }}>
          <Row className=" sm-6 ">
            <Col
              lg={12}
              md={12}
              sm={12}
              className="d-flex justify-content-end "
            ></Col>
          </Row>
          <div className="booking-form-field-wrapper">
            <Row className=" sm-6 ">
              <>
                <Col
                  style={{ paddingBottom: "0px" }}
                  lg={true}
                  md={true}
                  sm={12}
                  className="mb-sm-2 mb-lg-0"
                >
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label className="label-name ">
                      {t("Pick-up City")}
                    </Form.Label>
                    <Select
                      // value={pickupCity}
                      value={selectedDeliveryCity}
                      onChange={handlePickupCityChange}
                      styles={customStyles}
                      options={transformedCityArray || []}
                      placeholder={t("Select Pickup City...")}
                      required
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
                >
                  {deliveryOption === "self" ? (
                    <>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name mb-1">
                          {t("Pick-up Location")}
                        </Form.Label>
                        <Select
                          value={selectedPickupLocation}
                          onChange={handlePickupChange}
                          styles={customStyles}
                          options={pickupOptions}
                          placeholder={t("Select...")}
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
                          value={deliveryAddress || inputValue}
                          //  onChange={handleDeliverCityChange}
                          // readOnly
                          placeholder={t("Select...")}
                          onFocus={() => setDeliveryAddressPopup_flag(true)}
                        />
                      </Form.Group>
                      {!deliveryAddress && !inputValue && (
                        <span className="text-danger">
                          {error?.deliveryAddress}{" "}
                        </span>
                      )}
                    </>
                  )}

                  <div
                    className="mt-1  delivery-collect-text inline-block "
                    style={{ cursor: "pointer" }}
                    onClick={handle_delivery_click}
                  >
                    {formData?.pickup_type === "delivery"
                      ? t("Pickup Location?")
                      : t("Deliver to me?")}
                  </div>

                  {deliveryOption === "delivery" &&
                    deliveryAddressPopup_flag && (
                      <div ref={popupRef}>
                        <EditChooseDeliverToMePopup
                          citiesArray={citiesArray}
                          handleCloseButton={handleCloseButton}
                          handleDeliveryAddressChange={
                            handleDeliveryAddressChange
                          }
                          handleSelectAddressDelivery={
                            handleSelectAddressDelivery
                          }
                          handleDeliverCityChange_psuedo={
                            handleDeliverCityChange
                          }
                          onMarkerPositionChange={handleMarkerPositionChange}
                          setFirstRender={setFirstRender}
                        />
                      </div>
                    )}
                </Col>
                <Col
                  className="dropff-date-time"
                  // lg={formData?.booking_type === "monthly" ? 2 : 3}
                  lg={true}
                  md={true}
                  sm={12}
                  // style={{ paddingBottom: "0px" /* marginTop: "-13px" */ }}
                >
                  <EditCommonlyUsedComponents
                    onDateTimeChange={handleDateTimeChange}
                    deliveryOption={deliveryOption}
                    selectedDeliveryCity={selectedDeliveryCity}
                    selectedPickupLocation={selectedPickupLocation}
                    booking_type={formData?.booking_type}
                    booking_number={booking_number}
                  />
                  {!formattedDate && !requestBody_pickup?.pickup_date && (
                    <span className="text-danger">{error?.formattedDate} </span>
                  )}
                </Col>
              </>
            </Row>
            {console.log("selectedCollectCity-->",selectedCollectCity)}
            <Row>
              <Col style={{ paddingBottom: "0px" }} lg={true} md={true} sm={12}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label className="label-name mb-1-">
                    {t("Drop-off City")}
                  </Form.Label>
                  <Select
                    // value={dropOffCity}
                    value={selectedCollectCity || selectedDeliveryCity}
                    onChange={handleDropoffCityChange}
                    styles={customStyles}
                    options={transformedCityArray || []}
                    placeholder={t("Select Dropoff City...")}
                    required
                  />
                </Form.Group>
                {
                  /* !dropOffCity */ !selectedCollectCity && (
                    <span className="text-danger">
                      {error?.selectedPickupLocation}{" "}
                    </span>
                  )
                }{" "}
              </Col>

              <Col
                className={`${
                  formData.booking_type === "monthly"
                    ? "d-flex justify-content-between gap-2"
                    : ""
                }`}
                style={{ paddingBottom: "0px" }}
                lg={true}
                md={true}
                sm={12}
              >
                <div
                  className={`${
                    formData.booking_type === "monthly" ? "flex-grow-1" : ""
                  }`}
                >
                  {collectOption === "self" ? (
                    <>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name mb-1">
                          {t("Drop-off Location")}
                        </Form.Label>
                        <Select
                          className="find-my-car-select"
                          value={
                            selectedDropoffLocation || selectedPickupLocation
                          }
                          onChange={handleDropoffChange}
                          options={dropOffOptions}
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          placeholder={t("Same as pick-up location")}
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
                        <Form.Label className="label-name mb-1">
                          {t("Collect Address")}
                        </Form.Label>
                        <Form.Control
                          value={
                            collectAddress ||
                            inputValueDropoff ||
                            deliveryAddress
                          }
                          placeholder={t("Same as delivery address.")}
                          onFocus={() => setCollectFromMePopup_flag(true)}
                        />
                      </Form.Group>
                      {!collectAddress &&
                        !deliveryAddress &&
                        !inputValueDropoff && (
                          <span className="text-danger">
                            {error?.collectAddress}{" "}
                          </span>
                        )}
                    </>
                  )}

                  <div
                    className="mt-1 delivery-collect-text inline-block "
                    style={{ cursor: "pointer" }}
                    onClick={handle_collect_from_me_click}
                  >
                    {formData?.dropoff_type === "collection"
                      ? t("Dropoff Location?")
                      : t("Collect from me?")}
                  </div>
                  {collectOption === "collection" &&
                    collectFromMePopup_flag && (
                      <div ref={popupRefCollection}>
                        <EditCollectFromMePopup
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
                          handleCollectCityChange_pseudo={
                            handleCollectCityChange
                          }
                          onMarkerPositionChange={
                            handleMarkerPositionChange_dropoff
                          }
                          setFirstRender={setFirstRender}
                          cityErrorCollection={cityErrorCollection}
                        />
                      </div>
                    )}
                </div>

                {formData?.booking_type === "monthly" && (
                  <div>
                    <Form.Group
                      controlId="formBasicEmail"
                      // style={{ marginTop: "-3px" }}
                    >
                      <Form.Label className="label-name mb-1">
                        {t("Duration")}
                      </Form.Label>
                      <Select
                        value={selectedMonthDuration}
                        onChange={handleDurationChange}
                        styles={customStyles}
                        options={durationOptions}
                        placeholder={t("Select...")}
                      />
                    </Form.Group>

                    {!selectedMonthDuration && (
                      <span className="text-danger">
                        {error?.selectedMonthDuration}{" "}
                      </span>
                    )}
                  </div>
                )}
              </Col>

              {radioValue === "self_return" ? <></> : <></>}

              <Col
                className="dropff-date-time"
                style={{ paddingBottom: "0px" /* marginTop: "-13px" */ }}
                // lg={formData?.booking_type === "monthly" ? 2 : 3}
                lg={true}
                md={true}
                sm={12}
              >
                <EditDropoffDateTimePicker
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
                  booking_number={booking_number}
                  hasMonthChange={hasMonthChange}
                />
                {!formattedDate_dropoff && (
                  <span className="text-danger">
                    {error?.formattedDate_dropoff}{" "}
                  </span>
                )}
              </Col>
            </Row>

            <Row className="mt-3">
              <Col lg={4} md={4} sm={12} style={{ paddingBottom: "0px" }}>
                <Form.Group
                  controlId="formGridAddress1"
                  className="my-3 my-sm-0"
                >
                  {/* <Form.Label>Coupon Code</Form.Label> */}
                  <Form.Control
                    // required
                    placeholder={t("Select Coupon Code")}
                    value={formData.coupon_code}
                    onChange={(e) =>
                      handleChange("coupon_code", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col lg={4} md={4} sm={12} className="age-find-car-flex-box">
                <Form.Group className="d-flex justify-content-start gap-2 align-items-center">
                  <Form.Label className="label-name">
                    {t("Age Above 21 ?")}{" "}
                  </Form.Label>
                  <div className="d-flex flex-column" dir="ltr">
                    <ButtonGroup>
                      {radios_age.map((radio, idx) => (
                        <ToggleButton
                          className="mt-1"
                          key={idx}
                          id={`radio-${idx}`}
                          type="radio"
                          // variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                          variant={idx % 2 ? "outline-dark" : "outline-dark"}
                          name="radio"
                          value={radio.value}
                          checked={radioValue_age === radio.value}
                          onChange={(e) =>
                            setRadioValue_age(e.currentTarget.value)
                          }
                        >
                          {t(radio.name)}
                        </ToggleButton>
                      ))}
                    </ButtonGroup>
                    {!radioValue_age && (
                      <span className="text-danger ms-5-">{t(error?.age)} </span>
                    )}
                  </div>
                </Form.Group>
                <div className="find-my-card-btn">
                  <Button type="submit" className="findBtn" disabled={loading}>
                    {loading ? <Spinner /> : t("Find My Car")}
                  </Button>
                </div>
              </Col>
              {/* <Col
              className="text-end"
            >
              <div className="find-my-card-btn mt-3 mt-md-0">
                <Button
                  type="submit"
                  className="findBtn"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : "Find My Car"}
                </Button>
              </div>
            </Col> */}
            </Row>
          </div>
        </Form>
        {/* </Tab> */}

        {/* </Tabs> */}
      </div>
    </div>
  );
};

export default EditFindCarForm;
