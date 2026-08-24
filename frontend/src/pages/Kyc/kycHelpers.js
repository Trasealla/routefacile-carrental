// KYC helpers: validation, error mapping, token persistence, constants.

export const KYC_STORAGE_KEY = "kyc_wizard_state_v3";
export const KYC_SIGNED_AT_KEY = "kyc_signed_at_v1";
export const KYC_REFERENCE_TOKEN_KEY = "kyc_reference_token_v1";

export const KYC_STEPS = {
  IDENTITY: "IDENTITY",
  OTP: "OTP",
  DETAILS: "DETAILS",
  DOCUMENTS: "DOCUMENTS",
  SIGNATURE: "SIGNATURE",
  REVIEW: "REVIEW",
  DONE: "DONE",
};

export const STEP_ORDER = [
  KYC_STEPS.IDENTITY,
  KYC_STEPS.OTP,
  KYC_STEPS.DETAILS,
  KYC_STEPS.DOCUMENTS,
  KYC_STEPS.SIGNATURE,
  KYC_STEPS.REVIEW,
  KYC_STEPS.DONE,
];

// File constraints
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB default
export const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
];
export const ALLOWED_EXTS = ["pdf", "jpg", "jpeg", "png", "heic", "heif"];

export const DOCUMENT_TYPES = [
  { key: "cities_id_front", labelKey: "National ID — Front" },
  { key: "cities_id_back", labelKey: "National ID — Back" },
  { key: "uae_driving_license_front", labelKey: "UAE Driving Licence — Front" },
  { key: "uae_driving_license_back", labelKey: "UAE Driving Licence — Back" },
  { key: "passport_visa", labelKey: "Passport + Visa Page" },
];

// Server-driven defaults; overridden by GET /kyc/config when available.
export const DEFAULT_KYC_CONFIG = {
  required_documents: [
    "cities_id_front",
    "cities_id_back",
    "uae_driving_license_front",
    "uae_driving_license_back",
  ],
  optional_documents: ["passport_visa"],
  otp_ttl_minutes: 10,
  max_file_size_mb: 10,
  allowed_mime_types: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/heic",
  ],
  consent_text:
    "I'm giving my consent to M/s Route Facile International Leasing LLC to obtaining " +
    "my credit score from AECB on my behalf for the purpose of processing my car rental request",
};

export function isDocRequired(docKey, config) {
  const cfg = config || DEFAULT_KYC_CONFIG;
  const required = Array.isArray(cfg.required_documents)
    ? cfg.required_documents
    : DEFAULT_KYC_CONFIG.required_documents;
  return required.includes(docKey);
}

export function getTimelineLabel(eventName) {
  switch (eventName) {
    case "created": return "Application started";
    case "started": return "Form started";
    case "phone_verified": return "Phone verified";
    case "email_verified": return "Email verified";
    case "signed": return "Signature captured";
    case "submitted": return "Submitted";
    case "under_review": return "Under review";
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    case "sms_notified": return "SMS notification sent";
    case "email_notified": return "Email notification sent";
    default: return eventName;
  }
}

export const STATUS_COLORS = {
  draft: { bg: "#eef1f7", fg: "#5d6477" },
  submitted: { bg: "#e6f0ff", fg: "#1565c0" },
  under_review: { bg: "#fff4d6", fg: "#946000" },
  approved: { bg: "#e3f7e8", fg: "#1f8a4c" },
  rejected: { bg: "#fde7e9", fg: "#b3261e" },
};

// Regex per spec
const RE_CODE = /^\+?\d{1,5}$/;
const RE_NUMBER = /^\d{4,15}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_OTP = /^\d{6}$/;

export const isValidMobileCode = (v) => typeof v === "string" && RE_CODE.test(v.trim());
export const isValidMobileNumber = (v) => typeof v === "string" && RE_NUMBER.test(v.trim());
export const isValidEmail = (v) => typeof v === "string" && RE_EMAIL.test(v.trim());
export const isValidOtp = (v) => typeof v === "string" && RE_OTP.test(v.trim());

export function getConfigAllowedTypes(configAllowedTypes) {
  if (Array.isArray(configAllowedTypes) && configAllowedTypes.length) {
    return configAllowedTypes
      .map((v) => String(v || "").trim().toLowerCase().replace(/^\./, ""))
      .filter(Boolean);
  }
  return ALLOWED_EXTS;
}

