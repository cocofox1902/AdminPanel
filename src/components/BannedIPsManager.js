import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import "./BannedIPsManager.css";

function BannedIPsManager({ token, onUpdate }) {
  const [bannedIPs, setBannedIPs] = useState([]);
  const [newIP, setNewIP] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchBannedIPs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/banned-ips`,
        axiosConfig
      );
      setBannedIPs(response.data);
    } catch (error) {
      console.error("Error fetching banned IPs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedIPs();
  }, []);

  const handleBanIP = async (e) => {
    e.preventDefault();

    if (!newIP) return;

    try {
      await axios.post(
        `${API_URL}/admin/banned-ips`,
        { ip: newIP, reason },
        axiosConfig
      );
      setNewIP("");
      setReason("");
      fetchBannedIPs();
      onUpdate();
    } catch (error) {
      console.error("Error banning IP:", error);
      alert("Failed to ban IP");
    }
  };

  const handleUnban = async (ip) => {
    if (!window.confirm(`Unban IP ${ip}?`)) return;

    try {
      await axios.delete(
        `${API_URL}/admin/banned-ips/${encodeURIComponent(ip)}`,
        axiosConfig
      );
      fetchBannedIPs();
      onUpdate();
    } catch (error) {
      console.error("Error unbanning IP:", error);
      alert("Failed to unban IP");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="banned-ips-manager">
      <div className="ban-form-card">
        <h3>Ban New IP Address</h3>
        <form onSubmit={handleBanIP} className="ban-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="IP Address (e.g., 192.168.1.1)"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              className="ip-input"
              required
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="reason-input"
            />
            <button type="submit" className="ban-button">
              🚫 Ban IP
            </button>
          </div>
        </form>
      </div>

      <div className="banned-ips-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : bannedIPs.length === 0 ? (
          <div className="empty-state">No banned IPs</div>
        ) : (
          bannedIPs.map((item) => (
            <div key={item.ip} className="banned-ip-card">
              <div className="ip-info">
                <div className="ip-address">{item.ip}</div>
                <div className="ip-details">
                  <span className="ip-reason">
                    {item.reason || "No reason provided"}
                  </span>
                  <span className="ip-date">
                    Banned: {formatDate(item.bannedAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUnban(item.ip)}
                className="unban-button"
              >
                Unban
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BannedIPsManager;
