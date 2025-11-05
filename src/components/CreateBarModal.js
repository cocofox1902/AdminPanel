import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API_URL from "../config";
import "./CreateBarModal.css";

// Fixes Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LocationMarker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const CreateBarModal = ({ token, onClose, onSuccess }) => {
  const [barName, setBarName] = useState("");
  const [barPrice, setBarPrice] = useState("");
  const [happyHourPrice, setHappyHourPrice] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocation) {
      setMessage({
        type: "error",
        text: "Clique sur la carte pour choisir l'emplacement.",
      });
      return;
    }

    const normalizedPrice = Number(barPrice.replace(",", "."));
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      setMessage({ type: "error", text: "Prix invalide." });
      return;
    }

    // Valider le prix Happy Hour si renseigné
    let normalizedHappyHourPrice = null;
    if (happyHourPrice.trim() !== "") {
      normalizedHappyHourPrice = Number(happyHourPrice.replace(",", "."));
      if (!Number.isFinite(normalizedHappyHourPrice) || normalizedHappyHourPrice <= 0) {
        setMessage({ type: "error", text: "Prix Happy Hour invalide." });
        return;
      }
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await axios.post(
        `${API_URL}/bars`,
        {
          name: barName.trim(),
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          regularPrice: normalizedPrice,
          happyHourPrice: normalizedHappyHourPrice,
          deviceId: "admin",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({ type: "success", text: "Bar créé avec succès" });
      setTimeout(() => {
        setBarName("");
        setBarPrice("");
        setHappyHourPrice("");
        setSelectedLocation(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Erreur lors de la création",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-bar-overlay" onClick={onClose}>
      <div className="create-bar-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h2>Ajouter un bar</h2>
            <p>Sélectionne un point sur la carte et renseigne les détails</p>
          </div>
          <button className="close-modal" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="modal-body">
          <div className="modal-map">
            <MapContainer
              center={[48.8566, 2.3522]}
              zoom={12}
              className="modal-map-container"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker onSelect={setSelectedLocation} />
              {selectedLocation && <Marker position={selectedLocation} />}
            </MapContainer>
            {selectedLocation ? (
              <div className="coords">
                Lat&nbsp;: {selectedLocation.lat.toFixed(5)} · Lon&nbsp;:
                {selectedLocation.lng.toFixed(5)}
              </div>
            ) : (
              <div className="coords muted">
                Clique sur la carte pour choisir la position
              </div>
            )}
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            <label>
              Nom du bar
              <input
                type="text"
                value={barName}
                onChange={(e) => setBarName(e.target.value)}
                placeholder="Ex: Le Café des Sports"
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

            <label>
              Prix Happy Hour (€)
              <input
                type="text"
                value={happyHourPrice}
                onChange={(e) => setHappyHourPrice(e.target.value)}
                placeholder="4,50 (optionnel)"
              />
            </label>

            {message && (
              <div className={`modal-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="modal-actions">
              <button type="submit" className="primary" disabled={isSubmitting}>
                {isSubmitting ? "Envoi..." : "Créer"}
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
};

export default CreateBarModal;
