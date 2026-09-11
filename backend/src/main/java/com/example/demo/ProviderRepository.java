package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {

    // ✅ Case-insensitive category search — used by ProviderService & ProviderController
    List<Provider> findByCategoryIgnoreCase(String category);

    // ✅ Location search
    List<Provider> findByLocationIgnoreCase(String location);

    // ✅ Find by userId — used after login to load provider profile
    Provider findByUserId(Long userId);

    // ✅ Only non-blocked providers — used by admin stats
    List<Provider> findByBlockedFalse();

    // ✅ Category + location combined filter
    List<Provider> findByCategoryIgnoreCaseAndLocationIgnoreCase(String category, String location);
}