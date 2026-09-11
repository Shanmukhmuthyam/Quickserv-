import { useEffect, useState } from "react";
import axios from "axios";
import "./Provider.css";

function ProviderBookings() {
  const providerId = Number(localStorage.getItem("userId"));

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load bookings ──────────────────────────────────────────────
  const loadBookings = async () => {
    try {
      const res = await axios.get(
        `http://localhost:7070/api/booking/provider/${providerId}`
      );
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ── Update status ──────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:7070/api/booking/status/${id}`, {
        status,
      });
      loadBookings();
    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    }
  };

  // ── Helpers ────────────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const countByStatus = (status) =>
    bookings.filter((b) => b.status === status).length;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="provider-page">

      {/* ── Header ── */}
      <div className="page-header">
        <h2 className="page-header__title">
          My <span>Bookings</span>
        </h2>
        {!loading && (
          <span className="page-header__count">
            {bookings.length} total
          </span>
        )}
      </div>

      {/* ── Stats Bar ── */}
      {!loading && bookings.length > 0 && (
        <div className="stats-bar">
          <div className="stat-chip stat-chip--accent">
            <span className="stat-chip__label">Total</span>
            <span className="stat-chip__value">{bookings.length}</span>
          </div>
          <div className="stat-chip stat-chip--warning">
            <span className="stat-chip__label">Pending</span>
            <span className="stat-chip__value">{countByStatus("PENDING")}</span>
          </div>
          <div className="stat-chip stat-chip--accent">
            <span className="stat-chip__label">Confirmed</span>
            <span className="stat-chip__value">{countByStatus("CONFIRMED")}</span>
          </div>
          <div className="stat-chip stat-chip--success">
            <span className="stat-chip__label">Completed</span>
            <span className="stat-chip__value">{countByStatus("COMPLETED")}</span>
          </div>
          <div className="stat-chip stat-chip--danger">
            <span className="stat-chip__label">Cancelled</span>
            <span className="stat-chip__value">{countByStatus("CANCELLED")}</span>
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="state-message">
          <div className="spinner" />
          <div className="state-message__title">Loading your bookings…</div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && bookings.length === 0 && (
        <div className="state-message">
          <div className="state-message__icon">📋</div>
          <div className="state-message__title">No bookings yet</div>
          <p>New bookings from customers will appear here.</p>
        </div>
      )}

      {/* ── Booking Cards ── */}
      {!loading && bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map((b) => (
            <div key={b.bookingId} className="booking-card">

              {/* Card Header */}
              <div className="booking-card__header">
                <div>
                  <div className="booking-card__title">{b.serviceName}</div>
                  <div className="booking-card__id">Booking #{b.bookingId}</div>
                </div>
                <span className={`status-badge ${b.status}`}>
                  {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Meta Grid */}
              <div className="booking-card__meta">
                <div className="meta-item">
                  <span className="meta-item__label">Customer ID</span>
                  <span className="meta-item__value">{b.customerId}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-item__label">Service Date</span>
                  <span className="meta-item__value">{formatDate(b.serviceDate)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-item__label">Address</span>
                  <span className="meta-item__value">{b.address || "N/A"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="booking-card__actions">

                {b.status === "PENDING" && (
                  <>
                    <button
                      className="btn btn--accept"
                      onClick={() => updateStatus(b.bookingId, "CONFIRMED")}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn btn--reject"
                      onClick={() => updateStatus(b.bookingId, "CANCELLED")}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {b.status === "CONFIRMED" && (
                  <button
                    className="btn btn--complete"
                    onClick={() => updateStatus(b.bookingId, "COMPLETED")}
                  >
                    ✓ Mark as Completed
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ProviderBookings;
