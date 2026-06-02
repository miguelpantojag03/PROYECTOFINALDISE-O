package com.motofix.dto;

import com.motofix.model.ServiceType;

import java.math.BigDecimal;

public record ServiceMaintenanceResponse(
        Long id,
        String name,
        ServiceType type,
        BigDecimal basePrice,
        Integer estimatedTime,
        BigDecimal calculatedCost,
        String description
) {
}
