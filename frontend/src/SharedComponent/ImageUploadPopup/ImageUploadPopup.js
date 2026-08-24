import { useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { notifyError, notifySuccess } from "../notify";
import { multipartPostCall } from "../../config.js/SetUp";
import configWeb from "../../config.js/configWeb";
import "./documentUpload.css"
import { t } from "i18next";


const FileUpload = ({ pickup_type }) => {
  const [formData, setFormData] = useState({
    cities_id: null,
    driving_license: null,
    passport: null,
   
  });
  const [documentLoading, setDocumentLoading] = useState({
    cities_id: false,
    driving_license: false,
    passport: false,
   
  });
  const token = localStorage.getItem("token");
    const parse_token = token ? JSON.parse(token) : null;
    const user_id = parse_token ? parse_token.user_id : null;
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if ((!formData[key] && formData[key] != "0" ) || (Array.isArray(formData[key]) && formData[key].length === 0)) {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else  if ((name === 'cities_id' || name === "driving_license" || name === "passport" ) && files[0]) {
      const file = files[0]; // Only allow one file
      const img = new Image();
      img.src = URL.createObjectURL(file);
     
        if (true) {
  
   
      
      setFormData({
        ...formData,
        [name]: files[0],
      });
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    
  
  
  }
  
    
    } 
   
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };
  
  const handleUploadDocument = async (doc_type) => {
    
    console.log("submit", doc_type)
  setDocumentLoading((prevState)=>({
    ...prevState ,
    [doc_type] : true,
  }))
    // if (!validateForm()) return;
    const appendFormData = new FormData();
    appendFormData.append("doc_type", doc_type)
    appendFormData.append("user_id", user_id)
    appendFormData.append("front_image", formData[doc_type])
    console.log("fff->",formData[doc_type])
    const url=configWeb.POST_USER_DOCUMENTS
    multipartPostCall(url, appendFormData)
    .then((res) => {
      if (res?.status === "success") {
        
        notifySuccess(  "Uploaded Successfully");
       
      } else  {
        if(Array.isArray(res?.message)){
          notifyError(res?.message[0]);
        }else{
          notifyError(res?.message);
        }
       
      }
    })
    .catch((error) => {
   
      notifyError(t("Something went wrong, please try again later"));
     
    })
    .finally(() => {
      setDocumentLoading((prevState)=>({
        ...prevState ,
        [doc_type] : false,
      }))
    });
   
  };
  return (
    <section className="document-upload-section" style={{ marginTop: "0px", paddingBottom:"0px", paddingTop:"0px" }}>
                     
      <Row>
      <div className="success-description" > {pickup_type === 'self' ? t("To speed up the check-out process at the counter, Please upload your documents.") : t("To ensure timely delivery, Please upload your documents.") }</div>
     
      <Col sm={12} md={4} lg={4} className="mb-3">
      <Form className="upload-doc-form"  >
          <Form.Group>
          <Form.Label className="success-description">{t("National ID")}</Form.Label>
        <Form.Control
          type="file"
                    name="cities_id"
          accept=".pdf,image/*"
          
          onChange={handleChange}
          isInvalid={!!errors.cities_id}
        />
      
        {errors.cities_id && <span className="custom_error">{errors.cities_id}</span>}
      </Form.Group>
      </Form> 
      {documentLoading.cities_id ? (<div className="w-100 h-100 text-center mt-2 py-4-">
                                        <Spinner />
                                      </div> ) : ( <Button type="button" disabled={!formData.cities_id} onClick={()=>handleUploadDocument("cities_id")} className="button py-1 mt-2 px-3">{t("Upload")}</Button>)}
     
        </Col>
      <Col sm={12} md={4} lg={4} className="mb-3">
      <Form className="upload-doc-form" >
          <Form.Group>
          <Form.Label className="success-description">{t("Driving License")}</Form.Label>
        <Form.Control
          type="file"
          name="driving_license"
          accept=".pdf,image/*"
        
          onChange={handleChange}
          isInvalid={!!errors.driving_license}
        />
      
        {errors.driving_license && <span className="custom_error">{errors.driving_license}</span>}
      </Form.Group>
      </Form> 
      {documentLoading.driving_license ? (<div className="w-100 h-100 text-center mt-2 py-4-">
                                        <Spinner />
                                      </div> ) : (
      <Button type="button" disabled={!formData.driving_license} onClick={()=>handleUploadDocument("driving_license")} className="button py-1 mt-2 px-3">{t("Upload")}</Button>
                                      )} 
      </Col>
      
        <Col sm={12} md={4} lg={4} className="mb-3">
      <Form className="upload-doc-form" >
          <Form.Group>
          <Form.Label className="success-description">{t("Passport")} </Form.Label>
        <Form.Control
          type="file"
          name="passport"
          accept=".pdf,image/*"
        
          onChange={handleChange}
          isInvalid={!!errors.passport}
        />
      
        {errors.passport && <span className="custom_error">{errors.passport}</span>}
      </Form.Group>
      </Form> 
      {documentLoading.passport ? (<div className="w-100 h-100 text-center mt-2 py-4-">
                                        <Spinner />
                                      </div> ) : (
      <Button  type="button" disabled={!formData.passport} onClick={()=>handleUploadDocument("passport")}  className="button py-1 mt-2 px-3">{t("Upload")}</Button>
                                      )}
      </Col>
        </Row>
     
    
                      </section>
  );
};

export default FileUpload;
