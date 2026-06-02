package com.motofix.dto;

import java.math.BigDecimal;

public record SparePartResponse(
        Long id,
        String name,
        String brand,
        String sku,
        BigDecimal unitPrice,
        Integer stock
) {
}
