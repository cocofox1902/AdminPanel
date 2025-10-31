import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./EditBarModal.css";

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function EditBarModal({ bar, onClose, onUpdate }) {
  const [barName, setBarName] = useState(bar.name || "");
  const [barPrice, setBarPrice] = useState(
    (bar.regularPrice || bar.regularprice || 0).toString()
  );
  const [selectedLocation, setSelectedLocation] = useState({
    lat: bar.latitude,
    lng: bar.longitude,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLocationSelect = (latlng) => {
    setSelectedLocation({
      lat: latlng.lat,
      lng: latlng.lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!barName.trim() || !barPrice.trim()) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      return;
    }

    const price = parseFloat(barPrice.replace(",", "."));
    if (isNaN(price) || price <= 0) {
      setMessage({ type: "error", text: "Veuillez entrer un prix valide" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onUpdate(bar.id, {
        name: barName.trim(),
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        regularPrice: price,
      });
      setMessage({ type: "success", text: "Bar modifié avec succès" });
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Erreur lors de la modification",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <header className="edit-head">
          <div>
            <h2>Modifier le bar</h2>
            <p>Déplace le marqueur puis mets à jour les informations</p>
          </div>
          <button className="edit-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="edit-body">
          <div className="edit-map">
            <MapContainer
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={15}
              className="edit-map-container"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap"
              />
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
              <LocationMarker onLocationSelect={handleLocationSelect} />
            </MapContainer>
            <div className="edit-coords">
              Position : {selectedLocation.lat.toFixed(6)} ·{" "}
              {selectedLocation.lng.toFixed(6)}
            </div>
          </div>

          <form className="edit-form" onSubmit={handleSubmit}>
            <label>
              Nom du bar
              <input
                type="text"
                value={barName}
                onChange={(e) => setBarName(e.target.value)}
                placeholder="Nom du bar"
                required
              />
            </label>

            <label>
              Prix de la pinte (€)
              <input
                type="text"
                value={barPrice}
                onChange={(e) => setBarPrice(e.target.value)}
                placeholder="5,20"
                required
              />
            </label>

            {message && (
              <div className={`edit-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="edit-actions">
              <button type="submit" className="primary" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                type="button"
                className="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBarModal;
