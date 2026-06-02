package com.motofix.service;

import com.motofix.dto.ServiceOrderRequest;
import com.motofix.dto.ServiceOrderResponse;
import com.motofix.model.OrderStatus;

import java.math.BigDecimal;
import java.util.List;

public interface ServiceOrderService {
    ServiceOrderResponse create(ServiceOrderRequest request);
    List<ServiceOrderResponse> findAll();
    ServiceOrderResponse findById(Long id);
    List<ServiceOrderResponse> findByCustomer(Long customerId);
    List<ServiceOrderResponse> findByMechanic(Long mechanicId);
    ServiceOrderResponse changeStatus(Long id, OrderStatus status);
    ServiceOrderResponse assignMechanic(Long id, Long mechanicId);
    ServiceOrderResponse registerDiagnostic(Long id, String diagnostic);
    ServiceOrderResponse addService(Long id, Long serviceId);
    ServiceOrderResponse addSparePart(Long id, Long sparePartId);
    BigDecimal calculateTotal(Long id);
    ServiceOrderResponse finish(Long id);
    ServiceOrderResponse cancel(Long id);
}
