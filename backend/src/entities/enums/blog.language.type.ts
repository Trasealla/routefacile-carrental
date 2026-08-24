// Scoped to the Blog module — blogs.title_fr/description_fr/excerpt_fr/etc.
// already exist (populated by the content-engine webhook), but the joined
// categories/tags/city tables only have _en/_ar columns. Deliberately NOT
// merged into the shared LanguageTypes enum (src/entities/enums/language.type.ts),
// which many other endpoints rely on staying en/ar-only.
export enum BlogLanguageTypes {
  ENGLISH = "en",
  ARABIC = "ar",
  FRENCH = "fr",
}
