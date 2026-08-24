# EDC Admin Backend API Requirements

## Overview
This document specifies the backend APIs required for the **Admin Portal** to manage EDC promo codes and terms & conditions.

---

## Base URL
```
/api/admin/edc/
```

**Authentication:** All admin endpoints require authentication (JWT token or session-based auth used by admin portal).

---

## 1. Promo Code Management APIs

### 1.1 GET Promo Configuration

**Endpoint:** `GET /api/admin/edc/promo`

**Description:** Retrieve the current EDC promo configuration.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "promo_code": "EDCVIP2025",
    "discount_percentage": 15,
    "discount_type": "percentage",
    "fixed_discount_amount": 0,
    "is_active": true,
    "valid_from": "2025-01-01T00:00:00Z",
    "valid_until": "2025-12-31T23:59:59Z",
    "max_uses": 1000,
    "max_uses_per_user": 5,
    "current_uses": 247,
    "min_rental_days": 1,
    "applicable_vehicles": ["all"],
    "description_en": "Exclusive discount for EDC members",
    "description_ar": "خصم حصري لأعضاء مؤسسة الإمارات للتعليم",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-06-15T10:30:00Z"
  }
}
```

---

### 1.2 UPDATE Promo Configuration

**Endpoint:** `PUT /api/admin/edc/promo`

**Description:** Update the EDC promo configuration.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "promo_code": "EDCVIP2025",
  "discount_percentage": 20,
  "discount_type": "percentage",
  "fixed_discount_amount": 0,
  "is_active": true,
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_until": "2025-12-31T23:59:59Z",
  "max_uses": 2000,
  "max_uses_per_user": 10,
  "min_rental_days": 1,
  "applicable_vehicles": ["all"],
  "description_en": "Exclusive discount for EDC members - Updated!",
  "description_ar": "خصم حصري لأعضاء مؤسسة الإمارات للتعليم - محدث!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Promo configuration updated successfully",
  "data": {
    "id": 1,
    "promo_code": "EDCVIP2025",
    "discount_percentage": 20,
    "discount_type": "percentage",
    "is_active": true,
    "updated_at": "2025-06-20T14:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "discount_percentage": "Must be between 0 and 100"
  }
}
```

---

### 1.3 GET Promo Usage Statistics

**Endpoint:** `GET /api/admin/edc/promo/stats`

**Description:** Get usage statistics for the EDC promo.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | Date | Start date (optional) |
| `to` | Date | End date (optional) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_uses": 247,
    "unique_users": 189,
    "total_discount_given": 12500.00,
    "usage_by_member_type": {
      "student": 180,
      "staff": 52,
      "instructor": 15
    },
    "usage_by_month": [
      { "month": "2025-01", "count": 45 },
      { "month": "2025-02", "count": 62 },
      { "month": "2025-03", "count": 78 },
      { "month": "2025-04", "count": 62 }
    ]
  }
}
```

---

## 2. Terms & Conditions Management APIs

### 2.1 GET All Terms

**Endpoint:** `GET /api/admin/edc/terms`

**Description:** Retrieve all terms and conditions (including inactive ones).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text_en": "Valid EDC Student ID or Staff ID required",
      "text_ar": "مطلوب بطاقة طالب أو موظف EDC صالحة",
      "is_active": true,
      "sort_order": 1,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "text_en": "Offer valid for limited time",
      "text_ar": "العرض صالح لفترة محدودة",
      "is_active": true,
      "sort_order": 2,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": 3,
      "text_en": "Terms and conditions apply",
      "text_ar": "تطبق الشروط والأحكام",
      "is_active": true,
      "sort_order": 3,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": 4,
      "text_en": "Cannot be combined with other offers",
      "text_ar": "لا يمكن دمجه مع عروض أخرى",
      "is_active": false,
      "sort_order": 4,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

---

### 2.2 GET Single Term

**Endpoint:** `GET /api/admin/edc/terms/:id`

**Description:** Retrieve a specific term by ID.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "text_en": "Valid EDC Student ID or Staff ID required",
    "text_ar": "مطلوب بطاقة طالب أو موظف EDC صالحة",
    "is_active": true,
    "sort_order": 1,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Term not found"
}
```

---

### 2.3 CREATE New Term

**Endpoint:** `POST /api/admin/edc/terms`

**Description:** Create a new term.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text_en": "Discount applies to base rental rate only",
  "text_ar": "الخصم ينطبق على سعر الإيجار الأساسي فقط",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Term created successfully",
  "data": {
    "id": 5,
    "text_en": "Discount applies to base rental rate only",
    "text_ar": "الخصم ينطبق على سعر الإيجار الأساسي فقط",
    "is_active": true,
    "sort_order": 5,
    "created_at": "2025-06-20T14:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "text_en": "English text is required"
  }
}
```

---

### 2.4 UPDATE Term

**Endpoint:** `PUT /api/admin/edc/terms/:id`

**Description:** Update an existing term.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text_en": "Valid EDC Student ID required (updated)",
  "text_ar": "مطلوب بطاقة طالب EDC صالحة (محدث)",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Term updated successfully",
  "data": {
    "id": 1,
    "text_en": "Valid EDC Student ID required (updated)",
    "text_ar": "مطلوب بطاقة طالب EDC صالحة (محدث)",
    "is_active": true,
    "sort_order": 1,
    "updated_at": "2025-06-20T14:35:00Z"
  }
}
```

---

### 2.5 DELETE Term

**Endpoint:** `DELETE /api/admin/edc/terms/:id`

