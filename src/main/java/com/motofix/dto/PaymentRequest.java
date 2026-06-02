package com.motofix.dto;

import com.motofix.model.PaymentType;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
        @NotNull Long orderId,
        @NotNull PaymentType type
) {
}
