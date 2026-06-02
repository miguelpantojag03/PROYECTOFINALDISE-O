package com.motofix.service;

import com.motofix.dto.SparePartRequest;
import com.motofix.dto.SparePartResponse;

import java.util.List;

public interface InventoryService {
    SparePartResponse registerSparePart(SparePartRequest request);
    List<SparePartResponse> findAll();
    Integer checkStock(Long sparePartId);
    SparePartResponse increaseStock(Long sparePartId, Integer quantity);
    SparePartResponse decreaseStock(Long sparePartId, Integer quantity);
    SparePartResponse update(Long sparePartId, SparePartRequest request);
    void delete(Long sparePartId);
}