**Description:** Delete a term.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Term deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Term not found"
}
```

---

### 2.6 REORDER Terms

**Endpoint:** `PUT /api/admin/edc/terms/reorder`

**Description:** Update the sort order of multiple terms at once.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "order": [
    { "id": 3, "sort_order": 1 },
    { "id": 1, "sort_order": 2 },
    { "id": 2, "sort_order": 3 },
    { "id": 4, "sort_order": 4 }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Terms reordered successfully"
}
```

---

### 2.7 TOGGLE Term Status

**Endpoint:** `PATCH /api/admin/edc/terms/:id/toggle`

**Description:** Quick toggle for activating/deactivating a term.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Term status toggled",
  "data": {
    "id": 4,
    "is_active": true
  }
}
```

---

## 3. Public API (Frontend Consumption)

This API is consumed by the **frontend** (not admin portal) and should be publicly accessible:

### 3.1 GET Promo Info (Public)

**Endpoint:** `GET /api/edc/promo-info`

**Description:** Get active promo info and terms for frontend display.

**Headers:**
```
x-api-key: <api_key>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "promo_code": "EDCVIP2025",
    "discount_percentage": 15,
    "discount_type": "percentage",
    "is_active": true,
    "valid_until": "2025-12-31T23:59:59Z",
    "description": {
      "en": "Exclusive discount for EDC members",
      "ar": "خصم حصري لأعضاء مؤسسة الإمارات للتعليم"
    },
    "terms_and_conditions": [
      { "id": 1, "text": "Valid EDC Student ID required", "text_ar": "مطلوب بطاقة طالب صالحة" },
      { "id": 2, "text": "Offer valid for limited time", "text_ar": "العرض صالح لفترة محدودة" },
      { "id": 3, "text": "Terms and conditions apply", "text_ar": "تطبق الشروط والأحكام" }
    ]
  }
}
```

**Note:** This endpoint should only return **active** terms sorted by `sort_order`.

---

## 4. Verification Management (Optional)

### 4.1 GET All Verifications

**Endpoint:** `GET /api/admin/edc/verifications`

**Description:** List all EDC member verifications.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 20) |
| `status` | String | Filter by status: `active`, `expired`, `revoked` |
| `member_type` | String | Filter by type: `student`, `staff`, `instructor` |
| `search` | String | Search by name, email, or student ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verifications": [
      {
        "id": "abc123",
        "student_id": "EDC2024001",
        "full_name": "Ahmed Al Maktoum",
        "email": "ahmed@example.com",
        "member_type": "student",
        "promo_code_used": "EDCVIP2025",
        "verified_at": "2025-06-15T10:30:00Z",
        "expires_at": "2025-06-22T10:30:00Z",
        "status": "active",
        "bookings_made": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 189,
      "items_per_page": 20
    }
  }
}
```

---

### 4.2 REVOKE Verification

**Endpoint:** `PUT /api/admin/edc/verifications/:id/revoke`

**Description:** Revoke a verification (e.g., for fraud).

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Fraudulent ID submitted"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification revoked successfully"
}
```

---

## 5. API Summary Table

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Promo Management** ||||
| GET | `/api/admin/edc/promo` | Get promo config | Admin |
| PUT | `/api/admin/edc/promo` | Update promo config | Admin |
| GET | `/api/admin/edc/promo/stats` | Get usage statistics | Admin |
| **Terms Management** ||||
| GET | `/api/admin/edc/terms` | List all terms | Admin |
| GET | `/api/admin/edc/terms/:id` | Get single term | Admin |
| POST | `/api/admin/edc/terms` | Create term | Admin |
| PUT | `/api/admin/edc/terms/:id` | Update term | Admin |
| DELETE | `/api/admin/edc/terms/:id` | Delete term | Admin |
| PUT | `/api/admin/edc/terms/reorder` | Reorder terms | Admin |
| PATCH | `/api/admin/edc/terms/:id/toggle` | Toggle term status | Admin |
| **Public (Frontend)** ||||
| GET | `/api/edc/promo-info` | Get active promo & terms | API Key |
| **Verifications** ||||
| GET | `/api/admin/edc/verifications` | List verifications | Admin |
| PUT | `/api/admin/edc/verifications/:id/revoke` | Revoke verification | Admin |

---

## 6. Validation Rules

### Promo Configuration
| Field | Rules |
|-------|-------|
| `promo_code` | Required, 3-50 chars, alphanumeric + underscore |
| `discount_percentage` | Required if type=percentage, 0-100 |
| `fixed_discount_amount` | Required if type=fixed_amount, > 0 |
| `valid_from` | Required, valid datetime |
| `valid_until` | Required, must be after valid_from |
| `max_uses` | Optional, >= 0 (0 = unlimited) |

### Terms
| Field | Rules |
|-------|-------|
| `text_en` | Required, 1-500 chars |
| `text_ar` | Optional, 1-500 chars |
| `is_active` | Optional, boolean (default: true) |

---

## 7. Error Response Format

All error responses should follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 8. Implementation Priority

| Priority | API | Reason |
|----------|-----|--------|
| 🔴 High | `GET /api/edc/promo-info` | Frontend needs this |
| 🔴 High | `PUT /api/admin/edc/promo` | Admin needs to update promo |
| 🔴 High | `GET/POST/PUT/DELETE /api/admin/edc/terms` | Admin needs CRUD for terms |
| 🟡 Medium | `PUT /api/admin/edc/terms/reorder` | Nice to have for ordering |
| 🟡 Medium | `GET /api/admin/edc/promo/stats` | Analytics feature |
| 🟢 Low | Verification management | Can be added later |

