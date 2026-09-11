import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./CategoryService.css";

/* ─────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────── */
const CATEGORY_ICONS = {
  Cleaning: "🧹", Plumbing: "🔧", Electrical: "⚡", Painting: "🎨",
  Gardening: "🌿", Cooking: "👨‍🍳", Carpentry: "🪚", Security: "🔒",
  Moving: "📦", Pest: "🐛", AC: "❄️", Laundry: "👕",
};

const SERVICE_EMOJIS = ["✨", "⭐", "🌟", "💫", "🔥", "🎯", "🚀", "💎"];
function getEmoji(str) {
  return SERVICE_EMOJIS[str?.charCodeAt(0) % SERVICE_EMOJIS.length] || "⭐";
}

function genDates() {
  const days   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const out    = [];
  const today  = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()],
      sub:   `${months[d.getMonth()]} ${d.getDate()}`,
      value: d.toISOString().split("T")[0],
    });
  }
  return out;
}

const TIME_SLOTS = [
  "08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00",
];
const SLOT_DISABLED   = ["12:00","14:00"]; // simulate unavailable

const PAYMENT_METHODS = [
  { id: "upi",        label: "UPI / GPay",         icon: "📱" },
  { id: "card",       label: "Credit / Debit Card", icon: "💳" },
  { id: "netbanking", label: "Net Banking",          icon: "🏦" },
  { id: "cod",        label: "Pay at Service",       icon: "💵" },
];

const PLATFORM_FEE = 29;

