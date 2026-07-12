package org.example.hotelerpbackend.dto;


import lombok.Getter;
import lombok.Setter;
import org.example.hotelerpbackend.enums.UserRole;

@Getter
@Setter
public class LoginResponse {
    private String message;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;

    public LoginResponse(String message, Long userId, String firstName, String lastName, String email, UserRole role) {
        this.message = message;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }
}
