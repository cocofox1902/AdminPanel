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

// Composant pour gérer les clics sur la carte et déplacer le marqueur
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleLocationSelect = (latlng) => {
    setSelectedLocation({
      lat: latlng.lat,
      lng: latlng.lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!barName.trim() || !barPrice.trim()) {
      setMessage("Veuillez remplir tous les champs");
      setMessageType("error");
      return;
    }

    const price = parseFloat(barPrice);
    if (isNaN(price) || price <= 0) {
      setMessage("Veuillez entrer un prix valide");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await onUpdate(bar.id, {
        name: barName.trim(),
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        regularPrice: price,
      });
      setMessage("Bar modifié avec succès !");
      setMessageType("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(error.message || "Erreur lors de la modification");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Modifier le bar</h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        <div className="edit-content">
          <div className="map-section">
            <p className="map-instruction">
              📍 Cliquez sur la carte pour déplacer le marqueur
            </p>
            <MapContainer
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={15}
              style={{ height: "300px", width: "100%", borderRadius: "8px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker
                position={[selectedLocation.lat, selectedLocation.lng]}
                onLocationSelect={handleLocationSelect}
              />
            </MapContainer>
            <div className="location-display">
              <strong>Position :</strong> {selectedLocation.lat.toFixed(6)},{" "}
              {selectedLocation.lng.toFixed(6)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor="barName">Nom du bar *</label>
              <input
                type="text"
                id="barName"
                value={barName}
                onChange={(e) => setBarName(e.target.value)}
                placeholder="Ex: Le Café des Sports"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="barPrice">Prix de la pinte (€) *</label>
              <input
                type="number"
                id="barPrice"
                value={barPrice}
                onChange={(e) => setBarPrice(e.target.value)}
                placeholder="Ex: 5.50"
                step="0.01"
                min="0"
                required
              />
            </div>

            {message && (
              <div className={`message ${messageType}`}>{message}</div>
            )}

            <div className="button-group">
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Modification..." : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="cancel-btn"
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

