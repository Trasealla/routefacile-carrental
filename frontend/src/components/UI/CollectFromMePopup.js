import React, { useState, useContext, useEffect } from "react";
import "./ChooseDeliverToMePopup.css"; // Import the CSS file
import Select from "react-select";
import {
 
  Col,
  Form,
  Row,
 
  FormControl,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { placesLibraryLoaded } from "../../utils/placesReady";
// import { useLocation } from "react-router-dom";
import {
  GoogleMap,
  // useLoadScript,
  // Marker,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
// import { AppContext } from "../../context/AppContext";
import { setInputValueDropoff } from "../../reducers/Slices/inputValueDropoffSlice"; //importing action
import { setSelectedCollectCity } from "../../reducers/Slices/selectedCollectCitySlice";
// import { setDropOffCity } from "../../reducers/Slices/dropoffCitySlice";
import { setIsValidAddressCollection } from "../../reducers/Slices/isValidAddressCollection";
import { setErrorAddressCollection } from "../../reducers/Slices/errorAddressCollection";
import { useSelector, useDispatch } from "react-redux";
import { setDropOffCity } from "../../reducers/Slices/dropoffCitySlice";
import { UAE_BOUNDS, extractCity, filterCityArrayByLabel } from "../../SharedComponent/reusableFunctions";
import { setSelectedDeliveryCity } from "../../reducers/Slices/selectedDeliveryCitySlice";
import { AppContext } from "../../context/AppContext";
import { setInputValueDropoffChangeFlag } from "../../reducers/Slices/inputValueDropoffChangeFlagSlice";
import { setCollectAddressMapErrorFlag } from "../../reducers/Slices/collectAddressMapErrorFlagSlice";
// Sample data for city dropdown, to be replaced with actual data
// const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
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
  lat: 31.6295, // default latitude — Marrakech, the operating base
  lng: -7.9811, // default longitude — Marrakech
};
const mapContainerStyle = {
  /*  width: '30rem',
     height: '30rem' */
  height: "400px",
  width: "100%",
};
const libraries = ["places"];

const CollectFromMePopup = (props) => {
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
    handleCloseButtonForCollect,
    handleSelectAddressCollect,
    handleCollectAddressChange,
    handleCollectCityChange_pseudo,
    onMarkerPositionChange,
  } = props;
  const {setClickonMapAddressSelectionFlagForDropoff} = useContext(AppContext)
  const { t, i18n } = useTranslation();
  // const location = useLocation();
  const dispatch = useDispatch();
  const inputValueDropoff = useSelector(
    (state) => state.inputValueDropoff.inputValueDropoff
  );
  const collectAddressMapErrorFlag = useSelector(
    (state) => state.collectAddressMapErrorFlag.collectAddressMapErrorFlag
  );
  const errorAddressCollection = useSelector(
    (state) => state.errorAddressCollection.errorAddressCollection
  );
  const isValidAddressCollection = useSelector(
    (state) => state.isValidAddressCollection.isValidAddressCollection
  );
  const selectedCollectCity = useSelector(
    (state) => state.selectedCollectCity.selectedCollectCity
  );
  // const dropOffCity = useSelector(
  //   (state) => state.dropOffCity.dropOffCity
  // );
  const selectedDeliveryCity = useSelector(
    (state) => state.selectedDeliveryCity.selectedDeliveryCity
  );
  const [mapMarkerCenterFlag, setMapMarkerCenterFlag] = useState(false)
  // const pickupCity = useSelector(
  //   (state) => state.pickupCity.pickupCity
  // );
  // const {inputValueDropoff, setInputValueDropoff} = useContext(AppContext)
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

  const handleCollectCityChange = (selectedOption) => {
    dispatch(setSelectedCollectCity(selectedOption));
    dispatch(setDropOffCity(selectedOption));
    handleCollectCityChange_pseudo(selectedOption);
  };
  const handleSubmit = (e) => {
    const form = e.currentTarget;

    e.preventDefault();
  };

  useEffect(() => {
    handleCollectAddressChange(inputValueDropoff);
  }, [inputValueDropoff]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // States and handlers for Dropoff Address
  // const [addressDropoff, setAddressDropoff] = useState("");
  // const [showMapPopupDropoff, setShowMapPopupDropoff] = useState(false);
  const [centerDropoff, setCenterDropoff] = useState(defaultCenter);
  const [markerPositionDropoff, setMarkerPositionDropoff] =
    useState(defaultCenter);
    const [cityName, setCityName] = useState('');
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
  useEffect(() => {
   
    
    const defaultCoordinates = citiesCoordinates[1];
    if(!mapMarkerCenterFlag){
      if(!inputValueDropoff){
    setMarkerPositionDropoff(
      citiesCoordinates[selectedCollectCity?.value] ||
        citiesCoordinates[selectedDeliveryCity?.value] ||
        defaultCoordinates
    );
      }
      
    setCenterDropoff(
      citiesCoordinates[selectedCollectCity?.value] ||
        citiesCoordinates[selectedDeliveryCity?.value] ||
        defaultCoordinates
    );
    }
    setMapMarkerCenterFlag(false);
  }, [selectedCollectCity?.value, inputValueDropoff]);

  useEffect(()=>{
    if(Array.isArray(citiesArray) && citiesArray.length >0 && cityName /* && selectedCollectCity?.label */ && cityName !== selectedCollectCity?.label){
      let cityObj = filterCityArrayByLabel(citiesArray, cityName);
      dispatch(setSelectedCollectCity(cityObj));
      dispatch(setDropOffCity(cityObj));
    }
  
  },[cityName])
  

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
    componentRestrictions: {
      country: "ma",
    },
  });

 

  useEffect(() => {
    if (markerPositionDropoff) {
      onMarkerPositionChange(markerPositionDropoff); // Call the callback function
    }
  }, [markerPositionDropoff]);

  const handleInputDropoff = (e) => {

    setValueDropoff(e.target.value);
    // setInputValueDropoff(e.target.value);
    dispatch(setInputValueDropoff(e.target.value));

    dispatch(setIsValidAddressCollection(false));
    dispatch(setErrorAddressCollection(""));
    dispatch(setCollectAddressMapErrorFlag(true));

   
    
  };

  const handleAddressSelectDropoff = async (address) => {
    setValueDropoff(address, false);
    clearSuggestionsDropoff();

    try {
      setMapMarkerCenterFlag(true);
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setCenterDropoff({ lat, lng });
      setMarkerPositionDropoff({ lat, lng });
      // setInputValueDropoff(results[0].formatted_address);
      dispatch(setInputValueDropoff(results[0].formatted_address));

      dispatch(setIsValidAddressCollection(true));
      const cityName= extractCity(results);
      setCityName(cityName)
    
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleMarkerDragEndDropoff = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPositionDropoff({ lat, lng });
    setCenterDropoff({ lat, lng });

    try {
      setMapMarkerCenterFlag(true);
      const results = await getGeocode({ location: { lat, lng } });
      // setInputValueDropoff(results[0].formatted_address);
      dispatch(setInputValueDropoff(results[0].formatted_address));
      dispatch(setIsValidAddressCollection(true));
      const cityName= extractCity(results);
      setCityName(cityName)
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const renderSuggestionsDropoff = () =>
    dataDropoff.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={() => handleAddressSelectDropoff(suggestion.description)}
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

    const handleSelectAddress = () => {
      setClickonMapAddressSelectionFlagForDropoff(true);
      dispatch(setInputValueDropoffChangeFlag(true));
      if(isValidAddressCollection || !collectAddressMapErrorFlag){
        handleSelectAddressCollect();
      }
      if (!isValidAddressCollection && collectAddressMapErrorFlag) {
        dispatch(setErrorAddressCollection("Please select your address from suggestions or adjust the marker on the map."));
        return;
      } else {
      dispatch(setErrorAddressCollection(""));
      
      // handleSelectAddressCollect();
      }
    }

  return (
    <div className={`chooseDeliverToMePopup${!canShowMap ? " no-map" : ""}`}>
      <Form onSubmit={handleSubmit} /* validated={validated} */>
        <div className="row mt-4">
          <div className="col-sm-12 col-md-6 form-column">
            <Row className=" sm-6  ">
              <Col style={{ paddingBottom: "0px" }} lg={12} md={12} sm={12}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label className="label-name">
                    {t("Select Collect City")}
                  </Form.Label>
                  <Select
                    className="find-my-car-select"
                    required
                    value={selectedCollectCity || selectedDeliveryCity || ""}
                    onChange={handleCollectCityChange}
                    options={citiesArray.map((city) => ({
                      value: city.id,
                      label: city.name,
                    }))}
                    styles={customStyles}
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
              
                <Form.Label className="label-name ">
                  {t("Select Your Address")}
                </Form.Label>
                <Form.Control
                  value={inputValueDropoff || ""}
                  onChange={handleInputDropoff}
                  disabled={!readyDropoff}
                  placeholder={t("Search a location")}
                  className="mb-2"
                />
                {statusDropoff === "OK" && (
                  <ul className="suggestions">
                    {renderSuggestionsDropoff()}
                  </ul>
                )}
              </Col>

              {/*  <Col lg={6} md={6} sm={12}>  mycode*/}
              <Col lg={6} md={6} sm={6} xs={6}>
                {/* changecode */}
                <button
                  className="contact__btn w-100"
                  style={{ backgroundColor: "#4078AB", height: "2.5rem" }}
                  type="button"
                  onClick={handleCloseButtonForCollect}
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
                  onClick={handleSelectAddress}
                >
                  {t("Select Address")}
                </button>
              </Col>
            </Row>

            {errorAddressCollection && (
                  <div className="text-danger mt-1">{t(errorAddressCollection)}</div>
                )}
          </div>

          <div className="col-sm-12 col-md-6 map-column">
            {/* <Col style={{paddingBottom : '0px'}} lg={12} md={12} sm={12} > */}
            <div className="w-100 h-100">
              {canShowMap ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={13}
                  center={centerDropoff}
                  options={{
                    restriction: {
                      latLngBounds: UAE_BOUNDS,
                      strictBounds: true, // Prevent panning outside bounds
                    },
                  }}
                >
                  <MarkerF
                    position={markerPositionDropoff}
                    draggable={true}
                    onDragEnd={handleMarkerDragEndDropoff}
                  />
                </GoogleMap>
              ) : null}
            </div>
          
            {/* </Col> */}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CollectFromMePopup;
