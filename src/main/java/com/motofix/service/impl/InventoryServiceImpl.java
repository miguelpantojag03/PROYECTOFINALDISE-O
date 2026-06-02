package com.motofix.service.impl;

import com.motofix.dto.SparePartRequest;
import com.motofix.dto.SparePartResponse;
import com.motofix.entity.Inventory;
import com.motofix.entity.SparePart;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.SparePartMapper;
import com.motofix.repository.InventoryRepository;
import com.motofix.repository.SparePartRepository;
import com.motofix.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {
    private final SparePartRepository sparePartRepository;
    private final InventoryRepository inventoryRepository;
    private final SparePartMapper sparePartMapper;

    @Override
    public SparePartResponse registerSparePart(SparePartRequest request) {
        SparePart sparePart = new SparePart();
        sparePart.setName(request.name());
        sparePart.setBrand(request.brand());
        sparePart.setSku(request.sku());
        sparePart.setUnitPrice(request.unitPrice());
        sparePart.setStock(request.initialStock());
        SparePart saved = sparePartRepository.save(sparePart);

        Inventory inventoryRecord = new Inventory();
        inventoryRecord.setSparePart(saved);
        inventoryRecord.setStock(request.initialStock());
        Inventory inventory = inventoryRepository.save(inventoryRecord);
        return sparePartMapper.toResponse(saved, inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SparePartResponse> findAll() {
        return sparePartRepository.findAll().stream()
                .map(part -> sparePartMapper.toResponse(part, inventoryRepository.findBySparePartId(part.getId()).orElse(null)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Integer checkStock(Long sparePartId) {
        return getInventory(sparePartId).getStock();
    }

    @Override
    public SparePartResponse increaseStock(Long sparePartId, Integer quantity) {
        validateQuantity(quantity);
        Inventory inventory = getInventory(sparePartId);
        inventory.setStock(inventory.getStock() + quantity);
        inventory.getSparePart().increaseStock(quantity);
        return sparePartMapper.toResponse(inventory.getSparePart(), inventory);
    }

    @Override
    public SparePartResponse decreaseStock(Long sparePartId, Integer quantity) {
        validateQuantity(quantity);
        Inventory inventory = getInventory(sparePartId);
        if (inventory.getStock() < quantity) {
            throw new BusinessException("Insufficient stock");
        }
        inventory.setStock(inventory.getStock() - quantity);
        inventory.getSparePart().decreaseStock(quantity);
        return sparePartMapper.toResponse(inventory.getSparePart(), inventory);
    }

    @Override
    public SparePartResponse update(Long sparePartId, SparePartRequest request) {
        SparePart sparePart = getSparePart(sparePartId);
        sparePart.setName(request.name());
        sparePart.setBrand(request.brand());
        sparePart.setSku(request.sku());
        sparePart.setUnitPrice(request.unitPrice());
        sparePart.setStock(request.initialStock());
        Inventory inventory = getInventory(sparePartId);
        inventory.setStock(request.initialStock());
        return sparePartMapper.toResponse(sparePart, inventory);
    }

    @Override
    public void delete(Long sparePartId) {
        Inventory inventory = getInventory(sparePartId);
        inventoryRepository.delete(inventory);
        sparePartRepository.delete(getSparePart(sparePartId));
    }

    private SparePart getSparePart(Long id) {
        return sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found"));
    }

    private Inventory getInventory(Long sparePartId) {
        return inventoryRepository.findBySparePartId(sparePartId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found"));
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BusinessException("Quantity must be greater than zero");
        }
    }
}
