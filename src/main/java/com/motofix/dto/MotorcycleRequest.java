package com.motofix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MotorcycleRequest(
        @NotBlank String brand,
        @NotBlank String model,
        Integer year,
        Integer mileage,
        String plate,
        String vin,
        @NotNull Long customerId
) {
}
