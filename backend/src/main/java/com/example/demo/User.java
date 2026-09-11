package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;
    private String role;
    private String location;

    public User() {
    }

    public Long getId() { 
        return id; 
    }

    public String getName() { 
        return name; 
    }

    public String getEmail() { 
        return email; 
    }

    public String getPassword() { 
        return password; 
    }

    public String getRole() { 
        return role; 
    }

    public String getLocation() { 
        return location; 
    }

    public void setId(Long id) { 
        this.id = id; 
    }

    public void setName(String name) { 
        this.name = name; 
    }

    public void setEmail(String email) { 
        this.email = email; 
    }

    public void setPassword(String password) { 
        this.password = password; 
    }

    public void setRole(String role) { 
        this.role = role; 
    }

    public void setLocation(String location) { 
        this.location = location; 
    }
}