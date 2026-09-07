package com.neuroforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    private String token;
    
    @Builder.Default
    private String type = "Bearer";

    private Long userId;
    private String name;
    private String email;
    private String role;
}
