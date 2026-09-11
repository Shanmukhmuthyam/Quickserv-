package com.example.demo;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository repo;

    public BookingService(BookingRepository repo) {
        this.repo = repo;
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public Booking createBooking(Booking booking) {
        booking.setBookingDate(LocalDateTime.now());
        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.PENDING);
        }
        if (booking.getCustomerId() == null)
            throw new RuntimeException("Customer ID is required");
        if (booking.getProviderId() == null)
            throw new RuntimeException("Provider ID is required");
        if (booking.getServiceName() == null || booking.getServiceName().isEmpty())
            throw new RuntimeException("Service name is required");
        return repo.save(booking);
    }

    // ── Get single booking ────────────────────────────────────────────────────
    public Optional<Booking> getById(Long bookingId) {
        return repo.findById(bookingId);
    }

    // ── Get by customer ───────────────────────────────────────────────────────
    public List<Booking> getCustomerBookings(Long customerId) {
        return repo.findByCustomerId(customerId);
    }

    // ── Get by provider ───────────────────────────────────────────────────────
    public List<Booking> getProviderBookings(Long providerId) {
        return repo.findByProviderId(providerId);
    }

    // ── Get all ───────────────────────────────────────────────────────────────
    public List<Booking> getAllBookings() {
        return repo.findAll();
    }

    // ── Count (admin stats) ───────────────────────────────────────────────────
    public long getTotalBookings() {
        return repo.count();
    }

    // ── Update status ─────────────────────────────────────────────────────────
    public Booking updateStatus(Long bookingId, BookingStatus status) {
        Booking booking = repo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setStatus(status);
        return repo.save(booking);
    }
}