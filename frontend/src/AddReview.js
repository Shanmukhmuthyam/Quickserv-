import React, { useState } from "react";
import axios from "axios";

function AddReview({ bookingId, providerId }) {
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");

  const submitReview = async () => {
    try {
      await axios.post("http://localhost:7070/review/add", {
        bookingId: bookingId,
        rating: parseInt(rating),
        comment: comment,
        provider: { providerId: providerId }
      });

      alert("✅ Review Submitted Successfully");
      setComment("");
      setRating(1);
    } catch (error) {
      console.error(error);
      alert("❌ Error submitting review");
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid gray" }}>
      <h3>Give Rating</h3>

      <label>Rating (1-5): </label>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <br /><br />

      <button onClick={submitReview}>Submit Review</button>
    </div>
  );
}

export default AddReview;