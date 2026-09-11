package com.example.demo;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository       userRepository;
    private final ProviderRepository   providerRepository;
    private final BookingRepository    bookingRepository;

    public UserService(UserRepository userRepository,
                       ProviderRepository providerRepository,
                       BookingRepository bookingRepository) {
        this.userRepository    = userRepository;
        this.providerRepository = providerRepository;
        this.bookingRepository  = bookingRepository;
    }

    // ── Register ──────────────────────────────────────────────────────────────
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered: " + user.getEmail());
        }
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("CUSTOMER");
        }
        return userRepository.save(user);
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return null;
        if (!user.getPassword().equals(password)) return null;
        return user;
    }

    // ── Get all ───────────────────────────────────────────────────────────────
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── Count ─────────────────────────────────────────────────────────────────
    public long getTotalUsers() {
        return userRepository.count();
    }

    // ── Delete user (cascade: bookings + provider profile first) ─────────────
    // @Transactional ensures all deletes succeed or all roll back
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found: " + userId);
        }

        // Step 1: Delete all bookings where this user is the customer
        bookingRepository.deleteByCustomerId(userId);

        // Step 2: If user is a provider, delete their provider profile + provider's bookings
        Provider provider = providerRepository.findByUserId(userId);
        if (provider != null) {
            Long providerId = provider.getProviderId();
            // Delete bookings assigned to this provider
            bookingRepository.deleteByProviderId(providerId);
            // Delete provider profile
            providerRepository.delete(provider);
        }

        // Step 3: Now safe to delete the user
        userRepository.deleteById(userId);
    }

    // ── Find by ID ────────────────────────────────────────────────────────────
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }
}