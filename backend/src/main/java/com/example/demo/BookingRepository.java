package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find by customer
    List<Booking> findByCustomerId(Long customerId);

    // Find by provider
    List<Booking> findByProviderId(Long providerId);

    // Find by status
    List<Booking> findByStatus(BookingStatus status);

    // ✅ Direct delete by customerId (avoids loading into memory)
    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.customerId = :customerId")
    void deleteByCustomerId(Long customerId);

    // ✅ Direct delete by providerId
    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.providerId = :providerId")
    void deleteByProviderId(Long providerId);
}