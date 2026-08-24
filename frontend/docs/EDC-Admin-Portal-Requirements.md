# EDC Admin Portal Requirements

## Overview
This document outlines the admin portal features required to manage the EDC (Emirates Driving Company) exclusive promo code and terms & conditions. The frontend consumes these via the backend API.

---

## 1. EDC Promo Code Management

### Location in Admin Panel
**Suggested Path:** `CMS > Promotions > EDC Promo` or `Pricing > EDC Promo`

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `promo_code` | String | The promotional code | `EDCVIP2025` |
| `discount_percentage` | Number | Discount percentage (0-100) | `15` |
| `discount_type` | Dropdown | Type of discount | `percentage` / `fixed_amount` |
| `fixed_discount_amount` | Number | Fixed discount if type is fixed | `50` |
| `is_active` | Boolean/Toggle | Enable/disable the promo | `true` |
| `valid_from` | DateTime | Start date of promo validity | `2025-01-01 00:00:00` |
| `valid_until` | DateTime | End date of promo validity | `2025-12-31 23:59:59` |
| `max_uses` | Number | Maximum total uses (0 = unlimited) | `1000` |
| `max_uses_per_user` | Number | Max uses per verified user | `5` |
| `current_uses` | Number (Read-only) | Current usage count | `247` |
| `min_rental_days` | Number | Minimum rental days required | `1` |
| `applicable_vehicles` | Multi-select | Vehicle categories eligible | `All` / `Economy, Sedan` |
| `description_en` | Text | English description | `Exclusive discount for EDC members` |
| `description_ar` | Text | Arabic description | `خصم حصري لأعضاء مؤسسة الإمارات للتعليم` |

### UI Mockup Suggestion

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EDC Promo Code Management                                    [Save]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Promo Code: [EDCVIP2025        ]     Status: [● Active ▼]             │
│                                                                         │
│  ┌─ Discount Settings ──────────────────────────────────────────────┐  │
│  │  Type: [● Percentage  ○ Fixed Amount]                            │  │
│  │  Discount: [15] %                                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─ Validity Period ────────────────────────────────────────────────┐  │
│  │  From: [2025-01-01] [00:00]    To: [2025-12-31] [23:59]         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─ Usage Limits ───────────────────────────────────────────────────┐  │
│  │  Max Total Uses: [1000]    Max Per User: [5]    Current: 247    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─ Description ────────────────────────────────────────────────────┐  │
│  │  English: [Exclusive discount for EDC members...              ]  │  │
│  │  Arabic:  [خصم حصري لأعضاء مؤسسة الإمارات للتعليم...          ]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. EDC Terms & Conditions Management

### Location in Admin Panel
**Suggested Path:** `CMS > Promotions > EDC Terms` or `Misc. Settings > EDC Configuration`

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | Auto-increment | Unique identifier | `1` |
| `text_en` | String | English term text | `Valid EDC Student ID required` |
| `text_ar` | String | Arabic term text | `مطلوب بطاقة طالب EDC صالحة` |
| `is_active` | Boolean | Show/hide this term | `true` |
| `sort_order` | Number | Display order | `1` |
| `created_at` | DateTime | Creation timestamp | Auto |
| `updated_at` | DateTime | Last update timestamp | Auto |

### UI Mockup Suggestion

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EDC Terms & Conditions                                  [+ Add Term]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────┬──────────────────────────────────┬─────────┬─────────────────┐│
│  │  #  │  Term (EN / AR)                  │ Status  │ Actions         ││
│  ├─────┼──────────────────────────────────┼─────────┼─────────────────┤│
│  │  1  │  Valid EDC Student ID required   │ ● Active│ [Edit] [Delete] ││
│  │     │  مطلوب بطاقة طالب صالحة          │         │                 ││
│  ├─────┼──────────────────────────────────┼─────────┼─────────────────┤│
│  │  2  │  Offer valid for limited time    │ ● Active│ [Edit] [Delete] ││
│  │     │  العرض صالح لفترة محدودة         │         │                 ││
│  ├─────┼──────────────────────────────────┼─────────┼─────────────────┤│
│  │  3  │  Terms and conditions apply      │ ● Active│ [Edit] [Delete] ││
│  │     │  تطبق الشروط والأحكام            │         │                 ││
│  ├─────┼──────────────────────────────────┼─────────┼─────────────────┤│
│  │  4  │  Cannot combine with other offers│ ○ Hidden│ [Edit] [Delete] ││
│  │     │  لا يمكن دمجه مع عروض أخرى       │         │                 ││
│  └─────┴──────────────────────────────────┴─────────┴─────────────────┘│
│                                                                         │
│  [↑] [↓] Drag to reorder                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Add/Edit Term Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Add New Term                                          [X]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Term (English):                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Valid EDC Student ID required                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Term (Arabic):                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ مطلوب بطاقة طالب EDC صالحة                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Status: [● Active ▼]                                          │
│                                                                 │
│                              [Cancel]  [Save Term]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend API Endpoints Required

