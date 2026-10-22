package com.pulseboard.backend.auth;

import com.pulseboard.backend.auth.dto.AuthResponse;
import com.pulseboard.backend.auth.dto.LoginRequest;
import com.pulseboard.backend.auth.dto.RegisterRequest;
import com.pulseboard.backend.auth.dto.UserResponse;
import com.pulseboard.backend.common.ApiException;
import com.pulseboard.backend.tenant.Plan;
import com.pulseboard.backend.tenant.Tenant;
import com.pulseboard.backend.tenant.TenantRepository;
import com.pulseboard.backend.user.Role;
import com.pulseboard.backend.user.User;
import com.pulseboard.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      TenantRepository tenantRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String email = normalizeEmail(request.email());
    String tenantSlug = slugify(request.tenantName());

    Tenant tenant = tenantRepository.findBySlug(tenantSlug)
        .orElseGet(() -> tenantRepository.save(
            new Tenant(tenantSlug, request.tenantName().trim(), Plan.FREE)));

    if (userRepository.existsByTenantIdAndEmail(tenant.getId(), email)) {
      throw ApiException.conflict("email_taken", "Email is already registered");
    }

    User user = new User(
        tenant,
        email,
        passwordEncoder.encode(request.password()),
        request.displayName().trim(),
        Role.OWNER);
    userRepository.save(user);

    return toAuthResponse(user);
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(normalizeEmail(request.email()))
        .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw ApiException.unauthorized("Invalid email or password");
    }

    return toAuthResponse(user);
  }

  @Transactional(readOnly = true)
  public UserResponse me(AuthPrincipal principal) {
    User user = userRepository.findById(principal.userId())
        .orElseThrow(() -> ApiException.unauthorized("Unknown user"));
    return toUserResponse(user);
  }

  private AuthResponse toAuthResponse(User user) {
    return new AuthResponse(jwtService.issue(user), toUserResponse(user));
  }

  private UserResponse toUserResponse(User user) {
    return new UserResponse(
        user.getId(),
        user.getEmail(),
        user.getDisplayName(),
        user.getRole().name(),
        user.getTenant().getId(),
        user.getTenant().getName());
  }

  private static String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private static String slugify(String value) {
    String slug = value.trim().toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("(^-)|(-$)", "");
    return slug.isEmpty() ? "workspace" : slug;
  }
}
