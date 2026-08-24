import { combineReducers } from "redux";
import { createSlice } from "@reduxjs/toolkit";
import { SET_LANGUAGE } from "../actions/action";
// Import the stepper slice reducer
import stepperReducer from "./Slices/stepperSlice";
import selectedDropoffLocation from "./Slices/selectedDropoffLocationSlice";
import inputValue from "./Slices/inputValueSlice";
import selectedMonthlyPlan from "./Slices/selectedMonthlyPlanSlice";
import inputValueDropoff from "./Slices/inputValueDropoffSlice";
import carArray from "./Slices/carArraySlice";
import carExtraArray from "./Slices/carExtraArray";
import got_to_edit from "./Slices/goToEditSlice";
import edit_edit_form from "./Slices/edit_edit_form_slice";
import selectedDeliveryCitySlice from "./Slices/selectedDeliveryCitySlice";
import selectedCollectCitySlice from "./Slices/selectedCollectCitySlice";
import selectedCar from "./Slices/selectedCarSlice";
import editUserBookingObject from "./Slices/editUserBookingSlice";
import savedCar from "./Slices/savedCarSlice"
import filterCarArray from "./Slices/filterCarArraySlice";
import addProtection from "./Slices/addProtectionSlice";
import confirmBookingPayload from "./Slices/confirmBookingPayloadSlice";
import isValidAddressDelivery from "./Slices/isValidAddressDeliverySlice";
import errorAddressDelivery from "./Slices/errorAddressDelivery";
import isValidAddressCollection from "./Slices/isValidAddressCollection";
import errorAddressCollection from "./Slices/errorAddressCollection";
import isLoginFromRegister from "./Slices/isLoginFromRegisterSlice";
import dropOffCity from "./Slices/dropoffCitySlice";
import pickupCity from "./Slices/pickupCitySlice";
import inputValueDropoffChangeFlag from "./Slices/inputValueDropoffChangeFlagSlice"; 
import collectAddressMapErrorFlag from "./Slices/collectAddressMapErrorFlagSlice";
// Initial States
const initialCounterState = {
  counter: 0,
};
const initialSelectedPickupLocationState = {
  selectedPickupLocation: null,
  // selectedPickupLocation: { value: '', label: '' }
};
const initialCitiesArrayState = {
  citiesArray: [],
};

const initialLanguageState = {
  // Migrate legacy Arabic code "ae" → "ar" so URLs use /ar/
  language: (() => {
    const stored = localStorage.getItem("language");
    if (stored === "ae") {
      localStorage.setItem("language", "ar");
      return "ar";
    }
    return stored || "en";
  })(),
};

const initialRequestBodyDropoffState = {
  requestBody_dropoff: null,
};
const initialRequestBodyPickupState = {
  requestBody_pickup: null,
};

// Slices
const requestBodySlice_dropoff = createSlice({
  name: "requestBody_dropoff",
  initialState: initialRequestBodyDropoffState,
  reducers: {
    setRequestBody_dropoff: (state, action) => {
      state.requestBody_dropoff = action.payload;
    },
  },
});
const requestBodySlice_pickup = createSlice({
  name: "requestBody_pickup",
  initialState: initialRequestBodyPickupState,
  reducers: {
    setRequestBody_pickup: (state, action) => {
      state.requestBody_pickup = action.payload;
    },
  },
});
// Slice
const selectedPickupLocationSlice = createSlice({
  name: "selectedPickupLocation",
  initialState: initialSelectedPickupLocationState,
  reducers: {
    setSelectedPickupLocation: (state, action) => {
      state.selectedPickupLocation = action.payload;
    },
  },
});
const citiesArraySlice = createSlice({
  name: "citiesArray",
  initialState: initialCitiesArrayState,
  reducers: {
    setCitiesArray_1: (state, action) => {
      state.citiesArray = action.payload;
    },
  },
});

const counterReducer = (state = initialCounterState, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, counter: state.counter + 1 };
    case "DECREMENT":
      return { ...state, counter: state.counter - 1 };
    default:
      return state;
  }
};

const languageReducer = (state = initialLanguageState, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      localStorage.setItem("language", action.payload);
      return { ...state, language: action.payload };
    default:
      return state;
  }
};

// Combine Reducers
const rootReducer = combineReducers({
  counter: counterReducer,
  language: languageReducer,
  requestBody_dropoff: requestBodySlice_dropoff.reducer,
  requestBody_pickup: requestBodySlice_pickup.reducer,
  selectedPickupLocation: selectedPickupLocationSlice.reducer,
  citiesArray: citiesArraySlice.reducer,
  stepper: stepperReducer, // Add the stepper reducer
  selectedDropoffLocation: selectedDropoffLocation,
  inputValue: inputValue,
  selectedDeliveryCity: selectedDeliveryCitySlice,
  inputValueDropoff: inputValueDropoff,
  selectedCollectCity: selectedCollectCitySlice,
  carArray: carArray,
  carExtraArray: carExtraArray,
  got_to_edit: got_to_edit,
  edit_edit_form: edit_edit_form,
  selectedCar: selectedCar,
  filterCarArray: filterCarArray,
  addProtection: addProtection,
  confirmBookingPayload: confirmBookingPayload,
  editUserBookingObject: editUserBookingObject,
  // countries : countries,
  savedCar : savedCar,
  isValidAddressDelivery : isValidAddressDelivery,
  errorAddressDelivery : errorAddressDelivery,
  isValidAddressCollection : isValidAddressCollection,
  errorAddressCollection : errorAddressCollection,
  isLoginFromRegister : isLoginFromRegister,
  pickupCity : pickupCity,
  dropOffCity : dropOffCity,
  inputValueDropoffChangeFlag : inputValueDropoffChangeFlag,
  collectAddressMapErrorFlag : collectAddressMapErrorFlag,
  selectedMonthlyPlan : selectedMonthlyPlan
  // Add other reducers here if you have more
});

export default rootReducer;

export const { setRequestBody_dropoff } = requestBodySlice_dropoff.actions;
export const { setRequestBody_pickup } = requestBodySlice_pickup.actions;
export const { setSelectedPickupLocation } =
  selectedPickupLocationSlice.actions;
export const { setCitiesArray_1 } = citiesArraySlice.actions;
