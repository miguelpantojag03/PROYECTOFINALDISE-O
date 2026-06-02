package com.motofix.dto;

import jakarta.validation.constraints.NotNull;

public record ServiceOrderRequest(
        @NotNull Long customerId,
        @NotNull Long motorcycleId,
        String diagnostic
) {
}
