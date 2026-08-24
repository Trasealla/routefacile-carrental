// import { configureStore } from '@reduxjs/toolkit';

// import rootReducer from '../reducers/index';

// const store = configureStore({
//   // reducer: counterReducer,
//   reducer: rootReducer,
//   devTools : true

// });

// export default store;

///////////////////////////////////////////////////////////////////////////////////////
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "../reducers/index";
import storageSession from "redux-persist/lib/storage/session"; // Import session storage engine

const persistConfig = {
  key: "root",
  storage: storageSession,

  whitelist: [
    "language",
    "selectedPickupLocation",
    "selectedCollectCity",
    "selectedDeliveryCity",
    "requestBody_dropoff",
    "requestBody_pickup",
    "stepper",
    "selectedDropoffLocation",
    "inputValue",
    "inputValueDropoff",
    "carArray",
    "citiesArray",
    "carExtraArray",
    "filterCarArray",
    "selectedCar",
    "addProtection",
    "confirmBookingPayload",
    "editUserBookingObject",
    "savedCar",
    "isValidAddressDelivery",
    "errorAddressDelivery",
    "isValidAddressCollection",
    "errorAddressCollection",
    "isLoginFromRegister",
    "dropOffCity",
    "pickupCity",
    "selectedMonthlyPlan",
    "inputValueDropoffChangeFlag",
    "collectAddressMapErrorFlag",
    
  ], // Only persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
});

const persistor = persistStore(store);

export { store, persistor };
