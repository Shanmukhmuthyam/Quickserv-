import React, { useEffect, useState } from "react";
import "./Customer.css";
import BookingModal from "./BookingModal";

const API = "http://localhost:7070";

export default function CustomerServices({ providers = [] }) {
  const [bookings, setBookings] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const customerId = localStorage.getItem("userId");

  // ✅ Fetch bookings on load
  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Get bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API}/booking/customer/${customerId}`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  // ✅ Submit review
  const submitReview = async () => {
    try {
      const res = await fetch(`${API}/review/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: reviewModal,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (data.review_id) {
        setMessage("✅ Review submitted successfully!");
        fetchBookings(); // refresh data
      } else {
        setMessage(data.error || "❌ Failed to submit review");
      }
    } catch (err) {
      setMessage("❌ Server error");
    }

    setReviewModal(null);
    setRating(5);
    setComment("");
  };

  return (
    <div className="customer-container">

      {/* ================= SERVICES ================= */}
      <h2>Available Services</h2>
      <div className="service-list">
        {providers.length === 0 ? (
          <p>No providers available</p>
        ) : (
          providers.map((p) => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <button onClick={() => setSelectedProvider(p)}>
                Book
              </button>
            </div>
          ))
        )}
      </div>

      {/* ================= BOOKING MODAL ================= */}
      {selectedProvider && (
        <BookingModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onBooked={() => {
            setSelectedProvider(null);
            fetchBookings(); // no reload
          }}
        />
      )}

      {/* ================= BOOKINGS ================= */}
      <h2>My Bookings</h2>

      {message && <div className="success-msg">{message}</div>}

      <table className="booking-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Provider</th>
            <th>Date</th>
            <th>Status</th>
            <th>Review</th>
          </tr>
        </thead>

        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan="5">No bookings found</td>
            </tr>
          ) : (
            bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.service?.name}</td>
                <td>{b.provider?.name}</td>
                <td>{b.bookingDate}</td>
                <td>
                  <span className={`status-badge ${b.status?.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.status === "COMPLETED" ? (
                    <button
                      className="btn-review"
                      onClick={() => setReviewModal(b.id)}
                    >
                      ⭐ Rate
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= REVIEW MODAL ================= */}
      {reviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Review</h3>

            <label>Rating (1–5):</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={s <= rating ? "star active" : "star"}
                  onClick={() => setRating(s)}
                >
                  ★
                </span>
              ))}
            </div>

            <label>Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your experience..."
              rows={4}
            />

            <div className="modal-actions">
              <button className="btn-primary" onClick={submitReview}>
                Submit
              </button>
              <button
                className="btn-secondary"
                onClick={() => setReviewModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}