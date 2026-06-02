package com.motofix.service.impl;

import com.motofix.dto.ExternalStockResponse;
import com.motofix.repository.InventoryRepository;
import com.motofix.repository.SparePartRepository;
import com.motofix.service.SparePartsProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SparePartsProviderServiceImpl implements SparePartsProviderService {
    private final SparePartRepository sparePartRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public ExternalStockResponse checkAvailability(String sku) {
        return sparePartRepository.findBySku(sku)
                .map(part -> {
                    int stock = inventoryRepository.findBySparePartId(part.getId())
                            .map(inventory -> inventory.getStock())
                            .orElse(part.getStock());
                    return new ExternalStockResponse(sku, stock > 0, stock, "MotoFix Local Provider");
                })
                .orElse(new ExternalStockResponse(sku, false, 0, "MotoFix Local Provider"));
    }
}
