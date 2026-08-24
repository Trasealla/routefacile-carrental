export enum KycSubmissionStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum KycDocumentType {
    // Legacy single-side values (kept for back-compat with rows created before May 2026).
    CITIES_ID = 'cities_id',
    UAE_DRIVING_LICENSE = 'uae_driving_license',

    // New two-side values (required from May 2026).
    CITIES_ID_FRONT = 'cities_id_front',
    CITIES_ID_BACK = 'cities_id_back',
    UAE_DRIVING_LICENSE_FRONT = 'uae_driving_license_front',
    UAE_DRIVING_LICENSE_BACK = 'uae_driving_license_back',

    PASSPORT_VISA = 'passport_visa',
}
