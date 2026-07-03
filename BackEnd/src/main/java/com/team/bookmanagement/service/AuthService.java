package com.team.bookmanagement.service;

import com.team.bookmanagement.model.dto.request.UserLoginRequest;
import com.team.bookmanagement.model.dto.request.UserRegisterRequest;
import com.team.bookmanagement.model.dto.response.JwtResponse;
import com.team.bookmanagement.model.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(UserRegisterRequest request);
    JwtResponse login(UserLoginRequest request);
}
