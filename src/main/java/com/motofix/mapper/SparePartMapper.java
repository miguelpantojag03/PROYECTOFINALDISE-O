package com.motofix.mapper;

import com.motofix.dto.SparePartResponse;
import com.motofix.entity.Inventory;
import com.motofix.entity.SparePart;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SparePartMapper {
    default SparePartResponse toResponse(SparePart sparePart, Inventory inventory) {
        if (sparePart == null) {
            return null;
        }
        return new SparePartResponse(
                sparePart.getId(),
                sparePart.getName(),
                sparePart.getBrand(),
                sparePart.getSku(),
                sparePart.getUnitPrice(),
                inventory == null ? sparePart.getStock() : inventory.getStock()
        );
    }
}
