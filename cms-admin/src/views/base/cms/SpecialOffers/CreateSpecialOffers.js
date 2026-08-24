import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CKEditorComponent from "../../../../components/CKEditor/CKEditor";
import configWeb from "../../../../components/config.js/ConfigWeb";
import { multipartPostCall, multipartPutWithAuthCall, simpleGetCallAuth } from "../../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../../components/notify/notify";

// Public site base URL (the customer-facing frontend), used to auto-open the
// live offer after saving. Falls back to the local dev frontend if unset.
const SITE_URL = process.env.REACT_APP_SITE_URL || "http://localhost:3031";

// Mirrors frontend/src/SharedComponent/reusableFunctions.js `slugify()` exactly,
// so the URL we build here matches the route the site actually resolves.
const slugify = (text) => {
  return text
    ?.toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const CreateSpecialOffers = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const imageFileServer = (process.env.REACT_APP_FILE_SERVER || "").replace(/\/*$/, "/");
  const navigate = useNavigate();
  const [editLoading, setEditLoading] = useState(id ? true : false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: "",
    featured: "",
    title_en: "",
    title_ar: "",
    title_fr: "",
    description_en: "",
    description_ar: "",
    description_fr: "",
    start_date: "",
    end_date: "",
    image_alt_text: "",
    city_id: "",
    mobile: "",
    desktop: "",

  });
  const [citiesArray, setCitiesArray] = useState([]);


  const [errors, setErrors] = useState({});
  const [editorErrors, setEditorErrors] = useState({});

  const handleChange = (e) => {

    const { name, value, type, checked, files } = e.target;

     if ((name === 'mobile' || name === "desktop") && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
     else {

      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if ((!formData[key] && formData[key] != "0" ) || (Array.isArray(formData[key]) && formData[key].length === 0)) {
        newErrors[key] = t("common.fieldRequired");
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Resolves the live public-site URL for the offer just saved (or falls
  // back to the offers list if we don't have an id/title to build a slug
  // from), in the language the admin is currently using.
  const resolveWebsiteUrl = (savedOffer) => {
    const adminLang = (localStorage.getItem("rf_admin_lang") || "en").toLowerCase();
    const siteLang = adminLang === "ar" ? "ar" : adminLang === "fr" ? "fr" : "en";

    const offerId = savedOffer?.id || savedOffer?.data?.id || id;
    const title = formData?.title_en;

    const path = offerId && title
      ? `/${siteLang}/offersdetails/${slugify(title)}/${offerId}`
      : `/${siteLang}/offerspage`;

    return `${SITE_URL}${path}`;
  };

  // Opens a blank tab SYNCHRONOUSLY (inside the click handler, before the
  // async save call) and redirects it once the save succeeds. Opening the
  // tab only after the API response comes back (i.e. from inside a .then())
  // can get silently popup-blocked, since the browser's "recent user
  // gesture" window can expire during the network round-trip.
  const formSubmitFunction = (previewTab) => {
    const appendFormData = new FormData();
    appendFormData.append("image_alt_text", formData?.image_alt_text)
    appendFormData.append("title_en", formData?.title_en)
    appendFormData.append("title_ar", formData?.title_ar)
    appendFormData.append("title_fr", formData?.title_fr)
    appendFormData.append("featured", formData?.featured)
    appendFormData.append("description_en", formData?.description_en)
    appendFormData.append("description_ar", formData?.description_ar)
    appendFormData.append("description_fr", formData?.description_fr)
    appendFormData.append("start_date", formData?.start_date)
    appendFormData.append("end_date", formData?.end_date)
    appendFormData.append("city_id", formData?.city_id)
    appendFormData.append("mobile", formData?.mobile)
    appendFormData.append("desktop", formData?.desktop)
    appendFormData.append("status", formData?.status)

    const url = id ? configWeb.PUT_SPECIAL_OFFER_UPDATE(id) : configWeb.POST_SPECIAL_OFFER_CREATE;
      setLoading(true);
        const apiCall = id ? multipartPutWithAuthCall : multipartPostCall;
        apiCall(url, appendFormData)
        .then((res) => {
          if (res?.status === "success") {

            notifySuccess( id ? t("common.updatedSuccessfully") : t("common.createdSuccessfully"));
            if (previewTab && !previewTab.closed) {
              previewTab.location.href = resolveWebsiteUrl(res);
            }
            navigate("/cms/special-offers");

          } else  {
            if (previewTab && !previewTab.closed) previewTab.close();
            if(Array.isArray(res?.message)){
              notifyError(res?.message[0]);
            }else{
              notifyError(res?.message);
            }

          }
        })
        .catch((error) => {
          // console.log("ERROR-->", error)
          if (previewTab && !previewTab.closed) previewTab.close();
          notifyError(t("common.somethingWentWrongTryAgain"));

        })
        .finally(() => {
          setLoading(false);
        });

  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Open the tab synchronously, in direct response to this click, so the
    // browser doesn't treat it as an unrequested popup once the async save
    // call resolves later. NOTE: deliberately no "noopener" here — we need
    // to keep the window handle to set its location once the save succeeds.
    // Safe because the destination is always our own site (SITE_URL), never
    // user-controlled input.
    const previewTab = window.open("", "_blank");
    if (previewTab) {
      previewTab.document.write(
        `<p style="font-family:Poppins,Arial,sans-serif;padding:24px;color:#0D1B2A">${t("specialOffer.savingOffer")}</p>`
      );
    }

    formSubmitFunction(previewTab);

  };


  const getDetails = () => {
    return new Promise((resolve, reject) => {
      const url = configWeb.GET_SPECIAL_OFFER_DETAILS(id);
      simpleGetCallAuth(url)
        .then((res) => {
          if (res) {
            setFormData((prevData) => ({
              ...prevData,
              status: res?.status,
              image_alt_text: res?.image_alt_text,
              featured: res?.featured,
              title_en: res?.title_en,
              title_ar: res?.title_ar,
              title_fr: res?.title_fr,
              description_en: res?.description_en,
              description_ar: res?.description_ar,
              description_fr: res?.description_fr,
              start_date: res?.start_date,
              end_date: res?.end_date,
              city_id: res?.city_id,
              mobile: res?.mobile,
              desktop: res?.desktop,
            }));


            resolve(true);
          } else if (res?.error) {
            notifyError(res?.message[0]);
          }
        })
        .catch((error) => {
          notifyError(t("common.somethingWentWrongTryAgain"));
          resolve(false);
        })
        .finally(() => {
          setEditLoading(false);
        });
    });
  };
useEffect(()=>{
if(id){
  getDetails();
}
},[id])

const citiesData = () => {
  const url = `${configWeb.GET_CITIES}?page_size=9999`;

  simpleGetCallAuth(url)
    .then((res) => {
      setCitiesArray(res?.data || []);
    })
    .catch((errr) => {
      console.log("errr", errr);
    })
    .finally(() => {
      // set_loading(false);
    });
};
useEffect(() => {
  citiesData();
}, []);

const handleEditorChange = (name, content) => {
  setFormData((prevData) => ({ ...prevData, [name]: content }));
  if (content) {
    setEditorErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  }

  if (content) {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  }
};
  return (
    <Container className="rf-form-page">
      <div className="rf-page-header">
        <div className="rf-page-heading">
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {id ? t("specialOffer.editTitle") : t("specialOffer.addTitle")}
          </h3>
          <p className="rf-page-sub">{t("specialOffer.subtitle")}</p>
        </div>
        <Link to="/cms/special-offers">
          <Button className="rf-outline-btn">&#8592;&nbsp; {t("specialOffer.offerListButton")}</Button>
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
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
          <Form.Group>
            <Form.Label>{t("common.status")}</Form.Label>
            <Form.Select name="status" value={formData?.status} onChange={handleChange}>
              <option value="">{t("common.select")}</option>
              <option value="1">{t("common.active")}</option>
              <option value="0">{t("common.inactive")}</option>
            </Form.Select>
            {errors.status && <span className="custom_error">{errors.status}</span>}
          </Form.Group>
        </Col>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
          <Form.Group>
            <Form.Label>{t("common.featured")}</Form.Label>
            <Form.Select name="featured" value={formData?.featured} onChange={handleChange}>
              <option value="">{t("common.select")}</option>
              <option value="1">{t("common.yes")}</option>
              <option value="0">{t("common.no")}</option>
            </Form.Select>
            {errors.featured && <span className="custom_error">{errors.featured}</span>}
          </Form.Group>
        </Col>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
          <Form.Group>
            <Form.Label>{t("specialOffer.titleEnglish")}</Form.Label>
            <Form.Control
                  type="text"
                  name="title_en"
                  value={formData.title_en}
                  onChange={handleChange}
                  isInvalid={!!errors.title_en}
                />
            {errors.title_en && <span className="custom_error">{errors.title_en}</span>}
          </Form.Group>
        </Col>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
          <Form.Group>
            <Form.Label>{t("specialOffer.titleArabic")}</Form.Label>
            <Form.Control
                  type="text"
                  name="title_ar"
                  value={formData.title_ar}
                  onChange={handleChange}
                  isInvalid={!!errors.title_ar}
                  dir="rtl"
                />
            {errors.title_ar && <span className="custom_error">{errors.title_ar}</span>}
          </Form.Group>
        </Col>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
          <Form.Group>
            <Form.Label>{t("specialOffer.titleFrench")}</Form.Label>
            <Form.Control
                  type="text"
                  name="title_fr"
                  value={formData.title_fr}
                  onChange={handleChange}
                  isInvalid={!!errors.title_fr}
                />
            {errors.title_fr && <span className="custom_error">{errors.title_fr}</span>}
          </Form.Group>
        </Col>

        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
          <Form.Group>
            <Form.Label>{t("common.imageAltText")}</Form.Label>
            <Form.Control
                  type="text"
                  name="image_alt_text"
                  value={formData.image_alt_text}
                  onChange={handleChange}
                  isInvalid={!!errors.image_alt_text}
                />
            {errors.image_alt_text && <span className="custom_error">{errors.image_alt_text}</span>}
          </Form.Group>
        </Col>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
        <Form.Group>
          <Form.Label >{t("common.startDate")}</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                id="start_date"

                value={formData.start_date}
                onChange={handleChange}
                  onMouseDown={(e) => e.target.showPicker()}

              />
                {errors.start_date && <span className="custom_error">{errors.start_date}</span>}
            </Form.Group>
        </Col>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
        <Form.Group>
          <Form.Label >{t("common.endDate")}</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                id="end_date"

                value={formData.end_date}
                onChange={handleChange}
                  onMouseDown={(e) => e.target.showPicker()}

              />
                {errors.end_date && <span className="custom_error">{errors.end_date}</span>}
            </Form.Group>
        </Col>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-4">
          <Form.Group>
          <Form.Label>{t("common.city")}</Form.Label>
                <Form.Select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  isInvalid={!!errors.city_id}
                >
                  <option value="">{t("common.selectCity")}</option>
                  {citiesArray?.length > 0 &&
                    citiesArray?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name_en}{" "}
                      </option>
                    ))}
                </Form.Select>
            {errors.city_id && <span className="custom_error">{errors.city_id}</span>}
          </Form.Group>
        </Col>
      </Row>

      <Row>
      <Col sm={12} md={6} lg={4} className="mb-4">
          <Form.Group>
          <Form.Label>{t("specialOffer.mobileOfferImage")}</Form.Label>
        <Form.Control
          type="file"
          name="mobile"
          accept="image/*"

          onChange={handleChange}
          isInvalid={!!errors.mobile}
        />
        {formData.mobile && (
          <div style={{ marginTop: '1rem' }}>
            <img
            src={
              formData.mobile instanceof File
                ? URL?.createObjectURL(formData.mobile) // Local preview
                : `${imageFileServer}admin/offer/${formData.mobile}` // Server URL
            }
              alt="Preview"
              style={{ width: '150px', height: 'auto' }}
            />
          </div>
        )}
        {errors.mobile && <span className="custom_error">{errors.mobile}</span>}
      </Form.Group>

        </Col>
      <Col sm={12} md={6} lg={4} className="mb-4">
          <Form.Group>
          <Form.Label>{t("specialOffer.desktopOfferImage")}</Form.Label>
        <Form.Control
          type="file"
          name="desktop"
          accept="image/*"
          onChange={handleChange}
          isInvalid={!!errors.desktop}
        />
        {formData.desktop && (
          <div style={{ marginTop: '1rem' }}>
            <img
              src={
                formData.desktop instanceof File
                  ? URL.createObjectURL(formData.desktop) // Local preview
                  : `${imageFileServer}admin/offer/${formData.desktop}` // Server URL
              }
              alt="Preview"
              style={{ width: '150px', height: 'auto' }}
            />
          </div>
        )}
        {errors.desktop && <span className="custom_error">{errors.desktop}</span>}
      </Form.Group>

        </Col>


      </Row>

      <Row>
        <Col>
          <Form.Group>
            <Form.Label>{t("specialOffer.descriptionEn")}</Form.Label>
            <CKEditorComponent
              language="en"
              onContentChange={(content) => handleEditorChange("description_en", content)}
              contentW={formData?.description_en}
            />
            {errors.description_en && <span className="custom_error">{errors.description_en}</span>}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col className="mt-3">
          <Form.Group>
            <Form.Label>{t("specialOffer.descriptionAr")}</Form.Label>
            <CKEditorComponent
              language="ar"
              onContentChange={(content) => handleEditorChange("description_ar", content)}
              contentW={formData?.description_ar}
            />
            {errors.description_ar && <span className="custom_error">{errors.description_ar}</span>}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col className="mt-3">
          <Form.Group>
            <Form.Label>{t("specialOffer.descriptionFr")}</Form.Label>
            <CKEditorComponent
              language="fr"
              onContentChange={(content) => handleEditorChange("description_fr", content)}
              contentW={formData?.description_fr}
            />
            {errors.description_fr && <span className="custom_error">{errors.description_fr}</span>}
          </Form.Group>
        </Col>
      </Row>

      <div className="rf-form-actions">
        <Button type="submit" disabled={loading} className="rf-submit-btn">
          {loading ? <Spinner size="sm" /> : ( id ? t("common.update") : t("common.submit"))}
        </Button>
      </div>
    </Form>
    )}

   </Container>

  )
}

export default CreateSpecialOffers
