package com.motofix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;

public record MotorcycleRequest(
        @NotBlank String brand,
        @NotBlank String model,
        @Min(1900) @Max(2100)
        Integer year,
        @PositiveOrZero
        Integer mileage,
        String plate,
        String vin,
        @NotNull Long customerId
) {
}
