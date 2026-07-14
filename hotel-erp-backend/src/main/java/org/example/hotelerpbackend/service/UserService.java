package org.example.hotelerpbackend.service;


import org.example.hotelerpbackend.dto.UpdateUserRequest;
import org.example.hotelerpbackend.entity.AppUser;
import org.example.hotelerpbackend.enums.UserRole;
import org.example.hotelerpbackend.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }

    public List<AppUser> getRecentUsers() {
        return appUserRepository.findTop5ByOrderByIdDesc();
    }

    public Map<String, Long> getUserStats() {
        Map<String, Long> stats = new HashMap<>();

        stats.put("totalUsers", appUserRepository.count());
        stats.put("activeUsers", appUserRepository.countByActiveTrue());
        stats.put("deactivatedUsers", appUserRepository.countByActiveFalse());
        stats.put("admins", appUserRepository.countByRole(UserRole.ADMIN));
        stats.put("managers", appUserRepository.countByRole(UserRole.MANAGER));
        stats.put("receptionists", appUserRepository.countByRole(UserRole.RECEPTIONIST));
        stats.put("serviceStaff", appUserRepository.countByRole(UserRole.SERVICE_STAFF));

        return stats;
    }

    public AppUser createUser(AppUser user) {
        if (appUserRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(UserRole.RECEPTIONIST);
        }

        user.setActive(true);

        return appUserRepository.save(user);
    }

    public AppUser updateUser(Long id, UpdateUserRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return appUserRepository.save(user);
    }

    public AppUser deactivateUser(Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(false);
        return appUserRepository.save(user);
    }

    public AppUser activateUser(Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        return appUserRepository.save(user);
    }

    public void deleteUser(Long id) {
        if (!appUserRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        appUserRepository.deleteById(id);
    }
}