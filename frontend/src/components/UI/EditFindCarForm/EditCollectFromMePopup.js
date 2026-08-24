import React, { useState, useContext, useEffect } from "react";
import "../ChooseDeliverToMePopup.css"; // Import the CSS file
import Select from "react-select";
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
import { AppContext } from "../../../context/AppContext";
import { setInputValueDropoff } from "../../../reducers/Slices/inputValueDropoffSlice"; //importing action
import { useSelector, useDispatch } from "react-redux";
import { setSelectedCollectCity } from "../../../reducers/Slices/selectedCollectCitySlice";
import { setDropOffCity } from "../../../reducers/Slices/dropoffCitySlice";
import { setIsValidAddressCollection } from "../../../reducers/Slices/isValidAddressCollection";
import { setErrorAddressCollection } from "../../../reducers/Slices/errorAddressCollection";
import {
  UAE_BOUNDS,
  extractCity,
  filterCityArrayByLabel,
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

const EditCollectFromMePopup = (props) => {
  const {
    /* citiesArray, */ handleCloseButtonForCollect,
    handleSelectAddressCollect,
    handleCollectAddressChange,
    handleCollectCityChange_pseudo,
    onMarkerPositionChange,
    setFirstRender,
    cityErrorCollection
  } = props;
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const inputValueDropoff = useSelector(
    (state) => state.inputValueDropoff.inputValueDropoff
  );
  const selectedDeliveryCity = useSelector(
    (state) => state.selectedDeliveryCity.selectedDeliveryCity
  );
  const selectedCollectCity = useSelector(
    (state) => state.selectedCollectCity.selectedCollectCity
  );
  const citiesArray = useSelector(
    (state) => state.citiesArray.citiesArray
  );
  const requestBody_dropoff = useSelector(
    (state) => state.requestBody_dropoff.requestBody_dropoff
  );
  const isValidAddressCollection = useSelector(
    (state) => state.isValidAddressCollection.isValidAddressCollection
  );
  const errorAddressCollection = useSelector(
    (state) => state.errorAddressCollection.errorAddressCollection
  );
  // const {inputValueDropoff, setInputValueDropoff} = useContext(AppContext)
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
    searchOptions: {
      componentRestrictions: {
        country: ["ma"],
      },
    },
  });
  const GEOLOCATION_API_KEY = process.env.REACT_APP_GOOGLE_MAP_KEY;
  const [address, setAddress] = useState("");
  // const[ selectedCollectCity, setSelectedCollectCity] = useState(null);
  // const [inputValueDropoff, setInputValueDropoff] = useState('');

  const handleCollectCityChange = (selectedOption) => {
    dispatch(setSelectedCollectCity(selectedOption));
    dispatch(setDropOffCity(selectedOption));
    // handleCollectCityChange_pseudo(selectedOption);
    setFirstRender(true);
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
  const [addressDropoff, setAddressDropoff] = useState("");
  const [cityName, setCityName] = useState("");
  const [showMapPopupDropoff, setShowMapPopupDropoff] = useState(false);
  const [centerDropoff, setCenterDropoff] = useState(defaultCenter);
  const [mapMarkerCenterFlag, setMapMarkerCenterFlag] = useState(false);
  const [markerPositionDropoff, setMarkerPositionDropoff] =
    useState(defaultCenter);
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
    if (!mapMarkerCenterFlag) {
      if (!inputValueDropoff) {
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
  }, [
    selectedDeliveryCity?.value,
    selectedCollectCity?.value,
    inputValueDropoff,
  ]);

  useEffect(() => {
    if (
      Array.isArray(citiesArray) &&
      citiesArray.length > 0 &&
      cityName /* && selectedCollectCity?.label */ &&
      cityName !== selectedCollectCity?.label
    ) {
      let cityObj = filterCityArrayByLabel(citiesArray, cityName);
      dispatch(setSelectedCollectCity(cityObj));
      dispatch(setDropOffCity(cityObj));
    }
  }, [cityName]);

  useEffect(() => {
    if (requestBody_dropoff?.dropoff_city_id) {
      const city = citiesArray?.find(
        (city) => city?.id === requestBody_dropoff?.dropoff_city_id
      );
      const cityObj = { value: city?.id, label: city?.name };
      setSelectedCollectCity(cityObj);
      handleCollectCityChange_pseudo(cityObj);
    }
  }, []);
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
      componentRestrictions: {
        country: "ma",
      },
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
            // setInputValueDropoff(data.results[0].formatted_address);
            dispatch(setInputValueDropoff(data.results[0].formatted_address));
          } else {
            console.error("No results found for the provided address.");
          }
        } catch (error) {
          console.error("Error geocoding address:", error);
        }
      };

      geocodeAddress();
    }
  }, [addressDropoff]);

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
      const cityName = extractCity(results);
      setCityName(cityName);
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
      const cityName = extractCity(results);
      setCityName(cityName);
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
    
      if(isValidAddressCollection){
       
        handleSelectAddressCollect();
      }
      if (!isValidAddressCollection) {
        dispatch(setErrorAddressCollection("Please select your address from suggestions or adjust the marker on the map."));
        return;
      } else {
      dispatch(setErrorAddressCollection(""));
      
      // handleSelectAddressCollect();
      }
    }

  return (
    <div className="chooseDeliverToMePopup">
      <Form onSubmit={handleSubmit} /* validated={validated} */>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Row className=" sm-6  ">
              <Col style={{ paddingBottom: "0px" }} lg={12} md={12} sm={12}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label className="label-name">
                    Select Collect City
                  </Form.Label>
                  <Select
                    className="find-my-car-select"
                    required
                    value={selectedCollectCity}
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
                  Select Your Address
                </Form.Label>
                <FormControl
                  value={inputValueDropoff}
                  onChange={handleInputDropoff}
                  disabled={!readyDropoff}
                  placeholder="Search a location"
                  className="mb-2"
                />
                {statusDropoff === "OK" && (
                  <ul className="suggestions">{renderSuggestionsDropoff()}</ul>
                )}
              </Col>

              <Col lg={6} md={6} sm={12}>
                <button
                  className="contact__btn w-100"
                  style={{ backgroundColor: "#4078AB", height: "2.5rem" }}
                  type="button"
                  onClick={handleCloseButtonForCollect}
                >
                  Close
                </button>
              </Col>
              <Col lg={6} md={6} sm={12}>
                <button
                  className="contact__btn  w-100"
                  style={{ backgroundColor: "#4078AB", height: "2.5rem" }}
                  type="button"
                  onClick={handleSelectAddress}
                >
                  Select Address
                </button>
                {!selectedCollectCity && (
                <span className="text-danger">{cityErrorCollection}</span>
              )}
              </Col>
            </Row>
            {errorAddressCollection && (
                  <div className="text-danger mt-1">{errorAddressCollection}</div>
                )}
          </div>

          <div className="col-sm-12 col-md-6">
            {/* <Col style={{paddingBottom : '0px'}} lg={12} md={12} sm={12} > */}
            <div className="w-100 h-100">
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
            </div>

            {/* </Col> */}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default EditCollectFromMePopup;
