// Guard for use-places-autocomplete.
//
// The hook initialises against the Google Maps JavaScript API on mount, and
// logs a console.error ("Google Maps Places API library must be loaded") on
// every render when that library is absent. This site only ever calls the Maps
// *REST* geocode endpoint — the Maps JS SDK is never injected — so the hook
// errored on every page that renders a search form. Lighthouse reports those as
// errors-in-console under Best Practices.
//
// Passing `initOnMount: placesLibraryLoaded()` makes the hook stay quiet when
// the library is missing, and initialise normally if the Maps JS SDK is ever
// added later. Nothing is lost either way: without the SDK the autocomplete
// could not have produced suggestions regardless.
export const placesLibraryLoaded = () =>
  typeof window !== "undefined" &&
  Boolean(window.google && window.google.maps && window.google.maps.places);

export default placesLibraryLoaded;
