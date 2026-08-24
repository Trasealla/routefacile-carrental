// SMS bodies. Kept short on purpose: anything over 160 characters is billed and
// delivered as multiple parts, so the booking messages carry one phone number
// and one URL rather than the full contact block the emails use.
export const REGISTER_USER = 'Welcome to Route Facile Car Rental. Your OTP to activate your account password is, [otp]'
export const CONFIRM_ACCOUNT = 'Congratulations, Your Route Facile account has been activated.'
export const FORGOT_PASSWORD = 'Your OTP to reset your Route Facile account password is, [otp]. Do not share your OTP with any one.'
export const RESET_PASSWORD = 'Your Route Facile account password has been successfully changed.'
export const CONFIRM_BOOKING = 'Dear [user], Your booking no. [booking_number] with Route Facile Car Rental is confirmed. For queries please call +212 655 585 859 or visit routefacilecarrental.com'
export const EDIT_BOOKING = 'Dear [user], Your booking no. [booking_number] with Route Facile Car Rental has been modified. For queries please call +212 655 585 859 or visit routefacilecarrental.com'
export const EXTEND_BOOKING = 'Dear [user], Your booking no. [booking_number] with Route Facile Car Rental has been extended. For queries please call +212 655 585 859 or visit routefacilecarrental.com'
export const CANCEL_BOOKING = 'Your booking with Route Facile Car Rental has been cancelled.'
