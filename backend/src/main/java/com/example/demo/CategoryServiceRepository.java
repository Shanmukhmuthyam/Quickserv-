package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryServiceRepository 
       extends JpaRepository<CategoryService, Integer> {

    // ✅ ONLY THIS METHOD
    List<CategoryService> findByNameContainingIgnoreCase(String name);
}