import React, { useEffect, useState } from "react";
import axios from "axios";

function ProviderReviews({ providerId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:7070/review/provider/${providerId}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  }, [providerId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Provider Reviews</h2>

      {reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        reviews.map((r) => (
          <div key={r.reviewId} style={{ borderBottom: "1px solid gray" }}>
            <p><b>Rating:</b> ⭐ {r.rating}</p>
            <p><b>Comment:</b> {r.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ProviderReviews;