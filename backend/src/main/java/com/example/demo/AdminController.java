package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService     userService;
    private final BookingService  bookingService;
    private final ProviderService providerService;

    public AdminController(UserService userService,
                           BookingService bookingService,
                           ProviderService providerService) {
        this.userService     = userService;
        this.bookingService  = bookingService;
        this.providerService = providerService;
    }

    // =========================================================
    // STATS
    // GET /api/admin/stats
    // =========================================================
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_users",     userService.getTotalUsers());
        stats.put("total_bookings",  bookingService.getTotalBookings());
        stats.put("total_providers", providerService.getTotalProviders());
        return ResponseEntity.ok(stats);
    }

    // =========================================================
    // GET ALL USERS
    // GET /api/admin/users
    // =========================================================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // =========================================================
    // DELETE USER (cascade: bookings + provider profile)
    // DELETE /api/admin/user/{id}
    // =========================================================
    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "User and all related data deleted successfully");
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // =========================================================
    // BLOCK PROVIDER
    // PUT /api/admin/provider/block/{providerId}
    // =========================================================
    @PutMapping("/provider/block/{id}")
    public ResponseEntity<?> blockProvider(@PathVariable Long id) {
        try {
            providerService.blockProvider(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Provider blocked successfully");
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    // =========================================================
    // UNBLOCK PROVIDER
    // PUT /api/admin/provider/unblock/{providerId}
    // =========================================================
    @PutMapping("/provider/unblock/{id}")
    public ResponseEntity<?> unblockProvider(@PathVariable Long id) {
        try {
            providerService.unblockProvider(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Provider unblocked successfully");
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }
}