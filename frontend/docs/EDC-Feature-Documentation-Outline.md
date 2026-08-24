# EDC Exclusive Feature - Documentation Outline

## Instructions for Creating Word Document

Use this outline to create a Word document with screenshots explaining the EDC Exclusive feature. Take screenshots from the running application at each step mentioned.

---

# Document Title: EDC Exclusive Car Rental Promo - Feature Documentation

## Version: 1.0
## Date: [Insert Date]
## Prepared by: [Your Name]

---

# Table of Contents

1. Executive Summary
2. Feature Overview
3. User Journey Flow
4. Page-by-Page Guide
5. Admin Portal Guide
6. Technical Integration
7. Appendix

---

# 1. Executive Summary

**Purpose:** Describe the EDC (Emirates Driving Company) exclusive promo feature that provides special car rental discounts to EDC students, staff, and instructors.

**Key Benefits:**
- Exclusive discounted rates for EDC members
- Seamless verification process
- Auto-applied promo codes
- Enhanced partnership visibility

**Target Users:**
- EDC Students
- EDC Staff Members
- EDC Instructors

---

# 2. Feature Overview

## 2.1 What is EDC Exclusive?

[Write 2-3 paragraphs explaining the partnership between Autostrad and Emirates Driving Company]

**Screenshot needed:** EDC Exclusive landing page hero section

## 2.2 Key Features

| Feature | Description |
|---------|-------------|
| Special Discounted Rates | Up to X% off on car rentals |
| Free Additional Driver | Optional benefit |
| Free Delivery | On monthly rentals |
| No Deposit Option | Available for verified members |
| Transparent Pricing | No hidden fees |

## 2.3 Eligibility

- EDC Students with valid Student ID
- EDC Staff Members with valid Staff ID
- EDC Instructors with valid Instructor ID

---

# 3. User Journey Flow

## 3.1 Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Home Page     │────▶│  EDC Exclusive  │────▶│   Verification  │
│   (See Popup)   │     │    Page         │     │     Modal       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Booking      │◀────│   Home Page     │◀────│   Verification  │
│   Confirmed     │     │ (Promo Applied) │     │    Success      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 3.2 Step-by-Step Journey

### Step 1: User Discovers EDC Offer
**Screenshot needed:** Home page showing EDC promo popup modal

Description: When users visit the homepage, they see a promotional popup about the EDC exclusive offer.

### Step 2: User Navigates to EDC Page
**Screenshot needed:** Header showing "EDC Offer" navigation link with "New" badge

Description: Users can access the EDC page via the navigation menu or by clicking "Claim Your Discount" in the popup.

### Step 3: User Views EDC Benefits
**Screenshot needed:** EDC Exclusive page showing benefits section

Description: The EDC page displays all benefits, eligible member types, and available vehicles.

### Step 4: User Clicks "Book Now"
**Screenshot needed:** EDC page showing "Book Now" button

Description: User initiates the booking process by clicking the Book Now button.

### Step 5: Verification Modal Appears
**Screenshot needed:** EDC verification modal with form fields

Description: A modal appears requesting verification details:
- EDC Student/Staff ID
- Full Name
- Email Address

### Step 6: User Submits Verification
**Screenshot needed:** Verification modal with filled form

Description: User enters their EDC credentials and submits for verification.

### Step 7: Verification Success
**Screenshot needed:** Success message/toast notification

Description: Upon successful verification, user sees a success message.

### Step 8: Redirect to Home with Promo Applied
**Screenshot needed:** Home page with:
- Combined Autostrad + EDC logo in header
- Promo code auto-filled in booking form
- Terms & conditions banner below form

Description: User is redirected to the home page with the promo code automatically applied.

### Step 9: User Completes Booking
**Screenshot needed:** Booking form with "Applied" badge on coupon field

Description: User completes the car search with the discount automatically applied.

---

# 4. Page-by-Page Guide

## 4.1 Home Page

### 4.1.1 EDC Promo Popup
**Screenshot needed:** Full popup modal

**Elements:**
- EDC + Autostrad logos
- "EDC Exclusive Offer!" title
- Description text
- Benefit pills (Special Rates, Free Driver, Free Delivery)
- "Claim Your Discount" button
- "No thanks, continue booking" link

### 4.1.2 Header with Combined Logo (After Verification)
**Screenshot needed:** Header showing combined Autostrad + EDC logo

**Description:** After verification, the header displays a combined logo indicating the active EDC partnership.

### 4.1.3 Booking Form with Promo Applied
**Screenshot needed:** Booking form section

**Elements:**
- Coupon code field showing "Applied" badge
- Promo code displayed

### 4.1.4 Terms & Conditions Banner
**Screenshot needed:** T&C banner below booking form

**Elements:**
- EDC logo
- "EDC Exclusive Discount Applied!" text
- Promo code badge
- Terms displayed as pills

---

## 4.2 EDC Exclusive Page

### 4.2.1 Hero Section
**Screenshot needed:** Top section of EDC page

**Elements:**
- EDC + Autostrad partnership logos
- "EDC EXCLUSIVE OFFER" heading (orange)
- Subtitle text
- Promo code display
- "Book Now" CTA button

### 4.2.2 Benefits Section
**Screenshot needed:** Benefits grid

**Benefits listed:**
- Special Discounted Rates
- Free Additional Driver
- Free Delivery on Monthly Rentals
- No Deposit Option
- Transparent Pricing
- Wide Vehicle Selection

### 4.2.3 Eligibility Section
**Screenshot needed:** Eligibility section

**Member types:**
- EDC Students
- EDC Staff Members
- EDC Instructors

