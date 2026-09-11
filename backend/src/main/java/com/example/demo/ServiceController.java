package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceController {

    @Autowired
    private ServiceRepository repo;

    // ✅ ADD SERVICE
    @PostMapping("/add")
    public Service addService(@RequestBody Service service){

        // 🔥 VALIDATION (IMPORTANT)
        if(service.getProviderId() == null){
            throw new RuntimeException("Provider ID is required ❌");
        }

        if(service.getName() == null || service.getName().isEmpty()){
            throw new RuntimeException("Service name is required ❌");
        }

        return repo.save(service);
    }

    // ✅ GET ALL SERVICES
    @GetMapping("/all")
    public List<Service> getAllServices(){
        return repo.findAll();
    }

    // ✅ GET BY CATEGORY (FIXED)
    @GetMapping("/category/{category}")
    public List<Service> getServicesByCategory(@PathVariable String category){

        // 🔥 HANDLE SPACES (IMPORTANT)
        String decodedCategory =
                URLDecoder.decode(category, StandardCharsets.UTF_8);

        return repo.findByCategoryIgnoreCase(decodedCategory);
    }

    // ✅ GET BY CATEGORY + LOCATION
    @GetMapping("/category/{category}/location/{location}")
    public List<Service> getServicesByCategoryAndLocation(
            @PathVariable String category,
            @PathVariable String location){

        String decodedCategory =
                URLDecoder.decode(category, StandardCharsets.UTF_8);

        String decodedLocation =
                URLDecoder.decode(location, StandardCharsets.UTF_8);

        return repo.findByCategoryIgnoreCaseAndLocationIgnoreCase(
                decodedCategory,
                decodedLocation
        );
    }

    // ✅ SEARCH API (SAFE)
    @GetMapping("/search")
    public List<Service> searchServices(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double price
    ){

        if(location == null) location = "";
        if(category == null) category = "";
        if(price == null) price = Double.MAX_VALUE;

        return repo
                .findByLocationContainingIgnoreCaseAndCategoryContainingIgnoreCaseAndPriceLessThanEqual(
                        location,
                        category,
                        price
                );
    }
}