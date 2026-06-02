package com.motofix.dto;

import com.motofix.model.NotificationChannel;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long userId,
        String message,
        NotificationChannel channel,
        Boolean readFlag,
        LocalDateTime sentAt
) {
}
