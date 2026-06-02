package com.motofix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SparePartRequest(
        @NotBlank String name,
        String brand,
        String sku,
        @NotNull BigDecimal unitPrice,
        @NotNull Integer initialStock
) {
}
