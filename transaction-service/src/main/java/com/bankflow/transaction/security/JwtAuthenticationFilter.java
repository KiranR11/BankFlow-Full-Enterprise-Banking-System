package com.bankflow.transaction.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Component @RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest req, @NonNull HttpServletResponse res, @NonNull FilterChain chain) throws ServletException, IOException {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            try {
                String jwt = auth.substring(7);
                if (jwtService.isTokenValid(jwt)) {
                    var t = new UsernamePasswordAuthenticationToken(jwtService.extractUsername(jwt), null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
                    SecurityContextHolder.getContext().setAuthentication(t);
                }
            } catch (Exception ignored) {}
        }
        chain.doFilter(req, res);
    }
}
