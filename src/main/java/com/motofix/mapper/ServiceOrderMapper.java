package com.motofix.mapper;

import com.motofix.dto.ServiceOrderResponse;
import com.motofix.dto.SparePartResponse;
import com.motofix.entity.Inventory;
import com.motofix.entity.ServiceOrder;
import com.motofix.entity.SparePart;
import com.motofix.repository.InventoryRepository;
import org.mapstruct.Mapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring", uses = ServiceMaintenanceMapper.class)
public abstract class ServiceOrderMapper {
    @Autowired
    protected ServiceMaintenanceMapper serviceMaintenanceMapper;

    @Autowired
    protected InventoryRepository inventoryRepository;

    public ServiceOrderResponse toResponse(ServiceOrder order) {
        List<SparePartResponse> parts = order.getSpareParts().stream()
                .map(this::mapPart)
                .toList();
        return new ServiceOrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomer().getName(),
                order.getMotorcycle().getId(),
                order.getMotorcycle().getBrand() + " " + order.getMotorcycle().getModel(),
                order.getMechanic() == null ? null : order.getMechanic().getId(),
                order.getMechanic() == null ? null : order.getMechanic().getName(),
                order.getStatus(),
                order.getDiagnostic(),
                order.getCreatedAt(),
                order.getFinishedAt(),
                order.getServices().stream().map(serviceMaintenanceMapper::toResponse).toList(),
                parts,
                order.calculateTotal()
        );
    }

    private SparePartResponse mapPart(SparePart part) {
        Inventory inventory = inventoryRepository.findBySparePartId(part.getId()).orElse(null);
        return new SparePartResponse(part.getId(), part.getName(), part.getBrand(), part.getSku(), part.getUnitPrice(), inventory == null ? part.getStock() : inventory.getStock());
    }
}
