# EDC Exclusive Feature - API Documentation

## Overview

EDC Exclusive landing page for Emirates Driving Company students and staff to get exclusive car rental discounts.

**Frontend Route:** `/:lang/edc-exclusive`

---

## Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/edc/verify` | POST | ⭐ Verify EDC member & get promo code |
| `/api/edc/promo-info` | GET | Get current promo configuration & terms |
| `/api/edc/verification-status/:id` | GET | Check verification status |
| `/api/edc/rates` | GET | Get EDC-exclusive car rates |
| `/api/edc/enquiry` | POST | Submit enquiry from EDC member |

---

## NEW: Promo Info API with Terms & Conditions

### GET `/api/edc/promo-info?lang={language}`

Returns the current EDC promo configuration including terms and conditions.

**Query Parameters:**
- `lang`: Language code (`en` or `ar`)

**Response:**
```json
{
  "status": "success",
  "data": {
    "promo_code": "EDCVIP2025",
    "discount_type": "percentage",
    "discount_value": 15,
    "valid_from": "2025-01-01",
    "valid_until": "2025-12-31",
    "is_active": true,
    "edc_logo_url": "https://edc-cms-storage-cdn-dev.azureedge.net/strapi/assets/Logo_7399ed159f.svg",
    "terms_and_conditions": [
      {
        "id": 1,
        "text": "Valid EDC Student ID or Staff ID required at pickup",
        "text_ar": "مطلوب هوية طالب أو موظف EDC صالحة عند الاستلام"
      },
      {
        "id": 2,
        "text": "Offer valid for limited time only",
        "text_ar": "العرض ساري لفترة محدودة فقط"
      },
      {
        "id": 3,
        "text": "Cannot be combined with other offers",
        "text_ar": "لا يمكن دمجه مع عروض أخرى"
      },
      {
        "id": 4,
        "text": "Discount applies to base rental rate only",
        "text_ar": "الخصم ينطبق على سعر الإيجار الأساسي فقط"
      },
      {
        "id": 5,
        "text": "Standard terms and conditions apply",
        "text_ar": "تطبق الشروط والأحكام القياسية"
      }
    ],
    "banner_message": "🎓 EDC Exclusive Discount Applied!",
    "banner_message_ar": "🎓 تم تطبيق خصم EDC الحصري!"
  }
}
```

**Fields Explanation:**

| Field | Type | Description |
|-------|------|-------------|
| `promo_code` | string | The active promo code |
| `discount_type` | string | `percentage` or `fixed` |
| `discount_value` | number | Discount amount (15 = 15% or 15 AED) |
| `valid_from` | string | Start date (ISO format) |
| `valid_until` | string | End date (ISO format) |
| `is_active` | boolean | Whether the promo is currently active |
| `edc_logo_url` | string | URL to EDC logo for display |
| `terms_and_conditions` | array | List of T&C items with translations |
| `banner_message` | string | Message to show when promo is applied (EN) |
| `banner_message_ar` | string | Message to show when promo is applied (AR) |

---

## API Details

### 1. POST `/api/edc/verify` ⭐ (Critical)

Verify if a user is a valid EDC student or staff member.

**Request Body:**
```json
{
  "student_id": "EDC12345",
  "full_name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "verified": true,
  "data": {
    "verification_id": "VER-2025-00123",
    "promo_code": "EDCVIP2025",
    "discount_type": "percentage",
    "discount_value": 15,
    "valid_until": "2025-12-31T23:59:59Z",
    "member_type": "student",
    "member_name": "John Doe",
    "edc_logo_url": "https://edc-cms-storage-cdn-dev.azureedge.net/strapi/assets/Logo_7399ed159f.svg",
    "show_edc_branding": true,
    "terms_and_conditions": [
      {
        "id": 1,
        "text": "Valid EDC Student ID or Staff ID required at pickup"
      },
      {
        "id": 2,
        "text": "Offer valid for limited time only"
      },
      {
        "id": 3,
        "text": "Cannot be combined with other offers"
      }
    ]
  }
}
```

**Failure Response (400):**
```json
{
  "status": "error",
  "verified": false,
  "message": "Invalid EDC ID or details do not match our records"
}
```

**Frontend Usage After Verification:**
- Store response data in localStorage
- Show EDC logo in header when `show_edc_branding: true`
- Display terms when booking with EDC promo code

---

### 2. GET `/api/edc/promo-info`

Get current promo code configuration (allows dynamic promo codes based on season).

