package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.dto.UpdateProfileDTO;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(@RequestBody UpdateProfileDTO data) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (data.name() != null && !data.name().isEmpty()) {
            user.setName(data.name());
        }
        if (data.profileImage() != null) {
            user.setProfileImage(data.profileImage());
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}
