package com.motofix.controller;

import com.motofix.dto.SparePartRequest;
import com.motofix.dto.SparePartResponse;
import com.motofix.dto.ExternalStockResponse;
import com.motofix.service.InventoryService;
import com.motofix.service.SparePartsProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spare-parts")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;
    private final SparePartsProviderService sparePartsProviderService;

    @PostMapping
    public SparePartResponse registerSparePart(@Valid @RequestBody SparePartRequest request) {
        return inventoryService.registerSparePart(request);
    }

    @GetMapping
    public List<SparePartResponse> findAll() {
        return inventoryService.findAll();
    }

    @GetMapping("/{id}/stock")
    public Map<String, Integer> checkStock(@PathVariable Long id) {
        return Map.of("stock", inventoryService.checkStock(id));
    }

    @GetMapping("/provider/{sku}/availability")
    public ExternalStockResponse checkProviderAvailability(@PathVariable String sku) {
        return sparePartsProviderService.checkAvailability(sku);
    }

    @PatchMapping("/{id}/stock/increase")
    public SparePartResponse increaseStock(@PathVariable Long id, @RequestParam Integer quantity) {
        return inventoryService.increaseStock(id, quantity);
    }

    @PatchMapping("/{id}/stock/decrease")
    public SparePartResponse decreaseStock(@PathVariable Long id, @RequestParam Integer quantity) {
        return inventoryService.decreaseStock(id, quantity);
    }

    @PutMapping("/{id}")
    public SparePartResponse update(@PathVariable Long id, @Valid @RequestBody SparePartRequest request) {
        return inventoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inventoryService.delete(id);
    }
}
