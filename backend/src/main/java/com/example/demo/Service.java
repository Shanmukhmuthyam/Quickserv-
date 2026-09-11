package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "services") // ✅ avoids SQL reserved word issues
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;

    private double price;

    @Column(length = 1000) // ✅ allows longer text
    private String description;

    private String location;

    // 🔥 CRITICAL FIELD (MUST NOT BE NULL)
    @Column(nullable = false)
    private Long providerId;

    // =========================
    // CONSTRUCTOR
    // =========================
    public Service() {}

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // NAME
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // CATEGORY
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // PRICE
    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    // DESCRIPTION
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // LOCATION
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    // 🔥 PROVIDER ID (VERY IMPORTANT)
    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }
}