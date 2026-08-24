import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CKEditorComponent from "../../../components/CKEditor/CKEditor";
import configWeb from "../../../components/config.js/ConfigWeb";
import {
  multipartPostCall,
  multipartPutWithAuthCall,
  simpleGetCallAuth,
} from "../../../components/config.js/Setup";
import { notifyError, notifySuccess } from "../../../components/notify/notify";

const CreatePost = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const imageFileServer = (process.env.REACT_APP_FILE_SERVER || "").replace(/\/*$/, "/");

  const [editLoading, setEditLoading] = useState(id ? true : false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "other",
    status: "0",
    featured: "0",
    title_en: "",
    title_ar: "",
    title_fr: "",
    description_en: "",
    description_ar: "",
    description_fr: "",
    excerpt_en: "",
    excerpt_ar: "",
    excerpt_fr: "",
    slug: "",
    author: "",
    publish_date: "",
    image: "",
    image_alt: "",
    image_caption: "",
    seo_meta_tags_en: "",
    seo_meta_tags_ar: "",
    seo_meta_tags_fr: "",
    seo_meta_description_en: "",
    seo_meta_description_ar: "",
    seo_meta_description_fr: "",
  });

  // Kept out of formData: BlogDto requires each as a non-empty array, which
  // doesn't fit the generic "every key required" loop validateForm() runs
  // over formData — these get their own explicit check in validateForm().
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.[0]) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setErrors((prev) => ({ ...prev, image: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditorChange = (name, content) => {
    setFormData((prev) => ({ ...prev, [name]: content }));
    if (content) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleCheckbox = (list, setList, checkboxId) => {
    setList((prev) =>
      prev.includes(checkboxId)
        ? prev.filter((existing) => existing !== checkboxId)
        : [...prev, checkboxId]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    // Optional on this form even though a few (title_fr, excerpt_*, seo_*)
    // are genuinely optional in the DTO, and image is only required on
    // create — an existing image stays unless a new one is chosen.
    const optionalFields = [
      "title_fr",
      "description_fr",
      "excerpt_en",
      "excerpt_ar",
      "excerpt_fr",
      "slug",
      "author",
      "publish_date",
      "image_alt",
      "image_caption",
      "seo_meta_tags_en",
      "seo_meta_tags_ar",
      "seo_meta_tags_fr",
      "seo_meta_description_en",
      "seo_meta_description_ar",
      "seo_meta_description_fr",
    ];

    Object.keys(formData).forEach((key) => {
      if (optionalFields.includes(key)) return;
      if (key === "image") {
        if (!id && !formData.image) newErrors.image = t("common.fieldRequired");
        return;
      }
      if (!formData[key] && formData[key] !== "0") {
        newErrors[key] = t("common.fieldRequired");
      }
    });

    if (selectedCategoryIds.length === 0) {
      newErrors.category_ids = t("blog.selectAtLeastOneCategory");
    }
    if (selectedTagIds.length === 0) {
      newErrors.tag_ids = t("blog.selectAtLeastOneTag");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formSubmitFunction = () => {
    const appendFormData = new FormData();
    appendFormData.append("type", formData.type);
    appendFormData.append("status", formData.status);
    appendFormData.append("featured", formData.featured);
    appendFormData.append("title_en", formData.title_en);
    appendFormData.append("title_ar", formData.title_ar);
    appendFormData.append("title_fr", formData.title_fr || "");
    appendFormData.append("description_en", formData.description_en);
    appendFormData.append("description_ar", formData.description_ar);
    appendFormData.append("description_fr", formData.description_fr || "");
    appendFormData.append("excerpt_en", formData.excerpt_en || "");
    appendFormData.append("excerpt_ar", formData.excerpt_ar || "");
    appendFormData.append("excerpt_fr", formData.excerpt_fr || "");
    appendFormData.append("slug", formData.slug || "");
    appendFormData.append("author", formData.author || "");
    appendFormData.append("publish_date", formData.publish_date || "");
    appendFormData.append("image_alt", formData.image_alt || "");
    appendFormData.append("image_caption", formData.image_caption || "");
    appendFormData.append("seo_meta_tags_en", formData.seo_meta_tags_en || "");
    appendFormData.append("seo_meta_tags_ar", formData.seo_meta_tags_ar || "");
    appendFormData.append("seo_meta_tags_fr", formData.seo_meta_tags_fr || "");
    appendFormData.append("seo_meta_description_en", formData.seo_meta_description_en || "");
    appendFormData.append("seo_meta_description_ar", formData.seo_meta_description_ar || "");
    appendFormData.append("seo_meta_description_fr", formData.seo_meta_description_fr || "");
    if (formData.image instanceof File) {
      appendFormData.append("image", formData.image);
    }
    // Repeating the same field name is how a browser FormData/multer body
    // carries an array — matches the DTO's tag_ids/category_ids: number[].
    selectedCategoryIds.forEach((catId) => appendFormData.append("category_ids", catId));
    selectedTagIds.forEach((tagId) => appendFormData.append("tag_ids", tagId));

    const url = id ? configWeb.PUT_BLOG_UPDATE(id) : configWeb.POST_BLOG_CREATE;
    const apiCall = id ? multipartPutWithAuthCall : multipartPostCall;

    setLoading(true);
    apiCall(url, appendFormData)
      .then((res) => {
        if (res?.id || res?.status === "success") {
          notifySuccess(id ? t("common.updatedSuccessfully") : t("common.createdSuccessfully"));
          navigate("/blog/post");
        } else {
          const detail = Array.isArray(res?.message) ? res.message[0] : res?.message;
          notifyError(detail || t("common.somethingWentWrongTryAgain"));
        }
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrongTryAgain"));
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

  const getDetails = () => {
    const url = configWeb.GET_BLOG_DETAILS(id);
    simpleGetCallAuth(url)
      .then((res) => {
        if (res && !res?.error) {
          setFormData((prev) => ({
            ...prev,
            type: res?.type || "other",
            status: String(res?.status ?? "0"),
            featured: String(res?.featured ?? "0"),
            title_en: res?.title_en || "",
            title_ar: res?.title_ar || "",
            title_fr: res?.title_fr || "",
            description_en: res?.description_en || "",
            description_ar: res?.description_ar || "",
            description_fr: res?.description_fr || "",
            excerpt_en: res?.excerpt_en || "",
            excerpt_ar: res?.excerpt_ar || "",
            excerpt_fr: res?.excerpt_fr || "",
            slug: res?.slug || "",
            author: res?.author || "",
            publish_date: res?.publish_date || "",
            image: res?.image || "",
            image_alt: res?.image_alt || "",
            image_caption: res?.image_caption || "",
            seo_meta_tags_en: res?.seo_meta_tags_en || "",
            seo_meta_tags_ar: res?.seo_meta_tags_ar || "",
            seo_meta_tags_fr: res?.seo_meta_tags_fr || "",
            seo_meta_description_en: res?.seo_meta_description_en || "",
            seo_meta_description_ar: res?.seo_meta_description_ar || "",
            seo_meta_description_fr: res?.seo_meta_description_fr || "",
          }));
          setSelectedCategoryIds((res?.categories || []).map((c) => c.id));
          setSelectedTagIds((res?.tags || []).map((tg) => tg.id));
        } else {
          notifyError(t("common.somethingWentWrongTryAgain"));
        }
      })
      .catch(() => {
        notifyError(t("common.somethingWentWrongTryAgain"));
      })
      .finally(() => {
        setEditLoading(false);
      });
  };

  useEffect(() => {
    if (id) getDetails();
  }, [id]);

  useEffect(() => {
    simpleGetCallAuth(configWeb.GET_BLOG_CATEGORY_LIST)
      .then((res) => setCategoryOptions(res?.data || []))
      .catch(() => setCategoryOptions([]));
    simpleGetCallAuth(configWeb.GET_BLOG_TAG_LIST)
      .then((res) => setTagOptions(res?.data || []))
      .catch(() => setTagOptions([]));
  }, []);

  return (
    <Container className="rf-form-page">
      <div className="rf-page-header">
        <div className="rf-page-heading">
          <h3 className="rf-page-title">
            <span className="rf-title-bar" /> {id ? t("blog.editTitle") : t("blog.addTitle")}
          </h3>
          <p className="rf-page-sub">{t("blog.subtitle")}</p>
        </div>
        <Link to="/blog/post">
          <Button className="rf-outline-btn">&#8592;&nbsp; {t("blog.listButton")}</Button>
        </Link>
      </div>

      {editLoading ? (
        <div className="text-center">
          <Spinner />
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="rf-form-card">
          <Row>
            <Col sm={12} md={6} lg={3} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.type")}</Form.Label>
                <Form.Select name="type" value={formData.type} onChange={handleChange}>
                  <option value="other">{t("common.other") || "Other"}</option>
                  <option value="about_morocco">Morocco</option>
                </Form.Select>
                {errors.type && <span className="custom_error">{errors.type}</span>}
              </Form.Group>
            </Col>
            <Col sm={12} md={6} lg={3} className="mb-4">
              <Form.Group>
                <Form.Label>{t("common.status")}</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="1">{t("blog.published")}</option>
                  <option value="0">{t("blog.draft")}</option>
                </Form.Select>
                {errors.status && <span className="custom_error">{errors.status}</span>}
              </Form.Group>
            </Col>
            <Col sm={12} md={6} lg={3} className="mb-4">
              <Form.Group>
                <Form.Label>{t("common.featured")}</Form.Label>
                <Form.Select name="featured" value={formData.featured} onChange={handleChange}>
                  <option value="1">{t("common.yes")}</option>
                  <option value="0">{t("common.no")}</option>
                </Form.Select>
                {errors.featured && <span className="custom_error">{errors.featured}</span>}
              </Form.Group>
            </Col>
            <Col sm={12} md={6} lg={3} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.publishDate")}</Form.Label>
                <Form.Control
                  type="date"
                  name="publish_date"
                  value={formData.publish_date}
                  onChange={handleChange}
                  onMouseDown={(e) => e.target.showPicker?.()}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={6} lg={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.titleEnglish")}</Form.Label>
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
            <Col sm={12} md={6} lg={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.titleArabic")}</Form.Label>
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
            <Col sm={12} md={6} lg={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.titleFrench")}</Form.Label>
                <Form.Control
                  type="text"
                  name="title_fr"
                  value={formData.title_fr}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={6} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.slug")}</Form.Label>
                <Form.Control
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder={t("blog.slugHint")}
                />
              </Form.Group>
            </Col>
            <Col sm={12} md={6} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.author")}</Form.Label>
                <Form.Control
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={6} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.categories")}</Form.Label>
                <div className="rf-checkbox-group">
                  {categoryOptions.map((cat) => (
                    <Form.Check
                      key={cat.id}
                      type="checkbox"
                      id={`category-${cat.id}`}
                      label={cat.name_en}
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() => toggleCheckbox(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                    />
                  ))}
                </div>
                {errors.category_ids && <span className="custom_error">{errors.category_ids}</span>}
              </Form.Group>
            </Col>
            <Col sm={12} md={6} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.tags")}</Form.Label>
                <div className="rf-checkbox-group">
                  {tagOptions.map((tag) => (
                    <Form.Check
                      key={tag.id}
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      label={tag.name_en}
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleCheckbox(selectedTagIds, setSelectedTagIds, tag.id)}
                    />
                  ))}
                </div>
                {errors.tag_ids && <span className="custom_error">{errors.tag_ids}</span>}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={6} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.image")}</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  isInvalid={!!errors.image}
                />
                {formData.image && (
                  <div style={{ marginTop: "1rem" }}>
                    <img
                      src={
                        formData.image instanceof File
                          ? URL.createObjectURL(formData.image)
                          : `${imageFileServer}admin/blog/${formData.image}`
                      }
                      alt="Preview"
                      style={{ width: "150px", height: "auto" }}
                    />
                  </div>
                )}
                {errors.image && <span className="custom_error">{errors.image}</span>}
              </Form.Group>
            </Col>
            <Col sm={12} md={3} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.imageAlt")}</Form.Label>
                <Form.Control
                  type="text"
                  name="image_alt"
                  value={formData.image_alt}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col sm={12} md={3} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.imageCaption")}</Form.Label>
                <Form.Control
                  type="text"
                  name="image_caption"
                  value={formData.image_caption}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.excerptEn")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="excerpt_en"
                  value={formData.excerpt_en}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.excerptAr")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="excerpt_ar"
                  value={formData.excerpt_ar}
                  onChange={handleChange}
                  dir="rtl"
                />
              </Form.Group>
            </Col>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.excerptFr")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="excerpt_fr"
                  value={formData.excerpt_fr}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>{t("blog.descriptionEn")}</Form.Label>
                <CKEditorComponent
                  language="en"
                  onContentChange={(content) => handleEditorChange("description_en", content)}
                  contentW={formData.description_en}
                />
                {errors.description_en && <span className="custom_error">{errors.description_en}</span>}
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col className="mt-3">
              <Form.Group>
                <Form.Label>{t("blog.descriptionAr")}</Form.Label>
                <CKEditorComponent
                  language="ar"
                  onContentChange={(content) => handleEditorChange("description_ar", content)}
                  contentW={formData.description_ar}
                />
                {errors.description_ar && <span className="custom_error">{errors.description_ar}</span>}
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col className="mt-3">
              <Form.Group>
                <Form.Label>{t("blog.descriptionFr")}</Form.Label>
                <CKEditorComponent
                  language="fr"
                  onContentChange={(content) => handleEditorChange("description_fr", content)}
                  contentW={formData.description_fr}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.seoTagsEn")}</Form.Label>
                <Form.Control type="text" name="seo_meta_tags_en" value={formData.seo_meta_tags_en} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.seoTagsAr")}</Form.Label>
                <Form.Control type="text" name="seo_meta_tags_ar" value={formData.seo_meta_tags_ar} onChange={handleChange} dir="rtl" />
              </Form.Group>
            </Col>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.seoTagsFr")}</Form.Label>
                <Form.Control type="text" name="seo_meta_tags_fr" value={formData.seo_meta_tags_fr} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.seoDescEn")}</Form.Label>
                <Form.Control as="textarea" rows={2} name="seo_meta_description_en" value={formData.seo_meta_description_en} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.seoDescAr")}</Form.Label>
                <Form.Control as="textarea" rows={2} name="seo_meta_description_ar" value={formData.seo_meta_description_ar} onChange={handleChange} dir="rtl" />
              </Form.Group>
            </Col>
            <Col sm={12} md={4} className="mb-4">
              <Form.Group>
                <Form.Label>{t("blog.seoDescFr")}</Form.Label>
                <Form.Control as="textarea" rows={2} name="seo_meta_description_fr" value={formData.seo_meta_description_fr} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <div className="rf-form-actions">
            <Button type="submit" disabled={loading} className="rf-submit-btn">
              {loading ? <Spinner size="sm" /> : id ? t("common.update") : t("common.submit")}
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default CreatePost;
