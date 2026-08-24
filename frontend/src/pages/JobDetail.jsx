import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import {
  simpleGetCall,
  multipartPostCallWithoutAuth,
} from '../config.js/SetUp';
import configWeb from '../config.js/configWeb';
import { notifyError, notifySuccess } from '../SharedComponent/notify';
import MetaHelmet from '../components/Helmet/MetaHelmet';
import ScreeningQuestions, { validateScreeningAnswers, buildScreeningPayload } from '../components/Career/ScreeningQuestions';
import ShareJobModal from '../components/Career/ShareJobModal';
import '../styles/careersNew.css';

const DEFAULT_PHONE_CODE = '971';

const JobDetail = () => {
  const { t } = useTranslation();
  const { lang, id } = useParams();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.language);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Countries for phone code
  const [countries, setCountries] = useState([]);

  // Apply modal
  const [showApply, setShowApply] = useState(false);
  const [validated, setValidated] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const cvInputRef = useRef(null);
  const attachmentsInputRef = useRef(null);

  // Screening questions step
  const [applyStep, setApplyStep] = useState(2); // 1 = screening, 2 = applicant form
  const [screeningQuestions, setScreeningQuestions] = useState([]);
  const [screeningAnswers, setScreeningAnswers] = useState({});
  const [screeningErrors, setScreeningErrors] = useState({});
  const [questionnaireLoading, setQuestionnaireLoading] = useState(false);

  const [formState, setFormState] = useState({
    first_name: '',
    last_name: '',
    phone_code: DEFAULT_PHONE_CODE,
    phone_number: '',
    email: '',
    career_job_id: id,
    cv: null,
    attachments: [],
  });

  // Share modal
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getJobDetail();
    getCountriesData();
  }, [id, language]);

  const getJobDetail = () => {
    const url = configWeb.GET_CAREER_DETAIL(id) + '?lang=' + language;
    setLoading(true);
    setNotFound(false);
    simpleGetCall(url)
      .then((res) => {
        var jobData = res?.data || res;
        if (res?.error || !jobData || !jobData.id) {
          setNotFound(true);
        } else {
          setJob(jobData);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  };

  const getCountriesData = () => {
    const url = configWeb.GET_COUNTRY_LIST + '?lang=' + language + '&page_size=260';
    simpleGetCall(url)
      .then((res) => setCountries(res?.data || []))
      .catch((err) => console.error('Countries API failed:', err));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'attachments') {
        setFormState((prev) => ({ ...prev, attachments: Array.from(files) }));
      } else {
        setFormState((prev) => ({ ...prev, [name]: files[0] }));
      }
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeAttachment = (index) => {
    setFormState((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (formState.cv && formState.cv.size > 5 * 1024 * 1024) {
      notifyError(t('CV file must be under 5MB'));
      return;
    }

    for (const file of formState.attachments) {
      if (file.size > 5 * 1024 * 1024) {
        notifyError(t('Each attachment must be under 5MB'));
        return;
      }
    }

    const success = await postApplication();
    if (success) {
      setValidated(false);
      setShowApply(false);
    } else {
      setValidated(true);
    }
  };

  const postApplication = () => {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('first_name', formState.first_name);
      formData.append('last_name', formState.last_name);
      formData.append('phone_code', formState.phone_code);
      formData.append('phone_number', formState.phone_number);
      formData.append('email', formState.email);
      formData.append('career_job_id', id);
      formData.append('cv', formState.cv);
      formState.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      if (screeningQuestions.length > 0) {
        const payload = buildScreeningPayload(screeningQuestions, screeningAnswers);
        formData.append('screening_answers', JSON.stringify(payload.answersArray));
        Object.keys(payload.files).forEach((qid) => {
          formData.append('answer_file_' + qid, payload.files[qid]);
        });
      }

      setEnquiryLoading(true);
      multipartPostCallWithoutAuth(configWeb.POST_CAREER_JOB_APPLICATION, formData)
        .then((res) => {
          if (res?.status === 'success') {
            notifySuccess(t('Application submitted successfully!'));
            setFormState({
              first_name: '',
              last_name: '',
              phone_code: DEFAULT_PHONE_CODE,
              phone_number: '',
              email: '',
              career_job_id: id,
              cv: null,
              attachments: [],
            });
            if (cvInputRef.current) cvInputRef.current.value = '';
            if (attachmentsInputRef.current) attachmentsInputRef.current.value = '';
            setScreeningAnswers({});
            setScreeningErrors({});
            setScreeningQuestions([]);
            setApplyStep(2);
            resolve(true);
          } else if (res?.error) {
            const msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
            notifyError(msg || t('Something went wrong'));
            resolve(false);
          } else {
            resolve(false);
          }
        })
        .catch(() => {
          notifyError(t('Something went wrong, please try again later'));
          resolve(false);
        })
        .finally(() => {
          setEnquiryLoading(false);

        });
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOpenShare = () => {
    if (!job) return;
    setShowShare(true);
  };

  if (loading) {
    return (
      <div className="careers-loading">
        <Spinner animation="border" style={{ color: '#0D1B2A' }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="job-detail">
        <MetaHelmet title={t('Job Not Found')} />
        <div className="job-detail__not-found">
          <h2>{t('Job Not Found')}</h2>
          <p>{t('This position may have expired or been removed.')}</p>
          <Link to={'/' + (lang || language) + '/careerspage'}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t('Back to Careers')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail">
      <MetaHelmet
        title={(job?.title || t('Job Detail')) + ' — Carrières'}
        description={job?.description ? job.description.replace(/<[^>]+>/g, ' ').substring(0, 155) : ''}
        keywords="emploi Maroc, recrutement Route Facile, carrières location voiture"
        canonicalUrl={configWeb.BASE_WEB_URL + '/' + language + '/careerspage/' + id}
      />

      {/* Hero */}
      <div className="job-detail__hero">
        <div className="job-detail__hero-content">
          <Link
            to={'/' + (lang || language) + '/careerspage'}
            className="job-detail__back-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t('Back to Careers')}
          </Link>

          <h1 className="job-detail__title">{job?.title}</h1>

          <div className="job-detail__meta">
            <div className="job-detail__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {job?.location}
            </div>
            <div className="job-detail__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {job?.experience_years} {t('Years Experience')}
            </div>
            {job?.expiry_date && (
              <div className="job-detail__meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                {t('Apply before')} {formatDate(job.expiry_date)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="job-detail__body">
        <div className="job-detail__card">
          <div
            className="job-detail__description"
            dangerouslySetInnerHTML={{ __html: job?.description || '' }}
          />

          <div className="job-detail__actions">
            <button
              className="job-detail__apply-btn"
              onClick={() => {
                setValidated(false);
                setScreeningAnswers({});
                setScreeningErrors({});
                setScreeningQuestions([]);
                setApplyStep(2);
                setShowApply(true);
                setQuestionnaireLoading(true);
                simpleGetCall(configWeb.GET_CAREER_QUESTIONNAIRE(id))
                  .then((res) => {
                    // eslint-disable-next-line no-console
                    console.log('[Careers] Questionnaire response:', res);
                    let list = [];
                    if (Array.isArray(res?.data)) list = res.data;
                    else if (Array.isArray(res)) list = res;
                    else if (Array.isArray(res?.data?.data)) list = res.data.data;
                    else if (Array.isArray(res?.questions)) list = res.questions;
                    if (list.length > 0) {
                      setScreeningQuestions(list);
                      setApplyStep(1);
                    } else {
                      setApplyStep(2);
                    }
                  })
                  .catch((err) => {
                    console.warn('Questionnaire fetch failed, falling back to applicant form:', err);
                    setApplyStep(2);
                  })
                  .finally(() => setQuestionnaireLoading(false));
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              {t('Apply for this Position')}
            </button>
            <button className="job-detail__share-btn" onClick={handleOpenShare}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              {t('Share')}
            </button>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Modal show={showApply} onHide={() => setShowApply(false)} centered scrollable size="lg" className="career-apply-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {applyStep === 1 ? t('Quick Screening Questions') : (t('Apply for') + ' ' + (job?.title || ''))}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {screeningQuestions.length > 0 && (
            <div className="sq-stepper" style={{ ['--progress']: applyStep === 1 ? '0%' : '100%' }}>
              <span className={'sq-stepper__item' + (applyStep === 1 ? ' active' : '')}>
                <span className="sq-stepper__num">1</span>
                {t('Screening')}
              </span>
              <span className="sq-stepper__line" />
              <span className={'sq-stepper__item' + (applyStep === 2 ? ' active' : '')}>
                <span className="sq-stepper__num">2</span>
                {t('Your Details')}
              </span>
            </div>
          )}

          {questionnaireLoading && (
            <div className="text-center py-4"><Spinner animation="border" style={{ color: '#0D1B2A' }} /></div>
          )}

          {!questionnaireLoading && applyStep === 1 && screeningQuestions.length > 0 && (
            <>
              <ScreeningQuestions
                questions={screeningQuestions}
                answers={screeningAnswers}
                errors={screeningErrors}
                onChange={setScreeningAnswers}
              />
              <div className="sq-actions">
                <button type="button" className="sq-btn sq-btn--ghost" onClick={() => setShowApply(false)}>
                  {t('Cancel')}
                </button>
                <button
                  type="button"
                  className="sq-btn sq-btn--primary"
                  onClick={() => {
                    const errs = validateScreeningAnswers(screeningQuestions, screeningAnswers, t);
                    setScreeningErrors(errs);
                    if (Object.keys(errs).length > 0) {
                      const firstId = Object.keys(errs)[0];
                      const el = document.getElementById('sq_field_' + firstId);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      return;
                    }
                    setApplyStep(2);
                  }}
                >
                  {t('Continue')}
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {!questionnaireLoading && applyStep === 2 && (
          <Form noValidate validated={validated} onSubmit={handleSubmit} className="career-apply-form">
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="apply_first_name">
                  <Form.Label>{t('First Name')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="first_name"
                    value={formState.first_name}
                    onChange={handleChange}
                    placeholder={t('Enter your first name')}
                    autoComplete="given-name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {t('Please enter your first name')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="apply_last_name">
                  <Form.Label>{t('Last Name')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="last_name"
                    value={formState.last_name}
                    onChange={handleChange}
                    placeholder={t('Enter your last name')}
                    autoComplete="family-name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {t('Please enter your last name')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group controlId="apply_email">
                  <Form.Label>{t('Email')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder={t('Enter your email')}
                    autoComplete="email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {t('Please enter a valid email')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="apply_phone_code">
                  <Form.Label>{t('Phone Code')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="phone_code"
                    value={formState.phone_code}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('Code')}</option>
                    {countries?.map((country) => (
                      <option key={country.id} value={country.phone_code}>
                        {country.code} {country.phone_code}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {t('Please select phone code')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={8} className="mb-3">
                <Form.Group controlId="apply_phone_number">
                  <Form.Label>{t('Phone Number')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    required
                    type="tel"
                    name="phone_number"
                    value={formState.phone_number}
                    onChange={handleChange}
                    placeholder={t('Enter phone number')}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{6,10}"
                    autoComplete="tel-national"
                  />
                  <Form.Control.Feedback type="invalid">
                    {t('Please enter a valid phone number')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group controlId="apply_cv">
                  <Form.Label>{t('Upload CV')} <span className="text-danger">*</span></Form.Label>
                  <div
                    className={'career-apply-form__file-zone' + (formState.cv ? ' has-file' : '')}
                    onClick={() => cvInputRef.current?.click()}
                  >
                    {formState.cv ? (
                      <div className="career-apply-form__file-name">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {formState.cv.name}
                        <button
                          type="button"
                          className="career-apply-form__file-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormState((prev) => ({ ...prev, cv: null }));
                            if (cvInputRef.current) cvInputRef.current.value = '';
                          }}
                        >
                          {t('Remove')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="career-apply-form__file-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                          </svg>
                        </div>
                        <div className="career-apply-form__file-text">
                          <strong>{t('Click to upload')}</strong> {t('your CV')}
                        </div>
                        <div className="career-apply-form__file-hint">
                          PDF, DOC, DOCX, JPG, PNG — {t('Max')} 5MB
                        </div>
                      </>
                    )}
                  </div>
                  <Form.Control
                    ref={cvInputRef}
                    type="file"
                    name="cv"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                    style={{ display: 'none' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t('Please upload your CV')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group controlId="apply_attachments">
                  <Form.Label>{t('Additional Attachments')} <span className="text-muted">({t('Optional')})</span></Form.Label>
                  <Form.Control
                    ref={attachmentsInputRef}
                    type="file"
                    name="attachments"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                  />
                  <Form.Text className="text-muted">
                    {t('PDF, DOC, DOCX, JPG, PNG — Max 5MB each')}
                  </Form.Text>
                  {formState.attachments.length > 0 && (
                    <div className="career-apply-form__attachments-list">
                      {formState.attachments.map((file, idx) => (
                        <div key={idx} className="career-apply-form__attachment-chip">
                          {file.name}
                          <button type="button" onClick={() => removeAttachment(idx)}>&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col xs={12} className="mt-2">
                <div className="career-apply-form__actions">
                  {screeningQuestions.length > 0 && (
                    <button
                      type="button"
                      className="sq-btn sq-btn--ghost"
                      onClick={() => setApplyStep(1)}
                      disabled={enquiryLoading}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                      </svg>
                      {t('Back')}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="career-apply-form__submit-btn"
                    disabled={enquiryLoading}
                  >
                    {enquiryLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                        {t('Submit Application')}
                      </>
                    )}
                  </button>
                </div>
              </Col>
            </Row>
          </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Share Modal */}
      <ShareJobModal
        show={showShare}
        onHide={() => setShowShare(false)}
        job={job}
        lang={lang || language}
      />
    </div>
  );
};

export default JobDetail;
