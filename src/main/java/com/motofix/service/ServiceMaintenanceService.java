package com.motofix.service;

import com.motofix.dto.ServiceMaintenanceRequest;
import com.motofix.dto.ServiceMaintenanceResponse;

import java.util.List;

public interface ServiceMaintenanceService {
    ServiceMaintenanceResponse create(ServiceMaintenanceRequest request);
    List<ServiceMaintenanceResponse> findAll();
    ServiceMaintenanceResponse findById(Long id);
    ServiceMaintenanceResponse update(Long id, ServiceMaintenanceRequest request);
    void delete(Long id);
}
