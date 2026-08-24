import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import whatsIcon from '../assets/all-images/icons8-whatsapp.svg';
import careersImg from '../assets/all-images/careers.jpg';
import ScreeningQuestions, { validateScreeningAnswers, buildScreeningPayload } from '../components/Career/ScreeningQuestions';
import ShareJobModal from '../components/Career/ShareJobModal';
import '../styles/careersNew.css';

const DEFAULT_PHONE_CODE = '971';

const CareersPage = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const language = useSelector((state) => state.language.language);

  const [careerList, setCareerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);

  // Apply modal
  const [showApply, setShowApply] = useState(false);
  const [validated, setValidated] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const cvInputRef = useRef(null);
  const attachmentsInputRef = useRef(null);
  const jobsSectionRef = useRef(null);

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
    career_job_id: null,
    cv: null,
    attachments: [],
  });

  // Jobs visibility
  const [showJobs, setShowJobs] = useState(false);

  // Share modal
  const [showShare, setShowShare] = useState(false);
  const [shareJob, setShareJob] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getCareerList();
    getCountriesData();
  }, [language]);

  const getCareerList = () => {
    var url = configWeb.GET_CAREER_LIST + '?lang=' + language + '&page=1&page_size=9999999';
    setLoading(true);
    simpleGetCall(url)
      .then(function (res) {
        if (!res?.error) {
          setCareerList(res?.data || []);
        }
      })
      .catch(function (error) {
        console.error('Careers API failed:', error);
      })
      .finally(function () {
        setLoading(false);
      });
  };

  const getCountriesData = () => {
    var url = configWeb.GET_COUNTRY_LIST + '?lang=' + language + '&page_size=260';
    simpleGetCall(url)
      .then(function (res) {
        setCountries(res?.data || []);
      })
      .catch(function (err) {
        console.error('Countries API failed:', err);
      });
  };

  const handleOpenApply = (jobId) => {
    setFormState(function (prev) {
      return Object.assign({}, prev, { career_job_id: jobId });
    });
    setValidated(false);
    setScreeningAnswers({});
    setScreeningErrors({});
    setScreeningQuestions([]);
    setApplyStep(2);
    setShowApply(true);
    fetchQuestionnaire(jobId);
  };

  const fetchQuestionnaire = (jobId) => {
    setQuestionnaireLoading(true);
    simpleGetCall(configWeb.GET_CAREER_QUESTIONNAIRE(jobId))
      .then(function (res) {
        // eslint-disable-next-line no-console
        console.log('[Careers] Questionnaire response:', res);
        var list = [];
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
      .catch(function (err) {
        console.warn('Questionnaire fetch failed, falling back to applicant form:', err);
        setApplyStep(2);
      })
      .finally(function () {
        setQuestionnaireLoading(false);
      });
  };

  const handleScreeningNext = () => {
    var errs = validateScreeningAnswers(screeningQuestions, screeningAnswers, t);
    setScreeningErrors(errs);
    if (Object.keys(errs).length > 0) {
      var firstId = Object.keys(errs)[0];
      var el = document.getElementById('sq_field_' + firstId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setApplyStep(2);
  };

  const handleOpenShare = (career) => {
    setShareJob(career);
    setShowShare(true);
  };

  const handleChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    var type = e.target.type;
    var files = e.target.files;
    if (type === 'file') {
      if (name === 'attachments') {
        setFormState(function (prev) {
          return Object.assign({}, prev, { attachments: Array.from(files) });
        });
      } else {
        setFormState(function (prev) {
          var update = {};
          update[name] = files[0];
          return Object.assign({}, prev, update);
        });
      }
    } else {
      setFormState(function (prev) {
        var update = {};
        update[name] = value;
        return Object.assign({}, prev, update);
      });
    }
  };

  const removeAttachment = (index) => {
    setFormState(function (prev) {
      return Object.assign({}, prev, {
        attachments: prev.attachments.filter(function (_, i) { return i !== index; }),
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    var form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (formState.cv && formState.cv.size > 5 * 1024 * 1024) {
      notifyError(t('CV file must be under 5MB'));
      return;
    }

    for (var i = 0; i < formState.attachments.length; i++) {
      if (formState.attachments[i].size > 5 * 1024 * 1024) {
        notifyError(t('Each attachment must be under 5MB'));
        return;
      }
    }

    var success = await postApplication();
    if (success) {
      setValidated(false);
      setShowApply(false);
    } else {
      setValidated(true);
    }
  };

  const postApplication = () => {
    return new Promise(function (resolve) {
      var formData = new FormData();
      formData.append('first_name', formState.first_name);
      formData.append('last_name', formState.last_name);
      formData.append('phone_code', formState.phone_code);
      formData.append('phone_number', formState.phone_number);
      formData.append('email', formState.email);
      formData.append('career_job_id', formState.career_job_id);
      formData.append('cv', formState.cv);
      formState.attachments.forEach(function (file) {
        formData.append('attachments', file);
      });

      if (screeningQuestions.length > 0) {
        var payload = buildScreeningPayload(screeningQuestions, screeningAnswers);
        formData.append('screening_answers', JSON.stringify(payload.answersArray));
        Object.keys(payload.files).forEach(function (qid) {
          formData.append('answer_file_' + qid, payload.files[qid]);
        });
      }

      setEnquiryLoading(true);
      multipartPostCallWithoutAuth(configWeb.POST_CAREER_JOB_APPLICATION, formData)
        .then(function (res) {
          if (res?.status === 'success') {
            notifySuccess(t('Application submitted successfully!'));
            setFormState({
              first_name: '',
              last_name: '',
              phone_code: DEFAULT_PHONE_CODE,
              phone_number: '',
              email: '',
              career_job_id: null,
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
            var msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
            notifyError(msg || t('Something went wrong'));
            resolve(false);
          } else {
            resolve(false);
          }
        })
        .catch(function () {
          notifyError(t('Something went wrong, please try again later'));
          resolve(false);
        })
        .finally(function () {
          setEnquiryLoading(false);

        });
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    var date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="careers-loading">
        <Spinner animation="border" style={{ color: '#0D1B2A' }} />
      </div>
    );
  }

  return (
    <>
      <MetaHelmet
        title={t('Careers') + ' au Maroc'}
        description="Rejoignez l'équipe Route Facile. Découvrez nos offres d'emploi dans la location de voitures au Maroc. Postulez maintenant."
        keywords="emploi Maroc, recrutement location voiture, carrières Route Facile, jobs Casablanca"
        canonicalUrl={configWeb.BASE_WEB_URL + '/' + language + '/careerspage'}
      />

      {/* Full Page with Background Image */}
      <section className="careers-page" style={{ backgroundImage: 'url(' + careersImg + ')' }}>
        <div className="careers-page__overlay"></div>

        {/* Hero Content */}
        <div className="careers-hero">
          <div className="careers-hero__content">
            <p className="careers-hero__pretitle">{t('We Are')}</p>
            <h1 className="careers-hero__title">{t('HIRING')}</h1>
            <p className="careers-hero__subtitle">{t('Join the Team That Powers Every Journey')}</p>
            <button
              type="button"
              className="careers-hero__cta"
              onClick={function () {
                setShowJobs(true);
                setTimeout(function () {
                  if (jobsSectionRef.current) {
                    jobsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
            >
              {t('View Open Positions')}
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className={'careers-jobs' + (showJobs ? ' careers-jobs--visible' : '')} ref={jobsSectionRef}>
          {careerList.length > 0 && (
            <>
              <h2 className="careers-jobs__heading">{t('Open Positions')}</h2>
              <p className="careers-jobs__subheading">
                {careerList.length} {careerList.length === 1 ? t('opportunity available') : t('opportunities available')}
              </p>
            </>
          )}
          {careerList.length === 0 ? (
            <div className="careers-empty">
              <div className="careers-empty__icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3>{t('No Vacancies Right Now')}</h3>
              <p>{t("We don't have any open positions at the moment. Please check back soon!")}</p>
            </div>
          ) : (
            <div className="careers-grid">
              {careerList.map(function (career) {
                return (
                  <div className="career-card" key={career.id}>
                    <div className="career-card__top">
                      <h3 className="career-card__title">
                        <Link to={'/' + (lang || language) + '/careerspage/' + career.id}>
                          {career.title}
                        </Link>
                      </h3>
                      <button
                        className="career-card__share-btn"
                        onClick={function () { handleOpenShare(career); }}
                        title={t('Share')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                        </svg>
                      </button>
                    </div>

                    <div className="career-card__divider"></div>

                    <div className="career-card__meta">
                      <div className="career-card__meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span>{career.location}</span>
                      </div>
                      <div className="career-card__meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        <span>{career.experience_years} {t('years of experience')}</span>
                      </div>
                      <div className="career-card__meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                        <span>{career.department || t('Department')}</span>
                      </div>
                      <div className="career-card__meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span>{career.job_type || t('Full Time')}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="career-card__apply-btn"
                      onClick={function () { handleOpenApply(career.id); }}
                    >
                      {t('Apply')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Apply Modal */}
      <Modal show={showApply} onHide={function () { setShowApply(false); }} centered scrollable size="lg" className="career-apply-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {applyStep === 1 ? t('Quick Screening Questions') : t('Apply Now')}
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
                <button type="button" className="sq-btn sq-btn--ghost" onClick={function () { setShowApply(false); }}>
                  {t('Cancel')}
                </button>
                <button type="button" className="sq-btn sq-btn--primary" onClick={handleScreeningNext}>
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
                  <Form.Label>{t('First Name')} <span className="text-danger"> *</span></Form.Label>
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
                  <Form.Label>{t('Last Name')} <span className="text-danger"> *</span></Form.Label>
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
                  <Form.Label>{t('Email')} <span className="text-danger"> *</span></Form.Label>
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
                  <Form.Label>{t('Phone Code')} <span className="text-danger"> *</span></Form.Label>
                  <Form.Select
                    name="phone_code"
                    value={formState.phone_code}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('Code')}</option>
                    {countries?.map(function (country) {
                      return (
                        <option key={country.id} value={country.phone_code}>
                          {country.code} {country.phone_code}
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {t('Please select phone code')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={8} className="mb-3">
                <Form.Group controlId="apply_phone_number">
                  <Form.Label>{t('Phone Number')} <span className="text-danger"> *</span></Form.Label>
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
                  <Form.Label>{t('Upload CV')} <span className="text-danger"> *</span></Form.Label>
                  <div
                    className={'career-apply-form__file-zone' + (formState.cv ? ' has-file' : '')}
                    onClick={function () { if (cvInputRef.current) cvInputRef.current.click(); }}
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
                          onClick={function (e) {
                            e.stopPropagation();
                            setFormState(function (prev) { return Object.assign({}, prev, { cv: null }); });
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
                      {formState.attachments.map(function (file, idx) {
                        return (
                          <div key={idx} className="career-apply-form__attachment-chip">
                            {file.name}
                            <button type="button" onClick={function () { removeAttachment(idx); }}>&times;</button>
                          </div>
                        );
                      })}
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
                      onClick={function () { setApplyStep(1); }}
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
        onHide={function () { setShowShare(false); }}
        job={shareJob}
        lang={lang || language}
      />
    </>
  );
};

export default CareersPage;
