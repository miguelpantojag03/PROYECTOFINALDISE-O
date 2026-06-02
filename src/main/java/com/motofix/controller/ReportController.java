package com.motofix.controller;

import com.motofix.dto.ReportResponse;
import com.motofix.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/orders")
    public List<ReportResponse> ordersReport() {
        return reportService.ordersReport();
    }

    @GetMapping("/payments")
    public List<ReportResponse> paymentsReport() {
        return reportService.paymentsReport();
    }

    @GetMapping("/inventory")
    public List<ReportResponse> inventoryReport() {
        return reportService.inventoryReport();
    }

    @GetMapping("/services")
    public List<ReportResponse> performedServicesReport() {
        return reportService.performedServicesReport();
    }
}
