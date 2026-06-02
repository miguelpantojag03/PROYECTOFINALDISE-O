package com.motofix.dto;

import com.motofix.model.AppointmentStatus;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        Long customerId,
        String customerName,
        Long motorcycleId,
        String motorcycle,
        LocalDateTime scheduledAt,
        AppointmentStatus status,
        String reason,
        String notes,
        LocalDateTime createdAt
) {
}
