package com.motofix.dto;

import com.motofix.model.PaymentStatus;
import com.motofix.model.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long orderId,
        BigDecimal amount,
        PaymentType type,
        PaymentStatus status,
        LocalDateTime paidAt
) {
}
