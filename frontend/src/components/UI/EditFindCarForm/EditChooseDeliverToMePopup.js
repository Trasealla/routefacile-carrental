import React, { useState, useEffect, useContext } from "react";
import "../ChooseDeliverToMePopup.css"; // Import the CSS file
import Select from "react-select";
import { AppContext } from "../../../context/AppContext";
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
  Modal,
  FormControl,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { placesLibraryLoaded } from "../../../utils/placesReady";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  MarkerF,
} from "@react-google-maps/api";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedDeliveryCity } from "../../../reducers/Slices/selectedDeliveryCitySlice";
import { setErrorAddressDelivery } from "../../../reducers/Slices/errorAddressDelivery";
import { setInputValue } from "../../../reducers/Slices/inputValueSlice"; //importing action
import { setPickupCity } from "../../../reducers/Slices/pickupCitySlice";
import { setIsValidAddressDelivery } from "../../../reducers/Slices/isValidAddressDeliverySlice.js";
import {
  extractCity,
  filterCityArrayByLabel,
  UAE_BOUNDS,
} from "../../../SharedComponent/reusableFunctions";
// Sample data for city dropdown, to be replaced with actual data
const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
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
const defaultCenter = {
  lat: 25.2048, // default latitude
  lng: 55.2708, // default longitude
};
const mapContainerStyle = {
  /*  width: '30rem',
     height: '30rem' */
  height: "400px",
  width: "100%",
};