/* ─────────────────────────────────────────
   STAR RATING
───────────────────────────────────────── */
function Stars({ n = 4.5 }) {
  return (
    <span className="cs-rating">
      {"★".repeat(Math.floor(n))}{"☆".repeat(5 - Math.floor(n))} {n.toFixed(1)}
    </span>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function CategoryServiceList() {
  const { category } = useParams();
  const decodedCat   = decodeURIComponent(category || "Services");

  const [services,        setServices]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [sortBy,          setSortBy]          = useState("default");
  const [selectedService, setSelectedService] = useState(null);
  const [step,            setStep]            = useState("form"); // "form" | "success"
  const [selectedDate,    setSelectedDate]    = useState(null);
  const [selectedTime,    setSelectedTime]    = useState(null);
  const [payMethod,       setPayMethod]       = useState("upi");
  const [form,            setForm]            = useState({ address: "", notes: "" });

  const customerId = Number(localStorage.getItem("userId"));
  const DATES      = genDates();

  useEffect(() => { fetchServices(); }, [category]);

  /* ── FETCH ── */
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:7070/api/services/category/${decodedCat}`
      );
      setServices(res.data || []);
    } catch (err) {
      console.error(err);
      setServices([]);
    }
    setLoading(false);
  };

  /* ── BOOK ── */
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) { alert("Please pick a date and time ⏰"); return; }
    if (!form.address.trim())           { alert("Please enter your address 📍");   return; }
    if (!selectedService?.providerId)   { alert("Provider not available ❌");      return; }
    try {
      await axios.post("http://localhost:7070/api/booking/create", {
        customerId,
        providerId:    selectedService.providerId,
        serviceName:   selectedService.name,
        serviceDate:   `${selectedDate}T${selectedTime}:00`,
        address:       form.address,
        notes:         form.notes,
        paymentMethod: payMethod,
      });
      setStep("success");
    } catch (err) {
      console.error(err);
      alert("Booking Failed ❌");
    }
  };

  /* ── OPEN MODAL ── */
  const openBooking = (service) => {
    setSelectedService(service);
    setStep("form");
    setSelectedDate(null);
    setSelectedTime(null);
    setPayMethod("upi");
    setForm({ address: "", notes: "" });
  };

  /* ── DERIVED ── */
  const sorted = [...services].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating")     return (b.rating || 4.2) - (a.rating || 4.2);
    return 0;
  });
  const total      = selectedService ? selectedService.price + PLATFORM_FEE : 0;
  const canConfirm = selectedDate && selectedTime && form.address.trim();

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="cs-root">

      {/* ── HERO ── */}
      <div className="cs-hero">
        <div className="cs-hero-badge">
          <span>{CATEGORY_ICONS[decodedCat] || "🔧"}</span>
          <span>Professional Services</span>
        </div>
        <h1 className="cs-hero-title">{decodedCat} Services</h1>
        <p className="cs-hero-subtitle">
          Trusted professionals in your area · Verified &amp; background-checked
        </p>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="cs-toolbar">
        <span className="cs-toolbar-label">Sort by</span>
        {[
          { key: "default",    label: "Recommended" },
          { key: "price-asc",  label: "Price ↑"     },
          { key: "price-desc", label: "Price ↓"     },
          { key: "rating",     label: "Top Rated"   },
        ].map((s) => (
          <button
            key={s.key}
            className={`cs-sort-btn${sortBy === s.key ? " active" : ""}`}
            onClick={() => setSortBy(s.key)}
          >
            {s.label}
          </button>
        ))}
        {!loading && (
          <span className="cs-count-chip">
            {sorted.length} service{sorted.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="cs-center">
          <div className="cs-spinner" />
          <p>Fetching services for you…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="cs-center">
          <div className="cs-empty-icon">🔍</div>
          <p className="cs-empty-title">No services found</p>
          <p className="cs-empty-sub">Try a different category or check back later.</p>
        </div>
      ) : (
        <div className="cs-grid">
          {sorted.map((s, i) => (
            <div className="cs-card" key={s.id}>
              <div className="cs-card-glow" />

              <div className="cs-card-img">{getEmoji(s.name)}</div>

              <div className="cs-card-body">
                <div className="cs-card-head">
                  <span className="cs-card-name">{s.name}</span>
                  <span className="cs-price-tag">₹{s.price}</span>
                </div>
                <p className="cs-desc">
                  {s.description || "Professional service tailored to your needs."}
                </p>
                <div className="cs-meta">
                  <span className="cs-meta-chip">📍 {s.location || "Your Area"}</span>
                  <span className="cs-meta-chip">
                    <Stars n={s.rating || (4.0 + (i % 10) * 0.1)} />
                  </span>
                  {s.duration && <span className="cs-meta-chip">⏱ {s.duration}</span>}
                </div>
              </div>

              <div className="cs-card-footer">
                <div className="cs-provider">
                  <div className="cs-provider-avatar">
                    {(s.providerName || "P")[0]}
                  </div>
                  <span className="cs-provider-name">
                    {s.providerName || "Verified Pro"}
                  </span>
                </div>
                <button className="cs-book-btn" onClick={() => openBooking(s)}>
                  Book Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL ── */}
      {selectedService && (
        <div
          className="cs-overlay"
          onClick={(e) => e.target === e.currentTarget && setSelectedService(null)}
        >
          <div className="cs-modal">

            {step === "success" ? (

              /* SUCCESS */
              <div className="cs-success">
                <div className="cs-success-icon">✅</div>
                <h2 className="cs-success-title">Booking Confirmed!</h2>
                <p className="cs-success-msg">
                  Your <strong>{selectedService.name}</strong> is scheduled for{" "}
                  <strong>{selectedDate} at {selectedTime}</strong>.
                  <br />We'll notify you with provider details shortly.
                </p>
                <p className="cs-success-ref">
                  Ref: #BK{Math.random().toString(36).slice(2, 8).toUpperCase()}
                </p>
                <button className="cs-done-btn" onClick={() => setSelectedService(null)}>
                  Done
                </button>
              </div>

            ) : (

              /* FORM */
              <>
                <div className="cs-modal-header">
                  <div>
                    <h2 className="cs-modal-title">Book Your Service</h2>
                    <p className="cs-modal-subtitle">Fill in the details below to confirm</p>
                  </div>
                  <button className="cs-modal-close" onClick={() => setSelectedService(null)}>
                    ✕
                  </button>
                </div>

                <div className="cs-modal-service-bar">
                  <div>
                    <div className="cs-modal-service-name">{selectedService.name}</div>
                    <div className="cs-modal-service-meta">
                      {selectedService.location || "Your Area"} ·{" "}
                      {selectedService.providerName || "Verified Pro"}
                    </div>
                  </div>
                  <div className="cs-modal-service-price">₹{selectedService.price}</div>
                </div>

                <div className="cs-modal-body">

                  {/* DATE */}
                  <div>
                    <div className="cs-section-label">Choose a Date</div>
                    <div className="cs-date-grid">
                      {DATES.map((d) => (
                        <div
                          key={d.value}
                          className={`cs-date-option${selectedDate === d.value ? " selected" : ""}`}
                          onClick={() => setSelectedDate(d.value)}
                        >
                          <div className="cs-date-option-day">{d.label}</div>
                          <div className="cs-date-option-date">{d.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIME */}
                  <div>
                    <div className="cs-section-label">Choose a Time</div>
                    <div className="cs-time-grid">
                      {TIME_SLOTS.map((t) => (
                        <div
                          key={t}
                          className={[
                            "cs-time-slot",
                            selectedTime === t        ? "selected"  : "",
                            SLOT_DISABLED.includes(t) ? "disabled"  : "",
                          ].join(" ").trim()}
                          onClick={() => !SLOT_DISABLED.includes(t) && setSelectedTime(t)}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="cs-field">
                    <label className="cs-label">
                      📍 Service Address <span className="req">*</span>
                    </label>
                    <input
                      className="cs-input"
                      type="text"
                      placeholder="Enter your full address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>

                  {/* NOTES */}
                  <div className="cs-field">
                    <label className="cs-label">📝 Special Instructions</label>
                    <textarea
                      className="cs-textarea"
                      placeholder="Any specific requirements or notes for the provider…"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>

                  {/* PAYMENT */}
                  <div className="cs-field">
                    <label className="cs-label">💳 Payment Method</label>
                    <select
                      className="cs-select"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* SUMMARY */}
                  <div>
                    <div className="cs-section-label">Order Summary</div>
                    <div className="cs-summary-box">
                      <div className="cs-summary-row">
                        <span>{selectedService.name}</span>
                        <span>₹{selectedService.price}</span>
                      </div>
                      <div className="cs-summary-row">
                        <span>Platform fee</span>
                        <span>₹{PLATFORM_FEE}</span>
                      </div>
                      <div className="cs-summary-row total">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="cs-modal-actions">
                    <button className="cs-cancel-btn" onClick={() => setSelectedService(null)}>
                      Cancel
                    </button>
                    <button
                      className="cs-confirm-btn"
                      onClick={handleBooking}
                      disabled={!canConfirm}
                    >
                      💳 Pay ₹{total} &amp; Confirm
                    </button>
                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
