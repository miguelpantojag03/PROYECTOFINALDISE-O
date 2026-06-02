package com.motofix.service.impl;

import com.motofix.dto.ServiceOrderRequest;
import com.motofix.dto.ServiceOrderResponse;
import com.motofix.entity.*;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.ServiceOrderMapper;
import com.motofix.model.OrderStatus;
import com.motofix.repository.*;
import com.motofix.service.ServiceOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceOrderServiceImpl implements ServiceOrderService {
    private final ServiceOrderRepository serviceOrderRepository;
    private final CustomerRepository customerRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final MechanicRepository mechanicRepository;
    private final ServiceMaintenanceRepository serviceMaintenanceRepository;
    private final SparePartRepository sparePartRepository;
    private final InventoryRepository inventoryRepository;
    private final ServiceOrderMapper serviceOrderMapper;

    @Override
    public ServiceOrderResponse create(ServiceOrderRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Motorcycle motorcycle = motorcycleRepository.findById(request.motorcycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));
        ServiceOrder order = ServiceOrder.builder()
                .customer(customer)
                .motorcycle(motorcycle)
                .diagnostic(request.diagnostic())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        return serviceOrderMapper.toResponse(serviceOrderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceOrderResponse> findAll() {
        return serviceOrderRepository.findAll().stream().map(serviceOrderMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceOrderResponse findById(Long id) {
        return serviceOrderMapper.toResponse(getOrder(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceOrderResponse> findByCustomer(Long customerId) {
        return serviceOrderRepository.findByCustomerId(customerId).stream().map(serviceOrderMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceOrderResponse> findByMechanic(Long mechanicId) {
        return serviceOrderRepository.findByMechanicId(mechanicId).stream().map(serviceOrderMapper::toResponse).toList();
    }

    @Override
    public ServiceOrderResponse changeStatus(Long id, OrderStatus status) {
        ServiceOrder order = getOrder(id);
        order.setStatus(status);
        if (status == OrderStatus.FINISHED) {
            order.setFinishedAt(LocalDateTime.now());
        }
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse assignMechanic(Long id, Long mechanicId) {
        ServiceOrder order = getOrder(id);
        Mechanic mechanic = mechanicRepository.findById(mechanicId)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found"));
        order.setMechanic(mechanic);
        order.setStatus(OrderStatus.DIAGNOSIS);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse registerDiagnostic(Long id, String diagnostic) {
        ServiceOrder order = getOrder(id);
        if (order.getMechanic() != null) {
            order.getMechanic().diagnoseMotorcycle(order, diagnostic);
        } else {
            order.setDiagnostic(diagnostic);
        }
        order.setStatus(OrderStatus.DIAGNOSIS);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse addService(Long id, Long serviceId) {
        ServiceOrder order = getOrder(id);
        ServiceMaintenance service = serviceMaintenanceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance service not found"));
        order.getServices().add(service);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse addSparePart(Long id, Long sparePartId) {
        ServiceOrder order = getOrder(id);
        SparePart sparePart = sparePartRepository.findById(sparePartId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found"));
        Inventory inventory = inventoryRepository.findBySparePartId(sparePartId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found"));
        if (inventory.getStock() <= 0) {
            throw new BusinessException("Spare part has no available stock");
        }
        inventory.setStock(inventory.getStock() - 1);
        sparePart.decreaseStock(1);
        order.getSpareParts().add(sparePart);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotal(Long id) {
        return getOrder(id).calculateTotal();
    }

    @Override
    public ServiceOrderResponse finish(Long id) {
        return changeStatus(id, OrderStatus.FINISHED);
    }

    @Override
    public ServiceOrderResponse cancel(Long id) {
        ServiceOrder order = getOrder(id);
        if (order.getStatus() == OrderStatus.FINISHED) {
            throw new BusinessException("Finished orders cannot be cancelled");
        }
        order.setStatus(OrderStatus.CANCELLED);
        return serviceOrderMapper.toResponse(order);
    }

    private ServiceOrder getOrder(Long id) {
        return serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found"));
    }
}
