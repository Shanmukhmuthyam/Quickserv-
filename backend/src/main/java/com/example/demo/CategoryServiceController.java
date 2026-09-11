package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/category-services")
@CrossOrigin(origins = "*")
public class CategoryServiceController {

    private final CategoryServiceRepository repo;

    public CategoryServiceController(CategoryServiceRepository repo) {
        this.repo = repo;
    }

    // ✅ Add service
    @PostMapping("/add")
    public CategoryService addService(@RequestBody CategoryService service) {
        return repo.save(service);
    }

    // ✅ Get ALL services
    @GetMapping("/all")
    public List<CategoryService> getAllServices() {
        return repo.findAll();
    }

    // ✅ Get by NAME (FIXED: handles lowercase + spaces safely)
    @GetMapping("/name/{name}")
    public List<CategoryService> getByName(@PathVariable("name") String name) {

        System.out.println("Searching for: " + name); // 🔥 DEBUG

        return repo.findByNameContainingIgnoreCase(name.trim());
    }
}