export function validateFile(file, options = {}) {
  const { maxFileBytes = MAX_FILE_BYTES, allowedTypes = ALLOWED_EXTS } = options;
  if (!file) return "No file selected.";
  if (file.size > maxFileBytes) return "File too large. Maximum 10 MB.";
  const name = (file.name || "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop() : "";
  const normalizedAllowed = allowedTypes
    .map((v) => String(v || "").trim().toLowerCase().replace(/^\./, ""))
    .filter(Boolean);
  const extOk = normalizedAllowed.includes(ext);
  // mime type can be empty for HEIC on some browsers, fall back to extension check
  const mimeOk = !file.type || ALLOWED_MIME.includes(file.type.toLowerCase());
  if (!extOk || !mimeOk) {
    return `Unsupported file type. Allowed: ${normalizedAllowed
      .map((v) => v.toUpperCase())
      .join(", ")}.`;
  }
  return null;
}

// Maps known backend messages to translatable keys we keep stable in i18n JSON.
// If a message is unknown we just return it verbatim.
const KNOWN_ERRORS = {
  "Invalid OTP.": "Invalid OTP.",
  "OTP has expired. Please request a new one.": "OTP has expired. Please request a new one.",
  "Mobile number must be verified before submitting.":
    "Mobile number must be verified before submitting.",
  "Email address must be verified before submitting.":
    "Email address must be verified before submitting.",
  "Consent must be given before submitting.": "Consent must be given before submitting.",
  "Unsupported file type. Allowed: PDF, JPG, PNG, HEIC.":
    "Unsupported file type. Allowed: PDF, JPG, PNG, HEIC.",
  "Submission has already been submitted.": "Submission has already been submitted.",
};

export function mapKycError(message, t) {
  if (!message) return t("Something went wrong. Please try again.");
  if (message.startsWith("Missing required document")) {
    return t("Missing required document.");
  }
  const key = KNOWN_ERRORS[message];
  if (key) return t(key);
  return message;
}

export function isAlreadySubmittedError(message) {
  return typeof message === "string" && message === "Submission has already been submitted.";
}

// --- Token persistence -----------------------------------------------------

export function loadKycReferenceToken() {
  try {
    return window.localStorage.getItem(KYC_REFERENCE_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function saveKycReferenceToken(referenceToken) {
  try {
    if (!referenceToken) {
      window.localStorage.removeItem(KYC_REFERENCE_TOKEN_KEY);
      return;
    }
    window.localStorage.setItem(KYC_REFERENCE_TOKEN_KEY, referenceToken);
  } catch {
    /* ignore quota errors */
  }
}

export function clearKycReferenceToken() {
  try {
    window.localStorage.removeItem(KYC_REFERENCE_TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// --- Signature helpers -----------------------------------------------------

const PNG_DATA_URL_PREFIX = "data:image/png;base64,";

/**
 * Trim a canvas to its non-transparent bounding box, return a new PNG dataURL.
 * Returns "" when the canvas is effectively blank.
 */
export function trimCanvasToDataUrl(canvas, padding = 8) {
  if (!canvas || !canvas.width || !canvas.height) return "";
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  let pixelCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 12) {
        pixelCount++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (pixelCount < 30 || maxX < 0) return "";
  const px = Math.max(0, minX - padding);
  const py = Math.max(0, minY - padding);
  const pw = Math.min(width - px, maxX - minX + padding * 2);
  const ph = Math.min(height - py, maxY - minY + padding * 2);
  const out = document.createElement("canvas");
  out.width = pw;
  out.height = ph;
  out.getContext("2d").drawImage(canvas, px, py, pw, ph, 0, 0, pw, ph);
  return out.toDataURL("image/png");
}

/**
 * Render a typed name onto a canvas in a script font and return the data URL.
 */
export function renderTypedSignature(name) {
  const text = (name || "").trim();
  if (!text) return "";
  const canvas = document.createElement("canvas");
  const w = 600;
  const h = 180;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#1a2233";
  // Use cursive system fallback chain; @font-face would be heavier.
  ctx.font = "italic 64px 'Brush Script MT','Segoe Script','Apple Chancery',cursive";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, w / 2, h / 2);
  return trimCanvasToDataUrl(canvas, 12);
}

export function isValidSignatureDataUrl(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith(PNG_DATA_URL_PREFIX)) {
    return false;
  }
  // Decoded payload size limit ~200 KB (server-side cap).
  const b64 = dataUrl.slice(PNG_DATA_URL_PREFIX.length);
  // Approximate decoded size: 3/4 of base64 length.
  const bytes = Math.floor((b64.length * 3) / 4);
  return bytes > 0 && bytes <= 200 * 1024;
}

// --- Status / share helpers -----------------------------------------------

export function buildStatusUrl(language, referenceToken, fresh) {
  const lang = language || "en";
  const base = `/${lang}/kyc/status/${encodeURIComponent(referenceToken)}`;
  return fresh ? `${base}?fresh=1` : base;
}

export function copyToClipboard(text) {
  if (!text) return Promise.resolve(false);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve(ok);
  } catch {
    return Promise.resolve(false);
  }
}

export function formatDateTime(input) {
  if (!input) return "";
  try {
    const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// --- Session persistence (sessionStorage, files & signature stripped) ----

/**
 * Persist a sanitized snapshot of the wizard state.
 * Files (uploads) and the signature payload are intentionally NOT stored
 * for security reasons — the user must re-pick files & re-sign on reload.
 */
export function saveKycSession(state) {
  try {
    const safe = JSON.parse(
      JSON.stringify(state || {}, (key, value) => {
        if (value instanceof File || value instanceof Blob) return undefined;
        if (key === "signature") return undefined;
        return value;
      })
    );
    window.sessionStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    /* ignore */
  }
}

export function loadKycSession() {
  try {
    const raw = window.sessionStorage.getItem(KYC_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearKycSession() {
  try {
    window.sessionStorage.removeItem(KYC_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
