# EDC Feature - Quick Test Guide

## Test Credentials


| ID | Name | Email |
|----|------|-------|
| `EDC003` | Dhiraj Bubber | dhiraj.bubber@mwasalat.ae |
| `EDC001` | Alpana Soni | alpana.soni@mwasalat.ae |
| `STF002` | Osamah Alaaeldin Kenawy | osamah.kenawy@mwasalat.ae |


### Staff
| ID | Name | Email |
|----|------|-------|
| `STF001` | Madhurendra Roy | madhurendra.roy@mwasalat.ae |
| `STF002` | Osamah Alaaeldin Kenawy | osamah.kenawy@mwasalat.ae |

### Instructors
| ID | Name | Email |
|----|------|-------|
| `INS001` | Peter Natividad | peter.natividad@mwasalat.ae |
| `INS002` | Rafik Ahmmed | rafik.ahmmed@mwasalat.ae |

### Generic Test IDs (Any name/email works)
| ID | Notes |
|----|-------|
| `TEST123` | Any name/email |
| `DEMO456` | Any name/email |
| `1234` | Any name/email |

---

## Steps to Test

### Flow 1: Via Popup (Home Page)

1. Go to **Home Page** → See EDC popup
2. Click **"Claim Your Discount"** → Goes to EDC page
3. Click **"Book Now"** → Verification modal opens
4. Enter credentials → Click **Submit**
5. Redirected to Home → Promo code auto-applied ✅

### Flow 2: Via Navigation

1. Click **"EDC Offer"** in header menu
2. Click **"Book Now"** → Verification modal opens
3. Enter credentials → Click **Submit**
4. Redirected to Home → Promo code auto-applied ✅

### Flow 3: Direct Booking (After Verification)

1. Complete verification (Flow 1 or 2)
2. Fill booking form (promo already applied)
3. Click **"Find My Car"**
4. Continue with normal booking flow ✅

---

## Quick Verification Test

**Use these credentials:**
```
ID: EDC001
Name: Alpana Soni
Email: alpana.soni@mwasalat.ae
```

**Or use generic:**
```
ID: TEST123
Name: [Any Name]
Email: [Any Email]
```

---

## What to Check

| Step | Expected Result |
|------|-----------------|
| Popup appears on Home | ✓ Shows EDC offer modal |
| Click "Claim Your Discount" | ✓ Goes to /en/edc-exclusive |
| Click "Book Now" | ✓ Verification modal opens |
| Submit valid credentials | ✓ Success message, redirect to Home |
| Home page after verification | ✓ Combined logo in header |
| Coupon field | ✓ Shows "Applied" badge with promo code |
| T&C banner | ✓ Shows below booking form |
| Refresh without booking | ✓ Promo cleared, popup shows again |
| Complete "Find My Car" | ✓ Promo persists through booking |

