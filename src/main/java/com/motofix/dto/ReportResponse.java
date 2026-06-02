package com.motofix.dto;

import java.math.BigDecimal;

public record ReportResponse(
        String name,
        Long count,
        BigDecimal amount
) {
}
