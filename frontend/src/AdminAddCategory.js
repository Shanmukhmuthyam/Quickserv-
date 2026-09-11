import { useState } from "react";
import "./Admin.css";

function AdminAddCategory(){

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    location: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addCategory = async () => {

    if(!form.name || !form.price || !form.location){
      alert("Please fill all required fields");
      return;
    }

    try{

      const res = await fetch("http://localhost:7070/api/services/add",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          name: form.name,
          category: form.name.toLowerCase(),
          price: Number(form.price),
          description: form.description,
          location: form.location
        })
      });

      if(res.ok){

        alert("Category Added Successfully");

        setForm({
          name:"",
          price:"",
          description:"",
          location:""
        });

      } 
      else{
        alert("Failed to add category");
      }

    } 
    catch(error){
      console.error(error);
      alert("Server Error");
    }

  };

  return(

    <div className="admin-wrapper">

      <div className="admin-card">

        <h2>Add Category</h2>

        {/* Category Name */}

        <input
          type="text"
          name="name"
          placeholder="Category Name (Plumbing, Electrical...)"
          value={form.name}
          onChange={handleChange}
        />

        {/* Service Price */}

        <input
          type="number"
          name="price"
          placeholder="Service Price (₹)"
          value={form.price}
          onChange={handleChange}
        />

        {/* Location */}

        <input
          type="text"
          name="location"
          placeholder="Service Location"
          value={form.location}
          onChange={handleChange}
        />

        {/* Description */}

        <textarea
          name="description"
          placeholder="Service Description"
          value={form.description}
          onChange={handleChange}
        />

        {/* Button */}

        <button onClick={addCategory}>
          Add Category
        </button>

      </div>

    </div>

  );

}

export default AdminAddCategory;