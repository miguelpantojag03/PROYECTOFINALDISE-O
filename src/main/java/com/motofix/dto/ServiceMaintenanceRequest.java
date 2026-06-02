package com.motofix.dto;

import com.motofix.model.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ServiceMaintenanceRequest(
        @NotBlank String name,
        @NotNull @PositiveOrZero BigDecimal basePrice,
        @Positive Integer estimatedTime,
        @NotNull ServiceType type,
        String oilType,
        @PositiveOrZero BigDecimal oilQuantity,
        @PositiveOrZero BigDecimal filterCost,
        String brakeType,
        Boolean requiresReplacement,
        @PositiveOrZero BigDecimal padsCost,
        @PositiveOrZero BigDecimal laborCost,
        String inspectionLevel,
        @PositiveOrZero Integer checklistItems
) {
}
