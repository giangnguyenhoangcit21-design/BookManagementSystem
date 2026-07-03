package com.team.bookmanagement.service.impl;

import com.team.bookmanagement.model.dto.request.UserLoginRequest;
import com.team.bookmanagement.model.dto.request.UserRegisterRequest;
import com.team.bookmanagement.model.dto.response.JwtResponse;
import com.team.bookmanagement.model.dto.response.UserResponse;
import com.team.bookmanagement.model.entity.User;
import com.team.bookmanagement.repository.UserRepository;
import com.team.bookmanagement.security.JwtTokenProvider;
import com.team.bookmanagement.security.UserDetailsImpl;
import com.team.bookmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public UserResponse register(UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        // Determine user role
        String role = "ROLE_USER";
        if (request.getRole() != null) {
            String reqRole = request.getRole().trim().toUpperCase();
            if (reqRole.equals("ROLE_ADMIN") || reqRole.equals("ADMIN")) {
                role = "ROLE_ADMIN";
            } else {
                role = "ROLE_USER";
            }
        }

        // Create new user's account
        User user = User.builder()
                .username(request.getUsername())
                .password(encoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        return UserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .role(savedUser.getRole())
                .build();
    }

    @Override
    public JwtResponse login(UserLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");

        return new JwtResponse(jwt, userDetails.getUsername(), role);
    }
}
