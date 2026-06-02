package com.motofix.dto;

import com.motofix.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ServiceOrderResponse(
        Long id,
        Long customerId,
        String customerName,
        Long motorcycleId,
        String motorcycle,
        Long mechanicId,
        String mechanicName,
        OrderStatus status,
        String diagnostic,
        LocalDateTime createdAt,
        LocalDateTime finishedAt,
        List<ServiceMaintenanceResponse> services,
        List<SparePartResponse> spareParts,
        BigDecimal total
) {
}
