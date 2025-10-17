import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import BarCard from "./BarCard";
import BannedIPsManager from "./BannedIPsManager";
import TwoFactorSettings from "./TwoFactorSettings";
import "./Dashboard.css";

function Dashboard({ token, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    bannedIPs: 0,
  });
  const [bars, setBars] = useState([]);
  const [currentTab, setCurrentTab] = useState("pending");
  const [loading, setLoading] = useState(false);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, axiosConfig);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchBars = async (status) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/bars?status=${status}`,
        axiosConfig
      );
      setBars(response.data);
    } catch (error) {
      console.error("Error fetching bars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBars(currentTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/bars/${id}/approve`, {}, axiosConfig);
      fetchBars(currentTab);
      fetchStats();
    } catch (error) {
      console.error("Error approving bar:", error);
      alert("Failed to approve bar");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/bars/${id}/reject`, {}, axiosConfig);
      fetchBars(currentTab);
      fetchStats();
    } catch (error) {
      console.error("Error rejecting bar:", error);
      alert("Failed to reject bar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bar?")) return;

    try {
      await axios.delete(`${API_URL}/admin/bars/${id}`, axiosConfig);
      fetchBars(currentTab);
      fetchStats();
    } catch (error) {
      console.error("Error deleting bar:", error);
      alert("Failed to delete bar");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍺 BudBeer Admin Panel</h1>
          <div className="header-actions">
            <button
              onClick={() => navigate("/add-bar")}
              className="add-bar-button"
            >
              ➕ Créer un bar
            </button>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card banned">
            <div className="stat-value">{stats.bannedIPs}</div>
            <div className="stat-label">Banned IPs</div>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${currentTab === "pending" ? "active" : ""}`}
            onClick={() => setCurrentTab("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`tab ${currentTab === "approved" ? "active" : ""}`}
            onClick={() => setCurrentTab("approved")}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={`tab ${currentTab === "rejected" ? "active" : ""}`}
            onClick={() => setCurrentTab("rejected")}
          >
            Rejected ({stats.rejected})
          </button>
          <button
            className={`tab ${currentTab === "banned-ips" ? "active" : ""}`}
            onClick={() => setCurrentTab("banned-ips")}
          >
            Banned IPs ({stats.bannedIPs})
          </button>
          <button
            className={`tab ${currentTab === "security" ? "active" : ""}`}
            onClick={() => setCurrentTab("security")}
          >
            🔐 Security
          </button>
        </div>

        <div className="content">
          {currentTab === "banned-ips" ? (
            <BannedIPsManager token={token} onUpdate={fetchStats} />
          ) : currentTab === "security" ? (
            <TwoFactorSettings token={token} />
          ) : (
            <>
              {loading ? (
                <div className="loading">Loading...</div>
              ) : bars.length === 0 ? (
                <div className="empty-state">No {currentTab} bars found</div>
              ) : (
                <div className="bars-grid">
                  {bars.map((bar) => (
                    <BarCard
                      key={bar.id}
                      bar={bar}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onDelete={handleDelete}
                      status={currentTab}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
