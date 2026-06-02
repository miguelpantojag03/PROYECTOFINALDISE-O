package com.motofix.service.impl;

import com.motofix.dto.ReportResponse;
import com.motofix.entity.Payment;
import com.motofix.entity.ServiceOrder;
import com.motofix.repository.InventoryRepository;
import com.motofix.repository.PaymentRepository;
import com.motofix.repository.ServiceMaintenanceRepository;
import com.motofix.repository.ServiceOrderRepository;
import com.motofix.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {
    private final ServiceOrderRepository serviceOrderRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final ServiceMaintenanceRepository serviceMaintenanceRepository;

    @Override
    public List<ReportResponse> ordersReport() {
        return serviceOrderRepository.findAll().stream()
                .collect(Collectors.groupingBy(order -> order.getStatus().name(), Collectors.counting()))
                .entrySet().stream()
                .map(entry -> new ReportResponse(entry.getKey(), entry.getValue(), BigDecimal.ZERO))
                .toList();
    }

    @Override
    public List<ReportResponse> paymentsReport() {
        BigDecimal total = paymentRepository.findAll().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return List.of(new ReportResponse("TOTAL_PAYMENTS", (long) paymentRepository.findAll().size(), total));
    }

    @Override
    public List<ReportResponse> inventoryReport() {
        return inventoryRepository.findAll().stream()
                .map(inventory -> new ReportResponse(
                        inventory.getSparePart().getName(),
                        inventory.getStock().longValue(),
                        inventory.getSparePart().getUnitPrice()
                ))
                .toList();
    }

    @Override
    public List<ReportResponse> performedServicesReport() {
        long performed = serviceOrderRepository.findAll().stream()
                .mapToLong(order -> order.getServices().size())
                .sum();
        BigDecimal total = serviceOrderRepository.findAll().stream()
                .map(ServiceOrder::calculateTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return List.of(
                new ReportResponse("REGISTERED_SERVICES", (long) serviceMaintenanceRepository.findAll().size(), BigDecimal.ZERO),
                new ReportResponse("PERFORMED_SERVICES", performed, total)
        );
    }
}
