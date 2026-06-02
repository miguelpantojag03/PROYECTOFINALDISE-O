package com.motofix.service;

import com.motofix.dto.ReportResponse;

import java.util.List;

public interface ReportService {
    List<ReportResponse> ordersReport();
    List<ReportResponse> paymentsReport();
    List<ReportResponse> inventoryReport();
    List<ReportResponse> performedServicesReport();
}
