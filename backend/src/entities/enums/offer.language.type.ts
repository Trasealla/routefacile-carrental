// Scoped to the Offer module only — the `offers` table is the only entity
// with `_fr` columns today. Deliberately NOT merged into the shared
// LanguageTypes enum (src/entities/enums/language.type.ts), which is used
// by ~38 other endpoints (cities, locations, cars, bookings, blogs, ...)
// whose tables only have `_en`/`_ar` columns — accepting `lang=fr` there
// would attempt to select a column that doesn't exist and fail.
export enum OfferLanguageTypes {
  ENGLISH = "en",
  ARABIC = "ar",
  FRENCH = "fr",
}
