package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProviderRepository providerRepository;

    public Review addReview(Review review) {

        // Save review
        Review saved = reviewRepository.save(review);

        Long providerId = review.getProvider().getProviderId();

        // Get all reviews of this provider
        List<Review> reviews =
                reviewRepository.findByProvider_ProviderId(providerId);

        // Calculate average rating
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        // Update provider rating
        Provider provider = providerRepository
                .findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        provider.setRating(avg);
        providerRepository.save(provider);

        return saved;
    }

    public List<Review> getReviewsByProvider(Long id) {
        return reviewRepository.findByProvider_ProviderId(id);
    }
}