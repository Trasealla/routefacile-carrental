import React, { useState, useEffect, useContext } from "react";
import "./ChooseDeliverToMePopup.css"; // Import the CSS file
import Select from "react-select";
import {AppContext} from "../../context/AppContext";
import {
  Col,
  Form,
  Row,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { placesLibraryLoaded } from "../../utils/placesReady";

import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useSelector, useDispatch } from "react-redux";

import { setInputValue } from "../../reducers/Slices/inputValueSlice"; //importing action
import { setIsValidAddressDelivery } from "../../reducers/Slices/isValidAddressDeliverySlice.js";
import { setSelectedDeliveryCity } from "../../reducers/Slices/selectedDeliveryCitySlice";
import { setErrorAddressDelivery } from "../../reducers/Slices/errorAddressDelivery";
import { setPickupCity } from "../../reducers/Slices/pickupCitySlice";
import { UAE_BOUNDS, extractCity, filterCityArrayByLabel } from "../../SharedComponent/reusableFunctions";

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

const mapContainerStyle = {
  /*  width: '30rem',
     height: '30rem' */
  height: "400px",
  width: "100%",
};
const libraries = ["places"];

const ChooseDeliverToMePopup = (props) => {
  const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsLoadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY,
    libraries,
  });

  const [googleMapsAuthFailed, setGoogleMapsAuthFailed] = useState(false);
  useEffect(() => {
    window.gm_authFailure = () => setGoogleMapsAuthFailed(true);
    return () => {
      if (window.gm_authFailure) {
        delete window.gm_authFailure;
      }
    };
  }, []);

  const hasMapKey = !!process.env.REACT_APP_GOOGLE_MAP_KEY;
  const canShowMap = isGoogleMapsLoaded && !googleMapsLoadError && !googleMapsAuthFailed;

  const {
    citiesArray,
    handleCloseButton,
    handleDeliveryAddressChange,
    handleSelectAddressDelivery,
    cityError,
    onMarkerPositionChange,
  } = props;
  const { t } = useTranslation();
  const {clickonMapAddressSelectionFlag,setClickonMapAddressSelectionFlag} = useContext(AppContext)
  const dispatch = useDispatch();
  const inputValue = useSelector((state) => state.inputValue.inputValue);
  const isValidAddressDelivery = useSelector(
    (state) => state.isValidAddressDelivery.isValidAddressDelivery
  );
  const errorAddressDelivery = useSelector(
    (state) => state.errorAddressDelivery.errorAddressDelivery
  );
  const selectedDeliveryCity = useSelector(
    (state) => state.selectedDeliveryCity.selectedDeliveryCity
  );
  // const pickupCity = useSelector(
  //   (state) => state.pickupCity.pickupCity
  // );
  const defaultCenter = {
    lat: 31.6295, // default latitude — Marrakech, the operating base
    lng: -7.9811, // default longitude — Marrakech
  };



  const {
    ready: ready,
    value: value,
    suggestions: { status: status, data: data },
    setValue: setValue,
    clearSuggestions: clearSuggestions,
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
  const [address, setAddress] = useState("");
  const handleDeliverCityChange = (selectedOption) => {
    dispatch(setSelectedDeliveryCity(selectedOption));
    dispatch(setPickupCity(selectedOption));
    
    // handleDeliverCityChange_psuedo(selectedOption);
    // setShowPopup(true);
  };

 
  const handleSubmit = (e) => {
    const form = e.currentTarget;

    e.preventDefault();
  };

 

  useEffect(() => {
    handleDeliveryAddressChange(inputValue);
  }, [inputValue]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [mapMarkerCenterFlag, setMapMarkerCenterFlag] = useState(false)
  // const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  
  const citiesCoordinates = {
    // Keyed to this platform's `cities` table. These were UAE coordinates left
    // over from the previous business, and the ids overlap — so city 1
    // ("Casablanca") centred the delivery map on Dubai and city 3
    // ("Marrakech") on Sharjah. A Moroccan customer was shown the Gulf.
    1: { lat: 33.5731, lng: -7.5898 },  // Casablanca
    2: { lat: 35.7595, lng: -5.8340 },  // Tangier
    3: { lat: 31.6295, lng: -7.9811 },  // Marrakech
    4: { lat: 30.4278, lng: -9.5981 },  // Agadir
    5: { lat: 34.0181, lng: -5.0078 },  // Fes
    6: { lat: 34.0209, lng: -6.8416 },  // Rabat
    7: { lat: 35.5785, lng: -5.3684 },  // Tetouan
      8: { lat: 30.9335, lng: -6.9370 },  // Ouarzazate
  };

  const [cityName, setCityName] = useState('');

useEffect(()=>{
 
  if(Array.isArray(citiesArray) && citiesArray.length >0 && cityName /* && selectedDeliveryCity?.label */ && cityName !== selectedDeliveryCity?.label){
    let cityObj = filterCityArrayByLabel(citiesArray, cityName);
   
    dispatch(setSelectedDeliveryCity(cityObj));
    dispatch(setPickupCity(cityObj));
  }

},[cityName])
 

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
      const cityName= extractCity(results);
      setCityName(cityName)
      dispatch(setInputValue(results[0].formatted_address)); //this is for redux
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
      dispatch(setInputValue(results[0].formatted_address)); // Update the input value to the new address
      dispatch(setIsValidAddressDelivery(true));
      const cityName = extractCity(results);
      setCityName(cityName)
      
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const renderSuggestions = () =>
    data?.map((suggestion) => {
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

  

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(
    (map) => {
      console.log("Map loaded:", map);

      // Example: Fit bounds to the default center
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);

      // Store the map instance if you need it for further operations
      setMap(map);
    },
    [center]
  );

  const onUnmount = React.useCallback(() => {
    console.log("Map is being unmounted.");
    setMap(null); // Clear the map instance when unmounted
  }, []);

  const handleSelectAddress = () => {

    setClickonMapAddressSelectionFlag(true);
    if (isValidAddressDelivery) {
      
      handleSelectAddressDelivery();
    }

    if (!isValidAddressDelivery) {
      dispatch(
        setErrorAddressDelivery(
          t("Please select your address from suggestions or adjust the marker on the map.")
        )
      );
      return;
    } else {
      dispatch(setErrorAddressDelivery(""));

      // handleSelectAddressDelivery();
    }
  };

  return (
    <div className={`chooseDeliverToMePopup${!canShowMap ? " no-map" : ""}`}>
      <Form onSubmit={handleSubmit} /* validated={validated} */>
        <div className="row mt-4">
          <div className="col-sm-12 col-md-6 form-column">
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
                <Form.Control
                  // value={value}
                  value={inputValue}
                  onChange={handleInput}
                  disabled={!ready}
                  placeholder={t("Search a location")}
                  className="mb-2"
                />
                {
                  /* status === "OK" && */ <ul className="suggestions">
                    {renderSuggestions()}
                  </ul>
                }
              </Col>

              {/* <Col lg={6} md={6} sm={12} > mycode */}
              <Col lg={6} md={6} sm={6} xs={6}>
                {" "}
                {/* changecode */}
                <button
                  className="contact__btn w-100"
                  style={{ backgroundColor: "#4078AB", height: "2.5rem" }}
                  type="button"
                  onClick={handleCloseButton}
                >
                  {t("Close")}
                </button>
              </Col>
              {/*  <Col lg={6} md={6} sm={12}>  mycode*/}
              <Col lg={6} md={6} sm={6} xs={6}>
                {/* changecode */}
                <button
                  className="contact__btn  w-100"
                  style={{ backgroundColor: "#4078AB", height: "2.5rem" }}
                  type="button"
                  // onClick={handleSelectAddressDelivery}
                  onClick={handleSelectAddress}
                >
                  {t("Select Address")}
                </button>
                {!selectedDeliveryCity && (
                  <span className="text-danger">{cityError}</span>
                )}
              </Col>
            </Row>
            {errorAddressDelivery && (
              <div className="text-danger mt-1">{t(errorAddressDelivery)}</div>
            )}

            <div className="delivery-note mt-1">
              {" "}
              {t("Note: Delivery time may vary due to traffic condition and selected address. We appreciate your patience as we strive to ensure your delivery arrives promptly.")}
            </div>
          </div>

          <div className="col-md-6 col-sm-12 map-column">
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
              {
                canShowMap ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={13}
                    // onLoad={onLoad}
                    // onUnmount={onUnmount}
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
                ) : null
              }
            </div>
            {/* </Col> */}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ChooseDeliverToMePopup;