const EditChooseDeliverToMePopup = (props) => {
  const {
    /* citiesArray, */ handleCloseButton,
    handleDeliveryAddressChange,
    handleSelectAddressDelivery,
    handleDeliverCityChange_psuedo,
    onMarkerPositionChange,
    cityError,
    setFirstRender,
  } = props;
  const {setClickonMapAddressSelectionFlag} = useContext(AppContext)
  const citiesArray = useSelector(
    (state) => state.citiesArray.citiesArray
  );
  const dispatch = useDispatch();
  const inputValue = useSelector((state) => state.inputValue.inputValue);
  const requestBody_pickup = useSelector(
    (state) => state.requestBody_pickup.requestBody_pickup
  );
  const selectedDeliveryCity = useSelector(
    (state) => state.selectedDeliveryCity.selectedDeliveryCity
  );
  const isValidAddressDelivery = useSelector(
    (state) => state.isValidAddressDelivery.isValidAddressDelivery
  );
  const errorAddressDelivery = useSelector(
    (state) => state.errorAddressDelivery.errorAddressDelivery
  );
  const { t, i18n } = useTranslation();

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
      componentRestrictions: {
        country: "ma",
      },
    },
    searchOptions:{
      componentRestrictions: {
        country: ["ma"],
      },
    }
  });
  const GEOLOCATION_API_KEY = process.env.REACT_APP_GOOGLE_MAP_KEY;
  const [selectedCity, setSelectedCity] = useState("");
  const [address, setAddress] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [showMapPopup_dropoff, setShowMapPopup_dropoff] = useState(false);
  const [cityName, setCityName] = useState("");
  const [mapMarkerCenterFlag, setMapMarkerCenterFlag] = useState(false)

  // const[ selectedDeliveryCity, setSelectedDeliveryCity] = useState(null);
  // const [inputValue, setInputValue] = useState('');
  const handleDeliverCityChange = (selectedOption) => {
    dispatch(setSelectedDeliveryCity(selectedOption));
    dispatch(setPickupCity(selectedOption));
    setFirstRender(true);
     handleDeliverCityChange_psuedo(selectedOption);
    // setShowPopup(true);
  };
  useEffect(() => {
    if (requestBody_pickup?.pickup_city_id) {
      const city = citiesArray?.find(
        (city) => city?.id === requestBody_pickup?.pickup_city_id
      );
      const cityObj = { value: city?.id, label: city?.name };
      setSelectedDeliveryCity(cityObj);
      handleDeliverCityChange_psuedo(cityObj);
    }
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
  };
  const handleSubmit = (e) => {
    const form = e.currentTarget;

    e.preventDefault();
  };

  const handleShowMap = () => {
    setShowMapPopup(true);
  };
  const handleCloseMapPopup = () => {
    setShowMapPopup(false);
  };

  useEffect(() => {
    handleDeliveryAddressChange(inputValue);
  }, [inputValue]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const citiesCoordinates = {
    1: { lat: 25.2048, lng: 55.2708 }, // Dubai
    2: { lat: 24.4539, lng: 54.3773 }, // Abu Dhabi
    3: { lat: 25.3562, lng: 55.4272 }, // Sharjah
    4: { lat: 24.2232, lng: 55.7229 }, // Al Ain
    5: { lat: 24.0975, lng: 52.7347 }, //  Al ruwais
    6: { lat: 25.1221, lng: 56.3345 }, // Fujairah
    7: { lat: 25.8007, lng: 55.9762 }, // Ras Al Khaimah
  };
  useEffect(() => {
  
    const defaultCoordinates = citiesCoordinates[1];
    if(!mapMarkerCenterFlag){
      if(!inputValue){
      
    setMarkerPosition(
      citiesCoordinates[selectedDeliveryCity?.value] || defaultCoordinates
    );
      }
    setCenter(
      citiesCoordinates[selectedDeliveryCity?.value] || defaultCoordinates
    );
    }
    setMapMarkerCenterFlag(false);
  }, [selectedDeliveryCity?.value, inputValue]);

  useEffect(() => {
    if (
      Array.isArray(citiesArray) &&
      citiesArray.length > 0 &&
      cityName /* && selectedDeliveryCity?.label */ &&
      cityName !== selectedDeliveryCity?.label
    ) {
      let cityObj = filterCityArrayByLabel(citiesArray, cityName);

      dispatch(setSelectedDeliveryCity(cityObj));
      dispatch(setPickupCity(cityObj));
    }
  }, [cityName]);

  useEffect(() => {
    if (address) {
      const geocodeAddress = async () => {
        const add = "1600 Amphitheatre Parkway, Mountain View, CA";
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
            // setInputValue(data.results[0].formatted_address); // Set the initial input value to the formatted address
            dispatch(setInputValue(data.results[0].formatted_address)); //this is for redux
          } else {
            console.error("No results found for the provided address.");
          }
        } catch (error) {
          console.error("Error geocoding address:", error);
        }
      };

      geocodeAddress();
    }
  }, [address]);

  useEffect(() => {
    if (markerPosition) {
      onMarkerPositionChange(markerPosition); // Call the callback function
    }
  }, [markerPosition]);

  const handleInput = (e) => {
    setValue(e.target.value);
    // setInputValue(e.target.value); this is for contetx api
    dispatch(setInputValue(e.target.value)); //this is for redux
    dispatch(setIsValidAddressDelivery(false));
dispatch(setErrorAddressDelivery(""));
  };
  const handleAddressSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      setMapMarkerCenterFlag(true);
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      // setInputValue(results[0].formatted_address); // Update the input value to the selected address this is for context api
      dispatch(setInputValue(results[0].formatted_address)); //this is for redux
      const cityName = extractCity(results);
      setCityName(cityName);
      dispatch(setIsValidAddressDelivery(true));
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  const handleMarkerDragEnd = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setCenter({ lat, lng });
    // Reverse geocode to get the address of the new position
    try {
      setMapMarkerCenterFlag(true);
      const results = await getGeocode({ location: { lat, lng } });
      // setInputValue(results[0].formatted_address); // Update the input value to the new address
      dispatch(setInputValue(results[0].formatted_address)); // Update the input value to the new address
      const cityName = extractCity(results);
      setCityName(cityName);
      dispatch(setIsValidAddressDelivery(true));
    } catch (error) {
      console.log("Error: ", error);
    }
  };



  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={() => handleAddressSelect(suggestion.description)}
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });
    const handleSelectAddress = () => {
      
      setClickonMapAddressSelectionFlag(true);
      if (isValidAddressDelivery) {
        
        handleSelectAddressDelivery();
      }
  
      if (!isValidAddressDelivery) {
        dispatch(
          setErrorAddressDelivery(
            "Please select your address from suggestions or adjust the marker on the map."
          )
        );
        return;
      } else {
        dispatch(setErrorAddressDelivery(""));
  
       
      }
    };
  return (
    <div className="chooseDeliverToMePopup">
      <Form onSubmit={handleSubmit} /* validated={validated} */>
        <div className="row mt-4">
          <div className="col-sm-12 col-md-6">
            <Row className=" sm-6  ">
              <Col style={{ paddingBottom: "0px" }} lg={12} md={12} sm={12}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label className="label-name">
                    {t("Select Delivery City")}
                  </Form.Label>
                  <Select
                    //  required
                    value={selectedDeliveryCity}
                    onChange={handleDeliverCityChange}
                    styles={customStyles}
                    options={citiesArray.map((city) => ({
                      value: city.id,
                      label: city.name,
                    }))}
                    placeholder={t("Select...")}
                  />
                </Form.Group>
              </Col>
              <Col
                style={{ paddingBottom: "0px" }}
                lg={12}
                md={12}
                sm={12}
                className="my-2"
              >
                {/* <div className="d-flex justify-content-center align-items-center mt-4 pt-2  w-100">
       <button className="contact__btn  w-100" style={{backgroundColor:'#4078AB', height:'2.79rem'}} type="button" onClick={handleShowMap}>
                Pickup Address
                </button>
                </div> */}

                <Form.Label className="label-name ">
                  {t("Select Your Address")}
                </Form.Label>
                <FormControl
                  // value={value}
                  value={inputValue}
                  onChange={handleInput}
                  disabled={!ready}
                  placeholder={t("Search a location")}
                  className="mb-2"
                />
                {status === "OK" && (
                  <ul className="suggestions">{renderSuggestions()}</ul>
                )}
              </Col>

              <Col lg={6} md={6} sm={12}>
                <button
                  className="contact__btn w-100"
                  style={{ backgroundColor: "#4078AB", height: "2.5rem" }}
                  type="button"
                  onClick={handleCloseButton}
                >
                  {t("Close")}
                </button>
              </Col>
              <Col lg={6} md={6} sm={12}>
                <button
                  className="contact__btn  w-100"
                  style={{ backgroundColor: "#4078AB", height: "2.5rem" }}
                  type="button"
                  // onClick={handleSelectAddressDelivery}
                  onClick={handleSelectAddress}
                >
                  {t("Select Address")}
                </button>
              </Col>
              {!selectedDeliveryCity && (
                <span className="text-danger">{t(cityError)}</span>
              )}
            </Row>
            {errorAddressDelivery && (
              <div className="text-danger mt-1">{t(errorAddressDelivery)}</div>
            )}
          </div>

          <div className="col-md-6 col-sm-12">
            {/* <Col style={{paddingBottom : '0px'}} lg={12} md={12} sm={12} > */}
            <div className="w-100 h-100">
              {/* <FormControl
            // value={value}
            value={inputValue}
            onChange={handleInput}
            disabled={!ready}
            placeholder="Search a location"
            className="mb-2"
          /> */}
              {/* {status === 'OK' && <ul style={{cursor:'pointer'}}>{renderSuggestions()}</ul>} */}
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={13}
                center={center}
                options={{
                  restriction: {
                    latLngBounds: UAE_BOUNDS, 
                    strictBounds: true, // Prevent panning outside bounds
                 
                  },
                }}
              >
                <MarkerF
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={handleMarkerDragEnd}
                />
              </GoogleMap>
            </div>

            {/* <Col lg={6} md={6} sm={12}>
        <button className="contact__btn btn btn-sm w-20" style={{backgroundColor:'#4078AB', height:'2.5rem'}} type="button" >
               Back
                </button>
           
            </Col> */}
            {/* </Col> */}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default EditChooseDeliverToMePopup;
