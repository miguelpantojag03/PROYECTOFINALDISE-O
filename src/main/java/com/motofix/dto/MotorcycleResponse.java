package com.motofix.dto;

public record MotorcycleResponse(
        Long id,
        String brand,
        String model,
        Integer year,
        Integer mileage,
        String plate,
        String vin,
        Long customerId,
        String customerName
) {
}
