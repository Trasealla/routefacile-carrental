//// validation addd code
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../../styles/find-car-form.css";
import { useTranslation } from "react-i18next";
import { simpleGetCall, simplePostCall } from "../../config.js/SetUp";
import { notifyError , notifySuccess} from "../../SharedComponent/notify";
import {
  Button,
  Col,
  Form,
  Row,
  Nav,
  Tab,
  Tabs,
  ButtonGroup,
  ToggleButton,
  Modal , FormControl
} from "react-bootstrap";
import PlacesAutocomplete, {
  geocodeByAddress,
  // getLatLng,
} from "react-places-autocomplete";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { multipartPostCall } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import { AppContext } from "../../context/AppContext";
import { GoogleMap, useLoadScript, Marker , MarkerF} from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { placesLibraryLoaded } from "../../utils/placesReady";
import TimePicker from "./TimePicker";
import ChooseDeliverToMePopup from "./ChooseDeliverToMePopup";

const libraries = ['places'];
const mapContainerStyle = {
 /*  width: '30rem',
  height: '30rem' */
  height: '400px',
  width: '100%',
};
const defaultCenter = {
  lat: 25.2048, // default latitude
  lng: 55.2708, // default longitude
};


const Pickup = [
  {
    value: "17",
    label: "Abu Dhabi International Airport - Meet & Greet, Abu Dhabi",
    id:"1"
  },
  {
    value: "13",
    label: "Dubai International Airport - Terminal 1 Arrival, Dubai",
    id:"2"

  },
  {
    value: "15",
    label: "Dubai International Airport - Terminal 2 Arrival, Dubai",
    id:"3"

  },
  {
    value: "16",
    label: "Dubai International Airport - Terminal 3 Arrival, Dubai",
  },
  { value: "11", label: "Sheikh Zayed Road, Dubai" },
  { value: "1", label: "Airport Road, Abu Dhabi" },
  { value: "10", label: "Ras Al Khaimah, Ras Al Khaimah" },
  { value: "9", label: "Fujairah, Fujairah" },
  { value: "8", label: "Sharjah, Sharjah" },
  { value: "7", label: "Al Quoz, Dubai" },
  { value: "6", label: "Al Ain, Al Ain" },
  { value: "5", label: "Al Dhannah Mall (ex: Ruwais Mall), Al Ruwais" },
  { value: "4", label: "World Trade Center Mall, Abu Dhabi" },
  { value: "3", label: "Abu Dhabi Mall, Abu Dhabi" },
  { value: "2", label: "Musaffah, Abu Dhabi" },
];
const Dropup = [
  {
    value: "17",
    label: "Abu Dhabi International Airport - Meet & Greet, Abu Dhabi",
  },
  {
    value: "13",
    label: "Dubai International Airport - Terminal 1 Arrival, Dubai",
  },
  {
    value: "15",
    label: "Dubai International Airport - Terminal 2 Arrival, Dubai",
  },
  {
    value: "16",
    label: "Dubai International Airport - Terminal 3 Arrival, Dubai",
  },
  { value: "11", label: "Sheikh Zayed Road, Dubai" },
  { value: "1", label: "Airport Road, Abu Dhabi" },
  { value: "10", label: "Ras Al Khaimah, Ras Al Khaimah" },
  { value: "9", label: "Fujairah, Fujairah" },
  { value: "8", label: "Sharjah, Sharjah" },
  { value: "7", label: "Al Quoz, Dubai" },
  { value: "6", label: "Al Ain, Al Ain" },
  { value: "5", label: "Al Dhannah Mall (ex: Ruwais Mall), Al Ruwais" },
  { value: "4", label: "World Trade Center Mall, Abu Dhabi" },
  { value: "3", label: "Abu Dhabi Mall, Abu Dhabi" },
  { value: "2", label: "Musaffah, Abu Dhabi" },
];
const generateTimeOptions = (startHour, endHour) => {
  const options = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({ value: time, label: time });
    }
  }
  return options;
};
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    background: "#fff",
    // borderColor: '#9e9e9e',
    minHeight: "30px",
    height: "45px",
    boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.25)",
  }),
};
const FindCarForm = (props) => {

  const {citiesArray} = props;
  const { t, i18n } = useTranslation();
  const language = useSelector((state) => state.language.language) || i18n.language || 'en';
  const {setSubscription} = useContext(AppContext)
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState({
    selectedPickupLocation : '',
    pickup_date : '',
    pickupTime : ''
  });

  const [from_address, setFrom_Address] = useState("");
  const [to_address, setTo_address] = useState("");
  const [radioValue_dropoff_location, setRadioValue_dropoff_location] = useState("same_dropoff_location");
  const [deliveryOption, setDeliveryOption] = useState('pickup_location');
  const [collectOption, setCollectOption] = useState('dropoff_location');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const GEOLOCATION_API_KEY = process.env.REACT_APP_GOOGLE_MAP_KEY;
const CENTER_LAT = "25.2048";
const CENTER_LONG = "55.2708";
const [showPopup, setShowPopup] = useState(false); 
const [showPopupDropoff, setShowPopupDropoff] = useState(false); 
  const [showMapPopup, setShowMapPopup] = useState(false); 
  const [showMapPopup_dropoff, setShowMapPopup_dropoff] = useState(false); 
const [inputValue, setInputValue] = useState('');
const [inputValue_dropoff, setInputValue_dropoff] = useState('');
const [location_type, set_location_type] = useState('');
const[pickupLocationArray, setPickupLocationArray] = useState([]);
const[ pickupOptions, setPickupOptions] = useState([]);
const[ selectedDeliveryCity, setSelectedDeliveryCity] = useState(null);
const[ selectedCollectCity, setSelectedCollectCity] = useState(null);
const [shifts, setShifts] = useState([]);
const [shifts_dropoff, setShifts_dropoff] = useState([ ]);
const[ selectedPickupLocation, setSelectedPickupLocation] = useState(null);
const handlePickupChange = (selectedOption)=>{
setSelectedPickupLocation(selectedOption);
setShowPopup(true);
}
const handleDeliverCityChange = (selectedOption)=>{
setSelectedDeliveryCity(selectedOption);
// setShowPopup(true);
}
const handleCollectCityChange = (selectedOption)=>{
setSelectedCollectCity(selectedOption);
// setShowPopup(true);
}


const [pickupTime, setPickupTime] = useState(null);
const [dropoffTime, setDropoffTime] = useState(null);

const handlePickupTimeChange = (time) => {
  setPickupTime(time);
};

const handleDropoffTimeChange = (time) => {
  setDropoffTime(time);
};
const[dropoffLocationArray, setDropoffLocationArray] = useState([]);
const[ dropOffOptions, setDropOffOptions] = useState([]);
const[ selectedDropoffLocation, setSelectedDropoffLocation] = useState(null);
const handleDropoffChange = (selectedOption)=>{
setSelectedDropoffLocation(selectedOption);
setShowPopupDropoff(true);
}

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
  const handleAddressChange = (value) => {
    setAddress(value);
    const encodedAddress = encodeURIComponent(value);

    
  };

  const [from_Coordinates, setFrom_Coordinates] = useState({
    from_lat: "",
    from_lon: "",
  });
  const [to_Coordinates, setTo_Coordinates] = useState({
    to_lat: "",
    to_lon: "",
  });

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY,
    libraries,
  });
  const [ageValue, setAgeValue] = useState("2");
  const [radioValue, setRadioValue] = useState("collect");
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("self_pickup");
  const radios = [
    { name: "Yes", value: "collect" },
    { name: "No", value: "self_return" },
  ];
  const radios_dropoff_location = [
    { name: "Yes", value: "different_dropoff_location" },
  { name: "No", value: "same_dropoff_location" },
  ];
  const ages = [
    { name: "18 - 21", value: "18 - 21" },
    { name: "21 - 35", value: "21 - 35" },
    { name: "70 +", value: "70 +" },
  ];
  
  // State for form validation
  const [formErrors, setFormErrors] = useState({
    from_address: "",
    to_address: "",
    delivery_location: "",
    pickup_datetime: "",
    dropoff_datetime: "",
  });

  //  29-12-23

