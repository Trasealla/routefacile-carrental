// KYC public API client.
// All endpoints require the public x-api-key header.
// All wrappers return: { ok: boolean, status: number, data: any, errorMessage: string|null }

import configWeb from "../config.js/configWeb";

const DEFAULT_API_KEY = "J%P9&g4aIbZn7D3";
const apiKey = () => process.env.REACT_APP_API_KEY || DEFAULT_API_KEY;

/**
 * Normalises any backend / network response into a single shape.
 * Backend (NestJS BadRequest) error shape: { statusCode, message, error }
 */
function normalize(response, json) {
  const ok = !!response && response.ok;
  let errorMessage = null;
  if (!ok) {
    if (json && typeof json.message === "string") errorMessage = json.message;
    else if (json && Array.isArray(json.message)) errorMessage = json.message.join(", ");
    else if (json && typeof json.error === "string") errorMessage = json.error;
    else errorMessage = `Request failed with status ${response ? response.status : "?"}`;
  }
  return {
    ok,
    status: response ? response.status : 0,
    data: json || null,
    errorMessage,
  };
}

async function jsonGet(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey(),
      },
    });
    const json = await response.json().catch(() => null);
    return normalize(response, json);
  } catch (err) {
    return { ok: false, status: 0, data: null, errorMessage: err.message || "Network error" };
  }
}

async function jsonPost(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey(),
      },
      body: JSON.stringify(body || {}),
    });
    const json = await response.json().catch(() => null);
    return normalize(response, json);
  } catch (err) {
    return { ok: false, status: 0, data: null, errorMessage: err.message || "Network error" };
  }
}

async function multipartPost(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        // NB: do NOT set Content-Type; browser will set the multipart boundary.
        "x-api-key": apiKey(),
      },
      body: formData,
    });
    const json = await response.json().catch(() => null);
    return normalize(response, json);
  } catch (err) {
    return { ok: false, status: 0, data: null, errorMessage: err.message || "Network error" };
  }
}

// --- Public KYC endpoints ----------------------------------------------------

export const getKycConfig = () => jsonGet(configWeb.GET_KYC_CONFIG);

/**
 * @param {{ contact_mobile_code: string, contact_mobile_number: string, email: string }} payload
 */
export const startKyc = (payload) => jsonPost(configWeb.POST_KYC_START, payload);

export const verifyPhoneOtp = (referenceToken, otp) =>
  jsonPost(configWeb.POST_KYC_VERIFY_PHONE_OTP, { reference_token: referenceToken, otp });

export const verifyEmailOtp = (referenceToken, otp) =>
  jsonPost(configWeb.POST_KYC_VERIFY_EMAIL_OTP, { reference_token: referenceToken, otp });

export const resendPhoneOtp = (referenceToken) =>
  jsonPost(configWeb.POST_KYC_RESEND_PHONE_OTP, { reference_token: referenceToken });

export const resendEmailOtp = (referenceToken) =>
  jsonPost(configWeb.POST_KYC_RESEND_EMAIL_OTP, { reference_token: referenceToken });

export const getKycStatus = (referenceToken) =>
  jsonGet(configWeb.GET_KYC_STATUS(referenceToken));

/**
 * Submit final KYC payload (multipart).
 * @param {{
 *   reference_token: string,
 *   residential_address?: string,
 *   contact_landline_code?: string,
 *   contact_landline_number?: string,
 *   company_name?: string,
 *   company_address?: string,
 *   company_phone_code?: string,
 *   company_phone_number?: string,
 *   consent_given: boolean,
 *   cities_id_front: File,
 *   cities_id_back: File,
 *   uae_driving_license_front: File,
 *   uae_driving_license_back: File,
 *   passport_visa?: File,
 * }} payload
 */
export const submitKyc = (payload) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") fd.append(key, value ? "true" : "false");
    else fd.append(key, value);
  });
  return multipartPost(configWeb.POST_KYC_SUBMIT, fd);
};

// --- URL builders for inline / download streams ---------------------------

/**
 * Returns a URL the browser can <img src> / <iframe src>.
 * The endpoint is gated by the reference_token query parameter; no extra header.
 */
export const buildAttachmentPreviewUrl = (attachmentId, referenceToken) =>
  configWeb.GET_KYC_ATTACHMENT_PREVIEW(attachmentId, referenceToken);

export const buildAttachmentDownloadUrl = (attachmentId, referenceToken) =>
  configWeb.GET_KYC_ATTACHMENT_DOWNLOAD(attachmentId, referenceToken);

/**
 * Cache-busted signature URL so the latest re-sign overrides the browser cache.
 */
export const buildSignatureUrl = (referenceToken, cacheBust) => {
  const base = configWeb.GET_KYC_SIGNATURE(referenceToken);
  return cacheBust ? `${base}?v=${cacheBust}` : base;
};

/**
 * Fetches a protected binary URL (signature, attachment preview, etc.) using the
 * required x-api-key header and returns a usable object URL for <img>/<iframe>.
 * Caller is responsible for revoking the URL when done (URL.revokeObjectURL).
 */
export const fetchAuthenticatedBlobUrl = async (url) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "x-api-key": apiKey(),
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
