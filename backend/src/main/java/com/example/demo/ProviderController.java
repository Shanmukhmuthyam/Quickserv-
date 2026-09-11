package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/providers")   // ✅ FIXED: was /provider, now /api/providers
@CrossOrigin(origins = "*")
public class ProviderController {

    private final ProviderRepository repo;
    private final UserRepository userRepo;

    public ProviderController(ProviderRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    // =====================================================
    // REGISTER PROVIDER (called after user registration)
    // POST /api/providers/register
    // Body: { userId, category, experience, location, ... }
    // =====================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerProvider(@RequestBody Provider provider) {
        try {
            if (provider.getUserId() == null) {
                return ResponseEntity.badRequest().body("userId is required");
            }

            // ✅ Pull name + email from User table so provider profile is complete
            User user = userRepo.findById(provider.getUserId()).orElse(null);
            if (user != null) {
                if (provider.getName() == null || provider.getName().isEmpty()) {
                    provider.setName(user.getName());
                }
                if (provider.getEmail() == null || provider.getEmail().isEmpty()) {
                    provider.setEmail(user.getEmail());
                }
                // Sync location from user if not set
                if (provider.getLocation() == null || provider.getLocation().isEmpty()) {
                    provider.setLocation(user.getLocation());
                }
            }

            Provider saved = repo.save(provider);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to register provider: " + e.getMessage());
        }
    }

    // =====================================================
    // GET ALL PROVIDERS
    // GET /api/providers/all
    // Used by CustomerDashboard to list all providers
    // =====================================================
    @GetMapping("/all")
    public ResponseEntity<List<Provider>> getAllProviders() {
        return ResponseEntity.ok(repo.findAll());
    }

    // =====================================================
    // GET PROVIDERS BY CATEGORY
    // GET /api/providers/category/Plumbing
    // Used by CustomerDashboard when customer clicks a service
    // =====================================================
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Provider>> getByCategory(@PathVariable String category) {
        List<Provider> providers = repo.findByCategoryIgnoreCase(category);
        return ResponseEntity.ok(providers);
    }

    // =====================================================
    // GET PROVIDER BY PROVIDER ID
    // GET /api/providers/{providerId}
    // Used by ProviderDashboard to load profile
    // =====================================================
    @GetMapping("/{providerId}")
    public ResponseEntity<?> getByProviderId(@PathVariable Long providerId) {
        return repo.findById(providerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================
    // GET PROVIDER BY USER ID
    // GET /api/providers/user/{userId}
    // Used after login: userId → providerProfile
    // =====================================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUserId(@PathVariable Long userId) {
        Provider provider = repo.findByUserId(userId);
        if (provider == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(provider);
    }

    // =====================================================
    // GET BY LOCATION
    // GET /api/providers/location/Hyderabad
    // =====================================================
    @GetMapping("/location/{location}")
    public ResponseEntity<List<Provider>> getByLocation(@PathVariable String location) {
        return ResponseEntity.ok(repo.findByLocationIgnoreCase(location));
    }

    // =====================================================
    // UPDATE PROVIDER (edit profile)
    // PUT /api/providers/{providerId}
    // =====================================================
    @PutMapping("/{providerId}")
    public ResponseEntity<?> updateProvider(@PathVariable Long providerId,
                                             @RequestBody Provider updated) {
        return repo.findById(providerId).map(p -> {
            if (updated.getCategory()     != null) p.setCategory(updated.getCategory());
            if (updated.getExperience()   != null) p.setExperience(updated.getExperience());
            if (updated.getLocation()     != null) p.setLocation(updated.getLocation());
            if (updated.getAvailability() != null) p.setAvailability(updated.getAvailability());
            if (updated.getPhone()        != null) p.setPhone(updated.getPhone());
            if (updated.getBio()          != null) p.setBio(updated.getBio());
            if (updated.getChargePerHour() > 0)    p.setChargePerHour(updated.getChargePerHour());
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }
}