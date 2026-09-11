import { useState, useEffect } from "react";
import "./AddService.css";

function AddService() {

  const userId = localStorage.getItem("userId");

  const [providerCategory, setProviderCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    location: "",
    description: ""
  });

  // ✅ FETCH PROVIDER CATEGORY
  useEffect(() => {
    fetch(`http://localhost:7070/provider/${userId}`)
      .then(res => res.json())
      .then(data => {
        // 🔥 assuming backend returns category
        const category = data.category;

        setProviderCategory(category);
        setForm(prev => ({ ...prev, category: category }));
      })
      .catch(err => console.error("Error loading provider:", err));
  }, [userId]);

  // ✅ ADD SERVICE
  const handleAdd = async () => {

    if (!form.name || !form.category) {
      alert("Please fill required fields");
      return;
    }

    setIsLoading(true);

    try {

      const response = await fetch("http://localhost:7070/api/services/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          providerId: Number(userId)
        })
      });

      if (response.ok) {

        alert("Service Added Successfully ✅");

        setForm({
          name: "",
          category: providerCategory, // keep category
          price: "",
          location: "",
          description: ""
        });

      } else {
        throw new Error("Failed to add service");
      }

    } catch (err) {
      console.error(err);
      alert("Error adding service ❌");
    }

    setIsLoading(false);
  };

  return (
    <div className="add-service-container">
      <div className="add-service-card">

        <h2>Add New Service</h2>

        <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>

          {/* NAME */}
          <input
            type="text"
            placeholder="Service Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          {/* 🔥 CATEGORY DROPDOWN */}
          <select
            value={form.category}
            disabled
          >
            <option>{providerCategory || "Loading..."}</option>
          </select>

          {/* PRICE */}
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
          />

          {/* LOCATION */}
          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Service"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default AddService;