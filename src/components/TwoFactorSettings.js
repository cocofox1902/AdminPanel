import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import "./TwoFactorSettings.css";

function TwoFactorSettings({ token }) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/2fa-status`,
        axiosConfig
      );
      setIs2FAEnabled(response.data.enabled);
    } catch (error) {
      console.error("Error fetching 2FA status:", error);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${API_URL}/admin/setup-2fa`,
        {},
        axiosConfig
      );
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setShowSetup(true);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Setup failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${API_URL}/admin/enable-2fa`,
        { code: verificationCode },
        axiosConfig
      );
      setMessage(response.data.message);
      setMessageType("success");
      setIs2FAEnabled(true);
      setShowSetup(false);
      setVerificationCode("");
      setQrCode("");
      setSecret("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Verification failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${API_URL}/admin/disable-2fa`,
        { password: disablePassword },
        axiosConfig
      );
      setMessage(response.data.message);
      setMessageType("success");
      setIs2FAEnabled(false);
      setShowDisable(false);
      setDisablePassword("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Disable failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-factor-settings">
      <div className="settings-header">
        <h2>🔐 Two-Factor Authentication</h2>
        <div
          className={`status-badge ${is2FAEnabled ? "enabled" : "disabled"}`}
        >
          {is2FAEnabled ? "✓ Enabled" : "✗ Disabled"}
        </div>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      {!is2FAEnabled && !showSetup && (
        <div className="settings-content">
          <p>
            Secure your account with two-factor authentication. You'll need to
            enter a code from your authenticator app each time you log in.
          </p>
          <button
            onClick={handleSetup2FA}
            disabled={loading}
            className="primary-button"
          >
            {loading ? "Setting up..." : "Enable 2FA"}
          </button>
        </div>
      )}

      {showSetup && qrCode && (
        <div className="settings-content">
          <div className="qr-section">
            <h3>Step 1: Scan QR Code</h3>
            <p>Open Google Authenticator or any TOTP app and scan this code:</p>
            <img src={qrCode} alt="QR Code" className="qr-code" />
            <div className="secret-key">
              <strong>Manual Key:</strong>
              <code>{secret}</code>
            </div>
          </div>

          <form onSubmit={handleEnable2FA} className="verification-form">
            <h3>Step 2: Verify Code</h3>
            <p>Enter the 6-digit code from your authenticator app:</p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="000000"
              maxLength="6"
              required
              className="code-input"
            />
            <div className="button-group">
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="primary-button"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSetup(false);
                  setQrCode("");
                  setSecret("");
                  setVerificationCode("");
                }}
                className="secondary-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {is2FAEnabled && !showDisable && (
        <div className="settings-content">
          <p>✅ Your account is protected with two-factor authentication.</p>
          <button
            onClick={() => setShowDisable(true)}
            className="danger-button"
          >
            Disable 2FA
          </button>
        </div>
      )}

      {showDisable && (
        <div className="settings-content">
          <form onSubmit={handleDisable2FA} className="disable-form">
            <h3>Disable Two-Factor Authentication</h3>
            <p>Enter your password to confirm:</p>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            <div className="button-group">
              <button
                type="submit"
                disabled={loading}
                className="danger-button"
              >
                {loading ? "Disabling..." : "Confirm Disable"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDisable(false);
                  setDisablePassword("");
                  setMessage("");
                }}
                className="secondary-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TwoFactorSettings;
