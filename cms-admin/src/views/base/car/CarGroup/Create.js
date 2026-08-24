import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import configWeb from "../../../../components/config.js/ConfigWeb";
import { notifyError, notifySuccess } from "../../../../components/notify/notify";
import { simpleGetCallAuth, simplePostCallAuth, simplePutCallAuth } from "../../../../components/config.js/Setup";

const Create = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  
  const navigate = useNavigate();
  const [editLoading, setEditLoading] = useState(id ? true : false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: "",
    name_en: "",
    name_ar: ""
  });

  const [errors, setErrors] = useState({});
  const [editorErrors, setEditorErrors] = useState({});

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if ((!formData[key] && formData[key] != "0") || (Array.isArray(formData[key]) && formData[key].length === 0)) {
        newErrors[key] = t("This field is required");
      }
    });
    console.log("newErrors-->", newErrors)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formSubmitFunction = () => {

    const body = JSON.stringify({
      name_en: formData?.name_en,
      name_ar: formData?.name_ar,
      status: parseInt(formData?.status)
    })

    const url = id ? configWeb.PUT_CAR_GROUP(id) : configWeb.POST_CAR_GROUP;
    setLoading(true);
    const apiCall = id ? simplePutCallAuth : simplePostCallAuth;
    apiCall(url, body)
      .then((res) => {
        if (res?.status === "success") {

          notifySuccess(id ? t("Updated Successfully") : t("Created Successfully"));
          navigate("/car/group");


        } else {
          if (Array.isArray(res?.message)) {
            notifyError(res?.message[0]);
          } else {
            notifyError(res?.message);
          }

        }
      })
      .catch((error) => {
        notifyError(t("Something went wrong. Please try again letter."));

      })
      .finally(() => {
        setLoading(false);
      });

  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    formSubmitFunction();

  };


  useEffect(() => {
    return () => {
    }
  }, [])

  const getDetails = () => {
    return new Promise((resolve, reject) => {
      const url = configWeb.GET_CAR_GROUP_DETAIL(id);
      simpleGetCallAuth(url)
        .then((res) => {
          if (res) {
            setFormData((prevData) => ({
              ...prevData,
              status: res?.status,
              name_en: res?.name_en,
              name_ar: res?.name_ar
            }));

            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          notifyError(t("Something went wrong. Please try again letter."));
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
  }, [id])

  return (
    <Container className="rf-form-page">
      <div className="rf-page-header">
        <div className="rf-page-heading">
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {id ? t("Edit") : t("Add")} {t("Car Group")}
          </h3>
          <p className="rf-page-sub">{t("Fill in the car group details below")}</p>
        </div>
        <Link to="/car/group">
          <Button className="rf-outline-btn">&#8592;&nbsp; {t("Car Group List")}</Button>
        </Link>
      </div>
      {editLoading ? (
        <div className="text-center">
          {" "}
          <Spinner />{" "}
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="rf-form-card">
          <Row>
            <Col sm={12} md={6} lg={4} xl={3} className="mb-3">
              <Form.Group>
                <Form.Label>{t("Status")}</Form.Label>
                <Form.Select name="status" value={formData?.status} onChange={handleChange}>
                  <option value="">{t("Select")}</option>
                  <option value="1">{t("Active")}</option>
                  <option value="0">{t("Inactive")}</option>
                </Form.Select>
                {errors.status && <span className="custom_error">{errors.status}</span>}
              </Form.Group>
            </Col>

            <Col sm={12} md={6} lg={4} xl={3} className="mb-3">
              <Form.Group>
                <Form.Label>{t("Car Group Name (English)")}</Form.Label>
                <Form.Control
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  isInvalid={!!errors.name_en}
                />
                {errors.name_en && <span className="custom_error">{errors.name_en}</span>}
              </Form.Group>
            </Col>
            <Col sm={12} md={6} lg={4} xl={3} className="mb-3">
              <Form.Group>
                <Form.Label>{t("Car Group Name (Arabic)")}</Form.Label>
                <Form.Control
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  isInvalid={!!errors.name_ar}
                />
                {errors.name_ar && <span className="custom_error">{errors.name_ar}</span>}
              </Form.Group>
            </Col>
          </Row>

          <div className="rf-form-actions">
            <Button type="submit" disabled={loading} className="rf-submit-btn"> {loading ? <Spinner size="sm" /> : t("Submit")}</Button>
          </div>
        </Form>
      )}
    </Container>

  )
}

export default Create