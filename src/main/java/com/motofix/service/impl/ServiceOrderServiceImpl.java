package com.motofix.service.impl;

import com.motofix.dto.ServiceOrderRequest;
import com.motofix.dto.ServiceOrderResponse;
import com.motofix.entity.*;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.ServiceOrderMapper;
import com.motofix.model.OrderStatus;
import com.motofix.repository.*;
import com.motofix.service.AuditLogService;
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
    private final AuditLogService auditLogService;

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
        ServiceOrder saved = serviceOrderRepository.save(order);
        auditLogService.record("ORDER_CREATED", "Order #" + saved.getId() + " created for customer #" + customer.getId());
        return serviceOrderMapper.toResponse(saved);
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
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Cancelled orders cannot be changed");
        }
        order.setStatus(status);
        if (status == OrderStatus.FINISHED) {
            order.setFinishedAt(LocalDateTime.now());
        }
        auditLogService.record("ORDER_STATUS_CHANGED", "Order #" + id + " changed to " + status);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse assignMechanic(Long id, Long mechanicId) {
        ServiceOrder order = getOrder(id);
        ensureEditable(order);
        Mechanic mechanic = mechanicRepository.findById(mechanicId)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found"));
        order.setMechanic(mechanic);
        order.setStatus(OrderStatus.DIAGNOSIS);
        auditLogService.record("ORDER_MECHANIC_ASSIGNED", "Order #" + id + " assigned to mechanic #" + mechanicId);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse registerDiagnostic(Long id, String diagnostic) {
        ServiceOrder order = getOrder(id);
        ensureEditable(order);
        if (order.getMechanic() != null) {
            order.getMechanic().diagnoseMotorcycle(order, diagnostic);
        } else {
            order.setDiagnostic(diagnostic);
        }
        order.setStatus(OrderStatus.DIAGNOSIS);
        auditLogService.record("ORDER_DIAGNOSTIC_REGISTERED", "Diagnostic registered for order #" + id);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse addService(Long id, Long serviceId) {
        ServiceOrder order = getOrder(id);
        ensureEditable(order);
        ServiceMaintenance service = serviceMaintenanceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance service not found"));
        if (order.getServices().stream().anyMatch(existing -> existing.getId().equals(serviceId))) {
            throw new BusinessException("Service is already attached to this order");
        }
        order.getServices().add(service);
        auditLogService.record("ORDER_SERVICE_ADDED", "Service #" + serviceId + " added to order #" + id);
        return serviceOrderMapper.toResponse(order);
    }

    @Override
    public ServiceOrderResponse addSparePart(Long id, Long sparePartId) {
        ServiceOrder order = getOrder(id);
        ensureEditable(order);
        SparePart sparePart = sparePartRepository.findById(sparePartId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found"));
        if (order.getSpareParts().stream().anyMatch(existing -> existing.getId().equals(sparePartId))) {
            throw new BusinessException("Spare part is already attached to this order");
        }
        Inventory inventory = inventoryRepository.findBySparePartId(sparePartId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found"));
        if (inventory.getStock() <= 0) {
            throw new BusinessException("Spare part has no available stock");
        }
        inventory.setStock(inventory.getStock() - 1);
        sparePart.decreaseStock(1);
        order.getSpareParts().add(sparePart);
        auditLogService.record("ORDER_PART_ADDED", "Spare part #" + sparePartId + " added to order #" + id);
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
        auditLogService.record("ORDER_CANCELLED", "Order #" + id + " cancelled");
        return serviceOrderMapper.toResponse(order);
    }

    private ServiceOrder getOrder(Long id) {
        return serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found"));
    }

    private void ensureEditable(ServiceOrder order) {
        if (order.getStatus() == OrderStatus.FINISHED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Closed orders cannot be modified");
        }
    }
}