const deliveryOptionChange = (value) => {
  setDeliveryOption(value);
};
const collectionOptionChange = (value) => {
  setCollectOption(value);
};

const getPickupLocation = () => {
  const url = configWeb.GET_PICKUP_LOCATION('pickup', language);
  simpleGetCall(url)
  .then((res)=>{
    if(!res?.error){
setPickupLocationArray(res);

  }})
  .catch((error)=>{
    console.error("Location failed:", error);
  })
  .finally(()=>{

  })
}
useEffect(()=>{
getPickupLocation();
getDropoffLocation();
},[])

useEffect(()=>{
  const options = pickupLocationArray?.map((location)=>({
    value : location.id,
    label : location.name,
    address : location.address,
    timing_detail: location.timing_detail
    }))
    
    setPickupOptions(options);
},[pickupLocationArray])


const getDropoffLocation = (pickupLocationId) => {
  const url = configWeb.GET_PICKUP_LOCATION('dropoff', language, pickupLocationId);
  simpleGetCall(url)
  .then((res)=>{
    if(!res?.error){
setDropoffLocationArray(res);

  }})
  .catch((error)=>{
    console.error("Location failed:", error);
  })
  .finally(()=>{

    

  })
}

useEffect(()=>{
  const options = dropoffLocationArray?.map((location)=>({
    value : location.id,
    label : location.name,
    address : location.address,
    timing_detail: location.timing_detail
    }))
    
    setDropOffOptions(options);
},[dropoffLocationArray])

