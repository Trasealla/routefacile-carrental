import React, { useState , useEffect, useRef} from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaMapMarkerAlt, FaFileExcel, FaDownload, FaCloudUploadAlt, FaCheckCircle, FaTimes, FaInfoCircle } from "react-icons/fa";
import { MdPriceChange } from "react-icons/md";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import configWeb from "../../../components/config.js/ConfigWeb";
import { multipartPostCall, simpleGetCallAuth } from "../../../components/config.js/Setup";
import Select from 'react-select';
import { notifyError, notifySuccess } from "../../../components/notify/notify";
import Pricing_Master_sample from "../../../assets/Files/Pricing_Master_sample.xlsx"

const Uploaddailypricing = () => {
  const { t } = useTranslation();
  const [citiesArray, setCitiesArray] = useState([]);
     const handleCityChange =(selectedOptions)=>{
      setCityError(!selectedOptions/*  || selectedOptions?.value?.length === 0 */);
      setCity(selectedOptions);

     }
  const [formData, setFormData] = useState({
    year: "",
    city: [],
    excel_file: "",
  
  });
  const [city, setCity] = useState([]);

  const [previews, setPreviews] = useState({
    mainImage: "",
    thumbnailImage: "",
  });
  const [cityError, setCityError] = useState(false);
 
const [loading,  setLoading]= useState(false);
  const [validated, setValidated] = useState(false);
   // Ref for the file input
   const fileInputRef = useRef(null);

  const years = [
    {value: 2021, name: "2021" },
    {value: 2022, name: "2022" },
    {value: 2023, name: "2023" },
    {value: 2024, name: "2024" },
    {value: 2025, name: "2025" },
    {value: 2026, name: "2026" },
    {value: 2027, name: "2027" },
    {value: 2028, name: "2028" },
    {value: 2029, name: "2029" },
    {value: 2030, name: "2030" },
  ]

  // Common handleChange function for inputs
  const handleChange = (e) => {
    const { name, value, type } = e.target || {};

  
      // Handle other input types
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    
  };

  

  // Special handler for file inputs
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: file,
      }));

      // Create a preview URL for the uploaded image
      setPreviews((prevPreviews) => ({
        ...prevPreviews,
        [name]: URL?.createObjectURL(file),
      }));
    }
  };

 const handleSampleDownload =()=>{
  const file = Pricing_Master_sample;
  const link = document.createElement("a");
  link.href =file;
  link.download="Pricing_Master_sample.xlsx";
  link.click();
 }
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let valid = true;
   
  

    if (form.checkValidity() === false || !valid || city.length === 0) {
      e.stopPropagation();
      setValidated(true);
      setCityError(city.length === 0); // Show error if city is empty
    } else {
      // Handle form submission
      setCityError(false);
      handleFormSubmit()
      setValidated(false);
       
    }
    // setValidated(true);
  };


  const citiesData = () => {
    const url = configWeb.GET_CITIES;
    simpleGetCallAuth(url)
      .then((res) => {
        setCitiesArray(res?.data || []) ;
      })
      .catch((errr) => {
        console.log("errr", errr);
      })
      .finally(() => {
        // set_loading(false);
      });
  };
  useEffect(()=>{
    citiesData();
  },[])
  const [mappedCitiesArray, setMappedCitiesArray]= useState([]);
  useEffect(()=>{
if(citiesArray?.length > 0){
const citiesArrayTemp = citiesArray?.map((city)=>({
  value : city.id, label: city.name_en
}));
setMappedCitiesArray(citiesArrayTemp);
}
  },[citiesArray])
   
  const handleFormSubmit = () => {
    return new Promise((resolve, reject) => {
      const appendFormData = new FormData();
      appendFormData.append("year", formData?.year);
      appendFormData.append("file", formData?.excel_file);
      appendFormData.append("city_ids", city?.map((item)=>item.value));
      const url = configWeb.POST_DAILY_PRICE;
      setLoading(true);
      multipartPostCall(url, appendFormData)
        .then((res) => {
          if (res?.status === true) {
            // setUserDetails(res);
            notifySuccess(t("dailyPricing.uploadSuccess"));

            resolve(true);
            setFormData({
             year: "" ,
             city :[],
             excel_file : ""
            });
            setCity([]);
             // Clear the file input after successful form submission
        setFormData((prevData) => ({ ...prevData, excel_file: "" }));
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset the file input field
        }
          } else  {
            if(Array.isArray(res?.message)){
              notifyError(res?.message[0]);
            }else{
              notifyError(res?.message);
            }
            resolve(false);
          }
        })
        .catch((error) => {
          console.error("Banner failed:", error);
          notifyError("Something went wrong. Please try again letter.");
          resolve(false);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  return (
    <div className="rf-list-page">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="rf-page-header">
        <div>
          <h2 className="rf-page-title">
            <span className="rf-title-bar" />
            <MdPriceChange size={26} style={{ color: 'var(--rf-orange)', marginRight: 8 }} />
            {t("dailyPricing.title")}
          </h2>
          <p style={{ margin: '4px 0 0 14px', color: '#8492a6', fontSize: '0.85rem', fontWeight: 500 }}>
            {t("dailyPricing.subtitle")}
          </p>
        </div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.82rem' }}>
            <li className="breadcrumb-item"><Link to="/dashboard" style={{ color: 'var(--rf-orange)', textDecoration: 'none' }}>{t("nav.Dashboard")}</Link></li>
            <li className="breadcrumb-item"><span style={{ color: '#8492a6' }}>{t("nav.Pricing")}</span></li>
            <li className="breadcrumb-item active" style={{ color: '#1a202c' }}>{t("dailyPricing.title")}</li>
          </ol>
        </nav>
      </div>

      {/* ── Info Banner ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'linear-gradient(135deg, rgba(218,40,38,0.06) 0%, rgba(13,27,42,0.04) 100%)',
        border: '1px solid rgba(218,40,38,0.18)',
        borderRadius: 14, padding: '14px 20px', marginBottom: 24,
      }}>
        <FaInfoCircle size={18} style={{ color: 'var(--rf-orange)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#2d3748', fontWeight: 600 }}>{t("dailyPricing.howToTitle")}</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#718096', lineHeight: 1.6 }}>
            {t("dailyPricing.howToBody")}
          </p>
        </div>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px rgba(13,27,42,0.07)',
      }}>
        {/* Card top accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--rf-orange) 0%, #da2826 100%)', borderRadius: '18px 18px 0 0' }} />

        <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>

            {/* ── Row 1: Year ─────────────────────────────────────── */}
            <Row className="mb-4">
              <Col xs={12} md={10} lg={7} xl={6}>
                <Form.Group controlId="year">
                  <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FaCalendarAlt size={14} style={{ color: 'var(--rf-orange)' }} />
                    {t("dailyPricing.year")} <span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
                  </Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      style={{
                        height: 48, borderRadius: 12, border: '1.5px solid #e2e8f0',
                        fontSize: '0.9rem', paddingLeft: 16, color: formData.year ? '#1a202c' : '#a0aec0',
                        background: '#fafbfc', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'border-color .2s, box-shadow .2s',
                        appearance: 'none',
                      }}
                    >
                      <option value="">{t("dailyPricing.selectYear")}</option>
                      {years?.map((year) => (
                        <option key={year.value} value={year.value}>{year.name}</option>
                      ))}
                    </Form.Select>
                  </div>
                  <Form.Control.Feedback type="invalid">{t("dailyPricing.yearRequired")}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ── Row 2: City ─────────────────────────────────────── */}
            <Row className="mb-4">
              <Col xs={12} md={10} lg={7} xl={6}>
                <Form.Group controlId="city">
                  <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FaMapMarkerAlt size={14} style={{ color: 'var(--rf-orange)' }} />
                    {t("dailyPricing.city")} <span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#a0aec0', fontWeight: 400 }}>{t("dailyPricing.multiSelect")}</span>
                  </Form.Label>
                  <Select
                    value={city}
                    isMulti
                    name="city"
                    options={mappedCitiesArray}
                    isSearchable
                    className="basic-multi-select"
                    onChange={handleCityChange}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: 48, borderRadius: 12,
                        border: `1.5px solid ${cityError ? '#e53e3e' : state.isFocused ? 'var(--rf-orange)' : '#e2e8f0'}`,
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(218,40,38,.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                        background: '#fafbfc', fontSize: '0.9rem',
                        '&:hover': { borderColor: 'var(--rf-orange)' },
                      }),
                      multiValue: (base) => ({ ...base, borderRadius: 8, background: 'rgba(218,40,38,0.08)', border: '1px solid rgba(218,40,38,0.2)' }),
                      multiValueLabel: (base) => ({ ...base, color: '#b81f1d', fontWeight: 600, fontSize: '0.8rem' }),
                      multiValueRemove: (base) => ({ ...base, color: '#b81f1d', '&:hover': { background: 'rgba(218,40,38,0.2)', color: '#c53030', borderRadius: '0 8px 8px 0' } }),
                      option: (base, state) => ({ ...base, background: state.isSelected ? 'var(--rf-orange)' : state.isFocused ? 'rgba(218,40,38,0.07)' : '#fff', color: state.isSelected ? '#fff' : '#2d3748', borderRadius: 8, margin: '2px 4px', width: 'calc(100% - 8px)' }),
                      menu: (base) => ({ ...base, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', zIndex: 9999 }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                  {cityError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#e53e3e', fontSize: '0.8rem', marginTop: 5 }}>
                      <FaTimes size={11} /> {t("dailyPricing.cityRequired")}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* ── Row 3: File Upload ──────────────────────────────── */}
            <Row className="mb-4">
              <Col xs={12} lg={11} xl={9}>
                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <FaFileExcel size={14} style={{ color: '#16a34a' }} />
                  {t("dailyPricing.uploadExcel")} <span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>
                </Form.Label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
                  {/* Custom file input */}
                  <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                    <label htmlFor="excel_file_input" style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      border: `2px dashed ${formData.excel_file ? '#16a34a' : '#e2e8f0'}`,
                      borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                      background: formData.excel_file ? 'rgba(22,163,74,0.04)' : '#fafbfc',
                      transition: 'all .2s', minHeight: 52,
                    }}>
                      {formData.excel_file ? (
                        <>
                          <FaCheckCircle size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {formData.excel_file?.name || t("dailyPricing.fileSelected")}
                          </span>
                        </>
                      ) : (
                        <>
                          <FaCloudUploadAlt size={22} style={{ color: '#a0aec0', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>{t("dailyPricing.chooseFile")}</span>
                        </>
                      )}
                    </label>
                    <Form.Control
                      id="excel_file_input"
                      ref={fileInputRef}
                      type="file"
                      name="excel_file"
                      onChange={handleFileChange}
                      required
                      accept=".xlsx,.xls"
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                    />
                    <Form.Control.Feedback type="invalid">{t("dailyPricing.fileRequired")}</Form.Control.Feedback>
                  </div>

                  {/* Sample Download */}
                  <button
                    type="button"
                    onClick={handleSampleDownload}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '0 22px', borderRadius: 12, border: '1.5px solid #e2e8f0',
                      background: '#fff', color: '#2d3748', fontWeight: 600, fontSize: '0.875rem',
                      cursor: 'pointer', whiteSpace: 'nowrap', height: 52,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'border-color .2s, box-shadow .2s, background .2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#2d3748'; }}
                  >
                    <FaDownload size={14} style={{ color: '#16a34a' }} />
                    {t("dailyPricing.sampleDownload")}
                  </button>
                </div>
                {formData.excel_file && (
                  <p style={{ margin: '6px 0 0 4px', fontSize: '0.78rem', color: '#718096' }}>
                    {t("dailyPricing.acceptedFormats")}
                  </p>
                )}
              </Col>
            </Row>

            {/* ── Divider ─────────────────────────────────────────── */}
            <div style={{ height: 1, background: '#f0f2f5', margin: '4px 0 28px' }} />

            {/* ── Submit ──────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '0 32px', height: 50, borderRadius: 12, border: 'none',
                  background: loading ? '#e2e8f0' : 'linear-gradient(135deg, var(--rf-orange) 0%, #b81f1d 100%)',
                  color: loading ? '#a0aec0' : '#fff', fontWeight: 700, fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 6px 18px rgba(218,40,38,0.35)',
                  transition: 'all .2s',
                }}
              >
                {loading ? (
                  <><Spinner size="sm" animation="border" /> {t("dailyPricing.uploading")}</>
                ) : (
                  <><FaCloudUploadAlt size={16} /> {t("dailyPricing.uploadPricing")}</>
                )}
              </button>
              <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{t("dailyPricing.requiredNote")} <span style={{ color: '#e53e3e' }}>*</span></span>
            </div>

          </Form>
        </div>
      </div>
    </div>
  )
}

export default Uploaddailypricing
