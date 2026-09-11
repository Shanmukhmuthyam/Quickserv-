package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    // Who booked
    private Long customerId;

    // ✅ Which provider is assigned
    private Long providerId;

    // Service details (sent from frontend)
    private String serviceName;    // e.g. "Pipe Leak Repair"
    private String serviceCategory; // e.g. "Plumbing"

    // Location
    private String address;

    // Schedule
    private String serviceDate;    // ✅ String: "2025-04-20" (easier for frontend)
    private String timeSlot;       // ✅ ADDED: e.g. "10:00 AM"

    // Timestamps
    private LocalDateTime bookingDate;

    // Payment
    private Double amount;
    private String paymentMethod;  // "upi" | "card" | "cod"

    // Notes from customer
    private String notes;

    // Status
    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getServiceDate() { return serviceDate; }
    public void setServiceDate(String serviceDate) { this.serviceDate = serviceDate; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
}