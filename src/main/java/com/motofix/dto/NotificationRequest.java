package com.motofix.dto;

import com.motofix.model.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
        @NotNull Long userId,
        @NotBlank String message,
        @NotNull NotificationChannel channel
) {
}
