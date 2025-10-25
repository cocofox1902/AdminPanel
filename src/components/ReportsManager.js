import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import "./ReportsManager.css";

function ReportsManager({ token, onUpdate }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports?status=${filter}`,
        axiosConfig
      );
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/admin/reports/${id}/resolve`,
        {},
        axiosConfig
      );
      fetchReports();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error resolving report:", error);
      alert("Failed to resolve report");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    try {
      await axios.delete(`${API_URL}/admin/reports/${id}`, axiosConfig);
      fetchReports();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="reports-manager">
      <div className="reports-header">
        <h3>🚨 Signalements</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            En attente
          </button>
          <button
            className={`filter-btn ${filter === "resolved" ? "active" : ""}`}
            onClick={() => setFilter("resolved")}
          >
            Résolus
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : reports.length === 0 ? (
        <div className="empty-state">Aucun signalement {filter}</div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h4>{report.barname || report.barName}</h4>
                <span className={`status-badge ${report.status}`}>
                  {report.status}
                </span>
              </div>

              <div className="report-body">
                <div className="report-reason">
                  <strong>Raison :</strong>
                  <p>{report.reason}</p>
                </div>

                <div className="report-meta">
                  <div className="meta-item">
                    <span className="label">📍 Position:</span>
                    <span className="value">
                      {report.latitude?.toFixed(4)},{" "}
                      {report.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">🕒 Signalé le:</span>
                    <span className="value">
                      {formatDate(report.reportedat || report.reportedAt)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">🌐 IP:</span>
                    <span className="value">
                      {report.reportedbyip || report.reportedByIP || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-actions">
                {filter === "pending" && (
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="action-btn resolve"
                  >
                    ✓ Résoudre
                  </button>
                )}
                <button
                  onClick={() => handleDelete(report.id)}
                  className="action-btn delete"
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportsManager;
