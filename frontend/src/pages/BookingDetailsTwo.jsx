import React, { useContext, useEffect, useRef, useState } from "react";
import BookingAddressSection from "../components/UI/BookingAddressSection";

import {
  Button,
  Card,
  Container,
  Figure,
  Form,
  Table,
  Spinner,
  Carousel,
  Col,
  Row,
  Modal,
} from "react-bootstrap";
import BookingStepper from "../components/UI/BookingStepper";
import infoIcon from "../assets/all-images/detailsPage-icons/info-circle.svg";
import configWeb from "../config.js/configWeb";
import {
  simpleGetCall,
  simplePostCall,
  simplePostCallAuth,
  getApiLang,
  hasValidSession,
} from "../config.js/SetUp";
import Slider from "react-slick";
import proImg3 from "../assets/all-images/detailsPage-icons/proimg3.svg";
import proImg4 from "../assets/all-images/detailsPage-icons/proimg4.svg";
import proImg6 from "../assets/all-images/detailsPage-icons/proimg6.svg";
import exampleCarimg from "../assets/all-images/cars-img/exampleCarimg.jpg";
import { useSelector, useDispatch } from "react-redux";
import LoginModal from "../components/UI/LoginModal";
import "../styles/bookingDetails.css";
import { AppContext } from "../context/AppContext";
import { setSelectedCar } from "../reducers/Slices/selectedCarSlice";
import { setCarExtraArray } from "../reducers/Slices/carExtraArray";
import { setFilterCarArray } from "../reducers/Slices/filterCarArraySlice";
import CardDetailsModal from "../components/UI/CardDetails";
import { setAddProtection } from "../reducers/Slices/addProtectionSlice";
import { useNavigate, useParams } from "react-router-dom";
import RegisterModal from "../components/UI/RegisterModal";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";
import usePublicSettings from "../hooks/usePublicSettings";
import {
  pixelInitiateCheckoutEvent,
  pixelViewContentEvent,
} from "../actions/facebookPixelEvents";
import ForgetPasswordModal from "../components/UI/ForgetPasswordModa";
import ResetPasswordModal from "../components/UI/ResetPasswordModal";
import { setRequestBody_dropoff, setRequestBody_pickup } from "../reducers";
import {
  addMonthsToDate,
  findClosestShiftTime,
  getDayOfWeekFromDateString,
  fixImageUrl,
} from "../SharedComponent/reusableFunctions";
import { setCarArray } from "../reducers/Slices/carArraySlice";
import dayjs from "dayjs";
import useDropoffLocationHours from "../SharedComponent/CustomHooks/useDropOffLocationHours";
import { setSelectedMonthlyPlan } from "../reducers/Slices/selectedMonthlyPlanSlice";
import CouponSuccess from "../SharedComponent/couponApplied/couponApplied";
import StickyBookingSummary from "../components/UI/StickyBookingSummary";