### 4.2.4 Vehicle Listings
**Screenshot needed:** Available vehicles grid

**Description:** Shows available vehicles with discounted pricing for EDC members.

### 4.2.5 Terms & Conditions
**Screenshot needed:** Terms section at bottom

**Terms displayed:**
- Valid EDC ID required
- Offer valid for limited time
- Terms and conditions apply
- [Other terms as configured]

---

## 4.3 Verification Modal

### 4.3.1 Empty Form State
**Screenshot needed:** Modal with empty form

**Form fields:**
- EDC Student/Staff ID (required)
- Full Name (required)
- Email Address (required)
- Submit button
- Close button

### 4.3.2 Filled Form State
**Screenshot needed:** Modal with sample data filled

### 4.3.3 Loading State
**Screenshot needed:** Modal showing loading indicator (if applicable)

### 4.3.4 Success State
**Screenshot needed:** Success toast/message

### 4.3.5 Error State
**Screenshot needed:** Error message (invalid ID, etc.)

---

# 5. Admin Portal Guide

## 5.1 Accessing EDC Settings

**Screenshot needed:** Admin sidebar showing EDC menu item

**Navigation path:** [Describe how to navigate to EDC settings]

## 5.2 Promo Code Management

### 5.2.1 Promo Settings Page
**Screenshot needed:** Admin promo configuration page

**Configurable fields:**
- Promo Code (e.g., EDCVIP2025)
- Discount Percentage
- Discount Type (Percentage/Fixed)
- Valid From Date
- Valid Until Date
- Max Uses
- Max Uses Per User
- Status (Active/Inactive)
- Description (English)
- Description (Arabic)

### 5.2.2 Editing Promo Code
**Screenshot needed:** Edit form with values

### 5.2.3 Saving Changes
**Screenshot needed:** Success message after saving

## 5.3 Terms & Conditions Management

### 5.3.1 Terms List Page
**Screenshot needed:** List of all terms

**Columns:**
- ID / Order
- English Text
- Arabic Text
- Status (Active/Inactive)
- Actions (Edit/Delete)

### 5.3.2 Adding New Term
**Screenshot needed:** Add term modal/form

### 5.3.3 Editing Term
**Screenshot needed:** Edit term modal/form

### 5.3.4 Reordering Terms
**Screenshot needed:** Drag-and-drop or reorder interface

### 5.3.5 Toggling Term Status
**Screenshot needed:** Toggle switch for active/inactive

## 5.4 Usage Statistics (If Available)

**Screenshot needed:** Analytics/stats page

**Metrics:**
- Total promo uses
- Unique users
- Usage by member type (Student/Staff/Instructor)
- Usage trend over time

---

# 6. Technical Integration

## 6.1 System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Frontend     │◀───────▶│     Backend     │◀───────▶│    Database     │
│   (React App)   │   API   │   (Node.js)     │         │   (MongoDB/SQL) │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  Admin Portal   │◀───────▶│   Admin APIs    │
│                 │         │                 │
└─────────────────┘         └─────────────────┘
```

## 6.2 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/edc/promo-info` | GET | Get promo details for frontend |
| `/api/edc/verify` | POST | Verify EDC member |
| `/api/edc/rates` | GET | Get EDC-exclusive car rates |
| `/api/admin/edc/promo` | GET/PUT | Manage promo settings |
| `/api/admin/edc/terms` | CRUD | Manage terms & conditions |

## 6.3 Data Flow

1. **Promo Info Fetch:** Frontend calls `/api/edc/promo-info` to get current promo
2. **Verification:** User submits form → `/api/edc/verify` validates and returns promo code
3. **Promo Application:** Frontend stores verification in localStorage and auto-applies promo
4. **Admin Updates:** Admin changes promo/terms → Backend updates database → Frontend fetches updated data

---

# 7. Appendix

## 7.1 Glossary

| Term | Definition |
|------|------------|
| EDC | Emirates Driving Company |
| Promo Code | Discount code applied at checkout |
| Verification | Process of validating EDC membership |

## 7.2 Related Documents

- EDC Backend API Requirements (`docs/EDC-Backend-Requirements.md`)
- EDC Admin Backend API Requirements (`docs/EDC-Admin-Backend-API-Requirements.md`)
- EDC Admin Portal Requirements (`docs/EDC-Admin-Portal-Requirements.md`)

## 7.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [Date] | Initial document | [Name] |

---

# Screenshot Checklist

Use this checklist to ensure all screenshots are captured:

## Home Page
- [ ] EDC promo popup modal
- [ ] Header with combined logo (after verification)
- [ ] Booking form with promo applied
- [ ] Terms & conditions banner

## EDC Exclusive Page
- [ ] Hero section with logos and title
- [ ] Benefits section
- [ ] Eligibility section
- [ ] Vehicle listings
- [ ] Terms section

## Verification Modal
- [ ] Empty form
- [ ] Filled form
- [ ] Success message
- [ ] Error message (if possible)

## Admin Portal
- [ ] Promo settings page
- [ ] Terms list page
- [ ] Add/Edit term modal
- [ ] Statistics page (if available)

---

# Tips for Creating the Word Document

1. **Use consistent formatting:** Same fonts, heading styles, and spacing throughout
2. **Add borders to screenshots:** Makes them stand out on the page
3. **Number your figures:** "Figure 1: EDC Promo Popup" for easy reference
4. **Add captions:** Brief description under each screenshot
5. **Use page breaks:** Start major sections on new pages
6. **Include header/footer:** Document title, page numbers, date
7. **Create clickable TOC:** Word can auto-generate table of contents
8. **Export as PDF:** For sharing with stakeholders

