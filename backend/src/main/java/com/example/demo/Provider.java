package com.example.demo;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "providers")
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long providerId;

    // ✅ FIXED: was int, now Long to match User.id
    private Long userId;

    private String name;       // ✅ ADDED: provider's display name
    private String email;      // ✅ ADDED: for profile display
    private String phone;      // ✅ ADDED: contact number

    private String category;   // service category e.g. "Plumbing"
    private String experience; // e.g. "2-5 years"
    private String availability;
    private String location;

    private double rating = 0.0;

    // ✅ ADDED: so customer dashboard can show starting price
    private double chargePerHour = 0.0;

    // ✅ ADDED: bio for profile
    private String bio;

    // Admin module
    @Column(nullable = false)
    private boolean blocked = false;

    // Review relation
    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL)
    private List<Review> reviews;

    public Provider() {}

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public double getChargePerHour() { return chargePerHour; }
    public void setChargePerHour(double chargePerHour) { this.chargePerHour = chargePerHour; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }
}