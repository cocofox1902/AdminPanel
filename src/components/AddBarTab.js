import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./AddBarTab.css";

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Composant pour gérer les clics sur la carte
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const AddBarTab = () => {
  const navigate = useNavigate();
  const [barName, setBarName] = useState("");
  const [barPrice, setBarPrice] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Coordonnées par défaut (Paris)
  const mapCenter = [48.8566, 2.3522];

  const handleLocationSelect = (latlng) => {
    setSelectedLocation({
      lat: latlng.lat,
      lng: latlng.lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!barName.trim() || !barPrice.trim() || !selectedLocation) {
      setMessage(
        "Veuillez remplir tous les champs et sélectionner une position sur la carte"
      );
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
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: barName.trim(),
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          regularPrice: price,
        }),
      });

      if (response.ok) {
        await response.json();
        setMessage(`Bar "${barName}" créé avec succès !`);
        setMessageType("success");

        // Réinitialiser le formulaire
        setBarName("");
        setBarPrice("");
        setSelectedLocation(null);
      } else {
        const error = await response.json();
        setMessage(error.message || "Erreur lors de la création du bar");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Erreur de connexion");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-bar-tab">
      <div className="add-bar-header">
        <button onClick={() => navigate("/dashboard")} className="back-button">
          ← Retour au Dashboard
        </button>
        <h2>🗺️ Créer un nouveau bar</h2>
        <p>Cliquez sur la carte pour sélectionner la position du bar</p>
      </div>

      <div className="add-bar-content">
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "500px", width: "100%", borderRadius: "8px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onLocationSelect={handleLocationSelect} />
          </MapContainer>
          {selectedLocation && (
            <div className="location-info">
              <strong>Position sélectionnée :</strong>
              <br />
              Latitude: {selectedLocation.lat.toFixed(6)}
              <br />
              Longitude: {selectedLocation.lng.toFixed(6)}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bar-form">
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

          {message && <div className={`message ${messageType}`}>{message}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !selectedLocation}
          >
            {isSubmitting ? "Création..." : "Créer le bar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBarTab;
