package com.templepassport.filter;

import com.templepassport.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminJwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public AdminJwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Only filter /api/admin/** and skip the login endpoint itself
        return !path.startsWith("/api/admin/") || path.startsWith("/api/admin/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Admin token required\"}");
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isValidAdminToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Invalid or expired admin token\"}");
            return;
        }

        // Attach username as request attribute so controllers can read it
        request.setAttribute("adminUsername", jwtUtil.extractAdminUsername(token));
        chain.doFilter(request, response);
    }
}
