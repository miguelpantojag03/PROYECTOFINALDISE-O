package com.motofix.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String action,
        String detail,
        LocalDateTime createdAt
) {
}
