package com.motofix.service;

import com.motofix.dto.ExternalStockResponse;

public interface SparePartsProviderService {
    ExternalStockResponse checkAvailability(String sku);
}
