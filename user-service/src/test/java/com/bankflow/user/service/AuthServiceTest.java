package com.bankflow.user.service;

import com.bankflow.user.dto.request.LoginRequest;
import com.bankflow.user.dto.request.RegisterRequest;
import com.bankflow.user.dto.response.ApiResponse;
import com.bankflow.user.dto.response.AuthResponse;
import com.bankflow.user.exception.UserAlreadyExistsException;
import com.bankflow.user.model.*;
import com.bankflow.user.repository.UserRepository;
import com.bankflow.user.security.JwtService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {
    @Mock
    UserRepository userRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    JwtService jwtService;
    @Mock
    AuthenticationManager authenticationManager;
    @Mock
    KafkaTemplate<String, Object> kafkaTemplate;
    @InjectMocks
    AuthService authService;

    @Test
    @DisplayName("Should register user successfully")
    void shouldRegisterUser() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("John Doe");
        req.setEmail("john@test.com");
        req.setPhone("9876543210");
        req.setPassword("Pass1234!");

        User saved = User.builder()
            .id(1L)
            .userId("USR-00002")
            .fullName("John Doe")
            .email("john@test.com")
            .phone("9876543210")
            .role(Role.CUSTOMER)
            .status(UserStatus.ACTIVE)
            .kycStatus(KycStatus.PENDING)
            .build();

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(saved);
        when(jwtService.generateToken(any())).thenReturn("jwt-token");
        when(kafkaTemplate.send(any(), any())).thenReturn(null);

        ApiResponse<AuthResponse> res = authService.register(req);
        assertThat(res.isSuccess()).isTrue();
        assertThat(res.getData().getEmail()).isEqualTo("john@test.com");
    }

    @Test
    @DisplayName("Should throw when email exists")
    void shouldThrowOnDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@test.com");
        req.setPhone("9876543210");
        req.setPassword("Pass1234!");
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);
        assertThatThrownBy(() -> authService.register(req))
            .isInstanceOf(UserAlreadyExistsException.class);
    }
}
