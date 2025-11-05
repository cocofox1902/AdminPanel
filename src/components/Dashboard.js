import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API_URL from "../config";
import EditBarModal from "./EditBarModal";
import CreateBarModal from "./CreateBarModal";
import "./Dashboard.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const NAV_ITEMS = [
  { id: "bars", label: "Bars", icon: "📌" },
  { id: "reports", label: "Reports", icon: "🚨" },
  { id: "bans", label: "Bannissements", icon: "⛔" },
];

const STATUS_FILTERS = [
  { id: "all", label: "Tous" },
  { id: "pending", label: "En attente" },
  { id: "approved", label: "Approuvés" },
  { id: "rejected", label: "Rejetés" },
];

const PRICE_SORTS = [
  { id: "recent", label: "Plus récents" },
  { id: "priceAsc", label: "Prix ↑" },
  { id: "priceDesc", label: "Prix ↓" },
];

const BarsMap = ({ bars }) => {
  if (!bars?.length) {
    return (
      <div className="map-placeholder">
        Aucune donnée à afficher sur la carte
      </div>
    );
  }

  const validBars = bars.filter(
    (bar) =>
      Number.isFinite(Number(bar.latitude)) &&
      Number.isFinite(Number(bar.longitude))
  );

  if (validBars.length === 0) {
    return <div className="map-placeholder">Aucune donnée géolocalisée</div>;
  }

  const first = validBars[0];
  const center = [
    Number(first.latitude) || 48.8566,
    Number(first.longitude) || 2.3522,
  ];

  return (
    <MapContainer center={center} zoom={13} className="bars-map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      {validBars.map((bar) => (
        <Marker
          key={bar.id}
          position={[Number(bar.latitude) || 0, Number(bar.longitude) || 0]}
        >
          <Popup>
            <strong>{bar.name}</strong>
            <div>{formatCurrency(bar.price)}</div>
            <div>Status : {bar.status}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return `${number.toFixed(2)} €`;
};

const formatDateTime = (value) => {
  if (!value || value === "—") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const normalizeBar = (bar) => {
  const priceValue = Number(bar.regularprice ?? bar.regularPrice ?? 0);
  const happyHourValue = bar.happyhourprice ?? bar.happyHourPrice ?? null;
  return {
    id: bar.id,
    name: bar.name,
    status: bar.status,
    price: priceValue,
    regularPrice: priceValue,
    happyHourPrice: happyHourValue ? Number(happyHourValue) : null,
    latitude: bar.latitude,
    longitude: bar.longitude,
    submittedAt: bar.submittedat ?? bar.submittedAt,
    submittedByIP: bar.submittedbyip ?? bar.submittedByIP ?? "—",
    deviceId: bar.deviceid ?? bar.deviceId ?? "—",
  };
};

const normalizeReport = (report) => ({
  id: report.id,
  barName: report.barname ?? report.barName ?? "Bar inconnu",
  status: report.status,
  reason: report.reason,
  reportedAt: report.reportedat ?? report.reportedAt,
  ip: report.reportedbyip ?? report.reportedByIP ?? "—",
  deviceId: report.deviceid ?? report.deviceId ?? "—",
});

const normalizeBan = (item) => ({
  id: item.id,
  ip: item.ip ?? "—",
  deviceId: item.deviceid ?? item.deviceId ?? "—",
  reason: item.reason ?? "",
  bannedAt: item.bannedat ?? item.bannedAt,
});

function Dashboard({ token, onLogout }) {
  const [activeSection, setActiveSection] = useState("bars");
  const [stats, setStats] = useState({
    totalBars: 0,
    barsThisWeek: 0,
    activeDevices: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    reports: 0,
  });
  const [bars, setBars] = useState([]);
  const [barsLoading, setBarsLoading] = useState(false);
  const [barStatusFilter, setBarStatusFilter] = useState("all");
  const [barSort, setBarSort] = useState("recent");
  const [showMap, setShowMap] = useState(false);
  const [editingBar, setEditingBar] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState("pending");

  const [bans, setBans] = useState([]);
  const [bansLoading, setBansLoading] = useState(false);
  const [banForm, setBanForm] = useState({ ip: "", deviceId: "", reason: "" });

  const [actionMessage, setActionMessage] = useState(null);

  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  useEffect(() => {
    fetchStats();
    fetchBars();
    fetchReports(reportFilter);
    fetchBans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReports(reportFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFilter]);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, axiosConfig);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchBars = async () => {
    setBarsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/bars`, axiosConfig);
      setBars(response.data.map(normalizeBar));
    } catch (error) {
      console.error("Error fetching bars:", error);
    } finally {
      setBarsLoading(false);
    }
  };

  const fetchReports = async (status) => {
    setReportsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports?status=${status}`,
        axiosConfig
      );
      setReports(response.data.map(normalizeReport));
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchBans = async () => {
    setBansLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/banned`, axiosConfig);
      setBans(response.data.map(normalizeBan));
    } catch (error) {
      console.error("Error fetching bans:", error);
    } finally {
      setBansLoading(false);
    }
  };

  const filteredBars = useMemo(() => {
    let output = [...bars];
    if (barStatusFilter !== "all") {
      output = output.filter((bar) => bar.status === barStatusFilter);
    }
    if (barSort === "priceAsc") {
      output.sort((a, b) => a.price - b.price);
    } else if (barSort === "priceDesc") {
      output.sort((a, b) => b.price - a.price);
    } else {
      output.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
    return output;
  }, [bars, barStatusFilter, barSort]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/bars/${id}/approve`, {}, axiosConfig);
      setActionMessage({ type: "success", text: "Bar approuvé" });
      fetchBars();
      fetchStats();
    } catch (error) {
      console.error("Error approving bar:", error);
      setActionMessage({ type: "error", text: "Impossible d'approuver" });
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/bars/${id}/reject`, {}, axiosConfig);
      setActionMessage({ type: "success", text: "Bar rejeté" });
      fetchBars();
      fetchStats();
    } catch (error) {
      console.error("Error rejecting bar:", error);
      setActionMessage({ type: "error", text: "Impossible de rejeter" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce bar ?")) return;
    try {
      await axios.delete(`${API_URL}/admin/bars/${id}`, axiosConfig);
      setActionMessage({ type: "success", text: "Bar supprimé" });
      fetchBars();
      fetchStats();
    } catch (error) {
      console.error("Error deleting bar:", error);
      setActionMessage({ type: "error", text: "Suppression impossible" });
    }
  };

  const handleUpdateBar = async (id, updatedData) => {
    try {
      await axios.put(`${API_URL}/admin/bars/${id}`, updatedData, axiosConfig);
      setActionMessage({ type: "success", text: "Bar mis à jour" });
      fetchBars();
      fetchStats();
    } catch (error) {
      console.error("Error updating bar:", error);
      throw new Error(error.response?.data?.error || "Failed to update bar");
    }
  };

  const handleResolveReport = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/admin/reports/${id}/resolve`,
        {},
        axiosConfig
      );
      setActionMessage({ type: "success", text: "Signalement résolu" });
      fetchReports(reportFilter);
      fetchStats();
    } catch (error) {
      console.error("Error resolving report:", error);
      setActionMessage({ type: "error", text: "Résolution impossible" });
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Supprimer ce signalement ?")) return;
    try {
      await axios.delete(`${API_URL}/admin/reports/${id}`, axiosConfig);
      setActionMessage({ type: "success", text: "Signalement supprimé" });
      fetchReports(reportFilter);
      fetchStats();
    } catch (error) {
      console.error("Error deleting report:", error);
      setActionMessage({ type: "error", text: "Suppression impossible" });
    }
  };

  const handleBanSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ip: banForm.ip.trim() || undefined,
      deviceId: banForm.deviceId.trim() || undefined,
      reason: banForm.reason.trim() || undefined,
    };

    if (!payload.ip && !payload.deviceId) {
      setActionMessage({ type: "error", text: "Renseigne IP ou deviceId" });
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/ban`, payload, axiosConfig);
      setBanForm({ ip: "", deviceId: "", reason: "" });
      setActionMessage({ type: "success", text: "Bannissement enregistré" });
      fetchBans();
      fetchStats();
    } catch (error) {
      console.error("Error banning entity:", error);
      setActionMessage({ type: "error", text: "Bannissement impossible" });
    }
  };

  const handleUnban = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/banned/${id}`, axiosConfig);
      setActionMessage({ type: "success", text: "Bannissement levé" });
      fetchBans();
      fetchStats();
    } catch (error) {
      console.error("Error unbanning entity:", error);
      setActionMessage({ type: "error", text: "Impossible de lever le ban" });
    }
  };

  const handleBanSubmitter = async (id) => {
    if (!window.confirm("Bannir l'expéditeur de ce bar ?")) return;
    try {
      await axios.post(`${API_URL}/admin/bars/${id}/ban`, {}, axiosConfig);
      setActionMessage({ type: "success", text: "IP/device bannis" });
      fetchBans();
      fetchStats();
    } catch (error) {
      console.error("Error banning submitter:", error);
      setActionMessage({ type: "error", text: "Impossible de bannir" });
    }
  };

  const analyticsCards = [
    {
      label: "Bars totaux",
      value: stats.totalBars,
      footnote: `${stats.approved} approuvés`,
    },
    {
      label: "Bars ajoutés (7 jours)",
      value: stats.barsThisWeek,
      footnote: `${stats.pending} en attente`,
    },
    {
      label: "Appareils actifs",
      value: stats.activeDevices,
      footnote: `${stats.reports} signalements en attente`,
    },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">BudBeer Admin</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-body">
        <header className="admin-header">
          <div>
            <h1>
              {activeSection === "bars"
                ? "Gestion des bars"
                : activeSection === "reports"
                ? "Signalements"
                : "Bannissements"}
            </h1>
            <p className="header-subtitle">
              Interface sobre pour suivre l'activité
            </p>
          </div>
          <div className="header-actions">
            <button
              className="primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Ajouter un bar
            </button>
            <button className="outline" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="analytics-grid">
          {analyticsCards.map((card) => (
            <div key={card.label} className="analytics-card">
              <span className="analytics-label">{card.label}</span>
              <strong className="analytics-value">{card.value}</strong>
              <span className="analytics-footnote">{card.footnote}</span>
            </div>
          ))}
        </section>

        {actionMessage && (
          <div className={`action-toast ${actionMessage.type}`}>
            {actionMessage.text}
          </div>
        )}

        <main className="admin-content">
          {activeSection === "bars" && (
            <section className="section-card">
              <div className="section-header">
                <div className="filters">
                  <div className="filter-group">
                    {STATUS_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        className={`chip ${
                          barStatusFilter === filter.id ? "active" : ""
                        }`}
                        onClick={() => setBarStatusFilter(filter.id)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="filter-group">
                    {PRICE_SORTS.map((sort) => (
                      <button
                        key={sort.id}
                        className={`chip ${
                          barSort === sort.id ? "active" : ""
                        }`}
                        onClick={() => setBarSort(sort.id)}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="outline"
                  onClick={() => setShowMap((prev) => !prev)}
                >
                  {showMap ? "Masquer la carte" : "Afficher la carte"}
                </button>
              </div>

              <div className={`bars-layout ${showMap ? "with-map" : ""}`}>
                <div className="table-wrapper">
                  {barsLoading ? (
                    <div className="center-placeholder">
                      Chargement des bars…
                    </div>
                  ) : filteredBars.length === 0 ? (
                    <div className="center-placeholder">Aucun bar</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Nom</th>
                          <th>Prix</th>
                          <th>Soumis le</th>
                          <th>User</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBars.map((bar) => (
                          <tr key={bar.id}>
                            <td>
                              <div 
                                className="status-circle" 
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: 
                                    bar.status === 'approved' ? '#4CAF50' : 
                                    bar.status === 'pending' ? '#FF9800' : 
                                    '#F44336'
                                }}
                                title={bar.status}
                              />
                            </td>
                            <td>{bar.name}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span>{formatCurrency(bar.price)}</span>
                                <span style={{ color: bar.happyHourPrice ? '#4CAF50' : '#888', fontSize: '0.9em' }}>
                                  🍻 {bar.happyHourPrice ? formatCurrency(bar.happyHourPrice) : '--'}
                                </span>
                              </div>
                            </td>
                            <td>{formatDateTime(bar.submittedAt)}</td>
                            <td>
                              <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                                <div>{bar.submittedByIP}</div>
                                <div style={{ fontSize: '0.9em', opacity: 0.7, wordBreak: 'break-all' }}>
                                  {bar.deviceId}
                                </div>
                              </div>
                            </td>
                            <td className="row-actions">
                              {bar.status === "pending" && (
                                <>
                                  <button
                                    className="action approve"
                                    onClick={() => handleApprove(bar.id)}
                                    title="Approuver"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="action reject"
                                    onClick={() => handleReject(bar.id)}
                                    title="Rejeter"
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                              <button
                                className="action secondary"
                                onClick={() => setEditingBar(bar)}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                className="action delete"
                                onClick={() => handleDelete(bar.id)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                              <button
                                className="action warning"
                                onClick={() => handleBanSubmitter(bar.id)}
                                title="Bannir l'utilisateur"
                              >
                                ⛔
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {showMap && (
                  <div className="map-wrapper">
                    <BarsMap bars={filteredBars} />
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === "reports" && (
            <section className="section-card">
              <div className="section-header">
                <h2>Signalements</h2>
                <div className="filter-group">
                  {[
                    { id: "pending", label: "En attente" },
                    { id: "resolved", label: "Résolus" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={`chip ${
                        reportFilter === item.id ? "active" : ""
                      }`}
                      onClick={() => setReportFilter(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-wrapper">
                {reportsLoading ? (
                  <div className="center-placeholder">Chargement…</div>
                ) : reports.length === 0 ? (
                  <div className="center-placeholder">Aucun signalement</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Bar</th>
                        <th>Raison</th>
                        <th>Date</th>
                        <th>User</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.barName}</td>
                          <td>{report.reason}</td>
                          <td>{formatDateTime(report.reportedAt)}</td>
                          <td>
                            <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                              <div>{report.ip}</div>
                              <div style={{ fontSize: '0.9em', opacity: 0.7, wordBreak: 'break-all' }}>
                                {report.deviceId}
                              </div>
                            </div>
                          </td>
                          <td className="row-actions">
                            {reportFilter === "pending" && (
                              <button
                                className="action approve"
                                onClick={() => handleResolveReport(report.id)}
                                title="Résoudre"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              className="action delete"
                              onClick={() => handleDeleteReport(report.id)}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {activeSection === "bans" && (
            <section className="section-card">
              <div className="section-header">
                <h2>Bannissements</h2>
              </div>

              <form className="ban-form" onSubmit={handleBanSubmit}>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Adresse IP</label>
                    <input
                      type="text"
                      placeholder="192.168.0.1"
                      value={banForm.ip}
                      onChange={(e) =>
                        setBanForm((prev) => ({ ...prev, ip: e.target.value }))
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Device ID</label>
                    <input
                      type="text"
                      placeholder="UUID..."
                      value={banForm.deviceId}
                      onChange={(e) =>
                        setBanForm((prev) => ({
                          ...prev,
                          deviceId: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Raison</label>
                    <input
                      type="text"
                      placeholder="Optionnel"
                      value={banForm.reason}
                      onChange={(e) =>
                        setBanForm((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit">
                      Ajouter un bannissement
                    </button>
                  </div>
                </div>
              </form>

              <div className="table-wrapper">
                {bansLoading ? (
                  <div className="center-placeholder">Chargement…</div>
                ) : bans.length === 0 ? (
                  <div className="center-placeholder">Aucun bannissement</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Raison</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bans.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                              <div>{entry.ip}</div>
                              <div style={{ fontSize: '0.9em', opacity: 0.7, wordBreak: 'break-all' }}>
                                {entry.deviceId}
                              </div>
                            </div>
                          </td>
                          <td>{entry.reason || "—"}</td>
                          <td>{formatDateTime(entry.bannedAt)}</td>
                          <td className="row-actions">
                            <button
                              className="action delete"
                              onClick={() => handleUnban(entry.id)}
                              title="Lever le ban"
                            >
                              🔓
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {editingBar && (
        <EditBarModal
          bar={editingBar}
          onClose={() => setEditingBar(null)}
          onUpdate={handleUpdateBar}
        />
      )}

      {showCreateModal && (
        <CreateBarModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchBars();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;
