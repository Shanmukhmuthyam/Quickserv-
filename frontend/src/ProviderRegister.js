import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProviderRegister.css";

function ProviderRegister() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "",
    experience: "",
    availability: "",
    location: "",
    rating: ""
  });

  const userId = localStorage.getItem("userId");

  // ✅ If already completed → go dashboard
  useEffect(() => {
    const isRegistered = localStorage.getItem("providerRegistered");
    if (isRegistered === "true") {
      navigate("/provider-dashboard");
    }
  }, [navigate]);

  // ✅ Fetch categories
  useEffect(() => {
    fetch("http://localhost:7070/api/services/all")
      .then(res => res.json())
      .then((data) => {
        const uniqueCategories = [
          ...new Set(
            data.map(s =>
              (s.category?.name || s.category || "").trim()
            )
          )
        ].filter(Boolean);

        setCategories(uniqueCategories);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load categories");
      });
  }, []);

  // ✅ Handle input
  const handleChange = (e) => {
    setError("");
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Validate form
  const validate = () => {
    if (!form.category) return "Category is required";
    if (!form.experience) return "Experience is required";
    if (!form.location) return "Location is required";
    return null;
  };

  // ✅ Register provider
  const registerProvider = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:7070/provider/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: Number(userId),
          category: form.category,
          experience: Number(form.experience),
          availability: form.availability,
          location: form.location,
          rating: Number(form.rating || 0)
        })
      });

      if (res.ok) {
        // ✅ Mark profile completed
        localStorage.setItem("providerRegistered", "true");
        localStorage.setItem("isProfileComplete", "true");

        // ✅ Redirect to dashboard (FIXED)
        navigate("/provider-dashboard");

      } else {
        setError("Registration failed. Try again.");
      }

    } catch (err) {
      console.error(err);
      setError("Server error. Please try later.");
    }

    setLoading(false);
  };

  return (
    <div className="provider-wrapper">
      <div className="provider-card">

        <h2>Become a Service Provider</h2>
        <p className="subtitle">Join and start earning today 🚀</p>

        {/* ✅ Error UI */}
        {error && <div className="error-box">{error}</div>}

        {/* Category */}
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Experience */}
        <div className="form-group">
          <label>Experience (Years)</label>
          <input
            type="number"
            name="experience"
            placeholder="Enter years of experience"
            value={form.experience}
            onChange={handleChange}
          />
        </div>

        {/* Availability */}
        <div className="form-group">
          <label>Availability</label>
          <input
            type="text"
            name="availability"
            placeholder="9AM - 6PM"
            value={form.availability}
            onChange={handleChange}
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="Enter your city"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        {/* Rating */}
        <div className="form-group">
          <label>Rating</label>
          <input
            type="number"
            name="rating"
            placeholder="0 - 5"
            value={form.rating}
            onChange={handleChange}
          />
        </div>

        {/* Register Button */}
        <button
          className="register-btn"
          onClick={registerProvider}
          disabled={loading}
        >
          {loading ? "Registering..." : "Complete Registration →"}
        </button>

        {/* Add Service */}
        <button
          className="secondary-btn"
          onClick={() => navigate("/provider/add-service")}
        >
          + Add Sub Service
        </button>

      </div>
    </div>
  );
}

export default ProviderRegister;