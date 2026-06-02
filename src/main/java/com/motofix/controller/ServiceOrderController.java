package com.motofix.controller;

import com.motofix.dto.ServiceOrderRequest;
import com.motofix.dto.ServiceOrderResponse;
import com.motofix.dto.DiagnosticRequest;
import com.motofix.model.OrderStatus;
import com.motofix.service.ServiceOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-orders")
@RequiredArgsConstructor
public class ServiceOrderController {
    private final ServiceOrderService serviceOrderService;

    @PostMapping
    public ServiceOrderResponse create(@Valid @RequestBody ServiceOrderRequest request) {
        return serviceOrderService.create(request);
    }

    @GetMapping
    public List<ServiceOrderResponse> findAll() {
        return serviceOrderService.findAll();
    }

    @GetMapping("/{id}")
    public ServiceOrderResponse findById(@PathVariable Long id) {
        return serviceOrderService.findById(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<ServiceOrderResponse> findByCustomer(@PathVariable Long customerId) {
        return serviceOrderService.findByCustomer(customerId);
    }

    @GetMapping("/mechanic/{mechanicId}")
    public List<ServiceOrderResponse> findByMechanic(@PathVariable Long mechanicId) {
        return serviceOrderService.findByMechanic(mechanicId);
    }

    @PatchMapping("/{id}/status")
    public ServiceOrderResponse changeStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return serviceOrderService.changeStatus(id, status);
    }

    @PatchMapping("/{id}/mechanic/{mechanicId}")
    public ServiceOrderResponse assignMechanic(@PathVariable Long id, @PathVariable Long mechanicId) {
        return serviceOrderService.assignMechanic(id, mechanicId);
    }

    @PatchMapping("/{id}/diagnostic")
    public ServiceOrderResponse registerDiagnostic(@PathVariable Long id, @Valid @RequestBody DiagnosticRequest request) {
        return serviceOrderService.registerDiagnostic(id, request.diagnostic());
    }

    @PostMapping("/{id}/services/{serviceId}")
    public ServiceOrderResponse addService(@PathVariable Long id, @PathVariable Long serviceId) {
        return serviceOrderService.addService(id, serviceId);
    }

    @PostMapping("/{id}/spare-parts/{sparePartId}")
    public ServiceOrderResponse addSparePart(@PathVariable Long id, @PathVariable Long sparePartId) {
        return serviceOrderService.addSparePart(id, sparePartId);
    }

    @GetMapping("/{id}/total")
    public Map<String, BigDecimal> calculateTotal(@PathVariable Long id) {
        return Map.of("total", serviceOrderService.calculateTotal(id));
    }

    @PatchMapping("/{id}/finish")
    public ServiceOrderResponse finish(@PathVariable Long id) {
        return serviceOrderService.finish(id);
    }

    @PatchMapping("/{id}/cancel")
    public ServiceOrderResponse cancel(@PathVariable Long id) {
        return serviceOrderService.cancel(id);
    }
}
