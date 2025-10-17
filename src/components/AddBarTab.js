import React, { useState, useEffect } from "react";
import "./AddBarTab.css";

const AddBarTab = () => {
  const [barName, setBarName] = useState("");
  const [barPrice, setBarPrice] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Coordonnées par défaut (Paris)
  const mapCenter = {
    lat: 48.8566,
    lng: 2.3522,
  };

  // Initialiser la carte Google Maps
  useEffect(() => {
    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: mapCenter,
        mapTypeId: "roadmap",
      });

      // Marqueur pour la position sélectionnée
      let marker = null;

      // Écouter les clics sur la carte
      map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setSelectedLocation({ lat, lng });

        // Supprimer l'ancien marqueur
        if (marker) {
          marker.setMap(null);
        }

        // Créer un nouveau marqueur
        marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: "Position du bar",
        });
      });

      // Marqueur initial au centre
      marker = new window.google.maps.Marker({
        position: mapCenter,
        map: map,
        title: "Position du bar",
      });
      setSelectedLocation(mapCenter);
    };

    // Charger Google Maps si pas déjà chargé
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const token = localStorage.getItem("token");
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
        <h2>Créer un nouveau bar</h2>
        <p>Cliquez sur la carte pour sélectionner la position du bar</p>
      </div>

      <div className="add-bar-content">
        <div className="map-container">
          <div id="map" className="map"></div>
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
