import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { simpleGetCall, simplePostCall, getApiLang } from "../config.js/SetUp";
import { notifyError, notifySuccess } from "../SharedComponent/notify";
import configWeb from "../config.js/configWeb";
import BookingAddressSection from "../components/UI/BookingAddressSection";
import "../styles/bookingDetailsTwo.css";
import "../styles/bookingDetails.css";
import BookingStepper from "../components/UI/BookingStepper";
import { useSelector, useDispatch } from "react-redux";
import { setStepperPage } from "../reducers/Slices/stepperSlice"; // Import the action
import CarsAndDetails from "../components/UI/CarsAndDetails";
import carData from "../assets/data/carData";
import img from "../assets/all-images/cars-img/View.png";
import { pixelSearchEvent } from "../actions/facebookPixelEvents";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";
import usePublicSettings from "../hooks/usePublicSettings";
import {
  Container,
  Nav,
  Row,
  Col,
  Badge,
  Button,
  Card,
  Figure,
  Form,
  Table,
  Spinner,
  Modal,
  Dropdown,
} from "react-bootstrap";
import specIcon1 from "../assets/all-images/specification-icon/specification-icon-2.svg.svg";
import specIcon2 from "../assets/all-images/specification-icon/specification-icon-3.svg.svg";
import specIcon3 from "../assets/all-images/specification-icon/specification-icon-5.svg.svg";
import specIcon4 from "../assets/all-images/specification-icon/specification-icon-7.svg.svg";
import specIcon5 from "../assets/all-images/specification-icon/specification-icon-11.svg.svg";
import specIcon6 from "../assets/all-images/specification-icon/specification-icon-4.svg.svg";
import specIcon7 from "../assets/all-images/specification-icon/specification-icon-8.svg.svg";
import specIcon8 from "../assets/all-images/specification-icon/specification-icon-12.svg.svg";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { setCarArray } from "../reducers/Slices/carArraySlice";
import EditFindCarForm from "../components/UI/EditFindCarForm/EditFindCarForm2";
import Pagination from "react-bootstrap/Pagination";
import CustomPagination from "../components/UI/Pagination";
import { setSelectedCar } from "../reducers/Slices/selectedCarSlice";
import { reset_got_to_edit } from "../reducers/Slices/goToEditSlice";

