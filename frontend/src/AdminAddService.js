import { useState, useEffect } from "react";
import "./Admin.css";

function AdminAddService() {

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
    categoryId: ""
  });

  // ✅ FIXED: Hardcoded categories (based on your DB)
  useEffect(() => {

    setCategories([
      { id: 1, name: "Plumbing" },
      { id: 2, name: "Electrical" }
    ]);

  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ADD SERVICE
  const addService = async () => {

    if (!form.name || !form.price || !form.categoryId) {
      alert("Fill required fields");
      return;
    }

    try {

      const res = await fetch("http://localhost:7070/api/services/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          location: form.location,
          categoryId: Number(form.categoryId)
        })
      });

      if (res.ok) {

        alert("Service Added Successfully ✅");

        setForm({
          name: "",
          description: "",
          price: "",
          location: "",
          categoryId: ""
        });

      } else {
        alert("Failed to Add Service ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Server Error ❌");
    }

  };

  return (
    <div className="admin-container">

      <div className="admin-card">

        <h2>Add Service</h2>

        <input
          name="name"
          placeholder="Service Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        {/* ✅ WORKING CATEGORY DROPDOWN */}
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
        >
          <option value="">Select Category</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>

        <button onClick={addService}>
          Add Service
        </button>

      </div>

    </div>
  );
}

export default AdminAddService;