// Re-fetch dropoff locations when pickup location changes (to filter virtual locations)
useEffect(()=>{
  if(selectedPickupLocation?.value){
    getDropoffLocation(selectedPickupLocation.value);
  }
},[selectedPickupLocation])

  useEffect(() => {
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      pickup_type: currentTab,
      

    }));
  }, [currentTab]);

  // Get saved data from Redux
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );

  const [formData, setFormData] = useState({
    pickup_location_id: requestBody_pickup?.pickup_location_id || null, // Done
    booking_type: requestBody_pickup?.booking_type || "daily", //Done
    pickup_type: requestBody_pickup?.pickup_type || "", //Done
    month_time: requestBody_pickup?.month_time || "", //Done
    pickup_location_name: requestBody_pickup?.pickup_location_name || "", //Done
    pickup_city_id: requestBody_pickup?.pickup_city_id || "",
    pickup_date: requestBody_pickup?.pickup_date || "",  //Done
    pickup_time: requestBody_pickup?.pickup_time || "8:00", // Done not geting
    dropoff_location_id: requestBody_dropoff?.dropoff_location_id || null, //Done
    dropoff_type: requestBody_dropoff?.dropoff_type || "collect",  //Done
    dropoff_location_name: requestBody_dropoff?.dropoff_location_name || "", //Done
    dropoff_city_id: requestBody_dropoff?.dropoff_city_id || 3,
    dropoff_date: requestBody_dropoff?.dropoff_date || "", //Done
    dropoff_time: requestBody_dropoff?.dropoff_time || "18:00", // Done not geting
    coupon_code: requestBody_dropoff?.discount_coupon || "", //Done
    agetermsaccepte: requestBody_pickup?.agetermsaccepte || 0,
    user_age: requestBody_pickup?.user_age || "",
  });

  const [isChecked, setIsChecked] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(null);
  const [dayOfWeek_dropoff, setDayOfWeek_dropoff] = useState(null);

  const handleChangeChecked = () => {
    setIsChecked(!isChecked);

  };
  
  const handleChange = (key, value) => {
    if (key === "dropoff_type_t") {
      setRadioValue_dropoff_location(value);
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
  };
  // const handlePickupChange = (selectedOption) => {
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     pickup_location_id: selectedOption.value,
  //     pickup_location_name: selectedOption.label,
  //     pickup_city_id:selectedOption.id
  //     // ... you can update other form fields based on the selected option
  //   }));
  //   setShowPopup(true);
  // };
  const handleClosePopup = () => {
    // Close the popup
    setShowPopup(false);
    setShowPopupDropoff(false);
  };
  const handleShowMap =()=>{
    setShowMapPopup(true);
  }
  const handleShowMap_dropoff =()=>{
    setShowMapPopup_dropoff(true);
  }
  const handleCloseMapPopup =()=>{
    setShowMapPopup(false);
  }
  const handleCloseMapPopup_dropoff =()=>{
    setShowMapPopup_dropoff(false);
  }
  const handleDropupChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      dropoff_location_id: selectedOption.value,
      dropoff_location_name: selectedOption.label,
      // ... you can update other form fields based on the selected option
    }));
    setShowPopup(true);

  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return /* date.getDay() === 0 ? 7 : */ date.getDay(); // Adjusting Sunday (0) to 7
  };
  const handleDateChange = (event) => {
    const { value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      pickup_date: value,
      // ... you can update other form fields based on the datetime value
      
    }));
    
  };
  useEffect(()=>{
    if(formData?.pickup_date){
    const dayOfWeek = getDayOfWeek(formData?.pickup_date);
    setDayOfWeek(dayOfWeek)
    }
  }, [formData?.pickup_date])
  useEffect(()=>{
    if(formData.dropoff_date){
    const dayOfWeek = getDayOfWeek(formData.dropoff_date);
    setDayOfWeek_dropoff(dayOfWeek)
    }
  }, [formData.dropoff_date])
  
  useEffect(()=>{
  
  const getPickupLocationHours = () => {
    const url = configWeb.GET_PICKUP_LOCATION_HOURS( deliveryOption === "deliver_to_me" ? selectedDeliveryCity?.value : selectedPickupLocation?.value , Number(dayOfWeek) + 1 );
 
    simpleGetCall(url)
    .then((res)=>{
      if(!res?.error){
  setShifts(res);
  
    }})
    .catch((error)=>{
      console.error("Location failed:", error);
    })
    .finally(()=>{
  
    })
  } 

  
    if(formData?.pickup_date && (selectedPickupLocation || selectedDeliveryCity) ){
    getPickupLocationHours();
    }
  }, [dayOfWeek, selectedPickupLocation , selectedDeliveryCity])

  useEffect(()=>{
  const getDropoffLocationHours = () => {
    const url = configWeb.GET_PICKUP_LOCATION_HOURS( deliveryOption === 'deliver_to_me' ? selectedCollectCity.value : ( selectedDropoffLocation ?  selectedDropoffLocation?.value : selectedPickupLocation?.value) ,  Number(dayOfWeek_dropoff)+1);
    simpleGetCall(url)
    .then((res)=>{
      if(!res?.error){
  setShifts_dropoff(res);
  
    }})
    .catch((error)=>{
      console.error("Location failed:", error);
    })
    .finally(()=>{
  
    })
  }

  
    if( formData.dropoff_date){
    getDropoffLocationHours();
    }
  }, [dayOfWeek_dropoff, selectedDropoffLocation, selectedCollectCity])

  // const handleTimeChange = (event) => {
  //   const { value } = event.target;
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     pickup_time: value,
  //     // ... you can update other form fields based on the datetime value
  //   }));
  // };
  const handleDropDateChange = (event) => {
    const { value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      dropoff_date: value,
      // ... you can update other form fields based on the datetime value
    }));
  };
  const handleDropTimeChange = (event) => {
    const { value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      dropoff_time: value,
      // ... you can update other form fields based on the datetime value
    }));
  };
  const getDate = () => {
    return formData.pickup_date.slice(0, 10);
  };

  const getTime = () => {
    return formData.pickup_date.slice(11, 16);
  };

  const pickFuncation = () => {
    const formDataObject = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObject.append(key, value);
    });
    multipartPostCall(configWeb.FIN_MY_CAR, formDataObject)
      .then((res) => {
        if (res.result) {
        } else {
        }
      })
      .catch((err) => console.log(err));
  };

  const validateForm = () => {
   
    let errors = {};
    let formIsValid = true;

    // Validate pick-up location
  if (!selectedPickupLocation) {
    formIsValid = false;
    errors.selectedPickupLocation = "Pick-up location is required";
  }

  // Validate pick-up time
  if (!pickupTime) {
    formIsValid = false;
    errors.pickupTime = "Pick-up time is required";
  }

  // Validate pick-up date
  if (!formData?.pickup_date) {
    formIsValid = false;
    errors.pickup_date = "Pick-up date is required";
  }

  // Set all errors at once
  setError(errors);
   

    // Validate drop-off location
    if (!to_address) {
      formIsValid = false;
      errors.to_address = "Drop-off location is required";
    }

    // Validate delivery location if required
    if (radioValue === "2" && !from_address) {
      formIsValid = false;
      errors.delivery_location = "Delivery location is required";
    }

    // Validate pick-up date/time
    if (!formIsValid || !isValidDateTime(from_address)) {
      formIsValid = false;
      errors.pickup_datetime = "Pick-up date and time are required";
    }

    // Validate drop-off date/time
    if (!formIsValid || !isValidDateTime(to_address)) {
      formIsValid = false;
      errors.dropoff_datetime = "Drop-off date and time are required";
    }

   // Set all errors at once
   setError(errors);
    return formIsValid;
  };

  const isValidDateTime = (datetime) => {
    // Add custom validation logic for date and time if needed
    return !!datetime;
  };

  const fromHandleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const from_ll = await getLatLng(results[0]);
    setFrom_Address(value);
    setFrom_Coordinates({ ...from_ll });
  };

  const toHandleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const from_ll = await getLatLng(results[0]);
    setTo_address(value);
    setTo_Coordinates({ ...from_ll });
  };

  const handleTabSelect = (key) => {
    if (key === "link-0") {
   
      setFormData((prevFormData) => ({
        ...prevFormData,
        booking_type: "daily",
        agetermsaccepte:0
      })); 
      setSubscription("daily")// Daily Rentals
    } else if (key === "link-1") {

      setFormData((prevFormData) => ({
        ...prevFormData,
        booking_type: "monthly",
        agetermsaccepte:1
      })); 
      setSubscription("monthly")
      // Monthly Subscription
    }
  };

  const handleSubmit = (e) => {
    const form = e.currentTarget;
    setValidated(true)
    validateForm();
    e.preventDefault();
    
    if (form.checkValidity() === false ) {
      e.stopPropagation();
      setValidated(true);
    } else {}
validatePickupLocation();
validateDropoff();

  };

  const validatePickupLocation = ()=> {

    const body_pickup = JSON.stringify({
      pickup_type : "self",
      pickup_location_id: selectedPickupLocation?.value,
     booking_type: 'daily',

      pickup_date: formData?.pickup_date,
        pickup_time: pickupTime?.value
    })

    const body_deliver = JSON.stringify({
      pickup_type: "delivery",
  
  pickup_city_id: selectedDeliveryCity?.value,
  pickup_coordinates:`${markerPosition?.lat},${markerPosition?.lng}`    ,
  booking_type: "daily",
  
  pickup_date: formData?.pickup_date,
  pickup_time: pickupTime?.value
    })
  
    simplePostCall(configWeb.POST_VLIDATE_PICKUP_LOCATION, deliveryOption === 'deliver_to_me' ? body_deliver : body_pickup)
    .then((res)=>{
      if(res?.status === 'success'){
         notifySuccess(res?.message)
      }
      if(res?.error){
        // if(Array.isArray(res?.message)){
        //   notifyError(res?.message[0]);
        // } else{
        // notifyError(res?.message);
        // }
        if(Array.isArray(res?.message)){
          notifyError(res?.message[0]);
        } else{
        notifyError(res?.message);
        }
      }

    })
    .catch((error)=>{
      console.log('validate pickuplocation api failed-->', error)
      notifyError('Something went wwrong, please try again letter')

    }) 
  .finally(()=>{
   
  }) 

  }

