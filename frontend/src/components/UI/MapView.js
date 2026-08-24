import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { PHONE_PRIMARY, PHONE_PRIMARY_DISPLAY } from "../../config.js/contact";

// Fix default marker icons broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MOROCCO_CENTER = [31.7917, -7.0926];

const makePinSvg = (pinColor, dotColor, size = 44) => {
  const h = Math.round(size * 1.27);
  const cx = size / 2;
  const cy = size * 0.44;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 ${size} ${h}">
    <defs>
      <filter id="sd" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-opacity="0.35"/>
      </filter>
    </defs>
    <path filter="url(#sd)" fill="${pinColor}" stroke="#fff" stroke-width="2"
      d="M${cx} 2C${size * 0.26} 2 ${size * 0.07} ${size * 0.24} ${size * 0.07} ${size * 0.47}
         C${size * 0.07} ${size * 0.8} ${cx} ${h} ${cx} ${h}
         S${size * 0.93} ${size * 0.8} ${size * 0.93} ${size * 0.47}
         C${size * 0.93} ${size * 0.24} ${size * 0.74} 2 ${cx} 2z"/>
    <circle cx="${cx}" cy="${cy}" r="${size * 0.16}" fill="#fff"/>
    <circle cx="${cx}" cy="${cy}" r="${size * 0.073}" fill="${dotColor}"/>
  </svg>`;
};

const brandIcon = L.divIcon({
  html: makePinSvg("#F2421B", "#0D1B2A", 40),
  className: "",
  iconSize: [40, 51],
  iconAnchor: [20, 51],
  popupAnchor: [0, -51],
});

const activeIcon = L.divIcon({
  html: makePinSvg("#0D1B2A", "#F2421B", 52),
  className: "",
  iconSize: [52, 66],
  iconAnchor: [26, 66],
  popupAnchor: [0, -66],
});

// Fit map to all markers; skip when a location is actively selected
function FitBounds({ markers, skip }) {
  const map = useMap();
  useEffect(() => {
    if (skip || !markers || markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 12);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [markers, map, skip]);
  return null;
}

// Smoothly fly to the selected marker
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 13, { duration: 0.7 });
  }, [target, map]);
  return null;
}

// Force Leaflet to recalculate tile layout after CSS sizing settles
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function MapView({ locationCoordinates, locations, activeLocationId, onMarkerClick }) {
  const { t } = useTranslation();

  const markers = useMemo(() => {
    if (locations && locations.length > 0) {
      return locations
        .map((loc) => ({
          id: loc.id,
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.long),
          name: loc.name,
          address: loc.address,
          // Never the per-branch number: the locations table still holds
          // placeholder values seeded from the template. See config.js/contact.js.
          phone: PHONE_PRIMARY_DISPLAY,
          email: loc.recipients?.[0],
          timing: loc.timing_detail,
        }))
        .filter((m) => !isNaN(m.lat) && !isNaN(m.lng));
    }
    return (locationCoordinates || [])
      .map((p) => ({ lat: p.lat, lng: p.lng }))
      .filter((m) => !isNaN(m.lat) && !isNaN(m.lng));
  }, [locationCoordinates, locations]);

  const activeMarker = useMemo(
    () => markers.find((m) => m.id === activeLocationId) || null,
    [markers, activeLocationId]
  );

  return (
    <div className="map-wrapper">
      <MapContainer
        center={MOROCCO_CENTER}
        zoom={6}
        style={{ height: "100%", width: "100%", borderRadius: "20px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={markers} skip={!!activeMarker} />
        <FlyTo target={activeMarker} />
        <InvalidateSize />

        {markers.map((marker, index) => (
          <Marker
            key={`${marker.lat}-${marker.lng}-${index}`}
            position={[marker.lat, marker.lng]}
            icon={marker.id === activeLocationId ? activeIcon : brandIcon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker.id),
            }}
          >
            {marker.name && (
              <Popup>
                <div className="map-info-window">
                  <h6>{marker.name}</h6>
                  {marker.address && (
                    <p className="map-info-address">{marker.address}</p>
                  )}
                  {marker.timing && (
                    <p className="map-info-timing">
                      <i className="far fa-clock"></i> {marker.timing}
                    </p>
                  )}
                  {marker.phone && (
                    <a href={`tel:${PHONE_PRIMARY}`} className="map-info-link" dir="ltr">
                      <i className="fas fa-phone"></i> {marker.phone}
                    </a>
                  )}
                  {marker.email && (
                    <a href={`mailto:${marker.email}`} className="map-info-link">
                      <i className="fas fa-envelope"></i> {marker.email}
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-info-directions"
                  >
                    <i className="fas fa-directions"></i> {t("Get Directions")}
                  </a>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* These pins are delivery and pick-up points, not staffed branches —
          calling them branches claimed an operation Route Facile does not run. */}
      {markers.length > 0 && (
        <div className="map-stats-badge">
          <span className="map-stats-count">{markers.length}</span>
          <span className="map-stats-label">
            {markers.length === 1 ? t("Pick-up Point") : t("Pick-up Points")}
          </span>
        </div>
      )}
    </div>
  );
}

