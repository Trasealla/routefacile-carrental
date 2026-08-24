// Prefix on every customer-facing booking reference. Was 'ARC' under the
// previous owner. Bookings issued before the change keep their ARC…
// numbers: nothing parses or strips this prefix, references are stored and
// looked up as whole strings, so both forms coexist safely.
export const BOOKING_NUMBER_PREFIX = 'RF';
export const MAIN_HOST = process.env.FILE_SERVER;
export const BANNERS_PATH = '/admin/banner/';
export const AWARDS_CERTIFICATES_PATH = '/admin/awards_and_certificates/';
export const OFFERS_PATH = '/admin/offer/';
export const CARS_PATH = '/admin/car/car/';
export const TEACHERS_PAGE_PATH = '/admin/teachers_page/';
export const BLOGS_PATH = '/admin/blog/';
export const BRANDS_PATH = '/admin/car/brand/';
export const CITIES_PATH = '/admin/city_pages/';
export const LANDMARKS_PATH = '/admin/city_pages/landmark/';
export const NEIGHBOURHOODS_PATH = '/admin/city_pages/neighbourhood/';
export const CATEGORY_PATH = '/admin/car/category/';

// Domain used for the stand-in address of a guest who checked out with only a
// phone number. The users table demands a unique email, so one is minted; it
// routes nowhere, and anything that sends mail must check for it first.
export const GUEST_EMAIL_DOMAIN = '@guest.route-facile.local';

export const isPlaceholderGuestEmail = (email?: string) =>
  !!email && email.toLowerCase().endsWith(GUEST_EMAIL_DOMAIN);

// Internal notification recipients. All one mailbox for now — these used to be
// the previous owner's address, so every enquiry and booking notification this
// site generated was landing in someone else's inbox.
export const ENQUIRY_MAIN_RECEPIENT = 'info@routefacilecarrental.com';
export const OFFER_ENQUIRY_MAIN_RECEPIENT = 'info@routefacilecarrental.com';
export const LOST_FOUND_REQUEST_MAIN_RECEPIENT = 'info@routefacilecarrental.com';
export const CAREER_JOB_APPLICATION_RECIPIENT = 'info@routefacilecarrental.com';
// Every booking is notified to the business mailbox and to the Gmail archive.
// These were both the same address, which made the CC a no-op and meant the
// second copy the business wanted never actually existed.
export const BOOKING_RESERVATION_RECEPIENT = 'info@routefacilecarrental.com';
export const BOOKING_RESERVATION_RECEPIENT_CC = ['routefacilerental@gmail.com'];
export const BOOKING_RESERVATION_RECEPIENT_TESTING = 'info@routefacilecarrental.com';
export const MARKETING_RECEPIENT = 'info@routefacilecarrental.com';

export const CHAUFFEUR_ENQUIRY_RECPIENT = 'info@routefacilecarrental.com';
export const CHAUFFEUR_ENQUIRY_RECPIENT_CC = ['info@routefacilecarrental.com'];

export const TEACHER_ENQUIRY_RECPIENT_AUH = 'info@routefacilecarrental.com';
export const TEACHER_ENQUIRY_RECPIENT_AUH_CC = 'info@routefacilecarrental.com';

export const TEACHER_ENQUIRY_RECPIENT_DXB = 'info@routefacilecarrental.com';
export const TEACHER_ENQUIRY_RECPIENT_DXB_CC = 'info@routefacilecarrental.com';

// EDC (Cities Driving Company) Enquiry Recipients
// Uses same recipients as Teacher enquiries - update as needed
export const EDC_ENQUIRY_RECPIENT_AUH = 'info@routefacilecarrental.com';
export const EDC_ENQUIRY_RECPIENT_AUH_CC = 'info@routefacilecarrental.com';
export const EDC_ENQUIRY_RECPIENT_DXB = 'info@routefacilecarrental.com';
export const EDC_ENQUIRY_RECPIENT_DXB_CC = 'info@routefacilecarrental.com';

export const PAYMENT_ERROR_RECIPIENT = 'info@routefacilecarrental.com';

export const CACHE_KEY_BANNER = 'home_banners_';
export const CACHE_KEY_BRAND = 'home_brands';
export const CACHE_KEY_HOME_RATES = 'home_rates_';

export const LANGS = ['en', 'ae'];
export const UTC_DIFF_HOURS = 4;
export const MODIFY_BOOKING_BUFFER = 4;

export const MINIMUM_BOOKING_DURATION_HOURS = 4;