**Response:**
```json
{
  "promo_code": "EDCVIP2025",
  "discount_type": "percentage",
  "discount_value": 15,
  "valid_from": "2025-01-01",
  "valid_until": "2025-12-31",
  "terms": [
    "Valid EDC Student ID or Staff ID required",
    "Offer valid for limited time only",
    "Terms and conditions apply"
  ]
}
```

---

### 3. GET `/api/edc/verification-status/:id`

Check the status of a previous verification.

**Response:**
```json
{
  "verification_id": "VER-2025-00123",
  "status": "verified",
  "verified_at": "2025-01-15T10:30:00Z",
  "expires_at": "2025-01-16T10:30:00Z",
  "promo_code": "EDCVIP2025"
}
```

---

### 4. GET `/api/edc/rates?lang={language}`

Get EDC-exclusive car rental rates.

**Query Parameters:**
- `lang`: Language code (`en` or `ar`)

**Response:**
```json
[
  {
    "car_id": 1,
    "car": {
      "id": 1,
      "name": "Toyota Yaris",
      "image": "https://cdn.example.com/cars/yaris.png",
      "category": "Economy"
    },
    "rate": 1500,
    "daily_rate": 80,
    "weekly_rate": 500,
    "monthly_rate": 1500
  }
]
```

---

### 5. POST `/api/edc/enquiry`

Submit an enquiry from an EDC member.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone_code": "971",
  "phone_number": "501234567",
  "email": "john.doe@example.com",
  "car_id": 5,
  "emirate_id": 3,
  "duration": 6,
  "details": "Looking for a monthly rental",
  "promo_code": "EDCVIP2025",
  "edc_student_id": "EDC12345"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Enquiry submitted successfully",
  "enquiry_id": "ENQ-2025-00123"
}
```

---

## Frontend Integration Status

| Feature | Status | API Used |
|---------|--------|----------|
| EDC Landing Page | ✅ Complete | - |
| Logo Display | ✅ Complete | - |
| Benefits Section | ✅ Complete | - |
| Eligibility Section | ✅ Complete | - |
| Vehicle Listings | ✅ Complete | `/api/edc/rates` |
| Verification Popup | ✅ Complete | `/api/edc/verify` |
| Promo Code Display | ✅ Complete | `/api/edc/promo-info` |
| Promo Code Auto-Apply | ✅ Complete | - |
| Enquiry Form | ✅ Complete | `/api/edc/enquiry` |
| Terms & Conditions | ✅ Complete | - |
| Responsive Design | ✅ Complete | - |
| Multi-language | ✅ Complete | - |

---

## Frontend Changes Completed ✅

1. **`src/config.js/configWeb.js`** - Added EDC API endpoints
2. **`src/components/UI/EdcExclusive/EdcExclusive.js`** - Now uses `/api/edc/verify`, `/api/edc/rates`, `/api/edc/promo-info`
3. **`src/components/UI/EdcExclusive/EdcEnquiry.js`** - Now uses `/api/edc/enquiry`
4. **`src/components/UI/FindCarForm.jsx`** - Auto-applies EDC promo code from localStorage after verification

---

## NEW Frontend Features (Pending Backend APIs)

### Feature 1: EDC Logo in Main Header

When a user has verified their EDC status and the promo code is applied:
- Show EDC logo next to Autostrad logo in the main header
- Logo URL comes from `edc_logo_url` in verification response or promo-info API

**Where it appears:** Main site header (all pages when EDC promo is active)

### Feature 2: Terms & Conditions Banner on Car Listing

When EDC promo code is applied and user is on the car listing/booking page:
- Show a banner/notice with EDC terms and conditions
- Display next to car cards or above the car listing
- Terms come from `terms_and_conditions` array in API response

**Where it appears:** Car listing page, next to car cards

### Feature 3: EDC Discount Banner

When EDC promo code is auto-applied:
- Show a banner message like "🎓 EDC Exclusive Discount Applied!"
- Message comes from `banner_message` field

---

## Data to Store in localStorage After Verification

```javascript
{
  "edc_verification": {
    "verificationId": "VER-2025-00123",
    "studentId": "EDC12345",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "promoCode": "EDCVIP2025",
    "discountType": "percentage",
    "discountValue": 15,
    "memberType": "student",
    "edcLogoUrl": "https://...",
    "showEdcBranding": true,
    "termsAndConditions": [...],
    "bannerMessage": "🎓 EDC Exclusive Discount Applied!",
    "verifiedAt": "2025-01-15T10:30:00Z",
    "expiresAt": "2025-01-16T10:30:00Z"
  },
  "edc_promo_code": "EDCVIP2025"
}
```

---

**Date:** December 22, 2025  
**Status:** Backend APIs Confirmed ✅

