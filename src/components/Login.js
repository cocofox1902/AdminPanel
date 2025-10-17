import React, { useState } from "react";
import axios from "axios";
import API_URL from "../config";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/admin/login`, {
        username,
        password,
      });

      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        setRequires2FA(true);
        setTempToken(response.data.tempToken);
        setError("");
      } else {
        // No 2FA, login directly
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/admin/verify-2fa`, {
        tempToken,
        code: twoFactorCode,
      });

      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTempToken("");
    setTwoFactorCode("");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🍺 BudBeer</h1>
          <h2>Admin Panel</h2>
          {requires2FA && <p className="subtitle">Two-Factor Authentication</p>}
        </div>

        {!requires2FA ? (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="info-message">
              🔐 Enter the 6-digit code from your authenticator app
            </div>

            <div className="form-group">
              <label htmlFor="twoFactorCode">Authentication Code</label>
              <input
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                maxLength="6"
                required
                autoFocus
                className="code-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading || twoFactorCode.length !== 6}
              className="login-button"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="back-button-login"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {!requires2FA && (
          <div className="login-footer">
            <p>🔒 Secured with 2FA</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