useEffect(()=>{
  if((selectedPickupLocation ||selectedDeliveryCity) && formData?.pickup_date && pickupTime){
    validatePickupLocation();
  }
},[selectedPickupLocation ,selectedDeliveryCity, formData?.pickup_date , pickupTime])

const validateDropoff = ()=> {

  const body_pickup= JSON.stringify({
    booking_type: "daily",
  dropoff_type: "self",
  dropoff_location_id: selectedDropoffLocation ? selectedDropoffLocation?.value : selectedPickupLocation?.value ,
  dropoff_date: formData?.dropoff_date,
  dropoff_time: dropoffTime?.value,
  pickup_date: formData?.pickup_date,
  pickup_time: pickupTime?.value
  })

  const body_deliver = JSON.stringify({
    booking_type: "daily",
    dropoff_type: "collection",

    dropoff_city_id: selectedCollectCity?.value,
    dropoff_coordinates:`${markerPositionDropoff?.lat},${markerPositionDropoff?.lng}`    ,
    dropoff_date : formData?.dropoff_date,
    dropoff_time : formData?.dropoff_time,
    pickup_date: formData?.pickup_date,
pickup_time: pickupTime?.value
  })

  simplePostCall(configWeb.POST_VLIDATE_DROPOFF, deliveryOption === 'deliver_to_me' ? body_deliver : body_pickup)
  .then((res)=>{
    if(res?.status === 'success'){
       notifySuccess(res?.message)
    }
    if(res?.error){
      // if (Array.isArray(res?.message)) {
      //   res.message.forEach((msg) => notifyError(msg));
      // } else {
      //   notifyError(res?.message);
      // }
      if(Array.isArray(res?.message)){
        notifyError(res?.message[0]);
      } else{
      notifyError(res?.message);
      }
      
    }

  })
  .catch((error)=>{
    console.log('validate pickuplocation api failed-->', error)
    notifyError('Something went wwrong, please try again letter')

  }) 
.finally(()=>{
 
}) 

}

