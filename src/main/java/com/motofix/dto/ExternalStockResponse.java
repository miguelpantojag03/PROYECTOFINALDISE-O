package com.motofix.dto;

public record ExternalStockResponse(
        String sku,
        boolean available,
        Integer stock,
        String providerName
) {
}
