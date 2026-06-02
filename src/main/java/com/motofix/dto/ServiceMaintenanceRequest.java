package com.motofix.dto;

import com.motofix.model.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ServiceMaintenanceRequest(
        @NotBlank String name,
        @NotNull BigDecimal basePrice,
        Integer estimatedTime,
        @NotNull ServiceType type,
        String oilType,
        BigDecimal oilQuantity,
        BigDecimal filterCost,
        String brakeType,
        Boolean requiresReplacement,
        BigDecimal padsCost,
        BigDecimal laborCost,
        String inspectionLevel,
        Integer checklistItems
) {
}
