import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Leaflet map for the home page "Our Locations" section.
 * Extracted into its own chunk so the heavy Leaflet library is only
 * downloaded when this below-the-fold section is rendered.
 */
// Fallback view when there is nothing to plot: the whole of Morocco.
//
// This used to default to Abu Dhabi (24.4539, 54.3773) — left over from the
// previous UAE business — so before the locations API responded, or whenever it
// returned nothing, visitors were looking at the Gulf.
//
// The centre frames the cities Route Facile serves: Tangier in the north
// (35.8°N) down to Agadir (30.4°N), and Agadir in the west (-9.6°) across to
// Oujda (-1.9°). Zoom 6 fits that span on a phone.
const MOROCCO_CENTER = { lat: 32.5, lng: -6.0 };
const MOROCCO_ZOOM = 6;

const LocationMap = ({ filteredLocations = [], userLocation, routeCoordinates = [], language, t }) => {
  // Markers that actually carry usable coordinates.
  const validLocations = useMemo(
    () =>
      filteredLocations
        .map((loc) => ({
          loc,
          lat: parseFloat(loc.lat ?? loc.latitude),
          lng: parseFloat(loc.lng ?? loc.long ?? loc.longitude),
        }))
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [filteredLocations]
  );

  // With two or more markers, frame them by bounds rather than guessing a zoom
  // from how many there are. The old count-based rule assumed the markers were
  // clustered, which held in a single emirate but not in Morocco — three
  // branches in Tangier, Casablanca and Agadir are ~900 km apart, and zoom 11
  // showed one of them with the others off-screen.
  const mapBounds = useMemo(() => {
    if (userLocation || validLocations.length < 2) return null;
    return validLocations.map((p) => [p.lat, p.lng]);
  }, [validLocations, userLocation]);

  const mapCenter = useMemo(() => {
    if (userLocation) return { lat: userLocation.lat, lng: userLocation.lng };
    if (validLocations.length === 1) {
      return { lat: validLocations[0].lat, lng: validLocations[0].lng };
    }
    return MOROCCO_CENTER;
  }, [validLocations, userLocation]);

  const mapZoom = useMemo(() => {
    if (userLocation) return 11;
    if (validLocations.length === 1) return 13;
    return MOROCCO_ZOOM;
  }, [validLocations.length, userLocation]);

  // Custom icon for user's current location (red/orange pulsing dot)
  const userLocationIcon = useMemo(() => {
    return L.divIcon({
      className: "user-location-marker",
      html: `
        <div class="user-location-pulse"></div>
        <div class="user-location-dot"></div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  }, []);

  return (
    <MapContainer
      key={`${mapCenter.lat}-${mapCenter.lng}-${filteredLocations.length}`}
      {...(mapBounds
        ? { bounds: mapBounds, boundsOptions: { padding: [40, 40] } }
        : { center: [mapCenter.lat, mapCenter.lng], zoom: mapZoom })}
      style={{ width: "100%", height: "100%", minHeight: "500px" }}
      scrollWheelZoom={true}
      dragging={true}
      touchZoom={true}
      doubleClickZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://routefacilecarrental.com/">Route Facile</a>'
        url={
          language === "en"
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      {/* Rendered from the same parsed list the bounds are built from, so the
          framing can never disagree with the markers actually drawn. */}
      {validLocations.map(({ loc: location, lat, lng }, index) => {
        return (
          <Marker key={location.id || index} position={[lat, lng]}>
            <Popup>
              <div>
                <strong>{location.name}</strong>
                <br />
                <small>{location.address}</small>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* User's current location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>
            <div>
              <strong>{t("Your Location")}</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Route polyline between user and selected destination */}
      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: "#E8604C",
            weight: 4,
            opacity: 0.8,
            dashArray: "10, 10",
          }}
        />
      )}
    </MapContainer>
  );
};

export default LocationMap;