import {
  resetAddProtection,
  setAddProtection,
} from "../reducers/Slices/addProtectionSlice";
import { setEditUserBookingObject } from "../reducers/Slices/editUserBookingSlice";
import CarDetails from "./CarDetails";
import MetaHelmet from "../components/Helmet/MetaHelmet";
import SortingFilter from "../SharedComponent/SortingFilter/SortingFilter";
import CouponSuccess from "../SharedComponent/couponApplied/couponApplied";
import CarLoadingComponent from "../SharedComponent/CarLoadingComponent/carLoadingComponent";
import CarLoadingComponent2 from "../SharedComponent/CarLoadingComponent/CarLoadingComponent2";
const BookingDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { booking_number } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(booking_number ? false : false);
  const handleNextStep = () => {
    dispatch(setStepperPage(stepperPage + 1));
  };
  const location_url = useLocation();
  const { t, i18n } = useTranslation();
  const { format: fmt } = useCurrency();
  const { payNowEnabled } = usePublicSettings();
  const editUserBookingObject = useSelector(
    (state) => state.editUserBookingObject.editUserBookingObject
  );

  const {
  initialLoad, setInitialLoad
  } = useContext(AppContext);
  const [isFormValidated, setIsFormValidated] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  
  // Redirect to home if no booking data and no booking number
  useEffect(() => {
    // Use setTimeout to avoid blocking initial render
    const timer = setTimeout(() => {
      if (!booking_number && (!requestBody_dropoff || !requestBody_pickup)) {
        navigate('/');
      }
    }, 100); // Small delay to allow page to render first
    
    return () => clearTimeout(timer);
  }, [booking_number, requestBody_dropoff, requestBody_pickup, navigate]);

  // Clear stale edit booking data when leaving edit mode
  useEffect(() => {
    if (!booking_number) {
      dispatch(setEditUserBookingObject({}));
    }
    return () => {
      if (!booking_number) {
        dispatch(setEditUserBookingObject({}));
      }
    };
  }, [booking_number, dispatch]);

  const selectedCar = useSelector((state) => state.selectedCar.selectedCar);
  const cars = useSelector((state) => state.carArray.carArray);
  const citiesArray = useSelector(
    (state) => state.citiesArray.citiesArray
  );
  const stepperPage = useSelector((state) => state.stepper.stepperPage);
  const carArray = useSelector((state) => state.carArray.carArray);
  const got_to_edit = useSelector((state) => state.got_to_edit.got_to_edit);
  const [edit_edit_form, set_edit_edit_form] = useState(true);
  const [selectedCarCategory, setSelectedCarCategory] = useState(null);
  const [totalRecords, setTotalRecords] = useState(
    requestBody_dropoff?.total_records || 0
  );
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  // const [initialLoad, setInitialLoad] = useState(true);
  const [booking_number_flag, set_booking_number_flag] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [allCarsArray, setAllCarsArray] = useState([]);
  const [carCategories, setCarCategories] = useState([]);

  const language = useSelector((state) => state.language.language);
  const savedCar = useSelector((state) => state.savedCar.savedCar);

  // const [saved_car, set_saved_car] = useState([]);

  // const [savedCarArray, setSavedCarArray] = useState(null);
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setIsFormValidated(true);
    scrollToTop();
  };

  const handleCarCategorySelection = (key) => {
    setCurrentPage(1);
    setIsFormValidated(true);
    // setSelectedCarCategory(key)

    setSelectedCarCategory((prevCategory) =>
      prevCategory === key ? null : key
    );
  };
  useEffect(() => {
    scrollToTop();
    const id = requestAnimationFrame(() => {
      scrollToTop();
    });
    return () => cancelAnimationFrame(id);
  }, [currentPage]);
  const handlePaymentCheckboxChange = (option) => {
    setSelectedPaymentOption(option);
    // Only push the pay-now upsell when paying now is actually available; with
    // the CMI gateway off it offered a discount that could not be taken.
    if (payNowEnabled && (option === 'pay_later' || option === 'pay_monthly_later')) {
      setShowDiscountPopup(true);
    }
  };

  //////////////////////////sorting filter///////////////
  const sortingOptions = [
    { label: "Price: Low to High", value: "ASC" },
    { label: "Price: High to Low", value: "DESC" },
  ];
  const [sortingOption, setSortingOption] = useState("ASC");

  const handleSortingSelection = (selectedOption) => {
    setIsFormValidated(true);
    setSortingOption(selectedOption);
  };


  useEffect(() => {
    // Call carSearch when there's valid booking data. booking_type is required
    // by the API — the dropoff slice can lose it to a partial-object dispatch
    // elsewhere, so require it here rather than just checking both slices exist.
    if (requestBody_dropoff && requestBody_pickup?.booking_type) {
      carSearch();
    }
    setInitialLoad(false);
    return ()=>{
      setInitialLoad(true);
    }
  }, [sortingOption, currentPage, selectedCarCategory, language]);

  ////start  modified carSearch Func///////////////////////////////////////////////////////////////
  // The whole bookable fleet is shown on one page. With a page size of 10 and
  // 11 active cars, the eleventh — the most expensive one — sat alone on page 2,
  // where almost nobody looked. A rental fleet this size is a list to scan, not
  // to paginate; 50 leaves room to grow well past the current 11 before the
  // pager reappears on its own.
  const carSearch = async (page_size = 50, setAllCars = false) => {
    return new Promise((resolve, reject) => {
      const body = {
        booking_type: requestBody_pickup?.booking_type,
        pickup_type: requestBody_pickup?.pickup_type,
        pickup_date: requestBody_dropoff?.pickup_date,
        pickup_time: requestBody_dropoff?.pickup_time,
        dropoff_type: requestBody_dropoff?.dropoff_type,
        dropoff_date: requestBody_dropoff?.dropoff_date,
        dropoff_time: requestBody_dropoff?.dropoff_time,
        booking_source: "web",
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

      const baseUrl = `${configWeb.POST_CAR_SEARCH}?lang=${getApiLang(language)}&page=${currentPage}&page_size=${page_size}&sort=${sortingOption}`;

      const url = selectedCarCategory
        ? `${baseUrl}&category_id=${selectedCarCategory}`
        : baseUrl;

      setLoading(true);
      simplePostCall(url, JSON.stringify(body))
        .then((res) => {
          if (!res?.error) {
            if (setAllCars) {
              // Store in allCarsArray if fetching all records
              dispatch(setAllCarsArray(res?.data));
              // dispatch(setCarArray(res?.data));
            } else {
              // Store in carArray for paginated results
              // dispatch(setCarArray(res?.data));
              if (/* savedCar */ false) {
                const updatedCarArray = res?.data.filter(
                  (item) => item.id * 1 !== savedCar * 1
                );
                dispatch(setCarArray(updatedCarArray));
              } else {
                dispatch(setCarArray(res?.data));
              }
            }
            setTotalRecords(res?.total_records);
            if (!savedCar) {
              dispatch(setSelectedCar(null));
            }
          }

          if (res?.status === "success") {
            // notifySuccess(res?.message)
          }
          if (res?.error) {
            dispatch(setSelectedCar(null));

            // Genuine validation ("this branch is closed at that hour") is worth
            // showing — it tells the customer what to change. Auth failures are
            // not: a 401 only means "not signed in", which the guest flow
            // already handles, so it is never surfaced.
            const raw = Array.isArray(res?.message) ? res.message[0] : res?.message;
            const status = res?.statusCode || res?.status;
            if (status !== 401 && !/unauthorized/i.test(String(raw || ""))) {
              notifyError(raw || t("Something went wrong, please try again later"));
            }
          }
        })
        .catch((error) => {
          console.log("validate pickuplocation api failed-->", error);
          notifyError(t("Something went wrong, please try again later"));
        })
        .finally(() => {
          setLoading(false);
          scrollToTop();
        });
    });
  };
  ////end  modified carSearch Func///////////////////////////////////////////////////////////////
  // useEffect(() => {

  //   if (initialLoad ) {

  //     !booking_number && carSearch(10); // This will fetch 10 records per page and store in carArray

  //     setInitialLoad(false);
  //   } else if (isFormValidated) {
  //     // carSearch();
  //     // carSearch(10); // This will fetch 10 records per page and store in carArray

  //     setIsFormValidated(false);
  //   }
  // }, [
  //   initialLoad,
  //   isFormValidated,
  //   requestBody_dropoff,
  //   requestBody_pickup,
  //   selectedCarCategory,
  //   sortingOption,
  // ]);

  const [bookingError, setBookingError] = useState("");
  // A card can select the car and continue in a single click, in which case the
  // Redux dispatch and the setSelectedPaymentOption call have not been applied
  // yet when this runs — the closure would still see the previous selection.
  // The card therefore hands us the car and the payment option it just chose;
  // the stored state is only the fallback for the older two-click call sites.
  const goToBooking = (paymentOption, carOverride) => {
    const payment = paymentOption || selectedPaymentOption;
    const car = carOverride || selectedCar;
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
      // item_list_name: "Car Selected",
      items: [
        {
          item_id: car?.id,
          item_name: car?.car_name,
          // affiliation: "Google Merchandise Store",
          coupon: car?.coupon,
          discount: parseFloat(car?.discount || 0).toFixed(2),

          index: 0,
          item_brand: car?.brand,
          item_category: car?.category,
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
          // item_list_name: "Car Selected",
          // item_variant: "green",
          location_id: car?.city_id,
          price:
            requestBody_pickup?.booking_type === "monthly"
              ? parseFloat(car?.per_month_rate).toFixed(2)
              : payment === "pay_now"
              ? parseFloat(car?.pay_now).toFixed(2)
              : parseFloat(car?.pay_later).toFixed(2),
          quantity: 1,
        },
      ],
    });

    dispatch(resetAddProtection());
    if (!payment || !car) {
      setBookingError(t("Please select payment."));
    } else {
      setBookingError("");

      const updatedCar = {
        ...car,
        payment_method: payment,
        car_category: selectedCarCategory,
      };

      // Dispatch the action to update the selectedCar in Redux
      dispatch(setSelectedCar(updatedCar));

      if (booking_number) {
        navigate(`/${language}/bookingDetailsTwo/${booking_number}`);
      } else {
        navigate(`/${language}/bookingDetailsTwo`);
      }
    }
  };

  //   useEffect(()=>{
  // if(selectedCar && selectedPaymentOption){
  //   // if (!selectedPaymentOption) {
  //   //   setBookingError("Please select payment.");
  //   // } else {
  //   //   setBookingError("");

  //     // Assuming selectedCar is the object you want to update
  //     const updatedCar = {
  //       ...selectedCar,
  //       payment_method: selectedPaymentOption, // Add your new key-value pair here
  //       car_category: selectedCarCategory,
  //     };

  //     // Dispatch the action to update the selectedCar in Redux
  //     dispatch(setSelectedCar(updatedCar));
  //   // }
  // }
  //   },[selectedPaymentOption])

  //   useEffect(()=>{
  // if(selectedCar?.payment_method && selectedPaymentOption ){
  //   goToBooking();
  // }
  //   },[selectedCar?.payment_method])

  const [location, setlocation] = useState("");

  const handleCheckboxChange = (id) => {
    const car = carArray?.find((item) => item.id === id);
    dispatch(setSelectedCar(car));
  };
  // const handleCheckboxChange2 = (id) => {
  //   const car = savedCarArray?.find((item) => item.id === id);
  //   dispatch(setSelectedCar(car));
  //   // set_saved_car(savedCarArray[0]);
  // };
  useEffect(() => {
    // Cleanup function to reset `got_to_edit` to false when the component unmounts

    return () => {
      // dispatch(reset_got_to_edit());
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedCar && citiesArray) {
      const location = citiesArray?.find(
        (item) => item.id === selectedCar?.city_id
      );
      setlocation(location?.name);
    }
  }, [selectedCar]);

  const getCarCategories = () => {
    const url = `${configWeb.GET_CAR_CATEGORY}?lang=${getApiLang(language)}&page=1&page_size=10000`;
    simpleGetCall(url)
      .then((res) => {
        if (!res?.error) {
          setCarCategories(res?.data);
        }
      })
      .catch((error) => {})
      .finally(() => {});
  };
  useEffect(() => {
    getCarCategories();
  }, [language]);

  const category = carCategories?.find(
    (car) => car?.id === selectedCar?.group_id
  );

  // useEffect(() => {
  //   if (savedCar) {
  //     carSearchForSavedCar();
  //   }
  // }, [savedCar]);

  // useEffect(() => {
  //   if (savedCarArray) {
  //     dispatch(setSelectedCar(savedCarArray[0]));
  //   }
  // }, [savedCarArray]);
  // const carSearchForSavedCar = async () => {
  //   const body = {
  //     booking_type: requestBody_dropoff?.booking_type,
  //     pickup_type: requestBody_pickup?.pickup_type,
  //     pickup_date: requestBody_dropoff?.pickup_date,
  //     pickup_time: requestBody_dropoff?.pickup_time,
  //     dropoff_type: requestBody_dropoff?.dropoff_type,
  //     dropoff_date: requestBody_dropoff?.dropoff_date,
  //     dropoff_time: requestBody_dropoff?.dropoff_time,
  //     booking_source: "web",

  //     // discount_coupon: ""
  //   };

  //   if (requestBody_pickup?.pickup_type === "self") {
  //     body.pickup_location_id = requestBody_pickup?.pickup_location_id;
  //   }
  //   if (requestBody_pickup?.pickup_type === "delivery") {
  //     body.pickup_city_id = requestBody_pickup?.pickup_city_id;
  //     body.pickup_coordinates = requestBody_pickup?.pickup_coordinates;
  //     body.pickup_address = requestBody_pickup?.pickup_address;
  //   }

  //   if (requestBody_dropoff?.dropoff_type === "collection") {
  //     body.dropoff_city_id = requestBody_dropoff?.dropoff_city_id;
  //     body.dropoff_coordinates = requestBody_dropoff?.dropoff_coordinates;
  //     body.dropoff_address = requestBody_dropoff?.dropoff_address;
  //   }
  //   if (requestBody_dropoff?.dropoff_type === "self") {
  //     body.dropoff_location_id = requestBody_dropoff?.dropoff_location_id;
  //   }

  //   if (requestBody_pickup?.booking_type === "monthly") {
  //     body.booking_months = requestBody_pickup?.booking_months;
  //   }
  //   if (requestBody_dropoff?.discount_coupon) {
  //     body.discount_coupon = requestBody_dropoff?.discount_coupon;
  //   }

  //   const baseUrl = `${configWeb.POST_CAR_SEARCH}?lang=${getApiLang(language)}&page=1&page_size=100&sort=ASC&car_id=${savedCar}`; //car_id=1

  //   const url = selectedCar?.car_category
  //     ? `${baseUrl}&category_id=${selectedCar?.car_category}`
  //     : baseUrl;

  //   simplePostCall(baseUrl, JSON.stringify(body))
  //     .then((res) => {
  //       if (!res?.error) {
  //         setSavedCarArray(res?.data);
  //         // dispatch(setSelectedCar(res?.data[0]));
  //       }

  //       if (res?.status === "success") {
  //         //  notifySuccess(res?.message)
  //       }
  //       if (res?.error) {
  //         // dispatch(setSelectedCar(null))
  //         //   if(Array.isArray(res?.message)){
  //         //     notifyError(res?.message[0]);
  //         //   } else{
  //         //   notifyError(res?.message);
  //         //   }
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("validate pickuplocation api failed-->", error);
  //       // notifyError('Something went wwrong, please try again letter')
  //     })
  //     .finally(() => {});
  // };

  // useEffect(() => {
  //   if (savedCar) {
  //   }
  // }, []);

  useEffect(() => {
    if (carArray) {
      const items = carArray?.map((car, index) => ({
        item_id: car.id, // use appropriate property names based on `carArray`
        item_name: car.car_name,
        // affiliation: car.affiliation,
        // coupon: car.coupon,
        discount: parseFloat(car.discount).toFixed(2),
        index: index,
        item_brand: car.brand,
        item_category: car.category,
        // item_category2: car.subCategory,
        // item_variant: car.variant,
        location_id: car.city_id,
        price:
          requestBody_pickup?.booking_type === "daily"
            ? parseFloat(car.pay_later).toFixed(2)
            : parseFloat(car?.per_month_rate).toFixed(2),
        quantity: 1,
      }));

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
        // item_list_name: "Car List",
        items: items,
      });
    }
  }, [carArray]);

  useEffect(() => {
    if (carArray?.length > 0) {
      const searchTerm = "car search";
      const contentIds = carArray?.map((car) => car.id);
      const value = carArray?.map((car) => car.pay_later);
      pixelSearchEvent(searchTerm, contentIds, value);
    }
  }, [carArray]);

 
  return (
    <>
      <MetaHelmet
        title={t("Choose Your Car")}
        description=""
        keywords="car rental, affordable cars, rent a car"
        noindex={true}
        canonicalUrl={`${configWeb.BASE_WEB_URL}/${language}/bookingdetails`}
      />
      {loading /*  true */ ? (
        // <div
        //   className="d-flex justify-content-center align-items-center"
        //   style={{ height: "100vh", width: "100vw" }}
        // >
        //   <Spinner />
        // </div>
        // <CarLoadingComponent />
        <CarLoadingComponent2 />
      ) : (
        <>
          {/* <section className="form-section"> */}
          <section className="pb-1 form-section">
            <h1 className="pt-2 m-0 text-center text-light booking__tital-dream display-none-in-small-screen">
              {booking_number ? t("Edit Your Booking") : t("Your Booking Details")}!
            </h1>
            {editUserBookingObject?.payment_type === "now" && (
              <div className="edit-booking-text">
                <p>{t("Your amount will be adjusted at the checkout")}.</p>
              </div>
            )}
            <Col
              id="booking-form-container"
              lg="12"
              md="12"
              sm="12"
              className={
                location_url.pathname === `/${language}/bookingDetails`
                  ? "p-0"
                  : ""
              }
            >
              <Container>
                {booking_number ? (
                  edit_edit_form ? (
                    <EditFindCarForm
                      booking_number={booking_number}
                      carSearch={carSearch}
                      set_booking_number_flag={set_booking_number_flag}
                      set_edit_edit_form={set_edit_edit_form}
                      setIsFormValidated={setIsFormValidated}
                    />
                  ) : (
                    <BookingAddressSection carArray={carArray} />
                  )
                ) : got_to_edit ? (
                  <>
                    <EditFindCarForm
                      isFormValidated={isFormValidated}
                      setIsFormValidated={setIsFormValidated}
                      set_edit_edit_form={set_edit_edit_form}
                    />
                  </>
                ) : (
                  <BookingAddressSection carArray={carArray} />
                )}
              </Container>
            </Col>
          </section>
          {/* </section> */}

          {/* {booking_number ? (
            edit_edit_form ? (
              <section className="form-section">
                <section className="p-0 form-section">
                  <h1 className="pt-2 m-0 text-center text-light booking__tital-dream">
                    {t("Edit Your Booking")}!
                  </h1>
                  <Col lg="12" md="12" sm="12">
                    <Container>
                      <EditFindCarForm
                        booking_number={booking_number}
                        carSearch={carSearch}
                        set_booking_number_flag={set_booking_number_flag}
                        set_edit_edit_form={set_edit_edit_form}
                      />
                    </Container>
                  </Col>
                </section>
              </section>
            ) : (
              <BookingAddressSection carArray={carArray} />
            )
          ) : (
            <section className="form-section">
              {got_to_edit ? (
                <>
                  <section className="p-0 form-section">
                    <h1 className="pt-2 m-0 text-center text-light booking__tital-dream">
                      {t("Book your dream car now")}!
                    </h1>
                    <Col lg="12" md="12" sm="12">
                      <Container>
                        <EditFindCarForm  />
                      </Container>
                    </Col>
                  </section>
                </>
              ) : (
                <BookingAddressSection carArray={carArray} />
              )}
            </section>
          )} */}
         

          {(booking_number && !booking_number_flag) ? (
            <></>
          ) : (!got_to_edit ) && (
            <>
              <section className="p-0">
                <Container dir="ltr">
                  <BookingStepper
                    carCategories={carCategories}
                    handleCarCategorySelection={handleCarCategorySelection}
                    selectedCarCategory={selectedCarCategory}
                    booking_number={booking_number}
                    set_edit_edit_form={set_edit_edit_form}
                    
                  />
                </Container>
              </section>

              <section className="p-0">
                <Container>
                    {/* <>
              {carData.slice(0, 6).map((item) => (
                <CarsAndDetails
                  item={item}
                  key={item.id}
                  isChecked={isChecked[item.carName] || false}
                  onCheckboxChange={handleCheckboxChange}
                />
              ))}
            </> */}

                    <>
                      {requestBody_dropoff?.discount_coupon && (
                        <CouponSuccess
                          couponCode={requestBody_dropoff?.discount_coupon}
                          message="Coupon"
                        />
                      )}

                      <SortingFilter
                        options={sortingOptions}
                        onSelect={handleSortingSelection}
                        // placeholder={sortingOptions[0].label}
                        selectedValue={sortingOption}
                        labelText={"Sorting Filter"}
                      />

                  <div className="cardetails__cards-grid">
                      {/* {Array.isArray(savedCarArray) &&
                        !selectedCarCategory &&
                        savedCarArray?.map((item) => (
                          <React.Fragment key={item.id}>
                            <CarsAndDetails
                              item={item}
                              isChecked={selectedCar?.id === item.id}
                              onCheckboxChange={handleCheckboxChange2}
                              isSelected={selectedCar?.id === item?.id}
                              selectedCar_flag="yes"
                            />
                            {selectedCar?.id === item?.id && (
                              <div className="col-12">
                                <section>
                                  <div className="row g-2 car__details__section">
                                    <div className="col-lg-6 col-sm-12">
                                      <div className="">
                                        <Figure>
                                          <Figure.Image
                                            alt="171x180"
                                            src={selectedCar?.image}
                                          />
                                        </Figure>
                                      </div>
                                    </div>
                                    <div className="col-lg-6  col-sm-12">
                                      <div className="">
                                        <Card className="shadow border-0">
                                          <Card.Header className="car__details__header">
                                            Location: {location}
                                          </Card.Header>
                                          <Card.Body className="car__details__body ">
                                            <Card.Text className="d-flex flex-nowrap gap-5 justify-content-center">
                                              <p>
                                                {
                                                  requestBody_pickup?.pickup_date
                                                }{" "}
                                                <br />{" "}
                                                {
                                                  requestBody_pickup?.pickup_time
                                                }
                                              </p>
                                              <Badge className="to__badge mt-2">
                                                To
                                              </Badge>
                                              <div>
                                                {
                                                  requestBody_dropoff?.dropoff_date
                                                }{" "}
                                                <br />{" "}
                                                {
                                                  requestBody_dropoff?.dropoff_time
                                                }
                                              </div>
                                            </Card.Text>
                                          </Card.Body>
                                        </Card>
                                        <Card className="mt-3 shadow border-0">
                                          <Card.Header className="car__details__header">
                                            Car Details
                                          </Card.Header>
                                          <Card.Body className="car__details__body">
                                            <Card.Title className="car__details__title m-0">
                                              {selectedCar?.car_name}
                                            </Card.Title>
                                         
                                            <Card.Text className="car__details__feature m-0">
                                              Vehicle Features
                                            </Card.Text>
                                            <hr className="my-2" />
                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "later" &&
                                               requestBody_pickup?.booking_type ===
                                                "daily" && (
                                                <Form.Check 
                                                  type="checkbox"
                                                  id="pay_later"
                                                  label={`Pay Later ${fmt(selectedCar?.pay_later)} | ${
                                                    selectedCar?.booking_days
                                                  } day`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_later"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_later"
                                                    )
                                                  }
                                                />
                                              )}
                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "later" &&
                                               requestBody_pickup?.booking_type ===
                                                "monthly" && (
                                                <Form.Check
                                                  type="checkbox"
                                                  id="pay_monthly_later"
                                                  label={`Pay Later ${fmt(selectedCar?.car_rate_total)} | ${selectedCar?.booking_months} Month`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_monthly_later"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_monthly_later"
                                                    )
                                                  }
                                                />
                                              )}

                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "now" &&
                                           requestBody_pickup?.booking_type ===
                                                "daily" && (
                                                <Form.Check 
                                                  type="checkbox"
                                                  id="pay_now"
                                                  label={`Pay Now  ${fmt(selectedCar?.pay_now)} | ${
                                                    selectedCar?.booking_days
                                                  } day`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_now"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_now"
                                                    )
                                                  }
                                                />
                                              )}

                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "now" &&
                                             requestBody_pickup?.booking_type ===
                                                "monthly" && (
                                                <Form.Check 
                                                  type="checkbox"
                                                  id="pay_monthly_now"
                                                  label={`Pay Now ${fmt(selectedCar?.per_month_rate)} * ${selectedCar?.booking_months} Month`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_monthly_now"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_monthly_now"
                                                    )
                                                  }
                                                />
                                              )}

                                            {!booking_number && (
                                              <>
                                                {requestBody_pickup?.booking_type ===
                                                "monthly---" ? (
                                                  <>
                                                    <Form.Check 
                                                      type="checkbox"
                                                      id="pay_monthly_now"
                                                      label={`Pay Now ${fmt(selectedCar?.per_month_rate)} x ${selectedCar?.booking_months} Month`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_monthly_now"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_monthly_now"
                                                        )
                                                      }
                                                    />
                                                    <Form.Check
                                                      type="checkbox"
                                                      id="pay_monthly_later"
                                                      label={`Pay Later ${fmt(selectedCar?.per_month_rate)} x ${selectedCar?.booking_months} Month`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_monthly_later"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_monthly_later"
                                                        )
                                                      }
                                                    />
                                                  </>
                                                ) : (
                                                  <>
                                                    {" "}
                                                    <Form.Check 
                                                      type="checkbox"
                                                      id="pay_now"
                                                      label={`Pay Now ${fmt(selectedCar?.pay_now)} | ${
                                                        selectedCar?.booking_days
                                                      } day`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_now"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_now"
                                                        )
                                                      }
                                                    />
                                                    <Form.Check 
                                                      type="checkbox"
                                                      id="pay_later"
                                                      label={`Pay Later ${fmt(selectedCar?.pay_later)} | ${
                                                        selectedCar?.booking_days
                                                      } day`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_later"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_later"
                                                        )
                                                      }
                                                    />{" "}
                                                  </>
                                                )}
                                              </>
                                            )}

                                           

                                            <div className="text-center my-2 ">
                                             
                                              <Button
                                                className="booking__btn mt-1"
                                                onClick={() => goToBooking()}
                                              >
                                            Book  
                                              </Button>

                                        
                                            </div>
                                            <div className=" d-flex justify-content-center">
                                              {bookingError && (
                                                <span className="text-danger">
                                                  {bookingError}{" "}
                                                </span>
                                              )}
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </div>
                                    </div>

                                  </div>
                                </section>
                              </div>
                            )}
                          </React.Fragment>
                        ))} */}
                      {/* Empty result. The grid used to render nothing at all when
                          the search came back with no cars, so the customer landed
                          on a blank page and had no way to tell whether the fleet
                          was unavailable, the dates were wrong, or the site was
                          broken. Guarded on !loading so it does not flash while the
                          request is still in flight. */}
                      {!loading && Array.isArray(carArray) && carArray.length === 0 && (
                        <div className="cardetails__empty">
                          <i className="fa-solid fa-car-side cardetails__empty-icon" aria-hidden="true"></i>
                          <h3>{t("No cars available for these dates")}</h3>
                          <p>
                            {t(
                              "Try different dates or another pick-up city — or message us on WhatsApp and we will find you a car."
                            )}
                          </p>
                          <div className="cardetails__empty-actions">
                            <button
                              type="button"
                              className="cardetails__empty-btn cardetails__empty-btn--primary"
                              onClick={() => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {t("Change dates")}
                            </button>
                            <a
                              className="cardetails__empty-btn cardetails__empty-btn--whatsapp"
                              href="https://api.whatsapp.com/send/?phone=212655585859&text=Hello+Route+Facile%21+I+could+not+find+a+car+for+my+dates.&type=phone_number&app_absent=0"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>{" "}
                              {t("Contact us on WhatsApp")}
                            </a>
                          </div>
                        </div>
                      )}
                      {Array.isArray(carArray) &&
                        carArray?.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <CarsAndDetails
                              item={item}
                              isChecked={selectedCar?.id === item.id}
                              onCheckboxChange={handleCheckboxChange}
                              isSelected={selectedCar?.id === item?.id}
                              setSelectedPaymentOption={
                                setSelectedPaymentOption
                              }
                              goToBooking={goToBooking}
                              saved_car_flag="no"
                            />
                            {/*    {selectedCar?.id === item?.id && (
                              <div className="col-12">
                                <section>
                                  <div className="row g-2 car__details__section">
                                    <div className="col-lg-6 col-sm-12">
                                      <div className="">
                                        <Figure>
                                          <Figure.Image
                                            alt="171x180"
                                            src={selectedCar?.image}
                                          />
                                        </Figure>
                                      </div>
                                    </div>
                                    <div className="col-lg-6  col-sm-12">
                                      <div className="">
                                       
                                        <Card className="mt-3 shadow border-0">
                                          <Card.Header className="car__details__header">
                                            Car Details
                                          </Card.Header>
                                          <Card.Body className="car__details__body">
                                            <Card.Title className="car__details__title m-0">
                                              {selectedCar?.car_name}
                                            </Card.Title>
                                            <Card.Text className="car__details__compare m-0">
                                              or Similar |{" "}
                                              {selectedCar?.category}
                                            </Card.Text>

                                      
                                            <hr className="my-2" />
                                         

                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "later" &&
                                              requestBody_pickup?.booking_type ===
                                                "daily" && (
                                                <Form.Check 
                                                  type="checkbox"
                                                  id="pay_later"
                                                  label={`Pay Later ${fmt(selectedCar?.pay_later)} | ${
                                                    selectedCar?.booking_days
                                                  } day`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_later"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_later"
                                                    )
                                                  }
                                                />
                                              )}
                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "later" &&
                                           requestBody_pickup?.booking_type ===
                                                "monthly" && (
                                                <Form.Check
                                                  type="checkbox"
                                                  id="pay_monthly_later"
                                                  label={`Pay Later ${fmt(selectedCar?.per_month_rate)} x ${selectedCar?.booking_months} Month`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_monthly_later"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_monthly_later"
                                                    )
                                                  }
                                                />
                                              )}

                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "now" &&
                                             requestBody_pickup?.booking_type ===
                                                "daily" && (
                                                <Form.Check 
                                                  type="checkbox"
                                                  id="pay_now"
                                                  label={`Pay Now ${fmt(selectedCar?.pay_now)} | ${
                                                    selectedCar?.booking_days
                                                  } day`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_now"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_now"
                                                    )
                                                  }
                                                />
                                              )}

                                            {booking_number &&
                                              editUserBookingObject?.payment_type ===
                                                "now" &&
                                              requestBody_pickup?.booking_type ===
                                                "monthly" && (
                                                <Form.Check 
                                                  type="checkbox"
                                                  id="pay_monthly_now"
                                                  label={`Pay Now ${fmt(selectedCar?.per_month_rate)} * ${selectedCar?.booking_months} Month`}
                                                  checked={
                                                    selectedPaymentOption ===
                                                    "pay_monthly_now"
                                                  }
                                                  onChange={() =>
                                                    handlePaymentCheckboxChange(
                                                      "pay_monthly_now"
                                                    )
                                                  }
                                                />
                                              )}

                                            {!booking_number && (
                                              <>
                                                {requestBody_pickup?.booking_type ===
                                                "monthly" ? (
                                                  <>
                                                    <Form.Check 
                                                      type="checkbox"
                                                      id="pay_monthly_now"
                                                      label={`Pay Now ${fmt(selectedCar?.per_month_rate)} x ${selectedCar?.booking_months} Month`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_monthly_now"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_monthly_now"
                                                        )
                                                      }
                                                    />
                                                    <Form.Check
                                                      type="checkbox"
                                                      id="pay_monthly_later"
                                                      label={`Pay Later ${fmt(selectedCar?.per_month_rate)} x ${selectedCar?.booking_months} Month`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_monthly_later"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_monthly_later"
                                                        )
                                                      }
                                                    />
                                                  </>
                                                ) : (
                                                  <>
                                                    {" "}
                                                    <Form.Check 
                                                      type="checkbox"
                                                      id="pay_now"
                                                      label={`Pay Now ${fmt(selectedCar?.pay_now)} | ${
                                                        selectedCar?.booking_days
                                                      } day`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_now"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_now"
                                                        )
                                                      }
                                                    />
                                                    <Form.Check 
                                                      type="checkbox"
                                                      id="pay_later"
                                                      label={`Pay Later ${fmt(selectedCar?.pay_later)} | ${
                                                        selectedCar?.booking_days
                                                      } day`}
                                                      checked={
                                                        selectedPaymentOption ===
                                                        "pay_later"
                                                      }
                                                      onChange={() =>
                                                        handlePaymentCheckboxChange(
                                                          "pay_later"
                                                        )
                                                      }
                                                    />{" "}
                                                  </>
                                                )}
                                              </>
                                            )}

                                            {subscriptionPlan ==
                                            "monthly----" ? (
                                              <>
                                                <Form.Check 
                                                  type="checkbox"
                                                  id="pay3"
                                                  label="Pay On Installment"
                                                  onChange={(e) =>
                                                    setIsInstallment(
                                                      e.target.checked
                                                    )
                                                  }
                                                />
                                                {isInstallment && (
                                                  <div className="my-4">
                                                    <Table
                                                      striped
                                                      bordered
                                                      hover
                                                    >
                                                      <thead>
                                                        <tr>
                                                          <th>sr. No</th>
                                                          <th>
                                                            Installment From
                                                            Date
                                                          </th>
                                                          <th>
                                                            Installment To Date
                                                          </th>
                                                          <th>No. Of Days</th>
                                                          <th>
                                                            Installment Amount
                                                          </th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        <tr>
                                                          <td>1</td>
                                                          <td>
                                                            28-12-2023 00:23
                                                          </td>
                                                          <td>
                                                            27-01-2024 00:29
                                                          </td>
                                                          <td>30</td>
                                                          <td>1468.98</td>
                                                        </tr>
                                                        <tr>
                                                          <td></td>
                                                          <td colSpan={2}>
                                                            Total
                                                          </td>
                                                          <td>183</td>
                                                          <td>8690.77</td>
                                                        </tr>
                                                      </tbody>
                                                    </Table>
                                                  </div>
                                                )}
                                              </>
                                            ) : (
                                              <></>
                                            )}

                                            <div className="text-center my-2 ">
                                            
                                              <Button
                                                className="booking__btn mt-1"
                                                onClick={() => goToBooking()}
                                              >
                                                {requestBody_pickup?.booking_type === "daily" ? "Book" : "View More Options"} 
                                              </Button>

                                           
                                            </div>
                                            <div className=" d-flex justify-content-center">
                                              {bookingError && (
                                                <span className="text-danger">
                                                  {bookingError}{" "}
                                                </span>
                                              )}
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </div>
                                    </div>

                               
                                  </div>
                                </section>
                              </div>
                            )} */}
                          </React.Fragment>
                        ))}
                  </div>
                    </>
                  <CustomPagination
                    recordsPerPage={recordsPerPage}
                    totalRecords={totalRecords}
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                  />
                  {selectedCar && (
                    <></>
                    /*  <section>
            <div className="row g-2 car__details__section">
              <div className="col-lg-6 col-sm-12">
               
                <div className="">
                  <Figure>
                    <Figure.Image alt="171x180" src={selectedCar?.image} />
                  </Figure>
                </div>
              </div>
              <div className="col-lg-6  col-sm-12">
                <div className="">
                  <Card className="shadow border-0">
                    <Card.Header className="car__details__header">
                      Location: {location}
                    </Card.Header>
                    <Card.Body className="car__details__body ">
                      <Card.Text className="d-flex flex-nowrap gap-5 justify-content-center">
                        <p>
                          {requestBody_pickup?.pickup_date} <br /> {requestBody_pickup?.pickup_time}
                        </p>
                        <Badge className="to__badge mt-2">To</Badge>
                        <div>
                         {requestBody_dropoff?.dropoff_date} <br /> {requestBody_dropoff?.dropoff_time}
                        </div>
                      </Card.Text>
                    </Card.Body>
                  
                  </Card>
                  <Card className="mt-3 shadow border-0">
                    <Card.Header className="car__details__header">
                      Car Details
                    </Card.Header>
                    <Card.Body className="car__details__body">
                      <Card.Title className="car__details__title m-0">
                        {selectedCar?.car_name}
                      </Card.Title>
                      <Card.Text className="car__details__compare m-0">
                        or Similar | Compact
                      </Card.Text>
                      <Card.Text className="car__details__feature m-0">
                        Vehicle Features
                      </Card.Text>
                      <hr className="my-2" />
                      <Card.Text className="car__details__features">
                        Power Steering, Air Conditioner, Key Less Entry,
                        Radio, Power Windows, Central Lock
                      </Card.Text>

                      {requestBody_pickup?.booking_type === 'monthly' ?   <Form.Check // prettier-ignore
                        type="checkbox"
                        id="pay_monthly_now"
                        label={`Pay Now ${fmt(selectedCar?.car_rate_total)} | ${selectedCar?.booking_months} Month`}
                        checked={selectedPaymentOption === 'pay_monthly_now'}
                      onChange={() => handlePaymentCheckboxChange('pay_monthly_now')}
                      />  : ( <> <Form.Check // prettier-ignore
                      type="checkbox"
                      id="pay_now"
                      label={`Pay Now ${fmt(selectedCar?.pay_now)} | ${selectedCar?.booking_days} day`}
                      checked={selectedPaymentOption === 'pay_now'}
                      onChange={() => handlePaymentCheckboxChange('pay_now')}
                    />
                    <Form.Check // prettier-ignore
                      type="checkbox"
                      id="pay_later"
                      label={`Pay Later ${fmt(selectedCar?.pay_later)} | ${selectedCar?.booking_days} day`}
                      checked={selectedPaymentOption === 'pay_later'}
                     onChange={() => handlePaymentCheckboxChange('pay_later')}
                    /> </>)  }
                    
                      {subscriptionPlan === "monthly----"  ? <>
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="pay3"
                        label="Pay On Installment"
                        onChange={(e) => setIsInstallment(e.target.checked)}
                      />
                      {isInstallment && (
                        <div className="my-4">
                          <Table striped bordered hover>
                            <thead>
                              <tr>
                                <th>sr. No</th>
                                <th>Installment From Date</th>
                                <th>Installment To Date</th>
                                <th>No. Of Days</th>
                                <th>Installment Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>1</td>
                                <td>28-12-2023 00:23</td>
                                <td>27-01-2024 00:29</td>
                                <td>30</td>
                                <td>1468.98</td>
                              </tr>
                              <tr>
                                <td></td>
                                <td colSpan={2}>Total</td>
                                <td>183</td>
                                <td>8690.77</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      )}
                      </>:<></>}
                     

                      <div className="text-center my-2 ">
                        <Link
                          className="text-decoration-none"
                          to="/bookingDetailsTwo"
                        >
                          <Button className="booking__btn mt-1" >Book</Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            
              <div className="col">
                <Card className="shadow border-0">
                  <Card.Header className="car__details__header">
                    Specifications
                  </Card.Header>
                  <Card.Body>
                    <div class="d-flex flex-wrap justify-content-between gap-4 align-items-center">
                      <div>
                        <img className="spec__img" src={specIcon1} alt="" />
                        <span className="spec__label">{selectedCar?.car_name}</span>
                      </div>
                      <div>
                        <img className="spec__img" src={specIcon2} alt="" />
                        <span className="spec__label">{selectedCar?.transmission}</span>
                      </div>
                     
                      <div>
                        <img className="spec__img" src={specIcon6} alt="" />
                        <span className="spec__label">{selectedCar?.fuel_type}</span>
                      </div>
                      <div>
                        <img className="spec__img" src={specIcon7} alt="" />
                        <span className="spec__label">Air Condition</span>
                      </div>
                    
                    </div>
                  </Card.Body>
                </Card>
              </div>
          
            </div>
          </section> */
                  )}
                </Container>
              </section>
            </>
          )}
        </>
      )}
      
      {/* Discount Popup Modal */}
      <Modal
        show={showDiscountPopup}
        onHide={() => setShowDiscountPopup(false)}
        centered
        size="lg"
        className="discount-popup-modal"
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
                  setSelectedPaymentOption('pay_now');
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
            onClick={() => setShowDiscountPopup(false)}
          >
            {t("Continue with Pay Later")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BookingDetails;
