package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByCategoryIgnoreCase(String category);

    List<Service> findByCategoryIgnoreCaseAndLocationIgnoreCase(String category, String location);

    List<Service> findByLocationContainingIgnoreCaseAndCategoryContainingIgnoreCaseAndPriceLessThanEqual(
            String location,
            String category,
            Double price
    );
}