useEffect(()=>{
  if((selectedCollectCity || selectedPickupLocation ) && formData?.pickup_date && pickupTime  && formData?.dropoff_date && dropoffTime){
    validateDropoff();
  }
},[selectedPickupLocation , formData?.pickup_date , pickupTime, selectedDropoffLocation , formData?.dropoff_date , dropoffTime] )


const validateCoupon = ()=> {

  const body= JSON.stringify({
    discount_coupon: formData?.coupon_code,
    pickup_date: formData?.pickup_date,
    booking_type: "daily"
  })

 

  simplePostCall(configWeb.POST_VLIDATE_COUPON, body)
  .then((res)=>{
    if(res?.status === 'success'){
       notifySuccess(res?.message)
    }
    if(res?.error){
      if(Array.isArray(res?.message)){
        notifyError(res?.message[0]);
      } else{
      notifyError(res?.message);
      }
    }

  })
  .catch((error)=>{
    console.log('validate pickuplocation api failed-->', error)
    notifyError('Something went wwrong, please try again letter')

  }) 
.finally(()=>{
 
}) 

}

useEffect(()=>{
  if(formData?.coupon_code && formData?.pickup_date ){
    validateCoupon();
  }
},[formData?.coupon_code , formData?.pickup_date] )


  ////////////////////////////// 3-1-24
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  useEffect(() => {
    if (address) {

      const geocodeAddress = async () => {
        const add = "1600 Amphitheatre Parkway, Mountain View, CA"
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address
            )}&key=${GEOLOCATION_API_KEY}`
          );
// 
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            setCenter(location);
            setMarkerPosition(location);
            setInputValue(data.results[0].formatted_address); // Set the initial input value to the formatted address
          } else {
            console.error('No results found for the provided address.');
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
        }
      };

      geocodeAddress();
    }
  }, [address]);
  const handleInput = (e) => {
    setValue(e.target.value);
    setInputValue(e.target.value);
  };
  const handleAddressSelect = async (address) => {
    setValue(address,false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      setInputValue(results[0].formatted_address); // Update the input value to the selected address
    } catch (error) {
      console.log('Error: ', error);
    }
  };
  const handleMarkerDragEnd = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setCenter({ lat, lng });
     // Reverse geocode to get the address of the new position
     try {
      const results = await getGeocode({ location: { lat, lng } });
      setInputValue(results[0].formatted_address); // Update the input value to the new address
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li key={place_id} onClick={() => handleAddressSelect(suggestion.description)}>
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

   // States and handlers for Dropoff Address
   const [addressDropoff, setAddressDropoff] = useState('');
   const [showMapPopupDropoff, setShowMapPopupDropoff] = useState(false);
   const [centerDropoff, setCenterDropoff] = useState(defaultCenter);
   const [markerPositionDropoff, setMarkerPositionDropoff] = useState(defaultCenter);
   const [inputValueDropoff, setInputValueDropoff] = useState('');
 
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
 
   const handleShowMapDropoff = () => {
     setShowMapPopupDropoff(true);
   };
 
   const handleCloseMapPopupDropoff = () => {
     setShowMapPopupDropoff(false);
   };
 
   useEffect(() => {
     if (addressDropoff) {
       console.log('Geocoding dropoff address:', addressDropoff);
 
       const geocodeAddress = async () => {
         try {
           const response = await fetch(
             `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
               addressDropoff
             )}&key=${GEOLOCATION_API_KEY}`
           );
           const data = await response.json();
           if (data.results && data.results.length > 0) {
             const location = data.results[0].geometry.location;
             setCenterDropoff(location);
             setMarkerPositionDropoff(location);
             setInputValueDropoff(data.results[0].formatted_address);
           } else {
             console.error('No results found for the provided address.');
           }
         } catch (error) {
           console.error('Error geocoding address:', error);
         }
       };
 
       geocodeAddress();
     }
   }, [addressDropoff]);
 
   const handleInputDropoff = (e) => {
     setValueDropoff(e.target.value);
     setInputValueDropoff(e.target.value);
   };
 
   const handleAddressSelectDropoff = async (address) => {
     setValueDropoff(address, false);
     clearSuggestionsDropoff();
 
     try {
       const results = await getGeocode({ address });
       const { lat, lng } = await getLatLng(results[0]);
       setCenterDropoff({ lat, lng });
       setMarkerPositionDropoff({ lat, lng });
       setInputValueDropoff(results[0].formatted_address);
     } catch (error) {
       console.log('Error:', error);
     }
   };
 
   const handleMarkerDragEndDropoff = async (event) => {
     const lat = event.latLng.lat();
     const lng = event.latLng.lng();
     setMarkerPositionDropoff({ lat, lng });
     setCenterDropoff({ lat, lng });
 
     try {
       const results = await getGeocode({ location: { lat, lng } });
       setInputValueDropoff(results[0].formatted_address);
     } catch (error) {
       console.log('Error:', error);
     }
   };
 
   const renderSuggestionsDropoff = () =>
     dataDropoff.map((suggestion) => {
       const {
         place_id,
         structured_formatting: { main_text, secondary_text },
       } = suggestion;
 
       return (
         <li key={place_id} onClick={() => handleAddressSelectDropoff(suggestion.description)}>
           <strong>{main_text}</strong> <small>{secondary_text}</small>
         </li>
       );
     });



  

  
  return (
    <div className="p-1">
      <Nav
        className="subscription__tabs"
        variant="pills"
        defaultActiveKey="link-0"
        onSelect={handleTabSelect}
      >
        <Nav.Item>
          <Nav.Link className="subscription__tab" eventKey="link-0">
          {t("Daily Rentals")}  
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className="subscription__tab" eventKey="link-1">
         {t("Monthly Subscription")}   
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <div className="form">
        {/* <Tabs
          defaultActiveKey="self_pickup"
          transition={false}
          id="noanim-tab-example"
          className="mb-1 justify-content-end border-0 tab-resposives"
          onSelect={(selectedKey) => setCurrentTab(`${selectedKey}`)}
        > */}
        
          {/* <Tab eventKey="self_pickup" title={t("Self Pick Up")} > */}
            <Form onSubmit={handleSubmit} /* validated={validated} */>
            <Row className=" sm-6 ">
            <Col lg={12} md={12} sm={12} className="d-flex justify-content-end ">
            <div className="checkbox-wrapper-35">
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
    </div>
            
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
              <Row className=" sm-6 ">
           
                  <>
                  
                    <Col style={{paddingBottom : '0px'}}
                      // lg={radioValue === "self_return" ? 4 : 3}
                      lg={formData.booking_type ==='monthly' ? 3 : 3}
                      md={formData.booking_type ==='monthly' ? 3 : 3}
                    
                      sm={12}
                    >

{deliveryOption === 'pickup_location' ? <>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name">
                       Pick-up Location
                        </Form.Label>
                        <Select
                       
                          value={selectedPickupLocation}
                          onChange={handlePickupChange}
                          styles={customStyles}
                          options={pickupOptions}
                          placeholder={t("Select...")}
                        />
                           
                      </Form.Group> {!selectedPickupLocation && <span className="text-danger">{error?.selectedPickupLocation} </span> }  {console.log("error-->", error)}
                   
                 
                      </> : <>  
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name">
                      Select Delivery City
                        </Form.Label>
                        <Select
                        
                        //  required
                         value={selectedDeliveryCity}
                         onChange={handleDeliverCityChange}
                          styles={customStyles}
                          options={citiesArray.map(city => ({
                            value: city.id,
                            label: city.name,
                          }))}
                          placeholder={t("Select...")}
                        />
                      </Form.Group> 

                     
                       </> }
                     
                   
           <div className="mt-1 mb-2">
            Deliver to me? 
            <div className="form-check form-check-inline ms-1">
  <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="deliver_to_me" checked={deliveryOption === 'deliver_to_me'} onChange={(e) => deliveryOptionChange(e.target.value)}  />
  <label className="form-check-label" for="inlineCheckbox1">Yes</label>
</div>
<div className="form-check form-check-inline">
  <input className="form-check-input" type="checkbox" id="inlineCheckbox2" value="pickup_location" checked={deliveryOption === 'pickup_location'} onChange={(e) => deliveryOptionChange(e.target.value)}/>
  <label className="form-check-label" for="inlineCheckbox2">No</label>
</div>
</div>

          
<ChooseDeliverToMePopup />
                    </Col>
                    
                  </>
            
                  {deliveryOption === 'deliver_to_me' && 
                  //  <Col lg={3} md={3} sm={12} style={{paddingBottom : '0px'}}>
                   <Col  lg={formData.booking_type ==='monthly' ? 3 : 3}
                   md={formData.booking_type ==='monthly' ? 3 : 3}
                   sm={12} style={{paddingBottom : '0px'}}>
                     
                  {/* <Form.Group controlId="formGridAddress1" className="">
        <Form.Label>Pickup Address</Form.Label>
        <Form.Control
          placeholder={t("Enter pickup address")}
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
        />
      </Form.Group> */}
      <div className="d-flex justify-content-center align-items-center mt-4 pt-2  w-100">
       <button className="contact__btn  w-100" style={{backgroundColor:'#4078AB', height:'2.79rem'}} type="button" onClick={handleShowMap}>
                Pickup Address
                </button>
                </div>
      {/* {mapUrl && (
        <div className="mt-3 bg-primary-">
          <iframe
            title="Google Map"
            width="100%"
            height="200"
            frameBorder="0"
            style={{ border: 0 }}
            src={mapUrl}
            allowFullScreen
          ></iframe>
        </div> )} */}
    {address &&     <div>
      <GoogleMap 
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
     
      >
        
        {/* <Marker position={markerPosition} /> */}
      
      </GoogleMap>
    </div> }
                      </Col> }
                      {console.log('markerPosition-->',markerPosition)}
                 
               
                {radioValue === "self_return" ? (
                  <></>
                ) : (
                  <>
                    {/* <Col
                      lg={radioValue === "self_return" ? 4 : 3}
                      md={3}
                      sm={12}
                    >
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name">
                       {t("Drop-off Location")}   
                        </Form.Label>
                        <Select
                          className="find-my-car-select"
                         
                          value={Pickup.find(
                            (option) =>
                              option.value === formData.dropoff_location_id
                          )}
                          onChange={handleDropupChange}
                          options={Dropup}
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          placeholder={t("Select...")}
                        />
                      </Form.Group>
                    </Col> */}
                  </>
                )}
                {/* <Col lg={radioValue === "self_return" ? 4 : 3} md={3} sm={12} style={{paddingBottom : '0px'}}> */}
                <Col 
                  lg={formData.booking_type ==='monthly' ? (deliveryOption === 'pickup_location' ? 3 : 2) : 3}
                  md={formData.booking_type ==='monthly' ? (deliveryOption === 'pickup_location' ? 3 : 2) : 3}
                  sm={12}
                 style={{paddingBottom : '0px'}}>
                  <Form.Group controlId="formGridAddress1">
                    <Form.Label className="label-name">{t("Pick-up Date")} </Form.Label>
                    <Form.Control
                      type="date"
                      // required
                      value={formData.pickup_date}
                      onChange={handleDateChange}
                    />
                  </Form.Group> <span className="text-danger">{error?.pickup_date} </span>
               
                </Col>
                {/* <Col lg={3} md={3} sm={12} style={{paddingBottom : '0px'}}> */}
                <Col   lg={formData.booking_type ==='monthly' ? (deliveryOption === 'pickup_location' ? 3 : 2) : 3}
                  md={formData.booking_type ==='monthly' ? (deliveryOption === 'pickup_location' ? 3 : 2) : 3}
                  sm={12} style={{paddingBottom : '0px'}}>
                <Form.Group controlId="formGridAddress1">
                    <Form.Label className="label-name">{t("Pick-up Time")} </Form.Label>
                    {/* <Form.Control
                      type="time"
                      value={formData.pickup_time}
                      onChange={handleTimeChange}
                    /> */}
                     <TimePicker shifts={shifts} onTimeChange={handlePickupTimeChange} />
                     {/* <Select
      // options={timeOptions}
      options={generateTimeOptions(8, 20)}
      placeholder="Select a time"
    /> */}
                  </Form.Group>
                   {!pickupTime && <span className="text-danger mt-1">{error?.pickupTime}</span>} 
                  </Col>
                {formData.booking_type === "monthly" && (
                  <Col  lg={formData.booking_type ==='monthly' ? (deliveryOption === 'pickup_location' ? 3 : 2) : 3}
                  md={formData.booking_type ==='monthly' ? (deliveryOption === 'pickup_location' ? 3 : 2) : 3}
                  sm={12} style={{paddingBottom : '0px'}}>
                    <Form.Group controlId="formGridAddress1">
                      <Form.Label className="label-name">{t("Duration")} </Form.Label>
                      <Form.Control
                        placeholder= {t("Duration")}
                        value={formData.month_time}
                        onChange={(e) =>
                          handleChange("month_time", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                )}


                

{/* <Col
                      lg={radioValue === "self_return" ? 4 : 3}
                      md={3}
                      sm={12}
                    >
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label className="label-name">
                       {t("Drop-off Location")}   
                        </Form.Label>
                        <Select
                          className="find-my-car-select"
                         
                          value={Pickup.find(
                            (option) =>
                              option.value === formData.dropoff_location_id
                          )}
                          onChange={handleDropupChange}
                          options={Dropup}
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          placeholder={t("Select...")}
                        />
                      </Form.Group>
                    </Col> */}
                    </Row>

                    <Row className="mb-4 sm-6 ">
                {isChecked && ( <>
                <Col className="mt-3" style={{paddingBottom : '0px'}}
                  lg={
                  /*   radioValue === "self_return"
                      ? formData === "monthly"
                        ? 3
                        : 4
                      : 3 */ 3
                  }
                  md={3}
                  sm={12}
                >

{ collectOption === 'dropoff_location' ? <>
<Form.Group controlId="formBasicEmail">

                        <Form.Label className="label-name">
                      Drop-off Location 
                        </Form.Label>
                        <Select
                          className="find-my-car-select"
                         
                          value={selectedDropoffLocation}
                          onChange={handleDropoffChange}
                          options={dropOffOptions}
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          placeholder={t("Select...")}
                        />
                      </Form.Group> 
                      </>: <>
                      
                      <Form.Group controlId="formBasicEmail">

                        <Form.Label className="label-name">
                      Select Collect City
                        </Form.Label>
                        <Select
                          className="find-my-car-select"
                        //  required
                          value={selectedCollectCity}
                          onChange={handleCollectCityChange}
                          options={citiesArray.map(city => ({
                            value: city.id,
                            label: city.name,
                          }))}
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          placeholder={t("Select...")}
                        />
                      </Form.Group>
                      </> }
<div className="mt-1">
                      Collect from me? 
            <div className="form-check form-check-inline ms-1">
  <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="collect_from_me" checked={collectOption === 'collect_from_me'} onChange={(e) => collectionOptionChange(e.target.value)} />
  <label className="form-check-label" for="inlineCheckbox1">Yes</label>
</div>
<div className="form-check form-check-inline">
  <input className="form-check-input" type="checkbox" id="inlineCheckbox2" value="dropoff_location" checked={collectOption === 'dropoff_location'} onChange={(e) => collectionOptionChange(e.target.value)} />
  <label className="form-check-label" for="inlineCheckbox2">No</label>
</div>
</div>
                  
                 
                </Col>
                
                {collectOption === 'collect_from_me' &&  <Col lg={3} md={3} sm={12}  style={{paddingBottom : '0px'}}>
                {/* <Form.Group controlId="formGridAddress1" className="mt-3">
        <Form.Label>Drop Off Address</Form.Label>
        <Form.Control
          placeholder={t("Enter drop off address")}
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
        />
      </Form.Group> */}
        <div className="d-flex justify-content-center align-items-center align-self-center mt-3  w-100">
       <button className="contact__btn  w-100" style={{backgroundColor:'#4078AB', height:'2.79rem', marginTop:'2rem'}} type="button" onClick={handleShowMapDropoff}>
                  Drop Off Address
                </button>
                </div>
    
         </Col> }
           
                
                </>  )}
 




                <Col className="mt-3" style={{paddingBottom : '0px'}}
                  lg={3 }
                  md={3}
                  sm={12}
                >
<Form.Group controlId="formGridAddress1">
                    <Form.Label className="label-name">Drop-off Date</Form.Label>
                    <Form.Control
                      // type="datetime-local"
                      // required
                      type="date"
                      value={formData.dropoff_date}
                      onChange={handleDropDateChange}
                    />
                  </Form.Group> 
                  </Col>
                <Col className="mt-3" style={{paddingBottom : '0px'}}
                  lg={3 }
                  md={3}
                  sm={12}
                >
                <Form.Group controlId="formGridAddress1 ">
                    <Form.Label className="label-name">{t("Drop-off Time")} </Form.Label>
                    {/* <Form.Control
                      type="time"
                      value={formData.dropoff_time}
                      onChange={handleDropTimeChange}
                    /> */}
                     <TimePicker shifts={shifts_dropoff} onTimeChange={handleDropoffTimeChange} />
                  </Form.Group>
                 
                  
                  </Col>
                
              </Row>

              <Row>
                {/* <Col lg={3} md={3} sm={12}>
                  <Form.Group className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="label-name">{t("Different Drop-off Location?")} </Form.Label>
                    <ButtonGroup className="ms-1">
                      {radios.map((radio, idx) => (
                        <ToggleButton
                          key={idx}
                          id={`radio-${idx}`}
                          type="radio"
                          // variant={
                          //   idx % 2 ? "outline-success" : "outline-danger"
                          // }
                          className="d-flex align-items-center justify-content-center"
                          style={{ height: "40px", width: "50px" }}
                          name="radio"
                          value={radio.value}
                          checked={radioValue === radio.value}
                          // onChange={(e) => setRadioValue(e.currentTarget.value)}
                          onChange={(e) =>
                            handleChange("dropoff_type", e.currentTarget.value)
                          }
                        >
                          {radio.name}
                        </ToggleButton>
                      ))}
                    </ButtonGroup>
                  </Form.Group>
                </Col> */}
                <Col lg={3} md={3} sm={12} style={{paddingBottom : '0px'}}>
                  <Form.Group className="d-flex justify-content-between align-items-center">
                    <Form.Label className="label-name">{t("Age")} </Form.Label>
                    <ButtonGroup className="ms-1">
                      {ages.map((age, idx) => (
                        <ToggleButton
                          key={idx}
                          id={`age-${idx}`}
                          type="radio"
                          // variant={
                          //   idx % 2 ? "outline-success" : "outline-danger"
                          // }
                          className="d-flex align-items-center justify-content-center"
                          style={{ height: "45px", width: "70px" }}
                          name="age"
                          value={age.value}
                          checked={ageValue === age.value}
                          onChange={(e) => setAgeValue(e.currentTarget.value)}
                        >
                          {age.name}
                        </ToggleButton>
                      ))}
                    </ButtonGroup>
                  </Form.Group>
                </Col>

                <Col lg={3} md={3} sm={12} style={{paddingBottom : '0px'}}>
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
                <Col className="" style={{paddingBottom : '0px'}}>
                  <div className="find-my-card-btn">
                    <Button type="submit" className="findBtn">
                    {t("Find My Car")}  
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          {/* </Tab> */}
      
      
      
      
        {/* </Tabs> */}
        <Modal show={showPopup} onHide={handleClosePopup}>
        <Modal.Header closeButton>
          <Modal.Title>Location Information</Modal.Title>
        </Modal.Header>
        <Modal.Body  >
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
        <Modal.Body  >
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

      <Modal show={showMapPopup} onHide={handleCloseMapPopup} 
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
    </Modal>
        {/* Dropoff Address Modal */}
        <Modal
        show={showMapPopupDropoff}
        onHide={handleCloseMapPopupDropoff}
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCloseMapPopupDropoff}>OK</Button>
        </Modal.Footer>
      </Modal>
      </div>
    </div>
  );
};

export default FindCarForm;
