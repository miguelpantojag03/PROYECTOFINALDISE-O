package com.motofix.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AppointmentRequest(
        @NotNull Long customerId,
        @NotNull Long motorcycleId,
        @NotNull LocalDateTime scheduledAt,
        String reason,
        String notes
) {
}
