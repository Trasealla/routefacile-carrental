
import { useEffect } from "react";
import { AppContext } from "./AppContext";
import React, { useState } from "react";


const AppState = (props) => {
  const [Stepperpage, setStepperpage] = useState(2);
  const [subscriptionPlan ,setSubscription ] = useState("daily")
  const [ selectedPickupLocation, setSelectedPickupLocation] = useState(null)
  const[ selectedDropoffLocation, setSelectedDropoffLocation] = useState(null);
  const [isFormValidated, setIsFormValidated] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputValueDropoff, setInputValueDropoff] = useState('');
  const [bookingTypeGlobal, setBookingTypeGlobal] = useState("daily")
  const [clickonMapAddressSelectionFlag, setClickonMapAddressSelectionFlag] = useState(false);
  const [editclickonMapAddressSelectionFlag, setEditClickonMapAddressSelectionFlag] = useState(false);
  const [clickonMapAddressSelectionFlagForDropoff, setClickonMapAddressSelectionFlagForDropoff] = useState(false);
  const [editclickonMapAddressSelectionFlagForDropoff, setEditClickonMapAddressSelectionFlagForDropoff] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [language , setLanguage] = useState(localStorage.getItem('language' || 'en'));
  const API_KEY = process.env.REACT_APP_API_KEY
 
  return (
    <div>
      <AppContext.Provider
        value={{
          Stepperpage, setStepperpage, inputValue, setInputValue,inputValueDropoff, setInputValueDropoff, isFormValidated, setIsFormValidated,
          subscriptionPlan ,setSubscription, language, setLanguage, API_KEY,selectedPickupLocation, setSelectedPickupLocation, selectedDropoffLocation, setSelectedDropoffLocation,bookingTypeGlobal,setBookingTypeGlobal,
          setClickonMapAddressSelectionFlag,clickonMapAddressSelectionFlag,setClickonMapAddressSelectionFlagForDropoff,clickonMapAddressSelectionFlagForDropoff,setEditClickonMapAddressSelectionFlag,editclickonMapAddressSelectionFlag,
          editclickonMapAddressSelectionFlagForDropoff,setEditClickonMapAddressSelectionFlagForDropoff,
          initialLoad, setInitialLoad,
        }}
      >
        {props.children}
      </AppContext.Provider>
    </div>
  );
};

export default AppState;