The admin portal should expose these APIs for the frontend to consume:

### GET `/api/edc/promo-info`
Returns current promo configuration for frontend display.

**Response:**
```json
{
  "success": true,
  "data": {
    "promo_code": "EDCVIP2025",
    "discount_percentage": 15,
    "discount_type": "percentage",
    "is_active": true,
    "valid_from": "2025-01-01T00:00:00Z",
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

### Admin CRUD Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/edc/promo` | Get promo settings |
| PUT | `/api/admin/edc/promo` | Update promo settings |
| GET | `/api/admin/edc/terms` | List all terms |
| POST | `/api/admin/edc/terms` | Create new term |
| PUT | `/api/admin/edc/terms/:id` | Update term |
| DELETE | `/api/admin/edc/terms/:id` | Delete term |
| PUT | `/api/admin/edc/terms/reorder` | Reorder terms |

---

## 4. Database Schema Suggestion

### Table: `edc_promo_config`
```sql
CREATE TABLE edc_promo_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  promo_code VARCHAR(50) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_type ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
  fixed_discount_amount DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from DATETIME,
  valid_until DATETIME,
  max_uses INT DEFAULT 0,
  max_uses_per_user INT DEFAULT 0,
  current_uses INT DEFAULT 0,
  min_rental_days INT DEFAULT 1,
  description_en TEXT,
  description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: `edc_terms_conditions`
```sql
CREATE TABLE edc_terms_conditions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  text_en VARCHAR(500) NOT NULL,
  text_ar VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: `edc_verifications` (for tracking)
```sql
CREATE TABLE edc_verifications (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  member_type ENUM('student', 'staff', 'instructor') DEFAULT 'student',
  promo_code_used VARCHAR(50),
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  status ENUM('active', 'expired', 'revoked') DEFAULT 'active'
);
```

---

## 5. Sample Data

### Initial Terms & Conditions
```sql
INSERT INTO edc_terms_conditions (text_en, text_ar, sort_order) VALUES
('Valid EDC Student ID or Staff ID required', 'مطلوب بطاقة طالب أو موظف EDC صالحة', 1),
('Offer valid for limited time', 'العرض صالح لفترة محدودة', 2),
('Terms and conditions apply', 'تطبق الشروط والأحكام', 3),
('Cannot be combined with other offers', 'لا يمكن دمجه مع عروض أخرى', 4),
('Discount applies to base rental rate only', 'الخصم ينطبق على سعر الإيجار الأساسي فقط', 5);
```

### Initial Promo Config
```sql
INSERT INTO edc_promo_config (promo_code, discount_percentage, is_active, valid_from, valid_until, description_en, description_ar) VALUES
('EDCVIP2025', 15, true, '2025-01-01', '2025-12-31', 'Exclusive discount for EDC members', 'خصم حصري لأعضاء مؤسسة الإمارات للتعليم');
```

---

## 6. Priority & Timeline

| Feature | Priority | Complexity |
|---------|----------|------------|
| EDC Promo Code Settings | High | Low |
| Terms & Conditions CRUD | High | Medium |
| GET `/api/edc/promo-info` API | High | Low |
| Usage Analytics/Reporting | Medium | Medium |

---

## 7. Frontend Integration Status

The frontend is ready to consume:
- ✅ `GET /api/edc/promo-info` - For fetching promo code and terms
- ✅ `POST /api/edc/verify` - For verifying EDC members
- ✅ Auto-applying promo code after verification
- ✅ Displaying terms & conditions dynamically

Once the admin portal and APIs are ready, the frontend will automatically display the updated promo codes and terms.

---

## Contact

For any questions about the frontend integration, refer to:
- `src/components/UI/EdcExclusive/EdcExclusive.js` - Main EDC page
- `src/pages/Home.jsx` - Terms display on homepage
- `docs/EDC-Backend-Requirements.md` - Backend API specifications

