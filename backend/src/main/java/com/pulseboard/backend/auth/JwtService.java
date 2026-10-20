package com.pulseboard.backend.auth;

import com.pulseboard.backend.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

/**
 * Minimal HS256 JWT implementation using only the JDK.
 * Production would use a vetted library (Nimbus JOSE / JJWT); this keeps the
 * dependency surface small and the token format fully explainable.
 */
@Service
public class JwtService {

  private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
  private static final String HMAC_ALGORITHM = "HmacSHA256";

  private final byte[] secret;
  private final Duration ttl;

  public JwtService(
      @Value("${pulseboard.jwt.secret}") String secret,
      @Value("${pulseboard.jwt.ttl}") Duration ttl) {
    this.secret = secret.getBytes(StandardCharsets.UTF_8);
    this.ttl = ttl;
  }

  public String issue(User user) {
    Instant now = Instant.now();
    String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    String payload = "{"
        + "\"sub\":\"" + user.getId() + "\","
        + "\"email\":\"" + escape(user.getEmail()) + "\","
        + "\"tenantId\":\"" + user.getTenant().getId() + "\","
        + "\"role\":\"" + user.getRole().name() + "\","
        + "\"iat\":" + now.getEpochSecond() + ","
        + "\"exp\":" + now.plus(ttl).getEpochSecond()
        + "}";

    String signingInput = encode(header) + "." + encode(payload);
    return signingInput + "." + ENCODER.encodeToString(sign(signingInput));
  }

  public JwtClaims verify(String token) {
    String[] parts = token.split("\\.");
    if (parts.length != 3) {
      throw new JwtException("Malformed token");
    }

    String signingInput = parts[0] + "." + parts[1];
    byte[] expected = sign(signingInput);
    byte[] provided;
    try {
      provided = DECODER.decode(parts[2]);
    } catch (IllegalArgumentException ex) {
      throw new JwtException("Malformed signature");
    }
    if (!MessageDigest.isEqual(expected, provided)) {
      throw new JwtException("Invalid signature");
    }

    String payload = new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8);

    long exp = Long.parseLong(requireField(payload, "exp"));
    if (Instant.now().getEpochSecond() >= exp) {
      throw new JwtException("Token expired");
    }

    return new JwtClaims(
        UUID.fromString(requireField(payload, "sub")),
        requireField(payload, "email"),
        UUID.fromString(requireField(payload, "tenantId")),
        requireField(payload, "role"),
        Instant.ofEpochSecond(exp));
  }

  private byte[] sign(String signingInput) {
    try {
      Mac mac = Mac.getInstance(HMAC_ALGORITHM);
      mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
      return mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8));
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to sign token", ex);
    }
  }

  private static String encode(String value) {
    return ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8));
  }

  private static String requireField(String json, String key) {
    String value = field(json, key);
    if (value == null) {
      throw new JwtException("Missing claim: " + key);
    }
    return value;
  }

  private static String field(String json, String key) {
    String needle = "\"" + key + "\":";
    int index = json.indexOf(needle);
    if (index < 0) {
      return null;
    }
    int start = index + needle.length();
    if (json.charAt(start) == '"') {
      int end = json.indexOf('"', start + 1);
      return json.substring(start + 1, end);
    }
    int end = start;
    while (end < json.length() && ",}".indexOf(json.charAt(end)) < 0) {
      end++;
    }
    return json.substring(start, end);
  }

  private static String escape(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
