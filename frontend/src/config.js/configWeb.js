// Fallback to localhost API if environment variable is not set
const BASE_URL = process.env.REACT_APP_NODE_HOST || "http://localhost:3001/api/v1/";

// The public *website* origin. Every use of this builds a page URL — canonical
// tags, hreflang alternates, breadcrumb and schema URLs — never an asset URL.
//
// It used to read REACT_APP_FILE_SERVER, which is the media host ("/media" in
// this deployment). That produced canonicals like "/media/en/ourfleetlist",
// pointing Google at the asset path instead of the page. Falling back to the
// origin the page was actually served from keeps it correct everywhere;
// MetaHelmet then rewrites it to the production canonical domain.
const BASE_WEB_URL =
  process.env.REACT_APP_SITE_URL ||
  (typeof window !== "undefined" && window.location
    ? window.location.origin
    : "http://localhost:3001");

const configWeb = {
  BASE_URL: BASE_URL,
  BASE_WEB_URL: BASE_WEB_URL,
  GET_COUNTRY_LIST: BASE_URL + "country",
  POST_REGISTER: BASE_URL + "user/register",
  POST_REGISTER_CLASSIC: BASE_URL + "user/register/classic",
  POST_REGISTER_OTP: BASE_URL + "user/active/otp",
  

  POST_LOGIN: BASE_URL + "user/login",
  POST_FORGOT_PASSWORD: BASE_URL + "user/forgot/password",
  POST_RESET_PASSWORD: BASE_URL + "user/reset/password",
  GET_CITIES: BASE_URL + "city",
  GET_PUBLIC_SETTINGS: BASE_URL + "settings/public",
  GET_CAR_LIST: BASE_URL + "car",
  GET_CITIES_CAR_LIST: BASE_URL + "home/rates",
  // GET_HOMEPAGE_BANNER : BASE_URL + "home/banner",
  GET_HOMEPAGE_BANNER: (type) => `${BASE_URL}home/banner/${type}`,
  GET_CITIES_PAGE: (id) => `${BASE_URL}city/page/${id}`,
  GET_BLOGS: BASE_URL + "blog",
  GET_BLOG_DETAILS: (id) => `${BASE_URL}blog/${id}`,
  GET_CAR_BRANDS: BASE_URL + "car-brand",
  POST_NEWSLETTER: BASE_URL + "newsletter/subscription",

  /////////////////////////FindCarForm Apis/////////////////////////////////
  GET_PICKUP_LOCATION: (type, lang, pickupLocationId) =>
    `${BASE_URL}location/${type}?lang=${lang}${pickupLocationId ? `&pickup_location_id=${pickupLocationId}` : ''}`,
  GET_PICKUP_LOCATION_HOURS: (id, day, date) =>
    `${BASE_URL}location/hours/${id}/${day}${date ? `?date=${date}` : ''}`,
  GET_CITY_LOCATION_HOURS: (id, day) =>
    `${BASE_URL}city/hours/${id}/${day}`,
  POST_VLIDATE_PICKUP_LOCATION: BASE_URL + "booking/form/validate_pickup",
  POST_VLIDATE_DROPOFF: BASE_URL + "booking/form/validate_dropoff",
  POST_VLIDATE_COUPON: BASE_URL + "booking/form/validate_coupon",
  /////////////////////////////////////////////////////////////////////////////////
  POST_CAR_SEARCH: BASE_URL + "booking/form/car/search",
  GET_CAR_CATEGORY: BASE_URL + "car-category",
  POST_CAR_EXTRA: BASE_URL + "booking/form/car/extra",
  POST_CONFIRM_BOOKING: BASE_URL + "confirm/booking",
  // Pay-later booking without an account: same payload plus an "identifier"
  // (the customer's email or mobile), and no Authorization header.
  POST_GUEST_BOOKING: BASE_URL + "guest/booking",
  POST_BOOKING_PAYMENT: BASE_URL + "booking/payment",
  POST_CMI_INITIATE: BASE_URL + "booking/cmi/initiate",
  POST_MONTHLY_INSTALLMENT: BASE_URL + "booking/monthly/installment",
  // GET_KM_PLAN: BASE_URL + "booking/monthly/km/plan/[group-id]",

  GET_KM_PLAN: (rate_id) =>
    `${BASE_URL}booking/monthly/upgrade/extra/km/${rate_id}`,
  GET_MONTHLY_UPGRADE_MILEAGE_PLAN: (car_id, city_id, months) =>
    `${BASE_URL}booking/monthly/upgrade/mileage/plans/${car_id}/${city_id}/${months}`,
  GET_MONTHLY_PLANS: (car_id, city_id, mileage) =>
    `${BASE_URL}booking/monthly/upgrade/monthly/plans/${car_id}/${city_id}/${mileage}`,

  /////////////////////////////////////////Account section apis/////////////////////////////////
  GET_USER_DETAILS: (id) => `${BASE_URL}user/profile/details/${id}`,
  PUT_USER_DETAILS: (id) => `${BASE_URL}user/profile/details/${id}`,

  GET_USER_ADDRESS: (id) => `${BASE_URL}user/profile/address/${id}`,
  PUT_USER_ADDRESS: (id) => `${BASE_URL}user/profile/address/${id}`,
  PUT_RESET_PASSWORD: (id) => `${BASE_URL}user/profile/password/${id}`,
  POST_USER_DOCUMENTS: BASE_URL + "user/document",
  DELETE_USER_DOCUMENTS: (doc_id) => `${BASE_URL}user/document/${doc_id}`,
  POST_USER_DRIVER_DOCUMENTS: BASE_URL + "user/driver/document",
  GET_DOCUMENTS_SET_TYPE: (set_type, lang) =>
    `${BASE_URL}user/documents/${set_type}?lang=${lang}`,
  GET_DOCUMENTS_DOC_TYPE: (doc_type) => `${BASE_URL}user/documents/${doc_type}`,
  GET_USER_DOCUMENTS: (doc_set_type, user_id) =>
    `${BASE_URL}user/document/${doc_set_type}/${user_id}`,
  GET_USER_DOCUMENTS_NEW: (user_id) => `${BASE_URL}user/document/${user_id}`,
  GET_USER_DRIVER_DOCUMENTS: (doc_set_type, user_driver_id, lang) =>
    `${BASE_URL}user/driver/document/${doc_set_type}/${user_driver_id}?lang=${lang}`,

  GET_BOOKING_LIST: (type) => `${BASE_URL}user/booking/listing/${type}`,
  GET_CANCEL_BOOKING_ELIGIBILITY: BASE_URL + "cancel/booking/eligibility",
  POST_CANCEL_BOOKING: BASE_URL + "cancel/booking",
  POST_EXTEND_BOOKING: BASE_URL + "extend/booking",
  POST_EDIT_BOOKING: BASE_URL + "edit/booking",
  GET_USER_DRIVER: BASE_URL + "user/driver",
  PUT_USER_DRIVER: (id) => `${BASE_URL}user/driver/${id}`,
  DELETE_USER_DRIVER: (id) => `${BASE_URL}user/driver/${id}`,
  GET_USER_DRIVER_DETAILS: (id) => `${BASE_URL}user/driver/${id}`,

  GET_USER_LATEST_BOOKING_DETAILS: (booking_number) =>
    `${BASE_URL}user/booking/latest/${booking_number}`,
  POST_ADDITIONAL_DRIVER: BASE_URL + "user/driver",

  /////////////////city pages////////////////////////////

  GET_EMIARTES_PAGES: (type, id) => `${BASE_URL}city/page/${type}/${id}`,

  //////Car Details Page///////////////////////
  GET_CAR_DETAILS: (id) => `${BASE_URL}car/${id}`,

  ////////offer page//////////////////////////////////
  GET_SPECIAL_OFFER: BASE_URL + "offer",
  GET_SPECIAL_OFFER_DETAILS: (id, lang) =>
    `${BASE_URL}offer/${id}?lang=${lang}`,
  POST_OFFER_ENQUIRE: BASE_URL + "offer/enquiry",

  /////enquiry page////////////
  POST_ENQUIRE: BASE_URL + "enquiry",
  POST_CHAUFFEUR_ENQUIRE: BASE_URL + "chauffeur/enquiry",
  POST_CAPTCHA_VERIFY: BASE_URL + "google/recaptcha/verify",

  ///Pages///
  GET_PRIVACY_POLICY: (type) => `${BASE_URL}page/${type}`,
  GET_TEACHERS_RATE: `${BASE_URL}page/teachers/rate`,
  POST_TEACHERS_ENQUIRE: BASE_URL + "teachers/enquiry",

  // EDC Exclusive APIs
  GET_EDC_RATES: `${BASE_URL}edc/rates`,
  GET_EDC_PROMO_INFO: `${BASE_URL}edc/promo-info`,
  POST_EDC_VERIFY: `${BASE_URL}edc/verify`,
  POST_EDC_ENQUIRY: `${BASE_URL}edc/enquiry`,

  //FAQ//////////
  GET_FAQ_CATEGORIES: BASE_URL + "faq/category",
  GET_FAQ: BASE_URL + "faq",

  ///User feedback page//////////
  GET_FEEDBACK_SOURCE: BASE_URL + "user/feedback/source",
  GET_FEEDBACK_RATING: BASE_URL + "user/feedback/rating",
  GET_FEEDBACK_OVERALL_RATING: BASE_URL + "user/feedback/overall/rating",
  GET_FEEDBACK_REVERT_REASON: BASE_URL + "user/feedback/revert/reason",
  GET_FEEDBACK_SERVICE_CATEGORY: BASE_URL + "user/feedback/service/category",
  POST_FEEDBACK: BASE_URL + "user/feedback",

  ///lost and found////////////
  POST_LOST_AND_FOUND: BASE_URL + "lost/found/request",

  /////awards and certificate page/////

  GET_AWARD_AND_CERTIFICATE: BASE_URL + "award/certificate",

  ///career page////////////
  GET_CAREER_LIST: BASE_URL + "career/job",
  GET_CAREER_DETAIL: (id) => `${BASE_URL}career/job/${id}`,
  GET_CAREER_QUESTIONNAIRE: (id) => `${BASE_URL}career/job/${id}/questionnaire`,
  POST_CAREER_JOB_APPLICATION: BASE_URL + "career/job/application",

  /////payment success page/////
  GET_BOOKING_DETAILS: (id) => `${BASE_URL}user/booking/detail/${id}`,

  // Promo Ticker API
  GET_PROMO_TICKER: BASE_URL + "promo-ticker",

  /////////////////////////KYC public APIs/////////////////////////////////
  GET_KYC_CONFIG: BASE_URL + "kyc/config",
  POST_KYC_START: BASE_URL + "kyc/start",
  POST_KYC_VERIFY_PHONE_OTP: BASE_URL + "kyc/verify-phone-otp",
  POST_KYC_VERIFY_EMAIL_OTP: BASE_URL + "kyc/verify-email-otp",
  POST_KYC_RESEND_PHONE_OTP: BASE_URL + "kyc/resend-phone-otp",
  POST_KYC_RESEND_EMAIL_OTP: BASE_URL + "kyc/resend-email-otp",
  POST_KYC_SUBMIT: BASE_URL + "kyc/submit",
  GET_KYC_STATUS: (referenceToken) => `${BASE_URL}kyc/status/${referenceToken}`,
  GET_KYC_SIGNATURE: (referenceToken) =>
    `${BASE_URL}kyc/signature/${referenceToken}`,
  GET_KYC_ATTACHMENT_PREVIEW: (attachmentId, referenceToken) =>
    `${BASE_URL}kyc/attachments/${attachmentId}/preview?token=${encodeURIComponent(
      referenceToken
    )}`,
  GET_KYC_ATTACHMENT_DOWNLOAD: (attachmentId, referenceToken) =>
    `${BASE_URL}kyc/attachments/${attachmentId}/download?token=${encodeURIComponent(
      referenceToken
    )}`,
};
export default configWeb;
