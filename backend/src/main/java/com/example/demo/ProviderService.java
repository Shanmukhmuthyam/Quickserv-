package com.example.demo;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProviderService {

    private final ProviderRepository providerRepository;

    public ProviderService(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    // ── Add / Save ────────────────────────────────────────────────────────────
    public Provider addProvider(Provider provider) {
        return providerRepository.save(provider);
    }

    // ── Get by category ───────────────────────────────────────────────────────
    // ✅ FIXED: was findByCategory() → now findByCategoryIgnoreCase()
    public List<Provider> getProvidersByCategory(String category) {
        return providerRepository.findByCategoryIgnoreCase(category);
    }

    // ── Get all ───────────────────────────────────────────────────────────────
    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    // ── Get by userId ─────────────────────────────────────────────────────────
    public Provider getByUserId(Long userId) {
        return providerRepository.findByUserId(userId);
    }

    // ── Admin: block / unblock ────────────────────────────────────────────────
    public void blockProvider(Long id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found with id: " + id));
        provider.setBlocked(true);
        providerRepository.save(provider);
    }

    public void unblockProvider(Long id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found with id: " + id));
        provider.setBlocked(false);
        providerRepository.save(provider);
    }

    // ── Admin stats ───────────────────────────────────────────────────────────
    // ✅ Used by AdminController.getDashboardStats()
    public long getTotalProviders() {
        return providerRepository.count();
    }

    public long getActiveProviders() {
        return providerRepository.findByBlockedFalse().size();
    }
}