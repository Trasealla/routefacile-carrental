import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner, Card } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import CKEditorComponent from "../../../../components/CKEditor/CKEditor";
import configWeb from "../../../../components/config.js/ConfigWeb";
import { multipartPostCall, multipartPutWithAuthCall, simpleGetCallAuth } from "../../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../../components/notify/notify";
import { useTranslation } from "react-i18next";
import "./CreateCar.css";

// Feature Toggle Component
const FeatureToggle = ({ name, label, value, onChange, error }) => {
  const isActive = value === '1' || value === 1;
  
  const handleToggle = () => {
    onChange({
      target: {
        name,
        value: isActive ? '0' : '1',
        type: 'radio'
      }
    });
  };

  return (
    <div 
      className={`feature-toggle-item ${isActive ? 'active' : ''}`}
      onClick={handleToggle}
    >
      <span className="feature-toggle-label">
        {label}
      </span>
      <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={isActive}
          onChange={handleToggle}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ title, subtitle }) => (
  <div className="section-header">
    <div>
      <h3 className="section-title">{title}</h3>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  </div>
);

const CreateCar = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const imageFileServer = (process.env.REACT_APP_FILE_SERVER || "").replace(/\/*$/, "/");
  const navigate = useNavigate();
  const [brandsArray, setBrandsArray] = useState([]);
  const [carCategoryArray, setCarCategoryArray] = useState([]);
  const [carFuelTypeArray, setCarFuelTypeArray] = useState([]);
  const [carGroupArray, setCarGroupArray] = useState([]);
  const [carTransmissionArray, setCarTransmissionArray] = useState([]);
  const [citiesArray, setCitiesArray] = useState([]);
  const [editLoading, setEditLoading] = useState(id ? true : false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: "",
    name_en: "",
    name_ar: "",
    brand_id: "",
    category_id: "",
    group_id: "",
    fuel_type_id: "",
    transmission_id: "",
    doors_en: "",
    doors_ar: "",
    passengers_en: "",
    passengers_ar: "",
    suit_cases_en: "",
    suit_cases_ar: "",
    // Feature toggles - default to "0" (off)
    air_bags: "0",
    parking_sensors: "0",
    bluetooth: "0",
    infotainment_system: "0",
    cruise_control: "0",
    sunroof: "0",
    rear_camera: "0",
    electric: "0",
    description_en: "",
    description_ar: "",
    image: null,
    banner_image: null,
    images: [],
    // Special Rates fields (replaces old city_visibility_id and daily_specials_logo)
    special_rates_selection: "none", // 'none', 'all', or 'specific'
    special_rates_cities_ids: [], // Array of selected city IDs when 'specific'
    special_rates_image: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "checkbox") {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else if ((name === 'image' || name === "banner_image") && files && files[0]) {
      const file = files[0];
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (name === 'banner_image') {
          if (img.width === 1600 && img.height === 500) {
            setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
            setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
          } else {
            setErrors((prevErrors) => ({
              ...prevErrors,
              [name]: t("Image must be exactly 1600x500 pixels"),
            }));
          }
        } else if (name === "image") {
          if (img.width === 1000 && img.height === 525) {
            setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
            setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
          } else {
            setErrors((prevErrors) => ({
              ...prevErrors,
              [name]: t("Image must be exactly 1000x525 pixels"),
            }));
          }
        }
      };
    } else if (name === 'images' && files) {
      const selectedFiles = Array.from(files);
      setFormData((prevData) => ({
        ...prevData,
        [name]: [...(prevData[name] || []), ...selectedFiles]
      }));
    } else if (name === 'special_rates_image' && files && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: t("File size must be less than 2MB"),
        }));
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: t("Only JPG, JPEG, and PNG files are allowed"),
        }));
        return;
      }
      setFormData((prevData) => ({ ...prevData, [name]: file }));
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleEditorChange = (name, content) => {
    setFormData((prevData) => ({ ...prevData, [name]: content }));
    if (content) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Optional fields that don't require validation
    const optionalFields = [
      'special_rates_selection', 
      'special_rates_cities_ids', 
      'special_rates_image', 
      'images',
      // Feature toggles have default values, so they're essentially optional
      'air_bags',
      'parking_sensors',
      'bluetooth',
      'infotainment_system',
      'cruise_control',
      'sunroof',
      'rear_camera',
      'electric'
    ];
    
    Object.keys(formData).forEach((key) => {
      if (optionalFields.includes(key)) return;
      if ((!formData[key] && formData[key] !== "0" && formData[key] !== 0) ||
          (Array.isArray(formData[key]) && formData[key].length === 0)) {
        newErrors[key] = t("This field is required");
      }
    });
    
    // Log which fields are missing for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors);
    }
    
    setErrors(newErrors);
    // Return the errors object so handleSubmit can access it immediately
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const formSubmitFunction = () => {
    const appendFormData = new FormData();
    appendFormData.append("name_en", formData?.name_en);
    appendFormData.append("name_ar", formData?.name_ar);
    
    // Only append image if it's a new file upload
    if (formData?.image instanceof File) {
      appendFormData.append("image", formData?.image);
    }
    
    // Only append banner_image if it's a new file upload
    if (formData?.banner_image instanceof File) {
      appendFormData.append("banner_image", formData?.banner_image);
    }
    
    // Only append new image files, not existing image strings
    formData?.images.forEach((file) => {
      if (file instanceof File) {
        appendFormData.append(`images`, file);
      }
    });
    
    appendFormData.append("description_en", formData?.description_en);
    appendFormData.append("description_ar", formData?.description_ar);
    appendFormData.append("status", formData?.status);
    appendFormData.append("doors_en", formData?.doors_en);
    appendFormData.append("doors_ar", formData?.doors_ar);
    appendFormData.append("passengers_en", formData?.passengers_en);
    appendFormData.append("passengers_ar", formData?.passengers_ar);
    appendFormData.append("suit_cases_en", formData?.suit_cases_en);
    appendFormData.append("suit_cases_ar", formData?.suit_cases_ar);
    appendFormData.append("air_bags", formData?.air_bags);
    appendFormData.append("parking_sensors", formData?.parking_sensors);
    appendFormData.append("rear_camera", formData?.rear_camera);
    appendFormData.append("infotainment_system", formData?.infotainment_system);
    appendFormData.append("bluetooth", formData?.bluetooth);
    appendFormData.append("sunroof", formData?.sunroof);
    appendFormData.append("cruise_control", formData?.cruise_control);
    appendFormData.append("electric", formData?.electric);
    appendFormData.append("group_id", formData?.group_id);
    appendFormData.append("fuel_type_id", formData?.fuel_type_id);
    appendFormData.append("category_id", formData?.category_id);
    appendFormData.append("transmission_id", formData?.transmission_id);
    appendFormData.append("brand_id", formData?.brand_id);
    
    // Special Rates fields
    if (formData?.special_rates_selection === 'none' || !formData?.special_rates_selection) {
      // Don't send special_rates_cities - backend will set it as NULL
    } else if (formData?.special_rates_selection === 'all') {
      // ALL cities selected
      appendFormData.append('special_rates_cities', JSON.stringify({ all: true }));
      // Upload the special image
      if (formData?.special_rates_image && formData?.special_rates_image instanceof File) {
        appendFormData.append('special_rates_image', formData?.special_rates_image);
      }
    } else if (formData?.special_rates_selection === 'specific') {
      // Specific cities selected
      appendFormData.append('special_rates_cities', JSON.stringify({ 
        all: false, 
        ids: formData?.special_rates_cities_ids 
      }));
      // Upload the special image
      if (formData?.special_rates_image && formData?.special_rates_image instanceof File) {
        appendFormData.append('special_rates_image', formData?.special_rates_image);
      }
    }
    
    const url = id ? configWeb.PUT_CAR_UPDATE(id) : configWeb.POST_CAR_CREATE;
    setLoading(true);
    const apiCall = id ? multipartPutWithAuthCall : multipartPostCall;
    
    apiCall(url, appendFormData)
      .then((res) => {
        // Handle different response formats
        if (res?.status === "success" || res?.statusCode === 200 || res?.id) {
          notifySuccess(id ? t("Car updated successfully!") : t("Car created successfully!"));
          navigate("/car/cardatabase");
        } else {
          if (Array.isArray(res?.message)) {
            notifyError(res?.message[0]);
          } else {
            notifyError(res?.message || t("Something went wrong"));
          }
        }
      })
      .catch((error) => {
        console.error("Form submission error:", error);
        notifyError(t("Something went wrong. Please try again later."));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation.isValid) {
      // Get the list of missing fields for a more helpful error message
      const missingFields = Object.keys(validation.errors).join(', ');
      notifyError(t('Please fill in all required fields. Missing: {{missingFields}}', { missingFields }));
      console.log("Form validation failed. Missing fields:", validation.errors);
      console.log("Current form data:", formData);
      return;
    }
    formSubmitFunction();
  };

  const getBrands = () => {
    const url = `${configWeb.GET_BRANDS}?page=1&page_size=9999`;
    simpleGetCallAuth(url)
      .then((res) => setBrandsArray(res?.data || []))
      .catch((err) => console.error("Error fetching brands:", err));
  };

  const getCarCategories = () => {
    const url = `${configWeb.GET_CAR_CATEGORIES}?page=1&page_size=9999`;
    simpleGetCallAuth(url)
      .then((res) => setCarCategoryArray(res?.data || []))
      .catch((err) => console.error("Error fetching categories:", err));
  };

  const carGroupData = () => {
    const url = `${configWeb.GET_CAR_GROUPS}?page=1&page_size=9999`;
    simpleGetCallAuth(url)
      .then((res) => setCarGroupArray(res?.data || []))
      .catch((err) => console.error("Error fetching groups:", err));
  };

  const getCarFuelType = () => {
    const url = `${configWeb.GET_CAR_FUEL_TYPE}?page_size=9999`;
    simpleGetCallAuth(url)
      .then((res) => setCarFuelTypeArray(res?.data || []))
      .catch((err) => console.error("Error fetching fuel types:", err));
  };

  const getCarTransmission = () => {
    const url = `${configWeb.GET_CAR_TRANSMISSION}?page_size=9999`;
    simpleGetCallAuth(url)
      .then((res) => setCarTransmissionArray(res?.data || []))
      .catch((err) => console.error("Error fetching transmissions:", err));
  };

  const getCities = () => {
    const url = `${configWeb.GET_CITY_LIST}?page=1&page_size=1000`;
    simpleGetCallAuth(url)
      .then((res) => setCitiesArray(res?.data || []))
      .catch((err) => console.error("Error fetching cities:", err));
  };

  useEffect(() => {
    getBrands();
    getCarCategories();
    carGroupData();
    getCarFuelType();
    getCarTransmission();
    getCities();
  }, []);

  const arabicNumbers = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'][i],
  }));
  
  const englishNumbers = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString(),
  }));

  const stringToArray = (str) => str ? [str] : [];

  const getDetails = () => {
    return new Promise((resolve) => {
      const url = configWeb.GET_CAR_DETAILS(id);
      simpleGetCallAuth(url)
        .then((res) => {
          if (res) {
            setFormData((prevData) => ({
              ...prevData,
              status: res?.status,
              name_en: res?.name_en,
              name_ar: res?.name_ar,
              brand_id: res?.brand_id,
              category_id: res?.category_id,
              group_id: res?.group_id,
              fuel_type_id: res?.fuel_type_id,
              transmission_id: res?.transmission_id,
              doors_en: res?.doors_en,
              doors_ar: res?.doors_ar,
              passengers_en: res?.passengers_en,
              passengers_ar: res?.passengers_ar,
              suit_cases_en: res?.suit_cases_en,
              suit_cases_ar: res?.suit_cases_ar,
              air_bags: res?.air_bags,
              parking_sensors: res?.parking_sensors,
              bluetooth: res?.bluetooth,
              infotainment_system: res?.infotainment_system,
              cruise_control: res?.cruise_control,
              sunroof: res?.sunroof,
              rear_camera: res?.rear_camera,
              electric: res?.electric,
              description_en: res?.description_en,
              description_ar: res?.description_ar,
              image: res?.image,
              banner_image: res?.banner_image,
              images: Array.isArray(res?.images) ? res?.images : stringToArray(res?.images),
              // Parse special_rates_cities from API response
              special_rates_selection: !res?.special_rates_cities 
                ? 'none' 
                : res?.special_rates_cities?.all === true 
                  ? 'all' 
                  : 'specific',
              special_rates_cities_ids: res?.special_rates_cities?.ids || [],
              special_rates_image: res?.special_rates_image || null,
            }));
            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch(() => {
          notifyError(t("Something went wrong. Please try again later."));
          resolve(false);
        })
        .finally(() => {
          setEditLoading(false);
        });
    });
  };

  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);

  const handleRemoveImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  const getImageSrc = (image, folder = 'car') => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return `${imageFileServer}admin/car/${folder}/${image}`;
  };

  // Handle special rates selection change (radio buttons)
  const handleSpecialRatesSelectionChange = (selection) => {
    setFormData((prevData) => ({
      ...prevData,
      special_rates_selection: selection,
      // Reset cities selection when switching away from 'specific'
      special_rates_cities_ids: selection === 'specific' ? prevData.special_rates_cities_ids : [],
      // Clear image when switching to 'none'
      special_rates_image: selection === 'none' ? null : prevData.special_rates_image,
    }));
  };

  // Handle city checkbox toggle
  const handleCityCheckboxChange = (cityId) => {
    setFormData((prevData) => {
      const currentIds = prevData.special_rates_cities_ids || [];
      const isSelected = currentIds.includes(cityId);
      return {
        ...prevData,
        special_rates_cities_ids: isSelected
          ? currentIds.filter(id => id !== cityId)
          : [...currentIds, cityId],
      };
    });
  };

  // Check if image upload should be shown
  const showSpecialRatesImage = formData.special_rates_selection === 'all' || 
    (formData.special_rates_selection === 'specific' && formData.special_rates_cities_ids?.length > 0);

  // Feature items configuration
  const featureItems = [
    { name: 'air_bags', label: t('Air Bags') },
    { name: 'parking_sensors', label: t('Parking Sensors') },
    { name: 'bluetooth', label: t('Bluetooth') },
    { name: 'infotainment_system', label: t('Infotainment System') },
    { name: 'cruise_control', label: t('Cruise Control') },
    { name: 'sunroof', label: t('Sunroof') },
    { name: 'rear_camera', label: t('Rear Camera') },
    { name: 'electric', label: t('Electric (EV)') },
  ];

  return (
    <Container className="create-car-container" fluid>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h1>{id ? t('Edit Car') : t('Add New Car')}</h1>
            <p>{id ? t('Update car details and specifications') : t('Create a new car listing with all details')}</p>
          </div>
        </div>
        <div className="header-buttons" style={{ display: 'flex', gap: '10px' }}>
          <Link to="/car/cardatabase" className="btn-back">
            {t('Back to Car List')}
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="rf-submit-btn"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />
                {t('Saving...')}
              </>
            ) : (
              id ? t('Update Car') : t('+ Create Car')
            )}
          </Button>
        </div>
      </div>

      {editLoading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p>{t('Loading car details...')}</p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="section-card">
            <SectionHeader
              title={t('Basic Information')}
              subtitle={t('Enter the car name and status')}
            />
            <div className="form-grid">
              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Status')} <span className="required">*</span>
                </Form.Label>
                <Form.Select
                  name="status"
                  value={formData?.status}
                  onChange={handleChange}
                  className={`form-select-enhanced ${errors.status ? 'is-invalid' : ''}`}
                >
                  <option value="">{t('Select Status')}</option>
                  <option value="1">{t('Active')}</option>
                  <option value="0">{t('Inactive')}</option>
                </Form.Select>
                {errors.status && <div className="error-message">{errors.status}</div>}
              </Form.Group>

              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Car Name (English)')} <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name_en"
                  placeholder={t('e.g., Toyota Camry 2024')}
                  value={formData.name_en}
                  onChange={handleChange}
                  className={`form-control-enhanced ${errors.name_en ? 'is-invalid' : ''}`}
                />
                {errors.name_en && <div className="error-message">{errors.name_en}</div>}
              </Form.Group>

              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Car Name (Arabic)')} <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name_ar"
                  placeholder="أدخل اسم السيارة"
                  value={formData.name_ar}
                  onChange={handleChange}
                  className={`form-control-enhanced ${errors.name_ar ? 'is-invalid' : ''}`}
                  dir="rtl"
                />
                {errors.name_ar && <div className="error-message">{errors.name_ar}</div>}
              </Form.Group>
            </div>
          </div>

          {/* Classification Section */}
          <div className="section-card">
            <SectionHeader
              title={t('Classification')}
              subtitle={t('Select brand, category, and other classifications')}
            />
            <div className="form-grid">
              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Brand')} <span className="required">*</span>
                </Form.Label>
                <Form.Select
                  name="brand_id"
                  value={formData?.brand_id}
                  onChange={handleChange}
                  className={`form-select-enhanced ${errors.brand_id ? 'is-invalid' : ''}`}
                >
                  <option value="">{t('Select Brand')}</option>
                  {brandsArray?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name_en}</option>
                  ))}
                </Form.Select>
                {errors.brand_id && <div className="error-message">{errors.brand_id}</div>}
              </Form.Group>

              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Category')} <span className="required">*</span>
                </Form.Label>
                <Form.Select
                  name="category_id"
                  value={formData?.category_id}
                  onChange={handleChange}
                  className={`form-select-enhanced ${errors.category_id ? 'is-invalid' : ''}`}
                >
                  <option value="">{t('Select Category')}</option>
                  {carCategoryArray?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name_en}</option>
                  ))}
                </Form.Select>
                {errors.category_id && <div className="error-message">{errors.category_id}</div>}
              </Form.Group>

              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Group')} <span className="required">*</span>
                </Form.Label>
                <Form.Select
                  name="group_id"
                  value={formData?.group_id}
                  onChange={handleChange}
                  className={`form-select-enhanced ${errors.group_id ? 'is-invalid' : ''}`}
                >
                  <option value="">{t('Select Group')}</option>
                  {carGroupArray?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name_en}</option>
                  ))}
                </Form.Select>
                {errors.group_id && <div className="error-message">{errors.group_id}</div>}
              </Form.Group>

              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Fuel Type')} <span className="required">*</span>
                </Form.Label>
                <Form.Select
                  name="fuel_type_id"
                  value={formData?.fuel_type_id}
                  onChange={handleChange}
                  className={`form-select-enhanced ${errors.fuel_type_id ? 'is-invalid' : ''}`}
                >
                  <option value="">{t('Select Fuel Type')}</option>
                  {carFuelTypeArray?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name_en}</option>
                  ))}
                </Form.Select>
                {errors.fuel_type_id && <div className="error-message">{errors.fuel_type_id}</div>}
              </Form.Group>

              <Form.Group>
                <Form.Label className="form-label-enhanced">
                  {t('Transmission')} <span className="required">*</span>
                </Form.Label>
                <Form.Select
                  name="transmission_id"
                  value={formData?.transmission_id}
                  onChange={handleChange}
                  className={`form-select-enhanced ${errors.transmission_id ? 'is-invalid' : ''}`}
                >
                  <option value="">{t('Select Transmission')}</option>
                  {carTransmissionArray?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name_en}</option>
                  ))}
                </Form.Select>
                {errors.transmission_id && <div className="error-message">{errors.transmission_id}</div>}
              </Form.Group>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="section-card">
            <SectionHeader
              title={t('Specifications')}
              subtitle={t('Enter doors, passengers, and luggage capacity')}
            />
            <Row>
              <Col md={6}>
                <h6 style={{ color: '#6c757d', marginBottom: '16px', fontWeight: '600' }}>{t('English')}</h6>
                <div className="form-grid-3">
                  <Form.Group>
                    <Form.Label className="form-label-enhanced">{t('Doors')} <span className="required">*</span></Form.Label>
                    <Form.Select
                      name="doors_en"
                      value={formData?.doors_en}
                      onChange={handleChange}
                      className={`form-select-enhanced ${errors.doors_en ? 'is-invalid' : ''}`}
                    >
                      <option value="">{t('Select')}</option>
                      {englishNumbers?.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </Form.Select>
                    {errors.doors_en && <div className="error-message">{errors.doors_en}</div>}
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="form-label-enhanced">{t('Passengers')} <span className="required">*</span></Form.Label>
                    <Form.Select
                      name="passengers_en"
                      value={formData?.passengers_en}
                      onChange={handleChange}
                      className={`form-select-enhanced ${errors.passengers_en ? 'is-invalid' : ''}`}
                    >
                      <option value="">{t('Select')}</option>
                      {englishNumbers?.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </Form.Select>
                    {errors.passengers_en && <div className="error-message">{errors.passengers_en}</div>}
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="form-label-enhanced">{t('Suitcases')} <span className="required">*</span></Form.Label>
                    <Form.Select
                      name="suit_cases_en"
                      value={formData?.suit_cases_en}
                      onChange={handleChange}
                      className={`form-select-enhanced ${errors.suit_cases_en ? 'is-invalid' : ''}`}
                    >
                      <option value="">{t('Select')}</option>
                      {englishNumbers?.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </Form.Select>
                    {errors.suit_cases_en && <div className="error-message">{errors.suit_cases_en}</div>}
                  </Form.Group>
                </div>
              </Col>
              <Col md={6}>
                <h6 style={{ color: '#6c757d', marginBottom: '16px', fontWeight: '600' }}>{t('Arabic')}</h6>
                <div className="form-grid-3">
                  <Form.Group>
                    <Form.Label className="form-label-enhanced">الأبواب <span className="required">*</span></Form.Label>
                    <Form.Select 
                      name="doors_ar" 
                      value={formData?.doors_ar} 
                      onChange={handleChange}
                      className={`form-select-enhanced ${errors.doors_ar ? 'is-invalid' : ''}`}
                    >
                      <option value="">اختر</option>
                      {arabicNumbers?.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </Form.Select>
                    {errors.doors_ar && <div className="error-message">{errors.doors_ar}</div>}
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="form-label-enhanced">الركاب <span className="required">*</span></Form.Label>
                    <Form.Select 
                      name="passengers_ar" 
                      value={formData?.passengers_ar} 
                      onChange={handleChange}
                      className={`form-select-enhanced ${errors.passengers_ar ? 'is-invalid' : ''}`}
                    >
                      <option value="">اختر</option>
                      {arabicNumbers?.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </Form.Select>
                    {errors.passengers_ar && <div className="error-message">{errors.passengers_ar}</div>}
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="form-label-enhanced">الحقائب <span className="required">*</span></Form.Label>
                    <Form.Select 
                      name="suit_cases_ar" 
                      value={formData?.suit_cases_ar} 
                      onChange={handleChange}
                      className={`form-select-enhanced ${errors.suit_cases_ar ? 'is-invalid' : ''}`}
                    >
                      <option value="">اختر</option>
                      {arabicNumbers?.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </Form.Select>
                    {errors.suit_cases_ar && <div className="error-message">{errors.suit_cases_ar}</div>}
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </div>

          {/* Features Section */}
          <div className="section-card">
            <SectionHeader
              title={t('Features & Amenities')}
              subtitle={t('Toggle the features available in this car')}
            />
            <div className="feature-toggle-grid">
              {featureItems.map((feature) => (
                <FeatureToggle
                  key={feature.name}
                  name={feature.name}
                  label={feature.label}
                  icon={feature.icon}
                  value={formData[feature.name]}
                  onChange={handleChange}
                  error={errors[feature.name]}
                />
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="section-card">
            <SectionHeader
              title={t('Car Images')}
              subtitle={t('Upload main image, banner, and gallery images')}
            />
            <Row>
              <Col lg={4} className="mb-4">
                <div className={`image-upload-card ${formData.image ? 'has-image' : ''}`}>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image" style={{ cursor: 'pointer', width: '100%' }}>
                    {formData.image ? (
                      <div className="image-preview-container">
                        <img
                          src={getImageSrc(formData.image)}
                          alt={t('Car Preview')}
                          className="image-preview"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="image-upload-text">{t('Main Car Image')}</div>
                        <div className="image-upload-hint">{t('1000 × 525 pixels')}</div>
                      </>
                    )}
                  </label>
                </div>
                {errors.image && <div className="error-message">{errors.image}</div>}
              </Col>

              <Col lg={4} className="mb-4">
                <div className={`image-upload-card ${formData.banner_image ? 'has-image' : ''}`}>
                  <input
                    type="file"
                    id="banner_image"
                    name="banner_image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="banner_image" style={{ cursor: 'pointer', width: '100%' }}>
                    {formData.banner_image ? (
                      <div className="image-preview-container">
                        <img
                          src={getImageSrc(formData.banner_image)}
                          alt={t('Banner Preview')}
                          className="image-preview"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="image-upload-text">{t('Banner Image')}</div>
                        <div className="image-upload-hint">{t('1600 × 500 pixels')}</div>
                      </>
                    )}
                  </label>
                </div>
                {errors.banner_image && <div className="error-message">{errors.banner_image}</div>}
              </Col>

              <Col lg={4} className="mb-4">
                <div className="image-upload-card">
                  <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    onChange={handleChange}
                    multiple
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="images" style={{ cursor: 'pointer', width: '100%' }}>
                    <div className="image-upload-text">{t('Gallery Images')}</div>
                    <div className="image-upload-hint">{t('Multiple images (500 × 500)')}</div>
                  </label>
                </div>
                {errors.images && <div className="error-message">{errors.images}</div>}
              </Col>
            </Row>

            {/* Gallery Preview */}
            {formData.images && formData.images.length > 0 && (
              <div className="gallery-grid">
                {formData.images.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img
                      src={getImageSrc(image)}
                      alt={`Gallery ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Rates Section */}
          <div className="section-card special-rates-card">
            <SectionHeader
              title={t('Special Rates Settings')}
              subtitle={t('Configure which cities show promotional image for this car')}
            />
            <Row>
              <Col lg={6}>
                <Form.Group>
                  <Form.Label className="form-label-enhanced">
                    {t('Show Special Image In')}
                  </Form.Label>
                  <div className="special-rates-options">
                    {/* No Special Rate Option */}
                    <div
                      className={`special-rate-option ${formData.special_rates_selection === 'none' ? 'selected' : ''}`}
                      onClick={() => handleSpecialRatesSelectionChange('none')}
                    >
                      <div className="radio-circle">
                        {formData.special_rates_selection === 'none' && <div className="radio-dot"></div>}
                      </div>
                      <span>{t('No Special Rate')}</span>
                    </div>

                    {/* All Cities Option */}
                    <div
                      className={`special-rate-option ${formData.special_rates_selection === 'all' ? 'selected' : ''}`}
                      onClick={() => handleSpecialRatesSelectionChange('all')}
                    >
                      <div className="radio-circle">
                        {formData.special_rates_selection === 'all' && <div className="radio-dot"></div>}
                      </div>
                      <span>{t('All Cities')}</span>
                    </div>

                    {/* Select Specific Cities Option */}
                    <div
                      className={`special-rate-option ${formData.special_rates_selection === 'specific' ? 'selected' : ''}`}
                      onClick={() => handleSpecialRatesSelectionChange('specific')}
                    >
                      <div className="radio-circle">
                        {formData.special_rates_selection === 'specific' && <div className="radio-dot"></div>}
                      </div>
                      <span>{t('Select Specific Cities')}</span>
                    </div>

                    {/* Cities Checkboxes (shown when 'specific' is selected) */}
                    {formData.special_rates_selection === 'specific' && (
                      <div className="cities-checkbox-list">
                        {citiesArray?.map((city) => (
                          <div 
                            key={city.id} 
                            className={`city-checkbox-item ${formData.special_rates_cities_ids?.includes(city.id) ? 'checked' : ''}`}
                            onClick={() => handleCityCheckboxChange(city.id)}
                          >
                            <div className="checkbox-box">
                              {formData.special_rates_cities_ids?.includes(city.id) && (
                                <span className="checkbox-check">✓</span>
                              )}
                            </div>
                            <span>{city.name_en}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Form.Text className="text-muted" style={{ marginTop: '12px', display: 'block' }}>
                    {t('Select which cities should display the special promotional image instead of the main car image.')}
                  </Form.Text>
                </Form.Group>
              </Col>

              {showSpecialRatesImage && (
                <Col lg={6}>
                  <Form.Group>
                    <Form.Label className="form-label-enhanced">
                      {t('Special Rates Image')}
                    </Form.Label>
                    <div className={`image-upload-card ${formData.special_rates_image ? 'has-image' : ''}`} style={{ minHeight: '200px' }}>
                      <input
                        type="file"
                        id="special_rates_image"
                        name="special_rates_image"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="special_rates_image" style={{ cursor: 'pointer', width: '100%' }}>
                        {formData.special_rates_image ? (
                          <div className="image-preview-container">
                            <img
                              src={getImageSrc(formData.special_rates_image)}
                              alt={t('Special Rates Image')}
                              className="image-preview"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="image-upload-text">{t('Upload Special Rate Image')}</div>
                            <div className="image-upload-hint">{t('Max 2MB (JPG/PNG)')}</div>
                          </>
                        )}
                      </label>
                    </div>
                    <Form.Text className="text-muted" style={{ marginTop: '8px', display: 'block' }}>
                      {t('This image will replace the main car image when customers view from selected cities.')}
                    </Form.Text>
                    {errors.special_rates_image && <div className="error-message">{errors.special_rates_image}</div>}
                  </Form.Group>
                </Col>
              )}
            </Row>
          </div>

          {/* Description Section */}
          <div className="section-card">
            <SectionHeader
              title={t('Description')}
              subtitle={t('Add detailed description in English and Arabic')}
            />
            <Row>
              <Col lg={6} className="mb-4">
                <Form.Group>
                  <Form.Label className="form-label-enhanced">
                    {t('Description (English)')} <span className="required">*</span>
                  </Form.Label>
                  <CKEditorComponent
                    language="en"
                    onContentChange={(content) => handleEditorChange("description_en", content)}
                    contentW={formData?.description_en}
                  />
                  {errors.description_en && <div className="error-message">{errors.description_en}</div>}
                </Form.Group>
              </Col>
              <Col lg={6} className="mb-4">
                <Form.Group>
                  <Form.Label className="form-label-enhanced">
                    {t('Description (Arabic)')} <span className="required">*</span>
                  </Form.Label>
                  <CKEditorComponent
                    language="ar"
                    onContentChange={(content) => handleEditorChange("description_ar", content)}
                    contentW={formData?.description_ar}
                  />
                  {errors.description_ar && <div className="error-message">{errors.description_ar}</div>}
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Submit Button - Hidden, using top button instead */}
        </Form>
      )}
    </Container>
  );
};

export default CreateCar;
