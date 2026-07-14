package org.example.hotelerpbackend.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.hotelerpbackend.enums.UserRole;

@Getter
@Setter
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private Boolean active;

}