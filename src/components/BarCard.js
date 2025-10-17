import React from "react";
import "./BarCard.css";

function BarCard({ bar, onApprove, onReject, onDelete, onEdit, status }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className={`bar-card ${status}`}>
      <div className="bar-card-header">
        <h3>{bar.name}</h3>
        <span className={`status-badge ${bar.status}`}>{bar.status}</span>
      </div>

      <div className="bar-card-body">
        <div className="bar-info">
          <div className="info-row">
            <span className="label">📍 Location:</span>
            <span className="value">
              {bar.latitude?.toFixed(4)}, {bar.longitude?.toFixed(4)}
            </span>
          </div>
          <div className="info-row">
            <span className="label">💰 Price:</span>
            <span className="value">
              €{(bar.regularPrice || bar.regularprice)?.toFixed(2)}
            </span>
          </div>
          <div className="info-row">
            <span className="label">🕒 Submitted:</span>
            <span className="value">
              {formatDate(bar.submittedAt || bar.submittedat)}
            </span>
          </div>
          <div className="info-row">
            <span className="label">🌐 IP:</span>
            <span className="value">
              {bar.submittedByIP || bar.submittedbyip || "N/A"}
            </span>
          </div>
        </div>

        <div className="bar-card-actions">
          {status === "pending" && (
            <>
              <button
                onClick={() => onApprove(bar.id)}
                className="action-button approve"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onReject(bar.id)}
                className="action-button reject"
              >
                ✗ Reject
              </button>
            </>
          )}
          {status === "approved" && (
            <button
              onClick={() => onReject(bar.id)}
              className="action-button reject"
            >
              ✗ Reject
            </button>
          )}
          {status === "rejected" && (
            <button
              onClick={() => onApprove(bar.id)}
              className="action-button approve"
            >
              ✓ Approve
            </button>
          )}
          <button
            onClick={() => onEdit(bar)}
            className="action-button edit"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(bar.id)}
            className="action-button delete"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default BarCard;
