package com.bankflow.transaction.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;
@Service
public class JwtService {
    @Value("${application.security.jwt.secret-key}") private String secretKey;
    public String extractUsername(String token) { return extractClaim(token, Claims::getSubject); }
    public <T> T extractClaim(String token, Function<Claims, T> r) { return r.apply(extractAllClaims(token)); }
    public boolean isTokenValid(String token) {
        try { return !extractClaim(token, Claims::getExpiration).before(new Date()); } catch (Exception e) { return false; }
    }
    private Claims extractAllClaims(String t) {
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey))).build().parseSignedClaims(t).getPayload();
    }
}