export const BookingDetailsTwo = () => {
  const { booking_number } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { format: fmt } = useCurrency();
  const { payNowEnabled } = usePublicSettings();
  const editUserBookingObject = useSelector(
    (state) => state.editUserBookingObject.editUserBookingObject
  );
  const { subscriptionPlan } = useContext(AppContext);
  const [loading_confirmBookin, setLoading_confirmBookin] = useState(false);
  const [installmentTableLoading, setInstallmentTableLoading] = useState(false);
  const [km_object, set_km_object] = useState(null);
  const [mileage_plan_array, set_mileage_plan_array] = useState(null);
  const [monthly_plan_array, set_monthly_plan_array] = useState(null);
  const [monthlyInstallmentArray, setMonthlyInstallmentArray] = useState([]);
  const [edit_edit_form, set_edit_edit_form] = useState(true);
  const [extra_enabled_check, set_extra_enabled_check] = useState(false);
  const [enabledExtras, setEnabledExtras] = useState([]);
  const [skipEvent, setSkipEvent] = useState(false);
  const [getMonthlyPlansLoading, setGetMonthlyPlansLoading] = useState(false);
  const [monthlyMileageLoading, setMonthlyMileageLoading] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState("yes");
  const [shifts, setShifts] = useState([]);
  const handleSelectionChange = (value) => {
    setIsExistingCustomer(value);

    if (value === "no") {
      setLoginModalShow(false);
      setRegisterModalShow(true);
    } else if (value === "yes") {
      setRegisterModalShow(false);
      setLoginModalShow(true);
    }
  };

  // State to track the selected mileage item
  const [selectedMileage, setSelectedMileage] = useState(3000);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  // Function to handle click on a mileage item
  const handleSelectMileage = (mileage) => {
    if (selectedMileage === mileage) {
      // Deselect if the same item is clicked again
      setSelectedMileage(3000);
    } else {
      // Select the clicked item
      setSelectedMileage(mileage);
    }
  };

  // const [activeKM, setActiveKM] = useState(null);
  const settings = {
    // dots: true,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const language = useSelector((state) => state.language.language);
  const carExtraArray = useSelector(
    (state) => state.carExtraArray.carExtraArray
  );
  const filterCarArray = useSelector(
    (state) => state.filterCarArray.filterCarArray
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
  const selectedMonthlyPlan = useSelector(
    (state) => state.selectedMonthlyPlan.selectedMonthlyPlan
  );
  const stepperPage = useSelector((state) => state.stepper.stepperPage);
  const carArray = useSelector((state) => state.carArray.carArray);
  const selectedCar = useSelector((state) => state.selectedCar.selectedCar);
  const addProtection = useSelector(
    (state) => state.addProtection.addProtection
  );
  // State to track if GA event has been fired
  const [hasFiredEvent, setHasFiredEvent] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [carArrayTemp, setCarArrayTem] = useState([]);
  const [babyDriver, setBabyDriver] = useState({ baby_seat: 1, driver: 1 });
  const [loginModalShow, setLoginModalShow] = useState(false);
  const [registerModalShow, setRegisterModalShow] = useState(false);
  const [forgetPasswordModalShow, setForgetPasswordModalShow] = useState(false);
  const [resetPasswordModalShow, setResetPasswordModalShow] = useState(false);
  const [cardModalShow, setCardModalShow] = useState(false);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [originalPaymentMethod, setOriginalPaymentMethod] = useState(null);
  const [confirmBookingData, setConfirmBookingData] = useState([]);
  // Guest bookings come back with the full booking detail attached, because
  // the confirmation screen's usual fetch is authenticated and a guest has no
  // token. It rides to that screen in router state rather than the URL.
  const [guestBookingDetail, setGuestBookingDetail] = useState(null);
  const [confirmBookingPayment, setConfirmBookingPayment] = useState(null);

  const [loading_for_car_rate_table, set_loading_for_car_rate_table] =
    useState(false);
  // const [addProtection, setAddProtection] = useState({
  //   pai: false,
  //   cdw: false,
  //   scdw: false,
  //   baby_seat: false,
  //   gps: false,
  //   driver: false,
  // });

  const handleMonthlyPlanAutoSelection = (monthlyPlanArray) => {
    if (
      requestBody_pickup.booking_type === "monthly" &&
      (!carArray[0].flexi_days || carArray[0].flexi_days === "0")
    ) {
      const months = monthlyPlanArray?.map((item) => item.months);
      const userSelectedMonths = Number(carArray[0].booking_months);

      const isMonthInclude = months?.includes(userSelectedMonths);
      if (isMonthInclude) {
        const temp = Number(carArray[0].booking_months);
        dispatch(setSelectedMonthlyPlan(temp));
      } else {
        const lastMonth = monthlyPlanArray[monthlyPlanArray.length - 1]?.months;
        if (lastMonth) dispatch(setSelectedMonthlyPlan(lastMonth));
      }
    }
  };

  useEffect(() => {
    if (Array.isArray(monthly_plan_array) && monthly_plan_array?.length > 0) {
      handleMonthlyPlanAutoSelection(monthly_plan_array);
    }
  }, [monthly_plan_array]);
  const handleSelectedMonthlyPlan = (months) => {
    if (!requestBody_pickup.pickup_date) return;

    if (months === selectedMonthlyPlan) {
      dispatch(setSelectedMonthlyPlan(""));
      dispatch(
        setRequestBody_dropoff({
          ...requestBody_dropoff,
          dropoff_date: requestBody_pickup?.dropoff_date,
          dropoff_time: requestBody_pickup?.dropoff_time,
        })
      );
    } else {
      let newDropOffDate = addMonthsToDate(
        requestBody_pickup.pickup_date,
        months
      );
      dispatch(
        setRequestBody_pickup({
          ...requestBody_pickup,
          booking_months: months,
        })
      );
      dispatch(
        setRequestBody_dropoff({
          ...requestBody_dropoff,
          dropoff_date: newDropOffDate,
        })
      );
      dispatch(setSelectedMonthlyPlan(months));
    }
  };
  const handleMouseEnter = (index, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top, // Fixed positioning uses viewport coords
      left: rect.left,
    });
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Reset `isExistingCustomer` to "yes" when the login modal is closed
  useEffect(() => {
    if (!loginModalShow && !registerModalShow) {
      setIsExistingCustomer("yes");
    }
  }, [loginModalShow, registerModalShow]);
  //function to handle KM plan
  const handle_km_plan_click = (kmValue, extraKM) => {
    if (addProtection?.activeKM === kmValue) {
      dispatch(
        setAddProtection({
          activeKM: null,
          extra_km: null,
        })
      );
    } else {
      // setActiveKM(kmValue);
      dispatch(
        setAddProtection({
          activeKM: kmValue,
          extra_km: extraKM,
        })
      );
    }
  };

  const getEnabledExtras = (updatedProtection) => {
    return Object.keys(updatedProtection)
      .filter((key) => updatedProtection[key])
      .map((extra) => {
        const carExtra = carExtraArray?.find(
          (item) => item[extra] !== undefined
        );
        return {
          item_id: `extra_${extra}`,
          item_name: extra,
          price: carExtra ? carExtra[extra] : 0,
          quantity:
            extra === "baby_seat"
              ? 1 * (babyDriver?.baby_seat ?? 1)
              : extra === "driver"
              ? 1 * (babyDriver?.driver ?? 1)
              : 1,
        };
      });
  };
  const handleAddProtecionChange = (e) => {
    const { name, checked } = e.target;

    // Update the addProtection state directly with the new value
    const updatedProtection = { ...addProtection, [name]: checked };
    dispatch(setAddProtection(updatedProtection));
    set_extra_enabled_check(checked);

    const recentlyModifiedExtra = {
      item_id: `extra_${name}`,
      item_name: name,
      price:
        carExtraArray?.find((item) => item[name] !== undefined)?.[name] || 0, // Use price if found, else default to 0
    };

    //   setEnabledExtras(enabledExtras)
    const updatedEnabledExtras = getEnabledExtras(updatedProtection);
    setEnabledExtras(updatedEnabledExtras);

    // Determine whether to add or remove from cart
    if (checked /* || Number(babyDriver?.baby_seat) > 1 */) {
      // Trigger `add_to_cart` event
      setSkipEvent(true);
      window.gtag?.("event", "add_to_cart", {
        currency: "MAD",
        value:
          requestBody_pickup?.booking_type === "monthly"
            ? parseFloat(selectedCar?.car_rate_total || 0)
            : selectedCar?.payment_method === "pay_now"
            ? parseFloat(selectedCar?.pay_now || 0)
            : parseFloat(selectedCar?.pay_later || 0), // Adjust the value as needed
        items: [
          {
            item_id: selectedCar?.id,
            item_name: selectedCar?.car_name,
            affiliation: "Route Facile",
            price:
              requestBody_pickup?.booking_type === "monthly"
                ? parseFloat(selectedCar?.car_rate_total || 0)
                : selectedCar?.payment_method === "pay_now"
                ? parseFloat(selectedCar?.pay_now || 0)
                : parseFloat(selectedCar?.pay_later || 0),
            quantity: 1,
            category: selectedCar?.category,
            // discount: selectedCar?.discount,
            city_id: selectedCar?.city_id,
          },
          // ...enabledExtras, // Include all enabled extras
          ...updatedEnabledExtras,
        ],
      });

      window.gtag?.("event", "view_item", {
        currency: "MAD",
        value:
          requestBody_pickup?.booking_type === "monthly"
            ? parseFloat(selectedCar?.car_rate_total || 0)
            : selectedCar?.payment_method === "pay_now"
            ? parseFloat(selectedCar?.pay_now || 0)
            : parseFloat(selectedCar?.pay_later || 0), // Adjust   the value as needed
        items: [
          {
            item_id: selectedCar?.id,
            item_name: selectedCar?.car_name,
            affiliation: "Route Facile",
            price:
              requestBody_pickup?.booking_type === "monthly"
                ? parseFloat(selectedCar?.car_rate_total || 0)
                : selectedCar?.payment_method === "pay_now"
                ? parseFloat(selectedCar?.pay_now || 0)
                : parseFloat(selectedCar?.pay_later || 0),
            quantity: 1,
            category: selectedCar?.category,
            discount: selectedCar?.discount,
            city_id: selectedCar?.city_id,
          },
          // ...enabledExtras, // Include all enabled extras
          ...updatedEnabledExtras,
        ],
      });
    } else {
      // Trigger `remove_from_cart` event with only the recently deselected extra
      window.gtag?.("event", "remove_from_cart", {
        currency: "MAD",
        value: parseFloat(recentlyModifiedExtra?.price || 0),

        items: [
          recentlyModifiedExtra, // Include only recently removed extra
        ],
      });
    }
  };

  // Run gtag events whenever babyDriver changes
  useEffect(() => {
    if (Number(babyDriver?.baby_seat > 1) || Number(babyDriver?.driver > 1)) {
      const updatedEnabledExtras = getEnabledExtras(addProtection);
      setEnabledExtras(updatedEnabledExtras);

      window.gtag?.("event", "add_to_cart", {
        currency: "MAD",
        value:
          requestBody_pickup?.booking_type === "monthly"
            ? parseFloat(selectedCar?.car_rate_total || 0)
            : selectedCar?.payment_method === "pay_now"
            ? parseFloat(selectedCar?.pay_now || 0)
            : parseFloat(selectedCar?.pay_later || 0),
        items: [
          {
            item_id: selectedCar?.id,
            item_name: selectedCar?.car_name,
            affiliation: "Route Facile",
            price:
              requestBody_pickup?.booking_type === "monthly"
                ? parseFloat(selectedCar?.car_rate_total || 0)
                : selectedCar?.payment_method === "pay_now"
                ? parseFloat(selectedCar?.pay_now || 0)
                : parseFloat(selectedCar?.pay_later || 0),
            quantity: 1,
            category: selectedCar?.category,
            // discount: selectedCar?.discount,
            city_id: selectedCar?.city_id,
          },
          ...updatedEnabledExtras,
        ],
      });

      window.gtag?.("event", "view_item", {
        currency: "MAD",
        value:
          requestBody_pickup?.booking_type === "monthly"
            ? parseFloat(selectedCar?.car_rate_total || 0)
            : selectedCar?.payment_method === "pay_now"
            ? parseFloat(selectedCar?.pay_now || 0)
            : parseFloat(selectedCar?.pay_later || 0),
        items: [
          {
            item_id: selectedCar?.id,
            item_name: selectedCar?.car_name,
            affiliation: "Route Facile",
            price:
              requestBody_pickup?.booking_type === "monthly"
                ? parseFloat(selectedCar?.car_rate_total || 0)
                : selectedCar?.payment_method === "pay_now"
                ? parseFloat(selectedCar?.pay_now || 0)
                : parseFloat(selectedCar?.pay_later || 0),
            quantity: 1,
            category: selectedCar?.category,
            // discount: selectedCar?.discount,
            city_id: selectedCar?.city_id,
          },
          ...updatedEnabledExtras,
        ],
      });
    }
  }, [babyDriver]);
  // Function to handle input change
  const babySeatAndDriver = (e) => {
    const { name, value } = e.target;
    setBabyDriver((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    // if(Number(babyDriver?.baby_seat) > 1 || babyDriver?.driver > 1){
    if (!skipEvent) return;
    window.gtag?.("event", "add_to_cart", {
      currency: "MAD",
      value:
        requestBody_pickup?.booking_type === "monthly"
          ? parseFloat(selectedCar?.car_rate_total || 0)
          : selectedCar?.payment_method === "pay_now"
          ? parseFloat(selectedCar?.pay_now || 0)
          : parseFloat(selectedCar?.pay_later || 0), // Adjust the value as needed
      items: [
        {
          item_id: selectedCar?.id,
          item_name: selectedCar?.car_name,
          affiliation: "Route Facile",
          price:
            requestBody_pickup?.booking_type === "monthly"
              ? parseFloat(selectedCar?.car_rate_total || 0)
              : selectedCar?.payment_method === "pay_now"
              ? parseFloat(selectedCar?.pay_now || 0)
              : parseFloat(selectedCar?.pay_later || 0),
          quantity: 1,
          category: selectedCar?.category,
          // discount: selectedCar?.discount,
          city_id: selectedCar?.city_id,
        },
        ...enabledExtras, // Include all enabled extras
      ],
    });
    setSkipEvent(false);
  }, [babyDriver]);

  // Function to handle input validation on blur
  const babySeatAndDriverBlur = (e) => {
    const { name, value } = e.target;
    if (value < 1) {
      setBabyDriver((prevState) => ({
        ...prevState,
        [name]: 1,
      }));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // setStepperpage(3);
  }, []);
  // const [filterCarArray, setFilterCarArray] = useState([]);

  const handleApplyCoupon = () => {
    if (!promoCodeInput.trim()) return;
    setPromoCodeLoading(true);
    const body = JSON.stringify({
      discount_coupon: promoCodeInput.trim(),
      pickup_date: requestBody_dropoff?.pickup_date,
      booking_type: requestBody_pickup?.booking_type || "daily",
    });
    simplePostCall(configWeb.POST_VLIDATE_COUPON, body)
      .then((res) => {
        if (res?.status === "success") {
          dispatch(
            setRequestBody_dropoff({
              ...requestBody_dropoff,
              discount_coupon: promoCodeInput.trim(),
            })
          );
          notifySuccess(res?.message || t("Coupon applied successfully"));
          setPromoCodeInput("");
        }
        if (res?.error) {
          notifyError(
            Array.isArray(res?.message) ? res?.message[0] : res?.message
          );
        }
      })
      .catch(() => {
        notifyError(t("Something went wrong, please try again later"));
      })
      .finally(() => {
        setPromoCodeLoading(false);
      });
  };

  const handleRemoveCoupon = () => {
    dispatch(
      setRequestBody_dropoff({
        ...requestBody_dropoff,
        discount_coupon: "",
      })
    );
    // Clear discount from selectedCar immediately for instant UI update
    if (selectedCar) {
      dispatch(
        setSelectedCar({
          ...selectedCar,
          discount: "0",
          coupon_code: "",
        })
      );
    }
    setPromoCodeInput("");
  };

  const filterCars = (carArrayTemp, selectedCar) => {
    if (selectedCar?.payment_method === "pay_later") {
      return carArrayTemp?.filter(
        (car) => car.pay_later > selectedCar?.pay_later
      );
    } else if (selectedCar?.payment_method === "pay_now") {
      return carArrayTemp?.filter((car) => car?.pay_now > selectedCar?.pay_now);
    } else if (
      selectedCar?.payment_method === "pay_monthly_now" ||
      selectedCar?.payment_method === "pay_monthly_later"
    ) {
      return carArrayTemp?.filter(
        (car) => car?.car_rate_total > selectedCar?.car_rate_total
      );
    } else {
      return carArrayTemp; //return the original array
    }
  };

  const carSearch = async () => {
    const body = {
      booking_type: requestBody_dropoff?.booking_type,
      pickup_type: requestBody_pickup?.pickup_type,
      pickup_date: requestBody_dropoff?.pickup_date,
      pickup_time: requestBody_dropoff?.pickup_time,
      dropoff_type: requestBody_dropoff?.dropoff_type,
      dropoff_date: requestBody_dropoff?.dropoff_date,
      dropoff_time: requestBody_dropoff?.dropoff_time,
      booking_source: "web",

      // discount_coupon: ""
    };

    if (requestBody_pickup?.pickup_type === "self") {
      body.pickup_location_id = requestBody_pickup?.pickup_location_id;
    }
    if (requestBody_pickup?.pickup_type === "delivery") {
      body.pickup_city_id = requestBody_pickup?.pickup_city_id;
      body.pickup_coordinates = requestBody_pickup?.pickup_coordinates;
      body.pickup_address = requestBody_pickup?.pickup_address;
    }

    if (requestBody_dropoff?.dropoff_type === "collection") {
      body.dropoff_city_id = requestBody_dropoff?.dropoff_city_id;
      body.dropoff_coordinates = requestBody_dropoff?.dropoff_coordinates;
      body.dropoff_address = requestBody_dropoff?.dropoff_address;
    }
    if (requestBody_dropoff?.dropoff_type === "self") {
      body.dropoff_location_id = requestBody_dropoff?.dropoff_location_id;
    }

    if (requestBody_pickup?.booking_type === "monthly") {
      body.booking_months = requestBody_pickup?.booking_months;
    }
    if (requestBody_dropoff?.discount_coupon) {
      body.discount_coupon = requestBody_dropoff?.discount_coupon;
    }

    const baseUrl = `${configWeb.POST_CAR_SEARCH}?lang=${getApiLang(language)}&page=1&page_size=100&sort=ASC`; //car_id=1

    const url = selectedCar?.car_category
      ? `${baseUrl}&category_id=${selectedCar?.car_category}`
      : baseUrl;
    set_loading_for_car_rate_table(true);
    simplePostCall(url, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          // dispatch(setCarArray(res?.data));
          setCarArrayTem(res?.data);
          // Update selectedCar with refreshed data (e.g. after coupon apply/remove)
          if (selectedCar && res?.data) {
            const updatedCar = res?.data?.find((car) => car.id === selectedCar?.id);
            if (updatedCar) {
              dispatch(setSelectedCar({ ...updatedCar, payment_method: selectedCar?.payment_method }));
            }
          }
          // setTotalRecords(res?.total_records )
          // dispatch(setSelectedCar(null));
        }

        if (res?.status === "success") {
          //  notifySuccess(res?.message)
        }
        if (res?.error) {
          // dispatch(setSelectedCar(null))
          //   if(Array.isArray(res?.message)){
          //     notifyError(res?.message[0]);
          //   } else{
          //   notifyError(res?.message);
          //   }
        }
      })
      .catch((error) => {
        console.log("validate pickuplocation api failed-->", error);
        // notifyError('Something went wwrong, please try again letter')
      })
      .finally(() => {
        set_loading_for_car_rate_table(false);
      });
  };

  useEffect(() => {
    if (
      selectedCar?.payment_method === "pay_now" ||
      selectedCar?.payment_method === "pay_later"
    ) {
      carSearch();
    }
    // `language` matters here: car names, categories and transmissions come from
    // the API, which returns them in the requested language. Without it in the
    // dependency list, switching language re-rendered the page but never
    // re-fetched, so the Upgrade Options kept showing the previous language's
    // car names next to freshly translated labels.
  }, [selectedCar?.payment_method, language]);
  useEffect(() => {
    if (selectedMileage) {
      carSearchForTotalRateAfterMileAge();
    }
  }, [selectedMileage /* requestBody_dropoff */, language]);

  const carSearchForTotalRateAfterMileAge = async () => {
    const body = {
      booking_type: requestBody_dropoff?.booking_type,
      pickup_type: requestBody_pickup?.pickup_type,
      pickup_date: requestBody_dropoff?.pickup_date,
      pickup_time: requestBody_dropoff?.pickup_time,
      dropoff_type: requestBody_dropoff?.dropoff_type,
      dropoff_date: requestBody_dropoff?.dropoff_date,
      dropoff_time: requestBody_dropoff?.dropoff_time,
      booking_source: "web",
      // discount_coupon: ""
    };

    if (requestBody_pickup?.pickup_type === "self") {
      body.pickup_location_id = requestBody_pickup?.pickup_location_id;
    }
    if (requestBody_pickup?.pickup_type === "delivery") {
      body.pickup_city_id = requestBody_pickup?.pickup_city_id;
      body.pickup_coordinates = requestBody_pickup?.pickup_coordinates;
      body.pickup_address = requestBody_pickup?.pickup_address;
    }

    if (requestBody_dropoff?.dropoff_type === "collection") {
      body.dropoff_city_id = requestBody_dropoff?.dropoff_city_id;
      body.dropoff_coordinates = requestBody_dropoff?.dropoff_coordinates;
      body.dropoff_address = requestBody_dropoff?.dropoff_address;
    }
    if (requestBody_dropoff?.dropoff_type === "self") {
      body.dropoff_location_id = requestBody_dropoff?.dropoff_location_id;
    }

    if (requestBody_pickup?.booking_type === "monthly") {
      body.booking_months = requestBody_pickup?.booking_months;
    }
    if (requestBody_dropoff?.discount_coupon) {
      body.discount_coupon = requestBody_dropoff?.discount_coupon;
    }

    const baseUrl = `${configWeb.POST_CAR_SEARCH}?lang=${getApiLang(language)}&page=1&page_size=100&sort=ASC&car_id=${selectedCar?.id}&monthly_mileage=${selectedMileage}`; //car_id=1

    const url = selectedCar?.car_category
      ? `${baseUrl}&category_id=${selectedCar?.car_category}`
      : baseUrl;
    set_loading_for_car_rate_table(true);
    simplePostCall(url, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          dispatch(setCarArray(res?.data));

          // setTotalRecords(res?.total_records )
          // dispatch(setSelectedCar(null));
          mergeCarProperties(res?.data[0]);
        }

        if (res?.status === "success") {
          //  notifySuccess(res?.message)
        }
        if (res?.error) {
          // dispatch(setSelectedCar(null))
          //   if(Array.isArray(res?.message)){
          //     notifyError(res?.message[0]);
          //   } else{
          //   notifyError(res?.message);
          //   }
        }
      })
      .catch((error) => {
        console.log("validate pickuplocation api failed-->", error);
        // notifyError('Something went wwrong, please try again letter')
      })
      .finally(() => {
        set_loading_for_car_rate_table(false);
      });
  };
  const monthlyInstallment = async () => {
    const car_extras = [];

    if (addProtection.cdw) {
      car_extras.push({ type: "cdw" });
    }
    if (addProtection.driver) {
      car_extras.push({
        type: "driver",
        quantity: Number(babyDriver.driver),
      });
    }
    if (addProtection.scdw) {
      car_extras.push({ type: "scdw" });
    }
    if (addProtection.baby_seat) {
      car_extras.push({
        type: "baby_seat",
        quantity: Number(babyDriver.baby_seat),
      });
    }
    if (addProtection.pai) {
      car_extras.push({ type: "pai" });
    }
    if (addProtection.gps) {
      car_extras.push({ type: "gps" });
    }
    const body = {
      booking_type: requestBody_dropoff?.booking_type,
      car_id: selectedCar?.id,
      pickup_type: requestBody_pickup?.pickup_type,
      pickup_date: requestBody_dropoff?.pickup_date,
      pickup_time: requestBody_dropoff?.pickup_time,
      dropoff_type: requestBody_dropoff?.dropoff_type,
      dropoff_date: requestBody_dropoff?.dropoff_date,
      dropoff_time: requestBody_dropoff?.dropoff_time,
      payment_type:
        selectedCar?.payment_method === "pay_monthly_later" ? "later" : "now",
      car_extras: car_extras,
      booking_source: "web",
      // discount_coupon: ""
    };

    if (requestBody_pickup?.pickup_type === "self") {
      body.pickup_location_id = requestBody_pickup?.pickup_location_id;
    }
    if (requestBody_pickup?.pickup_type === "delivery") {
      body.pickup_city_id = requestBody_pickup?.pickup_city_id;
      body.pickup_coordinates = requestBody_pickup?.pickup_coordinates;
      body.pickup_address = requestBody_pickup?.pickup_address;
    }

    if (requestBody_dropoff?.dropoff_type === "collection") {
      body.dropoff_city_id = requestBody_dropoff?.dropoff_city_id;
      body.dropoff_coordinates = requestBody_dropoff?.dropoff_coordinates;
      body.dropoff_address = requestBody_dropoff?.dropoff_address;
    }
    if (requestBody_dropoff?.dropoff_type === "self") {
      body.dropoff_location_id = requestBody_dropoff?.dropoff_location_id;
    }

    if (requestBody_pickup?.booking_type === "monthly") {
      body.booking_months = requestBody_pickup?.booking_months;
    }
    if (requestBody_pickup?.booking_type === "monthly") {
      body.monthly_mileage = selectedMileage;
    }
    if (
      requestBody_pickup?.booking_type === "monthly" &&
      addProtection?.extra_km
    ) {
      body.extra_kms = addProtection?.extra_km;
    }
    if (requestBody_dropoff?.discount_coupon) {
      body.discount_coupon = requestBody_dropoff?.discount_coupon;
    }

    const baseUrl = configWeb.POST_MONTHLY_INSTALLMENT;

    setInstallmentTableLoading(true);
    simplePostCall(baseUrl, JSON.stringify(body))
      .then((res) => {
        if (!res?.error) {
          // mergeCarProperties(res?.data[0]);
          setMonthlyInstallmentArray(res || []);
        }

        if (res?.status === "success") {
          //  notifySuccess(res?.message)
        }
        if (res?.error) {
          // dispatch(setSelectedCar(null))
          //   if(Array.isArray(res?.message)){
          //     notifyError(res?.message[0]);
          //   } else{
          //   notifyError(res?.message);
          //   }
        }
      })
      .catch((error) => {
        console.log("validate pickuplocation api failed-->", error);
        // notifyError('Something went wwrong, please try again letter')
      })
      .finally(() => {
        setInstallmentTableLoading(false);
      });
  };

  useEffect(() => {
    if (requestBody_pickup?.booking_type === "monthly") monthlyInstallment();
  }, [
    selectedMileage,
    addProtection,
    babyDriver,
    requestBody_dropoff?.discount_coupon,
    /* requestBody_dropoff, */
  ]);

  useEffect(() => {
    if (carArrayTemp) {
      const filtereCarArrayTemp = filterCars(carArrayTemp, selectedCar);
      dispatch(setFilterCarArray(filtereCarArrayTemp));
    }
  }, [carArrayTemp, selectedCar]);

  const carExtra = () => {
    const body = {
      booking_type: requestBody_pickup?.booking_type,
      pickup_type: requestBody_pickup?.pickup_type,
      ...(requestBody_pickup?.pickup_type === "self" && {
        pickup_location_id: requestBody_pickup?.pickup_location_id,
        booking_source: "web",
      }),

      // "pickup_city_id": "required for pickup_type delivery",
      ...(requestBody_pickup?.pickup_type === "delivery" && {
        pickup_city_id: requestBody_pickup?.pickup_city_id,
      }),
      // "pickup_coordinates": "Custom location required for delivery",
      ...(requestBody_pickup?.pickup_type === "delivery" && {
        pickup_coordinates: requestBody_pickup?.pickup_coordinates,
      }),
      ...(requestBody_pickup?.pickup_type === "delivery" && {
        pickup_address: requestBody_pickup?.pickup_address,
      }),

      pickup_date: requestBody_pickup?.pickup_date,
      pickup_time: requestBody_pickup?.pickup_time,
      dropoff_type: requestBody_dropoff?.dropoff_type,
      dropoff_date: requestBody_dropoff?.dropoff_date,
      dropoff_time: requestBody_dropoff?.dropoff_time,
      car_id: selectedCar?.id,
      // "dropoff_location_id": "dropoff location id",
      ...(requestBody_dropoff?.dropoff_type === "self" && {
        dropoff_location_id: requestBody_dropoff?.dropoff_location_id,
      }),

      // "dropoff_city_id": "dropoff city id",
      ...(requestBody_dropoff?.dropoff_type === "collection" && {
        dropoff_city_id: requestBody_dropoff?.dropoff_city_id,
      }),

      // "dropoff_coordinates": "Custom location required for collection",
      ...(requestBody_dropoff?.dropoff_type === "collection" && {
        dropoff_coordinates: requestBody_dropoff?.dropoff_coordinates,
      }),
      ...(requestBody_dropoff?.dropoff_type === "collection" && {
        dropoff_address: requestBody_dropoff?.dropoff_address,
      }),

      // "months": "required for booking_type monthly",
      // ...(requestBody_dropoff?.booking_type === 'monthly' && { booking_months: requestBody_dropoff?.months }),
    };

    if (requestBody_pickup?.booking_type === "monthly") {
      body.booking_months = requestBody_pickup?.booking_months;
    }
    if (requestBody_pickup?.booking_type === "monthly") {
      body.monthly_mileage = selectedMileage;
    }
    if (requestBody_dropoff?.discount_coupon) {
      body.discount_coupon = requestBody_dropoff?.discount_coupon;
    }

    simplePostCall(configWeb.POST_CAR_EXTRA, JSON.stringify(body))
      .then((res) => {
        if (res?.status === "success") {
          //  notifySuccess(res?.message)
        }
        if (!res?.error) {
          dispatch(setCarExtraArray(res));
        }
        if (res?.error) {
          if (Array.isArray(res?.message)) {
            // notifyError(res?.message[0]);
          } else {
            // notifyError(res?.message);
          }
        }
      })
      .catch((error) => {
        console.log("validate pickuplocation api failed-->", error);
        // notifyError('Something went wwrong, please try again letter')
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (selectedCar) {
      carExtra();
    }
  }, [selectedCar?.id /* requestBody_dropoff */]);

  // Re-fetch car data when coupon is applied or removed
  const prevCouponRef = useRef(requestBody_dropoff?.discount_coupon);
  useEffect(() => {
    if (prevCouponRef.current !== requestBody_dropoff?.discount_coupon) {
      prevCouponRef.current = requestBody_dropoff?.discount_coupon;
      carSearch();
      if (selectedCar) carExtra();
    }
  }, [requestBody_dropoff?.discount_coupon]);

  // Revert payment method when both login and register modals are closed and user is not logged in
  useEffect(() => {
    if (!loginModalShow && !registerModalShow && !hasValidSession() && originalPaymentMethod) {
      const updatedCar = {
        ...selectedCar,
        payment_method: originalPaymentMethod
      };
      dispatch(setSelectedCar(updatedCar));
      setOriginalPaymentMethod(null);
    }
  }, [loginModalShow, registerModalShow]);

  const handleBookingClick = async () => {
    // Offer the pay-now discount only when paying now is actually possible.
    // With the CMI gateway off, this popup was advertising a 15% saving behind
    // a button that switched the booking to a payment method with no gateway.
    if (
      payNowEnabled &&
      !hasValidSession() &&
      (selectedCar?.payment_method === "pay_later" ||
        selectedCar?.payment_method === "pay_monthly_later")
    ) {
      setShowDiscountPopup(true);
    } else if (!hasValidSession()) {
      setLoginModalShow(true);
    } else if (selectedCar?.payment_method === "pay_monthly_now") {
      confirmBooking();
      // // Lower-case on purpose: "/PaymentSuccess" is a redirect route, and passing
      // through <Navigate> discarded both the query string and the router state,
      // so the confirmation page arrived with no booking id and no guest detail.
      navigate(`/paymentsuccess?id=${confirmBookingData?.id}`, guestBookingDetail ? { state: { guestBookingDetail } } : undefined);
    } else if (
      selectedCar?.payment_method === "pay_monthly_later" ||
      selectedCar?.payment_method === "pay_later"
    ) {
      confirmBooking();
    } else {
      confirmBooking();
    }
  };

  useEffect(() => {
    if (booking_number) {
      if (
        confirmBookingData?.id &&
        requestBody_pickup?.booking_type === "daily" &&
        (confirmBookingPayment === "later" ||
          (
            Number(total) - Number(editUserBookingObject?.total_amount)
          )?.toFixed(2) < 1)
      ) {
        // Lower-case on purpose: "/PaymentSuccess" is a redirect route, and passing
      // through <Navigate> discarded both the query string and the router state,
      // so the confirmation page arrived with no booking id and no guest detail.
      navigate(`/paymentsuccess?id=${confirmBookingData?.id}`, guestBookingDetail ? { state: { guestBookingDetail } } : undefined);
      }

      // New condition for 'now' payment type and monthly booking
      if (
        confirmBookingData?.id &&
        // confirmBookingPayment === "now" &&
        requestBody_pickup?.booking_type === "monthly" &&
        Number(monthlyInstallmentArray?.installments?.[0]?.total_amount) -
          Number(
            editUserBookingObject?.monthly_installments?.[0]?.actual_amount
          ) <
          1
      ) {
        // Lower-case on purpose: "/PaymentSuccess" is a redirect route, and passing
      // through <Navigate> discarded both the query string and the router state,
      // so the confirmation page arrived with no booking id and no guest detail.
      navigate(`/paymentsuccess?id=${confirmBookingData?.id}`, guestBookingDetail ? { state: { guestBookingDetail } } : undefined);
      }
    } else if (confirmBookingData?.id && confirmBookingPayment === "later") {
      // Lower-case on purpose: "/PaymentSuccess" is a redirect route, and passing
      // through <Navigate> discarded both the query string and the router state,
      // so the confirmation page arrived with no booking id and no guest detail.
      navigate(`/paymentsuccess?id=${confirmBookingData?.id}`, guestBookingDetail ? { state: { guestBookingDetail } } : undefined);
    }

    return () => {};
  }, [confirmBookingData?.id]);

  const mergeCarProperties = (car) => {
    // Create a copy of selectedCar
    const updatedSelectedCar = { ...selectedCar };

    // Loop through the properties of the car object and update the selectedCar object
    for (const key in car) {
      if (
        car?.hasOwnProperty(key) &&
        key !== "payment_method" &&
        key !== "car_category"
      ) {
        updatedSelectedCar[key] = car[key];
      }
    }
    dispatch(setSelectedCar(updatedSelectedCar));

    // Return the updated selectedCar object
    // return updatedSelectedCar;
  };
  const findMatchingKey = (km_object, activeKM) => {
    for (let key in km_object) {
      if (km_object[key] === activeKM) {
        return key;
      }
    }
    return null; // Return null if no match is found
  };

  const calculateSubTotal = (
    selectedCar,
    addProtection,
    carExtraArray,
    babyDriver
  ) => {
    let total = 0;

    // Add Car Rate
    total +=
      selectedCar?.payment_method === "pay_monthly_now" ||
      selectedCar?.payment_method === "pay_monthly_later"
        ? selectedCar?.car_rate_total
        : selectedCar?.payment_method === "pay_later"
        ? selectedCar?.pay_later
        : selectedCar?.pay_now;

    // Add conditional values
    if (addProtection.pai) {
      total += Number(carExtraArray?.[0]?.pai);
    }
    if (addProtection.cdw) {
      total += Number(carExtraArray?.[0]?.cdw);
    }
    if (addProtection.scdw) {
      total += Number(carExtraArray?.[0]?.scdw);
    }
    if (addProtection.baby_seat) {
      total +=
        Number(carExtraArray?.[0]?.baby_seat) * Number(babyDriver.baby_seat);
    }
    if (addProtection.gps) {
      total += Number(carExtraArray?.[0]?.gps);
    }
    if (addProtection.driver) {
      total += Number(carExtraArray?.[0]?.driver) * Number(babyDriver.driver);
    }
    if (addProtection?.activeKM) {
      total +=
        Number(addProtection?.activeKM) * Number(selectedCar?.booking_months);
    }

    // Add fixed values
    total +=
      selectedCar?.pickup_parking_charges !== "0" &&
      selectedCar?.pickup_parking_charges !== 0
        ? Number(selectedCar?.pickup_parking_charges)
        : 0;
    total +=
      selectedCar?.dropoff_parking_charges !== "0" &&
      selectedCar?.dropoff_parking_charges !== 0
        ? Number(selectedCar?.dropoff_parking_charges)
        : 0;
    total +=
      selectedCar?.delivery_charges !== "0" &&
      selectedCar?.delivery_charges !== 0
        ? Number(selectedCar?.delivery_charges)
        : 0;
    total +=
      selectedCar?.collection_charges !== "0" &&
      selectedCar?.collection_charges !== 0
        ? Number(selectedCar?.collection_charges)
        : 0;
    total +=
      selectedCar?.inter_cities_charges !== "0" &&
      selectedCar?.inter_cities_charges !== 0
        ? Number(selectedCar?.inter_cities_charges)
        : 0;
    total +=
      selectedCar?.vmd_charges !== "0" && selectedCar?.vmd_charges !== 0
        ? Number(selectedCar?.vmd_charges)
        : 0;
    // total -=
    //   selectedCar?.discount !== "0" && selectedCar?.discount !== 0
    //     ? Number(selectedCar?.discount)
    //     : 0;

    return total.toFixed(2); // Return total with two decimal places
  };

  const subTotal = calculateSubTotal(
    selectedCar,
    addProtection,
    carExtraArray,
    babyDriver
  );

  // No VAT is charged. This used to add a hard-coded 5% (the UAE rate) on top of
  // the subtotal, client-side and regardless of the backend setting — which is 0
  // — so every checkout total was inflated by 5% against what the API had
  // priced. `vat` is kept at 0 rather than deleted because it still feeds the
  // totalWithVAT props and the printed booking summary.
  const vat = 0;
  const total = Number(subTotal).toFixed(2);

  /**
   * Pay-now bookings in Morocco are paid via CMI's hosted 3-D Secure page
   * (replaces the on-site card entry). We ask the backend to build the
   * signed est3Dgate form, then auto-submit it so the browser leaves for CMI.
   */
  const redirectToCmi = async (bookingId) => {
    if (!bookingId) {
      notifyError("Unable to start payment. Please try again.");
      return;
    }
    const cmiLang =
      language === "ae" || language === "ar" ? "ar" : language === "en" ? "en" : "fr";
    try {
      const res = await simplePostCallAuth(
        configWeb.POST_CMI_INITIATE,
        JSON.stringify({ booking_id: bookingId, lang: cmiLang })
      );
      if (res?.status === "success" && res?.gateway_url && res?.request_data) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = res.gateway_url;
        Object.entries(res.request_data).forEach(([name, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value == null ? "" : String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        notifyError(res?.message || "Unable to start payment. Please try again.");
      }
    } catch (error) {
      console.log("CMI initiate failed:", error);
      notifyError("Payment initialization failed. Please try again.");
    }
  };

  // `guestIdentifier` — the email or mobile a customer typed instead of logging
  // in. When present the request goes to the unauthenticated guest endpoint,
  // which resolves that identifier to a customer record server-side. Everything
  // else about the payload, and everything after the response, is identical.
  // `guest` is the object the checkout modal builds: full name, dialling code,
  // mobile and (optionally) email. A bare string is still accepted so nothing
  // that calls this with the old single identifier breaks.
  const confirmBooking = async (guest) => {
    const guestDetails =
      typeof guest === "string" ? { identifier: guest } : guest || null;
    return new Promise((resolve, reject) => {
      const car_extras = [];

      if (addProtection.cdw) {
        car_extras.push({ type: "cdw" });
      }
      if (addProtection.driver) {
        car_extras.push({
          type: "driver",
          quantity: Number(babyDriver.driver),
        });
      }
      if (addProtection.scdw) {
        car_extras.push({ type: "scdw" });
      }
      if (addProtection.baby_seat) {
        car_extras.push({
          type: "baby_seat",
          quantity: Number(babyDriver.baby_seat),
        });
      }
      if (addProtection.pai) {
        car_extras.push({ type: "pai" });
      }
      if (addProtection.gps) {
        car_extras.push({ type: "gps" });
      }
      const body = {
        booking_type: requestBody_dropoff?.booking_type,
        car_id: selectedCar?.id,
        pickup_type: requestBody_pickup?.pickup_type,
        pickup_date: requestBody_dropoff?.pickup_date,
        pickup_time: requestBody_dropoff?.pickup_time,
        dropoff_type: requestBody_dropoff?.dropoff_type,
        dropoff_date: requestBody_dropoff?.dropoff_date,
        dropoff_time: requestBody_dropoff?.dropoff_time,
        booking_source: "web",
        payment_type:
          selectedCar?.payment_method === "pay_now" ||
          selectedCar?.payment_method === "pay_monthly_now"
            ? "now"
            : selectedCar?.payment_method === "pay_later" ||
              selectedCar?.payment_method === "pay_monthly_later"
            ? "later"
            : "now",

        // discount_coupon: ""

        car_extras: car_extras,
      };

      if (requestBody_pickup?.pickup_type === "self") {
        body.pickup_location_id = requestBody_pickup?.pickup_location_id;
      }
      if (requestBody_pickup?.pickup_type === "delivery") {
        body.pickup_city_id = requestBody_pickup?.pickup_city_id;
        body.pickup_coordinates = requestBody_pickup?.pickup_coordinates;
        body.pickup_address = requestBody_pickup?.pickup_address;
      }

      if (requestBody_dropoff?.dropoff_type === "collection") {
        body.dropoff_city_id = requestBody_dropoff?.dropoff_city_id;
        body.dropoff_coordinates = requestBody_dropoff?.dropoff_coordinates;
        body.dropoff_address = requestBody_dropoff?.dropoff_address;
      }
      if (requestBody_dropoff?.dropoff_type === "self") {
        body.dropoff_location_id = requestBody_dropoff?.dropoff_location_id;
      }

      if (requestBody_pickup?.booking_type === "monthly") {
        body.booking_months = requestBody_pickup?.booking_months;
      }
      if (requestBody_pickup?.booking_type === "monthly") {
        body.monthly_mileage = selectedMileage;
      }
      if (requestBody_dropoff?.discount_coupon) {
        body.discount_coupon = requestBody_dropoff?.discount_coupon;
      }
      if (booking_number) {
        body.booking_number = booking_number;
      }

      if (
        requestBody_pickup?.booking_type === "monthly" &&
        addProtection?.activeKM
      ) {
        // const matchingKey = findMatchingKey(km_object, addProtection?.activeKM);
        body.extra_kms = addProtection?.extra_km;
      }
      const baseUrl = `${configWeb.POST_CONFIRM_BOOKING}?lang=${getApiLang(language)}&page=1&page_size=100&sort=ASC`; //car_id=1

      const url = selectedCar?.car_category
        ? `${baseUrl}&category_id=${selectedCar?.car_category}`
        : baseUrl;
      setLoading_confirmBookin(true);

      if (guestDetails) {
        body.identifier = guestDetails.identifier;
        if (guestDetails.full_name) body.full_name = guestDetails.full_name;
        if (guestDetails.email) body.email = guestDetails.email;
        if (guestDetails.phone_number) {
          body.phone_code = guestDetails.phone_code;
          body.phone_number = guestDetails.phone_number;
        }
      }

      const request = guestDetails
        ? simplePostCall(configWeb.POST_GUEST_BOOKING, JSON.stringify(body))
        : simplePostCallAuth(
            booking_number
              ? configWeb.POST_EDIT_BOOKING
              : configWeb.POST_CONFIRM_BOOKING,
            JSON.stringify(body)
          );

      request
        .then((res) => {
          if (res?.status === "success") {
            //  notifySuccess(res?.message)

            // if (
            //               !(selectedCar?.payment_method === "pay_later") ||
            //   !(selectedCar?.payment_method === "pay_monthly_later")

            // ) {
            //   setCardModalShow(true);
            // }
            // ReactGA.event({
            //   category: 'Booking',
            //   action: 'booking_confirm',
            //   label: 'user has confirm the booking',
            // });

            window.gtag?.("event", "select_item", {
              item_list_id: `${
                requestBody_pickup?.pickup_location_id
                  ? requestBody_pickup?.pickup_location_id
                  : `delivery_${requestBody_pickup?.pickup_city_id}`
              } + ${
                requestBody_dropoff?.dropoff_location_id
                  ? requestBody_dropoff?.dropoff_location_id
                  : `collection_${requestBody_dropoff?.dropoff_city_id}`
              }`,
              // item_list_name: "Related products",
              items: [
                {
                  item_id: selectedCar?.id,
                  item_name: selectedCar?.car_name,
                  affiliation: "Route Facile",
                  coupon: selectedCar?.coupon,
                  discount: selectedCar?.discount,
                  index: 0,
                  item_brand: selectedCar?.brand,
                  item_category: selectedCar?.category,
                  // item_category2: "Adult",
                  // item_category3: "Shirts",
                  // item_category4: "Crew",
                  // item_category5: "Short sleeve",
                  item_list_id: `${
                    requestBody_pickup?.pickup_location_id
                      ? requestBody_pickup?.pickup_location_id
                      : `delivery_${requestBody_pickup?.pickup_city_id}`
                  } + ${
                    requestBody_dropoff?.dropoff_location_id
                      ? requestBody_dropoff?.dropoff_location_id
                      : `collection_${requestBody_dropoff?.dropoff_city_id}`
                  }`,
                  // item_list_name: "Related Products",
                  item_variant: selectedCar?.payment_method,
                  location_id: selectedCar?.city_id,
                  price:
                    requestBody_pickup?.booking_type === "daily"
                      ? parseFloat(total || 0)
                      : parseFloat(
                          monthlyInstallmentArray?.installments?.[0]
                            ?.total_amount || 0
                        ),
                  quantity: 1,
                },
                ...enabledExtras,
              ],
            });

            window.gtag?.("event", "view_cart", {
              currency: "MAD",
              value:
                requestBody_pickup?.booking_type === "daily"
                  ? parseFloat(total || 0)
                  : parseFloat(
                      monthlyInstallmentArray?.installments?.[0]
                        ?.total_amount || 0
                    ),

              items: [
                {
                  item_id: selectedCar?.id,
                  item_name: selectedCar?.car_name,
                  affiliation: "Route Facile",
                  coupon: selectedCar?.coupon,
                  discount: selectedCar?.discount,
                  index: 0,
                  item_brand: selectedCar?.brand,
                  item_category: selectedCar?.category,
                  // item_category2: "Adult",
                  // item_category3: "Shirts",
                  // item_category4: "Crew",
                  // item_category5: "Short sleeve",
                  item_list_id: `${
                    requestBody_pickup?.pickup_location_id
                      ? requestBody_pickup?.pickup_location_id
                      : `delivery_${requestBody_pickup?.pickup_city_id}`
                  } + ${
                    requestBody_dropoff?.dropoff_location_id
                      ? requestBody_dropoff?.dropoff_location_id
                      : `collection_${requestBody_dropoff?.dropoff_city_id}`
                  }`,
                  // item_list_name: "Related Products",
                  item_variant: selectedCar?.payment_method,
                  location_id: selectedCar?.city_id,
                  price:
                    requestBody_pickup?.booking_type === "daily"
                      ? parseFloat(total || 0)
                      : parseFloat(
                          monthlyInstallmentArray?.installments?.[0]
                            ?.total_amount || 0
                        ),
                  quantity: 1,
                },
                ...enabledExtras,
              ],
            });

            const carExtras41 = enabledExtras?.map((item) => ({
              id: item.item_id,
              quantity: item.quantity,
            }));

            const contents = [
              {
                id: selectedCar?.id,
                quantity: 1,
              },
              ...carExtras41,
            ];

            const numItem = contents?.length;
            const value =
              requestBody_pickup?.booking_type === "daily"
                ? total
                : monthlyInstallmentArray?.installments?.[0]?.total_amount;

            const contentIds = contents?.map((item) => item?.id);

            pixelInitiateCheckoutEvent(
              contentIds,
              contents,
              value,
              "MAD",
              numItem
            );

            if (selectedCar?.payment_method === "pay_later") {
              window.gtag?.("event", "add_payment_info", {
                currency: "MAD",
                value:
                  requestBody_pickup?.booking_type === "daily"
                    ? parseFloat(total || 0)
                    : parseFloat(
                        monthlyInstallmentArray?.installments?.[0]
                          ?.total_amount || 0
                      ),

                coupon: selectedCar?.coupon,
                payment_type:
                  requestBody_pickup?.booking_type === "daily"
                    ? selectedCar?.payment_method === "pay_now"
                      ? "Credit Card"
                      : "Cash On Delivery"
                    : selectedCar?.payment_method === "pay_monthly_now"
                    ? "Credit Card"
                    : "Cash On Delivery",
                items: [
                  {
                    item_id: selectedCar?.id,
                    item_name: selectedCar?.car_name,
                    affiliation: "Route Facile",
                    coupon: selectedCar?.coupon,
                    discount: selectedCar?.discount,
                    index: 0,
                    item_brand: selectedCar?.brand,
                    item_category: selectedCar?.category,
                    // item_category2: "Adult",
                    // item_category3: "Shirts",
                    // item_category4: "Crew",
                    // item_category5: "Short sleeve",
                    item_list_id: `${
                      requestBody_pickup?.pickup_location_id
                        ? requestBody_pickup?.pickup_location_id
                        : `delivery_${requestBody_pickup?.pickup_city_id}`
                    } + ${
                      requestBody_dropoff?.dropoff_location_id
                        ? requestBody_dropoff?.dropoff_location_id
                        : `collection_${requestBody_dropoff?.dropoff_city_id}`
                    }`,
                    // item_list_name: "Related Products",
                    item_variant: selectedCar?.payment_method,
                    location_id: selectedCar?.city_id,
                    price:
                      requestBody_pickup?.booking_type === "daily"
                        ? parseFloat(total || 0)
                        : parseFloat(
                            monthlyInstallmentArray?.installments?.[0]
                              ?.total_amount || 0
                          ),
                    quantity: 1,
                  },
                  ...enabledExtras,
                ],
              });

              window.gtag?.("event", "begin_checkout", {
                currency: "MAD",
                value:
                  requestBody_pickup?.booking_type === "daily"
                    ? parseFloat(total || 0)
                    : parseFloat(
                        monthlyInstallmentArray?.installments?.[0]
                          ?.total_amount || 0
                      ),

                coupon: selectedCar?.coupon,
                items: [
                  {
                    item_id: selectedCar?.id,
                    item_name: selectedCar?.car_name,
                    affiliation: "Route Facile",
                    coupon: selectedCar?.coupon,
                    discount: selectedCar?.discount,
                    index: 0,
                    item_brand: selectedCar?.brand,
                    item_category: selectedCar?.category,
                    // item_category2: "Adult",
                    // item_category3: "Shirts",
                    // item_category4: "Crew",
                    // item_category5: "Short sleeve",
                    item_list_id: `${
                      requestBody_pickup?.pickup_location_id
                        ? requestBody_pickup?.pickup_location_id
                        : `delivery_${requestBody_pickup?.pickup_city_id}`
                    } + ${
                      requestBody_dropoff?.dropoff_location_id
                        ? requestBody_dropoff?.dropoff_location_id
                        : `collection_${requestBody_dropoff?.dropoff_city_id}`
                    }`,
                    // item_list_name: "Related Products",
                    item_variant: selectedCar?.payment_method,
                    location_id: selectedCar?.city_id,
                    price:
                      requestBody_pickup?.booking_type === "daily"
                        ? parseFloat(total || 0)
                        : parseFloat(
                            monthlyInstallmentArray?.installments?.[0]
                              ?.total_amount || 0
                          ),
                    quantity: 1,
                  },
                  ...enabledExtras,
                ],
              });
            }
            if (booking_number) {
              if (requestBody_pickup?.booking_type === "monthly") {
                const amountToPay =
                  Number(
                    monthlyInstallmentArray?.installments?.[0]?.total_amount
                  ) -
                  Number(
                    editUserBookingObject?.monthly_installments?.[0]
                      ?.actual_amount
                  );
                const shouldShowCardModal =
                  amountToPay > 0 &&
                  selectedCar?.payment_method === "pay_monthly_now";
                if (shouldShowCardModal) {
                  redirectToCmi(res?.booking?.id);
                }
              } else {
                const amountToPay =
                  Number(total) - Number(editUserBookingObject?.total_amount);
                const shouldShowCardModal =
                  amountToPay > 0 &&
                  selectedCar?.payment_method !== "pay_later" &&
                  selectedCar?.payment_method !== "pay_monthly_later";

                if (shouldShowCardModal) {
                  redirectToCmi(res?.booking?.id);
                }
              }
            } else {
              // If booking_number doesn't exist, keep the original conditions
              if (
                selectedCar?.payment_method === "pay_now" ||
                selectedCar?.payment_method === "pay_monthly_now"
              ) {
                redirectToCmi(res?.booking?.id);
              }
            }

            setConfirmBookingData(res?.booking);
            if (res?.detail) setGuestBookingDetail(res.detail);
            setConfirmBookingPayment(res?.payment_type);
            resolve(true);
          } else {
            resolve(false);
            // Never show the raw API string to a customer mid-booking. A 401
            // here only means "not signed in", which is not an error at all —
            // the guest checkout modal is the answer and it is already on
            // screen, so a red "Unauthorized" toast is pure noise. Anything
            // else gets one plain sentence in the customer's language.
            const status = res?.statusCode || res?.status;
            const raw = Array.isArray(res?.message) ? res.message[0] : res?.message;
            const isAuthNoise = status === 401 || /unauthorized/i.test(String(raw || ""));
            if (!isAuthNoise) {
              notifyError(t("Something went wrong, please try again later"));
            }
          }
        })
        .catch((error) => {
          console.log("confirm booking request failed-->", error);
          const status = error?.statusCode || error?.status || error?.response?.status;
          if (status !== 401) {
            notifyError(t("Something went wrong, please try again later"));
          }
          resolve(false);
        })
        .finally(() => {
          setLoading_confirmBookin(false);
        });
    });
  };

  const KM_PLAN = () => {
    const url = configWeb.GET_KM_PLAN(selectedCar?.rate_id);
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_km_object(res);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {});
  };
  const GET_MONTHLY_UPGRADE_MILEAGE_PLAN = (booking_months) => {
    setMonthlyMileageLoading(true);
    const url = configWeb.GET_MONTHLY_UPGRADE_MILEAGE_PLAN(
      selectedCar?.id,
      selectedCar?.city_id,
      booking_months
    );
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_mileage_plan_array(res?.data);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {
        setMonthlyMileageLoading(false);
      });
  };
  const GET_MONTHLY_PLANS = () => {
    const url = configWeb.GET_MONTHLY_PLANS(
      selectedCar?.id,
      selectedCar?.city_id,
      selectedMileage
    );
    setGetMonthlyPlansLoading(true);
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          set_monthly_plan_array(res?.data);
        }
      })
      .catch((error) => {
        console.error("Banner failed:", error);
      })
      .finally(() => {
        setGetMonthlyPlansLoading(false);
        // dispatch(setSelectedMonthlyPlan(""));
      });
  };

  useEffect(() => {
    if (
      (selectedCar?.payment_method === "pay_monthly_now" ||
        selectedCar?.payment_method === "pay_monthly_later") &&
      /* selectedCar?.group_id */ selectedCar?.rate_id
    ) {
      // KM_PLAN();
    }
  }, [selectedCar?.rate_id]);

  useEffect(() => {
    if (
      (selectedCar?.payment_method === "pay_monthly_now" ||
        selectedCar?.payment_method === "pay_monthly_later") &&
      selectedCar?.group_id
    ) {
      GET_MONTHLY_UPGRADE_MILEAGE_PLAN(selectedCar?.booking_months);
    }
  }, [selectedCar?.id]);
  useEffect(() => {
    if (
      (selectedCar?.payment_method === "pay_monthly_now" ||
        selectedCar?.payment_method === "pay_monthly_later") &&
      selectedCar?.id &&
      selectedMileage &&
      selectedCar?.city_id
    ) {
      GET_MONTHLY_PLANS();
    }
  }, [selectedCar?.id, selectedMileage, selectedCar?.city_id]);

  useEffect(() => {
    window.gtag?.("event", "view_item", {
      currency: "MAD",
      value:
        requestBody_pickup?.booking_type === "monthly"
          ? parseFloat(selectedCar?.car_rate_total || 0)
          : selectedCar?.payment_method === "pay_now"
          ? parseFloat(selectedCar?.pay_now || 0)
          : parseFloat(selectedCar?.pay_later || 0),
      items: [
        {
          item_id: selectedCar?.id,
          item_name: selectedCar?.car_name,
          affiliation: "Route Facile",
          coupon: selectedCar?.coupon_code,
          discount: selectedCar?.discount,
          index: 0,
          item_brand: selectedCar?.brand,
          item_category: selectedCar?.category,
          // item_category2: "Adult",
          // item_category3: "Shirts",
          // item_category4: "Crew",
          // item_category5: "Short sleeve",
          // item_list_id: `${requestBody_pickup?.pickup_location_id ? requestBody_pickup?.pickup_location_id  : `delivery_${requestBody_pickup?.pickup_city_id}` } + ${requestBody_dropoff?.dropoff_location_id ? requestBody_dropoff?.dropoff_location_id : `collection_${requestBody_dropoff?.dropoff_city_id}`}`,
          // item_list_name: "Related Products",
          item_variant: selectedCar?.payment_method,
          location_id: selectedCar?.city_id,
          price:
            requestBody_pickup?.booking_type === "monthly"
              ? parseFloat(selectedCar?.car_rate_total || 0)
              : selectedCar?.payment_method === "pay_now"
              ? parseFloat(selectedCar?.pay_now || 0)
              : parseFloat(selectedCar?.pay_later || 0),
          quantity: 1,
        },
      ],
    });
  }, []);

  useEffect(() => {
    if (carExtraArray) {
      const items =
        Array.isArray(carExtraArray) &&
        carExtraArray &&
        carExtraArray?.flatMap((extra, index) => [
          {
            item_id: "pai",
            item_name: "pai",
            index: 0,
            item_category: "car extra",
            price: parseFloat(extra.pai),
            quantity: 1,
          },
          {
            item_id: "cdw",
            item_name: "cdw",
            index: 1,
            item_category: "car extra",
            price: parseFloat(extra.cdw),
            quantity: 1,
          },
          {
            item_id: "scdw",
            item_name: "scdw",
            index: 2,
            item_category: "car extra",
            price: parseFloat(extra.scdw),
            quantity: 1,
          },
          {
            item_id: "baby_seat",
            item_name: "baby_seat",
            index: 3,
            item_category: "car extra",
            price: parseFloat(extra.baby_seat),
            quantity: 1,
          },
          {
            item_id: "gps",
            item_name: "gps",
            index: 4,
            item_category: "car extra",
            price: parseFloat(extra.gps),
            quantity: 1,
          },
          {
            item_id: "driver",
            item_name: "driver",
            index: 5,
            item_category: "car extra",
            price: parseFloat(extra.driver),
            quantity: 1,
          },
        ]);

      window.gtag?.("event", "view_item_list", {
        item_list_id: `${
          requestBody_pickup?.pickup_location_id
            ? requestBody_pickup?.pickup_location_id
            : `delivery_${requestBody_pickup?.pickup_city_id}`
        } + ${
          requestBody_dropoff?.dropoff_location_id
            ? requestBody_dropoff?.dropoff_location_id
            : `collection_${requestBody_dropoff?.dropoff_city_id}`
        }`,
        // item_list_name: "Car Extra",
        items: items,
      });
    }
  }, [carExtraArray]);

  useEffect(() => {
    if (selectedCar.id) {
      const contentType = "Product";
      const contentIds = selectedCar?.id;
      const value =
        requestBody_pickup?.booking_type === "monthly"
          ? selectedCar?.car_rate_total
          : selectedCar?.payment_method === "pay_now"
          ? selectedCar?.pay_now
          : selectedCar?.pay_later;

      pixelViewContentEvent(contentType, contentIds, value);
    }
  }, [selectedCar.id]);

  const { shiftsHooks } = useDropoffLocationHours(
    requestBody_dropoff,
    monthlyInstallment,
    carSearchForTotalRateAfterMileAge,
    carExtra,
    GET_MONTHLY_UPGRADE_MILEAGE_PLAN,
    requestBody_pickup
  );

  return (
    <div className="booking__detailsTwo__section">
      <MetaHelmet
        title={t("Choose Your Extras")}
        description=""
        keywords="car rental, affordable cars, rent a car"
        noindex={true}
        canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/bookingdetailstwo`}
      />
      {/* <section className="form-section">
        <BookingAddressSection />
      </section> */}
      <section className="p-1 form-section bg-dange">
        <Col lg="12" md="12" sm="12">
          <section className="form-section">
            <BookingAddressSection />
          </section>
        </Col>
      </section>
      <section>
        <Container dir='ltr'>
          <BookingStepper
          //  set_edit_edit_form={set_edit_edit_form}
          />
        </Container>
      </section>

      <Container>
        <Row className="g-md-0 ">
          <Col lg="6" md="12" sm="12">
            <Col lg="12" md="12" sm="12">
              <section className="car__details__section pb-0 mt-2">
                <Container>
                  <Card className="mt-1- shadow border-0 min-height-mileage-box">
                    <Card.Header className="car__details__header">
                      {t("Add Protection")}
                    </Card.Header>
                    <Card.Body>
                      <div className="container px-sm-4 px-md-2">
                        <div className="d-flex flex-column protection-items-container">
                          <div className="protection-item">
                            <div className="d-flex align-items-center px-0">
                              <div className="img-div d-flex gap-2 align-items-center" style={{ flex: "1" }}>
                                <label className="Protectin-add-on">
                                  {t("Personal Accident Insurance (PAI)")}
                                </label>
                              </div>
                              {/* <div className="protection__details__div"> */}
                              {/* <label className="Protectin-add-on col-6">
                            Personal Accident Insurance (PAI)
                          </label> */}
                              <p className="title-price mb-0 mx-3">
                                {fmt(requestBody_pickup?.booking_type === "daily"
                                  ? carExtraArray?.[0]?.pai
                                  : carExtraArray?.[0]?.pai_per_month_rate)}
                              </p>
                              <div className="d-flex justify-content-end">
                                {/* <label>View Details</label> */}
                                <Form.Check
                                  type="switch"
                                  id="custom-switch-pai"
                                  name="pai"
                                  // checked={setAddProtection.pai}
                                  checked={addProtection.pai}
                                  onChange={handleAddProtecionChange}
                                  disabled={
                                    carExtraArray?.[0]?.pai == 0 ||
                                    !carExtraArray?.[0]?.pai
                                  }
                                />
                              </div>
                              {/* </div> */}
                            </div>
                          </div>
                          <div className="protection-item">
                            <div className="d-flex px-0 align-items-center">
                              <div className="img-div  d-flex gap-2 align-items-center" style={{ flex: "1" }}>
                                <img src={proImg3} alt="SCDW" />
                                <label className="Protectin-add-on">
                                  {t("Super Collision Damage Waiver (SCDW)")}
                                </label>
                              </div>
                              {/* <div className="protection__details__div no-wrap"> */}

                              <p className="title-price mb-0 mx-3">
                                {fmt(requestBody_pickup?.booking_type === "daily"
                                  ? carExtraArray?.[0]?.scdw
                                  : carExtraArray?.[0]?.scdw_per_month_rate)}
                              </p>
                              <div className="d-flex justify-content-end">
                                {/* <label>View Details</label> */}
                                <Form.Check // prettier-ignore
                                  type="switch"
                                  id="custom-switch-scdw"
                                  name="scdw"
                                  // checked={setAddProtection.scdw}
                                  checked={addProtection.scdw}
                                  onChange={handleAddProtecionChange}
                                  disabled={
                                    carExtraArray?.[0]?.scdw == 0 ||
                                    !carExtraArray?.[0]?.scdw
                                  }
                                />
                              </div>
                              {/* </div> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Container>
              </section>
            </Col>

            <Col lg="12" md="12" sm="12">
              <section className="car__details__section pt-0 mt-2">
                <Container>
                  <Card className="mt-5- shadow border-0">
                    <Card.Header className="car__details__header">
                      {t("Rental Add-ons")}
                    </Card.Header>
                    <Card.Body>
                      <div className="container px-sm-4 px-md-2">
                        <div className="d-flex flex-column protection-items-container">
                          <div className="protection-item">
                            <div className="d-flex px-0 align-items-center">
                              <div className="img-div d-flex gap-2 align-items-center" style={{ flex: "1" }}>
                                <img src={proImg4} alt="Baby Seat" />
                                <label className="Protectin-add-on no-wrap">
                                  {t("Baby Seat")}
                                </label>
                              </div>
                              {/* <div className="protection__details__div "> */}
                              {/* <div className="d-flex justify-content-between"> */}
                              {/* <div> */}

                              <p className="title-price mb-0 mx-3">
                                {fmt(requestBody_pickup?.booking_type === "daily"
                                  ? carExtraArray?.[0]?.baby_seat
                                  : carExtraArray?.[0]
                                      ?.baby_seat_per_month_rate)}
                              </p>
                              {/* </div> */}
                              <Form.Control
                                type="number"
                                // disabled
                                name="baby_seat"
                                className="text-center"
                                placeholder="0"
                                style={{
                                  height: "max-content",
                                  width: "60px",
                                  marginRight: "12px",
                                }}
                                value={babyDriver.baby_seat}
                                onChange={babySeatAndDriver}
                                // onBlur={babySeatAndDriverBlur}
                                min="1" // Ensure the input field UI prevents entering values less than 1
                                max="3"
                                disabled={
                                  !addProtection.baby_seat ||
                                  carExtraArray?.[0]?.baby_seat == 0 ||
                                  !carExtraArray?.[0]?.baby_seat
                                }
                              />
                              {/* </div> */}

                              <div className="d-flex justify-content-end">
                                {/* <label>View Details</label> */}
                                <Form.Check // prettier-ignore
                                  type="switch"
                                  id="custom-switch-baby-seat"
                                  name="baby_seat"
                                  // checked={setAddProtection.baby_seat}
                                  checked={addProtection.baby_seat}
                                  onChange={handleAddProtecionChange}
                                  disabled={
                                    carExtraArray?.[0]?.baby_seat == 0 ||
                                    !carExtraArray?.[0]?.baby_seat
                                  }
                                />
                              </div>
                              {/* </div> */}
                            </div>
                          </div>
                          {/*  
                          <div class="col">
                            <div class="p-sm-3 p-md-0">
                              <div className="d-flex- px-0 align-items-center mb-1 row">
                                <div className="img-div d-flex gap-2 align-items-center col-6">
                                  <img src={proImg5} alt="PAI" />
                                  <label className="Protectin-add-on">
                                    {t("Navigation System")}
                                  </label>
                                </div>
                                <p className="title-price mb-0 col">
                                  {fmt(requestBody_pickup?.booking_type === "daily"
                                    ? carExtraArray?.[0]?.gps
                                    : carExtraArray?.[0]?.gps_per_month_rate)}
                                </p>
                                <div className="col"></div>
                                <div className="d-flex justify-content-end col">
                                  <Form.Check // prettier-ignore
                                    type="switch"
                                    id="custom-switch"
                                    name="gps"
                                    // checked={setAddProtection.gps}
                                    checked={addProtection.gps}
                                    onChange={handleAddProtecionChange}
                                    disabled={
                                      carExtraArray?.[0]?.gps == 0 ||
                                      !carExtraArray?.[0]?.gps
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                           */}         
                          {/* Shown only when the branch actually sells it. A row
                              priced at zero and greyed out reads as a fault to
                              the customer, not as an unavailable option. */}
                          {Number(carExtraArray?.[0]?.driver) > 0 && (
                          <div className="protection-item">
                            <div className="d-flex px-0 align-items-center">
                              <div className="img-div d-flex gap-2 align-items-center" style={{ flex: "1" }}>
                                <img src={proImg6} alt="Additional Driver" />
                                <label className="Protectin-add-on no-wrap">
                                  {t("Additional Driver")}
                                </label>
                              </div>
                              {/* <div className="protection__details__div no-wrap"> */}
                              {/* <div className="d-flex justify-content-between"> */}

                              <p className="title-price mb-0 mx-3">
                                {fmt(requestBody_pickup?.booking_type === "daily"
                                  ? carExtraArray?.[0]?.driver
                                  : carExtraArray?.[0]?.driver_per_month_rate)}
                              </p>

                              <Form.Control
                                type="number"
                                name="driver"
                                className="text-center"
                                placeholder="0"
                                style={{
                                  height: "max-content",
                                  width: "60px",
                                  marginRight: "12px",
                                }}
                                value={babyDriver.driver}
                                onChange={babySeatAndDriver}
                                // onBlur={babySeatAndDriverBlur}
                                min="1"
                                max="3"
                                disabled={
                                  !addProtection.driver ||
                                  carExtraArray?.[0]?.driver == 0 ||
                                  !carExtraArray?.[0]?.driver
                                }
                              />
                              {/* </div> */}
                              <div className="d-flex justify-content-end">
                                {/* <label>View Details</label> */}
                                <Form.Check // prettier-ignore
                                  type="switch"
                                  id="custom-switch-driver"
                                  name="driver"
                                  // checked={setAddProtection.driver}
                                  checked={addProtection.driver}
                                  onChange={handleAddProtecionChange}
                                  disabled={
                                    carExtraArray?.[0]?.driver == 0 ||
                                    !carExtraArray?.[0]?.driver
                                  }
                                />
                              </div>
                              {/* </div> */}
                            </div>
                          </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Container>
              </section>
            </Col>
          </Col>

          <Col lg="6" md="12" sm="12">
            <section
              className={`section-mobile ${
                requestBody_pickup?.booking_type === "monthly" ? "mt-2" : ""
              }`}
            >
              <Container>
                <div className="row g-2 car__details__section">
                  <div className="col-lg-12  col-sm-12 mt-0">
                    <div className="">
                      <div className="mileage-monthly-plan-flex-box mt-2">
                        <div className="flex-grow-1">
                          {Array.isArray(monthly_plan_array) &&
                            monthly_plan_array?.length > 0 && (
                              <Card className="shadow border-0 min-height-mileage-box">
                                <Card.Header className="car__details__header">
                                  {t("Monthly Plan")}
                                </Card.Header>
                                <Card.Body className="car__details__body-2 padding-on-mileage-cards">
                                  <ul className="nav nav-tabs justify-content-evenly gap-1 border-0">
                                    {getMonthlyPlansLoading ? (
                                      <div className="w-100 h-100 text-center my-4 py-4">
                                        <Spinner />
                                      </div>
                                    ) : (
                                      monthly_plan_array?.length > 0 &&
                                      monthly_plan_array?.map((item) => (
                                        <li
                                          className={`nav-item rent_tabs ${
                                            selectedMonthlyPlan === item.months
                                              ? "selected"
                                              : ""
                                          }`}
                                          key={item.id}
                                          onClick={() =>
                                            handleSelectedMonthlyPlan(
                                              item.months
                                            )
                                          }
                                        >
                                          <a className="nav-link d-block">
                                            <div className="mileage-content-flex-box">
                                              <p
                                                className={`rent_per_duration ${
                                                  selectedMonthlyPlan ===
                                                  item.months
                                                    ? "white-color"
                                                    : ""
                                                } `}
                                              >
                                                {`${item.months} ${
                                                  item.months * 1 > 1
                                                    ? t("months")
                                                    : t("month")
                                                }`}
                                              </p>
                                              <p className="rent_rate mb-0">
                                                {fmt(item.rate)}
                                              </p>
                                              <p className="rent_per_duration visibility-hidden">
                                                {`${item.months} ${
                                                  item.months * 1 > 1
                                                    ? "Months"
                                                    : "Month"
                                                }`}
                                              </p>
                                            </div>
                                          </a>
                                        </li>
                                      ))
                                    )}
                                  </ul>
                                  {monthly_plan_array?.length > 0 && (
                                    <div className="col mt-3 mb-2"></div>
                                  )}
                                </Card.Body>
                              </Card>
                            )}
                        </div>
                        <div className="flex-grow-1">
                          {mileage_plan_array?.length > 0 && (
                            <Card className="shadow border-0 min-height-mileage-box">
                              <Card.Header className="car__details__header">
                                {t("Mileage Plan")}
                              </Card.Header>
                              <Card.Body className="car__details__body-2 padding-on-mileage-cards">
                                <ul className="nav nav-tabs justify-content-evenly gap-1 border-0">
                                  {monthlyMileageLoading ? (
                                    <div className="w-100 h-100 text-center my-4 py-4">
                                      <Spinner />
                                    </div>
                                  ) : (
                                    Array.isArray(mileage_plan_array) &&
                                    mileage_plan_array?.length > 0 &&
                                    mileage_plan_array?.map((item) => (
                                      <li
                                        className={`nav-item rent_tabs ${
                                          selectedMileage === item.mileage
                                            ? "selected"
                                            : ""
                                        }`}
                                        key={item.id}
                                        onClick={() =>
                                          handleSelectMileage(item.mileage)
                                        }
                                      >
                                        <a className="nav-link d-block">
                                          <div className="mileage-content-flex-box">
                                            <p className="rent_duration">
                                              {item.mileage} KM
                                            </p>
                                            <p className="rent_rate mb-0">
                                              {fmt(item.rate)}
                                            </p>
                                            <p
                                              className={`rent_per_duration ${
                                                selectedMileage === item.mileage
                                                  ? "white-color"
                                                  : ""
                                              } `}
                                            >
                                              {t("Per Month")}
                                            </p>
                                          </div>
                                        </a>
                                      </li>
                                    ))
                                  )}
                                </ul>
                                {mileage_plan_array?.length > 0 && (
                                  <div className="col mt-3 mb-2"></div>
                                )}
                              </Card.Body>
                            </Card>
                          )}
                        </div>
                      </div>
                      {requestBody_pickup?.booking_type === "daily" && (
                        <Card className="mt-2 shadow border-0">
                          <Card.Header className="car__details__header">
                            {t("Car Details")}
                          </Card.Header>
                          <Card.Body className="car__details__body">
                            <Card.Title className="car__details__title m-0">
                              {/* TOYOTA COROLLA */}
                              {selectedCar?.car_name}
                            </Card.Title>
                            <Card.Text className="car__details__compare m-0">
                              {t("or Similar")}
                              {selectedCar?.category ? ` | ${t(selectedCar.category)}` : ""}
                            </Card.Text>
                            <hr className="my-2" />
                            {loading_for_car_rate_table ? (
                              <div className="text-center h-100">
                                <Spinner />{" "}
                              </div>
                            ) : (
                              <div className="row">
                                <div className="col-lg-7  col-sm-7">
                                  <Table borderless className="">
                                    <tbody className="text-start ">
                                      <tr>
                                        <td>{t("Car Rate")}</td>
                                        <td>
                                          {fmt((
                                            (selectedCar?.payment_method ===
                                              "pay_monthly_now" ||
                                            selectedCar?.payment_method ===
                                              "pay_monthly_later"
                                              ? Number(selectedCar?.car_rate_total || 0)
                                              : selectedCar?.payment_method ===
                                                "pay_later"
                                              ? Number(selectedCar?.pay_later || 0)
                                              : Number(selectedCar?.pay_now || 0)) +
                                            Number(selectedCar?.discount || 0)
                                          ), { decimals: 2 })}
                                        </td>
                                      </tr>

                                      {selectedCar?.discount !== "0" &&
                                        selectedCar?.discount !== 0 && (
                                          <tr>
                                            <td>{t("Promo Code Discount")}</td>
                                            <td>
                                              <span className="text-danger">
                                                - {fmt(selectedCar?.discount, { decimals: 2 })}
                                              </span>
                                            </td>
                                          </tr>
                                        )}

                                      {addProtection.pai && (
                                        <tr>
                                          <td>{t("PAI")}</td>
                                          <td>{fmt(carExtraArray?.[0]?.pai)}</td>
                                        </tr>
                                      )}
                                      {addProtection.cdw && (
                                        <tr>
                                          <td>{t("CDW")}</td>
                                          <td>{fmt(carExtraArray?.[0]?.cdw)}</td>
                                        </tr>
                                      )}
                                      {addProtection.scdw && (
                                        <tr>
                                          <td>{t("SCDW")}</td>
                                          <td>
                                            {fmt(carExtraArray?.[0]?.scdw)}
                                          </td>
                                        </tr>
                                      )}
                                      {addProtection.baby_seat && (
                                        <tr>
                                          <td>{t("Baby Seater")}</td>
                                          <td>
                                            {fmt(Number(
                                              carExtraArray?.[0]?.baby_seat
                                            ) *
                                              Number(babyDriver.baby_seat))}{" "}
                                          </td>
                                        </tr>
                                      )}
                                      {addProtection.gps && (
                                        <tr>
                                          <td>{t("GPS")}</td>
                                          <td>
                                            {fmt(carExtraArray?.[0]?.gps)}{" "}
                                          </td>
                                        </tr>
                                      )}
                                      {addProtection.driver && (
                                        <tr>
                                          <td>{t("Driver")}</td>
                                          <td>
                                            {fmt(Number(
                                              carExtraArray?.[0]?.driver
                                            ) * Number(babyDriver.driver))}{" "}
                                          </td>
                                        </tr>
                                      )}

                                      {selectedCar?.pickup_parking_charges !==
                                        "0" &&
                                        selectedCar?.pickup_parking_charges !==
                                          0 && (
                                          <tr>
                                            <td>{t("Pickup Parking Charges")}</td>
                                            <td>
                                              {fmt(selectedCar?.pickup_parking_charges)}
                                            </td>
                                          </tr>
                                        )}
                                      {selectedCar?.dropoff_parking_charges !==
                                        "0" &&
                                        selectedCar?.dropoff_parking_charges !==
                                          0 && (
                                          <tr>
                                            <td>{t("Dropoff Parking Charges")}</td>
                                            <td>
                                              {fmt(selectedCar?.dropoff_parking_charges)}
                                            </td>
                                          </tr>
                                        )}
                                      {selectedCar?.delivery_charges !== "0" &&
                                        selectedCar?.delivery_charges !== 0 && (
                                          <tr>
                                            <td>{t("Delivery Charges")}</td>
                                            <td>
                                              {fmt(selectedCar?.delivery_charges)}
                                            </td>
                                          </tr>
                                        )}
                                      {selectedCar?.collection_charges !==
                                        "0" &&
                                        selectedCar?.collection_charges !==
                                          0 && (
                                          <tr>
                                            <td>{t("Collection Charges")}</td>
                                            <td>
                                              {fmt(selectedCar?.collection_charges)}
                                            </td>
                                          </tr>
                                        )}
                                      {selectedCar?.inter_cities_charges !==
                                        "0" &&
                                        selectedCar?.inter_cities_charges !==
                                          0 && (
                                          <tr>
                                            <td>{t("Inter City Charges")}</td>
                                            <td>
                                              {fmt(selectedCar?.inter_cities_charges)}
                                            </td>
                                          </tr>
                                        )}
                                      {selectedCar?.vmd_charges !== "0" &&
                                        selectedCar?.vmd_charges !== 0 && (
                                          <tr>
                                            <td>{t("VMD Charges")}</td>
                                            <td>
                                              {fmt(selectedCar?.vmd_charges)}
                                            </td>
                                          </tr>
                                        )}
                                      {addProtection?.activeKM && (
                                        <tr>
                                          <td>{t("KM Allowance")}</td>
                                          <td>
                                            {fmt(Number(addProtection?.activeKM) *
                                              Number(
                                                selectedCar?.booking_months
                                              ))}
                                          </td>
                                        </tr>
                                      )}

                                      <tr>
                                        <td>{t("Sub Total")}</td>
                                        <td>{fmt(subTotal)}</td>
                                      </tr>

                                      <tr>
                                        <td>{t("Total")}</td>
                                        <td>{fmt(total)}</td>
                                      </tr>

                                      {booking_number &&
                                        editUserBookingObject?.payment_type ===
                                          "now" && (
                                          <>
                                            <tr>
                                              <td>{t("Previously Paid")}</td>
                                              <td>
                                                {fmt(editUserBookingObject?.total_amount)}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                {Number(total) -
                                                  Number(
                                                    editUserBookingObject?.total_amount
                                                  ) <
                                                0
                                                  ? "You will be refunded"
                                                  : "Need to Pay Now"}
                                              </td>
                                              <td>
                                                {fmt(Math.abs(
                                                  Number(total) -
                                                    Number(
                                                      editUserBookingObject?.total_amount
                                                    )
                                                ), { decimals: 2 })}
                                              </td>
                                            </tr>
                                          </>
                                        )}
                                    </tbody>
                                  </Table>

                                  {/* Promo Code Section */}
                                  <div className="mt-1">
                                    {requestBody_dropoff?.discount_coupon ? (
                                      <div className="d-flex align-items-center flex-wrap" style={{ gap: "8px" }}>
                                        <span style={{
                                          display: "inline-flex", alignItems: "center", gap: "6px",
                                          background: "#e8f5e9", border: "1px dashed #4caf50", borderRadius: "4px",
                                          padding: "5px 10px", fontSize: "12px", fontWeight: "600", color: "#2e7d32",
                                          letterSpacing: "0.5px", lineHeight: "1"
                                        }}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                          </svg>
                                          {requestBody_dropoff?.discount_coupon}
                                        </span>
                                        <button
                                          onClick={handleRemoveCoupon}
                                          title={t("Remove")}
                                          style={{
                                            background: "none", border: "none", cursor: "pointer",
                                            padding: "0", color: "#d32f2f", display: "inline-flex",
                                            alignItems: "center", lineHeight: "1"
                                          }}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                          </svg>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="d-flex align-items-center" style={{ gap: "0" }}>
                                        <Form.Control
                                          type="text"
                                          placeholder={t("Enter Coupon Code")}
                                          value={promoCodeInput}
                                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                          onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                                          style={{
                                            borderRadius: "4px 0 0 4px", borderRight: "none",
                                            fontSize: "12px", letterSpacing: "0.5px", height: "34px"
                                          }}
                                        />
                                        <Button
                                          onClick={handleApplyCoupon}
                                          disabled={!promoCodeInput.trim() || promoCodeLoading}
                                          size="sm"
                                          style={{
                                            borderRadius: "0 4px 4px 0", height: "34px", minWidth: "70px",
                                            backgroundColor: "#1a3760", borderColor: "#1a3760",
                                            fontSize: "12px", fontWeight: "600", display: "flex",
                                            alignItems: "center", justifyContent: "center", gap: "4px"
                                          }}
                                        >
                                          {promoCodeLoading ? (
                                            <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />
                                          ) : (
                                            t("Apply")
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="col-lg-5 col-sm-5">
                                  <div className="rf-car-stage bdt-car-photo">
                                    <Figure>
                                      <Figure.Image
                                        alt={selectedCar?.car_name}
                                        src={fixImageUrl(selectedCar?.image)}
                                      />
                                    </Figure>
                                  </div>
                                </div>
                              </div>
                            )}

                            <Card.Text className="car__details__feature m-0 mt-3 text-center">
                              {t("PAYMENT METHOD")}:{" "}
                              {selectedCar?.payment_method === "pay_later" ||
                              selectedCar?.payment_method ===
                                "pay_monthly_later"
                                ? t("Pay Later")
                                : t("Pay Now")}
                            </Card.Text>
                            
                            {/* Security Deposit Message for Pay Later */}
                            {/* {(selectedCar?.payment_method === "pay_later" ||
                              selectedCar?.payment_method === "pay_monthly_later") && (
                              <div style={{
                                fontSize: '12px',
                             
                                textAlign: 'center',
                                lineHeight: '1.5'
                              }}>
                                {t("A valid physical credit card in the renter's name is mandatory for security deposit/pre-authorization to cover post-rental charges.")}
                              </div>
                            )} */}
                          </Card.Body>
                        </Card>
                      )}
                      {requestBody_pickup?.booking_type === "monthly" && (
                        <Card className="mt-2 shadow border-0 installment-card-wrapper">
                          <Card.Header className="car__details__header">
                            {monthlyInstallmentArray?.installments?.length === 1
                              ? t("Payment Details")
                              : t("Installments")}{" "}
                            {/* taleeb */}
                          </Card.Header>
                          {installmentTableLoading ? (
                            <div className="w-100 h-100 text-center my-4 py-4">
                              <Spinner />
                            </div>
                          ) : (
                            <Card.Body className="car__details__body">
                              <div className="my-2 row">
                                <div className="col-md-7">
                                  <Table
                                    striped
                                    bordered
                                    hover
                                    className="installment_table "
                                  >
                                    <thead>
                                      <tr>
                                        {monthlyInstallmentArray?.installments
                                          ?.length > 1 && <th>#</th>}
                                        <th style={{ whiteSpace: "nowrap" }}>{t("Sub Amount")}</th>

                                        <th style={{ whiteSpace: "nowrap" }}>{t("Total Amount")}</th>
                                        {booking_number &&
                                          editUserBookingObject?.payment_type !==
                                            "later" && (
                                            <>
                                              {" "}
                                              <th>{t("Previously Paid")}</th>
                                              <th>
                                                {Number(
                                                  monthlyInstallmentArray
                                                    ?.installments?.[0]
                                                    ?.total_amount
                                                ) -
                                                  Number(
                                                    editUserBookingObject
                                                      ?.monthly_installments?.[0]
                                                      ?.actual_amount
                                                  ) >
                                                0
                                                  ? t("Amount To Be Paid")
                                                  : t("Refund Amount")}
                                              </th>
                                            </>
                                          )}
                                      </tr>
                                    </thead>

                                    <tbody className="">
                                      {monthlyInstallmentArray &&
                                        monthlyInstallmentArray?.installments
                                          ?.length > 0 &&
                                        monthlyInstallmentArray?.installments?.map(
                                          (item, index) => (
                                            <tr key={item.installment_no}>
                                              {monthlyInstallmentArray
                                                ?.installments?.length > 1 && (
                                                <td>{item.installment_no}</td>
                                              )}
                                              <td>
                                                {(() => {
                                                  const currentSub = Number(item.sub_amount) || 0;
                                                  const originalSub = Number(
                                                    item.original_sub_amount ?? item.sub_amount_before_discount ?? 0
                                                  );
                                                  const showOriginal = originalSub > currentSub;
                                                  return showOriginal ? (
                                                    <span style={{ whiteSpace: "nowrap" }}>
                                                      <span style={{ textDecoration: "line-through", color: "#9e9e9e", marginRight: 6, fontSize: 12 }}>
                                                        {originalSub.toFixed(2)}
                                                      </span>
                                                      <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                                                        {fmt(currentSub, { decimals: 2 })}
                                                      </span>
                                                    </span>
                                                  ) : (
                                                    <>{fmt(currentSub, { decimals: 2 })}</>
                                                  );
                                                })()}
                                                <span
                                                  onMouseEnter={(e) =>
                                                    handleMouseEnter(index, e)
                                                  }
                                                  onMouseLeave={
                                                    handleMouseLeave
                                                  }
                                                  className="tooltip-info"
                                                >
                                                  <img alt=""
                                                    src={infoIcon}
                                                    className="info-icon"
                                                  />
                                                </span>
                                                {hoveredIndex === index && (
                                                  <div
                                                    className="installment-tooltip"
                                                    style={{
                                                      top: tooltipPosition.top,
                                                      left: tooltipPosition.left,
                                                    }}
                                                    onMouseEnter={(e) =>
                                                      handleMouseEnter(index, e)
                                                    }
                                                    onMouseLeave={
                                                      handleMouseLeave
                                                    }
                                                  >
                                                    <strong>
                                                      {t("Amount Breakdown")}:
                                                    </strong>
                                                    <table className="table table-sm table-borderless mb-0">
                                                      <tbody>
                                                        {Object.entries(
                                                          item.details
                                                        ).map(
                                                          ([key, value]) => {
                                                            if (
                                                              key === "cat" ||
                                                              value == 0
                                                            )
                                                              return null; // Skip the "cat" key
                                                            return (
                                                              <tr key={key}>
                                                                <td>{key}</td>
                                                                <td>
                                                                  {Number(
                                                                    value
                                                                  )?.toFixed(2)}
                                                                </td>
                                                              </tr>
                                                            );
                                                          }
                                                        )}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                )}
                                              </td>
                                              <td>
                                                {(() => {
                                                  const currentTotal = Number(item.total_amount) || 0;
                                                  const promoDiscount = Number(
                                                    item?.details?.["Promo Coupon Discount"] || 0
                                                  );
                                                  const originalTotal = currentTotal + promoDiscount;
                                                  const showOriginal = promoDiscount > 0;
                                                  const savedPercent = showOriginal
                                                    ? Math.round((promoDiscount / originalTotal) * 100)
                                                    : 0;
                                                  return showOriginal ? (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                                                      <span style={{ textDecoration: "line-through", color: "#9aa0a6", fontSize: 12, fontWeight: 500 }}>
                                                        {originalTotal.toFixed(2)}
                                                      </span>
                                                      <span style={{ color: "#1b5e20", fontWeight: 700, fontSize: 14 }}>
                                                        {fmt(currentTotal, { decimals: 2 })}
                                                      </span>
                                                      {savedPercent > 0 && (
                                                        <span style={{
                                                          background: "#e8f5e9",
                                                          color: "#2e7d32",
                                                          border: "1px solid #a5d6a7",
                                                          borderRadius: 12,
                                                          padding: "1px 8px",
                                                          fontSize: 10,
                                                          fontWeight: 700,
                                                          letterSpacing: "0.3px",
                                                          lineHeight: 1.4,
                                                        }}>
                                                          -{savedPercent}%
                                                        </span>
                                                      )}
                                                    </span>
                                                  ) : (
                                                    <>{fmt(currentTotal, { decimals: 2 })}</>
                                                  );
                                                })()}
                                              </td>
                                              {/* Check if it's the first row */}
                                              {booking_number &&
                                                editUserBookingObject?.payment_type !==
                                                  "later" &&
                                                (index === 0 ? (
                                                  <>
                                                    {/* Only show Previously Paid in the first row */}

                                                    <td>
                                                      {fmt(editUserBookingObject
                                                          ?.monthly_installments?.[0]
                                                          ?.actual_amount, { decimals: 2 })}
                                                    </td>
                                                    {/* Show adjusted Total Amount in the first row */}
                                                    <td>
                                                      {fmt(Math.abs(
                                                          Number(
                                                            item.total_amount
                                                          ) -
                                                            Number(
                                                              editUserBookingObject
                                                                ?.monthly_installments?.[0]
                                                                ?.actual_amount
                                                            )
                                                        ), { decimals: 2 })}
                                                    </td>
                                                  </>
                                                ) : (
                                                  <>
                                                    <td></td>
                                                    <td></td>
                                                  </>
                                                ))}
                                            </tr>
                                          )
                                        )}

                                      {/* <tr>
                            <td>1</td>
                            <td>28-12-2023 00:23</td>
                            <td>27-01-2024 00:29</td>
                            <td>30</td>
                            
                          </tr>
                          <tr>
                            <td></td>
                            <td colSpan={2}>Total</td>
                            <td>183</td>
                          </tr> */}
                                    </tbody>
                                  </Table>

                                  {/* Promo Code Section (Monthly) */}
                                  <div className="mt-2 px-1">
                                    {requestBody_dropoff?.discount_coupon ? (
                                      <div className="d-flex align-items-center flex-wrap" style={{ gap: "8px" }}>
                                        <span style={{
                                          display: "inline-flex", alignItems: "center", gap: "6px",
                                          background: "#e8f5e9", border: "1px dashed #4caf50", borderRadius: "4px",
                                          padding: "5px 10px", fontSize: "12px", fontWeight: "600", color: "#2e7d32",
                                          letterSpacing: "0.5px", lineHeight: "1"
                                        }}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                          </svg>
                                          {requestBody_dropoff?.discount_coupon}
                                        </span>
                                        <button
                                          onClick={handleRemoveCoupon}
                                          title={t("Remove")}
                                          style={{
                                            background: "none", border: "none", cursor: "pointer",
                                            padding: "0", color: "#d32f2f", display: "inline-flex",
                                            alignItems: "center", lineHeight: "1"
                                          }}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                          </svg>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="d-flex align-items-center" style={{ gap: "0" }}>
                                        <Form.Control
                                          type="text"
                                          placeholder={t("Enter Coupon Code")}
                                          value={promoCodeInput}
                                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                          onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                                          style={{
                                            borderRadius: "4px 0 0 4px", borderRight: "none",
                                            fontSize: "12px", letterSpacing: "0.5px", height: "34px"
                                          }}
                                        />
                                        <Button
                                          onClick={handleApplyCoupon}
                                          disabled={!promoCodeInput.trim() || promoCodeLoading}
                                          size="sm"
                                          style={{
                                            borderRadius: "0 4px 4px 0", height: "34px", minWidth: "70px",
                                            backgroundColor: "#1a3760", borderColor: "#1a3760",
                                            fontSize: "12px", fontWeight: "600", display: "flex",
                                            alignItems: "center", justifyContent: "center", gap: "4px"
                                          }}
                                        >
                                          {promoCodeLoading ? (
                                            <Spinner animation="border" size="sm" style={{ width: "14px", height: "14px" }} />
                                          ) : (
                                            t("Apply")
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className=" col-md-5">
                                  <div className="rf-car-stage bdt-car-photo">
                                    <Figure>
                                      <Figure.Image
                                        alt={selectedCar?.car_name}
                                        src={fixImageUrl(selectedCar?.image)}
                                      />
                                    </Figure>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          )}
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* <div className="col-lg-6  col-sm-12"></div> */}
                  <div className="text-center col-lg-12 col-sm-12  book-button-container my-2">
                    {/* <Button
                className="booking__btn text-nowrap mt-2"
                onClick={handleBookingClick}
                disabled={loading_confirmBookin}
              >
                {loading_confirmBookin ? (
                  <Spinner />
                ) : (
                  <>
                    <span className="text-nowrap">
                      {
                        booking_number &&
                        editUserBookingObject?.payment_type !== "later" &&
                        editUserBookingObject?.type === "daily"
                          ? Number(total) -
                              Number(editUserBookingObject?.total_amount) >
                            0
                            ? `${fmt(( Number(total) - Number(editUserBookingObject?.total_amount) ), { decimals: 2 })}`
                            : `You will be refunded  ${Math.abs(
                                Number(total) -
                                  Number(editUserBookingObject?.total_amount)
                              )?.toFixed(2)}` // This renders nothing when the amount to pay now is negative
                          : booking_number &&
                            requestBody_pickup?.booking_type === "monthly" &&
                            editUserBookingObject?.payment_type !== "later" // New condition for booking_number and booking_type
                          ? `${
                              Number(
                                monthlyInstallmentArray?.installments?.[0]
                                  ?.total_amount
                              ) -
                                Number(
                                  editUserBookingObject
                                    ?.monthly_installments?.[0]?.actual_amount
                                ) <
                              0
                                ? "You will be refunded  "
                                : " Pay "
                            }${fmt(Math.abs( Number( monthlyInstallmentArray?.installments?.[0] ?.total_amount ) - Number( editUserBookingObject ?.monthly_installments?.[0]?.actual_amount ) ), { decimals: 2 })}`
                          : requestBody_pickup?.booking_type === "monthly"
                          ? `${fmt(monthlyInstallmentArray?.installments?.[0]?.total_amount)}` // Display installment amount for monthly booking
                          : `${fmt(total)}` // Show total if not monthly booking
                      }
                      <br />
                      {}
                      Book For{" "}
                      {selectedCar?.payment_method === "pay_monthly_now" ||
                      selectedCar?.payment_method === "pay_monthly_later"
                        ? Number(monthlyInstallmentArray?.booking_months) === 1
                          ? monthlyInstallmentArray?.installments?.length > 1
                            ? `${selectedCar?.booking_months} Month By Paying 1st Installment`
                            : `${selectedCar?.booking_months} Month`
                          : `${selectedCar?.booking_months} Months By Paying 1st Installment`
                        : Number(selectedCar?.booking_days) === 1
                        ? `${selectedCar?.booking_days} Day`
                        : `${selectedCar?.booking_days} Days`}
                    </span>
                  </>
                )}
              </Button> */}
                    <Button
                      className="booking__btn text-nowrap mt-2"
                      onClick={handleBookingClick}
                      disabled={loading_confirmBookin}
                    >
                      {(() => { 
                        if (loading_confirmBookin) {
                          return <Spinner />;
                        } else if (!hasValidSession()) {
                          // User is not logged in - always show login prompt
                          return t("Login or continue as guest");
                        } else if (
                          requestBody_pickup?.booking_type === "daily" &&
                          selectedCar?.payment_method === "pay_now"
                        ) {
                          return t("Continue to payment");
                        } else if (
                          requestBody_pickup?.booking_type === "monthly" &&
                          selectedCar?.payment_method === "pay_monthly_now"
                        ) {
                          return t("Continue to pay 1st installment");
                        } else if (
                          selectedCar?.payment_method === "pay_later" ||
                          selectedCar?.payment_method === "pay_monthly_later"
                        ) {
                          return t("Confirm booking");
                        } else {
                          // Fallback for logged in users with pay_now methods
                          return t("Continue to payment");
                        }
                      })()}
                    </Button>
                  </div>

                  {/* {console.log("km_object-->", km_object)}
            {(selectedCar?.payment_method === "pay_monthly_now" ||
              selectedCar?.payment_method === "pay_monthly_later") &&
              km_object?.extra_1000_km_rate && (
                <div className="col mt-2">
                  <Card className="shadow border-0">
                    <Card.Header className="car__details__header">
                      Should you exceed your KM allowance the cost x extra KM is
                      MAD 1 x KM
                    </Card.Header>
                 
                    <Card.Body>
                      <div className="container p-2">
                        <div className="row  d-flex justify-content-center ">
                          <ul className="list-unstyled nav nav-tabs service_slider border-0 custom-slider">
                            <div className="row justify-content-around mx-auto">
                              <li className="col-lg-3 col-md-3 col-sm-4 nav-item km_allowance_tabs">
                                <a
                                  className={`nav-link ${
                                    addProtection?.activeKM ===
                                    km_object?.extra_1000_km_rate
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handle_km_plan_click(
                                      km_object?.extra_1000_km_rate,
                                      1000
                                    )
                                  }
                                  aria-current="page"
                                >
                                  1000 km / {fmt(km_object?.extra_1000_km_rate)}
                                  <br /> Per Month
                                </a>
                              </li>
                              <li className="col-lg-3 col-md-3 col-sm-4 nav-item km_allowance_tabs">
                                <a
                                  className={`nav-link ${
                                    addProtection?.activeKM ===
                                    km_object?.extra_2000_km_rate
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handle_km_plan_click(
                                      km_object?.extra_2000_km_rate,
                                      2000
                                    )
                                  }
                                >
                                  2000 km / {fmt(km_object?.extra_2000_km_rate)}
                                  <br /> Per Month
                                </a>
                              </li>

                              <li className="col-lg-3 col-md-3 col-sm-4 nav-item km_allowance_tabs">
                                <a
                                  className={`nav-link ${
                                    addProtection?.activeKM ===
                                    km_object?.extra_3000_km_rate
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handle_km_plan_click(
                                      km_object?.extra_3000_km_rate,
                                      3000
                                    )
                                  }
                                >
                                  3000 km / {fmt(km_object?.extra_3000_km_rate)}
                                  <br /> Per Month
                                </a>
                              </li>
                            </div>
                          </ul>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )} */}
                </div>
              </Container>
            </section>
          </Col>
        </Row>
      </Container>
      <Container>
        {filterCarArray?.length > 0 &&
          (selectedCar?.payment_method === "pay_now" ||
            selectedCar?.payment_method === "pay_later") && (
            <Card className="shadow border-0 mt-4">
              <Card.Header className="car__details__header">
                {t("Upgrade Options")}
              </Card.Header>
              <Card.Body>
                <div class="container px-4 text-center   ">
                  <div class="row  gx-5 p-1">
                    <>
                      {filterCarArray?.length > 3 ? (
                        /*    <>
                          <Slider className="service_slider" {...settings}>
                            {filterCarArray &&
                              filterCarArray?.map((car) => (
                                <div class="col " key={car.id}>
                                  <div
                                    class="p-3 book-card-wrap"
                                    style={{ height: "300px" }}
                                  >
                                    <div className="p-2 ">
                                      <Card.Img
                                        variant="top "
                                        src={fixImageUrl(car?.image)}
                                        style={{
                                          height: "15vh",
                                          objectFit: "cover",
                                        }}
                                      />
                                      <Card.Body className="text-center">
                                        <Card.Title className="title-upgrade">
                                          {car?.car_name}
                                        </Card.Title>
                                        <Card.Text className="title-price">
                                          {fmt(selectedCar?.payment_method ===
                                            "pay_monthly_now" ||
                                          selectedCar?.payment_method ===
                                            "pay_monthly_later"
                                            ? (
                                                Number(car.car_rate_total) -
                                                Number(
                                                  selectedCar?.car_rate_total
                                                )
                                              )
                                            : selectedCar?.payment_method ===
                                              "pay_now"
                                            ? (
                                                Number(car.pay_now) -
                                                Number(selectedCar?.pay_now)
                                              )
                                            : (
                                                Number(car.pay_later) -
                                                Number(selectedCar?.pay_later)
                                              ), { decimals: 2 })}
                                        </Card.Text>
                                        <Button
                                          className="btn-upgrade"
                                          variant="primary rounded-0"
                                          onClick={() =>
                                            mergeCarProperties(car)
                                          }
                                        >
                                          Book{" "}
                                        </Button>
                                      </Card.Body>
                                    </div>
                                  </div>
                                </div>
                              ))}

                          
                          </Slider>
                        </> */
                        <>
                          <Slider className="service_slider" {...settings}>
                            {filterCarArray &&
                              filterCarArray?.map((car) => (
                                <div className="row justify-content-center">
                                  <div class="col " key={car.id}>
                                    <div
                                      class="w-100 book-card-wrap"
                                      // style={{ height: "300px" }}
                                    >
                                      <div className="p-2 w-100">
                                        <Card.Img
                                          className="card-img-comparing rf-car-stage bdt-upgrade-photo"
                                          variant="top"
                                          src={fixImageUrl(car?.image)}
                                          // style={{
                                          //   height: "20vh",
                                          //   width: "auto",
                                          //   textAlign: "center",
                                          //   marginInline: "auto",
                                          // }}
                                        />
                                        <Card.Body className="text-center">
                                          <Card.Title className="title-upgrade text-nowrap mx-auto">
                                            {car?.car_name}
                                          </Card.Title>
                                          <Card.Text className="title-price">
                                            {/* taleeb */}
                                            <p className="text-nowrap upgrade-text-fs">
                                              <span className="title-upgrade text-nowrap upgrade-text-fs">
                                                {t("Pay additional")}{" "}
                                              </span>{" "}
                                              <span className=" upgrade-text-fs-price">
                                                {" "}
                                                {fmt(selectedCar?.payment_method ===
                                                  "pay_monthly_now" ||
                                                selectedCar?.payment_method ===
                                                  "pay_monthly_later"
                                                  ? (
                                                      Number(
                                                        car.car_rate_total
                                                      ) -
                                                      Number(
                                                        selectedCar?.car_rate_total
                                                      )
                                                    )
                                                  : selectedCar?.payment_method ===
                                                    "pay_now"
                                                  ? (
                                                      Number(car.pay_now) -
                                                      Number(
                                                        selectedCar?.pay_now
                                                      )
                                                    )
                                                  : (
                                                      Number(car.pay_later) -
                                                      Number(
                                                        selectedCar?.pay_later
                                                      )
                                                    ), { decimals: 2 })}{" "}
                                              </span>
                                              <br />
                                              <span className="title-upgrade text-nowrap upgrade-text-fs">
                                                {" "}
                                                {t("for this amazing upgrade")}{" "}
                                              </span>
                                            </p>
                                          </Card.Text>
                                          <Button
                                            className="btn-upgrade"
                                            variant="primary rounded-0"
                                            onClick={() =>
                                              mergeCarProperties(car)
                                            }
                                          >
                                            {t("Upgrade Now")}{" "}
                                          </Button>
                                        </Card.Body>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                            {/* <div class="col ">
                    <div class="p-3 book-card-wrap">
                      <div className="p-2 ">
                        <Card.Img variant="top" src={img1} />
                        <Card.Body className="text-center">
                          <Card.Title className="title-upgrade">
                            Toyota Camry SE 350
                          </Card.Title>
                          <Card.Text className="title-price">
                            MAD 50{" "}
                          </Card.Text>
                          <Button
                            className="btn-upgrade"
                            variant="primary rounded-0"
                          >
                            Book{" "}
                          </Button>
                        </Card.Body>
                      </div>
                    </div>
                  </div>{" "}
                  <div class="col ">
                    <div class="p-3 book-card-wrap">
                      <div className="p-2 ">
                        <Card.Img variant="top" src={img1} />
                        <Card.Body className="text-center">
                          <Card.Title className="title-upgrade">
                            Toyota Camry SE 350
                          </Card.Title>
                          <Card.Text className="title-price">
                            MAD 50{" "}
                          </Card.Text>
                          <Button
                            className="btn-upgrade"
                            variant="primary rounded-0"
                          >
                            Book{" "}
                          </Button>
                        </Card.Body>
                      </div>
                    </div>
                  </div>{" "}  
                  <div class="col ">
                    <div class="p-3 book-card-wrap">
                      <div className="p-2 ">
                        <Card.Img variant="top" src={img1} />
                        <Card.Body className="text-center">
                          <Card.Title className="title-upgrade">
                            Toyota Camry SE 350
                          </Card.Title>
                          <Card.Text className="title-price">
                            MAD 50{" "}
                          </Card.Text>
                          <Button
                            className="btn-upgrade"
                            variant="primary rounded-0"
                          >
                            Book{" "}
                          </Button>
                        </Card.Body>
                      </div>
                    </div>
                  </div>{" "}
                  <div class="col ">
                    <div class="p-3 book-card-wrap">
                      <div className="p-2 ">
                        <Card.Img variant="top" src={img1} />
                        <Card.Body className="text-center">
                          <Card.Title className="title-upgrade">
                            Toyota Camry SE 350
                          </Card.Title>
                          <Card.Text className="title-price">
                            MAD 50{" "}
                          </Card.Text>
                          <Button
                            className="btn-upgrade"
                            variant="primary rounded-0"
                          >
                            Book{" "}
                          </Button>
                        </Card.Body>
                      </div>
                    </div>
                  </div> */}
                          </Slider>
                        </>
                      ) : (
                        <>
                          {" "}
                          {/* {filterCarArray &&
                            filterCarArray.length < 4&&
                            filterCarArray?.map((car) => (
                              <div
                                className="col-sm-12 col-md-6 col-lg-4"
                                key={car.id}
                              >
                                <div
                                  className="p-3 w-100 book-card-wrap col-12"
                                  style={{ height: "300px" }}
                                >
                                  <div className="p-2 w-100 ">
                                    <Card.Img
                                      variant="top "
                                      src={fixImageUrl(car?.image)}
                                      style={{
                                        height: "15vh",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <Card.Body className="text-center">
                                      <Card.Title className="title-upgrade">
                                        {car?.car_name}
                                      </Card.Title>
                                      <Card.Text className="title-price">
                                        {fmt(selectedCar?.payment_method ===
                                          "pay_monthly_now" ||
                                        selectedCar?.payment_method ===
                                          "pay_monthly_later"
                                          ? (
                                              Number(car.car_rate_total) -
                                              Number(
                                                selectedCar?.car_rate_total
                                              )
                                            )
                                          : selectedCar?.payment_method ===
                                            "pay_now"
                                          ? (
                                              Number(car.pay_now) -
                                              Number(selectedCar?.pay_now)
                                            )
                                          : (
                                              Number(car.pay_later) -
                                              Number(selectedCar?.pay_later)
                                            ), { decimals: 2 })}
                                      </Card.Text>
                                      <Button
                                        className="btn-upgrade"
                                        variant="primary rounded-0"
                                        onClick={() => mergeCarProperties(car)}
                                      >
                                        Book{" "}
                                      </Button>
                                    </Card.Body>
                                  </div>
                                </div>
                              </div>
                            ))} */}
                          {filterCarArray && filterCarArray?.length < 4 && (
                            <>
                              <div className="d-block d-md-none">
                                <Carousel>
                                  {filterCarArray.map((car) => (
                                    <Carousel.Item key={car.id}>
                                      <div className="col-sm-12 col-md-4 col-lg-4">
                                        <div
                                          className="p-3 book-card-wrap"
                                          // style={{ height: "300px" }}
                                        >
                                          <div className="p-2 w-100">
                                            <Card.Img
                                              variant="top"
                                              src={fixImageUrl(car?.image)}
                                              className="card-img-lessthanthree"
                                              // style={{
                                              //   height: "15vh",
                                              //   objectFit: "cover",
                                              // }}
                                            />
                                            <Card.Body className="text-center">
                                              <Card.Title className="title-upgrade ">
                                                {car?.car_name}
                                              </Card.Title>
                                              <Card.Text className="title-price">
                                                {fmt(selectedCar?.payment_method ===
                                                  "pay_monthly_now" ||
                                                selectedCar?.payment_method ===
                                                  "pay_monthly_later"
                                                  ? (
                                                      Number(
                                                        car.car_rate_total
                                                      ) -
                                                      Number(
                                                        selectedCar?.car_rate_total
                                                      )
                                                    )
                                                  : selectedCar?.payment_method ===
                                                    "pay_now"
                                                  ? (
                                                      Number(car.pay_now) -
                                                      Number(
                                                        selectedCar?.pay_now
                                                      )
                                                    )
                                                  : (
                                                      Number(car.pay_later) -
                                                      Number(
                                                        selectedCar?.pay_later
                                                      )
                                                    ), { decimals: 2 })}
                                              </Card.Text>
                                              <Button
                                                className="btn-upgrade"
                                                variant="primary rounded-0"
                                                onClick={() =>
                                                  mergeCarProperties(car)
                                                }
                                              >
                                                Book
                                              </Button>
                                            </Card.Body>
                                          </div>
                                        </div>
                                      </div>
                                    </Carousel.Item>
                                  ))}
                                </Carousel>
                              </div>

                              <div className="d-none d-md-block">
                                <div className="row justify-content-center">
                                  {filterCarArray.map((car) => (
                                    <div
                                      className="col-sm-12 col-md-4 col-lg-3"
                                      key={car.id}
                                    >
                                      <div
                                        className="p-3 w-100 book-card-wrap col-12"
                                        // style={{ height: "300px" }}
                                      >
                                        <div className="p-2 w-100">
                                          <Card.Img
                                            variant="top"
                                            src={fixImageUrl(car?.image)}
                                            // style={{
                                            //   height: "15vh",
                                            //   objectFit: "cover",
                                            // }}
                                          />
                                          <Card.Body className="text-center">
                                            <Card.Title className="title-upgrade">
                                              {car?.car_name}
                                            </Card.Title>
                                            <Card.Text className="title-price">
                                              {fmt(selectedCar?.payment_method ===
                                                "pay_monthly_now" ||
                                              selectedCar?.payment_method ===
                                                "pay_monthly_later"
                                                ? (
                                                    Number(car.car_rate_total) -
                                                    Number(
                                                      selectedCar?.car_rate_total
                                                    )
                                                  )
                                                : selectedCar?.payment_method ===
                                                  "pay_now"
                                                ? (
                                                    Number(car.pay_now) -
                                                    Number(selectedCar?.pay_now)
                                                  )
                                                : (
                                                    Number(car.pay_later) -
                                                    Number(
                                                      selectedCar?.pay_later
                                                    )
                                                  ), { decimals: 2 })}
                                            </Card.Text>
                                            <Button
                                              className="btn-upgrade"
                                              variant="primary rounded-0"
                                              onClick={() =>
                                                mergeCarProperties(car)
                                              }
                                            >
                                              Book
                                            </Button>
                                          </Card.Body>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
      </Container>

      {/* <div className="col-lg-6  col-sm-12">

      </div>
      <div className="col-lg-6  col-sm-12">

      </div> */}
      {/* <div className="text-center--  book-button-container my-2">
        

        <Button
          className="booking__btn text-nowrap"
          onClick={handleBookingClick}
          disabled={loading_confirmBookin}
        >
          {loading_confirmBookin ? (
            <Spinner />
          ) : (
            <>
              <span className="text-nowrap">
                {
                  booking_number &&
                  editUserBookingObject?.payment_type !== "later" &&
                  editUserBookingObject?.type === "daily"
                    ? Number(total) -
                        Number(editUserBookingObject?.total_amount) >
                      0
                      ? `${fmt(( Number(total) - Number(editUserBookingObject?.total_amount) ), { decimals: 2 })}`
                      : `You will be refunded  ${Math.abs(
                          Number(total) -
                            Number(editUserBookingObject?.total_amount)
                        )?.toFixed(2)}` // This renders nothing when the amount to pay now is negative
                    : booking_number &&
                      requestBody_pickup?.booking_type === "monthly" // New condition for booking_number and booking_type
                    ? `${
                        Number(
                          monthlyInstallmentArray?.installments?.[0]
                            ?.total_amount
                        ) -
                          Number(
                            editUserBookingObject?.monthly_installments?.[0]
                              ?.actual_amount
                          ) <
                        0
                          ? "You will be refunded  "
                          : " Pay "
                      }${fmt(Math.abs( Number( monthlyInstallmentArray?.installments?.[0] ?.total_amount ) - Number( editUserBookingObject?.monthly_installments?.[0] ?.actual_amount ) ), { decimals: 2 })}`
                    : requestBody_pickup?.booking_type === "monthly"
                    ? `${fmt(monthlyInstallmentArray?.installments?.[0]?.total_amount)}` // Display installment amount for monthly booking
                    : `${fmt(total)}` // Show total if not monthly booking
                }
                <br />
                Book For{" "}
                {selectedCar?.payment_method === "pay_monthly_now" ||
                selectedCar?.payment_method === "pay_monthly_later"
                  ? monthlyInstallmentArray?.installments?.length === 1 ? `${selectedCar?.booking_months} Month` :  `${selectedCar?.booking_months} Months By Paying 1st Installment`
                  : Number(selectedCar?.booking_days) === 1 ?   `${selectedCar?.booking_days} Day` : `${selectedCar?.booking_days} Days` }
              </span>
            </>
          )}
        </Button>
      
      </div> */}
      <LoginModal
        loginModalShow={loginModalShow}
        setLoginModalShow={setLoginModalShow}
        registerModalShow={registerModalShow}
        setRegisterModalShow={setRegisterModalShow}
        setCardModalShow={setCardModalShow}
        setForgetPasswordModalShow={setForgetPasswordModalShow}
        isExistingCustomer={isExistingCustomer}
        handleSelectionChange={handleSelectionChange}
        selectedCar={selectedCar}
        bookingDetails={{
          pickupDate: requestBody_pickup?.pickup_date,
          pickupTime: requestBody_pickup?.pickup_time,
          dropoffDate: requestBody_dropoff?.dropoff_date,
          dropoffTime: requestBody_dropoff?.dropoff_time,
          totalDays: selectedCar?.booking_days
        }}
        totalWithVAT={total}
        // Guest checkout only where it is safe: a pay-later reservation takes no
        // money, so there is nothing an account is protecting. Pay-now still
        // needs a session because the gateway transaction has to belong to one.
        allowGuest={
          selectedCar?.payment_method === "pay_later" ||
          selectedCar?.payment_method === "pay_monthly_later"
        }
        onGuestContinue={(guest) => {
          setLoginModalShow(false);
          return confirmBooking(guest);
        }}
        onLoginSuccess={() => {
          console.log("BookingDetailsTwo: onLoginSuccess called");
          console.log("selectedCar.payment_method:", selectedCar?.payment_method);
          
          // Clear original payment method since login was successful
          setOriginalPaymentMethod(null);
          
          // After login, check the payment method and proceed
          if (selectedCar?.payment_method === "pay_now" || 
              selectedCar?.payment_method === "pay_monthly_now") {
            console.log("BookingDetailsTwo: Calling confirmBooking for pay_now");
            // For Pay Now, call confirmBooking which will open CardDetailsModal
            confirmBooking();
          } else if (selectedCar?.payment_method === "pay_later" || 
                     selectedCar?.payment_method === "pay_monthly_later") {
            console.log("BookingDetailsTwo: Calling confirmBooking for pay_later");
            // For Pay Later, call confirmBooking which will navigate to success page
            confirmBooking();
          }
        }}
      />
      <RegisterModal
        registerModalShow={registerModalShow}
        setRegisterModalShow={setRegisterModalShow}
        setLoginModalShow={setLoginModalShow}
        isExistingCustomer={isExistingCustomer}
        handleSelectionChange={handleSelectionChange}
        selectedCar={selectedCar}
        bookingDetails={{
          pickupDate: requestBody_pickup?.pickup_date,
          pickupTime: requestBody_pickup?.pickup_time,
          dropoffDate: requestBody_dropoff?.dropoff_date,
          dropoffTime: requestBody_dropoff?.dropoff_time,
          totalDays: selectedCar?.booking_days
        }}
        totalWithVAT={total}
        onRegistrationComplete={() => {
          console.log("BookingDetailsTwo: onRegistrationComplete called");
          console.log("selectedCar.payment_method:", selectedCar?.payment_method);
          
          // Clear original payment method since registration was successful
          setOriginalPaymentMethod(null);
          
          // After registration, check the payment method and proceed
          if (selectedCar?.payment_method === "pay_now" || 
              selectedCar?.payment_method === "pay_monthly_now") {
            console.log("BookingDetailsTwo: Calling confirmBooking for pay_now");
            // For Pay Now, call confirmBooking which will open CardDetailsModal
            confirmBooking();
          } else if (selectedCar?.payment_method === "pay_later" || 
                     selectedCar?.payment_method === "pay_monthly_later") {
            console.log("BookingDetailsTwo: Calling confirmBooking for pay_later");
            // For Pay Later, call confirmBooking which will navigate to success page
            confirmBooking();
          }
        }}
      />
      <ForgetPasswordModal
        forgetPasswordModalShow={forgetPasswordModalShow}
        setForgetPasswordModalShow={setForgetPasswordModalShow}
        setResetPasswordModalShow={setResetPasswordModalShow}
        setLoginModalShow={setLoginModalShow}
      />
      <ResetPasswordModal
        resetPasswordModalShow={resetPasswordModalShow}
        setResetPasswordModalShow={setResetPasswordModalShow}
        setLoginModalShow={setLoginModalShow}
      />
      <CardDetailsModal
        cardModalShow={cardModalShow}
        setCardModalShow={setCardModalShow}
        confirmBookingData={confirmBookingData}
        confirmBookingPayment={confirmBookingPayment}
        monthlyInstallmentArray={monthlyInstallmentArray}
        total={total}
        enabledExtras={enabledExtras}
      />
      
      {/* Discount Popup Modal */}
      <Modal
        show={showDiscountPopup}
        onHide={() => setShowDiscountPopup(false)}
        centered
        size="md"
        className="custom-modal-width"
      >
  
        <Modal.Body>
          <div className="text-center p-3">
            <h5 className="mb-3">{t("Save More with Route Facile!")}</h5>
            <p className="mb-4">
              {t("Pay now and get up to 15% discount on your booking!")}
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Button
                variant="primary"
                className="rf-btn-secondary"
                onClick={() => {
                  setShowDiscountPopup(false);
                  // Save the original payment method before changing it
                  setOriginalPaymentMethod(selectedCar?.payment_method);
                  // Update payment method based on booking type
                  const updatedCar = {
                    ...selectedCar,
                    payment_method: requestBody_pickup?.booking_type === "monthly"
                      ? "pay_monthly_now"
                      : "pay_now"
                  };
                  dispatch(setSelectedCar(updatedCar));
                  // Open login modal with "Are you an existing customer?" question
                  setLoginModalShow(true);
                }}
              >
                {t("Pay Now & Save")}
              </Button>
            </div>

          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDiscountPopup(false);
              // Continue with pay later - show login modal
              setLoginModalShow(true);
            }}
          >
            {t("Continue with Pay Later")}
          </Button>
        </Modal.Footer>
      </Modal>

      <StickyBookingSummary
        total={total}
        subTotal={subTotal}
        vat={vat}
        handleBookingClick={handleBookingClick}
        loading_confirmBookin={loading_confirmBookin}
        babyDriver={babyDriver}
      />
    </div>
  );
};
