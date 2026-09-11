package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    // =========================================================
    // CREATE BOOKING
    // POST /api/booking/create
    // Body: { customerId, providerId, serviceName,
    //         serviceCategory, address, serviceDate,
    //         timeSlot, amount, paymentMethod, notes }
    // =========================================================
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Booking booking) {
        try {
            Booking saved = service.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create booking: " + e.getMessage());
        }
    }

    // =========================================================
    // GET SINGLE BOOKING BY ID
    // GET /api/booking/{id}
    // Used by frontend to refresh booking status
    // =========================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return service.getById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching booking");
        }
    }

    // =========================================================
    // GET BOOKINGS FOR A CUSTOMER
    // GET /api/booking/customer/{customerId}
    // Used by CustomerDashboard "My Bookings"
    // =========================================================
    @GetMapping("/customer/{id}")
    public ResponseEntity<?> getCustomerBookings(@PathVariable Long id) {
        try {
            List<Booking> bookings = service.getCustomerBookings(id);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching customer bookings");
        }
    }

    // =========================================================
    // GET BOOKINGS FOR A PROVIDER
    // GET /api/booking/provider/{providerId}
    // Used by ProviderDashboard to show incoming bookings
    // =========================================================
    @GetMapping("/provider/{id}")
    public ResponseEntity<?> getProviderBookings(@PathVariable Long id) {
        try {
            List<Booking> bookings = service.getProviderBookings(id);
            System.out.println("Provider ID: " + id + " | Bookings: " + bookings.size());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching provider bookings");
        }
    }

    // =========================================================
    // UPDATE BOOKING STATUS
    // PUT /api/booking/status/{bookingId}
    // Body: { "status": "CONFIRMED" }
    //
    // Flow:
    //   Provider clicks Confirm  → PENDING    → CONFIRMED
    //   Provider clicks Start    → CONFIRMED  → IN_PROGRESS
    //   Provider clicks Done     → IN_PROGRESS → COMPLETED
    //   Provider/Customer cancel → any        → CANCELLED
    //
    // Customer sees updated status in their dashboard
    // (CustomerDashboard polls /api/booking/customer/{id})
    // =========================================================
    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest req) {
        try {
            if (req.getStatus() == null || req.getStatus().isBlank()) {
                return ResponseEntity.badRequest().body("Status is required");
            }
            BookingStatus status = BookingStatus.valueOf(req.getStatus().toUpperCase().trim());
            Booking updated = service.updateStatus(id, status);
            System.out.println("Booking " + id + " → " + status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid status value: " + req.getStatus()
                          + ". Valid: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update booking: " + e.getMessage());
        }
    }

    // =========================================================
    // GET ALL BOOKINGS (Admin)
    // GET /api/booking/all
    // =========================================================
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(service.getAllBookings());
    }
}